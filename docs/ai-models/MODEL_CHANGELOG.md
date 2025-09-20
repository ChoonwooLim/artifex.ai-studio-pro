# AI 모델 변경 이력

## 개요
이 문서는 artifex.ai-studio-pro 프로젝트에서 사용하는 모든 AI 모델의 변경 이력을 추적합니다.

---

## 2025년 9월 20일 오후 (실제 최신 확인 - WebSearch 검증)

### 🎯 실제 출시된 최신 모델 정보 (2025년 9월 20일 기준)

#### Google (2025년 9월 20일 확인)
##### Text Models
- **Gemini 2.5 시리즈** (Thinking Models)
  - **Gemini 2.5 Pro** (Stable): 가장 진보된 모델, 적응형 thinking
  - **Gemini 2.5 Flash** (Stable, 2025년 6월 GA): 빠른 성능, 대규모 처리 최적화
  - **Gemini 2.5 Flash-Lite** (Preview): 가장 비용 효율적이고 빠른 2.5 모델
  - **Gemini 2.5 Deep Think** (Limited Access): Ultra 구독자 대상 고급 추론
- **Gemini 2.0 Flash**: 1M 토큰 컨텍스트 윈도우
- **Gemini 2.5 Flash Live**: 음성/비디오 실시간 처리

##### Image Models  
- **Imagen 4** (Public Preview on Vertex AI): 2K 해상도, 뛰어난 선명도
- **Gemini 2.5 Flash Image** (nano-banana, 2025년 8월 26일): 다중 이미지 블렌딩, 캐릭터 일관성

##### Video Models
- **Veo 3** (Private Preview, 2025년 9월): 네이티브 오디오 생성, 립싱크, 4K
- **Veo 2** (2024년 12월): 4K 비디오, 향상된 물리 시뮬레이션

#### OpenAI (2025년 9월 20일 확인)
##### Text Models
- **GPT-5 시리즈** (최신 메이저 릴리즈)
  - **GPT-5**: SWE-bench 74.9%, AIME 94.6%, 코딩/에이전트 작업 최고
  - **GPT-5-mini**: 균형잡힌 성능
  - **GPT-5-nano**: 간단한 작업용 효율적 모델
- **GPT-4.1 시리즈** (API 전용)
  - **GPT-4.1**: 1M 토큰 컨텍스트, 향상된 코딩 및 지시 따르기
  - **GPT-4.1 mini**, **GPT-4.1 nano**
- **특수 모델**
  - **gpt-realtime** (GA): 음성-음성 변환 모델
  - **GPT-5-Codex**: 코딩 특화
  - **OpenAI o4-mini**: 빠른 추론, AIME 2024/2025 최고 성능

##### Image Models
- **DALL-E 3** (현재 버전)

#### Anthropic (2025년 9월 20일 확인)
- **Claude Opus 4.1** (2025년 8월 5일): 
  - API ID: `claude-opus-4-1-20250805`
  - SWE-bench 72.5%, Terminal-bench 43.2%
  - 가격: $15/$75 per million tokens
- **Claude Sonnet 4** (2025년 5월 22일):
  - 1M 토큰 컨텍스트 (베타)
  - 가격: $3/$15 (기본), $6/$22.50 (200K+ 토큰)
- **레거시**: Claude 3.x 시리즈는 deprecation 중 (2026년 1월 5일 완전 종료 예정)

### 🛠️ 자동 확인 스크립트 개선 필요
- 공식 사이트 직접 확인 메커니즘 추가 필요
- WebSearch/WebFetch로 실시간 모델 정보 확인
- MODEL_CHANGELOG.md 자동 업데이트

---

## 이전 변경 이력

### 2025년 9월 20일 (오전)
- 로컬 모델 통합 계획 추가
- 날짜 인식 및 타임존 관리 개선

### 2025년 9월 19일
- 프로젝트 초기 설정
- AI 모델 통합 시스템 구축 시작

---

## 교훈 및 개선사항

### ⚠️ 중요한 교훈
1. **항상 공식 소스 확인**: WebSearch나 공식 문서를 통해 최신 정보 확인
2. **날짜 인식**: 시스템 날짜와 모델 출시일을 비교하여 정확성 검증
3. **자동화 필요**: 수동 확인에 의존하지 말고 자동 검증 시스템 구축

### 📋 개선 계획
1. 일일 자동 모델 업데이트 체크 스크립트 구현
2. 각 제공업체 API를 통한 실시간 모델 목록 확인
3. 변경사항 자동 감지 및 알림 시스템

---

*마지막 확인: 2025년 9월 20일 토요일*
*다음 확인 예정: 2025년 9월 21일 일요일*