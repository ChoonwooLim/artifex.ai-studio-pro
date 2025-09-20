# Google 이미지 생성 API 가이드
## 최종 업데이트: 2025년 9월 20일

## 📌 핵심 사실
**Google의 이미지 생성 모델들은 실제로 API를 통해 사용 가능합니다!**
- Imagen 4.0 시리즈
- Gemini Flash Image 모델들

## 🎯 사용 가능한 모델 (2025년 9월 기준)

### 1. Imagen 4 시리즈
| 모델명 | API 모델 ID | 가격 | 특징 |
|--------|-------------|------|------|
| Imagen 4.0 | `imagen-4.0-generate-001` | $0.04/이미지 | 플래그십 모델, 최고 품질 |
| Imagen 4 Fast | `imagen-4-fast` | $0.02/이미지 | 빠른 생성 속도 |
| Imagen 4 Ultra | `imagen-4-ultra` | Premium | 최고급 품질 |

### 2. Gemini Image 모델
| 모델명 | API 모델 ID | 가격 | 특징 |
|--------|-------------|------|------|
| Gemini 2.5 Flash Image | `gemini-2.5-flash-image-preview` | $0.039/이미지 | 멀티모달, 이미지 편집 가능 |
| Gemini 2.0 Flash | `gemini-2.0-flash-exp` | - | 실험적 버전 |

## 🚀 API 사용법

### ⚠️ JavaScript SDK 제한사항 (2025년 9월 20일 기준)

**중요**: 현재 JavaScript SDK (`@google/generative-ai` v0.24.1)는 이미지 생성을 위한 `generateImages()` 메소드를 지원하지 않습니다.

#### 현재 상황:
- ❌ JavaScript SDK에는 `generateImages()` 메소드가 없음
- ❌ `responseMimeType: "image/png"`는 지원되지 않음 (text/plain, application/json 등만 허용)
- ✅ Python SDK는 `client.models.generate_images()` 메소드 지원
- ✅ Google AI Studio에서는 Imagen 4.0이 정상 작동

#### 오류 메시지:
```
[400 Bad Request] GenerateContentRequest.generation_config.response_mime_type: 
allowed mimetypes are text/plain, application/json, application/xml, 
application/yaml and text/x.enum
```

### JavaScript/TypeScript 임시 해결책

#### 향상된 플레이스홀더 생성 방식
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(apiKey);

// Imagen 4.0 대신 Gemini를 사용한 플레이스홀더 생성
async function generateImageWithFallback(prompt: string) {
  // Gemini 2.5 Flash로 상세한 이미지 설명 생성
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash" 
  });
  
  const enhancedPrompt = `Create a detailed description of an image showing: ${prompt}
    Include: composition, colors, lighting, textures, mood`;
  
  const result = await model.generateContent({
    contents: [{
      role: "user",
      parts: [{ text: enhancedPrompt }]
    }],
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7
    }
  });
  
  // 설명을 기반으로 SVG 플레이스홀더 생성
  const description = result.response.text();
  return generateEnhancedPlaceholder(prompt, description);
}
```

#### 향후 정상 작동 예정 코드 (SDK 업데이트 후)
```typescript
// 이 코드는 SDK가 업데이트되면 작동할 예정입니다
async function generateImageWithImagen(prompt: string) {
  // 향후 SDK에서 지원 예정
  const response = await genAI.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: "16:9"
    }
  });
  
  return response;
}
```

### Python 예제

```python
from google import genai
from google.genai import types

client = genai.Client()

# Imagen 4.0
response = client.models.generate_images(
    model='imagen-4.0-generate-001',
    prompt='A futuristic city at sunset',
    config=types.GenerateImagesConfig(
        number_of_images=1,
        aspect_ratio="16:9"
    )
)

# Gemini Flash Image
response = client.models.generate_content(
    model="gemini-2.5-flash-image-preview",
    contents="Generate an image of a robot",
    config=GenerateContentConfig(
        response_modalities=[Modality.IMAGE],
    )
)
```

## ⚙️ 지원되는 파라미터

### 종횡비 (Aspect Ratios)
- `1:1` - Square
- `4:3` - Fullscreen
- `3:4` - Portrait fullscreen  
- `16:9` - Widescreen
- `9:16` - Portrait widescreen

### 이미지 개수
- Imagen: 1-4개 동시 생성 가능
- Gemini: 1개씩 생성

## ⚠️ 중요 사항

1. **API 키**: Google AI Studio에서 발급받은 동일한 API 키 사용
2. **SynthID 워터마크**: 모든 생성 이미지에 비가시 디지털 워터마크 포함
3. **마이그레이션**: Gemini 2.0 Flash는 2025년 9월 26일 지원 종료 예정
4. **토큰 계산**: Gemini Flash Image는 이미지당 1290 출력 토큰 사용

## 🔗 공식 문서
- [Imagen API 문서](https://ai.google.dev/gemini-api/docs/imagen)
- [Gemini Image Generation](https://ai.google.dev/gemini-api/docs/image-generation)
- [Google AI Studio](https://aistudio.google.com)

## 💡 구현 팁

1. **모델 선택**
   - 빠른 생성: Imagen 4 Fast
   - 최고 품질: Imagen 4 Ultra
   - 멀티모달/편집: Gemini Flash Image

2. **에러 처리**
   - 401: API 키 확인
   - 404: 모델명 확인
   - 429: Rate limit - 재시도 로직 구현

3. **최적화**
   - 배치 요청으로 여러 이미지 동시 생성
   - 캐싱으로 중복 요청 방지
   - 적절한 종횡비 선택으로 품질 최적화

## 🚨 일반적인 오류와 해결법

| 오류 | 원인 | 해결 방법 |
|------|------|-----------|
| "Model not found" | 잘못된 모델명 | 정확한 모델 ID 사용 |
| "Invalid API key" | API 키 문제 | Google AI Studio에서 키 재발급 |
| "Quota exceeded" | 사용량 초과 | 요청 속도 조절 또는 유료 플랜 |

---

*이 문서는 Google의 공식 문서와 2025년 9월 최신 정보를 기반으로 작성되었습니다.*