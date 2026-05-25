import { useEffect, useState, useCallback } from "react";
import {
  getPortfolioSummary,
  getPortfolioQuotes,
  type PortfolioSummary,
} from "../api/client";
import HoldingsTable from "./HoldingsTable";
import TradeForm from "./TradeForm";
import SyncButton from "./SyncButton";

export default function Dashboard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await getPortfolioSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch summary", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWithQuotes = useCallback(async () => {
    try {
      const { data } = await getPortfolioQuotes();
      if (data.summary) {
        setSummary(data.summary);
        setLastUpdate(new Date().toLocaleTimeString("ko-KR"));
      }
    } catch {
      await fetchSummary();
    }
  }, [fetchSummary]);

  useEffect(() => {
    fetchWithQuotes();
  }, [fetchWithQuotes]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchWithQuotes();
    setLoading(false);
  };

  if (loading && !summary) return <div className="loading">로딩 중...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>투자 포트폴리오</h1>
          {lastUpdate && (
            <span className="last-update">최종 업데이트: {lastUpdate}</span>
          )}
        </div>
        <div className="header-right">
          <button className="btn-refresh" onClick={handleRefresh} disabled={loading}>
            {loading ? "갱신 중..." : "시세 갱신"}
          </button>
          <SyncButton onSync={fetchWithQuotes} />
        </div>
      </header>

      {summary && (
        <div className="summary-cards">
          <div className="card">
            <span className="card-label">총 투자금</span>
            <span className="card-value">
              ${summary.total_invested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          {summary.total_current_value != null && (
            <div className="card">
              <span className="card-label">현재 평가액</span>
              <span className="card-value">
                ${summary.total_current_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {summary.total_profit_loss != null && (
            <div
              className={`card ${summary.total_profit_loss >= 0 ? "positive" : "negative"}`}
            >
              <span className="card-label">총 손익</span>
              <span className="card-value">
                {summary.total_profit_loss >= 0 ? "+" : ""}
                ${summary.total_profit_loss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {summary.total_return_pct != null && (
            <div
              className={`card ${summary.total_return_pct >= 0 ? "positive" : "negative"}`}
            >
              <span className="card-label">총 수익률</span>
              <span className="card-value">
                {summary.total_return_pct >= 0 ? "+" : ""}
                {summary.total_return_pct.toFixed(2)}%
              </span>
            </div>
          )}
          <div className="card">
            <span className="card-label">보유 종목</span>
            <span className="card-value">{summary.num_holdings}개</span>
          </div>
        </div>
      )}

      <div className="main-content">
        <section className="holdings-section">
          <h2>보유 종목</h2>
          <HoldingsTable holdings={summary?.holdings ?? []} />
        </section>
        <section className="trade-section">
          <h2>거래</h2>
          <TradeForm onTrade={fetchWithQuotes} />
        </section>
      </div>
    </div>
  );
}
