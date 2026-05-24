from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class TransactionType(str, Enum):
    BUY = "buy"
    SELL = "sell"


class StockCreate(BaseModel):
    ticker: str
    shares: float
    price: float


class StockSell(BaseModel):
    ticker: str
    shares: float
    price: float


class TransactionResponse(BaseModel):
    id: int | None = None
    ticker: str
    transaction_type: TransactionType
    shares: float
    price: float
    total_value: float
    timestamp: datetime


class HoldingResponse(BaseModel):
    ticker: str
    shares: float
    avg_price: float
    total_cost: float
    current_price: float | None = None
    current_value: float | None = None
    return_pct: float | None = None
    profit_loss: float | None = None


class PortfolioSummary(BaseModel):
    total_invested: float
    total_current_value: float | None = None
    total_return_pct: float | None = None
    total_profit_loss: float | None = None
    num_holdings: int
    holdings: list[HoldingResponse]


class MarketQuote(BaseModel):
    ticker: str
    name: str | None = None
    price: float
    change: float | None = None
    change_pct: float | None = None
    high: float | None = None
    low: float | None = None
    volume: int | None = None
    timestamp: datetime | None = None


class SyncStatus(BaseModel):
    success: bool
    message: str
    synced_count: int = 0
