import React, { useState } from 'react';
import { VisualArtState, VisualArtEffect, MediaArtSourceImage, VisualArtConfig } from '../types';
import { VISUAL_ART_EFFECT_OPTIONS } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from '../i18n/LanguageContext';
import ImageUploader from './ImageUploader';
import VisualArtSettings from './VisualArtSettings';

interface VisualArtGeneratorProps {
    state: VisualArtState;
    setState: React.Dispatch<React.SetStateAction<VisualArtState>>;
    onGenerate: () => void;
}

const VisualArtGenerator: React.FC<VisualArtGeneratorProps> = ({ state, setState, onGenerate }) => {
    const { t } = useTranslation();
    const { inputText, config, resultVideoUrl, isLoading, error, sourceImage } = state;
    const [showSettings, setShowSettings] = useState(false);

    const handleConfigChange = (newConfig: VisualArtConfig) => {
        setState(s => ({ ...s, config: newConfig }));
    };
    
    const handleImageSelect = (image: MediaArtSourceImage) => {
        setState(s => ({ ...s, sourceImage: image, resultVideoUrl: null, error: null }));
    };

    const handleRemoveImage = () => {
        setState(s => ({ ...s, sourceImage: null }));
    };

    const isGenerateDisabled = isLoading || (!inputText.trim() && !sourceImage);

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-200">{t('visualArt.title')}</h2>
                <p className="text-sm text-slate-400 mt-2">{t('visualArt.instruction')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Image Input */}
                <div className="space-y-2">
                    <label className="block text-xs font-medium text-slate-400">
                        {t('visualArt.imageInputLabel')}
                    </label>
                    {sourceImage ? (
                        <div className="relative group">
                            <img src={sourceImage.url} alt={sourceImage.title} className="w-full rounded-xl shadow-lg" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                <button onClick={handleRemoveImage} className="bg-red-500/80 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-500 transition-colors">
                                    {t('visualArt.removeImage')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <ImageUploader onImageSelect={handleImageSelect} />
                    )}
                </div>
                
                {/* Text Input */}
                <div className="space-y-2">
                    <label htmlFor="visual-art-input" className="block text-xs font-medium text-slate-400">
                        {t('visualArt.textInputLabel')}
                    </label>
                    <textarea
                        id="visual-art-input"
                        rows={5}
                        value={inputText}
                        onChange={(e) => setState(s => ({ ...s, inputText: e.target.value, resultVideoUrl: null, error: null }))}
                        placeholder={t('visualArt.textInputPlaceholder')}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {showSettings ? t('visualArt.hideSettings') : t('visualArt.showSettings')}
                    </span>
                </button>
            </div>

            {showSettings && (
                <div className="animate-fade-in">
                    <VisualArtSettings config={config} setConfig={handleConfigChange} />
                </div>
            )}

            <div className="animate-fade-in space-y-8">
                
                {/* Generate Button */}
                <div className="pt-2">
                    <button
                        type="button"
                        onClick={onGenerate}
                        disabled={isGenerateDisabled}
                        className="w-full max-w-md mx-auto flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner />
                                <span className="ml-2">{t('visualArt.generating')}</span>
                            </>
                        ) : (
                            t('visualArt.generateButton')
                        )}
                    </button>
                </div>

                 {/* Result */}
                {(resultVideoUrl || isLoading || error) && (
                    <div className="space-y-4 pt-4">
                        <h3 className="text-xl font-semibold text-slate-200 text-center">{t('visualArt.resultTitle')}</h3>
                         <div className="relative max-w-lg mx-auto aspect-video bg-slate-900/70 border border-slate-700 rounded-2xl flex items-center justify-center">
                            {isLoading && (
                                <div className="text-center text-slate-400">
                                    <LoadingSpinner />
                                    <p className="text-sm mt-2">{t('storyboardDisplay.generatingClip')}</p>
                                    <p className="text-xs text-slate-500">{t('storyboardDisplay.generatingClipHint')}</p>
                                </div>
                            )}
                            {error && !isLoading && <p className="text-red-400 p-4 text-center">{error}</p>}
                            {resultVideoUrl && !isLoading && (
                                <video 
                                    src={resultVideoUrl} 
                                    controls 
                                    autoPlay
                                    loop
                                    className="w-full h-full object-contain rounded-2xl" 
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualArtGenerator;
