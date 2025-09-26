
# 이미지/3D 캐릭터 생성 시스템 – CODEXRK 하이엔드 스펙 (v3.7.0)
**업데이트**: 2025-09-27
**목표**: CODEXRK(이하 코덱스)가 *즉시 개발·배포* 가능한 수준으로, 아키텍처/모듈 계약/품질 게이트/테스트/CI/CD까지 포함한 **실행 스펙**을 제공한다.
**핵심 원칙**: 모듈화, 어댑터 패턴, 재시도·폴백, 일관성 엔진, UE5 파이프라인, C2PA/워터마크, SLO 준수, 비용 가드레일, **기존 Character Creator 기능 100% 보존**.

---

## 0) 실행 한줄 요약
- **Orchestrator(서비스 허브)** + **Adapter(이미지/비디오/3D/가우시안)** + **Consistency(정체성 유지)** + **Registry(메타/권리)** + **Exporters(UE5/웹)**  
- **SLI/SLO/비용**을 코드 레벨에서 추적, 미달 시 **자동 롤백**.  
- **모노레포** + **E2E·벤치 자동화** + **권리 증빙(C2PA/워터마크)** 기본 내장.

---

## 0.5) Character Creator 통합 전략

### 기본 원칙
- **기존 기능 100% 보존**: Basic Mode에 모든 현재 기능 유지
- **코드 격리**: CODEXRK 코드는 `services/characterGeneration/codexrk/` 하위에만 작성
- **독립적 테스트**: Professional Mode는 Basic Mode와 독립적으로 테스트 가능
- **점진적 마이그레이션**: 사용자는 Basic/Professional Mode 선택 가능

### 통합 아키텍처
```
artifex.ai-studio-pro/                    # 기존 프로젝트
├── components/
│   ├── CharacterCreator.tsx              # [수정: 탭 래퍼만 추가]
│   └── character/
│       ├── CharacterCreatorBasic.tsx     # [이동: 기존 코드]
│       ├── CharacterCreatorPro.tsx       # [신규: CODEXRK UI]
│       ├── CharacterSLOMonitor.tsx       # [신규: SLO 대시보드]
│       ├── CharacterConsistencyPanel.tsx # [신규: 일관성 패널]
│       └── CharacterUE5Exporter.tsx      # [신규: UE5 익스포터]
└── services/characterGeneration/
    ├── aiCharacterGenerator.ts            # [유지: 수정 금지]
    ├── gaussianSplattingRenderer.ts      # [유지: 수정 금지]
    └── codexrk/                          # [신규: 모든 CODEXRK 코드]
        ├── orchestrator/
        ├── adapters/
        ├── consistency/
        ├── exporters/
        ├── rights/
        └── telemetry/
```

### 파일 보호 규칙
```typescript
// ❌ 수정 금지 파일
services/characterGeneration/aiCharacterGenerator.ts
services/characterGeneration/gaussianSplattingRenderer.ts
components/character/CharacterManager.tsx
components/character/CharacterPresetSelector.tsx

// ✅ 신규 생성 파일
services/characterGeneration/codexrk/*
components/character/*Pro.tsx
constants/slo.constants.ts
```

---

## 1) 모노레포 레이아웃
```
repo/
 ├─ apps/
 │   ├─ studio-web/             # React19 + R3F(Three.js r180) + Zustand
 │   └─ orchestrator-api/       # FastAPI or NestJS (택1), OpenAPI 문서 자동화
 ├─ services/
 │   ├─ image/                  # Midjourney/Flux/SD/OpenAI 이미지 어댑터
 │   ├─ video/                  # Veo/Runway/Pika 어댑터
 │   ├─ model3d/                # CSM/Meshy/Luma/Zero123 어댑터
 │   ├─ gaussian/               # Gaussian Splatting 변환/뷰어 어댑터
 │   ├─ consistency/            # 얼굴/형상/스타일 임베딩·스코어러
 │   └─ rights/                 # C2PA/워터마크/감사로그
 ├─ packages/
 │   ├─ asset-registry/         # pg + pgvector 스키마/DAO
 │   ├─ exporters/              # GLB/FBX/UDIM/UE5 규칙화
 │   └─ telemetry/              # OpenTelemetry + metrics hooks
 ├─ infra/                      # IaC(Terraform), k8s/Helm, GitHub Actions
 ├─ tests/                      # unit/integration/e2e/bench
 └─ tools/                      # CLI(ue-validate, dna-tool, bench-run)
```

