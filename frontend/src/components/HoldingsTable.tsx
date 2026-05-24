import { type Holding } from "../api/client";

interface Props {
  holdings: Holding[];
}

export default function HoldingsTable({ holdings }: Props) {
  if (holdings.length === 0) {
    return <p className="empty">보유 종목이 없습니다. 종목을 추가해보세요.</p>;
  }

  return (
    <table className="holdings-table">
      <thead>
        <tr>
          <th>종목</th>
          <th>수량</th>
          <th>평균단가</th>
          <th>투자금</th>
          <th>현재가</th>
          <th>평가액</th>
          <th>수익률</th>
          <th>손익</th>
        </tr>
      </thead>
      <tbody>
        {holdings.map((h) => (
          <tr key={h.ticker}>
            <td className="ticker">{h.ticker}</td>
            <td>{h.shares}</td>
            <td>${h.avg_price.toFixed(2)}</td>
            <td>${h.total_cost.toLocaleString()}</td>
            <td>{h.current_price ? `$${h.current_price.toFixed(2)}` : "-"}</td>
            <td>
              {h.current_value ? `$${h.current_value.toLocaleString()}` : "-"}
            </td>
            <td className={returnClass(h.return_pct)}>
              {h.return_pct != null ? `${h.return_pct.toFixed(2)}%` : "-"}
            </td>
            <td className={returnClass(h.profit_loss)}>
              {h.profit_loss != null
                ? `$${h.profit_loss.toLocaleString()}`
                : "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function returnClass(val?: number | null): string {
  if (val == null) return "";
  return val >= 0 ? "positive" : "negative";
}
