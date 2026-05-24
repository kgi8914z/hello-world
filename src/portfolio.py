from dataclasses import dataclass, field

from .transaction import Transaction, TransactionType


@dataclass
class Holding:
    ticker: str
    shares: float = 0.0
    avg_price: float = 0.0

    @property
    def total_cost(self) -> float:
        return self.shares * self.avg_price

    def apply_buy(self, shares: float, price: float):
        total_shares = self.shares + shares
        if total_shares > 0:
            self.avg_price = (self.total_cost + shares * price) / total_shares
        self.shares = total_shares

    def apply_sell(self, shares: float) -> float:
        if shares > self.shares:
            raise ValueError(
                f"보유 수량({self.shares})보다 많은 수량({shares})을 매도할 수 없습니다"
            )
        self.shares -= shares


class Portfolio:
    def __init__(self, name: str = "My Portfolio"):
        self.name = name
        self.holdings: dict[str, Holding] = {}
        self.transactions: list[Transaction] = []

    def add_stock(self, ticker: str, shares: float, price: float) -> Transaction:
        ticker = ticker.upper()
        tx = Transaction(
            ticker=ticker,
            transaction_type=TransactionType.BUY,
            shares=shares,
            price=price,
        )
        if ticker not in self.holdings:
            self.holdings[ticker] = Holding(ticker=ticker)
        self.holdings[ticker].apply_buy(shares, price)
        self.transactions.append(tx)
        return tx

    def sell_stock(self, ticker: str, shares: float, price: float) -> Transaction:
        ticker = ticker.upper()
        if ticker not in self.holdings:
            raise ValueError(f"{ticker}은(는) 포트폴리오에 없습니다")
        tx = Transaction(
            ticker=ticker,
            transaction_type=TransactionType.SELL,
            shares=shares,
            price=price,
        )
        self.holdings[ticker].apply_sell(shares)
        if self.holdings[ticker].shares == 0:
            del self.holdings[ticker]
        self.transactions.append(tx)
        return tx

    def get_holding(self, ticker: str) -> Holding | None:
        return self.holdings.get(ticker.upper())

    def total_invested(self) -> float:
        return sum(h.total_cost for h in self.holdings.values())

    def summary(self) -> dict:
        holdings_list = []
        for h in self.holdings.values():
            holdings_list.append({
                "ticker": h.ticker,
                "shares": h.shares,
                "avg_price": h.avg_price,
                "total_cost": h.total_cost,
            })
        return {
            "name": self.name,
            "total_invested": self.total_invested(),
            "num_holdings": len(self.holdings),
            "holdings": holdings_list,
        }


if __name__ == "__main__":
    portfolio = Portfolio()
    portfolio.add_stock("AAPL", shares=10, price=150.0)
    portfolio.add_stock("TSLA", shares=5, price=250.0)
    portfolio.add_stock("AAPL", shares=5, price=160.0)

    summary = portfolio.summary()
    print(f"포트폴리오: {summary['name']}")
    print(f"총 투자금: ${summary['total_invested']:,.2f}")
    print(f"보유 종목 수: {summary['num_holdings']}")
    print()
    for h in summary["holdings"]:
        print(f"  {h['ticker']}: {h['shares']}주 @ ${h['avg_price']:.2f} = ${h['total_cost']:,.2f}")
