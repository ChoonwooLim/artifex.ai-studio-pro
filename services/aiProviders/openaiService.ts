import OpenAI from 'openai';

interface GenerateOptions {
    prompt: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
}

interface ImageGenerateOptions {
    prompt: string;
    model: string;
    width?: number;
    height?: number;
    count?: number;
}

export class OpenAIService {
    private client: OpenAI | null = null;

    constructor() {
        // Check environment variable first, then localStorage
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('apiKey_openai');
        console.log('OpenAIService constructor - API key found:', apiKey ? `Yes (length: ${apiKey.length})` : 'No');
        console.log('Environment keys available:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
        
        if (apiKey) {
            this.client = new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true
            });
            console.log('OpenAI client initialized successfully');
        } else {
            console.warn('OpenAI API key not found in environment or localStorage');
        }
    }

    isConfigured(): boolean {
        return this.client !== null;
    }

    async generateText(options: GenerateOptions): Promise<string> {
        if (!this.client) {
            // Re-check environment variable and localStorage in case key was added after service initialization
            const currentKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('apiKey_openai');
            if (currentKey) {
                this.client = new OpenAI({
                    apiKey: currentKey,
                    dangerouslyAllowBrowser: true
                });
            } else {
                throw new Error('OpenAI API key not configured. Please add your API key in the API Keys settings.');
            }
        }

        try {
            const modelMap: { [key: string]: string } = {
                // GPT-5 시리즈 (2025년 9월 출시)
                'gpt-5': 'gpt-5',
                'gpt-5-mini': 'gpt-5-mini',
                'gpt-5-nano': 'gpt-5-nano',
                // GPT-4.1 시리즈 (2025년 출시)
                'gpt-4.1': 'gpt-4.1',
                'gpt-4.1-mini': 'gpt-4.1-mini',
                // O 시리즈
                'o4-mini': 'o4-mini',
                'o1-preview': 'o1-preview',
                'o1-mini': 'o1-mini',
                // GPT-4o 시리즈
                'gpt-4o': 'gpt-4o',
                'gpt-4o-mini': 'gpt-4o-mini',
                // 특수 모델
                'gpt-realtime': 'gpt-realtime'
            };

            const actualModel = modelMap[options.model] || options.model;

            // GPT-5 시리즈 및 최신 모델 감지
            const isNewGenerationModel = actualModel.startsWith('gpt-5') || 
                                        actualModel.startsWith('gpt-4.1') ||
                                        actualModel === 'o4-mini' ||
                                        actualModel === 'gpt-realtime';

            // 모델별 파라미터 구성
            const completionParams: any = {
                model: actualModel,
                messages: [
                    {
                        role: 'user',
                        content: options.prompt
                    }
                ],
                temperature: options.temperature || 0.7
            };

            // 모델에 따른 토큰 파라미터 설정
            if (isNewGenerationModel) {
                // GPT-5 시리즈는 max_completion_tokens 사용
                completionParams.max_completion_tokens = options.maxTokens || 2000;
                console.log(`Using max_completion_tokens for ${actualModel}: ${completionParams.max_completion_tokens}`);
            } else {
                // 기존 모델은 max_tokens 사용
                completionParams.max_tokens = options.maxTokens || 2000;
                console.log(`Using max_tokens for ${actualModel}: ${completionParams.max_tokens}`);
            }

            const response = await this.client.chat.completions.create(completionParams);

            return response.choices[0]?.message?.content || '';
        } catch (error: any) {
            console.error('OpenAI text generation error:', error);
            if (error.status === 401) {
                throw new Error('Invalid OpenAI API key. Please check your API key in settings.');
            } else if (error.status === 429) {
                throw new Error('OpenAI rate limit reached. Please try again later.');
            } else if (error.status === 404) {
                throw new Error(`Model ${options.model} not found. Please check if you have access to this model.`);
            }
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }

    async generateImage(options: ImageGenerateOptions): Promise<string[]> {
        console.log('OpenAIService.generateImage called with options:', options);
        
        if (!this.client) {
            // Re-check environment variable and localStorage in case key was added after service initialization
            const currentKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('apiKey_openai');
            console.log('OpenAI API key check in generateImage:', currentKey ? 'Found' : 'Not found');
            
            if (currentKey) {
                this.client = new OpenAI({
                    apiKey: currentKey,
                    dangerouslyAllowBrowser: true
                });
            } else {
                throw new Error('OpenAI API key not configured. Please add your API key in the API Keys settings.');
            }
        }

        try {
            // Map display names to actual API model names
            const modelMap: { [key: string]: string } = {
                'dall-e-3': 'dall-e-3',
                'dall-e-3-hd': 'dall-e-3',
                'dall-e-2': 'dall-e-2'
            };

            const actualModel = modelMap[options.model] || 'dall-e-3';
            console.log('Using actual model:', actualModel);

            const response = await this.client.images.generate({
                model: actualModel,
                prompt: options.prompt,
                n: options.count || 1,
                size: this.mapImageSize(options.width, options.height, actualModel),
                quality: actualModel === 'dall-e-3' ? 'hd' : undefined,
                style: 'natural'
            });

            return response.data.map(img => img.url || '');
        } catch (error: any) {
            console.error('OpenAI image generation error:', error);
            if (error.status === 401) {
                throw new Error('Invalid OpenAI API key. Please check your API key in settings.');
            } else if (error.status === 429) {
                throw new Error('OpenAI rate limit reached. Please try again later.');
            }
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }

    private mapImageSize(width?: number, height?: number, model?: string): '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792' {
        console.log('mapImageSize called with:', { width, height, model });
        
        if (model === 'dall-e-2') {
            if (width && width <= 256) return '256x256';
            if (width && width <= 512) return '512x512';
            return '1024x1024';
        }
        
        if (width && height) {
            const aspectRatio = width / height;
            console.log('Aspect ratio:', aspectRatio);
            if (aspectRatio > 1.5) {
                console.log('Returning landscape: 1792x1024');
                return '1792x1024';
            }
            if (aspectRatio < 0.67) {
                console.log('Returning portrait: 1024x1792');
                return '1024x1792';
            }
        }
        console.log('Returning square: 1024x1024');
        return '1024x1024';
    }
}