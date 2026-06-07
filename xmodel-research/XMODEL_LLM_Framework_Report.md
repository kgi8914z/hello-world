# XMODEL × LLM 통합 프레임워크 — 종합 보고서 & 핸드오프 브리프

> **이 문서의 목적**
> 이 보고서는 **두 가지** 역할을 한다.
> 1. **조사·설계 문서**: Scientific Analog의 XMODEL 생태계와, 이를 LLM(Claude)과 결합해
>    "회로/시스템 자동 모델링 + 결과 분석 + 프레임워크화"를 달성하기 위한 아키텍처를 정리한다.
> 2. **핸드오프 브리프**: 이 파일을 **XMODEL이 설치된 서버에 연결된 PC의 Claude(Claude Code)** 에게
>    그대로 건네주면, 그 Claude가 환경을 스스로 파악하고 **즉시 작업을 시작**할 수 있도록
>    "무엇을 먼저 확인할지 / 무엇을 만들지 / 어떤 순서로 진행할지"를 구체적으로 적었다.
>
> **읽는 Claude에게 (TL;DR)**: 먼저 §4 "환경 발견 체크리스트"를 실행해 사실을 수집하고,
> 그 결과로 §3의 아키텍처와 §6의 Python 청사진을 **현장에 맞게 보정**한 뒤, §7 로드맵의 Phase 0부터 진행하라.
> 이 문서의 운영 세부(명령어·파일 확장자 등)는 일부 **추정**이며, 반드시 §4로 실제 환경에서 검증하라.
> 추정 항목은 `⚠️ 검증필요` 로 표시했다.

작성일: 2026-06-07 · 스택: Python · 대상 LLM: Claude (claude-opus-4-8 등 최신 모델)

---

## 1. 개요와 목표

### 1.1 한 줄 요약
XMODEL의 텍스트 기반 파이프라인(스펙/netlist → SystemVerilog 모델 → 시뮬레이션 → 파형/로그 → 분석)의
**각 경계에 LLM을 삽입**하여, 아날로그/혼성신호 회로·시스템의 **모델 생성·시뮬레이션 실행·결과 분석**을
반자동/자동화하는 Python 프레임워크를 구축한다.

### 1.2 최종 목표 (사용자 정의)
> "LLM과의 연결성 확장 및 보조를 통한 회로 및 시스템의 자동 모델링 및 결과 분석, 프레임워크 구축"

이를 세 가지 능력으로 분해한다.

1. **자동 모델링 (Auto-Modeling)**: 사양서/SPICE netlist/스키매틱 → XMODEL SystemVerilog 모델 자동 생성 및 보정.
2. **결과 분석 (Auto-Analysis)**: 시뮬레이션 파형/로그 → 성능 지표 추출, 이상 탐지, 자연어 리포트, 튜닝 제안.
3. **프레임워크화 (Framework)**: 위 둘을 재사용 가능한 모듈/CLI/도구(tool) 인터페이스로 묶고,
   피드백 루프(분석 → 모델 보정 → 재시뮬레이션)를 자동화.

### 1.3 핵심 통찰 (왜 LLM이 잘 맞는가)
XMODEL 워크플로우의 모든 산출물이 **텍스트/구조화 데이터**다 — SystemVerilog 코드, 시뮬레이터 로그,
파형 덤프(수치/함수식). LLM은 (a) 코드 생성, (b) 로그·에러 해석, (c) 수치 패턴 요약, (d) 도구 호출 오케스트레이션에
강하므로, 각 단계 경계가 자연스러운 삽입 지점이 된다.

---

## 2. XMODEL 생태계 조사 결과

> 출처: Scientific Analog 공식 사이트 및 공개 자료. 깊은 튜토리얼 PDF는 접근이 차단(403)되어
> 운영 세부는 일부 추정이며 §4에서 검증한다. 1차 출처 목록은 §10 참조.

### 2.1 제품 구성

