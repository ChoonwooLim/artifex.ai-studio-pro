import React, { useState, useCallback, useRef } from 'react';
import { 
  Film, 
  Camera, 
  Palette, 
  Users, 
  Settings, 
  Sparkles,
  Download,
  Upload,
  Grid,
  Layers,
  Sliders,
  Target,
  Zap,
  Eye,
  RefreshCw,
  Save,
  FileImage,
  Monitor,
  Cpu
} from 'lucide-react';
import { 
  StoryboardProject,
  StoryboardPanel,
  CharacterReference,
  VisualStyleGuide,
  ImageGenerationSettings,
  PromptEnhancement,
  SHOT_TYPES,
  CAMERA_ANGLES,
  CAMERA_MOVEMENTS,
  LIGHTING_STYLES,
  COMPOSITION_RULES
} from '../../types/storyboard';
import { imageGenerator } from '../../services/professionalImageGenerator';
import { characterManager } from '../../services/characterConsistency';
import { styleGuideManager } from '../../services/styleGuideManager';
import { promptEngineer } from '../../services/promptEngineering';
import { CharacterPresetSelector } from '../character/CharacterPresetSelector';
import { generatePromptFromPresets } from '../../data/characterPresets';

interface Props {
  apiKeys: Record<string, string>;
  onUpdateApiKey: (service: string, key: string) => void;
}

