from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .routers import portfolio, market

load_dotenv()

app = FastAPI(
    title="Investment Portfolio Tracker",
    description="주식 투자 포트폴리오 관리 API (investing.com Pro 연동)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(portfolio.router)
app.include_router(market.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
