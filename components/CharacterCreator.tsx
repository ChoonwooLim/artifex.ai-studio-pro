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
    X
} from 'lucide-react';
import { Character } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import CharacterManager from './character/CharacterManager';
import { CharacterPresetSelector } from './character/CharacterPresetSelector';
import { CHARACTER_PRESETS, generatePromptFromPresets } from '../data/characterPresets';
import { imageGenerator } from '../services/professionalImageGenerator';
import { characterManager } from '../services/characterConsistency';

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
    const [showPresetSelector, setShowPresetSelector] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationType, setGenerationType] = useState<'fullbody' | 'headshot' | 'custom'>('fullbody');
    const [customPrompt, setCustomPrompt] = useState('');
    const [selectedPresets, setSelectedPresets] = useState<Record<string, string[]>>({});
    
    const [newCharacter, setNewCharacter] = useState<Partial<CharacterWithExtras>>({
        name: '',
        role: 'supporting',
        physicalDescription: '',
        clothingDescription: '',
        personalityTraits: '',
        characterStyle: 'cinematic'
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

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
            setShowPresetSelector(false);
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

    // Image generation
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
            
            const imageUrl = await imageGenerator.generateImage(
                prompt,
                {
                    model: 'dall-e-3',
                    quality: 'hd',
                    style: 'vivid',
                    size: type === 'fullbody' ? '1024x1792' : '1024x1024'
                },
                apiKeys
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
            alert('이미지 생성 실패: ' + (error as Error).message);
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
                alert('캐릭터 파일을 읽을 수 없습니다.');
            }
        };
        reader.readAsText(file);
    }, [characters]);

    // Preset handling
    const handlePresetApply = useCallback((presets: Record<string, string[]>) => {
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
        
        if (isCreatingNew) {
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
        } else if (selectedCharacter) {
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
        
        setSelectedPresets(presets);
    }, [isCreatingNew, selectedCharacter, handleUpdateCharacter]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            {/* Header */}
            <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Users className="w-8 h-8 text-purple-400" />
                            <div>
                                <h1 className="text-2xl font-bold text-white">캐릭터 생성기</h1>
                                <p className="text-sm text-gray-400 mt-1">
                                    AI 기반 캐릭터 디자인 및 레퍼런스 생성
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                title="뷰 모드 변경"
                            >
                                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                            </button>
                            
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                title="캐릭터 가져오기"
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
                                <span>새 캐릭터</span>
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
                                    <h3 className="text-lg font-semibold text-white">새 캐릭터 만들기</h3>
                                    <button
                                        onClick={() => setShowPresetSelector(!showPresetSelector)}
                                        className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-colors flex items-center space-x-1"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span className="text-sm">프리셋</span>
                                    </button>
                                </div>

                                {showPresetSelector && (
                                    <div className="mb-4">
                                        <CharacterPresetSelector
                                            onPresetSelect={handlePresetApply}
                                            onGeneratePrompt={(prompt) => {
                                                setNewCharacter({ 
                                                    ...newCharacter, 
                                                    physicalDescription: prompt 
                                                });
                                                setShowPresetSelector(false);
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            캐릭터 이름 *
                                        </label>
                                        <input
                                            type="text"
                                            value={newCharacter.name}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                                            placeholder="예: 김철수, Sarah"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            역할
                                        </label>
                                        <select
                                            value={newCharacter.role}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, role: e.target.value as Character['role'] })}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="protagonist">주인공</option>
                                            <option value="supporting">조연</option>
                                            <option value="extra">엑스트라</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            캐릭터 스타일
                                        </label>
                                        <select
                                            value={newCharacter.characterStyle}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, characterStyle: e.target.value as any })}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="cinematic">영화 (Cinematic)</option>
                                            <option value="photorealistic">실사 (Photorealistic)</option>
                                            <option value="animation">애니메이션 (Animation)</option>
                                            <option value="anime">애니메 (Anime)</option>
                                            <option value="concept-art">컨셉 아트 (Concept Art)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            외모 설명 *
                                        </label>
                                        <textarea
                                            value={newCharacter.physicalDescription}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, physicalDescription: e.target.value })}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                                            rows={3}
                                            placeholder="프리셋을 선택하거나 직접 입력..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            의상 설명
                                        </label>
                                        <textarea
                                            value={newCharacter.clothingDescription}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, clothingDescription: e.target.value })}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                                            rows={2}
                                            placeholder="예: 검은 정장, 흰 셔츠"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            성격 특징
                                        </label>
                                        <textarea
                                            value={newCharacter.personalityTraits}
                                            onChange={(e) => setNewCharacter({ ...newCharacter, personalityTraits: e.target.value })}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none resize-none"
                                            rows={2}
                                            placeholder="예: 차분하고 분석적"
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-2 pt-2">
                                        <button
                                            onClick={() => setIsCreatingNew(false)}
                                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={handleAddCharacter}
                                            disabled={!newCharacter.name || !newCharacter.physicalDescription}
                                            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                                        >
                                            생성
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Character List */}
                        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4">캐릭터 목록</h3>
                            
                            {characters.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>아직 생성된 캐릭터가 없습니다</p>
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
                                            onClick={() => setShowPresetSelector(!showPresetSelector)}
                                            className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                                            title="프리셋 적용"
                                        >
                                            <Sparkles className="w-5 h-5" />
                                        </button>
                                        
                                        <button
                                            onClick={handleExportCharacter}
                                            className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                                            title="캐릭터 내보내기"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {showPresetSelector && (
                                    <div className="mb-6">
                                        <CharacterPresetSelector
                                            onPresetSelect={handlePresetApply}
                                            onGeneratePrompt={(prompt) => {
                                                const updatedCharacter = { 
                                                    ...selectedCharacter, 
                                                    physicalDescription: prompt 
                                                };
                                                handleUpdateCharacter(updatedCharacter);
                                                setSelectedCharacter(updatedCharacter);
                                                setShowPresetSelector(false);
                                            }}
                                        />
                                    </div>
                                )}

                                {/* Character Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            외모 설명
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
                                            의상 설명
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
                                    <h3 className="text-lg font-semibold text-white mb-4">이미지 생성</h3>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <button
                                            onClick={() => handleGenerateImage('fullbody')}
                                            disabled={isGenerating}
                                            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 transition-colors flex items-center space-x-2"
                                        >
                                            <Camera className="w-4 h-4" />
                                            <span>전신 레퍼런스</span>
                                        </button>
                                        
                                        <button
                                            onClick={() => handleGenerateImage('headshot')}
                                            disabled={isGenerating}
                                            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors flex items-center space-x-2"
                                        >
                                            <Camera className="w-4 h-4" />
                                            <span>헤드샷</span>
                                        </button>
                                        
                                        <div className="flex-1 flex space-x-2">
                                            <input
                                                type="text"
                                                value={customPrompt}
                                                onChange={(e) => setCustomPrompt(e.target.value)}
                                                placeholder="커스텀 프롬프트..."
                                                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                                            />
                                            <button
                                                onClick={() => handleGenerateImage('custom')}
                                                disabled={isGenerating || !customPrompt}
                                                className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-600 transition-colors"
                                            >
                                                생성
                                            </button>
                                        </div>
                                    </div>

                                    {isGenerating && (
                                        <div className="text-center py-4">
                                            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-400" />
                                            <p className="text-gray-400 mt-2">이미지 생성 중...</p>
                                        </div>
                                    )}
                                </div>

                                {/* Generated Images Gallery */}
                                <div className="space-y-4">
                                    {selectedCharacter.fullBodyReference && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-2">전신 레퍼런스</h4>
                                            <img 
                                                src={selectedCharacter.fullBodyReference} 
                                                alt="Full Body Reference"
                                                className="w-full max-w-md rounded-lg"
                                            />
                                        </div>
                                    )}

                                    {selectedCharacter.headShotReference && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-2">헤드샷</h4>
                                            <img 
                                                src={selectedCharacter.headShotReference} 
                                                alt="Headshot Reference"
                                                className="w-full max-w-md rounded-lg"
                                            />
                                        </div>
                                    )}

                                    {selectedCharacter.generatedImages && selectedCharacter.generatedImages.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-2">추가 생성 이미지</h4>
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
                                <p className="text-gray-400 text-lg">캐릭터를 선택하거나 새로 만들어주세요</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreator;