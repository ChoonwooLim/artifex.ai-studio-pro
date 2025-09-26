import React, { useState, useCallback, useRef } from 'react';
import {
    Users,
    Sparkles,
    Camera,
    Download,
    Upload,
    Save,
    Image,
    Palette,
    Edit3,
    Plus,
    Trash2,
    Eye,
    RefreshCw,
    Settings,
    Grid,
    List,
    ChevronRight,
    ChevronDown,
    Check,
    X,
    Box,
    Video,
    User,
    Zap,
    Shield
} from 'lucide-react';
import { Character } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import CharacterManager from './character/CharacterManager';
import CharacterPresetModal from './character/CharacterPresetModal';
import { CHARACTER_PRESETS, generatePromptFromPresets } from '../data/characterPresets';
import * as geminiService from '../services/geminiService';
import { AICharacterGenerator, Character2DGenerationOptions, Character3DGenerationOptions, DigitalHumanOptions } from '../services/characterGeneration/aiCharacterGenerator';
import { GaussianSplattingRenderer } from '../services/characterGeneration/gaussianSplattingRenderer';

interface CharacterCreatorProps {
    onGenerateCharacterImage?: (character: Character) => Promise<string>;
    apiKeys: Record<string, string>;
    onUpdateApiKey?: (service: string, key: string) => void;
}

