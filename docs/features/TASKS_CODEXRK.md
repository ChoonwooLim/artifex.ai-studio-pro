
# CODEXRK 백로그 v2.0 (Character Creator 통합)

## [A-00] 사전 작업 - 기존 코드 보호
- 내용: CharacterCreator 기존 코드를 CharacterCreatorBasic.tsx로 안전하게 이동
- 경로: components/character/CharacterCreatorBasic.tsx
- 완료조건:
  * git diff 최소화 (CharacterCreator.tsx는 탭 래퍼만 추가)
  * 기존 기능 100% 동작 확인
  * 모든 기존 테스트 통과
  * import 경로 업데이트 완료

## [A-01] 통합 스캐폴드
- 내용: codexrk/ 디렉토리 구조 생성, 기존 프로젝트와 격리
- 경로: services/characterGeneration/codexrk/
- 완료조건:
  * 디렉토리 구조 생성 완료
  * tsconfig paths 설정 (`@codexrk/*` 매핑)
  * 기존 코드와 충돌 없음 확인
  * package.json 스크립트 추가 (`dev:pro`, `test:pro`)

## [A-02] Professional API 구현
- 내용: Professional Mode용 API 엔드포인트 구현
- 경로:
  * services/characterGeneration/codexrk/orchestrator/CharacterOrchestrator.ts
  * pages/api/v1/character/professional.ts (Next.js API Route)
- 완료조건:
  * Basic Mode API와 완전 독립
  * OpenAPI 문서 자동 생성
  * SLO 메트릭 수집 통합
  * 에러코드 표준화 (4xx, 5xx)

## [A-03] 이미지 어댑터 (격리)
- 내용: midjourney/flux/openai 어댑터 구현
- 경로: services/characterGeneration/codexrk/adapters/image/
- 완료조건:
  * 기존 aiCharacterGenerator.ts 수정 없음
  * 목 어댑터로 우선 구현
  * 캐시 키 `(promptHash, modelVersion, seed)` 적용
  * health() 메서드 구현

## [A-04] 3D 어댑터 (격리)
- 내용: csm/meshy/luma/zero123 어댑터 구현
- 경로: services/characterGeneration/codexrk/adapters/model3d/
- 완료조건:
  * 폴백 체인 구성 (CSM→Meshy→Luma)
  * 기존 3D 생성 코드와 독립
  * 평균 생성시간 메트릭 수집
  * 목 응답으로 테스트 가능

## [A-05] 비디오 어댑터 (격리)
- 내용: veo/runway/pika 어댑터 구현
- 경로: services/characterGeneration/codexrk/adapters/video/
- 완료조건:
  * 60초 이내 480p 샘플 생성 (목)
  * 메타데이터 저장
  * Optional 기능으로 구현

## [A-06] Gaussian 서비스 통합
- 내용: 기존 gaussianSplattingRenderer.ts 활용 + 확장
- 경로: services/characterGeneration/codexrk/adapters/gaussian/
- 완료조건:
  * 기존 렌더러 재사용
  * KTX2 압축 추가
  * 1080p 웹뷰어 p95 FPS ≥ 90
  * 파일 크기 리포트

## [A-07] Consistency Engine 2.0
- 내용: 얼굴/스타일/형상 임베딩 + 일관성 스코어
- 경로: services/characterGeneration/codexrk/consistency/
- UI: components/character/CharacterConsistencyPanelPro.tsx
- 완료조건:
  * p50 ≥ 0.95, p90 ≥ 0.92 달성
  * 샘플 10건 벤치 통과
  * UI에 점수 실시간 표시

## [A-08] UE5 Exporters & Validator
- 내용: FBX/GLB/UDIM 내보내기, Substrate 템플릿
- 경로: services/characterGeneration/codexrk/exporters/
- UI: components/character/CharacterUE5ExporterPro.tsx
- 완료조건:
  * 샘플 모델 3개 임포트 자동 검사 "pass"
  * UE5 CLI 검증 도구 구현
  * 검증 리포트 JSON 생성

## [A-09] Rights Management (C2PA/WM)
- 내용: C2PA 서명, 비가시 워터마크, 감사로그
- 경로: services/characterGeneration/codexrk/rights/
- 완료조건:
  * 모든 산출물에 서명/워터마크 메타 포함
  * 감사로그 append-only 저장
  * UI에 권리 정보 표시

## [A-10] Registry & Telemetry
- 내용: Professional Mode용 PostgreSQL + 관측성
- 경로:
  * db/schema.sql (PostgreSQL)
  * services/characterGeneration/codexrk/telemetry/
- 완료조건:
  * Basic Mode는 IndexedDB 유지
  * Pro Mode는 PostgreSQL 사용
  * Grafana 대시보드 구성
  * SLO 메트릭 실시간 수집

## [A-11] E2E & Benchmark
- 내용: 통합 테스트 및 벤치마크
- 경로: tests/characterPro/
- 시나리오:
  * Basic Mode 회귀 테스트 (필수 통과)
  * Professional Mode 기능 테스트
  * 모드 전환 테스트
  * 프리셋 20개 벤치마크
- 완료조건:
  * 임계 미달 시 배포 중단/롤백
  * 테스트 커버리지 > 80%

## [A-12] 보안 & 비용 가드레일
- 내용: 인증/인가 및 비용 제어
- 경로: services/characterGeneration/codexrk/guardrails/
- 완료조건:
  * 세션 예산 상한 적용
  * 초과 시 자동 다운그레이드
  * Rate limiting 구현
  * API 키 안전 관리

## [A-13] 문서화 & 온보딩
- 내용: 통합 문서 작성
- 산출물:
  * README.md (Quick Start 포함)
  * INTEGRATION_GUIDE.md
  * .env.sample
  * 운영 플레이북
- 완료조건:
  * Basic/Pro Mode 구분 명확
  * 신규 엔지니어 2시간 내 실행
  * 트러블슈팅 가이드 포함