| 구성요소 | 역할 | LLM 프레임워크에서의 연결고리 |
|---|---|---|
| **XMODEL** | 기존 SystemVerilog 시뮬레이터(VCS, NC-Verilog/Xcelium, Questa/ModelSim) **확장 플러그인**. 아날로그/혼성신호를 이벤트 구동으로 시뮬레이션. | **SV 모델 생성**의 타깃, 시뮬 실행 대상 |
| **MODELZEN** | 트랜지스터/SPICE netlist에서 XMODEL 모델을 **자동 추출/생성**(구조적 모델링). 풀칩 모델을 수 시간 내 생성 가능, 깊은 아날로그 전문성 불요. | **자동 모델링 파이프라인의 1차 엔진** (LLM이 전·후처리·검수) |
| **GLISTER** | Cadence Virtuoso에서 스키매틱으로 코딩 없이 XMODEL 프리미티브 연결, netlist/property export. MODELZEN과 연계해 스키매틱에서 모델 자동 생성. | **입력 진입점**(스키매틱→netlist) |
| **XWAVE** | `xreal` 함수식 파형을 직접 표시하는 뷰어. 각 파형 세그먼트가 해석적 표현이라 날카로운 스파이크도 단일 이벤트로 정확히 표현. | **결과 분석 대상**(파형 덤프) |
| **SAFLIX** | Scientific Analog의 학습/리소스 채널(영상·강의 자료). | 레퍼런스/온보딩 자료 |

### 2.2 핵심 기술 — `xreal`와 이벤트 구동
- XMODEL은 아날로그 신호를 **`xreal` 타입**으로 다룬다. 이는 시간-값 샘플 나열이 아니라
  **구간별 함수식(piecewise functional/analytic expression)** 으로 파형을 표현한다.
- 따라서 매우 빠른 연속시간 신호도 **적은 수의 이벤트**로 정확하게 표현 → Verilog-AMS/Real-Number Verilog 대비
  **10~100배 가속**. SPICE 호출 없이 SystemVerilog 안에서 아날로그 시뮬레이션 수행.
- **220개 프리미티브** 제공(연산/필터/소스 등 기능 블록 + R, C, 트랜지스터, 전송선 같은 회로 레벨 소자).
  엔지니어가 직접 프리미티브를 추가하거나 Scientific Analog에 요청 가능.
- **통계 분석**: 시간영역 시뮬레이션 중 신호의 통계적 특성을 계산하는 기능 → 전통적 몬테카를로 대비 큰 가속.

### 2.3 (추정) 일반적 사용 흐름 `⚠️ 검증필요`
공개 자료 기반으로 추정한 전형적 흐름이다. **§4에서 실제 명령/경로를 확정**하라.

```
1) 모델 작성: SystemVerilog (.sv) 안에서 xreal 신호 선언 + XMODEL 프리미티브 instantiate
   (혹은 GLISTER 스키매틱 → netlist, 혹은 MODELZEN으로 SPICE → 모델 자동 생성)
2) 컴파일/엘라보레이트: 호스트 시뮬레이터(VCS/Xcelium/Questa) + XMODEL 라이브러리/플러그인 링크
3) 실행: 테스트벤치 구동, 파형 덤프 생성 (FSDB/VCD 또는 XMODEL 전용 포맷)
4) 분석: XWAVE 뷰어로 xreal 파형 확인, 로그/측정값 추출
```

추정되는 검증 대상: XMODEL 설치 경로/환경변수, 컴파일·런 명령(또는 제공 Makefile/스크립트),
파형 덤프 포맷·확장자, 배치(batch)/CLI 실행 가능 여부, 라이선스 서버 설정.

---

## 3. 프레임워크 아키텍처 (XMODEL × LLM)

### 3.1 데이터 흐름

```
 입력                    LLM 보조 단계                  XMODEL 도구                 산출물
 ─────                   ─────────────                 ───────────               ───────
 [스펙(자연어)]   ─┐
 [SPICE netlist] ─┼─▶ ① 모델 생성기 ───────────────▶ (MODELZEN/직접작성) ─────▶ SV(XMODEL) 모델 (.sv)
 [GLISTER netlist]─┘     (LLM: 코드생성/검수)                                          │
                                                                                       ▼
                       ② 시뮬 오케스트레이터 ───────▶ VCS/Xcelium/Questa+XMODEL ─▶ 파형(FSDB/VCD/CSV)+로그
                          (compile/run/측정 자동화)                                     │
                                                                                       ▼
                       ③ 결과 분석기 ◀──────────────── 파형/측정/로그 파싱 ───────────┘
                          (LLM: 지표추출·이상탐지·리포트·튜닝제안)
                                       │
                                       ▼
                       ④ 피드백 루프: 분석 결과 → 모델/파라미터 보정 → ②로 재진입 (수렴까지)
```

