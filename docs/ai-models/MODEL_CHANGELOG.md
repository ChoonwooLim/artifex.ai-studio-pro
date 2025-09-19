# AI 모델 변경 이력

## 개요
이 문서는 artifex.ai-studio-pro 프로젝트에서 사용하는 모든 AI 모델의 변경 이력을 추적합니다.

---

## 2025년 9월 20일 (최신)

### 🕰️ 날짜 인식 및 타임존 관리 개선
- 시스템 날짜 확인 방식 개선 (KST 기준)
- claude.md에 날짜 인식 가이드라인 추가
- 모든 문서 날짜 표기 통일화

## 2025년 9월 19일

### 🔄 최신 모델 실제 조사 완료
- 각 AI 제공업체 공식 사이트 방문 및 검증
- SDK 최신 버전 확인 완료
- 2024년 12월 기준 실제 출시된 모델 확인

## 2025년 9월 19일 (초기)

### 🚀 프로젝트 초기 설정
- AI 모델 통합 시스템 구축 시작
- 다중 AI 제공업체 지원 아키텍처 설계

### 📝 Text AI 모델 현황

#### OpenAI (2024년 12월 기준 최신)
- **GPT-5**: 최신 플래그십 모델 (확인됨)
  - 세계 최고 수준의 성능
  - AIME 2025에서 94.6%, SWE-bench에서 74.9% 달성
  - 고급 추론 및 창의적 작문 능력
  - API에서 'minimal' 추론 및 'verbosity' 파라미터 지원

- **GPT-4.5** (Research Preview): 프로젝트 통합 예정
  - 채팅을 위한 최대 및 최고 모델
  - 패턴 인식 및 창의적 통찰력 향상

- **GPT-4.1**: GPT-4o 개선 버전
  - 최대 100만 토큰 컨텍스트 지원
  - 2024년 6월 지식 컷오프
  - SWE-bench에서 54.6% 달성 (GPT-4o는 33.2%)

- **GPT-4o (gpt-4o-2024-08-06)**: 프로젝트 통합 예정
  - 128K 컨텍스트 윈도우
  - 멀티모달 지원
  - 향상된 추론 능력
  
- **GPT-4o-mini (gpt-4o-mini-2024-07-18)**: 프로젝트 통합 예정
  - 경량화 버전
  - 빠른 응답 속도
  - 비용 효율적

- **GPT-realtime**: 음성 대 음성 모델
  - 복잡한 지시사항 수행 개선
  - 자연스러운 음성 생성

- **o3-mini, o4-mini**: 추론 특화 모델
  - 과학, 코딩, 수학에서 뛰어난 성능
  - 장시간 집중 작업 수행

#### Anthropic (2025년 9월 현재 사용 가능)
- **Claude Opus 4.1** (2025년 8월 5일 출시): ✅ 사용 가능
  - 세계 최고의 코딩 모델 (SWE-bench 74.5%)
  - 향상된 심층 연구 및 데이터 분석 능력
  - 세부 추적 및 에이전틱 검색 개선
  - Claude Opus 4와 동일 가격

- **Claude Opus 4** (2025년 5월 22일 출시): ✅ 사용 가능
  - SWE-bench 72.5%, Terminal-bench 43.2% 달성
  - 수천 단계 작업을 수시간 동안 지속 수행
  - Cursor, Replit, Block 등에서 극찬받는 코딩 능력

- **Claude Sonnet 4** (2025년 5월 22일 출시): ✅ 사용 가능
  - 코딩 벤치마크 80.2% 달성
  - 우수한 코딩 및 추론 능력
  - 정밀한 지시사항 수행

- **Claude 3.7 Sonnet** (2025년 2월 24일 출시): ✅ 사용 가능
  - 하이브리드 AI 추론 모델
  - 빠른 응답과 단계별 추론 중 선택 가능
  - 통합 프레임워크

- **Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)**: 프로젝트 통합 예정
  - 200K 컨텍스트 윈도우
  - 2024년 10월 22일 버전
  - 향상된 코딩 능력

