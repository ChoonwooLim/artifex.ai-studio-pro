import React, { useState } from 'react';
import { StoryboardConfig } from '../types';
import CharacterManager from './CharacterManager';
import StyleGuideEditor from './StyleGuideEditor';
import { CharacterReference, StyleGuide } from '../services/professionalImageService';
import { 
    ASPECT_RATIO_OPTIONS, 
    VISUAL_STYLE_OPTIONS, 
    VIDEO_LENGTH_OPTIONS, 
    MOOD_OPTIONS, 
    DESCRIPTION_LANGUAGE_OPTIONS,
    TEXT_MODEL_OPTIONS,
    IMAGE_MODEL_OPTIONS,
    VIDEO_MODEL_OPTIONS
} from '../constants';
import { useTranslation } from '../i18n/LanguageContext';

interface ProfessionalStoryboardSettingsProps {
    config: StoryboardConfig;
    setConfig: (config: StoryboardConfig) => void;
    characters: CharacterReference[];
    setCharacters: (characters: CharacterReference[]) => void;
    styleGuide: StyleGuide;
    setStyleGuide: (styleGuide: StyleGuide) => void;
}

const ProfessionalStoryboardSettings: React.FC<ProfessionalStoryboardSettingsProps> = ({
    config,
    setConfig,
    characters,
    setCharacters,
    styleGuide,
    setStyleGuide
}) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'basic' | 'characters' | 'style' | 'advanced'>('basic');
    const [qualitySettings, setQualitySettings] = useState({
        steps: 50,
        cfgScale: 7.5,
        denoise: 0.5,
        upscale: true,
        enhanceFaces: true
    });

    const handleConfigChange = (field: keyof StoryboardConfig, value: any) => {
        const newConfig = { ...config, [field]: value };
        if (field === 'sceneCount') {
            const numValue = parseInt(value, 10);
            if (numValue < 2) {
                newConfig.sceneCount = 2;
            } else if (numValue > 10) {
                newConfig.sceneCount = 10;
            } else {
                newConfig.sceneCount = numValue;
            }
        }
        setConfig(newConfig);
    };

    const tabs = [
        { id: 'basic', label: 'Basic Settings', icon: '⚙️' },
        { id: 'characters', label: 'Characters', icon: '👥' },
        { id: 'style', label: 'Visual Style', icon: '🎨' },
        { id: 'advanced', label: 'Advanced', icon: '🔧' }
    ];

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-700">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${
                            activeTab === tab.id
                                ? 'border-purple-500 text-purple-400'
                                : 'border-transparent text-slate-400 hover:text-slate-300'
                        }`}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        <span className="font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* Basic Settings Tab */}
                {activeTab === 'basic' && (
                    <div className="space-y-6">
                        <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">Story Configuration</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Scene Count
                                    </label>
                                    <input
                                        type="number"
                                        min="2"
                                        max="10"
                                        value={config.sceneCount}
                                        onChange={(e) => handleConfigChange('sceneCount', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Mood & Pacing
                                    </label>
                                    <select
                                        value={config.mood}
                                        onChange={(e) => handleConfigChange('mood', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                                    >
                                        {MOOD_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value} className="bg-slate-800">
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Video Length
                                    </label>
                                    <select
                                        value={config.videoLength}
                                        onChange={(e) => handleConfigChange('videoLength', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                                    >
                                        {VIDEO_LENGTH_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value} className="bg-slate-800">
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Description Language
                                    </label>
                                    <select
                                        value={config.descriptionLanguage}
                                        onChange={(e) => handleConfigChange('descriptionLanguage', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                                    >
                                        {DESCRIPTION_LANGUAGE_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value} className="bg-slate-800">
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Aspect Ratio
                                    </label>
                                    <select
                                        value={config.aspectRatio}
                                        onChange={(e) => handleConfigChange('aspectRatio', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                                    >
                                        {ASPECT_RATIO_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value} className="bg-slate-800">
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Visual Style
                                    </label>
                                    <select
                                        value={config.visualStyle}
                                        onChange={(e) => handleConfigChange('visualStyle', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                                    >
                                        {VISUAL_STYLE_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value} className="bg-slate-800">
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border border-slate-700 rounded-lg bg-slate-900/50">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4">AI Models</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Text Model
                                    </label>
                                    <select
                                        value={config.textModel}
                                        onChange={(e) => handleConfigChange('textModel', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                                    >
                                        {TEXT_MODEL_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value} className="bg-slate-800">
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {TEXT_MODEL_OPTIONS.find(o => o.value === config.textModel)?.description}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Image Model
                                    </label>
                                    <select
                                        value={config.imageModel}
                                        onChange={(e) => handleConfigChange('imageModel', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                                    >
                                        {IMAGE_MODEL_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value} className="bg-slate-800">
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {IMAGE_MODEL_OPTIONS.find(o => o.value === config.imageModel)?.description}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">
                                        Video Model
                                    </label>
                                    <select
                                        value={config.videoModel}
                                        onChange={(e) => handleConfigChange('videoModel', e.target.value)}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-white"
                                    >
                                        {VIDEO_MODEL_OPTIONS.map(o => (
                                            <option key={o.value} value={o.value} className="bg-slate-800">
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {VIDEO_MODEL_OPTIONS.find(o => o.value === config.videoModel)?.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Characters Tab */}
                {activeTab === 'characters' && (
                    <CharacterManager
                        characters={characters}
                        onCharactersUpdate={setCharacters}
                    />
                )}

                {/* Style Tab */}
                {activeTab === 'style' && (
                    <StyleGuideEditor
                        styleGuide={styleGuide}
                        onStyleGuideUpdate={setStyleGuide}
                    />
                )}

                {/* Advanced Tab */}
                {activeTab === 'advanced' && (
                    <div className="space-y-6">
                        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Image Quality Settings</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">
                                        Sampling Steps
                                    </label>
                                    <input
                                        type="range"
                                        min="20"
                                        max="150"
                                        value={qualitySettings.steps}
                                        onChange={(e) => setQualitySettings({
                                            ...qualitySettings,
                                            steps: parseInt(e.target.value)
                                        })}
                                        className="w-full"
                                    />
                                    <div className="text-sm text-slate-500 mt-1">
                                        {qualitySettings.steps} steps (Higher = Better quality, slower)
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">
                                        CFG Scale
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        step="0.5"
                                        value={qualitySettings.cfgScale}
                                        onChange={(e) => setQualitySettings({
                                            ...qualitySettings,
                                            cfgScale: parseFloat(e.target.value)
                                        })}
                                        className="w-full"
                                    />
                                    <div className="text-sm text-slate-500 mt-1">
                                        {qualitySettings.cfgScale} (Controls adherence to prompt)
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">
                                        Denoise Strength
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={qualitySettings.denoise}
                                        onChange={(e) => setQualitySettings({
                                            ...qualitySettings,
                                            denoise: parseFloat(e.target.value)
                                        })}
                                        className="w-full"
                                    />
                                    <div className="text-sm text-slate-500 mt-1">
                                        {qualitySettings.denoise} (Lower = More consistent)
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={qualitySettings.upscale}
                                        onChange={(e) => setQualitySettings({
                                            ...qualitySettings,
                                            upscale: e.target.checked
                                        })}
                                        className="w-4 h-4 text-purple-600"
                                    />
                                    <span className="text-white">
                                        Enable 4x AI Upscaling
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        (Increases resolution to 4K/8K)
                                    </span>
                                </label>
                                
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={qualitySettings.enhanceFaces}
                                        onChange={(e) => setQualitySettings({
                                            ...qualitySettings,
                                            enhanceFaces: e.target.checked
                                        })}
                                        className="w-4 h-4 text-purple-600"
                                    />
                                    <span className="text-white">
                                        Enable Face Enhancement
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        (GFPGAN/CodeFormer for better faces)
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                            <h3 className="text-lg font-semibold text-white mb-4">Batch Processing</h3>
                            <p className="text-slate-400 mb-4">
                                Generate multiple variations for each scene to choose the best result
                            </p>
                            <div className="flex items-center gap-4">
                                <label className="text-sm text-slate-400">
                                    Variations per scene:
                                </label>
                                <select className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600">
                                    <option value="1">1 (Fastest)</option>
                                    <option value="3">3 (Recommended)</option>
                                    <option value="5">5 (Best quality)</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-amber-900/20 border border-amber-700 p-4 rounded-lg">
                            <div className="flex gap-3">
                                <span className="text-amber-400 text-xl">⚠️</span>
                                <div>
                                    <h4 className="text-amber-400 font-medium">Professional Mode Tips</h4>
                                    <ul className="text-sm text-amber-300/80 mt-2 space-y-1">
                                        <li>• Higher sampling steps = better quality but slower generation</li>
                                        <li>• CFG Scale 7-9 is optimal for most scenes</li>
                                        <li>• Use consistent seeds for character continuity</li>
                                        <li>• Upscaling significantly increases generation time</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfessionalStoryboardSettings;