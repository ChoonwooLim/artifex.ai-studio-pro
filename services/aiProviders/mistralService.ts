import { Mistral } from '@mistralai/mistralai';

interface GenerateOptions {
    prompt: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
}

export class MistralService {
    private client: Mistral | null = null;

    constructor() {
        // Check environment variable first, then localStorage
        const apiKey = import.meta.env.VITE_MISTRAL_API_KEY || localStorage.getItem('apiKey_mistral');
        if (apiKey) {
            this.client = new Mistral({
                apiKey: apiKey
            });
        }
    }

    isConfigured(): boolean {
        return this.client !== null;
    }

    async generateText(options: GenerateOptions): Promise<string> {
        if (!this.client) {
            // Re-check environment variable and localStorage in case key was added after service initialization
            const currentKey = import.meta.env.VITE_MISTRAL_API_KEY || localStorage.getItem('apiKey_mistral');
            if (currentKey) {
                this.client = new Mistral({
                    apiKey: currentKey
                });
            } else {
                throw new Error('Mistral API key not configured. Please add your API key in the API Keys settings.');
            }
        }

        try {
            // Map display names to actual API model names
            const modelMap: { [key: string]: string } = {
                // Latest Mistral models (2025)
                'mistral-large-2': 'mistral-large-latest',
                'mistral-large': 'mistral-large-latest',
                'mistral-medium': 'mistral-medium-latest',
                'mistral-small': 'mistral-small-latest',
                'mistral-nemo': 'open-mistral-nemo',
                'mixtral-8x7b': 'open-mixtral-8x7b',
                'mixtral-8x22b': 'open-mixtral-8x22b',
                'codestral': 'codestral-latest',
                // Legacy models
                'mistral-7b': 'open-mistral-7b',
                'mistral-tiny': 'mistral-tiny'
            };

            const actualModel = modelMap[options.model] || options.model;

            const response = await this.client.chat.complete({
                model: actualModel,
                messages: [
                    {
                        role: 'user',
                        content: options.prompt
                    }
                ],
                maxTokens: options.maxTokens || 2000,
                temperature: options.temperature || 0.7
            });

            if (response.choices?.[0]?.message?.content) {
                return response.choices[0].message.content;
            }
            
            return '';
        } catch (error: any) {
            console.error('Mistral text generation error:', error);
            if (error.status === 401) {
                throw new Error('Invalid Mistral API key. Please check your API key in settings.');
            } else if (error.status === 429) {
                throw new Error('Mistral rate limit reached. Please try again later.');
            } else if (error.status === 404) {
                throw new Error('Mistral model not available. Please check model availability.');
            }
            throw new Error(`Mistral API error: ${error.message || 'Unknown error'}`);
        }
    }
}