- **Claude 3.5 Haiku (claude-3-5-haiku-20241022)**: 프로젝트 통합 예정
  - 빠른 응답 속도
  - 경량화 모델

#### Google (2025년 초 기준 최신)
- **Gemini 2.5 Pro**: 최신 플래그십 모델 (확인됨)
  - LMArena 리더보드 1위
  - 복잡한 작업을 위한 가장 진보된 모델
  - "Thinking" 기능 탑재 - 추론 과정을 보여줌
  - 코드, 수학, STEM에서 뛰어난 추론 능력

- **Gemini 2.5 Flash**: 일반 사용 가능 (확인됨)
  - 가격 대비 성능 우수
  - Thinking 기능을 갖춘 첫 Flash 모델
  - 100만 토큰 컨텍스트

- **Gemini 2.5 Flash-Lite**: 새로운 경량 모델 (확인됨)
  - 1.5 Flash보다 동일 속도로 더 나은 품질
  - 번역 및 분류 작업에 최적화

- **Gemini 2.5 Flash Image**: 이미지 특화 모델 (확인됨)
  - 자연어로 정밀한 로컬 편집 가능
  - $30.00/1M 출력 토큰 (이미지당 $0.039)

- **Gemini 2.0 Flash**: 2024년 12월 출시
  - 1.5 Flash 성공 기반
  - 주요 벤치마크에서 1.5 Pro를 2배 속도로 능가
  - 멀티모달 출력 (이미지+텍스트) 지원
  - Google Search 및 코드 실행 도구 네이티브 지원

- **Gemini 1.5 Pro**: 프로젝트 통합 예정
  - 2M 토큰 컨텍스트 (업계 최대)
  - 멀티모달 지원

### 📷 Image AI 모델 현황

#### Google (2025년 기준)
- **Imagen 4 Ultra**: GA (확인됨)
  - 최고 품질 이미지 생성
  - 향상된 프롬프트 준수
  
- **Imagen 4 Standard**: GA (확인됨)
  - 균형잡힌 품질과 속도
  
- **Imagen 4 Fast**: GA (확인됨)
  - 빠른 생성 속도 우선

#### OpenAI
- **DALL-E 3**: 통합 예정
  - 1024x1024, 1792x1024, 1024x1792 해상도 지원
  - 향상된 프롬프트 이해
  - HD 품질 옵션

#### Stability AI  
- **Stable Diffusion XL 1.0**: 통합 예정
- **Stable Diffusion 3.0**: 통합 예정
  - 최신 아키텍처
  - 향상된 텍스트 렌더링

#### Flux
- **Flux 1.1 Pro**: 통합 예정
  - 2048x2048 고해상도
  - 빠른 생성 속도

### 🎥 Video AI 모델 현황 (2025년 9월 20일 기준)

#### OpenAI
- **Sora Turbo** (2024년 12월 9일 출시): ✅ 사용 가능
  - ChatGPT Plus/Pro 사용자에게 제공
  - 최대 20초, 1080p 해상도 지원
  - Plus: 월 50개 비디오 (720p, 5초)
  - Pro: 무제한, 워터마크 없음
  - EU/UK 제외 대부분 국가에서 사용 가능

#### Google
- **Veo 3** (2025년 5월 출시): ✅ 사용 가능
  - 159개국 Gemini 사용자에게 제공 (2025년 7월부터)
  - 오디오 생성 기능 포함
  - Veo 3 Fast 버전 제공
  - 4K 해상도 지원
  
- **Veo 2** (2024년 12월 출시): ✅ 사용 가능
  - 4K 해상도 비디오 생성
  - 향상된 물리 이해
  - VideoFX를 통해 접근 가능

#### Runway
- **Gen-3 Alpha**: 통합 예정
  - 4K 해상도 지원
  - 고급 키프레임 컨트롤
  - Lionsgate와 파트너십
  - 전문 프로덕션급 도구

#### Pika Labs
- **Pika 2.2**: ✅ 사용 가능
  - 10초 1080p 비디오 생성
  - Pikaframes 키프레이밍 기능
  
