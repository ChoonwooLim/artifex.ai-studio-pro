import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Check, X, Sparkles } from 'lucide-react';
import { 
  CHARACTER_PRESETS, 
  getPresetsByCategory,
  generatePromptFromPresets,
  PresetItem
} from '../../data/characterPresets';

interface Props {
  onPresetSelect: (selectedPresets: Record<string, string[]>) => void;
  onGeneratePrompt: (prompt: string) => void;
}

export const CharacterPresetSelector: React.FC<Props> = ({ 
  onPresetSelect, 
  onGeneratePrompt 
}) => {
  const [selectedPresets, setSelectedPresets] = useState<Record<string, string[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { key: 'bodyType', label: '체형', icon: '👤' },
    { key: 'faceShape', label: '얼굴형', icon: '😊' },
    { key: 'ageRange', label: '연령대', icon: '📅' },
    { key: 'hairStyle', label: '헤어스타일', icon: '💇' },
    { key: 'clothingStyle', label: '의상 스타일', icon: '👔' },
    { key: 'personality', label: '성격 특징', icon: '🎭' },
    { key: 'accessories', label: '액세서리', icon: '💎' },
    { key: 'specialFeatures', label: '특별한 특징', icon: '✨' }
  ];

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const togglePresetItem = useCallback((category: string, itemId: string) => {
    setSelectedPresets(prev => {
      const newPresets = { ...prev };
      if (!newPresets[category]) {
        newPresets[category] = [];
      }
      
      const index = newPresets[category].indexOf(itemId);
      if (index > -1) {
        newPresets[category].splice(index, 1);
        if (newPresets[category].length === 0) {
          delete newPresets[category];
        }
      } else {
        newPresets[category].push(itemId);
      }
      
      onPresetSelect(newPresets);
      return newPresets;
    });
  }, [onPresetSelect]);

  const handleGeneratePrompt = useCallback(() => {
    const prompt = generatePromptFromPresets(selectedPresets);
    onGeneratePrompt(prompt);
    setShowPreview(false);
  }, [selectedPresets, onGeneratePrompt]);

  const clearAllSelections = useCallback(() => {
    setSelectedPresets({});
    onPresetSelect({});
  }, [onPresetSelect]);

  const getSelectedCount = () => {
    return Object.values(selectedPresets).reduce((acc, items) => acc + items.length, 0);
  };

  const filterItems = (items: PresetItem[]) => {
    if (!searchTerm) return items;
    return items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.labelKo.includes(searchTerm) ||
      item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <span>캐릭터 프리셋 선택기</span>
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {getSelectedCount()}개 선택됨
          </span>
          
          {getSelectedCount() > 0 && (
            <>
              <button
                onClick={() => setShowPreview(true)}
                className="px-3 py-1 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                미리보기
              </button>
              
              <button
                onClick={clearAllSelections}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="모두 지우기"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="프리셋 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Categories */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {categories.map(category => {
          const categoryData = getPresetsByCategory(category.key);
          const isExpanded = expandedCategories.has(category.key);
          const selectedCount = selectedPresets[category.key]?.length || 0;
          const filteredItems = filterItems(categoryData.items);

          return (
            <div key={category.key} className="border border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category.key)}
                className="w-full px-4 py-3 bg-gray-750 hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium">{category.label}</span>
                  {selectedCount > 0 && (
                    <span className="px-2 py-0.5 bg-purple-600 rounded-full text-xs">
                      {selectedCount}
                    </span>
                  )}
                </div>
                {isExpanded ? <ChevronUp /> : <ChevronDown />}
              </button>

              {isExpanded && (
                <div className="p-4 bg-gray-800">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {filteredItems.map(item => {
                      const isSelected = selectedPresets[category.key]?.includes(item.id);
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => togglePresetItem(category.key, item.id)}
                          className={`
                            px-3 py-2 rounded-lg text-sm transition-all
                            ${isSelected 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <span>{item.labelKo}</span>
                            {isSelected && <Check className="w-4 h-4 ml-2" />}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{item.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Generate Prompt Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleGeneratePrompt}
          disabled={getSelectedCount() === 0}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>프롬프트 생성</span>
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold">선택된 프리셋 미리보기</h4>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(selectedPresets).map(([categoryKey, itemIds]) => {
                const categoryData = getPresetsByCategory(categoryKey);
                const category = categories.find(c => c.key === categoryKey);
                
                return (
                  <div key={categoryKey} className="bg-gray-700 rounded-lg p-3">
                    <h5 className="font-medium mb-2 text-purple-400">
                      {category?.icon} {category?.label}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {itemIds.map(itemId => {
                        const item = categoryData.items.find(i => i.id === itemId);
                        return item ? (
                          <span key={itemId} className="px-2 py-1 bg-gray-600 rounded text-sm">
                            {item.labelKo} ({item.label})
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-4 bg-gray-900 rounded-lg">
              <h5 className="font-medium mb-2">생성될 프롬프트:</h5>
              <p className="text-sm text-gray-300 leading-relaxed">
                {generatePromptFromPresets(selectedPresets)}
              </p>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
              <button
                onClick={handleGeneratePrompt}
                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                프롬프트 적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};