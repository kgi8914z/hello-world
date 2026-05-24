import { useState } from "react";
import { syncFromInvesting } from "../api/client";

interface Props {
  onSync: () => void;
}

export default function SyncButton({ onSync }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");

  const handleSync = async () => {
    setSyncing(true);
    setMessage("");
    try {
      const { data } = await syncFromInvesting();
      setMessage(data.message);
      if (data.success) {
        onSync();
      }
    } catch {
      setMessage("동기화 실패. 서버 설정을 확인하세요.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="sync-container">
      <button className="btn-sync" onClick={handleSync} disabled={syncing}>
        {syncing ? "동기화 중..." : "Investing.com 동기화"}
      </button>
      {message && <span className="sync-message">{message}</span>}
    </div>
  );
}
