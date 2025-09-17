import { aiService } from './aiService';

export interface CharacterReference {
    id: string;
    name: string;
    description: string;
    visualDetails: {
        age?: string;
        gender?: string;
        ethnicity?: string;
        hairColor?: string;
        hairStyle?: string;
        eyeColor?: string;
        height?: string;
        build?: string;
        clothing?: string;
        distinctiveFeatures?: string[];
        personality?: string;
        occupation?: string;
    };
    referenceImages?: string[];
    seedNumber?: number;
    styleConsistencyPrompt?: string;
}

export interface StyleGuide {
    cinematography: {
        lighting: 'natural' | 'dramatic' | 'soft' | 'hard' | 'golden hour' | 'blue hour' | 'neon' | 'film noir';
        colorGrading: 'cinematic' | 'vibrant' | 'desaturated' | 'warm' | 'cool' | 'high contrast' | 'low contrast' | 'film emulation';
        cameraAngle: 'eye level' | 'low angle' | 'high angle' | 'dutch angle' | 'aerial' | 'close-up' | 'wide shot' | 'medium shot';
        depthOfField: 'shallow' | 'deep' | 'tilt-shift' | 'bokeh';
        aspectRatio: '16:9' | '2.39:1' | '1.85:1' | '4:3' | '1:1' | '9:16';
    };
    artDirection: {
        artStyle: 'photorealistic' | 'hyperrealistic' | 'cinematic' | 'documentary' | 'commercial' | 'artistic';
        productionQuality: 'blockbuster' | 'indie' | 'commercial' | 'documentary' | 'arthouse';
        era: 'contemporary' | 'futuristic' | 'historical' | 'timeless';
        mood: 'dramatic' | 'uplifting' | 'tense' | 'mysterious' | 'romantic' | 'action' | 'horror' | 'comedy';
    };
    technicalSpecs: {
        resolution: '8K' | '4K' | '2K' | 'HD';
        quality: 'maximum' | 'high' | 'balanced';
        renderEngine: 'octane' | 'unreal engine 5' | 'arnold' | 'redshift' | 'cycles';
        postProcessing: string[];
    };
}

export interface ProfessionalImageOptions {
    prompt: string;
    model: string;
    characters?: CharacterReference[];
    styleGuide?: StyleGuide;
    seed?: number;
    variations?: number;
    qualitySettings?: {
        steps?: number;
        cfgScale?: number;
        denoise?: number;
        upscale?: boolean;
        enhanceFaces?: boolean;
    };
    negativePrompt?: string;
    referenceStrength?: number;
}

export class ProfessionalImageService {
    private characterRegistry: Map<string, CharacterReference> = new Map();
    private currentStyleGuide: StyleGuide | null = null;
    private masterSeed: number | null = null;

    constructor() {
        this.initializeDefaultStyleGuide();
    }

    private initializeDefaultStyleGuide() {
        this.currentStyleGuide = {
            cinematography: {
                lighting: 'cinematic',
                colorGrading: 'cinematic',
                cameraAngle: 'eye level',
                depthOfField: 'shallow',
                aspectRatio: '2.39:1'
            },
            artDirection: {
                artStyle: 'hyperrealistic',
                productionQuality: 'blockbuster',
                era: 'contemporary',
                mood: 'dramatic'
            },
            technicalSpecs: {
                resolution: '8K',
                quality: 'maximum',
                renderEngine: 'unreal engine 5',
                postProcessing: ['color grading', 'film grain', 'chromatic aberration subtle', 'lens flare']
            }
        };
    }

    public registerCharacter(character: CharacterReference): void {
        this.characterRegistry.set(character.id, character);
    }

    public setStyleGuide(styleGuide: StyleGuide): void {
        this.currentStyleGuide = styleGuide;
    }

    public setMasterSeed(seed: number): void {
        this.masterSeed = seed;
    }

    private buildCharacterPrompt(character: CharacterReference): string {
        const details = character.visualDetails;
        const parts: string[] = [];

        if (character.name) parts.push(`[${character.name}]`);
        if (details.age && details.gender) parts.push(`${details.age} year old ${details.gender}`);
        if (details.ethnicity) parts.push(details.ethnicity);
        if (details.hairColor && details.hairStyle) {
            parts.push(`with ${details.hairColor} ${details.hairStyle} hair`);
        }
        if (details.eyeColor) parts.push(`${details.eyeColor} eyes`);
        if (details.build) parts.push(`${details.build} build`);
        if (details.clothing) parts.push(`wearing ${details.clothing}`);
        if (details.distinctiveFeatures && details.distinctiveFeatures.length > 0) {
            parts.push(`distinctive features: ${details.distinctiveFeatures.join(', ')}`);
        }

        return parts.join(', ');
    }

