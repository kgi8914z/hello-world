# 칩렛(Chiplet) 기술 개요 — 발표자료

CASSP/DGIST 강의 템플릿 위에 만든 20분 발표자료입니다.

| 파일 | 내용 |
|---|---|
| `chiplet-overview.pptx` | 발표용 슬라이드 12장 (16:9, 영문, 전 장 발표자 노트·출처 포함) |
| `chiplet-speaker-script.docx` | 슬라이드별 한국어 발표 대본 18쪽 (배경지식·대본·수식 유도·주의점·예상 질문) |
| `build/build.py` | 슬라이드 생성 스크립트 (python-pptx) |
| `build/script.js` | 대본 생성 스크립트 (docx-js) |

## 설정

- 원본 자료: 없음 — 공개 표준 문서(UCIe 1.1/2.0)와 벤더 공식 발표 자료를 근거로 재구성
- 발표 시간 / 분량: 20분 / 12장
- 언어: 슬라이드 영어, 발표 대본 한국어
- 서식: `ffe_vs_ctle_lecture4.pptx`를 템플릿으로 사용 (제목 밑 파란 바·DGIST 로고·CASSP 푸터·페이지 번호는 레이아웃에서 자동 상속)
- 색: 흑백 + 템플릿 네이비 `#00418E` 단일 강조색. 파란색은 "이해에 필요한 곳"에만 쓰고 의미를 고정했다
  (4장 = 최신 노드를 쓴 다이, 8장 = 실제로 D2D 신호를 나르는 층, 표 = 임계값 초과 셀).

## 슬라이드 구성

문제 → 배경 → 핵심 아이디어 → 분할 기준 → 이득 → 대가 → 방법(패키징·인터페이스) → 근거 → 한계 → 정리

| # | 제목 | 시간 | 성격 |
|---|---|---|---|
| 1 | Chiplets: Disaggregating the SoC | 0:30 | 표지 |
| 2 | The Problem: A Single Die Can No Longer Grow | 1:20 | 레티클 한계 도식 |
| 3 | Background: Yield Collapses with Die Area | 2:20 | Murphy 수식 + 수율 곡선 |
| 4 | Key Idea: Cut the SoC, Re-Integrate in the Package | 1:40 | 모놀리식 vs 분할 개념도 |
| 5 | Where to Cut: Bandwidth × Energy Sets the Boundary | 2:40 | P = BW × E_bit + 전력 표 (핵심) |
| 6 | What Disaggregation Buys | 1:15 | 이득 표 |
| 7 | What It Costs | 1:50 | 대가 4항목 |
| 8 | Packaging: Bump Pitch Sets the Bandwidth Ceiling | 2:20 | 단면도 4종 |
| 9 | Die-to-Die Interface: UCIe | 2:00 | UCIe 비교표 + 계층 |
| 10 | Evidence: Chiplets in Volume Production | 1:30 | 벤더 사례표 |
| 11 | Open Challenges | 1:20 | 한계 4항목 |
| 12 | Summary and Outlook | 1:15 | 정리 + 로드맵 |

## 다시 생성하기

`build.py`는 템플릿 원본을 `../ref/ref.pptx` 경로에서 읽습니다. 템플릿(`ffe_vs_ctle_lecture4.pptx`)은
연구실 자료이므로 이 저장소에 넣지 않았습니다. 재생성하려면 해당 파일을 그 경로에 두세요.

```bash
pip install python-pptx
python build/build.py          # → chiplet-overview.pptx

npm install docx
node build/script.js           # → chiplet-speaker-script.docx
```

## 알려진 확인 사항

- **표지에 발표자 이름이 없습니다.** 임의로 채우지 않았으니 직접 넣으세요.
- 본문 글꼴 크기는 지침(제목 18–20pt, 본문 18pt)을 따랐습니다. 참고 템플릿 원본은 제목 28pt·본문 26pt라
  더 큽니다. 강의실 화면이 크면 제목을 24pt로 올리는 편이 읽기 좋습니다 (`build.py`의 `T_TITLE`).
- D₀ 값과 5 W 기준선은 설명을 위한 가정값입니다. 슬라이드 하단과 대본에 그렇게 명시했습니다.
