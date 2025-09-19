import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { AspectRatio, DescriptionConfig, StoryboardConfig, VisualStyle, MediaArtStyle, VisualArtEffect, MediaArtSourceImage, MediaArtStyleParams, DataCompositionParams, DigitalNatureParams, AiDataSculptureParams, LightAndSpaceParams, KineticMirrorsParams, GenerativeBotanyParams, QuantumPhantasmParams, ArchitecturalProjectionParams } from "../types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

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
        const trimmedString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
        return JSON.parse(trimmedString);
    } catch (e) {
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
                return JSON.parse(nestedJson);
            }
            return null;
        } catch (e2) {
            console.error("Failed to parse JSON:", jsonString, e2);
            return null;
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
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
};

const storyboardPanelSchema = {
    type: SchemaType.OBJECT,
    properties: {
        scene: { type: SchemaType.NUMBER },
        description: { type: SchemaType.STRING, description: 'A detailed, visually descriptive paragraph for this scene. Describe the camera shot, setting, action, and mood. This will be used as a prompt for an image generation model.' },
    }
};

export const generateStoryboard = async (idea: string, config: StoryboardConfig): Promise<{ description: string }[]> => {
    const prompt = `Create a storyboard for a short video based on this idea: "${idea}".

    **Instructions:**
    1.  Generate exactly ${config.sceneCount} scenes.
    2.  The overall mood should be ${config.mood}.
    3.  The visual style should be ${config.visualStyle}.
    4.  The total video length is approximately ${config.videoLength}, so pace the scenes accordingly.
    5.  The output language for the descriptions must be ${config.descriptionLanguage}.
    6.  For each scene, provide a detailed, visually rich description suitable for an AI image generation model. Describe the camera angle, subject, setting, action, and atmosphere.
    
    Return the result as a JSON array of objects.`;

    const model = genAI.getGenerativeModel({ 
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
    if (!parsed || !Array.isArray(parsed)) {
        throw new Error("Failed to generate a valid storyboard structure.");
    }
    return parsed.map(p => ({ description: p.description }));
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

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
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
    // Note: Gemini SDK doesn't support image generation directly
    // Return a placeholder or integrate with another image generation service
    console.warn("Image generation not implemented with Gemini SDK");
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EImage Placeholder%3C/text%3E%3C/svg%3E";
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
    
    const model = genAI.getGenerativeModel({ 
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