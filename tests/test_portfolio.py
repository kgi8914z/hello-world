import pytest

from src.portfolio import Portfolio, Holding
from src.analytics import calculate_return, portfolio_returns, allocation


class TestHolding:
    def test_buy(self):
        h = Holding(ticker="AAPL")
        h.apply_buy(10, 150.0)
        assert h.shares == 10
        assert h.avg_price == 150.0

    def test_buy_multiple(self):
        h = Holding(ticker="AAPL")
        h.apply_buy(10, 100.0)
        h.apply_buy(10, 200.0)
        assert h.shares == 20
        assert h.avg_price == 150.0

    def test_sell(self):
        h = Holding(ticker="AAPL")
        h.apply_buy(10, 150.0)
        h.apply_sell(5)
        assert h.shares == 5

    def test_sell_too_many(self):
        h = Holding(ticker="AAPL")
        h.apply_buy(10, 150.0)
        with pytest.raises(ValueError):
            h.apply_sell(15)


class TestPortfolio:
    def test_add_stock(self):
        p = Portfolio()
        p.add_stock("AAPL", 10, 150.0)
        assert "AAPL" in p.holdings
        assert p.holdings["AAPL"].shares == 10

    def test_add_stock_uppercase(self):
        p = Portfolio()
        p.add_stock("aapl", 10, 150.0)
        assert "AAPL" in p.holdings

    def test_sell_stock(self):
        p = Portfolio()
        p.add_stock("AAPL", 10, 150.0)
        p.sell_stock("AAPL", 5, 160.0)
        assert p.holdings["AAPL"].shares == 5

    def test_sell_all_removes_holding(self):
        p = Portfolio()
        p.add_stock("AAPL", 10, 150.0)
        p.sell_stock("AAPL", 10, 160.0)
        assert "AAPL" not in p.holdings

    def test_sell_nonexistent(self):
        p = Portfolio()
        with pytest.raises(ValueError):
            p.sell_stock("AAPL", 5, 100.0)

    def test_total_invested(self):
        p = Portfolio()
        p.add_stock("AAPL", 10, 150.0)
        p.add_stock("TSLA", 5, 250.0)
        assert p.total_invested() == 2750.0

    def test_summary(self):
        p = Portfolio()
        p.add_stock("AAPL", 10, 150.0)
        s = p.summary()
        assert s["num_holdings"] == 1
        assert s["total_invested"] == 1500.0

    def test_transactions_recorded(self):
        p = Portfolio()
        p.add_stock("AAPL", 10, 150.0)
        p.sell_stock("AAPL", 5, 160.0)
        assert len(p.transactions) == 2


class TestAnalytics:
    def test_calculate_return(self):
        assert calculate_return(100.0, 120.0) == pytest.approx(20.0)

    def test_calculate_return_zero_cost(self):
        assert calculate_return(0, 100.0) == 0.0

    def test_portfolio_returns(self):
        p = Portfolio()
        p.add_stock("AAPL", 10, 100.0)
        result = portfolio_returns(p, {"AAPL": 120.0})
        assert result["total_return_pct"] == pytest.approx(20.0)
        assert result["total_profit_loss"] == pytest.approx(200.0)

    def test_allocation(self):
        p = Portfolio()
        p.add_stock("AAPL", 10, 100.0)
        p.add_stock("TSLA", 10, 100.0)
        alloc = allocation(p)
        assert len(alloc) == 2
        assert all(a["weight_pct"] == pytest.approx(50.0) for a in alloc)