### 3.2 핵심 모듈 (Python 패키지 `xmodel_llm`)

| 모듈 | 책임 | 핵심 인터페이스(요지) |
|---|---|---|
| `adapters/` | XMODEL 툴체인 추상화. **실제 바이너리 호출 + Mock 구현 동시 제공**. | `XModelRunner`, `ModelzenAdapter`, `WaveformReader` |
| `modeling/` | 자동 모델 생성/보정 (LLM 기반 SV 생성, MODELZEN 래핑, 검증). | `generate_model(spec) -> SVModel`, `repair_model(errors)` |
| `simulate/` | 컴파일/엘라보레이트/런 오케스트레이션, 측정 추출. | `run_sim(model, tb) -> SimResult` |
| `analysis/` | 파형/로그 파싱 → 지표·이상탐지·자연어 리포트. | `analyze(result) -> AnalysisReport` |
| `llm/` | Claude API 클라이언트 + 도구(tool) 정의 + 프롬프트 템플릿. | `LLMClient`, `tools.py`, `prompts/` |
| `orchestrator/` | 전체 파이프라인 + 피드백 루프 상태머신. | `Pipeline.run(spec, goals)` |
| `cli.py` | `xmodel-llm model|sim|analyze|loop ...` 명령. | Typer/argparse |

### 3.3 설계 원칙
- **어댑터 경계로 격리**: XMODEL이 없는 환경(예: 이 보고서를 만든 컨테이너)에서도 **Mock으로 전 파이프라인을
  end-to-end 테스트** 가능. 실서버에서는 환경변수/설정으로 실 어댑터를 주입.
- **LLM은 "보조", 결정은 검증 가능하게**: LLM이 생성한 SV는 항상 컴파일/시뮬로 **객관 검증**. 환각 위험 차단.
- **모든 단계 텍스트 산출물로 기록**: 재현성·디버깅·향후 학습 데이터화.
- **느슨한 제약**: 인터페이스는 고정하되 구현은 현장 사정에 맞게 자유롭게 교체 가능하게 둔다.

---

## 4. 환경 발견 체크리스트 (서버의 Claude가 가장 먼저 실행)

> 이 절이 핸드오프의 핵심이다. 아래를 **순서대로** 확인하고, 결과를 `xmodel-research/ENV.md`로 기록한 뒤
> §3 아키텍처와 §6 청사진을 보정하라. 명령은 환경에 맞게 조정.

### 4.1 툴체인 존재/버전
```bash
# XMODEL / Scientific Analog 도구
which xwave xrun modelzen glister 2>/dev/null
env | grep -iE 'xmodel|scianalog|saflix|modelzen' 
ls -d /usr/local/* /opt/* 2>/dev/null | grep -iE 'xmodel|scianalog'   # 설치 경로 추정
cat $XMODEL_HOME/version* 2>/dev/null                                  # 버전 (변수명은 추정)

# 호스트 시뮬레이터 (셋 중 무엇이 깔려 있나)
which vcs   2>/dev/null && vcs   -ID 2>/dev/null | head        # Synopsys VCS
which xrun  2>/dev/null && xrun  -version 2>/dev/null | head   # Cadence Xcelium
which vsim  2>/dev/null && vsim  -version 2>/dev/null | head   # Siemens Questa/ModelSim
```

### 4.2 라이선스
```bash
env | grep -iE 'LM_LICENSE|SNPSLMD|CDS_LIC|SALT|SCIANALOG'    # 라이선스 서버 변수
lmstat -a 2>/dev/null | head -40                              # 가용 feature/좌석 (있으면)
```

