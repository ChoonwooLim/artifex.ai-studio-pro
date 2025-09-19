import React from 'react';
import { VisualArtConfig, AspectRatio, VisualArtEffect } from '../types';
import { 
    ASPECT_RATIO_OPTIONS,
    VISUAL_ART_EFFECT_OPTIONS,
    TEXT_MODEL_OPTIONS,
    IMAGE_MODEL_OPTIONS,
    VIDEO_MODEL_OPTIONS
} from '../constants';
import { useTranslation } from '../i18n/LanguageContext';

interface VisualArtSettingsProps {
    config: VisualArtConfig;
    setConfig: (config: VisualArtConfig) => void;
}

const QUALITY_OPTIONS = [
    { value: 'standard', label: 'Standard', description: 'Fast generation, lower quality' },
    { value: 'hd', label: 'HD', description: 'Balanced quality and speed' },
    { value: 'ultra', label: 'Ultra', description: 'Best quality, slower generation' }
];

const OUTPUT_FORMAT_OPTIONS = [
    { value: 'video', label: 'Video', description: 'Animated video output' },
    { value: 'image', label: 'Image', description: 'Static image output' },
    { value: 'gif', label: 'GIF', description: 'Animated GIF format' }
];

const STYLE_OPTIONS = [
    { value: 'natural', label: 'Natural', description: 'Realistic style' },
    { value: 'artistic', label: 'Artistic', description: 'Stylized artistic rendering' },
    { value: 'cinematic', label: 'Cinematic', description: 'Movie-like aesthetics' },
    { value: 'abstract', label: 'Abstract', description: 'Abstract artistic style' },
    { value: 'vintage', label: 'Vintage', description: 'Retro/vintage look' },
    { value: 'modern', label: 'Modern', description: 'Contemporary style' }
];

