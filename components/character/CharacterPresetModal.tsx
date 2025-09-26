import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import { CharacterPresetSelector } from './CharacterPresetSelector';

type PresetModalContext = 'new' | 'existing';

interface CharacterPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPresetSelect: (presets: Record<string, string[]>) => void;
  onGeneratePrompt: (prompt: string) => void;
  context: PresetModalContext;
  characterName?: string;
}

const CharacterPresetModal: React.FC<CharacterPresetModalProps> = ({
  isOpen,
  onClose,
  onPresetSelect,
  onGeneratePrompt,
  context,
  characterName,
}) => {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  const contextLabel =
    context === 'new'
      ? t('characterPresets.contextNew')
      : t('characterPresets.contextExisting', {
          name: characterName ?? t('characterPresets.contextExistingFallback'),
        });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-[32px] border border-purple-500/30 bg-gray-950/95 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/20"
            aria-label={t('characterPresets.close')}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative px-8 py-10">
            <CharacterPresetSelector
              onPresetSelect={onPresetSelect}
              onGeneratePrompt={(prompt) => {
                onGeneratePrompt(prompt);
                onClose();
              }}
              onClose={onClose}
              contextLabel={contextLabel}
              className="min-h-[640px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterPresetModal;
