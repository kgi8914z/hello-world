# XMODEL × LLM 연구

Scientific Analog **XMODEL**(SystemVerilog 이벤트 구동 아날로그/혼성신호 시뮬레이터)을
**LLM(Claude)** 과 결합해 회로/시스템의 **자동 모델링 · 결과 분석 · 프레임워크화**를 연구한다.

## 문서
- **[XMODEL_LLM_Framework_Report.md](./XMODEL_LLM_Framework_Report.md)** — 종합 보고서 & 핸드오프 브리프 (메인 산출물)
  - XMODEL 생태계 조사 / 프레임워크 아키텍처 / 환경 발견 체크리스트 / Python 구현 청사진 / 단계별 로드맵
  - 이 파일 하나만으로 **XMODEL 서버의 Claude가 즉시 작업을 시작**할 수 있도록 작성됨.

## 사용법 (핸드오프)
XMODEL이 설치된 서버에 연결된 PC의 Claude에게 위 보고서를 건네고,
보고서 **부록 A의 "첫 프롬프트"** 를 그대로 주면 환경 파악(Phase 0)부터 시작한다.

## 상태
- [x] XMODEL 생태계 조사 (공개 자료 기반)
- [x] LLM 통합 프레임워크 설계
- [x] Python 구현 청사진 + 단계별 로드맵
- [ ] (서버에서) 환경 발견 + 예제 Ground Truth 확보 → 실어댑터 구현
- [ ] 결과 분석기 / 자동 모델링 / 피드백 루프 구현
