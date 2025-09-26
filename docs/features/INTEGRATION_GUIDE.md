# Character Creator - CODEXRK 통합 가이드

## 🎯 통합 철학
"기존 기능을 100% 보존하면서 엔터프라이즈 기능을 추가한다"

## 📋 목차
- [코드 구조](#코드-구조)
- [통합 패턴](#통합-패턴)
- [테스트 전략](#테스트-전략)
- [주의사항](#주의사항)
- [성공 지표](#성공-지표)

---

## 📁 코드 구조

### 기존 코드 (수정 금지)
```
services/characterGeneration/
├── aiCharacterGenerator.ts         ❌ 수정 금지
├── gaussianSplattingRenderer.ts    ❌ 수정 금지

components/character/
├── CharacterManager.tsx             ❌ 수정 금지
├── CharacterPresetSelector.tsx      ❌ 수정 금지
├── CharacterPresetModal.tsx         ❌ 수정 금지
├── CharacterCard.tsx                ❌ 수정 금지
```

### 신규 코드 (CODEXRK)
```
services/characterGeneration/codexrk/
├── orchestrator/                    ✅ 모든 신규 코드
│   ├── CharacterOrchestrator.ts
│   ├── JobManager.ts
│   └── SLOEnforcer.ts
├── adapters/
│   ├── image/
│   ├── video/
│   ├── model3d/
│   └── gaussian/
├── consistency/
├── exporters/
├── rights/
└── telemetry/

components/character/
├── CharacterCreatorBasic.tsx       ✅ 기존 코드 이동
├── CharacterCreatorPro.tsx         ✅ 신규 Professional Mode
├── CharacterSLOMonitorPro.tsx      ✅ SLO 대시보드
├── CharacterConsistencyPanelPro.tsx ✅ 일관성 패널
└── CharacterUE5ExporterPro.tsx     ✅ UE5 익스포터
```

---

## 🔧 통합 패턴

### 1. UI 통합 패턴
```typescript
// CharacterCreator.tsx - 최소 수정 (탭 래퍼만 추가)
import React, { useState } from 'react';
import { CharacterCreatorBasic } from './character/CharacterCreatorBasic';
import { CharacterCreatorPro } from './character/CharacterCreatorPro';
import { CharacterSLOMonitorPro } from './character/CharacterSLOMonitorPro';

export const CharacterCreator = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'professional' | 'slo'>('basic');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto p-6">
        {/* 탭 네비게이션 */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('basic')}
            className={`pb-2 px-4 ${activeTab === 'basic'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'}`}
          >
            Basic Mode
          </button>
          <button
            onClick={() => setActiveTab('professional')}
            className={`pb-2 px-4 ${activeTab === 'professional'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'}`}
          >
            Professional Mode
          </button>
          <button
            onClick={() => setActiveTab('slo')}
            className={`pb-2 px-4 ${activeTab === 'slo'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'}`}
          >
            SLO Dashboard
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'basic' && <CharacterCreatorBasic />}
        {activeTab === 'professional' && <CharacterCreatorPro />}
        {activeTab === 'slo' && <CharacterSLOMonitorPro />}
      </div>
    </div>
  );
};
```

### 2. 서비스 재사용 패턴
```typescript
// codexrk/orchestrator/CharacterOrchestrator.ts
import { AICharacterGenerator } from '../../aiCharacterGenerator';
import { GaussianSplattingRenderer } from '../../gaussianSplattingRenderer';
import { SLOEnforcer } from './SLOEnforcer';
import { CHARACTER_SLO } from '../../../constants/slo.constants';

export class CharacterOrchestrator {
  constructor(
    private legacyGenerator: AICharacterGenerator,     // 기존 서비스 재사용
    private gaussianRenderer: GaussianSplattingRenderer, // 기존 렌더러 재사용
    private sloEnforcer: SLOEnforcer,                  // 신규 SLO 강제
  ) {}

  // 기존 서비스를 활용한 생성
  async generateWithLegacy(prompt: string) {
    // SLO 체크
    if (!this.sloEnforcer.canProceed()) {
      throw new Error('SLO violation - generation blocked');
    }

    // 기존 서비스 활용
    const result = await this.legacyGenerator.generateCharacterFromText(prompt);

    // SLO 메트릭 기록
    await this.sloEnforcer.recordMetrics({
      success: true,
      latencyMs: Date.now() - startTime,
      cost: result.cost.total
    });

    return result;
  }

  // Professional Mode 전용 파이프라인
  async generateProfessional(brief: string, options: ProfessionalOptions) {
    // 신규 파이프라인 구현
    // 하지만 내부적으로 기존 서비스도 활용 가능
  }
}
```

### 3. 데이터 격리 패턴
```typescript
// Basic Mode: IndexedDB (기존)
import { idb } from '../../services/db';

async function saveCharacterBasic(character: Character) {
  await idb.characters.add(character);
}

// Professional Mode: PostgreSQL (신규)
import { pgClient } from '../codexrk/registry/postgres';

async function saveCharacterPro(job: CharacterJob) {
  await pgClient.query(
    'INSERT INTO character_jobs (id, brief, status) VALUES ($1, $2, $3)',
    [job.id, job.brief, job.status]
  );
}

// 통합 뷰에서만 합쳐서 표시
async function getAllCharacters() {
  const basicCharacters = await idb.characters.getAll();
  const proJobs = await pgClient.query('SELECT * FROM character_jobs WHERE status = $1', ['completed']);

  return {
    basic: basicCharacters,
    professional: proJobs.rows
  };
}
```

### 4. API 라우트 분리 패턴
```typescript
// pages/api/character/basic.ts (기존 API)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 기존 API 로직 그대로
  const result = await aiCharacterGenerator.generateCharacterFromText(req.body.description);
  res.json(result);
}

// pages/api/v1/character/professional.ts (신규 API)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Professional Mode API
  const orchestrator = new CharacterOrchestrator();
  const jobId = await orchestrator.createJob(req.body);
  res.status(202).json({ jobId });
}
```

### 5. 스타일 재사용 패턴
```typescript
// 기존 스타일 클래스 재사용
const buttonClasses = "px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700";
const cardClasses = "bg-gray-800 rounded-lg p-6 border border-gray-700";

// Professional Mode에서도 동일한 스타일 사용
export const CharacterCreatorPro = () => {
  return (
    <div className={cardClasses}> {/* 기존 스타일 재사용 */}
      <button className={buttonClasses}>Generate Professional</button>
    </div>
  );
};
```

---

## 🧪 테스트 전략

### Basic Mode 회귀 테스트
```typescript
// tests/character/regression.test.ts
describe('Basic Mode Regression Tests', () => {
  it('should preserve all existing features', async () => {
    // 1. 캐릭터 생성
    const character = await createCharacter({ name: 'Test' });
    expect(character).toBeDefined();

    // 2. 프리셋 적용
    const withPreset = await applyPreset(character, 'warrior');
    expect(withPreset.physicalDescription).toContain('warrior');

    // 3. 이미지 생성
    const image = await generateImage(character, 'fullbody');
    expect(image.url).toBeTruthy();

    // 4. 내보내기
    const exported = await exportCharacter(character);
    expect(exported).toMatchSnapshot();

    // 5. 가져오기
    const imported = await importCharacter(exported);
    expect(imported).toEqual(character);
  });

  it('should maintain IndexedDB compatibility', async () => {
    const oldData = await idb.characters.getAll();
    expect(oldData).toBeDefined();
    expect(oldData.length).toBeGreaterThanOrEqual(0);
  });
});
```

### Professional Mode 테스트
```typescript
// tests/characterPro/slo.test.ts
describe('Professional Mode SLO Tests', () => {
  it('should enforce SLO constraints', async () => {
    const metrics = await runBenchmark(20);

    expect(metrics.successRate).toBeGreaterThanOrEqual(CHARACTER_SLO.SUCCESS_RATE_WEEKLY);
    expect(metrics.p95Latency).toBeLessThanOrEqual(CHARACTER_SLO.P95_GENERATION_TIME_MS);
    expect(metrics.avgCost).toBeLessThanOrEqual(CHARACTER_SLO.AVG_COST_USD);
  });

  it('should maintain consistency score', async () => {
    const result = await generateWithConsistency();
    expect(result.consistencyScore).toBeGreaterThanOrEqual(CHARACTER_SLO.CONSISTENCY_P90);
  });

  it('should validate UE5 export', async () => {
    const exported = await exportToUE5(testModel);
    const validation = await validateUE5(exported);
    expect(validation.passed).toBe(true);
  });
});
```

### 통합 테스트
```typescript
// tests/integration/mode-switching.test.ts
describe('Mode Switching Tests', () => {
  it('should switch between modes without data loss', async () => {
    // Basic Mode에서 생성
    const basicCharacter = await createInBasicMode({ name: 'Test' });

    // Professional Mode로 전환
    await switchToProfessionalMode();

    // Professional Mode에서 생성
    const proJob = await createInProfessionalMode({ brief: 'Test character' });

    // Basic Mode로 돌아가기
    await switchToBasicMode();

    // 기존 데이터 확인
    const retrieved = await getCharacter(basicCharacter.id);
    expect(retrieved).toEqual(basicCharacter);
  });
});
```

---

## ⚠️ 주의사항

### 절대 하지 말아야 할 것
1. ❌ `aiCharacterGenerator.ts` 수정
2. ❌ `gaussianSplattingRenderer.ts` 수정
3. ❌ 기존 IndexedDB 스키마 변경
4. ❌ Basic Mode UI 레이아웃 변경
5. ❌ 기존 API 엔드포인트 변경
6. ❌ 기존 컴포넌트의 props 인터페이스 변경
7. ❌ 기존 i18n 키 변경 (추가만 가능)

### 반드시 해야 할 것
1. ✅ 모든 신규 코드는 `codexrk/` 폴더에
2. ✅ Pro 컴포넌트는 `*Pro.tsx` 네이밍
3. ✅ Basic Mode 테스트 100% 통과 확인
4. ✅ git commit 메시지에 `[CODEXRK]` 태그 포함
5. ✅ 변경사항을 `CHANGELOG.md`에 기록
6. ✅ PR 생성시 체크리스트 완성
7. ✅ 코드 리뷰어에게 통합 영향도 명시

### Git 브랜치 전략
```bash
# 브랜치 생성
git checkout -b feature/codexrk-integration

# 커밋 메시지 규칙
git commit -m "[CODEXRK] feat: Add Professional Mode orchestrator"
git commit -m "[CODEXRK] test: Add Basic Mode regression tests"
git commit -m "[CODEXRK] docs: Update integration guide"

# PR 제목
"[CODEXRK] Character Creator Professional Mode Integration"
```

### 환경 변수 관리
```env
# .env.sample

# === Basic Mode (기존) ===
VITE_GEMINI_API_KEY=your-gemini-key
VITE_OPENAI_API_KEY=your-openai-key

# === Professional Mode (신규) ===
# Image Generation
VITE_MIDJOURNEY_API_KEY=
VITE_FLUX_API_KEY=
VITE_STABILITY_API_KEY=

# 3D Generation
VITE_CSM_API_KEY=
VITE_MESHY_API_KEY=
VITE_LUMA_API_KEY=

# Video Generation
VITE_VEO_API_KEY=
VITE_RUNWAY_API_KEY=
VITE_PIKA_API_KEY=

# Rights Management
VITE_C2PA_API_KEY=
VITE_WATERMARK_SERVICE_URL=

# Database (Professional Mode)
DATABASE_URL=postgresql://user:password@localhost/artifex_pro
```

---

## 📊 성공 지표

### 기능 보존 지표
| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| Basic Mode 회귀 버그 | 0개 | 자동화 테스트 |
| 기존 API 호환성 | 100% | Integration 테스트 |
| IndexedDB 데이터 호환 | 100% | Migration 테스트 |
| UI 레이아웃 일관성 | 100% | Visual regression 테스트 |

### 성능 지표
| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 번들 크기 증가 | < 500KB | webpack-bundle-analyzer |
| 초기 로드 시간 | < 2초 | Lighthouse |
| 메모리 사용량 | < 500MB | Chrome DevTools |
| Basic Mode 성능 영향 | < 5% | Performance profiler |

### Professional Mode SLO
| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 성공률 | ≥ 97% | 주간 메트릭 |
| p95 생성 시간 | ≤ 4분 | OpenTelemetry |
| 일관성 점수 | ≥ 0.92 | Consistency Engine |
| UE5 호환성 | 100% | Validator CLI |
| 평균 비용 | ≤ $2.5 | Cost tracker |

### 코드 품질 지표
| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 코드 커버리지 | > 80% | Jest coverage |
| TypeScript strict | 100% | tsc --noEmit |
| Lint 오류 | 0개 | ESLint |
| 코드 중복 | < 5% | jscpd |

---

## 🚀 빠른 시작 가이드

### 1. 환경 설정
```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.sample .env
# .env 파일 편집하여 API 키 입력
```

### 2. 개발 서버 실행
```bash
# Basic Mode만 실행
pnpm dev

# Professional Mode 포함 실행
pnpm dev:pro
```

### 3. 테스트 실행
```bash
# 모든 테스트
pnpm test

# Basic Mode 회귀 테스트만
pnpm test:regression

# Professional Mode 테스트만
pnpm test:pro

# SLO 검증
pnpm test:slo
```

### 4. 빌드
```bash
# 프로덕션 빌드
pnpm build

# 번들 분석
pnpm analyze
```

---

## 📚 추가 문서

- [CODEXRK 스펙](./IMAGE_3D_CHARACTER_GENERATION_CODEXRK.md)
- [CODEXRK 프롬프트](./CODEXRK_PROMPT.txt)
- [CODEXRK 작업 목록](./TASKS_CODEXRK.md)
- [구현 체크리스트](./CODEXRK_IMPLEMENTATION_CHECKLIST.md)
- [메인 프로젝트 가이드](../CLAUDE.md)

---

*마지막 업데이트: 2025-09-27*