### 필수 스크립트
- `pnpm dev` : studio-web + orchestrator-api 동시 기동  
- `pnpm test` : 모든 단위/통합 테스트  
- `pnpm e2e` : 샘플 브리핑 10건 E2E 실행  
- `pnpm bench` : 주간 벤치(품질·지연·비용)  
- `pnpm export:ue5` : FBX/UDIM/LOD/스켈레톤 규칙화

---

## 2) 서비스 계약(Contracts)

### 2.1 Orchestrator REST
```http
POST /v1/generate/character
Body: { brief: string, targets: ["image","3d","video"], budget?: number, consistencyRef?: string }
→ 202 { jobId }

GET /v1/jobs/{{jobId}}
→ 200 { status: "queued|running|succeeded|failed",
        artifacts: { images: ImageAsset[], model3d?: Model3D, gaussian?: GaussianCloud, videos?: VideoAsset[] },
        metrics: Metrics, costUSD: number }
```

### 2.2 공통 타입
```ts
type ImageAsset = { id: string; url: string; seed?: number; model: string; metadata: Record<string,any> };
type VideoAsset = { id: string; url: string; duration: number; hasAudio: boolean; model: string };
type Model3D   = { id: string; glb: string; fbx?: string; udim?: string[]; tris: number; skeleton?: string };
type GaussianCloud = { id: string; gsplat: string; fpsBench: number; sizeMB: number };
type Metrics = { success:boolean; ttfbMs:number; p95LatMs:number; retries:number; backendTrace: any };
```

### 2.3 Adapter 인터페이스
```ts
export interface GeneratorAdapter<I, O> {
  name: string;
  generate(input: I, opts?: Record<string,any>): Promise<O>;
  health(): Promise<"ok"|"degraded"|"down">;
}
```

**구현체 예시**
- `ImageAdapter`: midjourney, flux, sd, openai  
- `VideoAdapter`: veo, runway, pika  
- `Model3DAdapter`: csm, meshy, luma, zero123  
- `GaussianAdapter`: server-convert, web-convert

어댑터는 **재시도/서킷브레이커**(concurrency, timeout, jitter backoff) 미들웨어를 기본 포함.

### 2.4 통합 API 계약 (Character Creator Integration)

#### Basic Mode (기존 유지)
```typescript
// 기존 API 그대로 사용
await aiCharacterGenerator.generateCharacterFromText(description, options);
```

#### Professional Mode (신규)
```typescript
// Next.js API Routes
POST /api/v1/character/professional
Body: {
  brief: string,
  mode: 'professional',
  targets: ['image', '3d', 'video', 'gaussian'],
  budget?: number,
  consistencyRef?: string,
  sloEnforce: boolean
}

GET /api/v1/character/job/{id}
GET /api/v1/character/slo/status
GET /api/v1/character/metrics/dashboard
```

---

## 3) 품질 게이트 (Non‑Negotiables)

| 항목 | 기준 |
|---|---|
| **성공률** | end‑to‑end ≥ 97% (주간) |
| **지연** | brief→3D p95 ≤ 4분 |
| **일관성** | Identity score p50 ≥ 0.95, p90 ≥ 0.92 |
| **UE5** | 임포트/머티리얼/스켈레톤 100% 통과 |
| **비용** | avg ≤ $2.5/캐릭터, 세션 상한 budget cap |
| **권리** | C2PA + invisible watermark **항상 적용** |
| **관측성** | OpenTelemetry traces + metrics + logs 의무 |

