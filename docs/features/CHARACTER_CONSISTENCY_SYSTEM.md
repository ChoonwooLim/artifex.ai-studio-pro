# 캐릭터 일관성 시스템 (Character Consistency System)

## 📌 개요

### 문제 정의
현재 스토리보드 생성 시 각 장면마다 완전히 다른 캐릭터가 나타나는 문제가 있어, 실제 프로덕션에서 사용할 수 없는 수준의 결과물이 생성되고 있습니다.

### 해결 목표
- 스토리보드 전체에 걸쳐 동일한 캐릭터 외모 유지
- 주인공과 조연 캐릭터의 명확한 구분
- 캐릭터 레퍼런스 이미지 생성 및 활용
- 재사용 가능한 캐릭터 라이브러리 구축

## 🏗️ 시스템 아키텍처

### 1. 데이터 구조

#### 1.1 캐릭터 인터페이스
```typescript
export interface Character {
    id: string;                          // 고유 식별자
    name: string;                         // 캐릭터 이름
    role: 'protagonist' | 'supporting' | 'extra';  // 역할
    physicalDescription: string;          // 외모 상세 설명
    clothingDescription: string;          // 의상 설명
    personalityTraits?: string;           // 성격 특징 (선택)
    referenceImageUrl?: string;           // 레퍼런스 이미지 URL
    consistencyPrompt?: string;           // 일관성 유지용 고정 프롬프트
    identityMarkers?: string[];           // 특징적 외모 표식 (흉터, 문신 등)
}
```

#### 1.2 캐릭터셋 인터페이스
```typescript
export interface CharacterSet {
    id: string;                    // 캐릭터셋 ID
    name: string;                   // 캐릭터셋 이름
    description?: string;           // 설명
    characters: Character[];        // 포함된 캐릭터 배열
    genre?: string;                 // 장르 (판타지, SF, 현대물 등)
    createdAt: Date;               // 생성 일시
    updatedAt: Date;               // 수정 일시
}
```

#### 1.3 확장된 StoryboardConfig
```typescript
export interface StoryboardConfig {
    // ... 기존 필드들 ...
    
    // 캐릭터 관련 추가 필드
    characterSetId?: string;        // 선택된 캐릭터셋 ID
    characters?: Character[];        // 사용할 캐릭터 배열
    useCharacterConsistency: boolean;  // 캐릭터 일관성 사용 여부
    characterStyle?: 'realistic' | 'anime' | 'cartoon' | 'artistic';  // 캐릭터 스타일
}
```

### 2. 컴포넌트 구조

#### 2.1 CharacterManager 컴포넌트
**위치**: `components/character/CharacterManager.tsx`

**주요 기능**:
- 캐릭터 추가/수정/삭제
- 캐릭터별 레퍼런스 이미지 생성
- 캐릭터셋 저장 및 불러오기
- 드래그 앤 드롭으로 순서 변경

**Props**:
```typescript
interface CharacterManagerProps {
    characters: Character[];
    onCharactersUpdate: (characters: Character[]) => void;
    onGenerateCharacterImage?: (character: Character) => Promise<string>;
    onSaveCharacterSet?: (name: string) => Promise<void>;
    onLoadCharacterSet?: () => Promise<CharacterSet[]>;
}
```

#### 2.2 CharacterCard 컴포넌트
**위치**: `components/character/CharacterCard.tsx`

**주요 기능**:
- 개별 캐릭터 정보 표시
- 인라인 편집 기능
- 레퍼런스 이미지 미리보기
- Quick actions (복제, 삭제)

#### 2.3 CharacterCreationWizard 컴포넌트
**위치**: `components/character/CharacterCreationWizard.tsx`

**주요 기능**:
- 단계별 캐릭터 생성 가이드
- AI 지원 캐릭터 설명 생성
- 템플릿 기반 빠른 생성
- 자동 일관성 프롬프트 생성

### 3. 서비스 레이어

#### 3.1 CharacterConsistencyService
**위치**: `services/characterConsistencyService.ts`

