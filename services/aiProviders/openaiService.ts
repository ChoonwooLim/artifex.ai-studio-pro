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
        const apiKey = localStorage.getItem('openai_api_key');
        if (apiKey) {
            this.client = new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true
            });
        }
    }

    isConfigured(): boolean {
        return this.client !== null;
    }

    async generateText(options: GenerateOptions): Promise<string> {
        if (!this.client) {
            throw new Error('OpenAI API key not configured. Please add your API key in the API Keys settings.');
        }

        try {
            const modelMap: { [key: string]: string } = {
                'gpt-5': 'gpt-5',
                'gpt-5-turbo': 'gpt-5-turbo',
                'gpt-o1': 'gpt-o1',
                'gpt-o1-mini': 'gpt-o1-mini',
                'gpt-4o': 'gpt-4o'
            };

            const actualModel = modelMap[options.model] || 'gpt-4o';

            const response = await this.client.chat.completions.create({
                model: actualModel,
                messages: [
                    {
                        role: 'user',
                        content: options.prompt
                    }
                ],
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2000
            });

            return response.choices[0]?.message?.content || '';
        } catch (error: any) {
            console.error('OpenAI text generation error:', error);
            if (error.status === 401) {
                throw new Error('Invalid OpenAI API key. Please check your API key in settings.');
            } else if (error.status === 429) {
                throw new Error('OpenAI rate limit reached. Please try again later.');
            } else if (error.status === 404 && options.model.includes('gpt-5')) {
                throw new Error('GPT-5 model may not be available yet. Please try GPT-4o or another model.');
            }
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }

    async generateImage(options: ImageGenerateOptions): Promise<string[]> {
        if (!this.client) {
            throw new Error('OpenAI API key not configured. Please add your API key in the API Keys settings.');
        }

        try {
            const modelMap: { [key: string]: string } = {
                'dall-e-3': 'dall-e-3',
                'dall-e-2': 'dall-e-2'
            };

            const actualModel = modelMap[options.model] || 'dall-e-3';

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
        if (model === 'dall-e-2') {
            if (width && width <= 256) return '256x256';
            if (width && width <= 512) return '512x512';
            return '1024x1024';
        }
        
        if (width && height) {
            const aspectRatio = width / height;
            if (aspectRatio > 1.5) return '1792x1024';
            if (aspectRatio < 0.67) return '1024x1792';
        }
        return '1024x1024';
    }
}