### 4.3 예제·설치 자료 (가장 빠른 학습 경로)
```bash
# XMODEL 설치 디렉터리의 examples/tutorials/docs 를 찾는다 — "정답 사용법"이 여기 있다
find / -maxdepth 6 -type d \( -iname '*xmodel*' -o -iname '*scianalog*' \) 2>/dev/null
find "$XMODEL_HOME" -maxdepth 3 -iregex '.*\(example\|tutorial\|demo\|test\).*' 2>/dev/null
# 제공되는 Makefile / 실행 스크립트 / 셋업 스크립트
find "$XMODEL_HOME" -iname 'Makefile*' -o -iname '*.csh' -o -iname 'setup*' 2>/dev/null | head
```

### 4.4 한 개 예제를 실제로 돌려본다 (Ground Truth 확보)
- examples 중 가장 단순한 것을 **있는 그대로** 컴파일·실행해 본다.
- 기록할 것: ① 정확한 컴파일 명령, ② 실행 명령, ③ 생성되는 파형 파일 확장자/경로,
  ④ 로그에서 측정값이 어떻게 출력되는지, ⑤ XWAVE를 배치/CLI로 파형을 덤프(CSV 등)할 수 있는지.
- 이 5가지가 `adapters/`의 실제 구현 명세가 된다.

### 4.5 파형 데이터 추출 경로 확인 (분석기 입력)
- XWAVE가 **헤드리스/스크립트**로 파형을 텍스트(CSV/JSON)로 export 가능한가?
- 아니면 FSDB/VCD를 다른 도구(예: `fsdb2vcd`, Verdi, 파이썬 `pyDigitalWaveTools`/`vcdvcd`)로 읽어야 하나?
- `xreal`이 함수식 표현이라면, **샘플링된 수치 export 방법**(시간격자에 평가)이 분석에 가장 실용적.

> ⚠️ 위 명령어/변수명(`xrun`, `XMODEL_HOME` 등)은 **추정**이다. 실제 이름이 다를 수 있으니
> `find`/`env` 결과로 확정하라.

---

## 5. LLM 통합 설계 (Claude)

### 5.1 모델 선택
- 코드 생성·복잡 추론: **`claude-opus-4-8`** (최고 성능). 대량 로그/파형 요약 등 처리량 위주: **`claude-sonnet-4-6`**.
  경량 분류/라우팅: **`claude-haiku-4-5-20251001`**. (최신 4.x 계열 기준; 서버의 API 키/모델 접근 권한은 §4에서 확인.)
- 호출은 **Anthropic Python SDK**(`anthropic`) 사용. `ANTHROPIC_API_KEY` 환경변수 확인.

### 5.2 도구(tool use) 설계 — LLM이 XMODEL을 "조작"하는 손
LLM에게 아래 도구를 노출하면, 모델 생성→시뮬→분석을 자율적으로 오케스트레이션할 수 있다.

| 도구 이름 | 입력 | 동작 | 반환 |
|---|---|---|---|
| `write_sv_model` | 파일경로, SV 소스 | 모델 파일 기록 | 저장 경로 |
| `run_modelzen` | netlist 경로, 옵션 | MODELZEN 자동 모델 생성 실행 | 생성된 모델 경로, 로그 |
| `compile_and_run` | top 모듈, 파일목록, 옵션 | 컴파일+시뮬 실행 | 성공여부, 로그, 파형경로 |
| `read_waveform` | 파형경로, 신호목록, 시간범위 | 파형을 수치로 샘플링 export | 시계열 배열/요약통계 |
| `measure` | 측정 스펙(예: rise time, overshoot) | 파형에서 지표 계산 | 수치 지표 |

→ 검증 가능한 도구만 노출하고, **LLM 출력은 항상 도구 실행으로 사실 확인**(환각 차단).

### 5.3 프롬프트 역할 분리
- **Modeler 프롬프트**: 사양/netlist + XMODEL 프리미티브 카탈로그(§4.3에서 추출) → SV 모델 생성. 컴파일 에러 시 자가 수정 루프.
- **Analyst 프롬프트**: 측정값/파형 요약 + 설계 목표(스펙) → 합·불 판정, 원인 가설, 파라미터 튜닝 제안, 자연어 리포트.
- **Orchestrator 프롬프트**: 목표(goal)와 현재 상태 → 다음 도구 호출 결정(피드백 루프 운전자).

