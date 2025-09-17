import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { OpenAIService } from './aiProviders/openaiService';
import { AnthropicService } from './aiProviders/anthropicService';
import { XAIService } from './aiProviders/xaiService';
import { ReplicateService } from './aiProviders/replicateService';

interface GenerateTextOptions {
    prompt: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
}

interface GenerateImageOptions {
    prompt: string;
    model: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
    count?: number;
}

interface GenerateVideoOptions {
    prompt: string;
    model: string;
    duration?: number;
}

class AIService {
    private openaiService: OpenAIService;
    private anthropicService: AnthropicService;
    private xaiService: XAIService;
    private replicateService: ReplicateService;
    private googleGenAI: GoogleGenerativeAI | null = null;

    constructor() {
        this.openaiService = new OpenAIService();
        this.anthropicService = new AnthropicService();
        this.xaiService = new XAIService();
        this.replicateService = new ReplicateService();

        // Check environment variable first, then localStorage
        const geminiKey = import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('apiKey_google');
        if (geminiKey) {
            this.googleGenAI = new GoogleGenerativeAI(geminiKey);
        }
    }

    private getProviderForModel(model: string): string {
        const modelLower = model.toLowerCase();

        // OpenAI models
        if (modelLower.includes('gpt') || modelLower.includes('dall-e') || modelLower.includes('o1')) {
            return 'openai';
        }
        
        // Anthropic models
        if (modelLower.includes('claude') || modelLower.includes('opus') || modelLower.includes('sonnet') || modelLower.includes('haiku')) {
            return 'anthropic';
        }
        
        // xAI models
        if (modelLower.includes('grok')) {
            return 'xai';
        }
        
        // Google models
        if (modelLower.includes('gemini') || modelLower.includes('palm')) {
            return 'google';
        }
        
        // Replicate models (most open source and third-party models)
        if (modelLower.includes('midjourney') || modelLower.includes('flux') || 
            modelLower.includes('stable') || modelLower.includes('sdxl') || 
            modelLower.includes('kandinsky') || modelLower.includes('realvis') ||
            modelLower.includes('ideogram') || modelLower.includes('playground') ||
            modelLower.includes('recraft') || modelLower.includes('luma') ||
            modelLower.includes('dream-machine') || modelLower.includes('runway') ||
            modelLower.includes('cogvideo') || modelLower.includes('animate') ||
            modelLower.includes('zeroscope') || modelLower.includes('modelscope') ||
            modelLower.includes('video-crafter') || modelLower.includes('llama') ||
            modelLower.includes('mistral') || modelLower.includes('mixtral') ||
            modelLower.includes('qwen') || modelLower.includes('deepseek') ||
            modelLower.includes('command')) {
            return 'replicate';
        }

        // Default to Google for unknown models
        return 'google';
    }

    async generateText(options: GenerateTextOptions): Promise<string> {
        const provider = this.getProviderForModel(options.model);
        console.log(`Using ${provider} provider for model ${options.model}`);

        try {
            switch (provider) {
                case 'openai':
                    if (!this.openaiService.isConfigured()) {
                        throw new Error('OpenAI API key not configured. Please add your API key in settings.');
                    }
                    return await this.openaiService.generateText(options);

                case 'anthropic':
                    if (!this.anthropicService.isConfigured()) {
                        throw new Error('Anthropic API key not configured. Please add your API key in settings.');
                    }
                    return await this.anthropicService.generateText(options);

                case 'xai':
                    if (!this.xaiService.isConfigured()) {
                        throw new Error('xAI API key not configured. Please add your API key in settings.');
                    }
                    return await this.xaiService.generateText(options);

                case 'google':
                default:
                    if (!this.googleGenAI) {
                        // Re-check environment variable and localStorage in case key was added after service initialization
                        const currentKey = import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('apiKey_google');
                        if (currentKey) {
                            this.googleGenAI = new GoogleGenerativeAI(currentKey);
                            return await this.generateGeminiText(options);
                        }
                        throw new Error('Google AI API key not configured. Please add your API key in settings.');
                    }
                    return await this.generateGeminiText(options);
            }
        } catch (error: any) {
            console.error(`Error generating text with ${provider}:`, error);
            throw error;
        }
    }