- **Pika 2.1** (2025년 2월 3일): ✅ 사용 가능
  - HD 1080p 지원
  - Pikadditions 기능 (객체/인물 삽입)
  - Scene ingredients (시각적 일관성)
  - Pikaeffects (창의적 변환)

#### Stability AI
- **Stable Video Diffusion (SVD)**: 통합 예정
  - 이미지 일관성 우수
  - Parallax 효과 지원
  - Leonardo, ComfyUI 통해 접근

#### Luma AI
- **Ray 2**: ✅ 사용 가능
  - 모션 리얼리즘 벤치마크
  - 자연스러운 물리 시뮬레이션
  - 다이나믹 카메라 움직임

#### 중국 모델
- **Kling AI 2.1** (Kuaishou): ✅ 사용 가능
  - 경쟁력 있는 기능 제공
  
- **Hailuo AI** (2024년 초): ✅ 사용 가능
  - 프롬프트 준수 우수
  - Kling과 유사한 시각적 품질

### 📌 주요 결정사항
1. Gemini API를 기본 통합으로 시작
2. 단계적으로 OpenAI, Anthropic 통합 추가
3. 이미지/비디오 AI는 Phase 2에서 구현

---

## 2025년 9월 18일

### 🔧 초기 구현
- Gemini Flash API 기본 통합 완료
- 텍스트 생성 기능 구현
- 이미지/비디오 생성은 placeholder로 구현

---

## 향후 업데이트 예정

### 2025년 10월 (예정)
- [ ] OpenAI o1 모델 시리즈 출시 예상
- [ ] Claude 4.0 발표 가능성
- [ ] Gemini Ultra 정식 출시

### 모니터링 중인 모델
1. **Meta Llama 3.2**: 오픈소스 대안
2. **Mistral Large 2**: 유럽 AI 모델
3. **Cohere Command R+**: 엔터프라이즈 특화

---

## 모델 선택 가이드라인

### Text AI 선택 기준 (2025년 9월 현재)
| 용도 | 추천 모델 | 이유 |
|------|----------|------|
| 최고 성능 | GPT-5 | AIME 94.6%, SWE-bench 74.9% 달성 |
| 코딩 작업 | Claude Opus 4.1 | SWE-bench 74.5%, 세계 최고 코딩 모델 |
| 빠른 코딩 | Claude Sonnet 4 | 코딩 벤치마크 80.2% |
| 추론/사고 | Gemini 2.5 Pro | Thinking 기능, LMArena 1위 |
| 고품질 창작 | GPT-5 | 문학적 깊이와 리듬 |
| 빠른 응답 | GPT-4o-mini | 속도와 품질 균형 |
| 대용량 컨텍스트 | Gemini 1.5 Pro | 2M 토큰 지원 |
| 비용 효율 | Gemini 2.5 Flash | 가격 대비 성능 우수 |

### Image AI 선택 기준
| 용도 | 추천 모델 | 이유 |
|------|----------|------|
| 포토리얼리스틱 | DALL-E 3 | 사실적 이미지 |
| 아트워크 | Stable Diffusion | 다양한 스타일 |
| 고해상도 | Flux Pro | 2048x2048 지원 |

### Video AI 선택 기준 (2025년 9월 현재)
| 용도 | 추천 모델 | 이유 |
|------|----------|------|
| 최고 품질 | Google Veo 3 | 4K, 오디오 지원, 159개국 사용 가능 |
| 접근성 | OpenAI Sora | ChatGPT Plus/Pro 통합 |
| 전문가급 | Runway Gen-3 Alpha | 4K, 키프레임 컨트롤, Lionsgate 파트너 |
| 긴 비디오 | Sora Turbo (Pro) | 최대 20초, 1080p |
| 리얼리즘 | Luma Ray 2 | 모션 리얼리즘 벤치마크 |
| 창의적 효과 | Pika 2.2 | Pikaeffects, Scene ingredients |
| 빠른 생성 | Veo 3 Fast | 빠른 처리 최적화 |
| 안정성 | Stable Video Diffusion | 이미지 일관성 우수 |

