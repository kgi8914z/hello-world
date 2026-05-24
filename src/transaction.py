from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum


class TransactionType(Enum):
    BUY = "buy"
    SELL = "sell"


@dataclass
class Transaction:
    ticker: str
    transaction_type: TransactionType
    shares: float
    price: float
    timestamp: datetime = field(default_factory=datetime.now)

    @property
    def total_value(self) -> float:
        return self.shares * self.price

    def to_dict(self) -> dict:
        return {
            "ticker": self.ticker,
            "type": self.transaction_type.value,
            "shares": self.shares,
            "price": self.price,
            "total_value": self.total_value,
            "timestamp": self.timestamp.isoformat(),
        }
