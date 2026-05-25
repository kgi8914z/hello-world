"""
investing.com Google OAuth 로그인 헬퍼

로컬 머신에서 실행하면 브라우저가 열립니다.
Google 계정으로 로그인하면 세션 쿠키가 자동으로 저장됩니다.

사용법:
    python login_helper.py
"""

import json
import sys
from pathlib import Path

COOKIE_FILE = Path(__file__).parent / "app" / ".cookies.json"


def main():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("playwright가 필요합니다. 설치 후 다시 실행하세요:")
        print("  pip install playwright && playwright install chromium")
        sys.exit(1)

    print("investing.com 로그인 페이지를 엽니다...")
    print("Google 계정으로 로그인하세요. 로그인 완료 후 자동으로 쿠키가 저장됩니다.\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            locale="ko-KR",
        )
        page = context.new_page()
        page.goto("https://www.investing.com/")

        print("브라우저에서 로그인을 완료해주세요...")
        print("1) 우측 상단 'Sign In' 클릭")
        print("2) 'Sign in with Google' 클릭")
        print("3) Google 계정 선택/로그인")
        print("\n로그인 완료 후 이 창에서 아무 키나 누르세요...")

        page.wait_for_timeout(5000)
        input("\n>>> 로그인을 완료했으면 Enter를 누르세요: ")

        cookies = context.cookies()
        investing_cookies = [c for c in cookies if "investing.com" in c.get("domain", "")]

        if not investing_cookies:
            print("investing.com 쿠키를 찾을 수 없습니다.")
            browser.close()
            sys.exit(1)

        COOKIE_FILE.parent.mkdir(parents=True, exist_ok=True)
        COOKIE_FILE.write_text(json.dumps(investing_cookies, indent=2, ensure_ascii=False))

        print(f"로그인 성공! 쿠키 {len(investing_cookies)}개 저장됨")
        print(f"저장 위치: {COOKIE_FILE}")
        print("\n이제 서버를 시작하면 investing.com 연동이 작동합니다.")

        browser.close()


if __name__ == "__main__":
    main()