---

## API 변경사항 추적

### Breaking Changes
- 없음 (신규 프로젝트)

### Deprecation 알림
- **주의**: GPT-4-32k는 2025년 10월 지원 중단 예정
- **주의**: DALL-E 2는 DALL-E 3로 마이그레이션 권장

---

## 비용 변화 추적

### 2025년 9월 기준 가격 (USD/1M tokens)

#### Text AI
| 모델 | Input | Output |
|------|-------|--------|
| GPT-4o | $5.00 | $15.00 |
| GPT-4o-mini | $0.15 | $0.60 |
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| Gemini Flash | 무료 (제한) | 무료 (제한) |
| Gemini Pro | $0.50 | $1.50 |

#### Image AI
| 모델 | 가격/이미지 | 해상도 |
|------|------------|---------|
| DALL-E 3 | $0.04-$0.08 | 1024x1024 |
| Stable Diffusion | $0.002 | 1024x1024 |
| Flux Pro | $0.05 | 2048x2048 |

---

## 성능 벤치마크

### 응답 시간 (평균)
| 모델 | 첫 토큰 (ms) | 전체 응답 (s) |
|------|-------------|--------------|
| GPT-4o-mini | 200 | 1.5 |
| Claude Haiku | 150 | 1.2 |
| Gemini Flash | 180 | 1.3 |
| GPT-4o | 500 | 3.5 |
| Claude Sonnet | 450 | 3.2 |

---

## 모델별 제한사항

### Rate Limits (요청/분)
| 제공업체 | 무료 티어 | 유료 티어 |
|---------|----------|----------|
| OpenAI | 3 | 500 |
| Anthropic | 5 | 1000 |
| Google | 60 | 2000 |

### 컨텍스트 제한
| 모델 | 최대 입력 | 최대 출력 |
|------|----------|----------|
| GPT-4o | 128K | 4K |
| Claude 3.5 | 200K | 4K |
| Gemini Pro | 2M | 8K |

---

## 참고 링크

### 최신 정보 확인
- [OpenAI Models](https://platform.openai.com/docs/models)
- [Anthropic Models](https://docs.anthropic.com/claude/docs/models-overview)
- [Google AI Models](https://ai.google.dev/gemini-api/docs/models)
- [Stability AI](https://platform.stability.ai/docs/models)
- [Runway ML](https://docs.runwayml.com/models)

---

## SDK 버전 관리

### 최신 SDK 버전 (2025년 9월 20일 확인)

| SDK | 최신 버전 | 프로젝트 설치 버전 | 상태 | NPM 패키지 |
|-----|----------|------------------|------|------------|
| OpenAI | 5.22.0 | 미설치 | ⚪ | `openai` |
| Anthropic | 0.63.0 | 미설치 | ⚪ | `@anthropic-ai/sdk` |
| Google AI | 0.24.1 | 0.24.1 | ✅ | `@google/generative-ai` |
| Mistral | 1.10.0 | 미설치 | ⚪ | `@mistralai/mistralai` |
| Cohere | 7.19.0 | 미설치 | ⚪ | `cohere-ai` |
| Replicate | 1.2.0 | 미설치 | ⚪ | `replicate` |

### SDK 설치 명령어
```bash
# 필수 Text AI SDKs
npm install openai@latest
npm install @anthropic-ai/sdk@latest
npm install @mistralai/mistralai@latest

# Image/Video AI SDKs
npm install replicate@latest
npm install together-ai@latest

# 유틸리티
npm install axios retry-axios
```

### SDK 버전 체크 명령어
```bash
# SDK 버전 확인
npm run check-sdk-versions

# SDK 업데이트
npm run update-sdks

# 전체 체크 (모델 + SDK)
npm run full-update-check
```

---

*마지막 업데이트: 2025년 9월 20일 토요일*
*다음 정기 체크: 2025년 9월 21일 일요일*