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
        // Initialize Google AI
        this.initializeGoogleAI();
    }

    private initializeGoogleAI() {
        const envKey = import.meta.env.VITE_GOOGLE_API_KEY;
        const storageKey = localStorage.getItem('apiKey_google');
        const geminiKey = envKey || storageKey;
        
        console.log('Google AI initialization check:', {
            hasEnvKey: !!envKey,
            hasStorageKey: !!storageKey,
            keyLength: geminiKey ? geminiKey.length : 0
        });
        
        if (geminiKey) {
            console.log('Initializing Google AI with key');
            this.googleGenAI = new GoogleGenerativeAI(geminiKey);
        } else {
            console.log('No Google API key found during initialization');
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
        
        console.log('getProviderForModel called with:', model);

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
        
        // Google models - include version numbers
        if (modelLower.includes('gemini') || modelLower.includes('palm') || 
            modelLower.includes('imagen') || modelLower.includes('2.5') || 
            modelLower.includes('2.0') || modelLower.includes('1.5')) {
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
        console.log('generateText called with:', {
            model: options.model,
            promptLength: options.prompt.length,
            temperature: options.temperature,
            maxTokens: options.maxTokens
        });
        
        const provider = this.getProviderForModel(options.model);
        console.log(`Provider determined: ${provider} for model ${options.model}`);

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
                    // Re-check and re-initialize if needed
                    const currentKey = import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('apiKey_google');
                    
                    if (!this.googleGenAI && currentKey) {
                        console.log('Re-initializing Google AI with found key');
                        this.googleGenAI = new GoogleGenerativeAI(currentKey);
                    }
                    
                    if (!this.googleGenAI) {
                        console.error('Google AI not initialized - no API key found');
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
        console.log('generateGeminiText called with model:', options.model);
        
        if (!this.googleGenAI) {
            console.error('googleGenAI is null');
            throw new Error('Google AI API key not configured');
        }

        // Map UI names to exact API model names (if different)
        // These are the ACTUAL model names from Google's official API documentation
        const modelMap: { [key: string]: string } = {
            // Stable models (confirmed from Google AI docs)
            'gemini-2.5-pro': 'gemini-2.5-pro',
            'gemini-2.5-flash': 'gemini-2.5-flash',  // This is the correct API name
            'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
            'gemini-2.0-flash': 'gemini-2.0-flash',
            'gemini-2.0-flash-lite': 'gemini-2.0-flash-lite',
            'gemini-1.5-pro': 'gemini-1.5-pro',
            'gemini-1.5-flash': 'gemini-1.5-flash',
            // Experimental/Preview models
            'gemini-2.0-flash-exp': 'gemini-2.0-flash-exp',
            'gemini-exp-1206': 'gemini-exp-1206',
            'gemini-pro': 'gemini-pro'
        };

        // Get the actual API model name
        const actualModel = modelMap[options.model] || options.model;
        
        console.log('Gemini model resolution:', {
            requested: options.model,
            apiName: actualModel,
            isMapped: options.model !== actualModel
        });
        
        try {
            console.log(`Creating Gemini model with exact API name: ${actualModel}`);
            const model = this.googleGenAI.getGenerativeModel({ model: actualModel });

            console.log(`Sending request to Gemini API with model: ${actualModel}...`);
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
                generationConfig: {
                    temperature: options.temperature || 0.7,
                    maxOutputTokens: options.maxTokens || 8192  // Increased for Gemini 2.5 Flash with thinking
                }
            });

            // Debug the response structure
            console.log('Full result object:', result);
            console.log('Result.response:', result.response);
            
            if (result.response) {
                const response = result.response.text();
                console.log('Response text:', response);
                console.log('Response text length:', response?.length || 0);
                
                // If empty, try other possible response structures
                if (!response || response.length === 0) {
                    console.log('Empty response, checking other structures...');
                    console.log('result.response.candidates:', result.response.candidates);
                    
                    // Try to get text from candidates if available
                    if (result.response.candidates && result.response.candidates[0]) {
                        const candidate = result.response.candidates[0];
                        console.log('First candidate:', candidate);
                        console.log('Candidate content:', candidate.content);
                        
                        if (candidate.content && candidate.content.parts) {
                            console.log('Content parts:', candidate.content.parts);
                            const text = candidate.content.parts.map((part: any) => {
                                console.log('Part:', part);
                                return part.text || '';
                            }).join('');
                            console.log('Extracted text from candidates:', text);
                            if (text) return text;
                        }
                    }
                }
                
                return response || 'No response generated';
            } else {
                console.error('No response object in result');
                return 'Error: No response from API';
            }
        } catch (error: any) {
            console.error('Gemini API error:', error);
            
            // Log detailed error information
            if (error.message) {
                console.error('Error message:', error.message);
            }
            if (error.status) {
                console.error('Error status:', error.status);
            }
            if (error.statusText) {
                console.error('Error statusText:', error.statusText);
            }
            
            // If it's an API key error
            if (error.message?.includes('API_KEY') || error.message?.includes('401') || error.status === 401) {
                throw new Error('Invalid or missing Google API key. Please check your API key in settings.');
            }
            
            // If it's a model not found error - report exact issue
            if (error.message?.includes('model') || error.message?.includes('404') || error.status === 404) {
                if (options.model !== actualModel) {
                    throw new Error(`The model "${options.model}" (API name: "${actualModel}") is not recognized by the Google Gemini API.`);
                } else {
                    throw new Error(`The model "${actualModel}" is not recognized by the Google Gemini API.`);
                }
            }
            
            // If it's a quota error
            if (error.message?.includes('quota') || error.status === 429) {
                throw new Error('API quota exceeded. Please try again later or check your Google Cloud quota.');
            }
            
            // Re-throw other errors with full context
            throw new Error(`Google AI API error: ${error.message || error.toString() || 'Unknown error occurred'}`);
        }
    }

    async generateImage(options: GenerateImageOptions): Promise<string[]> {
        console.log('generateImage called with options:', {
            model: options.model,
            width: options.width,
            height: options.height,
            aspectRatio: options.aspectRatio,
            aspectRatioType: typeof options.aspectRatio,
            count: options.count
        });
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
            
            // No automatic fallback - respect the user's model choice
            throw error;
        }
    }

    private async generateGoogleImage(options: GenerateImageOptions): Promise<string[]> {
        // Google Imagen and Gemini image models are not available via API
        // Return error instead of automatic fallback
        console.error('Google image generation models (Imagen, Gemini Flash Image) are not available via API');
        
        throw new Error(
            `The model "${options.model}" is not available via Google AI API. ` +
            'Google image generation models are currently not accessible through the API. ' +
            'Please select a different image model like DALL-E 3 or Stable Diffusion.'
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