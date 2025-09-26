import React, { useState, useCallback, useMemo } from 'react';
import { Sparkles, X, Check, ChevronRight, Search } from 'lucide-react';
import { getPresetsByCategory, generatePromptFromPresets, PresetItem } from '../../data/characterPresets';
import { useTranslation } from '../../i18n/LanguageContext';

interface CharacterPresetSelectorProps {
  onPresetSelect: (selectedPresets: Record<string, string[]>) => void;
  onGeneratePrompt: (prompt: string) => void;
  onClose?: () => void;
  contextLabel?: string;
  className?: string;
}

type CategoryKey =
  | 'bodyType'
  | 'faceShape'
  | 'ageRange'
  | 'hairStyle'
  | 'clothingStyle'
  | 'personality'
  | 'accessories'
  | 'specialFeatures';

const CATEGORY_ICONS: Record<CategoryKey, string> = {
  bodyType: '👤',
  faceShape: '😊',
  ageRange: '📅',
  hairStyle: '💇',
  clothingStyle: '👗',
  personality: '🎭',
  accessories: '💎',
  specialFeatures: '✨',
};

export const CharacterPresetSelector: React.FC<CharacterPresetSelectorProps> = ({
  onPresetSelect,
  onGeneratePrompt,
  onClose,
  contextLabel,
  className,
}) => {
  const { t, language } = useTranslation();
  const categories = useMemo<CategoryKey[]>(
    () => [
      'bodyType',
      'faceShape',
      'ageRange',
      'hairStyle',
      'clothingStyle',
      'personality',
      'accessories',
      'specialFeatures',
    ],
    []
  );

  const [selectedPresets, setSelectedPresets] = useState<Record<string, string[]>>({});
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('bodyType');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const isKorean = language === 'Korean';

  const totalSelected = useMemo(
    () => Object.values(selectedPresets).reduce((acc, items) => acc + items.length, 0),
    [selectedPresets]
  );

  const selectedSummary = t('characterPresets.selectedCount', { count: totalSelected });

  const togglePresetItem = useCallback(
    (category: CategoryKey, itemId: string) => {
      setSelectedPresets(prev => {
        const updated = { ...prev };
        if (!updated[category]) {
          updated[category] = [];
        }
        const index = updated[category].indexOf(itemId);
        if (index > -1) {
          updated[category].splice(index, 1);
          if (updated[category].length === 0) {
            delete updated[category];
          }
        } else {
          updated[category].push(itemId);
        }
        onPresetSelect(updated);
        return updated;
      });
    },
    [onPresetSelect]
  );

  const clearAllSelections = useCallback(() => {
    setSelectedPresets({});
    onPresetSelect({});
  }, [onPresetSelect]);

  const filterItems = useCallback(
    (items: PresetItem[]) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) return items;
      const normalized = trimmed.toLowerCase();
      return items.filter(item =>
        item.label.toLowerCase().includes(normalized) ||
        item.prompt.toLowerCase().includes(normalized) ||
        item.labelKo.includes(trimmed)
      );
    },
    [searchTerm]
  );

  const handleGeneratePrompt = useCallback(() => {
    const prompt = generatePromptFromPresets(selectedPresets);
    if (prompt) {
      onGeneratePrompt(prompt);
      setShowPreview(false);
    }
  }, [selectedPresets, onGeneratePrompt]);

  const activeCategoryData = getPresetsByCategory(activeCategory);
  const filteredItems = filterItems(activeCategoryData.items);

  const selectedChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; category: CategoryKey }> = [];
    Object.entries(selectedPresets).forEach(([category, ids]) => {
      const categoryData = getPresetsByCategory(category);
      ids.forEach(id => {
        const item = categoryData.items.find(i => i.id === id);
        if (item) {
          chips.push({
            id,
            label: isKorean ? (item.labelKo || item.label) : (item.label || item.labelKo),
            category: category as CategoryKey,
          });
        }
      });
    });
    return chips;
  }, [selectedPresets, isKorean]);

  return (
    <div className={`flex flex-col h-full text-white ${className ?? ''}`}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/70 via-purple-600/60 to-purple-500/50 border border-purple-400/30 p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-purple-100 shadow-inner">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl font-semibold tracking-tight">{t('characterPresets.title')}</h3>
                <p className="text-sm text-purple-100/80">{selectedSummary}</p>
              </div>
            </div>
            {contextLabel && (
              <span className="mt-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/80">
                {contextLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/20"
            >
              {t('characterPresets.preview')}
            </button>
            <button
              onClick={clearAllSelections}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/40 hover:text-white"
            >
              {t('characterPresets.clearAll')}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/20"
                aria-label={t('characterPresets.close')}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-12 gap-6 flex-1">
        <aside className="col-span-12 md:col-span-4 xl:col-span-3 space-y-2">
          {categories.map(category => {
            const isActive = category === activeCategory;
            const hasSelection = selectedPresets[category]?.length;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                  isActive
                    ? 'border-purple-500/70 bg-purple-600/20 shadow-lg shadow-purple-900/40'
                    : 'border-gray-700 bg-gray-800/80 hover:border-purple-400/40 hover:bg-gray-700/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{CATEGORY_ICONS[category]}</span>
                    <span className="text-sm font-medium text-gray-100">
                      {t(`characterPresets.categories.${category}`)}
                    </span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${isActive ? 'text-purple-300 translate-x-1' : 'text-gray-500'}`}
                  />
                </div>
                {hasSelection && (
                  <span className="mt-2 inline-flex items-center rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-100">
                    {hasSelection}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        <section className="col-span-12 md:col-span-8 xl:col-span-9 flex flex-col rounded-3xl border border-gray-700/80 bg-gray-900/80 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('characterPresets.searchPlaceholder')}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/80 py-2 pl-10 pr-4 text-sm text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
            <div className="text-sm text-gray-500">
              {t(`characterPresets.categories.${activeCategory}`)}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {selectedChips.length > 0 ? (
              selectedChips.map(chip => (
                <button
                  key={`${chip.category}-${chip.id}`}
                  onClick={() => togglePresetItem(chip.category, chip.id)}
                  className="group inline-flex items-center gap-2 rounded-full bg-purple-600/20 px-3 py-1 text-xs text-purple-100 transition hover:bg-purple-500/30"
                >
                  <span>{chip.label}</span>
                  <X className="h-3 w-3 opacity-70 transition group-hover:opacity-100" />
                </button>
              ))
            ) : (
              <span className="text-xs text-gray-500">{t('characterPresets.noSelectionHint')}</span>
            )}
          </div>

          <div className="mt-6 flex-1 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 h-full overflow-y-auto pr-2">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => {
                  const isSelected = selectedPresets[activeCategory]?.includes(item.id);
                  const displayLabel = isKorean ? (item.labelKo || item.label) : (item.label || item.labelKo);

                  return (
                    <button
                      key={item.id}
                      onClick={() => togglePresetItem(activeCategory, item.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-purple-500/70 bg-purple-600/30 shadow-lg shadow-purple-900/40'
                          : 'border-gray-700 bg-gray-800/70 hover:border-purple-400/40 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-100">{displayLabel}</span>
                        {isSelected && <Check className="h-4 w-4 text-purple-200" />}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full flex h-full items-center justify-center rounded-2xl border border-dashed border-gray-700 text-sm text-gray-500">
                  {t('characterPresets.noResults', { term: searchTerm })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500">
              {t('characterPresets.promptHint')}
            </div>
            <div className="flex items-center gap-2">
              {onClose && (
                <button
                  onClick={onClose}
                  className="rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:border-purple-400/50 hover:text-white"
                >
                  {t('characterPresets.close')}
                </button>
              )}
              <button
                onClick={handleGeneratePrompt}
                disabled={totalSelected === 0}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:from-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {t('characterPresets.generatePrompt')}
              </button>
            </div>
          </div>
        </section>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={() => setShowPreview(false)} />
          <div className="relative w-full max-w-3xl rounded-3xl border border-purple-500/30 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-semibold text-white">{t('characterPresets.previewTitle')}</h4>
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-full border border-gray-700 p-2 text-gray-400 transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(selectedPresets).map(([categoryKey, itemIds]) => {
                const categoryData = getPresetsByCategory(categoryKey);
                return (
                  <div key={categoryKey} className="rounded-2xl bg-gray-800/80 p-4">
                    <h5 className="mb-2 text-sm font-semibold text-purple-200">
                      {CATEGORY_ICONS[categoryKey as CategoryKey]} {t(`characterPresets.categories.${categoryKey}`)}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {itemIds.map(itemId => {
                        const item = categoryData.items.find(i => i.id === itemId);
                        if (!item) return null;
                        const previewLabel = isKorean ? (item.labelKo || item.label) : (item.label || item.labelKo);
                        return (
                          <span key={itemId} className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-100">
                            {previewLabel}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl bg-gray-800/90 p-4">
              <h5 className="mb-2 text-sm font-semibold text-purple-200">
                {t('characterPresets.generatedPrompt')}
              </h5>
              <p className="whitespace-pre-line text-sm text-gray-300 leading-relaxed">
                {generatePromptFromPresets(selectedPresets)}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:text-white"
              >
                {t('characterPresets.close')}
              </button>
              <button
                onClick={() => {
                  handleGeneratePrompt();
                  onClose?.();
                }}
                disabled={totalSelected === 0}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:from-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {t('characterPresets.applyPrompt')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
