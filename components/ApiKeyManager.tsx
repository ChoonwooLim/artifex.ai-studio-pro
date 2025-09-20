import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

interface ApiKeyConfig {
    service: string;
    key: string;
    models: string[];
    docsUrl: string;
    signupUrl: string;
    pricingUrl?: string;
    description: string;
}

interface ApiKeyManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

const API_SERVICES: ApiKeyConfig[] = [
    {
        service: 'OpenAI',
        key: 'openai',
        models: ['GPT-4o', 'GPT-4o mini', 'o1-preview', 'DALL-E 3', 'Sora Turbo'],
        docsUrl: 'https://platform.openai.com/docs',
        signupUrl: 'https://platform.openai.com/api-keys',
        pricingUrl: 'https://openai.com/pricing',
        description: 'Access GPT-4o, o1 reasoning models, DALL-E 3, and Sora video'
    },
    {
        service: 'Anthropic (Claude)',
        key: 'anthropic',
        models: ['Claude 3.5 Sonnet', 'Claude 3.5 Haiku', 'Claude 3 Opus'],
        docsUrl: 'https://docs.anthropic.com',
        signupUrl: 'https://console.anthropic.com/account/keys',
        pricingUrl: 'https://www.anthropic.com/pricing',
        description: 'Access Claude 3.5 series with enhanced intelligence (Oct 2024)'
    },
    {
        service: 'Google AI (Gemini)',
        key: 'google',
        models: ['Gemini 2.0 Flash', 'Gemini 1.5 Pro', 'Imagen 3', 'Veo 2'],
        docsUrl: 'https://ai.google.dev/docs',
        signupUrl: 'https://aistudio.google.com/app/apikey',
        pricingUrl: 'https://ai.google.dev/pricing',
        description: 'Access Gemini 2.0 and Veo 2 with 4K video generation (Dec 2024)'
    },
    {
        service: 'xAI (Grok)',
        key: 'xai',
        models: ['Grok 2', 'Grok 2 Vision'],
        docsUrl: 'https://docs.x.ai',
        signupUrl: 'https://x.ai/api',
        pricingUrl: 'https://x.ai/pricing',
        description: 'Access Grok 2 with real-time X platform knowledge'
    },
    {
        service: 'Stability AI',
        key: 'stability',
        models: ['SD 3.5 Large', 'SD 3.5 Turbo', 'Stable Video 2.1'],
        docsUrl: 'https://platform.stability.ai/docs',
        signupUrl: 'https://platform.stability.ai/account/keys',
        pricingUrl: 'https://platform.stability.ai/pricing',
        description: 'Stable Diffusion 3.5 with 8.1B parameters (Oct 2024)'
    },
    {
        service: 'Midjourney',
        key: 'midjourney',
        models: ['Midjourney v6.1'],
        docsUrl: 'https://docs.midjourney.com',
        signupUrl: 'https://www.midjourney.com/account',
        pricingUrl: 'https://www.midjourney.com/pricing',
        description: 'Artistic image generation with improved coherence (Jul 2024)'
    },
    {
        service: 'Runway',
        key: 'runway',
        models: ['Gen-3 Alpha Turbo'],
        docsUrl: 'https://docs.runwayml.com',
        signupUrl: 'https://app.runwayml.com/settings/apikeys',
        pricingUrl: 'https://runwayml.com/pricing',
        description: 'Professional video generation and editing (Oct 2024)'
    },
    {
        service: 'Pika Labs',
        key: 'pika',
        models: ['Pika 2.0'],
        docsUrl: 'https://docs.pika.art',
        signupUrl: 'https://pika.art/login',
        pricingUrl: 'https://pika.art/pricing',
        description: 'Advanced cinematic effects and scene editing (Dec 2024)'
    },
    {
        service: 'Luma AI',
        key: 'luma',
        models: ['Dream Machine 1.5'],
        docsUrl: 'https://docs.lumalabs.ai',
        signupUrl: 'https://lumalabs.ai/dream-machine/api',
        pricingUrl: 'https://lumalabs.ai/dream-machine/pricing',
        description: 'Fast, high-quality video generation'
    },
    {
        service: 'Adobe Firefly',
        key: 'adobe',
        models: ['Firefly 3'],
        docsUrl: 'https://developer.adobe.com/firefly-api/docs',
        signupUrl: 'https://developer.adobe.com/console',
        pricingUrl: 'https://www.adobe.com/products/firefly/pricing.html',
        description: 'Professional creative AI tools'
    },
    {
        service: 'Meta (LLaMA)',
        key: 'meta',
        models: ['Llama 3.2 90B', 'Llama 3.1 405B'],
        docsUrl: 'https://ai.meta.com/llama/',
        signupUrl: 'https://ai.meta.com/resources/models-and-libraries/',
        description: 'Open-source models with vision capabilities (Sep 2024)'
    },
    {
        service: 'Mistral AI',
        key: 'mistral',
        models: ['Mistral Large 2', 'Mixtral 8x22B'],
        docsUrl: 'https://docs.mistral.ai',
        signupUrl: 'https://console.mistral.ai/api-keys',
        pricingUrl: 'https://mistral.ai/pricing',
        description: '123B parameters with 128k context window (Jul 2024)'
    },
    {
        service: 'Black Forest Labs (FLUX)',
        key: 'flux',
        models: ['FLUX 1.1 Pro', 'FLUX Dev', 'FLUX Schnell'],
        docsUrl: 'https://blackforestlabs.ai/docs',
        signupUrl: 'https://replicate.com/black-forest-labs',
        pricingUrl: 'https://blackforestlabs.ai/#pricing',
        description: 'State-of-the-art image generation from SD creators (Oct 2024)'
    },
    {
        service: 'Cohere',
        key: 'cohere',
        models: ['Command R+', 'Embed v3', 'Rerank v3'],
        docsUrl: 'https://docs.cohere.com',
        signupUrl: 'https://dashboard.cohere.com/api-keys',
        pricingUrl: 'https://cohere.com/pricing',
        description: 'Enterprise AI optimized for RAG and search'
    },
    {
        service: 'Replicate',
        key: 'replicate',
        models: ['FLUX', 'SDXL', 'Various open models'],
        docsUrl: 'https://replicate.com/docs',
        signupUrl: 'https://replicate.com/account/api-tokens',
        pricingUrl: 'https://replicate.com/pricing',
        description: 'Run thousands of open-source models in the cloud'
    },
    {
        service: 'Hugging Face',
        key: 'huggingface',
        models: ['Qwen 2.5', 'DeepSeek V3', 'Open models'],
        docsUrl: 'https://huggingface.co/docs',
        signupUrl: 'https://huggingface.co/settings/tokens',
        pricingUrl: 'https://huggingface.co/pricing',
        description: 'Hub for open-source AI models and datasets'
    },
    {
        service: 'Ideogram',
        key: 'ideogram',
        models: ['Ideogram 2.0'],
        docsUrl: 'https://ideogram.ai/api',
        signupUrl: 'https://ideogram.ai/settings',
        pricingUrl: 'https://ideogram.ai/pricing',
        description: 'Best-in-class text rendering in images (Aug 2024)'
    },
    {
        service: 'Leonardo AI',
        key: 'leonardo',
        models: ['Leonardo Phoenix', 'Leonardo Kino'],
        docsUrl: 'https://docs.leonardo.ai',
        signupUrl: 'https://app.leonardo.ai/settings',
        pricingUrl: 'https://leonardo.ai/pricing',
        description: 'AI art generation for creative professionals'
    }
];

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
    const [envKeys, setEnvKeys] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Load saved API keys from localStorage and check environment variables
        const savedKeys: Record<string, string> = {};
        const envKeyStatus: Record<string, boolean> = {};
        
        const envVarMap: Record<string, string> = {
            'openai': import.meta.env.VITE_OPENAI_API_KEY || '',
            'anthropic': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
            'google': import.meta.env.VITE_GOOGLE_API_KEY || '',
            'xai': import.meta.env.VITE_XAI_API_KEY || '',
            'replicate': import.meta.env.VITE_REPLICATE_API_KEY || '',
            'stability': import.meta.env.VITE_STABILITY_API_KEY || '',
            'midjourney': import.meta.env.VITE_MIDJOURNEY_API_KEY || '',
            'runway': import.meta.env.VITE_RUNWAY_API_KEY || '',
            'pika': import.meta.env.VITE_PIKA_API_KEY || '',
            'luma': import.meta.env.VITE_LUMA_API_KEY || '',
            'adobe': import.meta.env.VITE_ADOBE_API_KEY || '',
            'meta': import.meta.env.VITE_META_API_KEY || '',
            'mistral': import.meta.env.VITE_MISTRAL_API_KEY || '',
            'flux': import.meta.env.VITE_FLUX_API_KEY || '',
            'cohere': import.meta.env.VITE_COHERE_API_KEY || '',
            'huggingface': import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
            'ideogram': import.meta.env.VITE_IDEOGRAM_API_KEY || '',
            'leonardo': import.meta.env.VITE_LEONARDO_API_KEY || ''
        };
        
        API_SERVICES.forEach(service => {
            // Check if key exists in environment variables
            if (envVarMap[service.key]) {
                envKeyStatus[service.key] = true;
                savedKeys[service.key] = '••••••••' + envVarMap[service.key].slice(-4); // Show last 4 chars
            } else {
                // Otherwise, check localStorage
                const key = localStorage.getItem(`apiKey_${service.key}`);
                if (key) savedKeys[service.key] = key;
            }
        });
        setApiKeys(savedKeys);
        setEnvKeys(envKeyStatus);
    }, []);

    const handleKeyChange = (serviceKey: string, value: string) => {
        setApiKeys(prev => ({
            ...prev,
            [serviceKey]: value
        }));
    };

    const handleSave = () => {
        // Save API keys to localStorage
        Object.entries(apiKeys).forEach(([serviceKey, apiKey]) => {
            if (apiKey && !envKeys[serviceKey]) { // Only save if not from env
                localStorage.setItem(`apiKey_${serviceKey}`, apiKey);
            } else if (!apiKey) {
                localStorage.removeItem(`apiKey_${serviceKey}`);
            }
        });
        onClose();
        // Reload the page to pick up new API keys
        window.location.reload();
    };

    const handleExportEnv = () => {
        // Create .env.local content
        let envContent = '# API Keys Configuration\n';
        envContent += '# Generated from Artifex.AI Studio Pro\n';
        envContent += '# ' + new Date().toISOString() + '\n\n';
        
        const envVarNames: Record<string, string> = {
            'openai': 'VITE_OPENAI_API_KEY',
            'anthropic': 'VITE_ANTHROPIC_API_KEY',
            'google': 'VITE_GOOGLE_API_KEY',
            'xai': 'VITE_XAI_API_KEY',
            'replicate': 'VITE_REPLICATE_API_KEY',
            'stability': 'VITE_STABILITY_API_KEY',
            'midjourney': 'VITE_MIDJOURNEY_API_KEY',
            'runway': 'VITE_RUNWAY_API_KEY',
            'pika': 'VITE_PIKA_API_KEY',
            'luma': 'VITE_LUMA_API_KEY',
            'adobe': 'VITE_ADOBE_API_KEY',
            'meta': 'VITE_META_API_KEY',
            'mistral': 'VITE_MISTRAL_API_KEY',
            'flux': 'VITE_FLUX_API_KEY',
            'cohere': 'VITE_COHERE_API_KEY',
            'huggingface': 'VITE_HUGGINGFACE_API_KEY',
            'ideogram': 'VITE_IDEOGRAM_API_KEY',
            'leonardo': 'VITE_LEONARDO_API_KEY'
        };
        
        Object.entries(apiKeys).forEach(([serviceKey, apiKey]) => {
            if (apiKey && !apiKey.includes('••••')) { // Don't export masked keys
                const envVarName = envVarNames[serviceKey];
                if (envVarName) {
                    envContent += `${envVarName}=${apiKey}\n`;
                }
            }
        });
        
        // Create and download file
        const blob = new Blob([envContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '.env.local';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const toggleShowKey = (serviceKey: string) => {
        setShowKeys(prev => ({
            ...prev,
            [serviceKey]: !prev[serviceKey]
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="border-b border-slate-700 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{t('apiKeys.title')}</h2>
                            <p className="text-slate-400 mt-1">{t('apiKeys.subtitle')}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    <div className="space-y-6">
                        {API_SERVICES.map(service => (
                            <div key={service.key} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white">{service.service}</h3>
                                        <p className="text-sm text-slate-400 mt-1">{service.description}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {service.models.map(model => (
                                                <span key={model} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                                                    {model}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <a
                                            href={service.signupUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            {t('apiKeys.getKey')}
                                        </a>
                                        <a
                                            href={service.docsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            {t('apiKeys.docs')}
                                        </a>
                                        {service.pricingUrl && (
                                            <a
                                                href={service.pricingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                {t('apiKeys.pricing')}
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="relative">
                                    {envKeys[service.key] && (
                                        <div className="absolute -top-5 left-0 text-xs text-green-400">
                                            ✓ Configured in .env.local
                                        </div>
                                    )}
                                    <input
                                        type={showKeys[service.key] ? 'text' : 'password'}
                                        value={apiKeys[service.key] || ''}
                                        onChange={(e) => handleKeyChange(service.key, e.target.value)}
                                        placeholder={envKeys[service.key] ? 'Using environment variable' : t('apiKeys.placeholder')}
                                        disabled={envKeys[service.key]}
                                        className={`w-full ${envKeys[service.key] ? 'bg-slate-800' : 'bg-slate-900'} border border-slate-600 rounded-lg px-4 py-2.5 pr-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${envKeys[service.key] ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShowKey(service.key)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showKeys[service.key] ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-slate-700 p-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleExportEnv}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
                                title="Export API keys to .env.local file"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export .env.local
                            </button>
                            <p className="text-sm text-slate-400">
                                {envKeys && Object.keys(envKeys).some(k => envKeys[k]) 
                                    ? '✓ Some keys loaded from .env.local'
                                    : 'Keys stored in browser'}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                {t('apiKeys.cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                {t('apiKeys.save')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyManager;