import logging
import random
from datetime import datetime

from .investing_com import InvestingComClient

logger = logging.getLogger(__name__)

REFERENCE_PRICES: dict[str, dict] = {
    "AAPL": {"price": 211.21, "name": "Apple Inc."},
    "TSLA": {"price": 347.60, "name": "Tesla Inc."},
    "NVDA": {"price": 135.40, "name": "NVIDIA Corp."},
    "MSFT": {"price": 454.27, "name": "Microsoft Corp."},
    "GOOG": {"price": 176.82, "name": "Alphabet Inc."},
    "AMZN": {"price": 207.30, "name": "Amazon.com Inc."},
    "META": {"price": 628.36, "name": "Meta Platforms Inc."},
    "NFLX": {"price": 1091.80, "name": "Netflix Inc."},
    "AMD": {"price": 138.01, "name": "AMD Inc."},
    "SPY": {"price": 596.54, "name": "SPDR S&P 500 ETF"},
    "QQQ": {"price": 525.98, "name": "Invesco QQQ Trust"},
    "VOO": {"price": 548.77, "name": "Vanguard S&P 500 ETF"},
}


class MarketDataService:
    """investing.com 우선, yfinance 폴백, 최후에 시뮬레이션 데이터"""

    def __init__(self, investing_client: InvestingComClient | None = None):
        self.investing = investing_client

    async def get_quote(self, ticker: str) -> dict | None:
        ticker = ticker.upper()

        if self.investing and self.investing.is_logged_in():
            try:
                quote = await self.investing.get_quote(ticker)
                if quote:
                    return quote
            except Exception as e:
                logger.warning(f"investing.com 실패 ({ticker}): {e}")

        yf_quote = self._yfinance_quote(ticker)
        if yf_quote:
            return yf_quote

        return self._simulated_quote(ticker)

    async def get_quotes(self, tickers: list[str]) -> dict[str, dict]:
        results = {}
        for t in tickers:
            quote = await self.get_quote(t)
            if quote:
                results[t.upper()] = quote
        return results

    def _yfinance_quote(self, ticker: str) -> dict | None:
        try:
            import yfinance as yf
            t = yf.Ticker(ticker)
            info = t.fast_info
            price = info.last_price
            prev_close = info.previous_close
            change = price - prev_close if prev_close else None
            change_pct = (change / prev_close * 100) if prev_close and change else None
            return {
                "ticker": ticker,
                "price": round(price, 2),
                "change": round(change, 2) if change else None,
                "change_pct": round(change_pct, 2) if change_pct else None,
                "timestamp": datetime.now().isoformat(),
                "source": "yahoo",
            }
        except Exception as e:
            logger.warning(f"yfinance 불가 ({ticker}): {e}")
            return None

    def _simulated_quote(self, ticker: str) -> dict | None:
        ref = REFERENCE_PRICES.get(ticker)
        if not ref:
            return None
        base = ref["price"]
        variance = base * random.uniform(-0.02, 0.02)
        price = round(base + variance, 2)
        change = round(variance, 2)
        change_pct = round((variance / base) * 100, 2)
        return {
            "ticker": ticker,
            "name": ref["name"],
            "price": price,
            "change": change,
            "change_pct": change_pct,
            "timestamp": datetime.now().isoformat(),
            "source": "simulated",
        }

    async def close(self):
        if self.investing:
            await self.investing.close()