interface CharacterWithExtras extends Character {
    characterStyle?: 'cinematic' | 'photorealistic' | 'animation' | 'anime' | 'concept-art';
    fullBodyReference?: string;
    headShotReference?: string;
    poseReferences?: string[];
    generatedImages?: string[];
    // AI Generation features
    characterDNA?: any;
    model3D?: {
        url: string;
        format: string;
        preview: string;
    };
    video?: {
        url: string;
        thumbnail: string;
    };
    digitalHuman?: {
        avatarId: string;
        previewUrl: string;
    };
    blockchainTx?: string;
}

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ 
    onGenerateCharacterImage,
    apiKeys,
    onUpdateApiKey
}) => {
    const { t } = useTranslation();
    const [characters, setCharacters] = useState<CharacterWithExtras[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<CharacterWithExtras | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [presetModalState, setPresetModalState] = useState<{ isOpen: boolean; target: 'new' | 'existing' }>({ isOpen: false, target: 'new' });
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationType, setGenerationType] = useState<'fullbody' | 'headshot' | 'custom'>('fullbody');
    const [customPrompt, setCustomPrompt] = useState('');
    const [aiGenerator, setAiGenerator] = useState<AICharacterGenerator | null>(null);
    const [rendererContainer, setRendererContainer] = useState<HTMLDivElement | null>(null);
    const [gaussianRenderer, setGaussianRenderer] = useState<GaussianSplattingRenderer | null>(null);
    const [generation2DOptions, setGeneration2DOptions] = useState<Character2DGenerationOptions>({
        model: 'midjourney-v7',
        style: 'cinematic',
        quality: 'standard',
        aspectRatio: '16:9',
        variations: 4,
        video: false
    });
    const [generation3DOptions, setGeneration3DOptions] = useState<Character3DGenerationOptions>({
        model: 'csm-ai',
        quality: 'standard',
        format: 'glb',
        topology: 'auto',
        textureResolution: '4k',
        rigging: true,
        animations: ['idle', 'walk', 'run']
    });
    const [digitalHumanOptions, setDigitalHumanOptions] = useState<DigitalHumanOptions>({
        provider: 'did-agents-2',
        voice: 'en-US-Neural',
        language: 'en',
        emotions: ['happy', 'sad', 'surprised', 'neutral'],
        gestures: true,
        lipSync: true,
        realTimeConversation: false
    });
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [generationProgress, setGenerationProgress] = useState('');

    const [newCharacter, setNewCharacter] = useState<Partial<CharacterWithExtras>>({
        name: '',
        role: 'supporting',
        physicalDescription: '',
        clothingDescription: '',
        personalityTraits: '',
        characterStyle: 'cinematic'
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const openPresetModal = useCallback((target: 'new' | 'existing') => {
        setPresetModalState({ isOpen: true, target });
    }, []);

    // Initialize AI Generator
    React.useEffect(() => {
        if (apiKeys) {
            const generator = new AICharacterGenerator(apiKeys);
            setAiGenerator(generator);
        }
    }, [apiKeys]);

    // Initialize Gaussian Splatting Renderer
    React.useEffect(() => {
        if (rendererContainer && !gaussianRenderer) {
            const renderer = new GaussianSplattingRenderer(rendererContainer, {
                resolution: '4k',
                targetFPS: 120,
                quality: 'ultra',
                enablePostProcessing: true
            });
            setGaussianRenderer(renderer);
        }

        return () => {
            if (gaussianRenderer) {
                gaussianRenderer.destroy();
            }
        };
    }, [rendererContainer]);

    const closePresetModal = useCallback(() => {
        setPresetModalState(prev => ({ ...prev, isOpen: false }));
    }, []);

    // Character CRUD operations
    const handleAddCharacter = useCallback(() => {
        if (newCharacter.name && newCharacter.physicalDescription) {
            const character: CharacterWithExtras = {
                id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: newCharacter.name,
                role: newCharacter.role as Character['role'],
                physicalDescription: newCharacter.physicalDescription,
                clothingDescription: newCharacter.clothingDescription || '',
                personalityTraits: newCharacter.personalityTraits,
                characterStyle: newCharacter.characterStyle,
                identityMarkers: [],
                generatedImages: []
            };
            
            setCharacters([...characters, character]);
            setSelectedCharacter(character);
            setNewCharacter({
                name: '',
                role: 'supporting',
                physicalDescription: '',
                clothingDescription: '',
                personalityTraits: '',
                characterStyle: 'cinematic'
            });
            setIsCreatingNew(false);
            closePresetModal();
        }
    }, [newCharacter, characters]);

    const handleUpdateCharacter = useCallback((character: CharacterWithExtras) => {
        const updatedCharacters = characters.map(c => 
            c.id === character.id ? character : c
        );
        setCharacters(updatedCharacters);
    }, [characters]);

    const handleDeleteCharacter = useCallback((id: string) => {
        setCharacters(characters.filter(c => c.id !== id));
        if (selectedCharacter?.id === id) {
            setSelectedCharacter(null);
        }
    }, [characters, selectedCharacter]);

    // AI-powered 2D/3D generation
    const handleGenerateAICharacter = useCallback(async () => {
        if (!selectedCharacter || !aiGenerator) return;

        setIsGeneratingAI(true);
        setGenerationProgress('Initializing AI generation...');

        try {
            // Build comprehensive description from character data
            const fullDescription = `
                ${selectedCharacter.name}: ${selectedCharacter.physicalDescription}.
                Clothing: ${selectedCharacter.clothingDescription}.
                Personality: ${selectedCharacter.personalityTraits}.
                Role: ${selectedCharacter.role} character.
            `.trim();

            setGenerationProgress('Generating Character DNA...');

            // Generate complete character with AI
            const result = await aiGenerator.generateCharacterFromText(fullDescription, {
                generate2D: generation2DOptions,
                generate3D: generation3DOptions,
                generateDigitalHuman: digitalHumanOptions.provider !== 'none' ? digitalHumanOptions : undefined,
                registerOnBlockchain: false // Can be enabled via settings
            });

            setGenerationProgress('Processing results...');

            // Update character with AI-generated assets
            const updatedCharacter: CharacterWithExtras = {
                ...selectedCharacter,
                characterDNA: result.characterDNA,
                fullBodyReference: result.images2D?.url,
                generatedImages: result.images2D?.variations || [],
                model3D: result.model3D ? {
                    url: result.model3D.url,
                    format: result.model3D.format,
                    preview: result.model3D.preview
                } : undefined,
                video: result.video,
                digitalHuman: result.digitalHuman,
                blockchainTx: result.characterDNA.metadata.blockchainTx
            };

            handleUpdateCharacter(updatedCharacter);
            setSelectedCharacter(updatedCharacter);

            // Load 3D model in Gaussian renderer if available
            if (result.model3D?.gaussianSplat && gaussianRenderer) {
                await gaussianRenderer.loadGaussianSplat(result.model3D.gaussianSplat.url, selectedCharacter.id);
            } else if (result.model3D && gaussianRenderer) {
                await gaussianRenderer.loadModel(result.model3D.url, result.model3D.format as any);
            }

            setGenerationProgress(`✅ Generation complete! Cost: $${result.cost.total.toFixed(2)}`);
        } catch (error) {
            console.error('AI character generation failed:', error);
            alert(t('characterCreator.aiGenerationFailed') + ': ' + (error as Error).message);
            setGenerationProgress('');
        } finally {
            setIsGeneratingAI(false);
        }
    }, [selectedCharacter, aiGenerator, generation2DOptions, generation3DOptions, digitalHumanOptions, gaussianRenderer, handleUpdateCharacter]);

    // Original image generation
    const handleGenerateImage = useCallback(async (type: 'fullbody' | 'headshot' | 'custom') => {
        if (!selectedCharacter) return;
        
        setIsGenerating(true);
        try {
            let prompt = '';
            const styleModifier = selectedCharacter.characterStyle === 'photorealistic' 
                ? 'photorealistic, ultra realistic, 8k resolution' 
                : selectedCharacter.characterStyle === 'animation' 
                ? '3D animation style, pixar style, disney style'
                : selectedCharacter.characterStyle === 'anime'
                ? 'anime style, manga style, japanese animation'
                : selectedCharacter.characterStyle === 'concept-art'
                ? 'concept art, digital painting, artstation'
                : 'cinematic, movie still, film grain';
            
            if (type === 'fullbody') {
                prompt = `Full body portrait, standing pose, complete view from head to toe, ${selectedCharacter.physicalDescription}, ${selectedCharacter.clothingDescription}, ${styleModifier}, professional lighting, neutral background, character reference sheet`;
            } else if (type === 'headshot') {
                prompt = `Portrait headshot, close-up face, ${selectedCharacter.physicalDescription}, ${styleModifier}, professional lighting, neutral background, character reference`;
            } else {
                prompt = customPrompt || `${selectedCharacter.physicalDescription}, ${selectedCharacter.clothingDescription}, ${styleModifier}`;
            }
            
            const imageUrl = await geminiService.generateSingleImage(
                prompt,
                'imagen-3-fast-generate-001'
            );
            
            const updatedCharacter = { ...selectedCharacter };
            if (type === 'fullbody') {
                updatedCharacter.fullBodyReference = imageUrl;
            } else if (type === 'headshot') {
                updatedCharacter.headShotReference = imageUrl;
            } else {
                updatedCharacter.generatedImages = [...(updatedCharacter.generatedImages || []), imageUrl];
            }
            
            handleUpdateCharacter(updatedCharacter);
            setSelectedCharacter(updatedCharacter);
        } catch (error) {
            console.error('Failed to generate image:', error);
            alert(t('characterCreator.imageGenerationFailed') + ': ' + (error as Error).message);
        } finally {
            setIsGenerating(false);
        }
    }, [selectedCharacter, customPrompt, apiKeys, handleUpdateCharacter]);

    // Export/Import
    const handleExportCharacter = useCallback(() => {
        if (!selectedCharacter) return;
        
        const dataStr = JSON.stringify(selectedCharacter, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `character_${selectedCharacter.name.replace(/\s+/g, '_')}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }, [selectedCharacter]);

    const handleImportCharacter = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const character = JSON.parse(e.target?.result as string);
                character.id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                setCharacters([...characters, character]);
                setSelectedCharacter(character);
            } catch (error) {
                alert(t('characterCreator.cannotReadCharacterFile'));
            }
        };
        reader.readAsText(file);
    }, [characters]);

    // Preset handling
    const handleNewCharacterPresetPrompt = useCallback((prompt: string) => {
        setNewCharacter(prev => ({ 
            ...prev, 
            physicalDescription: prompt 
        }));
        closePresetModal();
    }, []);

    const handleSelectedCharacterPresetPrompt = useCallback((prompt: string) => {
        if (selectedCharacter) {
            const updatedCharacter = { 
                ...selectedCharacter, 
                physicalDescription: prompt 
            };
            handleUpdateCharacter(updatedCharacter);
            setSelectedCharacter(updatedCharacter);
            closePresetModal();
        }
    }, [selectedCharacter, handleUpdateCharacter]);

    const handlePresetApply = useCallback((presets: Record<string, string[]>, target: 'new' | 'existing') => {
        const physicalCategories = ['bodyType', 'faceShape', 'ageRange', 'hairStyle', 'specialFeatures'];
        const clothingCategories = ['clothingStyle', 'accessories'];
        const personalityCategories = ['personality'];
        
        const physicalPrompts: string[] = [];
        const clothingPrompts: string[] = [];
        const personalityPrompts: string[] = [];
        
        Object.entries(presets).forEach(([category, itemIds]) => {
            const categoryData = CHARACTER_PRESETS[category as keyof typeof CHARACTER_PRESETS];
            if (categoryData) {
                itemIds.forEach((itemId: string) => {
                    const item = categoryData.items.find((i: any) => i.id === itemId);
                    if (item) {
                        if (physicalCategories.includes(category)) {
                            physicalPrompts.push(item.prompt);
                        } else if (clothingCategories.includes(category)) {
                            clothingPrompts.push(item.prompt);
                        } else if (personalityCategories.includes(category)) {
                            personalityPrompts.push(item.prompt);
                        }
                    }
                });
            }
        });
        
        if (target === 'new') {
            if (physicalPrompts.length > 0) {
                setNewCharacter(prev => ({ 
                    ...prev, 
                    physicalDescription: physicalPrompts.join(', ') 
                }));
            }
            if (clothingPrompts.length > 0) {
                setNewCharacter(prev => ({ 
                    ...prev, 
                    clothingDescription: clothingPrompts.join(', ') 
                }));
            }
            if (personalityPrompts.length > 0) {
                setNewCharacter(prev => ({ 
                    ...prev, 
                    personalityTraits: personalityPrompts.join(', ') 
                }));
            }
        } else if (target === 'existing' && selectedCharacter) {
            const updatedCharacter = { ...selectedCharacter };
            if (physicalPrompts.length > 0) {
                updatedCharacter.physicalDescription = physicalPrompts.join(', ');
            }
            if (clothingPrompts.length > 0) {
                updatedCharacter.clothingDescription = clothingPrompts.join(', ');
            }
            if (personalityPrompts.length > 0) {
                updatedCharacter.personalityTraits = personalityPrompts.join(', ');
            }
            handleUpdateCharacter(updatedCharacter);
            setSelectedCharacter(updatedCharacter);
        }
        
    }, [selectedCharacter, handleUpdateCharacter]);

    return (
        <>
            <CharacterPresetModal
                isOpen={presetModalState.isOpen}
                onClose={closePresetModal}
                onPresetSelect={(presets) => handlePresetApply(presets, presetModalState.target)}
                onGeneratePrompt={presetModalState.target === 'new' ? handleNewCharacterPresetPrompt : handleSelectedCharacterPresetPrompt}
                context={presetModalState.target}
                characterName={selectedCharacter?.name}
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Users className="w-8 h-8 text-purple-400" />
                            <div>
                                <h1 className="text-2xl font-bold text-white">{t('characterCreator.title')}</h1>
                                <p className="text-sm text-gray-400 mt-1">
                                    {t('characterCreator.description')}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                title={t('characterCreator.changeViewMode')}
                            >
                                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                            </button>
                            
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                title={t('characterCreator.importCharacter')}
                            >
                                <Upload className="w-5 h-5" />
                            </button>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleImportCharacter}
                                className="hidden"
                            />
                            
                            <button
                                onClick={() => setIsCreatingNew(true)}
                                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span>{t('characterCreator.newCharacter')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel - Character List/Creation */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* New Character Creation */}
                        {isCreatingNew && (
                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white">{t('characterCreator.createNewCharacter')}</h3>
                                    <button
                                        onClick={() => openPresetModal('new')}
                                        className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-colors flex items-center space-x-1"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span className="text-sm">{t('characterCreator.presets')}</span>
                                    </button>
                                </div>

                                

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            {t('characterCreator.characterName')} *
                                        </label>
                                        <input
                                            type="text"
                                            value={newCharacter.name}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                                            placeholder={t('characterCreator.namePlaceholder')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            {t('characterCreator.role')}
                                        </label>
                                        <select
                                            value={newCharacter.role}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, role: e.target.value as Character['role'] })}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="protagonist">{t('characterCreator.protagonist')}</option>
                                            <option value="supporting">{t('characterCreator.supporting')}</option>
                                            <option value="extra">{t('characterCreator.extra')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            {t('characterCreator.characterStyle')}
                                        </label>
                                        <select
                                            value={newCharacter.characterStyle}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, characterStyle: e.target.value as any })}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="cinematic">{t('characterCreator.styleCinematic')}</option>
                                            <option value="photorealistic">{t('characterCreator.stylePhotorealistic')}</option>
                                            <option value="animation">{t('characterCreator.styleAnimation')}</option>
                                            <option value="anime">{t('characterCreator.styleAnime')}</option>
                                            <option value="concept-art">{t('characterCreator.styleConceptArt')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            {t('characterCreator.physicalDescription')} *
                                        </label>
                                        <textarea
                                            value={newCharacter.physicalDescription}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, physicalDescription: e.target.value })}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                                            rows={3}
                                            placeholder={t('characterCreator.physicalDescriptionPlaceholder')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            {t('characterCreator.clothingDescription')}
                                        </label>
                                        <textarea
                                            value={newCharacter.clothingDescription}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, clothingDescription: e.target.value })}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                                            rows={2}
                                            placeholder={t('characterCreator.clothingPlaceholder')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            {t('characterCreator.personalityTraits')}
                                        </label>
                                        <textarea
                                            value={newCharacter.personalityTraits}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, personalityTraits: e.target.value })}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                                            rows={2}
                                            placeholder={t('characterCreator.personalityPlaceholder')}
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-2 pt-2">
                                        <button
                                            onClick={() => setIsCreatingNew(false)}
                                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {t('characterCreator.cancel')}
                                        </button>
                                        <button
                                            onClick={handleAddCharacter}
                                            disabled={!newCharacter.name || !newCharacter.physicalDescription}
                                            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {t('characterCreator.create')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Character List */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4">{t('characterCreator.characterList')}</h3>
                            
                            {characters.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>{t('characterCreator.noCharactersYet')}</p>
                                </div>
                            ) : (
                                <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
                                    {characters.map(character => (
                                        <div
                                            key={character.id}
                                            onClick={() => setSelectedCharacter(character)}
                                            className={`
                                                p-3 bg-gray-700 rounded-lg cursor-pointer transition-all
                                                ${selectedCharacter?.id === character.id ? 'ring-2 ring-purple-500' : 'hover:bg-gray-600'}
                                                ${viewMode === 'list' ? 'flex items-center justify-between' : ''}
                                            `}
                                        >
                                            <div className={viewMode === 'list' ? 'flex items-center space-x-3' : ''}>
                                                {character.fullBodyReference && (
                                                    <img 
                                                        src={character.fullBodyReference} 
                                                        alt={character.name}
                                                        className={viewMode === 'grid' ? 'w-full h-24 object-cover rounded mb-2' : 'w-12 h-12 object-cover rounded'}
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium text-white">{character.name}</p>
                                                    <p className="text-xs text-gray-400">{character.role}</p>
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteCharacter(character.id);
                                                }}
                                                className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Character Details & Generation */}
                    <div className="lg:col-span-2">
                        {selectedCharacter ? (
                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedCharacter.name}</h2>
                                        <p className="text-gray-400">{selectedCharacter.role}</p>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => openPresetModal('existing')}
                                            className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                                            title={t('characterCreator.applyPresets')}
                                        >
                                            <Sparkles className="w-5 h-5" />
                                        </button>
                                        
                                        <button
                                            onClick={handleExportCharacter}
                                            className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                                            title={t('characterCreator.exportCharacter')}
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                

                                {/* Character Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            {t('characterCreator.physicalDescription')}
                                        </label>
                                        <textarea
                                            value={selectedCharacter.physicalDescription}
                                            onChange={(e) => {
                                                const updated = { ...selectedCharacter, physicalDescription: e.target.value };
                                                handleUpdateCharacter(updated);
                                                setSelectedCharacter(updated);
                                            }}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                                            rows={4}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            {t('characterCreator.clothingDescription')}
                                        </label>
                                        <textarea
                                            value={selectedCharacter.clothingDescription}
                                            onChange={(e) => {
                                                const updated = { ...selectedCharacter, clothingDescription: e.target.value };
                                                handleUpdateCharacter(updated);
                                                setSelectedCharacter(updated);
                                            }}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                                            rows={4}
                                        />
                                    </div>
                                </div>

                                {/* Image Generation Controls */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">{t('characterCreator.imageGeneration')}</h3>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <button
                                            onClick={() => handleGenerateImage('fullbody')}
                                            disabled={isGenerating}
                                            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 transition-colors flex items-center space-x-2"
                                        >
                                            <Camera className="w-4 h-4" />
                                            <span>{t('characterCreator.fullBodyReference')}</span>
                                        </button>
                                        
                                        <button
                                            onClick={() => handleGenerateImage('headshot')}
                                            disabled={isGenerating}
                                            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors flex items-center space-x-2"
                                        >
                                            <Camera className="w-4 h-4" />
                                            <span>{t('characterCreator.headshot')}</span>
                                        </button>
                                        
                                        <div className="flex-1 flex space-x-2">
                                            <input
                                                type="text"
                                                value={customPrompt}
                                                onChange={(e) => setCustomPrompt(e.target.value)}
                                                placeholder={t('characterCreator.customPromptPlaceholder')}
                                                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                                            />
                                            <button
                                                onClick={() => handleGenerateImage('custom')}
                                                disabled={isGenerating || !customPrompt}
                                                className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 transition-colors"
                                            >
                                                {t('characterCreator.generate')}
                                            </button>
                                        </div>
                                    </div>

                                    {isGenerating && (
                                        <div className="text-center py-4">
                                            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-400" />
                                            <p className="text-gray-400 mt-2">{t('characterCreator.generatingImage')}</p>
                                        </div>
                                    )}
                                </div>

                                {/* AI-Powered Generation (2025 High-End) */}
                                <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                                            <Zap className="w-5 h-5 text-yellow-400" />
                                            <span>AI-Powered Generation (2025 Tech)</span>
                                        </h3>
                                        {generationProgress && (
                                            <span className="text-sm text-green-400">{generationProgress}</span>
                                        )}
                                    </div>

                                    {/* 2D Generation Options */}
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">2D Image Generation</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                                            <select
                                                value={generation2DOptions.model}
                                                onChange={(e) => setGeneration2DOptions({...generation2DOptions, model: e.target.value as any})}
                                                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                            >
                                                <option value="midjourney-v7">Midjourney v7</option>
                                                <option value="google-imagen-4">Google Imagen 4</option>
                                                <option value="stable-diffusion-3.5">SD 3.5 Large</option>
                                                <option value="dall-e-3">DALL-E 3</option>
                                            </select>
                                            <select
                                                value={generation2DOptions.style}
                                                onChange={(e) => setGeneration2DOptions({...generation2DOptions, style: e.target.value as any})}
                                                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                            >
                                                <option value="photorealistic">Photorealistic</option>
                                                <option value="cinematic">Cinematic</option>
                                                <option value="anime">Anime</option>
                                                <option value="pixar">Pixar Style</option>
                                                <option value="concept-art">Concept Art</option>
                                            </select>
                                            <select
                                                value={generation2DOptions.quality}
                                                onChange={(e) => setGeneration2DOptions({...generation2DOptions, quality: e.target.value as any})}
                                                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="standard">Standard</option>
                                                <option value="high">High</option>
                                                <option value="ultra">Ultra</option>
                                            </select>
                                            <label className="flex items-center space-x-1 text-sm text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={generation2DOptions.video}
                                                    onChange={(e) => setGeneration2DOptions({...generation2DOptions, video: e.target.checked})}
                                                    className="rounded"
                                                />
                                                <span>Video</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* 3D Generation Options */}
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">3D Model Generation</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                                            <select
                                                value={generation3DOptions.model}
                                                onChange={(e) => setGeneration3DOptions({...generation3DOptions, model: e.target.value as any})}
                                                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                            >
                                                <option value="csm-ai">CSM AI (Best)</option>
                                                <option value="meshy-ai">Meshy AI</option>
                                                <option value="luma-genie">Luma Genie</option>
                                                <option value="stable-zero123">Stable Zero123</option>
                                            </select>
                                            <select
                                                value={generation3DOptions.format}
                                                onChange={(e) => setGeneration3DOptions({...generation3DOptions, format: e.target.value as any})}
                                                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                            >
                                                <option value="glb">GLB</option>
                                                <option value="fbx">FBX</option>
                                                <option value="obj">OBJ</option>
                                                <option value="usd">USD</option>
                                                <option value="gaussian-splat">Gaussian Splat</option>
                                            </select>
                                            <select
                                                value={generation3DOptions.textureResolution}
                                                onChange={(e) => setGeneration3DOptions({...generation3DOptions, textureResolution: e.target.value as any})}
                                                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                            >
                                                <option value="2k">2K</option>
                                                <option value="4k">4K</option>
                                                <option value="8k">8K</option>
                                            </select>
                                            <label className="flex items-center space-x-1 text-sm text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={generation3DOptions.rigging}
                                                    onChange={(e) => setGeneration3DOptions({...generation3DOptions, rigging: e.target.checked})}
                                                    className="rounded"
                                                />
                                                <span>Rigging</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Digital Human Options */}
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-300 mb-2">Digital Human</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                                            <select
                                                value={digitalHumanOptions.provider}
                                                onChange={(e) => setDigitalHumanOptions({...digitalHumanOptions, provider: e.target.value as any})}
                                                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                                            >
                                                <option value="none">None</option>
                                                <option value="did-agents-2">D-ID Agents 2.0</option>
                                                <option value="heygen-avatar-3">HeyGen Avatar 3</option>
                                                <option value="synthesia-personal">Synthesia Personal</option>
                                            </select>
                                            <label className="flex items-center space-x-1 text-sm text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={digitalHumanOptions.realTimeConversation}
                                                    onChange={(e) => setDigitalHumanOptions({...digitalHumanOptions, realTimeConversation: e.target.checked})}
                                                    className="rounded"
                                                />
                                                <span>Real-time</span>
                                            </label>
                                            <label className="flex items-center space-x-1 text-sm text-gray-300">
                                                <input
                                                    type="checkbox"
                                                    checked={digitalHumanOptions.lipSync}
                                                    onChange={(e) => setDigitalHumanOptions({...digitalHumanOptions, lipSync: e.target.checked})}
                                                    className="rounded"
                                                />
                                                <span>Lip Sync</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Generation Button */}
                                    <button
                                        onClick={handleGenerateAICharacter}
                                        disabled={isGeneratingAI}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 transition-all flex items-center justify-center space-x-2 font-semibold"
                                    >
                                        {isGeneratingAI ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                <span>Generating AI Character...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                <span>Generate Complete AI Character</span>
                                                <Box className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* 3D Viewer Container */}
                                {selectedCharacter?.model3D && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                                            <Box className="w-5 h-5" />
                                            <span>3D Model Viewer (Gaussian Splatting)</span>
                                        </h3>
                                        <div
                                            ref={setRendererContainer}
                                            className="w-full h-96 bg-gray-900 rounded-lg border border-gray-700"
                                        />
                                    </div>
                                )}

                                {/* Generated Images Gallery */}
                                <div className="space-y-4">
                                    {selectedCharacter.fullBodyReference && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-2">{t('characterCreator.fullBodyReference')}</h4>
                                            <img 
                                                src={selectedCharacter.fullBodyReference} 
                                                alt="Full Body Reference"
                                                className="w-full max-w-md rounded-lg"
                                            />
                                        </div>
                                    )}

                                    {selectedCharacter.headShotReference && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-2">{t('characterCreator.headshot')}</h4>
                                            <img 
                                                src={selectedCharacter.headShotReference} 
                                                alt="Headshot Reference"
                                                className="w-full max-w-md rounded-lg"
                                            />
                                        </div>
                                    )}

                                    {selectedCharacter.generatedImages && selectedCharacter.generatedImages.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-2">{t('characterCreator.additionalGeneratedImages')}</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {selectedCharacter.generatedImages.map((img, idx) => (
                                                    <img 
                                                        key={idx}
                                                        src={img} 
                                                        alt={`Generated ${idx}`}
                                                        className="w-full rounded-lg"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
                                <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                <p className="text-gray-400 text-lg">{t('characterCreator.selectOrCreateCharacter')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </>
);
};

export default CharacterCreator;

