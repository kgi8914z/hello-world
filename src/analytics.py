from .portfolio import Portfolio


def calculate_return(cost: float, current_value: float) -> float:
    if cost == 0:
        return 0.0
    return ((current_value - cost) / cost) * 100


def portfolio_returns(portfolio: Portfolio, current_prices: dict[str, float]) -> dict:
    results = []
    total_cost = 0.0
    total_current = 0.0

    for ticker, holding in portfolio.holdings.items():
        if ticker not in current_prices:
            continue
        current_price = current_prices[ticker]
        current_value = holding.shares * current_price
        cost = holding.total_cost
        ret = calculate_return(cost, current_value)

        total_cost += cost
        total_current += current_value

        results.append({
            "ticker": ticker,
            "shares": holding.shares,
            "avg_price": holding.avg_price,
            "current_price": current_price,
            "cost": cost,
            "current_value": current_value,
            "return_pct": ret,
            "profit_loss": current_value - cost,
        })

    return {
        "holdings": results,
        "total_cost": total_cost,
        "total_current_value": total_current,
        "total_return_pct": calculate_return(total_cost, total_current),
        "total_profit_loss": total_current - total_cost,
    }


def allocation(portfolio: Portfolio) -> list[dict]:
    total = portfolio.total_invested()
    if total == 0:
        return []
    return [
        {
            "ticker": h.ticker,
            "cost": h.total_cost,
            "weight_pct": (h.total_cost / total) * 100,
        }
        for h in portfolio.holdings.values()
    ]
