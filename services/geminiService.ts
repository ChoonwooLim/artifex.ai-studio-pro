import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AspectRatio, DescriptionConfig, StoryboardConfig, VisualStyle, MediaArtStyle, VisualArtEffect, MediaArtSourceImage, MediaArtStyleParams, DataCompositionParams, DigitalNatureParams, AiDataSculptureParams, LightAndSpaceParams, KineticMirrorsParams, GenerativeBotanyParams, QuantumPhantasmParams, ArchitecturalProjectionParams } from "../types";
import { aiService } from "./aiService";

// Dynamic API key initialization to support both environment variables and localStorage
let genAI: GoogleGenerativeAI | null = null;

const getGenAI = (): GoogleGenerativeAI => {
    // Always check for the latest API key
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || 
                   import.meta.env.VITE_GEMINI_API_KEY || 
                   localStorage.getItem('apiKey_google');
    
    if (!apiKey) {
        throw new Error('Google AI API key not configured. Please add your API key in the API Keys settings.');
    }
    
    // Create new instance if needed or if key changed
    if (!genAI || genAI.apiKey !== apiKey) {
        genAI = new GoogleGenerativeAI(apiKey);
    }
    
    return genAI;
};

const aspectRatiosMap: Record<AspectRatio, string> = {
    [AspectRatio.LANDSCAPE]: "16:9",
    [AspectRatio.PORTRAIT]: "9:16",
    [AspectRatio.SQUARE]: "1:1",
    [AspectRatio.VERTICAL]: "3:4",
    [AspectRatio.CLASSIC]: "4:3",
};

// Helper to safely parse JSON from model responses which might include markdown
const safeJsonParse = (jsonString: string) => {
    try {
        // Remove markdown code block markers if present
        const trimmedString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
        return JSON.parse(trimmedString);
    } catch (e) {
        try {
            // Fix malformed scientific notation (e.g., 1.000000e+000000...)
            const fixedString = jsonString.replace(
                /(\d+)\.0+e\+0+/gi,
                (match, num) => num
            );
            
            // Try parsing the fixed string
            const trimmedFixed = fixedString.replace(/^```json\n/, '').replace(/\n```$/, '');
            return JSON.parse(trimmedFixed);
        } catch (e2) {
            try {
                // Fallback for cases where the string is not perfectly formatted
                const firstBracket = jsonString.indexOf('[');
                const lastBracket = jsonString.lastIndexOf(']');
                const firstBrace = jsonString.indexOf('{');
                const lastBrace = jsonString.lastIndexOf('}');
                
                let start = -1;
                let end = -1;

                if (firstBracket !== -1 && lastBracket !== -1) {
                    start = firstBracket;
                    end = lastBracket;
                } else if (firstBrace !== -1 && lastBrace !== -1) {
                    start = firstBrace;
                    end = lastBrace;
                }

                if (start !== -1 && end !== -1) {
                    const nestedJson = jsonString.substring(start, end + 1);
                    // Apply the scientific notation fix here too
                    const fixedNested = nestedJson.replace(
                        /(\d+)\.0+e\+0+/gi,
                        (match, num) => num
                    );
                    return JSON.parse(fixedNested);
                }
                return null;
            } catch (e3) {
                console.error("Failed to parse JSON:", jsonString, e3);
                return null;
            }
        }
    }
};

