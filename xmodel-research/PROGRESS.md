# PROGRESS — XMODEL × LLM 프로젝트 누적 진행 로그

> **목적**: 학습한 모든 것/결정/결과를 날짜순으로 누적해, 컨텍스트가 비워져도 이어서 작업 가능하게 한다.
> **갱신 규칙**: 새로 알게 되거나 결정/완료할 때마다 맨 아래에 새 엔트리를 **추가**(기존 내용은 보존). 추정은 `⚠️`로 표기.
> 함께 보기: 진입점 `../CLAUDE.md`, 종합 보고서 `XMODEL_LLM_Framework_Report.md`.

---

## 타임라인

### 2026-06-14 — 세션 1: 조사 + 설계 + 핸드오프 문서 + 2026.06 릴리스 반영

**한 일**
- XMODEL 생태계 조사(공개 자료) → 종합 보고서 작성. 프레임워크 아키텍처/환경발견 체크리스트/Python 청사진/로드맵 정리.
- 최신(2024–2026) 기능 웹 조사 → 보고서 §2.4.
- 사용자가 **XMODEL 2026.06 공식 릴리스 이메일**(Jaeha Kim, 2026-06-07) 제공 → 보고서 §2.5에 공식 changelog 반영, 추정치들 확정으로 교체.
- 프로젝트 메모리(`CLAUDE.md`) + 본 진행 로그(`PROGRESS.md`) 신설.

**확정한 사실**
- 최신 버전 **XMODEL 2026.06** (YYYY.MM 체계).
- 런처 `xmodel` → `xmverilog`(VCS 스타일)/`xrun`(Xcelium) 구동. (이전엔 `vcs` 직접 호출로 추정했었음 → 정정.)
- **EQCHECK** 신규(2026.06): 모델↔회로 등가검증 VS Code 확장 + CLI(`--netlist`, `--netlist-format spice|spectre|cdl`, `-timetol`/`--vtimetol`/`--itimetol`).
- XWAVE: **커서 2개**, bit-vector 아날로그/디지털 표시, 2/8/16진·부호 10진, `plot_fourier`/`plot_psd` 수정.
- MODELZEN: 대규모 netlist 효율↑, `XMODEL_UDMDATA`(elaboration 가속), UDM에 vbias/vpwr/vgnd 전압체커, `--include`/`--debug-netlist`, empy 코너별 파라미터화, bit-blast 신호명 정규화.
- GLISTER: MODELZEN 인스턴스 속성에 empy 표현식.
- 코어 프리미티브: `sparam_to_tf`/`sparam_to_tline` 개선(S파라미터→전송선; 포토닉스 채널모델과 직결), `check_value`/`check_delay`/`check_delay_bit`가 pass/fail 구간·이벤트수 보고, `pwl_var`/`ilo`/`interp`/`interp_var` 버그 수정, 파라미터명 `tgrace`/`tgrace_init`/`ngrace_init`.
- 도메인 확장(웹 조사): **실리콘 포토닉스**(ASP-DAC 2025, 광소자=다중포트 전송선, 광파~200THz를 Laplace+이벤트구동으로, WDM 트랜시버), 비동기 SAR-ADC, NAND 플래시, CMOS 이미지센서, 컴퍼레이터 오프셋. Cadence Virtuoso ADE 통합(Connections). BetaSoft 북미 유통.

**결정 사항**
- 첫 산출물 = 조사·설계 문서 + **하나의 다운로드 가능한 종합 보고서**(서버의 Claude가 바로 이어받게).
- 스택 = **Python**. 어댑터는 인터페이스+Mock으로 격리(서버에 XMODEL 없어도 파이프라인 테스트 가능).
- LLM 산출물은 항상 컴파일/시뮬/**EQCHECK 등가검증**으로 객관 검증(환각 차단).
- EQCHECK를 자동 검증 루프의 핵심 훅으로 채택 → `adapters/EqcheckAdapter` + LLM 도구 `run_eqcheck` 설계 반영.

**미해결/다음 (Open)**
- ⚠️ 서버 환경 미연결: 정확한 컴파일/런 서브커맨드·플래그, 파형 덤프 포맷·확장자, 헤드리스 수치 export 경로, 라이선스 상태 미확정 → 보고서 §4로 확정 필요.
- ⚠️ 프리미티브 220종 정확한 시그니처 카탈로그 미확보 → 설치본 examples/docs에서 추출해 `knowledge/primitives.md` 작성.
- ⚠️ 서버의 Claude API 접근(키/모델/사내 프록시)·회로 IP 외부전송 정책 미확인.
- ⚠️ BusinessWire 보도자료 2건(2025-04-30, 2026-02-23) 본문 미수신(사이트 403) → 후속 확인.
- 참고(비작업): 메일에 7월 16~17일 SciAnalog 기술교류회 일정 조율 진행 중. 요청 시에만 관여.

**커밋(이 브랜치 `claude/xmodel-research-4qGcm`)**
- 보고서/README 최초 작성 → 최신기능 §2.4 → 2026.06 릴리스 §2.5 → 메모리/로그 신설.

---

<!-- 다음 세션은 여기 아래에 새 엔트리를 추가하세요. 형식:
### YYYY-MM-DD — 세션 N: 제목
**한 일** / **확정한 사실** / **결정 사항** / **미해결·다음** / **커밋**
-->
