import React, { useState, useCallback } from 'react';
import { Character } from '../../types';
import CharacterCard from './CharacterCard';
import { useTranslation } from '../../i18n/LanguageContext';
import { CharacterPresetSelector } from './CharacterPresetSelector';
import { CHARACTER_PRESETS } from '../../data/characterPresets';
import { Sparkles } from 'lucide-react';

interface CharacterManagerProps {
    characters: Character[];
    onCharactersUpdate: (characters: Character[]) => void;
    onGenerateCharacterImage?: (character: Character) => Promise<string>;
    onSaveCharacterSet?: (name: string) => Promise<void>;
    isGenerating?: boolean;
}

const CharacterManager: React.FC<CharacterManagerProps> = ({
    characters,
    onCharactersUpdate,
    onGenerateCharacterImage,
    onSaveCharacterSet,
    isGenerating = false
}) => {
    const { t } = useTranslation();
    const [isAddingCharacter, setIsAddingCharacter] = useState(false);
    const [newCharacter, setNewCharacter] = useState<Partial<Character>>({
        name: '',
        role: 'supporting',
        physicalDescription: '',
        clothingDescription: '',
        personalityTraits: ''
    });
    const [characterSetName, setCharacterSetName] = useState('');
    const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);
    const [showPresetSelector, setShowPresetSelector] = useState(false);

    const handleAddCharacter = () => {
        if (newCharacter.name && newCharacter.physicalDescription) {
            const character: Character = {
                id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: newCharacter.name,
                role: newCharacter.role as Character['role'],
                physicalDescription: newCharacter.physicalDescription,
                clothingDescription: newCharacter.clothingDescription || '',
                personalityTraits: newCharacter.personalityTraits,
                identityMarkers: []
            };
            
            onCharactersUpdate([...characters, character]);
            setNewCharacter({
                name: '',
                role: 'supporting',
                physicalDescription: '',
                clothingDescription: '',
                personalityTraits: ''
            });
            setIsAddingCharacter(false);
        }
    };

    const handleEditCharacter = (updatedCharacter: Character) => {
        const updatedCharacters = characters.map(char => 
            char.id === updatedCharacter.id ? updatedCharacter : char
        );
        onCharactersUpdate(updatedCharacters);
    };

    const handleDeleteCharacter = (id: string) => {
        const updatedCharacters = characters.filter(char => char.id !== id);
        onCharactersUpdate(updatedCharacters);
    };

    const handleGenerateImage = useCallback(async (character: Character) => {
        if (!onGenerateCharacterImage) return;
        
        try {
            setGeneratingImageId(character.id);
            const imageUrl = await onGenerateCharacterImage(character);
            
            // Update character with generated image
            const updatedCharacter = { ...character, referenceImageUrl: imageUrl };
            handleEditCharacter(updatedCharacter);
        } catch (error) {
            console.error('Failed to generate character image:', error);
        } finally {
            setGeneratingImageId(null);
        }
    }, [onGenerateCharacterImage]);

    const handleSaveCharacterSet = async () => {
        if (onSaveCharacterSet && characterSetName.trim()) {
            try {
                await onSaveCharacterSet(characterSetName.trim());
                setCharacterSetName('');
                // Show success message
                alert('캐릭터셋이 저장되었습니다!');
            } catch (error) {
                console.error('Failed to save character set:', error);
                alert('캐릭터셋 저장에 실패했습니다.');
            }
        }
    };

    const getCharactersByRole = (role: Character['role']) => {
        return characters.filter(char => char.role === role);
    };

    return (
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">캐릭터 설정</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        스토리보드 전체에서 일관된 캐릭터를 유지합니다
                    </p>
                </div>
                
                <button
                    onClick={() => setIsAddingCharacter(true)}
                    disabled={isAddingCharacter}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                >
                    + 캐릭터 추가
                </button>
            </div>

            {/* Add New Character Form */}
            {isAddingCharacter && (
                <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">새 캐릭터 추가</h4>
                        <button
                            type="button"
                            onClick={() => setShowPresetSelector(!showPresetSelector)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            프리셋 선택기
                        </button>
                    </div>
                    
                    {/* Preset Selector */}
                    {showPresetSelector && (
                        <div className="mb-4">
                            <CharacterPresetSelector
                                onPresetSelect={(presets) => {
                                    // 카테고리별 필드 분리
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
                                    
                                    // 각 필드에 적절한 프롬프트 입력
                                    if (physicalPrompts.length > 0) {
                                        const currentPhysical = newCharacter.physicalDescription || '';
                                        const newPhysical = currentPhysical 
                                            ? `${currentPhysical}, ${physicalPrompts.join(', ')}`
                                            : physicalPrompts.join(', ');
                                        setNewCharacter(prev => ({ ...prev, physicalDescription: newPhysical }));
                                    }
                                    
                                    if (clothingPrompts.length > 0) {
                                        const currentClothing = newCharacter.clothingDescription || '';
                                        const newClothing = currentClothing
                                            ? `${currentClothing}, ${clothingPrompts.join(', ')}`
                                            : clothingPrompts.join(', ');
                                        setNewCharacter(prev => ({ ...prev, clothingDescription: newClothing }));
                                    }
                                    
                                    if (personalityPrompts.length > 0) {
                                        const currentPersonality = newCharacter.personalityTraits || '';
                                        const newPersonality = currentPersonality
                                            ? `${currentPersonality}, ${personalityPrompts.join(', ')}`
                                            : personalityPrompts.join(', ');
                                        setNewCharacter(prev => ({ ...prev, personalityTraits: newPersonality }));
                                    }
                                }}
                                onGeneratePrompt={(prompt) => {
                                    // 전체 프롬프트를 physicalDescription에 추가 (호환성을 위해 유지)
                                    const currentDesc = newCharacter.physicalDescription || '';
                                    const newDesc = currentDesc ? `${currentDesc}, ${prompt}` : prompt;
                                    setNewCharacter({ ...newCharacter, physicalDescription: newDesc });
                                    setShowPresetSelector(false);
                                }}
                            />
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                캐릭터 이름 *
                            </label>
                            <input
                                type="text"
                                value={newCharacter.name}
                                onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                                className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
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
                                className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                            >
                                <option value="protagonist">주인공</option>
                                <option value="supporting">조연</option>
                                <option value="extra">엑스트라</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            외모 설명 *
                        </label>
                        <textarea
                            value={newCharacter.physicalDescription}
                            onChange={(e) => setNewCharacter({ ...newCharacter, physicalDescription: e.target.value })}
                            className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
                            rows={3}
                            placeholder="예: 30대 초반 남성, 짧은 검은 머리, 날카로운 눈매, 운동선수 체격"
                        />
                    </div>
                    
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            의상 설명 *
                        </label>
                        <textarea
                            value={newCharacter.clothingDescription}
                            onChange={(e) => setNewCharacter({ ...newCharacter, clothingDescription: e.target.value })}
                            className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
                            rows={2}
                            placeholder="예: 검은색 정장, 흰 셔츠, 빨간 넥타이"
                        />
                    </div>
                    
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            성격 특징 (선택)
                        </label>
                        <textarea
                            value={newCharacter.personalityTraits}
                            onChange={(e) => setNewCharacter({ ...newCharacter, personalityTraits: e.target.value })}
                            className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
                            rows={2}
                            placeholder="예: 차분하고 분석적, 리더십이 강함"
                        />
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => setIsAddingCharacter(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleAddCharacter}
                            disabled={!newCharacter.name || !newCharacter.physicalDescription}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            추가
                        </button>
                    </div>
                </div>
            )}

            {/* Characters List */}
            {characters.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <p className="mb-2">등록된 캐릭터가 없습니다</p>
                    <p className="text-sm">캐릭터를 추가하여 일관된 스토리보드를 생성하세요</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Protagonists */}
                    {getCharactersByRole('protagonist').length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                                주인공 ({getCharactersByRole('protagonist').length})
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {getCharactersByRole('protagonist').map(character => (
                                    <CharacterCard
                                        key={character.id}
                                        character={character}
                                        onEdit={handleEditCharacter}
                                        onDelete={handleDeleteCharacter}
                                        onGenerateImage={() => handleGenerateImage(character)}
                                        isGeneratingImage={generatingImageId === character.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Supporting */}
                    {getCharactersByRole('supporting').length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                                조연 ({getCharactersByRole('supporting').length})
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {getCharactersByRole('supporting').map(character => (
                                    <CharacterCard
                                        key={character.id}
                                        character={character}
                                        onEdit={handleEditCharacter}
                                        onDelete={handleDeleteCharacter}
                                        onGenerateImage={() => handleGenerateImage(character)}
                                        isGeneratingImage={generatingImageId === character.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Extras */}
                    {getCharactersByRole('extra').length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
                                엑스트라 ({getCharactersByRole('extra').length})
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {getCharactersByRole('extra').map(character => (
                                    <CharacterCard
                                        key={character.id}
                                        character={character}
                                        onEdit={handleEditCharacter}
                                        onDelete={handleDeleteCharacter}
                                        onGenerateImage={() => handleGenerateImage(character)}
                                        isGeneratingImage={generatingImageId === character.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Save Character Set */}
            {characters.length > 0 && onSaveCharacterSet && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={characterSetName}
                            onChange={(e) => setCharacterSetName(e.target.value)}
                            placeholder="캐릭터셋 이름 입력"
                            className="flex-1 bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                        />
                        <button
                            onClick={handleSaveCharacterSet}
                            disabled={!characterSetName.trim() || characters.length === 0}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            캐릭터셋 저장
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CharacterManager;