### 5.4 컨텍스트 공급의 관건 — "프리미티브 카탈로그"
LLM이 올바른 XMODEL SV를 쓰려면 **220개 프리미티브의 시그니처/사용법**을 컨텍스트로 줘야 한다.
§4.3의 examples/docs에서 프리미티브 목록·인자·예제를 긁어 **`knowledge/primitives.md`** 로 정리하고
RAG/직접삽입으로 Modeler 프롬프트에 공급하라. (이 카탈로그 구축이 모델 생성 품질을 좌우한다.)

---

## 6. Python 구현 청사진 (바로 확장 가능한 골격)

> 아래는 **인터페이스 우선** 골격이다. 실서버에서 §4 결과로 `adapters/`의 명령만 채우면 동작한다.
> Mock 구현이 들어 있어 XMODEL이 없어도 파이프라인 테스트가 가능하다.

### 6.1 패키지 레이아웃
```
xmodel_llm/
  __init__.py
  config.py            # 환경변수/경로/시뮬레이터 선택
  adapters/
    base.py            # 추상 인터페이스 (Protocol)
    xmodel_real.py     # 실제 XMODEL/시뮬레이터 호출 (§4로 명령 확정)
    xmodel_mock.py     # XMODEL 없는 환경용 목 구현
    waveform.py        # FSDB/VCD/CSV 리더 + xreal 샘플링
  modeling/generator.py
  simulate/runner.py
  analysis/analyzer.py
  llm/client.py        # Anthropic SDK 래퍼
  llm/tools.py         # tool 스키마 + 디스패처
  llm/prompts/*.md
  orchestrator/pipeline.py
  cli.py
knowledge/
  primitives.md        # §5.4 프리미티브 카탈로그 (서버에서 채움)
tests/
  test_pipeline_mock.py
pyproject.toml
```

### 6.2 어댑터 인터페이스 (핵심 — 이것만 고정)
```python
# xmodel_llm/adapters/base.py
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Protocol, Sequence

@dataclass
class SimResult:
    ok: bool
    log: str
    waveform_path: str | None = None
    measurements: dict[str, float] = field(default_factory=dict)
    artifacts: dict[str, str] = field(default_factory=dict)

class XModelRunner(Protocol):
    """호스트 시뮬레이터 + XMODEL 컴파일/실행 추상화."""
    def compile_and_run(
        self, top: str, sources: Sequence[str], *,
        defines: dict[str, str] | None = None,
        plusargs: dict[str, str] | None = None,
        workdir: str | None = None,
    ) -> SimResult: ...

class ModelzenAdapter(Protocol):
    """SPICE/netlist -> XMODEL 모델 자동 생성."""
    def generate(self, netlist: str, *, options: dict | None = None) -> str: ...  # 모델 파일 경로

class WaveformReader(Protocol):
    """파형(FSDB/VCD/xreal)을 수치 시계열로 샘플링."""
    def sample(self, path: str, signals: Sequence[str],
               t_start: float, t_end: float, dt: float) -> dict[str, list[float]]: ...
```

### 6.3 실제 어댑터에서 채울 곳 (서버 작업의 90%)
```python
# xmodel_llm/adapters/xmodel_real.py  — §4.4에서 확정한 명령으로 교체
import subprocess, shlex
from .base import SimResult

class VcsXModelRunner:
    def __init__(self, xmodel_home: str, extra_args: list[str] | None = None):
        self.xmodel_home = xmodel_home          # §4.1에서 확정
        self.extra_args = extra_args or []

    def compile_and_run(self, top, sources, *, defines=None, plusargs=None, workdir=None):
        # ⚠️ 아래 명령 라인은 추정 — 실제 XMODEL 셋업(컴파일 플래그/라이브러리 링크)으로 교체
        cmd = ["vcs", "-sverilog", "-full64", f"-top", top, *sources, *self.extra_args]
        proc = subprocess.run(cmd, cwd=workdir, capture_output=True, text=True)
        ok = proc.returncode == 0
        # 이어서 simv 실행, 파형/측정 추출 — §4.4 결과로 구현
        return SimResult(ok=ok, log=proc.stdout + proc.stderr)
```