const VisualArtSettings: React.FC<VisualArtSettingsProps> = ({ config, setConfig }) => {
    const { t } = useTranslation();
    
    const handleConfigChange = (field: keyof VisualArtConfig, value: any) => {
        const newConfig = { ...config, [field]: value };
        // Ensure numeric values are within bounds
        if (field === 'temperature') {
            const numValue = parseFloat(value);
            if (numValue < 0) {
                newConfig.temperature = 0;
            } else if (numValue > 2) {
                newConfig.temperature = 2;
            } else {
                newConfig.temperature = numValue;
            }
        }
        if (field === 'duration') {
            const numValue = parseInt(value, 10);
            if (numValue < 1) {
                newConfig.duration = 1;
            } else if (numValue > 60) {
                newConfig.duration = 60;
            } else {
                newConfig.duration = numValue;
            }
        }
        setConfig(newConfig);
    };

    const selectedTextModel = TEXT_MODEL_OPTIONS.find(o => o.value === config.textModel);
    const selectedImageModel = IMAGE_MODEL_OPTIONS.find(o => o.value === config.imageModel);
    const selectedVideoModel = VIDEO_MODEL_OPTIONS.find(o => o.value === config.videoModel);

    return (
        <fieldset className="space-y-6">
            <legend className="block text-sm font-medium text-slate-300 mb-2">{t('visualArtSettings.title')}</legend>
            
            {/* AI Model Settings */}
            <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/30">
                <h3 className="block text-xs font-semibold text-slate-300 mb-4">{t('visualArtSettings.aiSection')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="textModel" className="block text-xs font-medium text-slate-400 mb-1">
                            {t('visualArtSettings.textModel')}
                        </label>
                        <select
                            id="textModel"
                            value={config.textModel}
                            onChange={(e) => handleConfigChange('textModel', e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {TEXT_MODEL_OPTIONS.map(o => (
                                <option key={o.value} value={o.value} className="bg-slate-800">
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        {selectedTextModel && <p className="text-xs text-slate-500 mt-1">{selectedTextModel.description}</p>}
                    </div>
                    <div>
                        <label htmlFor="imageModel" className="block text-xs font-medium text-slate-400 mb-1">
                            {t('visualArtSettings.imageModel')}
                        </label>
                        <select
                            id="imageModel"
                            value={config.imageModel}
                            onChange={(e) => handleConfigChange('imageModel', e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {IMAGE_MODEL_OPTIONS.map(o => (
                                <option key={o.value} value={o.value} className="bg-slate-800">
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        {selectedImageModel && <p className="text-xs text-slate-500 mt-1">{selectedImageModel.description}</p>}
                    </div>
                    <div>
                        <label htmlFor="temperature" className="block text-xs font-medium text-slate-400 mb-1">
                            {t('visualArtSettings.creativity')} ({config.temperature})
                        </label>
                        <input
                            id="temperature"
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={config.temperature}
                            onChange={(e) => handleConfigChange('temperature', e.target.value)}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Precise</span>
                            <span>Creative</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Settings */}
            <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/30">
                <h3 className="block text-xs font-semibold text-slate-300 mb-4">{t('visualArtSettings.visualSection')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="effect" className="block text-xs font-medium text-slate-400 mb-1">
                            {t('visualArtSettings.effect')}
                        </label>
                        <select
                            id="effect"
                            value={config.effect}
                            onChange={(e) => handleConfigChange('effect', e.target.value as VisualArtEffect)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {VISUAL_ART_EFFECT_OPTIONS.map(o => (
                                <option key={o.value} value={o.value} className="bg-slate-800">
                                    {t(`visualArtEffects.${o.labelKey}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="style" className="block text-xs font-medium text-slate-400 mb-1">
                            {t('visualArtSettings.style')}
                        </label>
                        <select
                            id="style"
                            value={config.style}
                            onChange={(e) => handleConfigChange('style', e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {STYLE_OPTIONS.map(o => (
                                <option key={o.value} value={o.value} className="bg-slate-800">
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="aspectRatio" className="block text-xs font-medium text-slate-400 mb-1">
                            {t('visualArtSettings.aspectRatio')}
                        </label>
                        <select
                            id="aspectRatio"
                            value={config.aspectRatio}
                            onChange={(e) => handleConfigChange('aspectRatio', e.target.value as AspectRatio)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {ASPECT_RATIO_OPTIONS.map(o => (
                                <option key={o.value} value={o.value} className="bg-slate-800">
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Output Settings */}
            <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/30">
                <h3 className="block text-xs font-semibold text-slate-300 mb-4">{t('visualArtSettings.outputSection')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="quality" className="block text-xs font-medium text-slate-400 mb-1">
                            {t('visualArtSettings.quality')}
                        </label>
                        <select
                            id="quality"
                            value={config.quality}
                            onChange={(e) => handleConfigChange('quality', e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {QUALITY_OPTIONS.map(o => (
                                <option key={o.value} value={o.value} className="bg-slate-800">
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        {QUALITY_OPTIONS.find(o => o.value === config.quality) && (
                            <p className="text-xs text-slate-500 mt-1">
                                {QUALITY_OPTIONS.find(o => o.value === config.quality)?.description}
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="outputFormat" className="block text-xs font-medium text-slate-400 mb-1">
                            {t('visualArtSettings.outputFormat')}
                        </label>
                        <select
                            id="outputFormat"
                            value={config.outputFormat}
                            onChange={(e) => handleConfigChange('outputFormat', e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {OUTPUT_FORMAT_OPTIONS.map(o => (
                                <option key={o.value} value={o.value} className="bg-slate-800">
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        {OUTPUT_FORMAT_OPTIONS.find(o => o.value === config.outputFormat) && (
                            <p className="text-xs text-slate-500 mt-1">
                                {OUTPUT_FORMAT_OPTIONS.find(o => o.value === config.outputFormat)?.description}
                            </p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="duration" className="block text-xs font-medium text-slate-400 mb-1">
                            {t('visualArtSettings.duration')} ({config.duration}s)
                        </label>
                        <input
                            id="duration"
                            type="range"
                            min="1"
                            max="60"
                            step="1"
                            value={config.duration}
                            onChange={(e) => handleConfigChange('duration', e.target.value)}
                            className="w-full"
                            disabled={config.outputFormat === 'image'}
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>1s</span>
                            <span>60s</span>
                        </div>
                    </div>
                </div>
                {/* Video Model Selection - Only show when video or gif is selected */}
                {(config.outputFormat === 'video' || config.outputFormat === 'gif') && (
                    <div className="mt-6">
                        <div>
                            <label htmlFor="videoModel" className="block text-xs font-medium text-slate-400 mb-1">
                                {t('visualArtSettings.videoModel')}
                            </label>
                            <select
                                id="videoModel"
                                value={config.videoModel}
                                onChange={(e) => handleConfigChange('videoModel', e.target.value)}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                                {VIDEO_MODEL_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value} className="bg-slate-800">
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                            {selectedVideoModel && <p className="text-xs text-slate-500 mt-1">{selectedVideoModel.description}</p>}
                        </div>
                    </div>
                )}
                <p className="text-xs text-slate-500 mt-4">
                    {t('visualArtSettings.outputNote')}
                </p>
            </div>
        </fieldset>
    );
};

export default VisualArtSettings;