**불통과 시**: 배포 파이프라인이 자동 **중단/롤백**한다.

---

## 4) 일관성 엔진 2.0
- **입력**: ref asset(or dna), 후보 asset
- **특징 임베딩**: 얼굴(landmarks+face-emb), 스타일(CLIP/BLIP), 형상(mesh/normal·curvature)  
- **스코어**: `S = 0.5*face + 0.3*style + 0.2*shape`  
- **판정**: `S ≥ 0.92 → pass`, 그 외 `review` (자동 재생성 N≤2)

CLI: `tools/dna-tool score --ref REF --cand CAND --threshold 0.92`

---

## 5) UE5/Game‑Ready 파이프라인
- **스케일**: 1uu = 1cm, **스켈레톤**: Epic Mannequin 호환 또는 리타겟 맵 제공  
- **LOD**: LOD0~2(auto), LOD0 tris 50k~120k 권장  
- **텍스처**: UDIM 1~4, 4K, PBR(MRA), 노멀: +Y, sRGB 규칙  
- **Substrate**: 피부/헤어/의상 템플릿  
- **검증 CLI**: `tools/ue-validate --fbx path --lod 3 --udim 4 --substrate`

---

## 6) 권리·메타 데이터
**Asset Card**
```json
{
  "assetId": "uuid",
  "type": "image|model3d|video|gaussian",
  "sourceModels": ["midjourney:v7","csm:prod"],
  "modelVersions": {"midjourney":"7.0","csm":"prod-2025-09"},
  "promptHash": "sha256",
  "dnaHash": "sha256",
  "seed": 12345,
  "owner": "org/twinverse",
  "license": "internal",
  "c2pa": {"signed": true, "claimUrl": "…"},
  "watermarkId": "wmk_…",
  "quality": {"consistency": 0.95, "ue5Import":"pass"},
  "costUSD": 2.34,
  "timestamps": {"created":"ISO", "completed":"ISO"}
}
```

---

## 7) 파이프라인 의사코드
```ts
async function generateCharacter(brief:string, ref?:string){
  const job = registry.createJob({brief, ref});
  try{
    const img = await imageFanout(brief);               // 멀티백엔드 경쟁
    const mdl = await model3DWithFallback(img);         // CSM → Meshy → Luma
    const gsn = await gaussian.convert(mdl);            // 가우시안 변환
    const vids= await videoOptional(brief);             // Veo/Runway/Pika(옵션)
    const score = await consistency.score(ref, mdl);    // 0~1
    const ue5ok = await exporters.validateUE5(mdl);     // true/false
    const rights = await rightsSvc.signAndMark([img,mdl,gsn,...vids]);
    const metrics = telemetry.collect(job);
    return registry.complete(job, {artifacts:{images:img, model3d:mdl, gaussian:gsn, videos:vids}, score, ue5ok, rights, metrics});
  }catch(e){
    registry.fail(job, e);
    throw e;
  }
}
```

---

## 8) 성능/비용 최적화
- **큐 기반** 버스트 흡수, **warm pool** 유지(콜드스타트<300ms)  
- **캐시 키**: `(promptHash, modelVersion, seed)` → 이미지/3D/gaussian 재사용  
- **예산 가드레일**: `budgetUSD` 초과 전 **저가 백엔드** 강등 및 해상도 하향  
- **GPU**: A100/H100 or 4090 혼합, fp16, xFormers, KTX2 압축

---

## 9) 관측성 & SLO
- **메트릭**: success_rate, e2e_latency_ms_p95, cost_per_asset_usd_avg, retry_count, backend_error_topN  
- **대시보드**: Grafana(패널 JSON 제공), SLO 규칙 알람(슬랙/이메일)  
- **릴리즈 게이트**: 최근 7일 SLO 충족 + 벤치 통과해야 `prod` 승급

---