### 6.4 LLM 도구 디스패치 (요지)
```python
# xmodel_llm/llm/tools.py
TOOLS = [
  {"name": "write_sv_model", "description": "Write a SystemVerilog XMODEL model file.",
   "input_schema": {"type":"object","properties":{
       "path":{"type":"string"},"source":{"type":"string"}},"required":["path","source"]}},
  {"name": "compile_and_run", "description": "Compile and simulate an XMODEL testbench.",
   "input_schema": {"type":"object","properties":{
       "top":{"type":"string"},"sources":{"type":"array","items":{"type":"string"}}},
       "required":["top","sources"]}},
  {"name": "read_waveform", "description": "Sample signals from a simulation waveform.",
   "input_schema": {"type":"object","properties":{
       "path":{"type":"string"},"signals":{"type":"array","items":{"type":"string"}},
       "t_start":{"type":"number"},"t_end":{"type":"number"},"dt":{"type":"number"}},
       "required":["path","signals"]}},
]
# dispatch(name, args) -> adapters 호출로 매핑 (Anthropic tool_use 루프 안에서 실행)
```

### 6.5 의존성 (`pyproject.toml` 요지)
```
anthropic            # Claude API
numpy, scipy         # 파형/측정 수치 처리
vcdvcd 또는 pyDigitalWaveTools   # VCD 파싱 (FSDB는 벤더 변환 필요)
typer                # CLI
pytest               # 테스트
matplotlib (선택)    # 파형 플롯/리포트 그림
```

---

## 7. 단계별 로드맵

### Phase 0 — 환경 파악 (서버 도착 직후, 0.5~1일)
- §4 체크리스트 실행 → `ENV.md` 작성. 예제 1개 실제 구동(Ground Truth).
- 산출: 확정된 컴파일/런 명령, 파형 포맷, 라이선스 상태, 모델 접근 권한.

### Phase 1 — 어댑터 + Mock 파이프라인 (1~2일)
- `adapters/base.py` 고정, `xmodel_mock.py`로 end-to-end 더미 파이프라인 + `test_pipeline_mock.py` 통과.
- 실어댑터 `xmodel_real.py`에 §4.4 명령 이식 → **예제 1개를 프레임워크로 재현**(가장 중요한 마일스톤).

### Phase 2 — 결과 분석기 (2~3일)
- `WaveformReader` 구현(파형 → 수치). 기본 측정(rise/fall time, overshoot, settling, gain, jitter 등) 라이브러리화.
- Analyst LLM 프롬프트로 측정값+로그 → 자연어 리포트/합불 판정. (모델 생성보다 검증이 쉬워 먼저 가치 입증.)

### Phase 3 — 자동 모델링 (3~5일)
- 프리미티브 카탈로그(`knowledge/primitives.md`) 구축. Modeler LLM으로 사양→SV 생성 + 컴파일 자가수정 루프.
- MODELZEN 래핑(`ModelzenAdapter`)으로 netlist→모델 자동 생성 + LLM 검수.

### Phase 4 — 피드백 루프 & 프레임워크화 (지속)
- Orchestrator로 분석→보정→재시뮬 자동 수렴 루프. CLI/리포트 정리, 회귀 테스트 스위트, 사례 축적.

> 일정은 가이드일 뿐 강한 제약이 아니다. 환경/우선순위에 따라 자유롭게 재배열하라.

---

## 8. 아직 알아가야 할 것들 (열린 질문)
1. XMODEL 컴파일/런의 **정확한 명령·플래그·라이브러리 링크 방식** (어떤 호스트 시뮬레이터?).
2. 파형 덤프 **포맷/확장자**와 **헤드리스 수치 export** 경로 (XWAVE 스크립팅 vs FSDB/VCD 변환).
3. MODELZEN의 **입력 요건**(netlist 종류, property 파일)과 **출력 모델 구조**.
4. **프리미티브 카탈로그**의 정확한 시그니처 — examples/docs에서 추출 필요.
5. 서버의 **Claude API 접근**(키/모델/요금/사내 프록시) 및 **데이터 반출 정책**(회로 IP의 외부 전송 가능 여부).
6. GLISTER(Virtuoso) 연계가 워크플로우에 필요한지, 아니면 netlist 핸드오프로 충분한지.
7. 대상 회로군(예: DC-DC, SerDes/DFE 수신기, PLL, ADC 등) — XMODEL 강점 사례와 정렬.

