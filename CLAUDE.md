# CLAUDE.md — 프로젝트 메모리 (세션 시작 시 항상 먼저 읽는 파일)

> 이 파일은 컨텍스트가 비워져도 **프로젝트를 자연스럽게 이어가기 위한 단일 진입점**이다.
> 새 세션/요약 직후라면 **이 파일 → `xmodel-research/PROGRESS.md` → `xmodel-research/XMODEL_LLM_Framework_Report.md`**
> 순서로 읽고 시작하라.

## ⛳ 작업 프로토콜 (반드시 지킬 것)
1. **실행 전(Before)**: 무언가 하기 전에 이 `CLAUDE.md`와 `xmodel-research/PROGRESS.md`의 최신 상태를 확인한다.
2. **학습 후(After)**: 새로 알게 된 사실·결정·결과는 **즉시** `PROGRESS.md`에 날짜와 함께 누적 기록하고,
   체계가 필요한 내용은 종합 보고서(`XMODEL_LLM_Framework_Report.md`)의 해당 절에 반영한다.
3. **커밋**: 의미 있는 단위마다 한국어 커밋 메시지로 커밋하고, 작업 브랜치에 푸시한다.
4. **출처/추정 구분**: 확정 사실과 추정(`⚠️검증필요`)을 항상 구분해 기록한다. 1차 자료(공식 릴리스/공지) > 웹 조사.

## 📌 프로젝트 한눈에
- **목표**: Scientific Analog **XMODEL**(SystemVerilog 이벤트구동 아날로그/혼성신호 시뮬레이터)을
  **LLM(Claude)** 과 결합해 **회로/시스템 자동 모델링 + 결과 분석 + 프레임워크화**.
- **스택**: Python. **대상 LLM**: Claude (claude-opus-4-8 등).
- **현 단계**: 조사·설계 + 핸드오프 문서 작성 단계(코드 구현 전). 실제 XMODEL 서버는 아직 미연결.
- **사용자**: 김가인(Gain Kim) 교수. XMODEL 서버 접근/라이선스 보유 측. Scientific Analog CEO Jaeha Kim과 직접 소통.

## 🗂 파일 지도
| 파일 | 내용 |
|---|---|
| `CLAUDE.md` (이 파일) | 프로젝트 메모리·진입점·작업 프로토콜 |
| `xmodel-research/PROGRESS.md` | **누적 진행 로그**(날짜별 학습/결정/다음할일) — 매번 갱신 |
| `xmodel-research/XMODEL_LLM_Framework_Report.md` | **종합 보고서 & 핸드오프 브리프**(조사·설계·환경발견·Python청사진·로드맵·릴리스노트) |
| `xmodel-research/README.md` | 폴더 인덱스/상태 체크리스트 |

> 주의: 루트 저장소 자체는 별개의 "Investment Portfolio Tracker" 웹앱이다. **XMODEL 연구는 `xmodel-research/` 폴더에 한정**.

## 🔧 Git
- **작업 브랜치**: `claude/xmodel-research-4qGcm` (이 브랜치에서만 작업/푸시. 다른 브랜치 푸시 금지.)
- 푸시: `git push -u origin claude/xmodel-research-4qGcm` (네트워크 실패 시 2/4/8/16s 백오프 재시도).
- PR은 **사용자가 명시 요청할 때만** 생성.

## ✅ 확정 핵심 사실 (cheat-sheet)
- **최신 정식 버전 = XMODEL 2026.06** (버전 체계 YYYY.MM). 1차 자료: SciAnalog 공식 릴리스 이메일(2026-06-07).
- **런처 = `xmodel`** → 내부적으로 **`xmverilog`(VCS 스타일)** / **`xrun`(Cadence Xcelium)** 구동. (호스트 시뮬: VCS/Xcelium/Questa)
- **신호 = `xreal`**(시간-값 샘플이 아닌 **구간별 함수식**). 이벤트 구동 → RNM 대비 10~100배(케이스에 따라 >300배).
- **220개 프리미티브**. 회로레벨 소자(R/C/트랜지스터/전송선) + 기능 블록.
- **제품군**: XMODEL(시뮬) · MODELZEN(netlist→모델 자동생성) · GLISTER(스키매틱) · XWAVE(파형뷰어) · **EQCHECK(2026.06 신규, 모델↔회로 등가검증, VS Code 확장)**.
- **2026.06 신규 하이라이트**: XWAVE 커서 2개 / **EQCHECK** / MODELZEN 효율·UDM 강화 / `sparam_to_tline` 등.
  → EQCHECK는 "자동 모델링 → 자동 등가검증 → 자동 보정" 루프의 **핵심 자동화 훅**. (CLI: `--netlist`,`--netlist-format spice|spectre|cdl`,`--vtimetol`)

## 🚧 다음 할 일 (요약 — 상세는 PROGRESS.md)
- (서버 연결 시) 보고서 §4 환경발견 체크리스트 실행 → `xmodel-research/ENV.md` 작성.
- 예제 1개 실제 구동으로 컴파일/런/파형 추출 Ground Truth 확정 → `adapters/xmodel_real.py` 구현.
- 미수신 보도자료(BusinessWire 2025-04-30, 2026-02-23) 내용 후속 확인.
