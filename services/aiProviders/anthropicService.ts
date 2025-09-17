import Anthropic from '@anthropic-ai/sdk';

interface GenerateOptions {
    prompt: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
}

export class AnthropicService {
    private client: Anthropic | null = null;

    constructor() {
        const apiKey = localStorage.getItem('anthropic_api_key');
        if (apiKey) {
            this.client = new Anthropic({
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
            throw new Error('Anthropic API key not configured. Please add your API key in the API Keys settings.');
        }

        try {
            const modelMap: { [key: string]: string } = {
                'claude-opus-4.1': 'claude-3-opus-20240229',
                'claude-sonnet-4.0': 'claude-3-5-sonnet-20241022',
                'claude-haiku-4.0': 'claude-3-haiku-20240307',
                'claude-3.5-sonnet': 'claude-3-5-sonnet-20241022',
                'claude-3-opus': 'claude-3-opus-20240229',
                'claude-3-sonnet': 'claude-3-sonnet-20240229',
                'claude-3-haiku': 'claude-3-haiku-20240307'
            };

            const actualModel = modelMap[options.model] || 'claude-3-5-sonnet-20241022';

            const response = await this.client.messages.create({
                model: actualModel,
                messages: [
                    {
                        role: 'user',
                        content: options.prompt
                    }
                ],
                max_tokens: options.maxTokens || 2000,
                temperature: options.temperature || 0.7
            });

            if (response.content[0].type === 'text') {
                return response.content[0].text;
            }
            
            return '';
        } catch (error: any) {
            console.error('Anthropic text generation error:', error);
            if (error.status === 401) {
                throw new Error('Invalid Anthropic API key. Please check your API key in settings.');
            } else if (error.status === 429) {
                throw new Error('Anthropic rate limit reached. Please try again later.');
            } else if (error.status === 404) {
                throw new Error('Claude model not available. Please check if you have access to this model.');
            }
            throw new Error(`Anthropic API error: ${error.message}`);
        }
    }
}