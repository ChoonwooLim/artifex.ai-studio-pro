import React, { useState } from 'react';
import { Character } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';

interface CharacterCreationWizardProps {
    onCreateCharacter: (character: Character) => void;
    onCancel: () => void;
    onGenerateDescription?: (prompt: string) => Promise<string>;
}

interface WizardStep {
    title: string;
    description: string;
}

const WIZARD_STEPS: WizardStep[] = [
    { title: '기본 정보', description: '캐릭터의 이름과 역할을 설정합니다' },
    { title: '외모 설정', description: '캐릭터의 신체적 특징을 정의합니다' },
    { title: '의상 설정', description: '캐릭터의 복장을 설명합니다' },
    { title: '개성 부여', description: '성격과 특징적 요소를 추가합니다' },
    { title: '확인', description: '생성된 캐릭터를 검토합니다' }
];

const CharacterCreationWizard: React.FC<CharacterCreationWizardProps> = ({
    onCreateCharacter,
    onCancel,
    onGenerateDescription
}) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const [characterData, setCharacterData] = useState<Partial<Character>>({
        name: '',
        role: 'supporting',
        physicalDescription: '',
        clothingDescription: '',
        personalityTraits: '',
        identityMarkers: []
    });

    const [tempIdentityMarker, setTempIdentityMarker] = useState('');

    const handleNext = () => {
        if (currentStep < WIZARD_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGenerateDescription = async (type: 'physical' | 'clothing' | 'personality') => {
        if (!onGenerateDescription) return;
        
        setIsGenerating(true);
        try {
            let prompt = '';
            switch (type) {
                case 'physical':
                    prompt = `Generate a detailed physical description for a ${characterData.role} character named ${characterData.name}. Include age, height, build, hair, eyes, and distinguishing features. Be specific and visual.`;
                    break;
                case 'clothing':
                    prompt = `Generate a detailed clothing description for ${characterData.name}, a ${characterData.role} character with this appearance: ${characterData.physicalDescription}. Be specific about colors, styles, and accessories.`;
                    break;
                case 'personality':
                    prompt = `Generate personality traits for ${characterData.name}, a ${characterData.role} character. Include 3-5 key personality traits that would be relevant for visual storytelling.`;
                    break;
            }
            
            const description = await onGenerateDescription(prompt);
            
            switch (type) {
                case 'physical':
                    setCharacterData({ ...characterData, physicalDescription: description });
                    break;
                case 'clothing':
                    setCharacterData({ ...characterData, clothingDescription: description });
                    break;
                case 'personality':
                    setCharacterData({ ...characterData, personalityTraits: description });
                    break;
            }
        } catch (error) {
            console.error('Failed to generate description:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddIdentityMarker = () => {
        if (tempIdentityMarker.trim()) {
            const markers = characterData.identityMarkers || [];
            setCharacterData({
                ...characterData,
                identityMarkers: [...markers, tempIdentityMarker.trim()]
            });
            setTempIdentityMarker('');
        }
    };

    const handleRemoveIdentityMarker = (index: number) => {
        const markers = characterData.identityMarkers || [];
        setCharacterData({
            ...characterData,
            identityMarkers: markers.filter((_, i) => i !== index)
        });
    };

    const handleFinish = () => {
        const character: Character = {
            id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: characterData.name || '',
            role: characterData.role as Character['role'],
            physicalDescription: characterData.physicalDescription || '',
            clothingDescription: characterData.clothingDescription || '',
            personalityTraits: characterData.personalityTraits,
            identityMarkers: characterData.identityMarkers
        };
        
        onCreateCharacter(character);
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 0:
                return characterData.name && characterData.role;
            case 1:
                return characterData.physicalDescription;
            case 2:
                return characterData.clothingDescription;
            default:
                return true;
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Basic Info
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                캐릭터 이름 *
                            </label>
                            <input
                                type="text"
                                value={characterData.name}
                                onChange={(e) => setCharacterData({ ...characterData, name: e.target.value })}
                                className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none"
                                placeholder="예: 김철수, Sarah Johnson"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                캐릭터 역할 *
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setCharacterData({ ...characterData, role: 'protagonist' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        characterData.role === 'protagonist'
                                            ? 'border-yellow-500 bg-yellow-500/20'
                                            : 'border-slate-600 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="text-lg mb-1">👑</div>
                                    <div className="text-sm font-medium text-white">주인공</div>
                                    <div className="text-xs text-gray-400 mt-1">메인 캐릭터</div>
                                </button>
                                
                                <button
                                    onClick={() => setCharacterData({ ...characterData, role: 'supporting' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        characterData.role === 'supporting'
                                            ? 'border-blue-500 bg-blue-500/20'
                                            : 'border-slate-600 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="text-lg mb-1">👤</div>
                                    <div className="text-sm font-medium text-white">조연</div>
                                    <div className="text-xs text-gray-400 mt-1">서브 캐릭터</div>
                                </button>
                                
                                <button
                                    onClick={() => setCharacterData({ ...characterData, role: 'extra' })}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        characterData.role === 'extra'
                                            ? 'border-gray-500 bg-gray-500/20'
                                            : 'border-slate-600 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="text-lg mb-1">👥</div>
                                    <div className="text-sm font-medium text-white">엑스트라</div>
                                    <div className="text-xs text-gray-400 mt-1">배경 캐릭터</div>
                                </button>
                            </div>
                        </div>
                    </div>
                );
                
            case 1: // Physical Description
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-300">
                                외모 설명 *
                            </label>
                            {onGenerateDescription && (
                                <button
                                    onClick={() => handleGenerateDescription('physical')}
                                    disabled={isGenerating || !characterData.name}
                                    className="text-sm text-purple-400 hover:text-purple-300 disabled:text-gray-500"
                                >
                                    ✨ AI로 생성
                                </button>
                            )}
                        </div>
                        <textarea
                            value={characterData.physicalDescription}
                            onChange={(e) => setCharacterData({ ...characterData, physicalDescription: e.target.value })}
                            className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
                            rows={6}
                            placeholder="예: 30대 초반의 동양인 남성. 키는 약 180cm로 큰 편이며, 운동으로 다져진 탄탄한 체격을 가지고 있다. 짧고 깔끔하게 정리된 검은 머리, 날카로운 인상의 눈매, 자신감 넘치는 표정..."
                            disabled={isGenerating}
                        />
                        
                        <div className="bg-slate-900/50 rounded-lg p-3">
                            <p className="text-xs text-gray-400">
                                💡 팁: 나이, 키, 체격, 머리 스타일과 색상, 눈 색깔, 피부톤, 특징적인 외모 요소를 포함하세요.
                            </p>
                        </div>
                    </div>
                );
                
            case 2: // Clothing Description
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-300">
                                의상 설명 *
                            </label>
                            {onGenerateDescription && (
                                <button
                                    onClick={() => handleGenerateDescription('clothing')}
                                    disabled={isGenerating || !characterData.physicalDescription}
                                    className="text-sm text-purple-400 hover:text-purple-300 disabled:text-gray-500"
                                >
                                    ✨ AI로 생성
                                </button>
                            )}
                        </div>
                        <textarea
                            value={characterData.clothingDescription}
                            onChange={(e) => setCharacterData({ ...characterData, clothingDescription: e.target.value })}
                            className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
                            rows={5}
                            placeholder="예: 네이비 색상의 슬림핏 정장, 흰색 드레스 셔츠, 붉은색 실크 넥타이, 검은색 옥스포드 구두, 왼쪽 손목에 은색 시계..."
                            disabled={isGenerating}
                        />
                        
                        <div className="bg-slate-900/50 rounded-lg p-3">
                            <p className="text-xs text-gray-400">
                                💡 팁: 색상, 스타일, 브랜드나 종류, 액세서리를 구체적으로 설명하세요.
                            </p>
                        </div>
                    </div>
                );
                
            case 3: // Personality & Identity
                return (
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    성격 특징 (선택)
                                </label>
                                {onGenerateDescription && (
                                    <button
                                        onClick={() => handleGenerateDescription('personality')}
                                        disabled={isGenerating}
                                        className="text-sm text-purple-400 hover:text-purple-300 disabled:text-gray-500"
                                    >
                                        ✨ AI로 생성
                                    </button>
                                )}
                            </div>
                            <textarea
                                value={characterData.personalityTraits}
                                onChange={(e) => setCharacterData({ ...characterData, personalityTraits: e.target.value })}
                                className="w-full bg-slate-800 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none resize-none"
                                rows={3}
                                placeholder="예: 차분하고 분석적인 성격, 강한 리더십, 정의감이 강함..."
                                disabled={isGenerating}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                특징적 표식 (선택)
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={tempIdentityMarker}
                                    onChange={(e) => setTempIdentityMarker(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddIdentityMarker()}
                                    className="flex-1 bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                                    placeholder="예: 왼쪽 눈썹의 흉터"
                                />
                                <button
                                    onClick={handleAddIdentityMarker}
                                    disabled={!tempIdentityMarker.trim()}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded transition-colors"
                                >
                                    추가
                                </button>
                            </div>
                            
                            {characterData.identityMarkers && characterData.identityMarkers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {characterData.identityMarkers.map((marker, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 bg-slate-700 text-gray-300 text-sm rounded-full"
                                        >
                                            {marker}
                                            <button
                                                onClick={() => handleRemoveIdentityMarker(index)}
                                                className="ml-2 text-gray-400 hover:text-white"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
                
            case 4: // Review
                return (
                    <div className="space-y-4">
                        <div className="bg-slate-900/50 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-white mb-4">캐릭터 정보 확인</h4>
                            
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs text-gray-400">이름</span>
                                    <p className="text-white font-medium">{characterData.name}</p>
                                </div>
                                
                                <div>
                                    <span className="text-xs text-gray-400">역할</span>
                                    <p className="text-white">
                                        {characterData.role === 'protagonist' && '주인공'}
                                        {characterData.role === 'supporting' && '조연'}
                                        {characterData.role === 'extra' && '엑스트라'}
                                    </p>
                                </div>
                                
                                <div>
                                    <span className="text-xs text-gray-400">외모</span>
                                    <p className="text-gray-300 text-sm">{characterData.physicalDescription}</p>
                                </div>
                                
                                <div>
                                    <span className="text-xs text-gray-400">의상</span>
                                    <p className="text-gray-300 text-sm">{characterData.clothingDescription}</p>
                                </div>
                                
                                {characterData.personalityTraits && (
                                    <div>
                                        <span className="text-xs text-gray-400">성격</span>
                                        <p className="text-gray-300 text-sm">{characterData.personalityTraits}</p>
                                    </div>
                                )}
                                
                                {characterData.identityMarkers && characterData.identityMarkers.length > 0 && (
                                    <div>
                                        <span className="text-xs text-gray-400">특징적 표식</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {characterData.identityMarkers.map((marker, index) => (
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
                            </div>
                        </div>
                        
                        <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                            <p className="text-sm text-green-400">
                                ✅ 캐릭터가 준비되었습니다! "완료" 버튼을 눌러 캐릭터를 추가하세요.
                            </p>
                        </div>
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">캐릭터 생성 마법사</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        단계별로 캐릭터를 생성합니다
                    </p>
                </div>
                
                {/* Step Indicator */}
                <div className="px-6 py-4 border-b border-slate-700">
                    <div className="flex justify-between items-center">
                        {WIZARD_STEPS.map((step, index) => (
                            <div
                                key={index}
                                className={`flex items-center ${
                                    index < WIZARD_STEPS.length - 1 ? 'flex-1' : ''
                                }`}
                            >
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                            index < currentStep
                                                ? 'bg-purple-600 text-white'
                                                : index === currentStep
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-slate-700 text-gray-400'
                                        }`}
                                    >
                                        {index < currentStep ? '✓' : index + 1}
                                    </div>
                                    <span className={`text-xs mt-1 ${
                                        index === currentStep ? 'text-white' : 'text-gray-500'
                                    }`}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < WIZARD_STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 ${
                                        index < currentStep ? 'bg-purple-600' : 'bg-slate-700'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-1">
                            {WIZARD_STEPS[currentStep].title}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {WIZARD_STEPS[currentStep].description}
                        </p>
                    </div>
                    
                    {renderStepContent()}
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-700 flex justify-between">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        취소
                    </button>
                    
                    <div className="flex gap-3">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrevious}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                이전
                            </button>
                        )}
                        
                        {currentStep < WIZARD_STEPS.length - 1 ? (
                            <button
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                다음
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                            >
                                완료
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CharacterCreationWizard;