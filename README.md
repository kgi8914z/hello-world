# Investment Portfolio Tracker

주식 및 투자 포트폴리오를 웹에서 관리하고 추적하는 풀스택 프로젝트입니다.
investing.com Pro 계정과 연동하여 시세 조회 및 포트폴리오 동기화를 지원합니다.

## 기술 스택

- **Backend**: FastAPI (Python)
- **Frontend**: React + TypeScript (Vite)
- **데이터 연동**: investing.com Pro

## 기능

- 포트폴리오 자산 매수/매도 관리
- 실시간 시세 조회 (investing.com)
- investing.com 포트폴리오 동기화
- 수익률 및 손익 계산
- 자산 배분 현황 대시보드

## 프로젝트 구조

```
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI 앱 진입점
│   │   ├── routers/
│   │   │   ├── portfolio.py     # 포트폴리오 API
│   │   │   └── market.py        # 시세/동기화 API
│   │   ├── services/
│   │   │   ├── portfolio_service.py  # 포트폴리오 로직
│   │   │   └── investing_com.py      # investing.com 연동
│   │   └── models/
│   │       └── schemas.py       # Pydantic 스키마
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── HoldingsTable.tsx
│   │   │   ├── TradeForm.tsx
│   │   │   └── SyncButton.tsx
│   │   ├── api/client.ts
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## 시작하기

### 1. Backend

```bash
cd backend
cp .env.example .env  # investing.com 로그인 정보 입력
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. 환경변수 설정

`.env` 파일에 investing.com Pro 계정 정보를 설정합니다:

```
INVESTING_COM_EMAIL=your-email@example.com
INVESTING_COM_PASSWORD=your-password
```

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/portfolio/summary` | 포트폴리오 요약 |
| POST | `/api/portfolio/buy` | 매수 |
| POST | `/api/portfolio/sell` | 매도 |
| GET | `/api/portfolio/transactions` | 거래 내역 |
| GET | `/api/market/quote/{ticker}` | 종목 시세 조회 |
| GET | `/api/market/quotes` | 보유종목 전체 시세 |
| POST | `/api/market/sync` | investing.com 동기화 |
| GET | `/api/market/history/{ticker}` | 과거 시세 데이터 |
