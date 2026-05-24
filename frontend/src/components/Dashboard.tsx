import { useEffect, useState } from "react";
import { getPortfolioSummary, type PortfolioSummary } from "../api/client";
import HoldingsTable from "./HoldingsTable";
import TradeForm from "./TradeForm";
import SyncButton from "./SyncButton";

export default function Dashboard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const { data } = await getPortfolioSummary();
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch summary", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return <div className="loading">로딩 중...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>투자 포트폴리오</h1>
        <SyncButton onSync={fetchSummary} />
      </header>

      {summary && (
        <div className="summary-cards">
          <div className="card">
            <span className="card-label">총 투자금</span>
            <span className="card-value">
              ${summary.total_invested.toLocaleString()}
            </span>
          </div>
          {summary.total_current_value != null && (
            <div className="card">
              <span className="card-label">현재 평가액</span>
              <span className="card-value">
                ${summary.total_current_value.toLocaleString()}
              </span>
            </div>
          )}
          {summary.total_return_pct != null && (
            <div className={`card ${summary.total_return_pct >= 0 ? "positive" : "negative"}`}>
              <span className="card-label">총 수익률</span>
              <span className="card-value">
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
          <TradeForm onTrade={fetchSummary} />
        </section>
      </div>
    </div>
  );
}
