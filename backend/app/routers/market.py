from fastapi import APIRouter, HTTPException
from ..models.schemas import MarketQuote, SyncStatus
from ..services.investing_com import InvestingComClient
from ..services.market_data import MarketDataService
from ..services.portfolio_service import portfolio_service
import os

router = APIRouter(prefix="/api/market", tags=["market"])


def _get_investing_client() -> InvestingComClient:
    return InvestingComClient(
        email=os.getenv("INVESTING_COM_EMAIL"),
        password=os.getenv("INVESTING_COM_PASSWORD"),
    )


def _get_market_service() -> MarketDataService:
    return MarketDataService(investing_client=_get_investing_client())


@router.get("/quote/{ticker}")
async def get_quote(ticker: str):
    service = _get_market_service()
    try:
        quote = await service.get_quote(ticker)
        if not quote:
            raise HTTPException(status_code=404, detail=f"{ticker} 시세를 찾을 수 없습니다")
        return quote
    finally:
        await service.close()


@router.get("/quotes")
async def get_portfolio_quotes():
    service = _get_market_service()
    try:
        tickers = list(portfolio_service.holdings.keys())
        if not tickers:
            return {"quotes": {}, "summary": portfolio_service.get_summary()}

        quotes = await service.get_quotes(tickers)
        current_prices = {t: q["price"] for t, q in quotes.items()}
        summary = portfolio_service.get_summary(current_prices if current_prices else None)
        return {"quotes": quotes, "summary": summary}
    finally:
        await service.close()


@router.post("/sync", response_model=SyncStatus)
async def sync_portfolio():
    client = _get_investing_client()
    try:
        positions = await client.get_portfolio_positions()
        if not positions:
            return SyncStatus(
                success=False,
                message="investing.com 포트폴리오를 가져올 수 없습니다. .env에 로그인 정보를 확인하세요.",
            )
        count = portfolio_service.sync_from_positions(positions)
        return SyncStatus(
            success=True,
            message=f"{count}개 종목이 동기화되었습니다.",
            synced_count=count,
        )
    finally:
        await client.close()


@router.get("/history/{ticker}")
async def get_history(ticker: str, period: str = "P1M"):
    client = _get_investing_client()
    try:
        data = await client.get_historical_data(ticker, "", "")
        if not data:
            raise HTTPException(status_code=404, detail="과거 데이터를 찾을 수 없습니다")
        return data
    finally:
        await client.close()


@router.get("/search/{query}")
async def search_ticker(query: str):
    client = _get_investing_client()
    try:
        results = await client.search(query)
        return results
    finally:
        await client.close()
