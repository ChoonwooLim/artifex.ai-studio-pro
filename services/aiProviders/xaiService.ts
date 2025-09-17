import OpenAI from 'openai';

interface GenerateOptions {
    prompt: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
}

export class XAIService {
    private client: OpenAI | null = null;

    constructor() {
        const apiKey = localStorage.getItem('xai_api_key');
        if (apiKey) {
            this.client = new OpenAI({
                apiKey: apiKey,
                baseURL: 'https://api.x.ai/v1',
                dangerouslyAllowBrowser: true
            });
        }
    }

    isConfigured(): boolean {
        return this.client !== null;
    }

    async generateText(options: GenerateOptions): Promise<string> {
        if (!this.client) {
            throw new Error('xAI API key not configured. Please add your API key in the API Keys settings.');
        }

        try {
            const modelMap: { [key: string]: string } = {
                'grok-3': 'grok-beta',
                'grok-2': 'grok-beta',
                'grok-beta': 'grok-beta'
            };

            const actualModel = modelMap[options.model] || 'grok-beta';

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
            console.error('xAI text generation error:', error);
            if (error.status === 401) {
                throw new Error('Invalid xAI API key. Please check your API key in settings.');
            } else if (error.status === 429) {
                throw new Error('xAI rate limit reached. Please try again later.');
            } else if (error.status === 404) {
                throw new Error('Grok model not available. Please ensure you have API access.');
            }
            throw new Error(`xAI API error: ${error.message}`);
        }
    }
}