**주요 메소드**:
```typescript
class CharacterConsistencyService {
    // 캐릭터 일관성 프롬프트 생성
    generateConsistencyPrompt(character: Character): string;
    
    // 장면 설명에 캐릭터 정보 주입
    injectCharacterDetails(
        sceneDescription: string,
        characters: Character[]
    ): string;
    
    // 캐릭터 레퍼런스 이미지 생성
    async generateReferenceImage(
        character: Character,
        style: string
    ): Promise<string>;
    
    // 캐릭터 인식 및 교체
    detectAndReplaceCharacterMentions(
        text: string,
        characters: Character[]
    ): string;
    
    // 일관성 검증
    validateCharacterConsistency(
        scenes: StoryboardPanel[],
        characters: Character[]
    ): ConsistencyReport;
}
```

#### 3.2 CharacterStorageService
**위치**: `services/characterStorageService.ts`

**주요 메소드**:
```typescript
class CharacterStorageService {
    // IndexedDB 저장/조회
    async saveCharacterSet(characterSet: CharacterSet): Promise<void>;
    async loadCharacterSets(): Promise<CharacterSet[]>;
    async deleteCharacterSet(id: string): Promise<void>;
    
    // 템플릿 관리
    async getCharacterTemplates(): Promise<CharacterTemplate[]>;
    async saveAsTemplate(character: Character): Promise<void>;
}
```

### 4. 프롬프트 엔지니어링 전략

#### 4.1 캐릭터 설명 표준화
```
[CHARACTER_NAME]:
- Age: [AGE]
- Gender: [GENDER]
- Height: [HEIGHT]
- Build: [BUILD]
- Hair: [HAIR_DESCRIPTION]
- Eyes: [EYE_DESCRIPTION]
- Distinguishing features: [UNIQUE_FEATURES]
- Clothing: [CLOTHING_DESCRIPTION]
- Always depicted as: [CONSISTENCY_MARKERS]
```

#### 4.2 장면별 캐릭터 주입 패턴
```
Scene: [SCENE_DESCRIPTION]
Characters in scene:
- [CHARACTER_NAME] (EXACT APPEARANCE AS DEFINED: [CONSISTENCY_PROMPT])
- [CHARACTER_NAME2] (EXACT APPEARANCE AS DEFINED: [CONSISTENCY_PROMPT2])

CRITICAL: Maintain EXACT character appearance as defined above.
```

#### 4.3 이미지 생성 강화 프롬프트
```
[ORIGINAL_SCENE_DESCRIPTION]

CHARACTER CONSISTENCY REQUIREMENTS:
[CHARACTER_NAME] MUST appear EXACTLY as:
- [DETAILED_PHYSICAL_DESCRIPTION]
- Wearing: [EXACT_CLOTHING_DESCRIPTION]
- Key identifiers: [UNIQUE_MARKERS]

Style: [VISUAL_STYLE], consistent character design
```

## 🔄 구현 워크플로우

### Phase 1: 기초 구조 (Day 1)
1. ✅ 타입 정의 추가 (`types.ts`)
2. ✅ 데이터베이스 스키마 업데이트 (`db.ts`)
3. ✅ 기본 서비스 클래스 생성

### Phase 2: UI 컴포넌트 (Day 2-3)
1. ✅ CharacterCard 컴포넌트 개발
2. ✅ CharacterManager 컴포넌트 개발
3. ✅ CharacterCreationWizard 개발
4. ✅ StoryboardInputForm 통합

### Phase 3: 서비스 로직 (Day 4-5)
1. ✅ CharacterConsistencyService 구현
2. ✅ CharacterStorageService 구현
3. ✅ 프롬프트 생성 로직 최적화

### Phase 4: 통합 및 테스트 (Day 6-7)
1. ✅ geminiService.ts 수정
2. ✅ 이미지 생성 파이프라인 수정
3. ✅ 엔드투엔드 테스트
4. ✅ 성능 최적화

## 📊 성능 지표

### 목표 지표
- **캐릭터 일관성**: 95% 이상 동일 캐릭터로 인식
- **생성 시간 증가**: 최대 10% 이내
- **메모리 사용**: 캐릭터당 최대 2MB
- **저장 용량**: 캐릭터셋당 최대 10MB

### 측정 방법
- A/B 테스트로 일관성 평가
- 사용자 피드백 수집
- 이미지 유사도 분석 (SSIM, perceptual hash)

## 🚀 사용 시나리오

