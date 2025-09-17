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
        models: ['GPT-5', 'GPT-5 Pro', 'GPT Image 1', 'Sora Turbo'],
        docsUrl: 'https://platform.openai.com/docs',
        signupUrl: 'https://platform.openai.com/api-keys',
        pricingUrl: 'https://openai.com/pricing',
        description: 'Access GPT-5 (Aug 2025), GPT Image 1, and Sora Turbo video'
    },
    {
        service: 'Anthropic (Claude)',
        key: 'anthropic',
        models: ['Claude Opus 4.1', 'Claude Sonnet 4', 'Claude 3.7'],
        docsUrl: 'https://docs.anthropic.com',
        signupUrl: 'https://console.anthropic.com/account/keys',
        pricingUrl: 'https://www.anthropic.com/pricing',
        description: 'Access Claude 4 series with 1M token context'
    },
    {
        service: 'Google AI (Gemini)',
        key: 'google',
        models: ['Gemini 2.5 Deep Think', 'Gemini 2.5 Pro', 'Veo 3', 'Veo 3 Fast'],
        docsUrl: 'https://ai.google.dev/docs',
        signupUrl: 'https://aistudio.google.com/app/apikey',
        pricingUrl: 'https://ai.google.dev/pricing',
        description: 'Access Gemini 2.5 and Veo 3 with native audio (Sep 2025)'
    },
    {
        service: 'xAI (Grok)',
        key: 'xai',
        models: ['Grok 3', 'Grok 3 Mini', 'Grok 4 (Coming)'],
        docsUrl: 'https://docs.x.ai',
        signupUrl: 'https://x.ai/api',
        pricingUrl: 'https://x.ai/pricing',
        description: 'Access Grok 3 with 1M token context (Feb 2025)'
    },
    {
        service: 'Stability AI',
        key: 'stability',
        models: ['SD 3.5 Large', 'SD 3.5 Turbo', 'Stable Video Diffusion'],
        docsUrl: 'https://platform.stability.ai/docs',
        signupUrl: 'https://platform.stability.ai/account/keys',
        pricingUrl: 'https://platform.stability.ai/pricing',
        description: 'Stable Diffusion 3.5 with 8.1B parameters (Oct 2024)'
    },
    {
        service: 'Midjourney',
        key: 'midjourney',
        models: ['Midjourney v7', 'v7 Video (20 sec)'],
        docsUrl: 'https://docs.midjourney.com',
        signupUrl: 'https://www.midjourney.com/account',
        pricingUrl: 'https://www.midjourney.com/pricing',
        description: 'Top realism & video generation (Apr 2025)'
    },
    {
        service: 'Runway',
        key: 'runway',
        models: ['Runway Gen-3 Alpha'],
        docsUrl: 'https://docs.runwayml.com',
        signupUrl: 'https://app.runwayml.com/settings/apikeys',
        pricingUrl: 'https://runwayml.com/pricing',
        description: 'Professional video generation and editing'
    },
    {
        service: 'Pika Labs',
        key: 'pika',
        models: ['Pika 1.0'],
        docsUrl: 'https://docs.pika.art',
        signupUrl: 'https://pika.art/login',
        pricingUrl: 'https://pika.art/pricing',
        description: 'Creative video generation platform'
    },
    {
        service: 'Luma AI',
        key: 'luma',
        models: ['Dream Machine'],
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
        models: ['LLaMA 4 Maverick', 'LLaMA 4 Scout', 'LLaMA 3.2 90B'],
        docsUrl: 'https://ai.meta.com/llama/',
        signupUrl: 'https://ai.meta.com/resources/models-and-libraries/',
        description: 'LLaMA 4 with 1M token context (Apr 2025)'
    },
    {
        service: 'Mistral AI',
        key: 'mistral',
        models: ['Mistral Large 2', 'Mistral Medium'],
        docsUrl: 'https://docs.mistral.ai',
        signupUrl: 'https://console.mistral.ai/api-keys',
        pricingUrl: 'https://mistral.ai/pricing',
        description: 'Mistral Large 2 with 123B params, 128k context'
    }
];

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Load saved API keys from localStorage
        const savedKeys: Record<string, string> = {};
        API_SERVICES.forEach(service => {
            const key = localStorage.getItem(`apiKey_${service.key}`);
            if (key) savedKeys[service.key] = key;
        });
        setApiKeys(savedKeys);
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
            if (apiKey) {
                localStorage.setItem(`apiKey_${serviceKey}`, apiKey);
            } else {
                localStorage.removeItem(`apiKey_${serviceKey}`);
            }
        });
        onClose();
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
                                    <input
                                        type={showKeys[service.key] ? 'text' : 'password'}
                                        value={apiKeys[service.key] || ''}
                                        onChange={(e) => handleKeyChange(service.key, e.target.value)}
                                        placeholder={t('apiKeys.placeholder')}
                                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 pr-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <p className="text-sm text-slate-400">
                            {t('apiKeys.securityNote')}
                        </p>
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