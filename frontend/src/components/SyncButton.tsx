import { useState, useEffect } from "react";
import { syncFromInvesting } from "../api/client";
import api from "../api/client";

interface Props {
  onSync: () => void;
}

export default function SyncButton({ onSync }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [showCookieInput, setShowCookieInput] = useState(false);
  const [cookieText, setCookieText] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data } = await api.get("/market/auth/status");
      setLoggedIn(data.logged_in);
    } catch {
      setLoggedIn(false);
    }
  };

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
      setMessage("동기화 실패. 로그인 상태를 확인하세요.");
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveCookies = async () => {
    try {
      const cookies: Record<string, string> = {};
      cookieText.split(";").forEach((pair) => {
        const [key, ...vals] = pair.split("=");
        if (key?.trim() && vals.length > 0) {
          cookies[key.trim()] = vals.join("=").trim();
        }
      });
      if (Object.keys(cookies).length === 0) {
        setMessage("쿠키 형식이 올바르지 않습니다.");
        return;
      }
      await api.post("/market/auth/cookies", { cookies });
      setMessage("쿠키 저장 완료!");
      setShowCookieInput(false);
      setCookieText("");
      await checkAuth();
    } catch {
      setMessage("쿠키 저장 실패");
    }
  };

  return (
    <div className="sync-container">
      <div className="sync-buttons">
        <span className={`auth-status ${loggedIn ? "online" : "offline"}`}>
          {loggedIn === null ? "..." : loggedIn ? "Investing.com 연결됨" : "로그인 필요"}
        </span>
        {loggedIn && (
          <button className="btn-sync" onClick={handleSync} disabled={syncing}>
            {syncing ? "동기화 중..." : "포트폴리오 동기화"}
          </button>
        )}
        {!loggedIn && loggedIn !== null && (
          <button
            className="btn-sync btn-cookie"
            onClick={() => setShowCookieInput(!showCookieInput)}
          >
            쿠키 입력
          </button>
        )}
      </div>
      {showCookieInput && (
        <div className="cookie-input-panel">
          <p className="cookie-help">
            investing.com에 로그인 후 개발자도구(F12) → Application → Cookies에서
            쿠키를 복사하세요.
          </p>
          <textarea
            className="cookie-textarea"
            placeholder="name1=value1; name2=value2; ..."
            value={cookieText}
            onChange={(e) => setCookieText(e.target.value)}
            rows={3}
          />
          <button className="btn-sync" onClick={handleSaveCookies}>
            저장
          </button>
        </div>
      )}
      {message && <span className="sync-message">{message}</span>}
    </div>
  );
}