### 시나리오 1: 신규 스토리보드 생성
1. 사용자가 스토리 아이디어 입력
2. "캐릭터 설정" 섹션 열기
3. 주인공 및 조연 캐릭터 정의
4. 각 캐릭터별 레퍼런스 이미지 생성
5. 스토리보드 생성 (캐릭터 정보 포함)
6. 모든 장면에서 동일한 캐릭터 출력

### 시나리오 2: 저장된 캐릭터셋 활용
1. "캐릭터 라이브러리" 열기
2. 이전에 생성한 캐릭터셋 선택
3. 필요시 캐릭터 수정
4. 새 스토리에 적용

### 시나리오 3: AI 자동 캐릭터 추출
1. 스토리 아이디어 입력
2. "캐릭터 자동 추출" 버튼 클릭
3. AI가 스토리에서 캐릭터 식별
4. 자동 생성된 캐릭터 정보 검토/수정
5. 스토리보드 생성

## 🎨 UI/UX 디자인 가이드라인

### 레이아웃
- 캐릭터 매니저는 접을 수 있는 섹션으로 구현
- 드래그 앤 드롭으로 캐릭터 순서 변경
- 캐릭터 카드는 그리드 레이아웃 (모바일: 1열, 데스크톱: 2-3열)

### 인터랙션
- 실시간 미리보기 (캐릭터 설명 입력 시)
- 자동 저장 (5초 디바운스)
- 단축키 지원 (Ctrl+N: 새 캐릭터, Ctrl+S: 저장)

### 시각적 피드백
- 캐릭터 역할별 색상 코딩
  - 주인공: 골드/노란색 보더
  - 조연: 실버/회색 보더
  - 엑스트라: 기본 보더
- 레퍼런스 이미지 생성 중 로딩 애니메이션
- 일관성 검증 상태 표시 (체크마크/경고)

## 🔐 보안 및 프라이버시

### 데이터 보호
- 캐릭터 데이터는 로컬 IndexedDB에만 저장
- 레퍼런스 이미지는 base64로 인코딩하여 저장
- 클라우드 동기화 시 암호화 적용 (향후)

### API 키 관리
- 캐릭터 이미지 생성 시 사용자 API 키 사용
- Rate limiting 적용
- 실패 시 재시도 로직 (exponential backoff)

## 📝 개발 체크리스트

### 필수 구현 사항
- [ ] Character 타입 정의
- [ ] CharacterSet 타입 정의
- [ ] CharacterManager 컴포넌트
- [ ] CharacterCard 컴포넌트
- [ ] CharacterConsistencyService
- [ ] StoryboardConfig 확장
- [ ] geminiService 통합
- [ ] 레퍼런스 이미지 생성
- [ ] 캐릭터셋 저장/불러오기

### 선택적 개선 사항
- [ ] AI 자동 캐릭터 추출
- [ ] 캐릭터 템플릿 라이브러리
- [ ] 이미지 유사도 검증
- [ ] 캐릭터 히스토리 추적
- [ ] 다국어 캐릭터 설명 지원

## 🐛 알려진 제한사항

### 현재 제한사항
1. 이미지 생성 AI의 프롬프트 이해도에 따른 일관성 편차
2. 극단적인 포즈나 각도에서의 캐릭터 일관성 저하
3. 의상 변경 시나리오 미지원
4. 나이 변화 표현 어려움

### 해결 방안
1. 더 상세한 프롬프트 엔지니어링
2. Multiple seed 기법 활용 (향후)
3. Face swap 기술 도입 검토 (향후)
4. ControlNet 등 고급 기법 활용 (향후)

## 📚 참고 자료

### 관련 연구
- "Consistent Character Generation in Diffusion Models" (2024)
- "Prompt Engineering for Character Consistency" (2023)
- "Identity-Preserving Image Generation Techniques" (2024)

### 벤치마킹 서비스
- Midjourney Character Reference
- Stable Diffusion Character LoRA
- DALL-E 3 Consistency Features

## 🔄 업데이트 이력

### 2025-09-21 (초안)
- 시스템 설계 문서 작성
- 구현 계획 수립
- Phase 1 개발 시작

---

*이 문서는 Artifex.AI Studio Pro의 캐릭터 일관성 시스템 구현을 위한 상세 가이드입니다.*
*최종 업데이트: 2025년 9월 21일*