    private async generateGeminiText(options: GenerateTextOptions): Promise<string> {
        if (!this.googleGenAI) {
            throw new Error('Google AI API key not configured');
        }

        // Map display names to actual API model names
        const modelMap: { [key: string]: string } = {
            'gemini-2-0-flash-exp': 'gemini-2.0-flash-exp',
            'gemini-exp-1206': 'gemini-exp-1206',
            'gemini-1.5-pro': 'gemini-1.5-pro',
            'gemini-1.5-flash': 'gemini-1.5-flash',
            'gemini-pro': 'gemini-pro'
        };

        const actualModel = modelMap[options.model] || options.model;
        const model = this.googleGenAI.getGenerativeModel({ model: actualModel });

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
            generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 2000
            }
        });

        return result.response.text();
    }

    async generateImage(options: GenerateImageOptions): Promise<string[]> {
        const provider = this.getProviderForModel(options.model);
        console.log(`Using ${provider} provider for image model ${options.model}`);

        try {
            switch (provider) {
                case 'openai':
                    if (!this.openaiService.isConfigured()) {
                        throw new Error('OpenAI API key not configured. Please add your API key in settings.');
                    }
                    return await this.openaiService.generateImage(options);

                case 'replicate':
                    if (!this.replicateService.isConfigured()) {
                        throw new Error('Replicate API key not configured. Please add your API key in settings.');
                    }
                    return await this.replicateService.generateImage(options);

                case 'google':
                default:
                    if (!this.googleGenAI) {
                        // Re-check environment variable and localStorage in case key was added after service initialization
                        const currentKey = import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('apiKey_google');
                        if (currentKey) {
                            this.googleGenAI = new GoogleGenerativeAI(currentKey);
                            return await this.generateGoogleImage(options);
                        }
                        throw new Error('Google AI API key not configured. Please add your API key in settings.');
                    }
                    return await this.generateGoogleImage(options);
            }
        } catch (error: any) {
            console.error(`Error generating image with ${provider}:`, error);
            throw error;
        }
    }

    private async generateGoogleImage(options: GenerateImageOptions): Promise<string[]> {
        // Google Imagen API is not yet publicly available
        // Automatically redirect to Replicate for image generation
        console.log('Google Imagen not available, redirecting to Replicate service');
        if (!this.replicateService.isConfigured()) {
            throw new Error(
                'Google Imagen API is not yet publicly available. ' +
                'Please configure Replicate API key or use DALL-E models with OpenAI API key.'
            );
        }
        // Use Stable Diffusion XL as fallback
        return await this.replicateService.generateImage({
            ...options,
            model: 'stable-diffusion-xl'
        });
    }

    async generateVideo(options: GenerateVideoOptions): Promise<string> {
        const provider = this.getProviderForModel(options.model);
        console.log(`Using ${provider} provider for video model ${options.model}`);

        try {
            if (provider === 'replicate') {
                if (!this.replicateService.isConfigured()) {
                    throw new Error('Replicate API key not configured. Please add your API key in settings.');
                }
                return await this.replicateService.generateVideo(options);
            }

            if (provider === 'google' && this.googleGenAI) {
                console.log('Note: Google Veo API is not yet publicly available. Using placeholder.');
                return 'https://via.placeholder.com/1920x1080?text=Video+Generation+Coming+Soon';
            }

            throw new Error(`Video generation not supported for provider: ${provider}`);
        } catch (error: any) {
            console.error(`Error generating video with ${provider}:`, error);
            throw error;
        }
    }
}

export const aiService = new AIService();