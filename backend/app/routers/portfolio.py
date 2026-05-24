from fastapi import APIRouter, HTTPException
from ..models.schemas import StockCreate, StockSell, TransactionResponse, PortfolioSummary
from ..services.portfolio_service import portfolio_service

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.get("/summary", response_model=PortfolioSummary)
async def get_summary():
    return portfolio_service.get_summary()


@router.post("/buy", response_model=TransactionResponse)
async def buy_stock(data: StockCreate):
    try:
        return portfolio_service.buy(data.ticker, data.shares, data.price)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/sell", response_model=TransactionResponse)
async def sell_stock(data: StockSell):
    try:
        return portfolio_service.sell(data.ticker, data.shares, data.price)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/transactions")
async def get_transactions():
    return portfolio_service.get_transactions()
