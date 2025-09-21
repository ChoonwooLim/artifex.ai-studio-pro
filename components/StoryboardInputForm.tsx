import React, { useState, useEffect } from 'react';
import StoryboardSettings from './StoryboardSettings';
import { StoryboardConfig, Character } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { useTranslation } from '../i18n/LanguageContext';
import CharacterManager from './character/CharacterManager';
import CharacterCreationWizard from './character/CharacterCreationWizard';
import characterStorageService from '../services/characterStorageService';

interface StoryboardInputFormProps {
    onGenerate: (idea: string, config: StoryboardConfig) => void;
    isLoading: boolean;
    config: StoryboardConfig;
    setConfig: (config: StoryboardConfig) => void;
    onShowSampleGallery: () => void;
    initialIdea?: string;  // ✅ 추가
    onGenerateCharacterImage?: (character: Character) => Promise<string>;
}

const StoryboardInputForm: React.FC<StoryboardInputFormProps> = ({ onGenerate, isLoading, config, setConfig, onShowSampleGallery, initialIdea, onGenerateCharacterImage }) => {
    const { t } = useTranslation();
    const [idea, setIdea] = useState(initialIdea || '');
    const [showSettings, setShowSettings] = useState(true);
    const [showCharacterManager, setShowCharacterManager] = useState(false);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [showCharacterWizard, setShowCharacterWizard] = useState(false);

    // useEffect 추가하여 props 변경 시 업데이트
    useEffect(() => {
        if (initialIdea) {
            setIdea(initialIdea);
        }
    }, [initialIdea]);

    // Update config with characters when they change
    useEffect(() => {
        setConfig({
            ...config,
            characters: characters,
            useCharacterConsistency: characters.length > 0
        });
    }, [characters]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (idea.trim()) {
            const configWithCharacters: StoryboardConfig = {
                ...config,
                characters: characters,
                useCharacterConsistency: characters.length > 0
            };
            onGenerate(idea, configWithCharacters);
        }
    };

    const handleCharacterCreate = (character: Character) => {
        setCharacters([...characters, character]);
        setShowCharacterWizard(false);
    };

    const handleSaveCharacterSet = async (name: string) => {
        try {
            await characterStorageService.saveCharacterSet({
                id: `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: name,
                characters: characters,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Failed to save character set:', error);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="story-idea" className="block text-sm font-medium text-slate-300 mb-2">
                    {t('storyboardForm.ideaLabel')}
                </label>
                <textarea
                    id="story-idea"
                    rows={4}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder={t('storyboardForm.ideaPlaceholder')}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setShowCharacterManager(!showCharacterManager)}
                        className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-2"
                    >
                        <span>👥</span>
                        {showCharacterManager ? '캐릭터 관리 숨기기' : '캐릭터 관리'} 
                        {characters.length > 0 && (
                            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                                {characters.length}
                            </span>
                        )}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-sm text-blue-400 hover:text-blue-300"
                    >
                        {showSettings ? t('storyboardForm.hideSettings') : t('storyboardForm.showSettings')}
                    </button>
                </div>
            </div>

            {/* Character Manager Section */}
            {showCharacterManager && (
                <div className="animate-fade-in">
                    <CharacterManager
                        characters={characters}
                        onCharactersUpdate={setCharacters}
                        onGenerateCharacterImage={onGenerateCharacterImage}
                        onSaveCharacterSet={handleSaveCharacterSet}
                        isGenerating={isLoading}
                    />
                </div>
            )}

            {/* Settings Section */}
            {showSettings && (
                <div className="animate-fade-in">
                    <StoryboardSettings config={config} setConfig={setConfig} />
                </div>
            )}
            
            {/* Character Creation Wizard Modal */}
            {showCharacterWizard && (
                <CharacterCreationWizard
                    onCreateCharacter={handleCharacterCreate}
                    onCancel={() => setShowCharacterWizard(false)}
                />
            )}
            
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <button
                    type="submit"
                    disabled={isLoading || !idea.trim()}
                    className="w-full sm:w-auto flex-grow flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isLoading ? (
                        <>
                           <LoadingSpinner />
                           <span className="ml-2">{t('storyboardForm.generating')}</span>
                        </>
                    ) : (
                       t('storyboardForm.generateButton')
                    )}
                </button>
                 <button
                    type="button"
                    onClick={onShowSampleGallery}
                    className="w-full sm:w-auto bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                    {t('storyboardForm.loadSample')}
                </button>
            </div>
        </form>
    );
};

export default StoryboardInputForm;
