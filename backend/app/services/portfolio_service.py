from datetime import datetime
from ..models.schemas import (
    TransactionType,
    HoldingResponse,
    PortfolioSummary,
    TransactionResponse,
)


class Holding:
    def __init__(self, ticker: str):
        self.ticker = ticker
        self.shares: float = 0.0
        self.avg_price: float = 0.0

    @property
    def total_cost(self) -> float:
        return self.shares * self.avg_price

    def apply_buy(self, shares: float, price: float):
        total_shares = self.shares + shares
        if total_shares > 0:
            self.avg_price = (self.total_cost + shares * price) / total_shares
        self.shares = total_shares

    def apply_sell(self, shares: float):
        if shares > self.shares:
            raise ValueError(
                f"보유 수량({self.shares})보다 많은 수량({shares})을 매도할 수 없습니다"
            )
        self.shares -= shares


class PortfolioService:
    def __init__(self):
        self.holdings: dict[str, Holding] = {}
        self.transactions: list[dict] = []
        self._tx_counter = 0

    def buy(self, ticker: str, shares: float, price: float) -> TransactionResponse:
        ticker = ticker.upper()
        if ticker not in self.holdings:
            self.holdings[ticker] = Holding(ticker)
        self.holdings[ticker].apply_buy(shares, price)
        self._tx_counter += 1
        tx = TransactionResponse(
            id=self._tx_counter,
            ticker=ticker,
            transaction_type=TransactionType.BUY,
            shares=shares,
            price=price,
            total_value=shares * price,
            timestamp=datetime.now(),
        )
        self.transactions.append(tx.model_dump())
        return tx

    def sell(self, ticker: str, shares: float, price: float) -> TransactionResponse:
        ticker = ticker.upper()
        if ticker not in self.holdings:
            raise ValueError(f"{ticker}은(는) 포트폴리오에 없습니다")
        self.holdings[ticker].apply_sell(shares)
        if self.holdings[ticker].shares == 0:
            del self.holdings[ticker]
        self._tx_counter += 1
        tx = TransactionResponse(
            id=self._tx_counter,
            ticker=ticker,
            transaction_type=TransactionType.SELL,
            shares=shares,
            price=price,
            total_value=shares * price,
            timestamp=datetime.now(),
        )
        self.transactions.append(tx.model_dump())
        return tx

    def get_summary(self, current_prices: dict[str, float] | None = None) -> PortfolioSummary:
        holdings_list = []
        total_invested = 0.0
        total_current = 0.0
        has_prices = current_prices is not None

        for ticker, h in self.holdings.items():
            cost = h.total_cost
            total_invested += cost
            holding_resp = HoldingResponse(
                ticker=h.ticker,
                shares=h.shares,
                avg_price=h.avg_price,
                total_cost=cost,
            )
            if has_prices and ticker in current_prices:
                cp = current_prices[ticker]
                cv = h.shares * cp
                total_current += cv
                holding_resp.current_price = cp
                holding_resp.current_value = cv
                holding_resp.return_pct = ((cv - cost) / cost * 100) if cost > 0 else 0
                holding_resp.profit_loss = cv - cost

            holdings_list.append(holding_resp)

        summary = PortfolioSummary(
            total_invested=total_invested,
            num_holdings=len(self.holdings),
            holdings=holdings_list,
        )
        if has_prices and total_invested > 0:
            summary.total_current_value = total_current
            summary.total_return_pct = ((total_current - total_invested) / total_invested) * 100
            summary.total_profit_loss = total_current - total_invested

        return summary

    def get_transactions(self) -> list[dict]:
        return self.transactions

    def sync_from_positions(self, positions: list[dict]) -> int:
        count = 0
        for pos in positions:
            ticker = pos.get("ticker", "").upper()
            shares = pos.get("shares")
            avg_price = pos.get("avg_price")
            if ticker and shares and avg_price:
                if ticker not in self.holdings:
                    self.holdings[ticker] = Holding(ticker)
                self.holdings[ticker].shares = float(shares)
                self.holdings[ticker].avg_price = float(avg_price)
                count += 1
        return count


portfolio_service = PortfolioService()
