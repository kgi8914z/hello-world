import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export interface Holding {
  ticker: string;
  shares: number;
  avg_price: number;
  total_cost: number;
  current_price?: number;
  current_value?: number;
  return_pct?: number;
  profit_loss?: number;
}

export interface PortfolioSummary {
  total_invested: number;
  total_current_value?: number;
  total_return_pct?: number;
  total_profit_loss?: number;
  num_holdings: number;
  holdings: Holding[];
}

export interface Transaction {
  id: number;
  ticker: string;
  transaction_type: "buy" | "sell";
  shares: number;
  price: number;
  total_value: number;
  timestamp: string;
}

export interface MarketQuote {
  ticker: string;
  price: number;
  change?: number;
  change_pct?: number;
}

export const getPortfolioSummary = () =>
  api.get<PortfolioSummary>("/portfolio/summary");

export const buyStock = (ticker: string, shares: number, price: number) =>
  api.post<Transaction>("/portfolio/buy", { ticker, shares, price });

export const sellStock = (ticker: string, shares: number, price: number) =>
  api.post<Transaction>("/portfolio/sell", { ticker, shares, price });

export const getTransactions = () =>
  api.get<Transaction[]>("/portfolio/transactions");

export const getQuote = (ticker: string) =>
  api.get<MarketQuote>(`/market/quote/${ticker}`);

export const getPortfolioQuotes = () => api.get("/market/quotes");

export const syncFromInvesting = () => api.post("/market/sync");

export default api;
