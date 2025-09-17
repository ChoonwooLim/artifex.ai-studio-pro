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

        if (modelLower.includes('gpt') || modelLower.includes('dall-e') || modelLower.includes('o1')) {
            return 'openai';
        }
        if (modelLower.includes('claude') || modelLower.includes('opus') || modelLower.includes('sonnet') || modelLower.includes('haiku')) {
            return 'anthropic';
        }
        if (modelLower.includes('grok')) {
            return 'xai';
        }
        if (modelLower.includes('gemini') || modelLower.includes('imagen') || modelLower.includes('veo')) {
            return 'google';
        }
        if (modelLower.includes('midjourney') || modelLower.includes('flux') || modelLower.includes('luma') || 
            modelLower.includes('runway') || modelLower.includes('pika') || modelLower.includes('stable') || 
            modelLower.includes('kandinsky')) {
            return 'replicate';
        }

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

        const modelMap: { [key: string]: string } = {
            'gemini-2.5-flash': 'gemini-1.5-flash',
            'gemini-2.5-pro': 'gemini-1.5-pro',
            'gemini-2.5-deep-think': 'gemini-1.5-pro',
            'gemini-pro': 'gemini-pro'
        };

        const actualModel = modelMap[options.model] || 'gemini-1.5-flash';
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
        if (!this.googleGenAI) {
            throw new Error('Google AI API key not configured');
        }

        const imageModel = this.googleGenAI.getGenerativeModel({ model: 'imagen-3.0' });
        const imagePrompt = `Generate an image: ${options.prompt}`;

        try {
            const result = await imageModel.generateContent(imagePrompt);
            const response = result.response;
            
            if (response.candidates && response.candidates[0]) {
                return ['https://via.placeholder.com/1024x1024?text=Image+Generation+In+Progress'];
            }
            
            return ['https://via.placeholder.com/1024x1024?text=Image+Generation+Failed'];
        } catch (error) {
            console.error('Google Image generation error:', error);
            return ['https://via.placeholder.com/1024x1024?text=Image+Generation+Error'];
        }
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