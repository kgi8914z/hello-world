import httpx
from bs4 import BeautifulSoup
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

BASE_URL = "https://www.investing.com"
API_URL = "https://api.investing.com/api"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "Origin": BASE_URL,
    "Referer": f"{BASE_URL}/",
    "Domain-Id": "www",
}

TICKER_TO_SLUG = {
    "AAPL": "apple-computer-inc",
    "TSLA": "tesla-motors",
    "NVDA": "nvidia-corp",
    "MSFT": "microsoft-corp",
    "GOOG": "alphabet-inc-class-c",
    "GOOGL": "alphabet-inc",
    "AMZN": "amazon-com-inc",
    "META": "facebook-inc",
    "NFLX": "netflix-inc",
    "AMD": "advanced-micro-devices",
    "INTC": "intel-corp",
    "SPY": "spdr-s-p-500",
    "QQQ": "invesco-qqq-trust",
    "VOO": "vanguard-s-p-500",
}


class InvestingComClient:
    def __init__(self, email: str | None = None, password: str | None = None):
        self.email = email
        self.password = password
        self._client: httpx.AsyncClient | None = None
        self._authenticated = False
        self._pair_ids: dict[str, int] = {}

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                headers=HEADERS,
                follow_redirects=True,
                timeout=30.0,
            )
        return self._client

    async def authenticate(self) -> bool:
        if not self.email or not self.password:
            return False
        client = await self._get_client()
        try:
            resp = await client.post(
                f"{BASE_URL}/members-admin/auth/sign-in",
                json={"email": self.email, "password": self.password},
            )
            self._authenticated = resp.status_code == 200
            if self._authenticated:
                logger.info("investing.com 로그인 성공")
            return self._authenticated
        except httpx.HTTPError as e:
            logger.error(f"investing.com 로그인 실패: {e}")
            return False

    async def search(self, query: str) -> list[dict]:
        client = await self._get_client()
        try:
            resp = await client.get(
                f"{API_URL}/search/v2/search",
                params={"q": query},
            )
            if resp.status_code != 200:
                return []
            data = resp.json()
            results = []
            for article in data.get("quotes", data.get("articles", [])):
                results.append({
                    "pair_id": article.get("pairId"),
                    "name": article.get("name"),
                    "symbol": article.get("symbol"),
                    "exchange": article.get("exchange"),
                    "flag": article.get("flag"),
                    "pair_type": article.get("pairType"),
                })
            return results
        except (httpx.HTTPError, ValueError) as e:
            logger.error(f"검색 실패 ({query}): {e}")
            return []

    async def get_quote(self, ticker: str) -> dict | None:
        client = await self._get_client()

        slug = TICKER_TO_SLUG.get(ticker.upper())
        if slug:
            return await self._get_quote_from_page(client, ticker, slug)

        results = await self.search(ticker)
        if results:
            pair_id = results[0].get("pair_id")
            if pair_id:
                self._pair_ids[ticker.upper()] = pair_id
                return await self._get_quote_from_api(client, ticker, pair_id)
        return None

    async def _get_quote_from_page(
        self, client: httpx.AsyncClient, ticker: str, slug: str
    ) -> dict | None:
        try:
            resp = await client.get(f"{BASE_URL}/equities/{slug}")
            if resp.status_code != 200:
                return None
            soup = BeautifulSoup(resp.text, "html.parser")

            price = self._extract_price(soup)
            if price is None:
                return None

            change_el = soup.select_one(
                "[data-test='instrument-price-change'],"
                "[class*='instrument-price_change']"
            )
            change_pct_el = soup.select_one(
                "[data-test='instrument-price-change-percent'],"
                "[class*='instrument-price_change-percent']"
            )

            return {
                "ticker": ticker.upper(),
                "price": price,
                "change": _parse_float(change_el),
                "change_pct": _parse_pct(change_pct_el),
                "timestamp": datetime.now().isoformat(),
                "source": "investing.com",
            }
        except (httpx.HTTPError, ValueError) as e:
            logger.error(f"시세 조회 실패 ({ticker}): {e}")
            return None

    async def _get_quote_from_api(
        self, client: httpx.AsyncClient, ticker: str, pair_id: int
    ) -> dict | None:
        try:
            resp = await client.get(
                f"{API_URL}/financialdata/{pair_id}/real-time",
            )
            if resp.status_code != 200:
                return None
            data = resp.json()
            return {
                "ticker": ticker.upper(),
                "price": data.get("last", 0),
                "change": data.get("change"),
                "change_pct": data.get("changePercent"),
                "high": data.get("high"),
                "low": data.get("low"),
                "volume": data.get("volume"),
                "timestamp": datetime.now().isoformat(),
                "source": "investing.com",
            }
        except (httpx.HTTPError, ValueError) as e:
            logger.error(f"API 시세 조회 실패 ({ticker}): {e}")
            return None

    def _extract_price(self, soup: BeautifulSoup) -> float | None:
        selectors = [
            "[data-test='instrument-price-last']",
            "[class*='instrument-price_last']",
            "span.text-5xl",
        ]
        for sel in selectors:
            el = soup.select_one(sel)
            if el:
                return _parse_float(el)
        return None

    async def get_portfolio_positions(self) -> list[dict]:
        if not self._authenticated:
            if not await self.authenticate():
                return []
        client = await self._get_client()
        try:
            resp = await client.get(f"{BASE_URL}/portfolio/")
            if resp.status_code != 200:
                return []
            soup = BeautifulSoup(resp.text, "html.parser")
            positions = []
            rows = soup.select(
                "table.portfolio-table tbody tr, "
                "[class*='portfolio'] table tbody tr, "
                "[data-test='portfolio-table'] tbody tr"
            )
            for row in rows:
                cols = row.select("td")
                if len(cols) < 4:
                    continue
                ticker_text = cols[0].get_text(strip=True)
                positions.append({
                    "ticker": ticker_text,
                    "shares": _parse_float(cols[2]) or 0,
                    "avg_price": _parse_float(cols[3]) or 0,
                    "current_price": _parse_float(cols[4]) if len(cols) > 4 else None,
                })
            return positions
        except httpx.HTTPError as e:
            logger.error(f"포트폴리오 조회 실패: {e}")
            return []

    async def get_historical_data(
        self, ticker: str, start_date: str, end_date: str
    ) -> list[dict]:
        client = await self._get_client()
        pair_id = self._pair_ids.get(ticker.upper())
        if not pair_id:
            results = await self.search(ticker)
            if results:
                pair_id = results[0].get("pair_id")
        if not pair_id:
            return []
        try:
            resp = await client.get(
                f"{API_URL}/financialdata/{pair_id}/historical/chart/",
                params={
                    "period": "P1M",
                    "interval": "P1D",
                    "pointscount": 120,
                },
            )
            if resp.status_code != 200:
                return []
            data = resp.json()
            return data.get("data", [])
        except (httpx.HTTPError, ValueError) as e:
            logger.error(f"과거 데이터 조회 실패 ({ticker}): {e}")
            return []

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None


def _parse_float(el) -> float | None:
    if el is None:
        return None
    text = el.get_text(strip=True) if hasattr(el, "get_text") else str(el)
    text = text.replace(",", "").replace("+", "")
    try:
        return float(text)
    except ValueError:
        return None


def _parse_pct(el) -> float | None:
    if el is None:
        return None
    text = el.get_text(strip=True) if hasattr(el, "get_text") else str(el)
    text = text.replace(",", "").replace("%", "").replace("(", "").replace(")", "").replace("+", "")
    try:
        return float(text)
    except ValueError:
        return None