    private buildStylePrompt(styleGuide: StyleGuide): string {
        const prompts: string[] = [];
        
        // Cinematography
        const cine = styleGuide.cinematography;
        prompts.push(`${cine.lighting} lighting`);
        prompts.push(`${cine.colorGrading} color grading`);
        prompts.push(`shot from ${cine.cameraAngle}`);
        prompts.push(`${cine.depthOfField} depth of field`);
        prompts.push(`${cine.aspectRatio} aspect ratio`);

        // Art Direction
        const art = styleGuide.artDirection;
        prompts.push(`${art.artStyle} style`);
        prompts.push(`${art.productionQuality} production quality`);
        prompts.push(`${art.mood} mood`);

        // Technical
        const tech = styleGuide.technicalSpecs;
        prompts.push(`${tech.resolution} resolution`);
        prompts.push(`rendered in ${tech.renderEngine}`);
        if (tech.postProcessing.length > 0) {
            prompts.push(tech.postProcessing.join(', '));
        }

        return prompts.join(', ');
    }

    private buildProfessionalPrompt(basePrompt: string, options: ProfessionalImageOptions): string {
        const parts: string[] = [];
        
        // Base scene description
        parts.push(basePrompt);

        // Add character descriptions
        if (options.characters && options.characters.length > 0) {
            const characterPrompts = options.characters.map(char => this.buildCharacterPrompt(char));
            parts.push(characterPrompts.join(' and '));
        }

        // Add style guide
        if (options.styleGuide || this.currentStyleGuide) {
            const styleGuide = options.styleGuide || this.currentStyleGuide!;
            parts.push(this.buildStylePrompt(styleGuide));
        }

        // Quality enhancers
        parts.push('masterpiece, best quality, ultra-detailed, professional photography');
        parts.push('sharp focus, highly detailed, intricate details');
        parts.push('award winning cinematography, professional color grading');

        return parts.join(', ');
    }

    private buildNegativePrompt(): string {
        return [
            'low quality', 'low resolution', 'blurry', 'pixelated', 'artifacts',
            'distorted faces', 'deformed', 'ugly', 'bad anatomy', 'bad proportions',
            'extra limbs', 'missing limbs', 'floating limbs', 'disconnected limbs',
            'mutated hands', 'poorly drawn hands', 'malformed hands',
            'out of focus', 'long neck', 'duplicate', 'watermark', 'signature',
            'amateur', 'unprofessional', 'sketch', 'cartoon', 'anime', 'manga',
            'low budget', 'b-movie quality', 'home video', 'smartphone photo'
        ].join(', ');
    }

    public async generateProfessionalImage(options: ProfessionalImageOptions): Promise<string[]> {
        // Build professional prompt
        const professionalPrompt = this.buildProfessionalPrompt(options.prompt, options);
        
        // Build negative prompt
        const negativePrompt = options.negativePrompt || this.buildNegativePrompt();

        // Prepare generation parameters
        const seed = options.seed || this.masterSeed || Math.floor(Math.random() * 1000000);
        
        // Construct enhanced prompt with all parameters
        const enhancedPrompt = `${professionalPrompt}
        
Negative prompt: ${negativePrompt}
Seed: ${seed}
Steps: ${options.qualitySettings?.steps || 50}
CFG Scale: ${options.qualitySettings?.cfgScale || 7.5}
Sampler: DPM++ 2M Karras`;

        try {
            // Generate with enhanced parameters
            const results = await aiService.generateImage({
                prompt: enhancedPrompt,
                model: options.model,
                count: options.variations || 1
            });

            // If upscaling is requested, apply it
            if (options.qualitySettings?.upscale) {
                // This would integrate with an upscaling service
                console.log('Upscaling requested - would apply 4x upscaling here');
            }

            // If face enhancement is requested, apply it
            if (options.qualitySettings?.enhanceFaces) {
                // This would integrate with face enhancement
                console.log('Face enhancement requested - would apply GFPGAN/CodeFormer here');
            }

            return results;
        } catch (error) {
            console.error('Professional image generation failed:', error);
            throw error;
        }
    }

    public async generateStoryboardWithConsistency(
        scenes: string[],
        characters: CharacterReference[],
        styleGuide: StyleGuide,
        model: string
    ): Promise<string[]> {
        const results: string[] = [];
        
        // Register all characters
        characters.forEach(char => this.registerCharacter(char));
        
        // Set style guide
        this.setStyleGuide(styleGuide);
        
        // Generate master seed for consistency
        const masterSeed = Math.floor(Math.random() * 1000000);
        this.setMasterSeed(masterSeed);

        // Generate each scene with consistency
        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i];
            
            // Use consistent seed with slight variation for each scene
            const sceneSeed = masterSeed + i;
            
            const images = await this.generateProfessionalImage({
                prompt: scene,
                model: model,
                characters: characters,
                styleGuide: styleGuide,
                seed: sceneSeed,
                qualitySettings: {
                    steps: 50,
                    cfgScale: 7.5,
                    upscale: true,
                    enhanceFaces: true
                },
                variations: 1
            });
            
            results.push(...images);
        }

        return results;
    }
}

export const professionalImageService = new ProfessionalImageService();