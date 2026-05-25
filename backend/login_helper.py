"""
investing.com 로그인 헬퍼

본인의 Chrome 브라우저를 열어서 로그인합니다.
일반 Chrome이라 Google 보안 차단이 발생하지 않습니다.

사용법:
    python login_helper.py
"""

import json
import subprocess
import sys
import time
import shutil
import sqlite3
from pathlib import Path
import http.cookiejar
import tempfile
import os

COOKIE_FILE = Path(__file__).parent / "app" / ".cookies.json"

CHROME_PATHS = [
    Path(os.environ.get("LOCALAPPDATA", "")) / "Google/Chrome/Application/chrome.exe",
    Path(os.environ.get("PROGRAMFILES", "")) / "Google/Chrome/Application/chrome.exe",
    Path(os.environ.get("PROGRAMFILES(X86)", "")) / "Google/Chrome/Application/chrome.exe",
]

CHROME_COOKIE_DB = (
    Path(os.environ.get("LOCALAPPDATA", "")) / "Google/Chrome/User Data/Default/Cookies"
)


def find_chrome() -> Path | None:
    for p in CHROME_PATHS:
        if p.exists():
            return p
    return None


def extract_chrome_cookies() -> list[dict]:
    if not CHROME_COOKIE_DB.exists():
        alt = CHROME_COOKIE_DB.parent.parent / "Profile 1/Cookies"
        if alt.exists():
            db_path = alt
        else:
            return []
    else:
        db_path = CHROME_COOKIE_DB

    tmp = Path(tempfile.mktemp(suffix=".db"))
    shutil.copy2(db_path, tmp)

    cookies = []
    try:
        conn = sqlite3.connect(str(tmp))
        cursor = conn.cursor()
        cursor.execute(
            "SELECT name, value, host_key, path, expires_utc "
            "FROM cookies WHERE host_key LIKE '%investing.com%'"
        )
        for name, value, domain, path, expires in cursor.fetchall():
            if value:
                cookies.append({
                    "name": name,
                    "value": value,
                    "domain": domain,
                    "path": path,
                })
        conn.close()
    except Exception as e:
        print(f"쿠키 읽기 오류: {e}")
    finally:
        tmp.unlink(missing_ok=True)

    return cookies


def main():
    chrome = find_chrome()
    if not chrome:
        print("Chrome을 찾을 수 없습니다.")
        print("Chrome이 설치되어 있는지 확인하세요.")
        sys.exit(1)

    print("=" * 50)
    print("  investing.com 로그인 헬퍼")
    print("=" * 50)
    print()
    print("Chrome에서 investing.com을 엽니다.")
    print("로그인을 완료한 후 이 창으로 돌아오세요.")
    print()

    subprocess.Popen([str(chrome), "https://www.investing.com/"])

    print(">>> investing.com에서 Sign In → Sign in with Google로 로그인하세요.")
    print()
    input(">>> 로그인을 완료했으면 Enter를 누르세요: ")

    print()
    print("Chrome 쿠키를 읽는 중...")
    print("(Chrome이 열려있으면 쿠키를 못 읽을 수 있습니다.)")
    print()

    cookies = extract_chrome_cookies()

    if not cookies:
        print("Chrome에서 investing.com 쿠키를 찾을 수 없습니다.")
        print()
        print("대안: 직접 쿠키를 입력하세요.")
        print("1) Chrome에서 investing.com 접속 (로그인 상태)")
        print("2) F12 → Application 탭 → Cookies → investing.com")
        print("3) 쿠키 값들을 복사")
        print()
        cookie_str = input("쿠키를 붙여넣으세요 (name=value; name=value; ...): ").strip()
        if cookie_str:
            cookies = []
            for pair in cookie_str.split(";"):
                parts = pair.strip().split("=", 1)
                if len(parts) == 2:
                    cookies.append({
                        "name": parts[0].strip(),
                        "value": parts[1].strip(),
                        "domain": ".investing.com",
                    })

    if not cookies:
        print("쿠키가 없습니다. 다시 시도해주세요.")
        sys.exit(1)

    COOKIE_FILE.parent.mkdir(parents=True, exist_ok=True)
    COOKIE_FILE.write_text(json.dumps(cookies, indent=2, ensure_ascii=False))

    print(f"쿠키 {len(cookies)}개 저장 완료!")
    print(f"저장 위치: {COOKIE_FILE}")
    print()
    print("이제 서버를 실행하세요:")
    print("  uvicorn app.main:app --reload")


if __name__ == "__main__":
    main()
