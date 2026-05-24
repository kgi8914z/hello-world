from fastapi import APIRouter, HTTPException
from ..models.schemas import MarketQuote, SyncStatus
from ..services.investing_com import InvestingComClient
from ..services.portfolio_service import portfolio_service
import os

router = APIRouter(prefix="/api/market", tags=["market"])


def _get_client() -> InvestingComClient:
    return InvestingComClient(
        email=os.getenv("INVESTING_COM_EMAIL"),
        password=os.getenv("INVESTING_COM_PASSWORD"),
    )


@router.get("/quote/{ticker}", response_model=MarketQuote | None)
async def get_quote(ticker: str):
    client = _get_client()
    try:
        quote = await client.get_quote(ticker)
        if not quote:
            raise HTTPException(status_code=404, detail=f"{ticker} 시세를 찾을 수 없습니다")
        return MarketQuote(**quote)
    finally:
        await client.close()


@router.get("/quotes")
async def get_portfolio_quotes():
    client = _get_client()
    try:
        quotes = {}
        for ticker in portfolio_service.holdings:
            quote = await client.get_quote(ticker)
            if quote:
                quotes[ticker] = quote
        summary = portfolio_service.get_summary(
            {t: q["price"] for t, q in quotes.items()}
        )
        return {"quotes": quotes, "summary": summary}
    finally:
        await client.close()


@router.post("/sync", response_model=SyncStatus)
async def sync_portfolio():
    client = _get_client()
    try:
        positions = await client.get_portfolio_positions()
        if not positions:
            return SyncStatus(
                success=False,
                message="investing.com 포트폴리오를 가져올 수 없습니다. 로그인 정보를 확인하세요.",
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
async def get_history(ticker: str, start_date: str, end_date: str):
    client = _get_client()
    try:
        data = await client.get_historical_data(ticker, start_date, end_date)
        if not data:
            raise HTTPException(status_code=404, detail="과거 데이터를 찾을 수 없습니다")
        return data
    finally:
        await client.close()