## 9. 리스크 & 완화
| 리스크 | 완화 |
|---|---|
| LLM 환각(잘못된 SV/측정) | 모든 LLM 산출물을 컴파일/시뮬로 검증, 측정은 수치 코드로 계산 |
| 운영 세부 추정 오류 | Phase 0에서 실제 예제로 Ground Truth 확정 후 코드 이식 |
| 회로 IP 외부 전송 우려 | 사내 프록시/온프렘 모델 옵션, 민감정보 마스킹, §8-5 정책 확인 |
| 라이선스 좌석 부족(병렬 시뮬) | 작업 큐/세마포어로 동시 실행 제한 |
| FSDB 등 폐쇄 포맷 파싱 | 벤더 변환기(fsdb2vcd 등) 경유 또는 XWAVE export 활용 |

## 10. 출처
- Scientific Analog (홈): https://www.scianalog.com/
- XMODEL 제품: https://www.scianalog.com/xmodel/
- MODELZEN: https://www.scianalog.com/modelzen/
- GLISTER: https://www.scianalog.com/glister/
- SAFLIX: https://www.scianalog.com/saflix/
- XMODEL @ 61DAC (Semiwiki): https://semiwiki.com/eda/347466-scientific-analog-at-61dac/
- True event-driven AMS simulation in SystemVerilog: a DFE receiver example (IEEE): https://ieeexplore.ieee.org/document/6330558/
- Catching the Elusive Voltage Spike with AMS (DVCon): https://dvcon-proceedings.org/wp-content/uploads/1128.pdf
- A UVM SystemVerilog Testbench for AMS Verification (DVCon): https://dvcon-proceedings.org/wp-content/uploads/A-UVM-SystemVerilog-Testbench-for-AnalogMixed-Signal-Verification-A-Digitally-Programmable-Analog-Filter-Example.pdf
- SNU MICS XMODEL wiki: https://mics.snu.ac.kr/wiki/xmodel
- (참고) AMSNet: Netlist Dataset for AMS Circuits: https://arxiv.org/pdf/2405.09045

---

## 부록 A. 서버의 Claude를 위한 첫 프롬프트 (복사용)
> 아래를 그대로 서버 PC의 Claude에게 주면 된다.

```
첨부한 XMODEL_LLM_Framework_Report.md를 읽고 다음을 수행하라.
1) 보고서 §4 "환경 발견 체크리스트"를 이 서버에서 실제로 실행하고 결과를 xmodel-research/ENV.md로 정리하라.
   (which/env/find 결과, 호스트 시뮬레이터 종류, 라이선스 상태, 예제 디렉터리 위치)
2) 가장 단순한 XMODEL 예제 1개를 있는 그대로 컴파일·실행해, 정확한 명령/파형 포맷/측정 출력 방식을 확정하라.
3) 그 사실을 바탕으로 보고서 §6 Python 청사진의 adapters/xmodel_real.py를 실제 명령으로 채워
   "예제 1개를 프레임워크로 재현"하는 Phase 1을 완료하라.
4) 진행 중 추정과 다른 점이 나오면 보고서의 ⚠️검증필요 항목을 정정하고 기록하라.
막히는 부분이나 결정이 필요한 지점은 질문해라. 제약은 최소로, 실용적으로 진행하라.
```

## 부록 B. 용어
- **xreal**: XMODEL의 아날로그 신호 타입. 구간별 함수식으로 파형 표현(샘플 나열 아님).
- **이벤트 구동(event-driven)**: 값이 바뀌는 시점에만 계산 → 고속.
- **프리미티브(primitive)**: XMODEL이 제공하는 기본 빌딩블록(기능/회로 소자), 약 220종.
- **RNM(Real-Number Modeling)**: 실수 기반 디지털 모델링. XMODEL은 이보다 정확/고속을 지향.
- **FSDB/VCD**: 파형 덤프 포맷(폐쇄/개방).
```
