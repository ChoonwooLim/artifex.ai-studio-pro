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
        // Check environment variable first, then localStorage
        const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('apiKey_anthropic');
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
            // Re-check environment variable and localStorage in case key was added after service initialization
            const currentKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('apiKey_anthropic');
            if (currentKey) {
                this.client = new Anthropic({
                    apiKey: currentKey,
                    dangerouslyAllowBrowser: true
                });
            } else {
                throw new Error('Anthropic API key not configured. Please add your API key in the API Keys settings.');
            }
        }

        try {
            const modelMap: { [key: string]: string } = {
                // Claude 4 series (September 2025)
                'claude-opus-4.1': 'claude-opus-4.1-20250805',
                'claude-sonnet-4.0': 'claude-sonnet-4-20250805',
                'claude-haiku-4.0': 'claude-haiku-4-20250805',
                // Claude 3.7 series (February 2025)
                'claude-3.7-sonnet': 'claude-3.7-sonnet-20250205',
                // Claude 3.5 series
                'claude-3.5-sonnet': 'claude-3-5-sonnet-20241022',
                'claude-3.5-haiku': 'claude-3-5-haiku-20241022',
                // Claude 3 series
                'claude-3-opus': 'claude-3-opus-20240229',
                'claude-3-sonnet': 'claude-3-sonnet-20240229',
                'claude-3-haiku': 'claude-3-haiku-20240307'
            };

            const actualModel = modelMap[options.model] || options.model;

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