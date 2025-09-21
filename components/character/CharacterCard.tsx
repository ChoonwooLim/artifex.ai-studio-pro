import React, { useState } from 'react';
import { Character } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface CharacterCardProps {
    character: Character;
    onEdit: (character: Character) => void;
    onDelete: (id: string) => void;
    onGenerateImage?: () => void;
    isGeneratingImage?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
    character,
    onEdit,
    onDelete,
    onGenerateImage,
    isGeneratingImage = false
}) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [editedCharacter, setEditedCharacter] = useState<Character>(character);

    const handleSave = () => {
        onEdit(editedCharacter);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedCharacter(character);
        setIsEditing(false);
    };

    const getRoleBadgeColor = (role: Character['role']) => {
        switch (role) {
            case 'protagonist':
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
            case 'supporting':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
            case 'extra':
                return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
        }
    };

    const getRoleLabel = (role: Character['role']) => {
        switch (role) {
            case 'protagonist':
                return '주인공';
            case 'supporting':
                return '조연';
            case 'extra':
                return '엑스트라';
        }
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editedCharacter.name}
                            onChange={(e) => setEditedCharacter({
                                ...editedCharacter,
                                name: e.target.value
                            })}
                            className="bg-slate-700 text-white px-2 py-1 rounded text-lg font-semibold"
                            autoFocus
                        />
                    ) : (
                        <h3 className="text-lg font-semibold text-white">
                            {character.name}
                        </h3>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(character.role)}`}>
                        {getRoleLabel(character.role)}
                    </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="text-green-400 hover:text-green-300 text-sm"
                            >
                                저장
                            </button>
                            <button
                                onClick={handleCancel}
                                className="text-gray-400 hover:text-gray-300 text-sm"
                            >
                                취소
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                                편집
                            </button>
                            <button
                                onClick={() => onDelete(character.id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                            >
                                삭제
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Reference Image */}
            {character.referenceImageUrl && (
                <div className="mb-3">
                    <img 
                        src={character.referenceImageUrl} 
                        alt={`${character.name} reference`}
                        className="w-full h-48 object-cover rounded-lg"
                    />
                </div>
            )}

            {/* Generate Image Button */}
            {!character.referenceImageUrl && onGenerateImage && (
                <button
                    onClick={onGenerateImage}
                    disabled={isGeneratingImage}
                    className="w-full mb-3 py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                    {isGeneratingImage ? '이미지 생성 중...' : '레퍼런스 이미지 생성'}
                </button>
            )}

            {/* Character Details */}
            <div className="space-y-3">
                {/* Physical Description */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                        외모 설명
                    </label>
                    {isEditing ? (
                        <textarea
                            value={editedCharacter.physicalDescription}
                            onChange={(e) => setEditedCharacter({
                                ...editedCharacter,
                                physicalDescription: e.target.value
                            })}
                            className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded resize-none"
                            rows={2}
                        />
                    ) : (
                        <p className="text-gray-300 text-sm">
                            {character.physicalDescription || '(설명 없음)'}
                        </p>
                    )}
                </div>

                {/* Clothing Description */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                        의상 설명
                    </label>
                    {isEditing ? (
                        <textarea
                            value={editedCharacter.clothingDescription}
                            onChange={(e) => setEditedCharacter({
                                ...editedCharacter,
                                clothingDescription: e.target.value
                            })}
                            className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded resize-none"
                            rows={2}
                        />
                    ) : (
                        <p className="text-gray-300 text-sm">
                            {character.clothingDescription || '(설명 없음)'}
                        </p>
                    )}
                </div>

                {/* Personality Traits */}
                {(character.personalityTraits || isEditing) && (
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                            성격 특징
                        </label>
                        {isEditing ? (
                            <textarea
                                value={editedCharacter.personalityTraits || ''}
                                onChange={(e) => setEditedCharacter({
                                    ...editedCharacter,
                                    personalityTraits: e.target.value
                                })}
                                className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded resize-none"
                                rows={2}
                                placeholder="선택 사항"
                            />
                        ) : (
                            <p className="text-gray-300 text-sm">
                                {character.personalityTraits}
                            </p>
                        )}
                    </div>
                )}

                {/* Identity Markers */}
                {(character.identityMarkers && character.identityMarkers.length > 0) && (
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                            특징적 표식
                        </label>
                        <div className="flex flex-wrap gap-1">
                            {character.identityMarkers.map((marker, index) => (
                                <span 
                                    key={index}
                                    className="px-2 py-0.5 bg-slate-700 text-gray-300 text-xs rounded-full"
                                >
                                    {marker}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Role Selection (Edit mode only) */}
                {isEditing && (
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                            역할
                        </label>
                        <select
                            value={editedCharacter.role}
                            onChange={(e) => setEditedCharacter({
                                ...editedCharacter,
                                role: e.target.value as Character['role']
                            })}
                            className="w-full bg-slate-700 text-white text-sm px-3 py-2 rounded"
                        >
                            <option value="protagonist">주인공</option>
                            <option value="supporting">조연</option>
                            <option value="extra">엑스트라</option>
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CharacterCard;