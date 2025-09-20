import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Lazy load AI service types
type OpenAIService = import('./aiProviders/openaiService').OpenAIService;
type AnthropicService = import('./aiProviders/anthropicService').AnthropicService;
type XAIService = import('./aiProviders/xaiService').XAIService;
type ReplicateService = import('./aiProviders/replicateService').ReplicateService;
type MistralService = import('./aiProviders/mistralService').MistralService;

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
    private openaiService: OpenAIService | null = null;
    private anthropicService: AnthropicService | null = null;
    private xaiService: XAIService | null = null;
    private replicateService: ReplicateService | null = null;
    private mistralService: MistralService | null = null;
    private googleGenAI: GoogleGenerativeAI | null = null;

    constructor() {
        // Only initialize Google AI immediately as it's the default
        const geminiKey = import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('apiKey_google');
        if (geminiKey) {
            this.googleGenAI = new GoogleGenerativeAI(geminiKey);
        }
    }

    // Lazy loading methods for each service
    private async getOpenAIService(): Promise<OpenAIService> {
        if (!this.openaiService) {
            const { OpenAIService } = await import('./aiProviders/openaiService');
            this.openaiService = new OpenAIService();
        }
        return this.openaiService;
    }

    private async getAnthropicService(): Promise<AnthropicService> {
        if (!this.anthropicService) {
            const { AnthropicService } = await import('./aiProviders/anthropicService');
            this.anthropicService = new AnthropicService();
        }
        return this.anthropicService;
    }

    private async getXAIService(): Promise<XAIService> {
        if (!this.xaiService) {
            const { XAIService } = await import('./aiProviders/xaiService');
            this.xaiService = new XAIService();
        }
        return this.xaiService;
    }

    private async getMistralService(): Promise<MistralService> {
        if (!this.mistralService) {
            const { MistralService } = await import('./aiProviders/mistralService');
            this.mistralService = new MistralService();
        }
        return this.mistralService;
    }

    private async getReplicateService(): Promise<ReplicateService> {
        if (!this.replicateService) {
            const { ReplicateService } = await import('./aiProviders/replicateService');
            this.replicateService = new ReplicateService();
        }
        return this.replicateService;
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
        
        // Mistral models
        if (modelLower.includes('mistral') || modelLower.includes('mixtral') || modelLower.includes('codestral')) {
            return 'mistral';
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
                    const openai = await this.getOpenAIService();
                    if (!openai.isConfigured()) {
                        throw new Error('OpenAI API key not configured. Please add your API key in settings.');
                    }
                    return await openai.generateText(options);

                case 'anthropic':
                    const anthropic = await this.getAnthropicService();
                    if (!anthropic.isConfigured()) {
                        throw new Error('Anthropic API key not configured. Please add your API key in settings.');
                    }
                    return await anthropic.generateText(options);

                case 'xai':
                    const xai = await this.getXAIService();
                    if (!xai.isConfigured()) {
                        throw new Error('xAI API key not configured. Please add your API key in settings.');
                    }
                    return await xai.generateText(options);

                case 'mistral':
                    const mistral = await this.getMistralService();
                    if (!mistral.isConfigured()) {
                        throw new Error('Mistral API key not configured. Please add your API key in settings.');
                    }
                    return await mistral.generateText(options);

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
            'gemini-2-5-flash': 'gemini-2.5-flash',
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
                    const openaiImg = await this.getOpenAIService();
                    if (!openaiImg.isConfigured()) {
                        throw new Error('OpenAI API key not configured. Please add your API key in settings.');
                    }
                    return await openaiImg.generateImage(options);

                case 'replicate':
                    const replicateImg = await this.getReplicateService();
                    if (!(await replicateImg.isConfigured())) {
                        throw new Error('Replicate API key not configured. Please add your API key in settings.');
                    }
                    return await replicateImg.generateImage(options);

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
            
            // Try fallback to other available services
            if (provider === 'google' || options.model.includes('imagen')) {
                // Try OpenAI DALL-E if available
                const openaiService = await this.getOpenAIService();
                if (openaiService.isConfigured()) {
                    console.log('Falling back to OpenAI DALL-E for image generation');
                    return await openaiService.generateImage({
                        ...options,
                        model: 'dall-e-3'
                    });
                }
                // Try Replicate if available
                const replicateService = await this.getReplicateService();
                if (await replicateService.isConfigured()) {
                    console.log('Falling back to Replicate for image generation');
                    return await replicateService.generateImage({
                        ...options,
                        model: 'stable-diffusion-xl'
                    });
                }
            }
            
            throw error;
        }
    }

    private async generateGoogleImage(options: GenerateImageOptions): Promise<string[]> {
        // Google Imagen API is not yet publicly available
        console.log('Google Imagen not available, attempting automatic fallback');
        
        // Try OpenAI first if configured
        const openaiSvc = await this.getOpenAIService();
        if (openaiSvc.isConfigured()) {
            console.log('Redirecting to OpenAI DALL-E service');
            return await openaiSvc.generateImage({
                ...options,
                model: 'dall-e-3'
            });
        }
        
        // Try Replicate if configured
        const replicateSvc = await this.getReplicateService();
        if (await replicateSvc.isConfigured()) {
            console.log('Redirecting to Replicate service');
            return await replicateSvc.generateImage({
                ...options,
                model: 'stable-diffusion-xl'
            });
        }
        
        throw new Error(
            'Google Imagen API is not yet publicly available. ' +
            'Please configure either OpenAI API key (for DALL-E) or Replicate API key for image generation.'
        );
    }

    async generateVideo(options: GenerateVideoOptions): Promise<string> {
        const provider = this.getProviderForModel(options.model);
        console.log(`Using ${provider} provider for video model ${options.model}`);

        try {
            if (provider === 'replicate') {
                const replicateVid = await this.getReplicateService();
                if (!(await replicateVid.isConfigured())) {
                    throw new Error('Replicate API key not configured. Please add your API key in settings.');
                }
                return await replicateVid.generateVideo(options);
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