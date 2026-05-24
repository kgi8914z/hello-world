# Investment Portfolio Tracker

주식 및 투자 포트폴리오를 관리하고 추적하는 Python 프로젝트입니다.

## 기능

- 포트폴리오 자산 추가/삭제/조회
- 매수/매도 거래 기록
- 수익률 계산 (개별 종목 및 전체 포트폴리오)
- 자산 배분 현황 조회

## 프로젝트 구조

```
├── src/
│   ├── portfolio.py      # 포트폴리오 관리 핵심 모듈
│   ├── transaction.py    # 거래 기록 관리
│   └── analytics.py      # 수익률 분석
├── tests/
│   └── test_portfolio.py # 테스트
├── data/                 # 데이터 저장
├── requirements.txt
└── README.md
```

## 설치 및 실행

```bash
pip install -r requirements.txt
python -m src.portfolio
```

## 사용 예시

```python
from src.portfolio import Portfolio

portfolio = Portfolio()
portfolio.add_stock("AAPL", shares=10, price=150.0)
portfolio.add_stock("TSLA", shares=5, price=250.0)
print(portfolio.summary())
```
