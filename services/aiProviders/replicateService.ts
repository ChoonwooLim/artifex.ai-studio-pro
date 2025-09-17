import Replicate from 'replicate';

interface ImageGenerateOptions {
    prompt: string;
    model: string;
    width?: number;
    height?: number;
    count?: number;
}

interface VideoGenerateOptions {
    prompt: string;
    model: string;
    duration?: number;
}

export class ReplicateService {
    private client: Replicate | null = null;

    constructor() {
        // Check environment variable first, then localStorage
        const apiKey = import.meta.env.VITE_REPLICATE_API_KEY || localStorage.getItem('apiKey_replicate');
        if (apiKey) {
            this.client = new Replicate({
                auth: apiKey
            });
        }
    }

    isConfigured(): boolean {
        return this.client !== null;
    }

    async generateImage(options: ImageGenerateOptions): Promise<string[]> {
        if (!this.client) {
            // Re-check environment variable and localStorage in case key was added after service initialization
            const currentKey = import.meta.env.VITE_REPLICATE_API_KEY || localStorage.getItem('apiKey_replicate');
            if (currentKey) {
                this.client = new Replicate({
                    auth: currentKey
                });
            } else {
                throw new Error('Replicate API key not configured. Please add your API key in the API Keys settings.');
            }
        }

        try {
            const modelMap: { [key: string]: { model: string; version: string } } = {
                'midjourney-v7': {
                    model: 'stability-ai/sdxl',
                    version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'
                },
                'midjourney-v6': {
                    model: 'stability-ai/sdxl',
                    version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'
                },
                'flux-1.1-pro': {
                    model: 'black-forest-labs/flux-pro',
                    version: '5f3c7fdc21a935a659a982e032c40f088f8dd0e6f3dd7cf3f0c4a982f87d8e92'
                },
                'flux-pro': {
                    model: 'black-forest-labs/flux-pro',
                    version: '5f3c7fdc21a935a659a982e032c40f088f8dd0e6f3dd7cf3f0c4a982f87d8e92'
                },
                'flux-dev': {
                    model: 'black-forest-labs/flux-dev',
                    version: '612251578d66bcee37098f93ea5f9c93f47c6c88f5f86cb32ca4e0d96a83beed'
                },
                'stable-diffusion-xl': {
                    model: 'stability-ai/sdxl',
                    version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b'
                },
                'kandinsky-3': {
                    model: 'ai-forever/kandinsky-2.2',
                    version: 'ea1addaab376f4dc227f5368bbd8eff901820fd1cc14ed8cad63b29249e9d463'
                }
            };

            const selectedModel = modelMap[options.model] || modelMap['flux-dev'];

            const input: any = {
                prompt: options.prompt,
                width: options.width || 1024,
                height: options.height || 1024,
                num_outputs: options.count || 1,
                guidance_scale: 7.5,
                num_inference_steps: 50
            };

            const output = await this.client.run(
                `${selectedModel.model}:${selectedModel.version}`,
                { input }
            );

            if (Array.isArray(output)) {
                return output.map(url => url as string);
            } else if (typeof output === 'string') {
                return [output];
            }

            return [];
        } catch (error: any) {
            console.error('Replicate image generation error:', error);
            if (error.status === 401) {
                throw new Error('Invalid Replicate API key. Please check your API key in settings.');
            } else if (error.status === 429) {
                throw new Error('Replicate rate limit reached. Please try again later.');
            }
            throw new Error(`Replicate API error: ${error.message}`);
        }
    }

    async generateVideo(options: VideoGenerateOptions): Promise<string> {
        if (!this.client) {
            // Re-check environment variable and localStorage in case key was added after service initialization
            const currentKey = import.meta.env.VITE_REPLICATE_API_KEY || localStorage.getItem('apiKey_replicate');
            if (currentKey) {
                this.client = new Replicate({
                    auth: currentKey
                });
            } else {
                throw new Error('Replicate API key not configured. Please add your API key in the API Keys settings.');
            }
        }

        try {
            const modelMap: { [key: string]: { model: string; version: string } } = {
                'luma-dream-machine': {
                    model: 'lucataco/animate-diff',
                    version: 'beecf59c4aee8d81bf04f0381033dfa10dc16e845b4ae00d281e2fa377e48a9f'
                },
                'runway-gen-3': {
                    model: 'anotherjesse/zeroscope-v2-xl',
                    version: '9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351'
                },
                'pika-2.0': {
                    model: 'anotherjesse/zeroscope-v2-xl',
                    version: '9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351'
                },
                'stable-video-diffusion': {
                    model: 'stability-ai/stable-video-diffusion',
                    version: '3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438'
                }
            };

            const selectedModel = modelMap[options.model] || modelMap['stable-video-diffusion'];

            const input: any = {
                prompt: options.prompt,
                num_frames: 24,
                fps: 8
            };

            if (options.model === 'stable-video-diffusion') {
                input.cond_aug = 0.02;
                input.decoding_t = 14;
                input.seed = -1;
            }

            const output = await this.client.run(
                `${selectedModel.model}:${selectedModel.version}`,
                { input }
            );

            if (typeof output === 'string') {
                return output;
            } else if (Array.isArray(output) && output.length > 0) {
                return output[0] as string;
            }

            return '';
        } catch (error: any) {
            console.error('Replicate video generation error:', error);
            if (error.status === 401) {
                throw new Error('Invalid Replicate API key. Please check your API key in settings.');
            } else if (error.status === 429) {
                throw new Error('Replicate rate limit reached. Please try again later.');
            }
            throw new Error(`Replicate API error: ${error.message}`);
        }
    }
}