import React, { useState, useEffect } from 'react';
import { DescriptionConfig, Tone, SampleProduct } from '../types';
import { TONE_OPTIONS, DESCRIPTION_LANGUAGE_OPTIONS, TEXT_MODEL_OPTIONS } from '../constants';
import { useTranslation } from '../i18n/LanguageContext';

interface InputFormProps {
    config: DescriptionConfig;
    setConfig: (config: DescriptionConfig) => void;
    onGenerate: () => void;
    isLoading: boolean;
    onShowSampleGallery: () => void;
}

const InputForm: React.FC<InputFormProps> = ({ config, setConfig, onGenerate, isLoading, onShowSampleGallery }) => {
    const { t } = useTranslation();
    const [apiKeyStatus, setApiKeyStatus] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        // Check API key status for each provider
        const checkApiKeys = () => {
            const status: { [key: string]: boolean } = {
                google: !!(import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('apiKey_google')),
                openai: !!(import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('apiKey_openai')),
                anthropic: !!(import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('apiKey_anthropic')),
                mistral: !!(import.meta.env.VITE_MISTRAL_API_KEY || localStorage.getItem('apiKey_mistral')),
            };
            setApiKeyStatus(status);
        };
        checkApiKeys();
    }, []);

    const handleConfigChange = (field: keyof DescriptionConfig, value: string) => {
        setConfig({ ...config, [field]: value });
    };

    const getProviderFromModel = (model: string): string => {
        const modelLower = model.toLowerCase();
        if (modelLower.includes('gemini')) return 'google';
        if (modelLower.includes('gpt') || modelLower.includes('o1')) return 'openai';
        if (modelLower.includes('claude')) return 'anthropic';
        if (modelLower.includes('mistral')) return 'mistral';
        return 'google';
    };

    const isModelAvailable = (model: string): boolean => {
        const provider = getProviderFromModel(model);
        return apiKeyStatus[provider] || false;
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-slate-300 mb-2">
                        {t('inputForm.productName')}
                    </label>
                    <input
                        id="productName"
                        type="text"
                        value={config.productName}
                        onChange={(e) => handleConfigChange('productName', e.target.value)}
                        placeholder={t('inputForm.productNamePlaceholder')}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="targetAudience" className="block text-sm font-medium text-slate-300 mb-2">
                        {t('inputForm.targetAudience')}
                    </label>
                    <input
                        id="targetAudience"
                        type="text"
                        value={config.targetAudience}
                        onChange={(e) => handleConfigChange('targetAudience', e.target.value)}
                        placeholder={t('inputForm.targetAudiencePlaceholder')}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div>
                <label htmlFor="keyFeatures" className="block text-sm font-medium text-slate-300 mb-2">
                    {t('inputForm.keyFeatures')}
                </label>
                <textarea
                    id="keyFeatures"
                    rows={4}
                    value={config.keyFeatures}
                    onChange={(e) => handleConfigChange('keyFeatures', e.target.value)}
                    placeholder={t('inputForm.keyFeaturesPlaceholder')}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="tone" className="block text-sm font-medium text-slate-300 mb-2">{t('inputForm.tone')}</label>
                    <select
                        id="tone"
                        value={config.tone}
                        onChange={(e) => handleConfigChange('tone', e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {TONE_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-slate-800">{o.label}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="language" className="block text-sm font-medium text-slate-300 mb-2">{t('inputForm.language')}</label>
                    <select
                        id="language"
                        value={config.language}
                        onChange={(e) => handleConfigChange('language', e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {DESCRIPTION_LANGUAGE_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-slate-800">{o.label}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label htmlFor="model" className="block text-sm font-medium text-slate-300 mb-2">
                    AI Model
                    <span className="ml-2 text-xs text-slate-500">(Select your preferred AI model)</span>
                </label>
                <select
                    id="model"
                    value={config.selectedModel || 'gemini-2.0-flash-exp'}
                    onChange={(e) => handleConfigChange('selectedModel', e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    {TEXT_MODEL_OPTIONS.map(model => {
                        const available = isModelAvailable(model.value);
                        const provider = getProviderFromModel(model.value);
                        return (
                            <option 
                                key={model.value} 
                                value={model.value} 
                                disabled={!available}
                                className={`bg-slate-800 ${!available ? 'text-slate-500' : ''}`}
                            >
                                {model.label} {!available && `(${provider} API key required)`}
                            </option>
                        );
                    })}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                    {config.selectedModel && TEXT_MODEL_OPTIONS.find(m => m.value === config.selectedModel)?.description}
                </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto flex-grow bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isLoading ? t('inputForm.generating') : t('inputForm.generateButton')}
                </button>
                <button
                    type="button"
                    onClick={onShowSampleGallery}
                    className="w-full sm:w-auto bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                    {t('inputForm.loadSample')}
                </button>
            </div>
        </form>
    );
};

export default InputForm;
