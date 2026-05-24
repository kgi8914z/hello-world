import { useState } from "react";
import { buyStock, sellStock } from "../api/client";

interface Props {
  onTrade: () => void;
}

export default function TradeForm({ onTrade }: Props) {
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (type: "buy" | "sell") => {
    setError("");
    const s = parseFloat(shares);
    const p = parseFloat(price);
    if (!ticker || isNaN(s) || isNaN(p) || s <= 0 || p <= 0) {
      setError("종목명, 수량, 가격을 올바르게 입력하세요.");
      return;
    }
    try {
      if (type === "buy") {
        await buyStock(ticker, s, p);
      } else {
        await sellStock(ticker, s, p);
      }
      setTicker("");
      setShares("");
      setPrice("");
      onTrade();
    } catch (err: any) {
      setError(err.response?.data?.detail || "거래 실패");
    }
  };

  return (
    <div className="trade-form">
      <input
        type="text"
        placeholder="종목 (e.g. AAPL)"
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
      />
      <input
        type="number"
        placeholder="수량"
        value={shares}
        onChange={(e) => setShares(e.target.value)}
        min="0"
        step="any"
      />
      <input
        type="number"
        placeholder="가격 ($)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        min="0"
        step="any"
      />
      {error && <p className="error">{error}</p>}
      <div className="trade-buttons">
        <button className="btn-buy" onClick={() => handleSubmit("buy")}>
          매수
        </button>
        <button className="btn-sell" onClick={() => handleSubmit("sell")}>
          매도
        </button>
      </div>
    </div>
  );
}