// Helper to get base64 data and mime type from a MediaArtSourceImage
const getImageData = async (sourceImage: MediaArtSourceImage): Promise<{data: string, mimeType: string}> => {
    if (sourceImage.url.startsWith('data:')) {
        return {
            data: sourceImage.url.split(',')[1],
            mimeType: sourceImage.url.match(/:(.*?);/)?.[1] || 'image/jpeg'
        };
    }
    
    // Handle remote URL by fetching and converting to base64
    const response = await fetch(sourceImage.url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${sourceImage.url}`);
    }
    const blob = await response.blob();
    
    const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

    return {
        data,
        mimeType: blob.type || 'image/jpeg'
    };
};

export const generateDescription = async (config: DescriptionConfig): Promise<string> => {
    const prompt = `Generate a compelling product description.
    - Product Name: ${config.productName}
    - Key Features: ${config.keyFeatures}
    - Target Audience: ${config.targetAudience}
    - Tone: ${config.tone}
    - Language: ${config.language}
    
    The description should be concise, engaging, and highlight the key benefits for the target audience. Do not include a title or header.`;
    
    const model = getGenAI().getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

const storyboardPanelSchema = {
    type: SchemaType.OBJECT,
    properties: {
        sceneNumber: { type: SchemaType.STRING, description: 'Scene number as a string (e.g., "1", "2", "3")' },
        description: { type: SchemaType.STRING, description: 'A detailed, visually descriptive paragraph for this scene. Describe the camera shot, setting, action, and mood. This will be used as a prompt for an image generation model.' },
    }
};

export const generateStoryboard = async (idea: string, config: StoryboardConfig): Promise<{ description: string }[]> => {
    console.log('generateStoryboard called with config:', config);
    console.log('Scene count requested:', config.sceneCount);
    console.log('AspectRatio value:', config.aspectRatio);
    console.log('AspectRatio type:', typeof config.aspectRatio);
    
    const prompt = `Create a storyboard for a short video based on this idea: "${idea}".

    **Instructions:**
    1.  Generate exactly ${config.sceneCount} scenes. NO MORE, NO LESS than ${config.sceneCount} scenes.
    2.  The overall mood should be ${config.mood}.
    3.  The visual style should be ${config.visualStyle}.
    4.  The total video length is approximately ${config.videoLength}, so pace the scenes accordingly.
    5.  The output language for the descriptions must be ${config.descriptionLanguage}.
    6.  For each scene, provide a detailed, visually rich description suitable for an AI image generation model. Describe the camera angle, subject, setting, action, and atmosphere.
    7.  IMPORTANT: Use simple scene numbers like "1", "2", "3" etc. Do not use scientific notation or decimal numbers.
    8.  CRITICAL: You must return EXACTLY ${config.sceneCount} scenes, not more, not less.
    
    Return the result as a JSON array of EXACTLY ${config.sceneCount} objects with sceneNumber and description fields.`;

    try {
        // Try with structured output first
        const model = getGenAI().getGenerativeModel({ 
            model: config.textModel,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.ARRAY,
                    items: storyboardPanelSchema,
                },
            }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        const parsed = safeJsonParse(response.text());
        if (parsed && Array.isArray(parsed)) {
            console.log('Generated scenes count:', parsed.length);
            // Ensure we only return the requested number of scenes
            const limitedScenes = parsed.slice(0, config.sceneCount);
            console.log('Returning scenes count:', limitedScenes.length);
            return limitedScenes.map(p => ({ description: p.description }));
        }
    } catch (error) {
        console.error("Structured output failed, trying fallback:", error);
    }
    
    // Fallback: Try without structured output
    try {
        const fallbackPrompt = prompt + `
        
        Format the output as a simple JSON array like this:
        [
            {"sceneNumber": "1", "description": "..."},
            {"sceneNumber": "2", "description": "..."}
        ]`;
        
        const fallbackModel = getGenAI().getGenerativeModel({ 
            model: config.textModel
        });
        
        const result = await fallbackModel.generateContent(fallbackPrompt);
        const response = await result.response;
        
        const parsed = safeJsonParse(response.text());
        if (parsed && Array.isArray(parsed)) {
            console.log('Generated scenes count:', parsed.length);
            // Ensure we only return the requested number of scenes
            const limitedScenes = parsed.slice(0, config.sceneCount);
            console.log('Returning scenes count:', limitedScenes.length);
            return limitedScenes.map(p => ({ description: p.description }));
        }
    } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
    }
    
    throw new Error("Failed to generate a valid storyboard structure after multiple attempts.");
};

export const generateDetailedStoryboard = async (originalScene: string, language: string): Promise<{ description: string }[]> => {
    const prompt = `Take the following single storyboard scene and expand it into 3 more detailed, sequential shots. Maintain the core idea of the original scene but break it down into a mini-sequence (e.g., establishing shot, medium shot, close-up).

    **Original Scene:** "${originalScene}"
    
    **Instructions:**
    1.  Create exactly 3 new, detailed scene descriptions.
    2.  The descriptions should logically follow each other.
    3.  Make each new description highly visual and suitable for an AI image generator.
    4.  The output language for the descriptions must be ${language}.
    
    Return the result as a JSON array of objects.`;

    const model = getGenAI().getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        description: { type: SchemaType.STRING, description: 'A detailed, visually descriptive paragraph for this shot.' }
                    }
                }
            }
        }
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const parsed = safeJsonParse(response.text());
    if (!parsed || !Array.isArray(parsed)) {
        throw new Error("Failed to generate a valid detailed storyboard.");
    }
    return parsed.map(p => ({ description: p.description }));
};

export const generateImageForPanel = async (description: string, config: { imageModel: string, aspectRatio: AspectRatio, visualStyle?: VisualStyle }): Promise<string> => {
    try {
        // Build image generation prompt based on visual style
        let stylePrompt = "";
        if (config.visualStyle) {
            const styleMap: Record<VisualStyle, string> = {
                [VisualStyle.PHOTOREALISTIC]: "photorealistic, high quality, professional photography",
                [VisualStyle.CINEMATIC]: "cinematic, dramatic lighting, film still, movie scene",
                [VisualStyle.ANIME]: "anime style, studio ghibli inspired, hand-drawn animation",
                [VisualStyle.COMIC_BOOK]: "comic book style, graphic novel illustration, bold colors",
                [VisualStyle.WATERCOLOR]: "watercolor painting, artistic, soft colors, traditional art",
                [VisualStyle.LOWPOLY]: "low poly 3D art, geometric shapes, minimalist design",
                [VisualStyle.RETRO_SYNTHWAVE]: "synthwave, retro 80s style, neon colors, cyberpunk aesthetic",
                [VisualStyle.SURREALIST]: "surrealist art, dreamlike, abstract, Salvador Dali inspired",
            };
            stylePrompt = styleMap[config.visualStyle] || "";
        }

        const fullPrompt = stylePrompt ? `${description}, ${stylePrompt}` : description;
        
        console.log(`Generating image with model: ${config.imageModel}`);
        console.log(`Image prompt: ${fullPrompt}`);
        
        // Try to use actual AI image generation
        try {
            // Get aspect ratio dimensions for image generation
            const aspectRatios: Record<AspectRatio, [number, number]> = {
                [AspectRatio.LANDSCAPE]: [1024, 576],  // 16:9
                [AspectRatio.PORTRAIT]: [576, 1024],   // 9:16
                [AspectRatio.SQUARE]: [1024, 1024],    // 1:1
                [AspectRatio.VERTICAL]: [768, 1024],   // 3:4
                [AspectRatio.CLASSIC]: [1024, 768],    // 4:3
            };
            
            const [width, height] = aspectRatios[config.aspectRatio] || [1024, 576];
            
            console.log('Image generation config:', {
                aspectRatio: config.aspectRatio,
                aspectRatioType: typeof config.aspectRatio,
                aspectRatioValue: AspectRatio[config.aspectRatio],
                width,
                height,
                model: config.imageModel
            });
            
            // Call the actual AI image generation service
            const images = await aiService.generateImage({
                prompt: fullPrompt,
                model: config.imageModel || 'gemini-2.5-flash-image',
                width,
                height,
                aspectRatio: config.aspectRatio
            });
            
            // Return the first generated image
            if (images && images.length > 0) {
                console.log("Image generated successfully with model:", config.imageModel);
                return images[0];
            }
            throw new Error("No image generated");
        } catch (imageError) {
            console.error("Actual image generation failed:", imageError);
            console.log("Falling back to placeholder image");
            
            // If actual generation fails, generate a better placeholder
            const genAI = getGenAI();
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash"
            });
            
            // Generate a more detailed image prompt using Gemini
            const enhancedPromptResult = await model.generateContent({
                contents: [{
                    role: 'user',
                    parts: [{ 
                        text: `Create a detailed image generation prompt for: ${fullPrompt}. 
                        Include specific details about composition, lighting, colors, and style. 
                        Keep it concise but visually rich.`
                    }]
                }]
            });
            
            const enhancedPrompt = enhancedPromptResult.response.text();
            console.info("Enhanced image prompt generated:", enhancedPrompt.substring(0, 100) + "...");
        }
        
        // Create a canvas for generating a proper placeholder image
        const canvas = document.createElement('canvas');
        const aspectRatios: Record<AspectRatio, [number, number]> = {
            [AspectRatio.LANDSCAPE]: [800, 450],
            [AspectRatio.PORTRAIT]: [450, 800],
            [AspectRatio.SQUARE]: [600, 600],
            [AspectRatio.VERTICAL]: [450, 600],
            [AspectRatio.CLASSIC]: [600, 450],
        };
        
        const [width, height] = aspectRatios[config.aspectRatio] || [800, 450];
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Canvas context not available');
        }
        
        // Create a gradient background based on visual style
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        
        if (config.visualStyle === VisualStyle.RETRO_SYNTHWAVE) {
            gradient.addColorStop(0, '#FF006E');
            gradient.addColorStop(0.5, '#8338EC');
            gradient.addColorStop(1, '#3A86FF');
        } else if (config.visualStyle === VisualStyle.ANIME) {
            gradient.addColorStop(0, '#FFE5F1');
            gradient.addColorStop(0.5, '#FFC8DD');
            gradient.addColorStop(1, '#FFAFC5');
        } else if (config.visualStyle === VisualStyle.CINEMATIC) {
            gradient.addColorStop(0, '#0D1B2A');
            gradient.addColorStop(0.5, '#1B263B');
            gradient.addColorStop(1, '#415A77');
        } else if (config.visualStyle === VisualStyle.SURREALIST) {
            gradient.addColorStop(0, '#F72585');
            gradient.addColorStop(0.33, '#7209B7');
            gradient.addColorStop(0.66, '#3A0CA3');
            gradient.addColorStop(1, '#4361EE');
        } else if (config.visualStyle === VisualStyle.WATERCOLOR) {
            gradient.addColorStop(0, '#E3F2FD');
            gradient.addColorStop(0.5, '#90CAF9');
            gradient.addColorStop(1, '#42A5F5');
        } else {
            // Default gradient
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(0.5, '#764ba2');
            gradient.addColorStop(1, '#f093fb');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add some visual texture/pattern
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 50 + 10;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = Math.random() > 0.5 ? 'white' : 'black';
            ctx.fill();
        }
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
        
        // Add text overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText('AI Image Generation', width / 2, height / 2 - 20);
        
        ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.fillText(`${config.imageModel} • ${config.visualStyle || 'Default Style'}`, width / 2, height / 2 + 20);
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);
        
        // Convert canvas to base64
        return canvas.toDataURL('image/jpeg', 0.9);
        
    } catch (error) {
        console.error("Image generation error:", error);
        
        // Create a simple error placeholder
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            ctx.fillStyle = '#ffeeee';
            ctx.fillRect(0, 0, 400, 300);
            ctx.fillStyle = '#cc0000';
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Image Generation Failed', 200, 150);
        }
        
        return canvas.toDataURL('image/jpeg', 0.9);
    }
};

export const generateVideoForPanel = async (prompt: string, imageBase64: string, videoModel: string, isMediaArt: boolean = false): Promise<string> => {
    // Note: Gemini SDK doesn't support video generation directly
    // Return a placeholder or integrate with another video generation service
    console.warn("Video generation not implemented with Gemini SDK");
    return "data:video/mp4;base64,AAAAAA=="; // Placeholder
};

const getStylePrompt = (style: MediaArtStyle, params: MediaArtStyleParams): string => {
    switch (style) {
        case MediaArtStyle.DATA_COMPOSITION:
            const p1 = params as DataCompositionParams;
            return `The style is 'Data Composition', inspired by Ryoji Ikeda. It must feature dense, flowing data visualizations, glitch effects, and stark digital patterns. Parameters: Data Density=${p1.dataDensity}%, Glitch Intensity=${p1.glitchIntensity}%, Color Palette=${p1.colorPalette}.`;
        case MediaArtStyle.DIGITAL_NATURE:
            const p2 = params as DigitalNatureParams;
            return `The style is 'Digital Nature', inspired by teamLab. It must feature interactive particle systems that form natural elements. The scene should feel alive and responsive. Parameters: Particle System=${p2.particleSystem}, Interactivity Level=${p2.interactivity}%, Bloom Effect=${p2.bloomEffect}%.`;
        case MediaArtStyle.AI_DATA_SCULPTURE:
            const p3 = params as AiDataSculptureParams;
            return `The style is 'AI Data Sculpture', inspired by Refik Anadol. It must be a fluid, organic, and complex data visualization that resembles a living sculpture. Parameters: Fluidity=${p3.fluidity}%, Color Scheme=${p3.colorScheme}, Structural Complexity=${p3.complexity}%.`;
        case MediaArtStyle.LIGHT_AND_SPACE:
            const p4 = params as LightAndSpaceParams;
            return `The style is 'Light and Space', inspired by NONOTAK Studio. It must use geometric, structural patterns of light like beams, grids, and strobes to define the space. The mood is minimalist and intense. Parameters: Light Pattern=${p4.pattern}, Speed=${p4.speed}%, Color=${p4.color}.`;
        case MediaArtStyle.KINETIC_MIRRORS:
            const p5 = params as KineticMirrorsParams;
            return `The style is 'Kinetic Mirrors'. It should depict the original image as if reflected and fractured across a field of moving, robotic mirrors. Parameters: Fragmentation=${p5.fragmentation}%, Motion Speed=${p5.motionSpeed}%, Reflection Type=${p5.reflection}.`;
        case MediaArtStyle.GENERATIVE_BOTANY:
            const p6 = params as GenerativeBotanyParams;
            return `The style is 'Generative Botany'. It must show surreal, algorithmically-grown plants and flowers overgrowing the original image's subject. Parameters: Growth Speed=${p6.growthSpeed}%, Plant Type=${p6.plantType}, Density=${p6.density}%.`;
        case MediaArtStyle.QUANTUM_PHANTASM:
            const p7 = params as QuantumPhantasmParams;
            return `The style is 'Quantum Phantasm'. It must visualize the image as an unstable, shimmering field of quantum particles, constantly phasing in and out of existence. Parameters: Particle Size=${p7.particleSize}%, Shimmer Speed=${p7.shimmerSpeed}%, Color Palette=${p7.colorPalette}.`;
        case MediaArtStyle.ARCHITECTURAL_PROJECTION:
            const p8 = params as ArchitecturalProjectionParams;
            return `The style is 'Architectural Projection'. The image's content should be deconstructed and projection-mapped onto complex geometric structures, creating a sense of fragmented, volumetric light. Parameters: Deconstruction=${p8.deconstruction}%, Light Source=${p8.lightSource}, Texture=${p8.texture}.`;
        default:
            return '';
    }
};

