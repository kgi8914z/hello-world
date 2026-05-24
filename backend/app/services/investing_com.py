import httpx
from bs4 import BeautifulSoup
from datetime import datetime

BASE_URL = "https://www.investing.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
}


class InvestingComClient:
    def __init__(self, email: str | None = None, password: str | None = None):
        self.email = email
        self.password = password
        self._client: httpx.AsyncClient | None = None
        self._authenticated = False

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
        login_url = f"{BASE_URL}/members-admin/auth/sign-in"
        payload = {
            "email": self.email,
            "password": self.password,
        }
        try:
            resp = await client.post(login_url, json=payload)
            self._authenticated = resp.status_code == 200
            return self._authenticated
        except httpx.HTTPError:
            return False

    async def get_quote(self, ticker: str) -> dict | None:
        client = await self._get_client()
        search_url = f"{BASE_URL}/search/?q={ticker}"
        try:
            resp = await client.get(search_url)
            if resp.status_code != 200:
                return None
            soup = BeautifulSoup(resp.text, "html.parser")
            price_el = soup.select_one("[data-test='instrument-price-last']")
            change_el = soup.select_one("[data-test='instrument-price-change']")
            change_pct_el = soup.select_one("[data-test='instrument-price-change-percent']")

            if not price_el:
                return None

            price_text = price_el.get_text(strip=True).replace(",", "")
            return {
                "ticker": ticker.upper(),
                "price": float(price_text),
                "change": _parse_float(change_el),
                "change_pct": _parse_float(change_pct_el),
                "timestamp": datetime.now().isoformat(),
            }
        except (httpx.HTTPError, ValueError):
            return None

    async def get_portfolio_positions(self) -> list[dict]:
        if not self._authenticated:
            authenticated = await self.authenticate()
            if not authenticated:
                return []
        client = await self._get_client()
        portfolio_url = f"{BASE_URL}/portfolio/"
        try:
            resp = await client.get(portfolio_url)
            if resp.status_code != 200:
                return []
            soup = BeautifulSoup(resp.text, "html.parser")
            positions = []
            rows = soup.select("table.portfolio-table tbody tr")
            for row in rows:
                cols = row.select("td")
                if len(cols) < 5:
                    continue
                positions.append({
                    "ticker": cols[0].get_text(strip=True),
                    "shares": _parse_float_from_el(cols[2]),
                    "avg_price": _parse_float_from_el(cols[3]),
                    "current_price": _parse_float_from_el(cols[4]),
                })
            return positions
        except httpx.HTTPError:
            return []

    async def get_historical_data(
        self, ticker: str, start_date: str, end_date: str
    ) -> list[dict]:
        client = await self._get_client()
        url = f"{BASE_URL}/instruments/HistoricalDataAjax"
        payload = {
            "curr_id": ticker,
            "st_date": start_date,
            "end_date": end_date,
            "interval_sec": "Daily",
        }
        try:
            resp = await client.post(url, data=payload)
            if resp.status_code != 200:
                return []
            soup = BeautifulSoup(resp.text, "html.parser")
            rows = soup.select("table tbody tr")
            data = []
            for row in rows:
                cols = row.select("td")
                if len(cols) < 6:
                    continue
                data.append({
                    "date": cols[0].get_text(strip=True),
                    "close": _parse_float_from_el(cols[1]),
                    "open": _parse_float_from_el(cols[2]),
                    "high": _parse_float_from_el(cols[3]),
                    "low": _parse_float_from_el(cols[4]),
                    "volume": cols[5].get_text(strip=True),
                })
            return data
        except httpx.HTTPError:
            return []

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None


def _parse_float(el) -> float | None:
    if el is None:
        return None
    text = el.get_text(strip=True).replace(",", "").replace("%", "")
    try:
        return float(text)
    except ValueError:
        return None


def _parse_float_from_el(el) -> float | None:
    if el is None:
        return None
    return _parse_float(el)