## 10) 보안/준수
- 인증: OIDC/Passkey, mTLS 서비스간 통신, 비밀은 KMS  
- 콘텐츠 안전: 금칙어/초상권 필터 + 휴먼승인 큐  
- C2PA + Invisible WM 기본 적용, 감사로그는 append-only 저장

---

## 10.5) UI/UX 통합 가이드

### 탭 기반 모드 전환
```typescript
// components/CharacterCreator.tsx
<Tabs defaultValue="basic">
  <TabsList>
    <TabsTrigger value="basic">Basic Mode</TabsTrigger>
    <TabsTrigger value="professional">Professional Mode</TabsTrigger>
    <TabsTrigger value="slo">SLO Dashboard</TabsTrigger>
  </TabsList>
  <TabsContent value="basic">
    <CharacterCreatorBasic />  // 기존 UI 100%
  </TabsContent>
  <TabsContent value="professional">
    <CharacterCreatorPro />     // CODEXRK UI
  </TabsContent>
  <TabsContent value="slo">
    <CharacterSLOMonitor />     // 메트릭 대시보드
  </TabsContent>
</Tabs>
```

### 스타일 일관성
- 기존 Tailwind 클래스 재사용
- 색상 팔레트: gray-900, purple-600, blue-600
- 컴포넌트 높이/간격 통일
- 아이콘: lucide-react 라이브러리 사용

### i18n 키 네이밍 규칙
```json
{
  "characterCreator": {
    // 기존 키 유지
    "title": "Character Creator",

    // 신규 키는 pro 접두사
    "pro.title": "Professional Mode",
    "pro.slo.monitor": "SLO Monitor",
    "pro.consistency.score": "Consistency Score",
    "pro.ue5.export": "Export to UE5"
  }
}
```

---

## 11) CI/CD(요지)
- **PR → main**: unit + integration + lint + typecheck  
- **staging 배포** → **bench-run**(20 프리셋) → **C2PA 서명** → **승급 승인**  
- 임계 미달 시 **자동 롤백**

---

## 12) 테스트 매트릭스(발췌)
- 단위: 어댑터별 timeout/retry/오류 코드 맵핑  
- 통합: 정상/폴백/실패 루트 모두 커버  
- E2E: 샘플 10건 × backend 조합, UE5 임포트 검사 포함  
- 벤치: 주 1회, 성공률/지연/비용/일관성 분포 리포트

---

## 13) 개발자 환경 요구
- Node 20+, pnpm 9+, Python 3.11+, CUDA 12.x(옵션), Git LFS
- .env 예시: API 키/엔드포인트/모델버전/권리옵션

## 13.5) 기존 기능 보호 체크리스트

### 회귀 테스트 항목
□ Basic Mode에서 캐릭터 생성/수정/삭제 동작
□ 프리셋 모달 정상 작동
□ 이미지 생성 (fullbody/headshot/custom) 동작
□ Gaussian Splatting 렌더러 정상 작동
□ 캐릭터 내보내기/가져오기 (JSON) 동작
□ 다국어 전환 정상 작동
□ IndexedDB 데이터 호환성 유지

### 통합 테스트 항목
□ Basic/Professional Mode 전환 원활
□ 기존 API와 신규 API 독립성 확인
□ 번들 크기 증가 < 500KB
□ 페이지 로드 시간 < 2초
□ 메모리 사용량 < 500MB

---

## 14) 산출물 정의(DoD)
- OpenAPI 문서 자동 생성 & 린트 통과  
- 모든 아티팩트 **Asset Card** 기록, C2PA/WM 통과 레포트 존재  
- SLO 리포트 & 그래프 포함  
- UE5 검증 CLI 통과 & 샘플 프로젝트로 로딩 확인

---

## 15) 샘플 OpenAPI 스니펫
```yaml
paths:
  /v1/generate/character:
    post:
      summary: Generate character with multi-backend orchestration
      requestBody:
        required: true
      responses:
        "202":
          description: Accepted
  /v1/jobs/{{jobId}}:
    get:
      responses:
        "200":
          description: Job status and artifacts
```