export const generateMediaArtKeyframePrompts = async (sourceImage: MediaArtSourceImage, style: MediaArtStyle, params: MediaArtStyleParams, config: StoryboardConfig): Promise<string[]> => {
    const styleInstruction = getStylePrompt(style, params);
    const numberOfKeyframes = config.sceneCount + 1;

    // This prompt has been optimized to be more concise and structured, reducing the likelihood of token limit errors.
    const prompt = `
**Task**: Generate a JSON array of exactly ${numberOfKeyframes} image prompts for an animation.
**Animation Concept**: The animation starts as an abstract interpretation of the provided image ("${sourceImage.title}") and gradually transitions to become a photorealistic copy of it.

**Parameters**:
- **Core Abstract Style**: ${styleInstruction}
- **Mood**: ${config.mood}
- **Language**: ${config.descriptionLanguage}

**JSON Output Requirements**:
- The output MUST be a valid JSON array.
- The array MUST contain exactly ${numberOfKeyframes} string elements.

**Keyframe Prompt Instructions**:
1.  **Keyframe 1 (Most Abstract)**: A radical artistic interpretation based on the Core Style. Only 10-20% of the original image should be recognizable.
2.  **Intermediate Keyframes**: Gradually and evenly decrease abstraction and increase realism towards the original image across the remaining intermediate prompts.
3.  **Keyframe ${numberOfKeyframes} (Most Realistic)**: A perfect, photorealistic description of the original source image. The Core Style must be completely absent.
4.  Each prompt in the array must be a single, visually rich paragraph.
`;
    
    const { data, mimeType } = await getImageData(sourceImage);
    const imagePart = {
        inlineData: { data, mimeType }
    };
    
    const model = getGenAI().getGenerativeModel({ 
        model: config.textModel,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.STRING,
                    description: 'A detailed, visually descriptive paragraph for an image keyframe.'
                },
            }
        }
    });
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;

    const parsed = safeJsonParse(response.text());
    if (!parsed || !Array.isArray(parsed) || parsed.some(p => typeof p !== 'string')) {
        throw new Error("Failed to generate a valid media art keyframe prompt list.");
    }
    return parsed;
};

export const generateVisualArtVideo = async (text: string, effect: VisualArtEffect, image?: MediaArtSourceImage | null): Promise<string> => {
    // Note: Gemini SDK doesn't support video generation directly
    // Return a placeholder or integrate with another video generation service  
    console.warn("Visual art video generation not implemented with Gemini SDK");
    return "data:video/mp4;base64,AAAAAA=="; // Placeholder
};