export const ProfessionalStoryboardCreator: React.FC<Props> = ({
  apiKeys,
  onUpdateApiKey
}) => {
  const [project, setProject] = useState<StoryboardProject>({
    id: `project_${Date.now()}`,
    title: 'Untitled Project',
    description: '',
    genre: [],
    targetAudience: '',
    duration: '',
    characters: [],
    styleGuide: styleGuideManager.createStyleGuide('Default', 'Default style guide'),
    panels: [],
    settings: {
      model: 'dall-e-3',
      quality: 'hd',
      style: 'vivid',
      size: '1792x1024'
    },
    enhancement: {
      useCharacterReference: true,
      useStyleGuide: true,
      addCinematography: true,
      addLighting: true,
      addComposition: true,
      addAtmosphere: true,
      addTechnicalDetails: true
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      status: 'draft',
      creator: 'User'
    }
  });

  const [activeTab, setActiveTab] = useState<'project' | 'characters' | 'style' | 'panels' | 'generate'>('project');
  const [selectedPanel, setSelectedPanel] = useState<StoryboardPanel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<'grid' | 'timeline' | 'fullscreen'>('grid');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [selectedCharacterForPresets, setSelectedCharacterForPresets] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateCharacter = useCallback(() => {
    const name = prompt('Enter character name:');
    if (!name) return;

    const character = characterManager.createCharacterReference(
      name,
      '',
      {
        age: '30',
        gender: 'neutral',
        bodyType: 'average',
        hairStyle: 'medium length',
        hairColor: 'brown',
        eyeColor: 'blue'
      }
    );

    setProject(prev => ({
      ...prev,
      characters: [...prev.characters, character],
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString()
      }
    }));
  }, []);

  const handleUpdateCharacter = useCallback((
    characterId: string,
    updates: Partial<CharacterReference['characterTraits']>
  ) => {
    const updated = characterManager.updateCharacterAppearance(characterId, updates);
    if (!updated) return;

    setProject(prev => ({
      ...prev,
      characters: prev.characters.map(c => 
        c.id === characterId ? updated : c
      ),
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString()
      }
    }));
  }, []);

  const handleApplyStylePreset = useCallback((presetKey: string) => {
    const presets = styleGuideManager.getPresetStyles();
    const preset = presets[presetKey as keyof typeof presets];
    if (!preset) return;

    const newStyle = styleGuideManager.createStyleGuide(
      preset.name,
      preset.description,
      presetKey
    );

    setProject(prev => ({
      ...prev,
      styleGuide: newStyle,
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString()
      }
    }));
  }, []);

  const handleCreatePanel = useCallback(() => {
    const newPanel: StoryboardPanel = {
      id: `panel_${Date.now()}`,
      sceneNumber: Math.floor(project.panels.length / 10) + 1,
      panelNumber: (project.panels.length % 10) + 1,
      shotType: 'Medium Shot (MS)',
      cameraAngle: 'Eye Level',
      cameraMovement: 'Static',
      duration: 5,
      description: '',
      visualPrompt: '',
      characterIds: []
    };

    setProject(prev => ({
      ...prev,
      panels: [...prev.panels, newPanel],
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString()
      }
    }));

    setSelectedPanel(newPanel);
  }, [project.panels.length]);

  const handleUpdatePanel = useCallback((
    panelId: string,
    updates: Partial<StoryboardPanel>
  ) => {
    setProject(prev => ({
      ...prev,
      panels: prev.panels.map(p => 
        p.id === panelId ? { ...p, ...updates } : p
      ),
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString()
      }
    }));
  }, []);

  const handleGenerateImage = useCallback(async (panel: StoryboardPanel) => {
    setIsGenerating(true);
    try {
      const result = await imageGenerator.generateImage(
        panel,
        project.characters,
        project.styleGuide,
        project.enhancement,
        project.settings
      );

      handleUpdatePanel(panel.id, {
        imageUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl,
        enhancedPrompt: result.enhancedPrompt,
        metadata: {
          seed: result.seed,
          model: result.model,
          timestamp: result.metadata.timestamp,
          version: 1
        }
      });
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Failed to generate image. Please check your API key and settings.');
    } finally {
      setIsGenerating(false);
    }
  }, [project, handleUpdatePanel]);

  const handleBatchGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const panelsToGenerate = project.panels.filter(p => !p.imageUrl);
      
      for (const panel of panelsToGenerate) {
        await handleGenerateImage(panel);
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } finally {
      setIsGenerating(false);
    }
  }, [project.panels, handleGenerateImage]);

  const handleExportProject = useCallback(() => {
    const dataStr = JSON.stringify(project, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${project.title.replace(/\s+/g, '_')}_${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [project]);

  const handleImportProject = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setProject(imported);
      } catch (error) {
        console.error('Failed to import project:', error);
        alert('Failed to import project. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Film className="w-8 h-8 text-purple-500" />
              <h1 className="text-xl font-bold">Professional Storyboard Studio</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportProject}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                title="Export Project"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                title="Import Project"
              >
                <Upload className="w-5 h-5" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportProject}
                className="hidden"
              />
              
              <button
                onClick={handleBatchGenerate}
                disabled={isGenerating}
                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>Batch Generate</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'project', label: 'Project', icon: Film },
              { id: 'characters', label: 'Characters', icon: Users },
              { id: 'style', label: 'Style Guide', icon: Palette },
              { id: 'panels', label: 'Storyboard', icon: Grid },
              { id: 'generate', label: 'Generate', icon: Sparkles }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 px-3 py-4 border-b-2 transition-colors
                  ${activeTab === tab.id 
                    ? 'border-purple-500 text-purple-400' 
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Tab */}
        {activeTab === 'project' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Project Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => setProject(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={project.duration}
                    onChange={(e) => setProject(prev => ({
                      ...prev,
                      duration: e.target.value
                    }))}
                    placeholder="e.g., 90 minutes"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={project.description}
                  onChange={(e) => setProject(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Genre
                  </label>
                  <input
                    type="text"
                    value={project.genre.join(', ')}
                    onChange={(e) => setProject(prev => ({
                      ...prev,
                      genre: e.target.value.split(',').map(g => g.trim())
                    }))}
                    placeholder="Action, Thriller, Sci-Fi"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={project.targetAudience}
                    onChange={(e) => setProject(prev => ({
                      ...prev,
                      targetAudience: e.target.value
                    }))}
                    placeholder="e.g., 18-35 adults"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Project Status */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Project Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['draft', 'in-progress', 'review', 'approved'].map(status => (
                  <button
                    key={status}
                    onClick={() => setProject(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        status: status as any
                      }
                    }))}
                    className={`
                      px-4 py-2 rounded-lg capitalize transition-colors
                      ${project.metadata.status === status
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }
                    `}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Character Management</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPresetSelector(!showPresetSelector)}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>프리셋 선택기</span>
                </button>
                <button
                  onClick={handleCreateCharacter}
                  className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Users className="w-5 h-5" />
                  <span>Add Character</span>
                </button>
              </div>
            </div>
            
            {/* Preset Selector */}
            {showPresetSelector && (
              <CharacterPresetSelector
                onPresetSelect={(presets) => {
                  console.log('Selected presets:', presets);
                }}
                onGeneratePrompt={(prompt) => {
                  if (selectedCharacterForPresets) {
                    const updatedCharacters = project.characters.map(c => 
                      c.id === selectedCharacterForPresets
                        ? { ...c, visualDescription: prompt }
                        : c
                    );
                    setProject(prev => ({ ...prev, characters: updatedCharacters }));
                  } else if (project.characters.length > 0) {
                    const firstCharacter = project.characters[0];
                    const updatedCharacters = project.characters.map(c => 
                      c.id === firstCharacter.id
                        ? { ...c, visualDescription: prompt }
                        : c
                    );
                    setProject(prev => ({ ...prev, characters: updatedCharacters }));
                  } else {
                    alert('캐릭터를 먼저 생성하세요.');
                  }
                }}
              />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.characters.map(character => (
                <div key={character.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{character.name}</h3>
                    <button
                      onClick={() => {
                        setSelectedCharacterForPresets(character.id);
                        setShowPresetSelector(true);
                      }}
                      className="p-1 text-purple-400 hover:text-purple-300 transition-colors"
                      title="프리셋 적용"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Visual Description */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      외형 설명
                    </label>
                    <textarea
                      value={character.visualDescription || ''}
                      onChange={(e) => {
                        const updatedCharacters = project.characters.map(c => 
                          c.id === character.id 
                            ? { ...c, visualDescription: e.target.value }
                            : c
                        );
                        setProject(prev => ({ ...prev, characters: updatedCharacters }));
                      }}
                      rows={3}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
                      placeholder="프리셋을 선택하거나 직접 입력..."
                    />
                  </div>
                  
                  {/* Character Style Selector */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      캐릭터 스타일
                    </label>
                    <select
                      value={character.characterStyle || 'cinematic'}
                      onChange={(e) => {
                        const updatedCharacters = project.characters.map(c => 
                          c.id === character.id 
                            ? { ...c, characterStyle: e.target.value as any }
                            : c
                        );
                        setProject(prev => ({ ...prev, characters: updatedCharacters }));
                      }}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
                    >
                      <option value="cinematic">영화 (Cinematic)</option>
                      <option value="photorealistic">실사 (Photorealistic)</option>
                      <option value="animation">애니메이션 (Animation)</option>
                      <option value="anime">애니메 (Anime)</option>
                      <option value="concept-art">컨셉 아트 (Concept Art)</option>
                    </select>
                  </div>
                  
                  {/* Full Body Reference Image */}
                  {character.fullBodyReference && (
                    <div className="mb-3">
                      <img 
                        src={character.fullBodyReference} 
                        alt={`${character.name} 전신 레퍼런스`}
                        className="w-full h-48 object-cover rounded-lg mb-2"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Age:</span>
                      <input
                        type="text"
                        value={character.characterTraits.age || ''}
                        onChange={(e) => handleUpdateCharacter(character.id, {
                          age: e.target.value
                        })}
                        className="w-20 px-2 py-1 bg-gray-700 rounded"
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hair:</span>
                      <input
                        type="text"
                        value={character.characterTraits.hairColor || ''}
                        onChange={(e) => handleUpdateCharacter(character.id, {
                          hairColor: e.target.value
                        })}
                        className="w-20 px-2 py-1 bg-gray-700 rounded"
                      />
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Eyes:</span>
                      <input
                        type="text"
                        value={character.characterTraits.eyeColor || ''}
                        onChange={(e) => handleUpdateCharacter(character.id, {
                          eyeColor: e.target.value
                        })}
                        className="w-20 px-2 py-1 bg-gray-700 rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <button
                      className="w-full px-3 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center space-x-2"
                      onClick={async () => {
                        const styleModifier = character.characterStyle === 'photorealistic' 
                          ? 'photorealistic, ultra realistic, 8k resolution' 
                          : character.characterStyle === 'animation' 
                          ? '3D animation style, pixar style, disney style'
                          : character.characterStyle === 'anime'
                          ? 'anime style, manga style, japanese animation'
                          : character.characterStyle === 'concept-art'
                          ? 'concept art, digital painting, artstation'
                          : 'cinematic, movie still, film grain';
                        
                        const fullBodyPrompt = `Full body portrait, standing pose, complete view from head to toe, ${character.visualDescription}, ${styleModifier}, professional lighting, neutral background, character reference sheet`;
                        
                        try {
                          const imageUrl = await imageGenerator.generateImage(
                            fullBodyPrompt,
                            { ...project.settings, size: '1024x1792' },
                            apiKeys
                          );
                          
                          const updatedCharacters = project.characters.map(c => 
                            c.id === character.id 
                              ? { ...c, fullBodyReference: imageUrl }
                              : c
                          );
                          setProject(prev => ({ ...prev, characters: updatedCharacters }));
                        } catch (error) {
                          console.error('Failed to generate full body reference:', error);
                          alert('전신 레퍼런스 생성 실패: ' + error.message);
                        }
                      }}
                    >
                      <Camera className="w-4 h-4" />
                      <span>전신 레퍼런스 생성</span>
                    </button>
                    
                    <button
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      onClick={() => {
                        const sheet = characterManager.generateCharacterSheet(character);
                        console.log('Character sheet prompt:', sheet);
                        alert('Character sheet prompt generated! Check console.');
                      }}
                    >
                      캐릭터 시트 생성
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Style Guide Tab */}
        {activeTab === 'style' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Visual Style Guide</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPreset}
                  onChange={(e) => {
                    setSelectedPreset(e.target.value);
                    if (e.target.value) {
                      handleApplyStylePreset(e.target.value);
                    }
                  }}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Preset...</option>
                  <option value="hollywood-blockbuster">Hollywood Blockbuster</option>
                  <option value="noir-thriller">Film Noir</option>
                  <option value="anime-action">Anime Action</option>
                  <option value="documentary-realism">Documentary</option>
                  <option value="fantasy-epic">Fantasy Epic</option>
                  <option value="sci-fi-cyberpunk">Cyberpunk Sci-Fi</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cinematography */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <Camera className="w-6 h-6" />
                  <span>Cinematography</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Lighting Style
                    </label>
                    <select
                      value={project.styleGuide.cinematography.lighting}
                      onChange={(e) => setProject(prev => ({
                        ...prev,
                        styleGuide: {
                          ...prev.styleGuide,
                          cinematography: {
                            ...prev.styleGuide.cinematography,
                            lighting: e.target.value
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      {LIGHTING_STYLES.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Mood
                    </label>
                    <input
                      type="text"
                      value={project.styleGuide.cinematography.mood}
                      onChange={(e) => setProject(prev => ({
                        ...prev,
                        styleGuide: {
                          ...prev.styleGuide,
                          cinematography: {
                            ...prev.styleGuide.cinematography,
                            mood: e.target.value
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Color Palette
                    </label>
                    <div className="flex space-x-2">
                      {project.styleGuide.cinematography.colorPalette.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded border-2 border-gray-600"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Technical Specs */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <Cpu className="w-6 h-6" />
                  <span>Technical Specifications</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Aspect Ratio
                    </label>
                    <select
                      value={project.styleGuide.technicalSpecs.aspectRatio}
                      onChange={(e) => setProject(prev => ({
                        ...prev,
                        styleGuide: {
                          ...prev.styleGuide,
                          technicalSpecs: {
                            ...prev.styleGuide.technicalSpecs,
                            aspectRatio: e.target.value as any
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="16:9">16:9 (Standard)</option>
                      <option value="21:9">21:9 (Cinematic)</option>
                      <option value="4:3">4:3 (Classic)</option>
                      <option value="1:1">1:1 (Square)</option>
                      <option value="9:16">9:16 (Vertical)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Quality Level
                    </label>
                    <select
                      value={project.styleGuide.technicalSpecs.quality}
                      onChange={(e) => setProject(prev => ({
                        ...prev,
                        styleGuide: {
                          ...prev.styleGuide,
                          technicalSpecs: {
                            ...prev.styleGuide.technicalSpecs,
                            quality: e.target.value as any
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="draft">Draft</option>
                      <option value="standard">Standard</option>
                      <option value="high">High</option>
                      <option value="ultra">Ultra</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Render Style
                    </label>
                    <select
                      value={project.styleGuide.technicalSpecs.renderStyle}
                      onChange={(e) => setProject(prev => ({
                        ...prev,
                        styleGuide: {
                          ...prev.styleGuide,
                          technicalSpecs: {
                            ...prev.styleGuide.technicalSpecs,
                            renderStyle: e.target.value as any
                          }
                        }
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="photorealistic">Photorealistic</option>
                      <option value="cinematic">Cinematic</option>
                      <option value="artistic">Artistic</option>
                      <option value="animated">Animated</option>
                      <option value="concept-art">Concept Art</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Panels Tab */}
        {activeTab === 'panels' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Storyboard Panels</h2>
              <div className="flex items-center space-x-4">
                <div className="flex bg-gray-700 rounded-lg">
                  <button
                    onClick={() => setPreviewMode('grid')}
                    className={`px-3 py-2 rounded-l-lg ${previewMode === 'grid' ? 'bg-purple-600' : ''}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('timeline')}
                    className={`px-3 py-2 ${previewMode === 'timeline' ? 'bg-purple-600' : ''}`}
                  >
                    <Layers className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPreviewMode('fullscreen')}
                    className={`px-3 py-2 rounded-r-lg ${previewMode === 'fullscreen' ? 'bg-purple-600' : ''}`}
                  >
                    <Monitor className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  onClick={handleCreatePanel}
                  className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Film className="w-5 h-5" />
                  <span>Add Panel</span>
                </button>
              </div>
            </div>
            
            {/* Panel Grid */}
            <div className={`
              grid gap-4
              ${previewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}
              ${previewMode === 'timeline' ? 'grid-cols-1' : ''}
              ${previewMode === 'fullscreen' ? 'grid-cols-1' : ''}
            `}>
              {project.panels.map((panel, index) => (
                <div
                  key={panel.id}
                  className={`
                    bg-gray-800 rounded-lg overflow-hidden cursor-pointer
                    ${selectedPanel?.id === panel.id ? 'ring-2 ring-purple-500' : ''}
                    ${previewMode === 'fullscreen' ? 'h-screen' : ''}
                  `}
                  onClick={() => setSelectedPanel(panel)}
                >
                  {/* Panel Header */}
                  <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
                    <span className="font-medium">
                      Scene {panel.sceneNumber} - Panel {panel.panelNumber}
                    </span>
                    <span className="text-sm text-gray-400">
                      {panel.duration}s
                    </span>
                  </div>
                  
                  {/* Panel Image */}
                  <div className={`
                    relative bg-gray-700
                    ${previewMode === 'grid' ? 'h-48' : ''}
                    ${previewMode === 'timeline' ? 'h-32' : ''}
                    ${previewMode === 'fullscreen' ? 'h-96' : ''}
                  `}>
                    {panel.imageUrl ? (
                      <img
                        src={panel.imageUrl}
                        alt={panel.description}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <FileImage className="w-12 h-12" />
                      </div>
                    )}
                    
                    {/* Shot Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <div className="text-xs text-white/80">
                        {panel.shotType} • {panel.cameraAngle}
                      </div>
                    </div>
                  </div>
                  
                  {/* Panel Details */}
                  <div className="p-4">
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {panel.description || 'No description'}
                    </p>
                    
                    {panel.dialogue && (
                      <p className="mt-2 text-sm italic text-gray-400">
                        "{panel.dialogue}"
                      </p>
                    )}
                    
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateImage(panel);
                        }}
                        disabled={isGenerating}
                        className="px-3 py-1 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm flex items-center space-x-1"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Generate</span>
                      </button>
                      
                      {panel.imageUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateImage(panel);
                          }}
                          disabled={isGenerating}
                          className="p-1 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                          title="Regenerate"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Panel Editor */}
            {selectedPanel && (
              <div className="fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-800 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Panel Editor</h3>
                  <button
                    onClick={() => setSelectedPanel(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Shot Type
                    </label>
                    <select
                      value={selectedPanel.shotType}
                      onChange={(e) => handleUpdatePanel(selectedPanel.id, {
                        shotType: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                    >
                      {SHOT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Camera Angle
                    </label>
                    <select
                      value={selectedPanel.cameraAngle}
                      onChange={(e) => handleUpdatePanel(selectedPanel.id, {
                        cameraAngle: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                    >
                      {CAMERA_ANGLES.map(angle => (
                        <option key={angle} value={angle}>{angle}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Camera Movement
                    </label>
                    <select
                      value={selectedPanel.cameraMovement}
                      onChange={(e) => handleUpdatePanel(selectedPanel.id, {
                        cameraMovement: e.target.value
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                    >
                      {CAMERA_MOVEMENTS.map(movement => (
                        <option key={movement} value={movement}>{movement}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Description
                    </label>
                    <textarea
                      value={selectedPanel.description}
                      onChange={(e) => handleUpdatePanel(selectedPanel.id, {
                        description: e.target.value
                      })}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Visual Prompt
                    </label>
                    <textarea
                      value={selectedPanel.visualPrompt}
                      onChange={(e) => handleUpdatePanel(selectedPanel.id, {
                        visualPrompt: e.target.value
                      })}
                      rows={4}
                      placeholder="Describe the visual elements for AI generation..."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Characters in Scene
                    </label>
                    <div className="space-y-2">
                      {project.characters.map(character => (
                        <label key={character.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedPanel.characterIds?.includes(character.id)}
                            onChange={(e) => {
                              const ids = e.target.checked
                                ? [...(selectedPanel.characterIds || []), character.id]
                                : selectedPanel.characterIds?.filter(id => id !== character.id) || [];
                              handleUpdatePanel(selectedPanel.id, {
                                characterIds: ids
                              });
                            }}
                            className="rounded border-gray-600 bg-gray-700 text-purple-500"
                          />
                          <span className="text-sm">{character.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Dialogue
                    </label>
                    <textarea
                      value={selectedPanel.dialogue || ''}
                      onChange={(e) => handleUpdatePanel(selectedPanel.id, {
                        dialogue: e.target.value
                      })}
                      rows={2}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg"
                    />
                  </div>
                  
                  <button
                    onClick={() => handleGenerateImage(selectedPanel)}
                    disabled={isGenerating}
                    className="w-full px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Image</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Generation Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Model Settings */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <Settings className="w-6 h-6" />
                  <span>Model Configuration</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      AI Model
                    </label>
                    <select
                      value={project.settings.model}
                      onChange={(e) => setProject(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          model: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="dall-e-3">DALL-E 3</option>
                      <option value="stable-diffusion-xl">Stable Diffusion XL</option>
                      <option value="midjourney">Midjourney</option>
                      <option value="leonardo-ai">Leonardo AI</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Image Size
                    </label>
                    <select
                      value={project.settings.size}
                      onChange={(e) => setProject(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          size: e.target.value as any
                        }
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="1024x1024">1024x1024 (Square)</option>
                      <option value="1024x1792">1024x1792 (Portrait)</option>
                      <option value="1792x1024">1792x1024 (Landscape)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Quality
                    </label>
                    <select
                      value={project.settings.quality}
                      onChange={(e) => setProject(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          quality: e.target.value as any
                        }
                      }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                    >
                      <option value="standard">Standard</option>
                      <option value="hd">HD (Premium)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Enhancement Options */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <Sliders className="w-6 h-6" />
                  <span>Enhancement Options</span>
                </h3>
                
                <div className="space-y-3">
                  {[
                    { key: 'useCharacterReference', label: 'Use Character References' },
                    { key: 'useStyleGuide', label: 'Apply Style Guide' },
                    { key: 'addCinematography', label: 'Add Cinematography' },
                    { key: 'addLighting', label: 'Enhance Lighting' },
                    { key: 'addComposition', label: 'Optimize Composition' },
                    { key: 'addAtmosphere', label: 'Add Atmosphere' },
                    { key: 'addTechnicalDetails', label: 'Technical Details' }
                  ].map(option => (
                    <label key={option.key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={project.enhancement[option.key as keyof PromptEnhancement] as boolean}
                        onChange={(e) => setProject(prev => ({
                          ...prev,
                          enhancement: {
                            ...prev.enhancement,
                            [option.key]: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-600 bg-gray-700 text-purple-500"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Negative Prompt
                  </label>
                  <textarea
                    value={project.settings.negativePrompt || ''}
                    onChange={(e) => setProject(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        negativePrompt: e.target.value
                      }
                    }))}
                    rows={3}
                    placeholder="Elements to avoid in generation..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>
              </div>
            </div>
            
            {/* Advanced Settings */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Advanced Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Seed (Optional)
                  </label>
                  <input
                    type="number"
                    value={project.settings.seed || ''}
                    onChange={(e) => setProject(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        seed: e.target.value ? parseInt(e.target.value) : undefined
                      }
                    }))}
                    placeholder="Random seed for consistency"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Steps
                  </label>
                  <input
                    type="number"
                    value={project.settings.steps || 50}
                    onChange={(e) => setProject(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        steps: parseInt(e.target.value)
                      }
                    }))}
                    min={20}
                    max={150}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Guidance Scale
                  </label>
                  <input
                    type="number"
                    value={project.settings.guidanceScale || 7.5}
                    onChange={(e) => setProject(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        guidanceScale: parseFloat(e.target.value)
                      }
                    }))}
                    min={1}
                    max={20}
                    step={0.5}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="mt-4 flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={project.settings.upscale || false}
                    onChange={(e) => setProject(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        upscale: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-600 bg-gray-700 text-purple-500"
                  />
                  <span className="text-sm">Upscale Images</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={project.settings.enhanceDetails || false}
                    onChange={(e) => setProject(prev => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        enhanceDetails: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-600 bg-gray-700 text-purple-500"
                  />
                  <span className="text-sm">Enhance Details</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};