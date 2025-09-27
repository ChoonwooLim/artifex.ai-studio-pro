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
import { aiService } from '../services/aiService';
import { AICharacterGenerator, Character2DGenerationOptions, Character3DGenerationOptions, DigitalHumanOptions } from '../services/characterGeneration/aiCharacterGenerator';
import { GaussianSplattingRenderer } from '../services/characterGeneration/gaussianSplattingRenderer';

interface CharacterCreatorProps {
    onGenerateCharacterImage?: (character: Character) => Promise<string>;
    apiKeys: Record<string, string>;
    onUpdateApiKey?: (service: string, key: string) => void;
    defaultImageModel?: string;
}

interface CharacterWithExtras extends Character {
    characterStyle?: 'cinematic' | 'photorealistic' | 'animation' | 'anime' | 'concept-art';
    fullBodyImage?: string;  // 왼쪽: 전신
    frontFaceImage?: string;  // 오른쪽 상단: 정면 얼굴
    angleFaceImage?: string;  // 오른쪽 하단: 45도 얼굴
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
    onUpdateApiKey,
    defaultImageModel = 'dall-e-3'
}) => {
    const { t } = useTranslation();
    const [characters, setCharacters] = useState<CharacterWithExtras[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<CharacterWithExtras | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [presetModalState, setPresetModalState] = useState<{ isOpen: boolean; target: 'new' | 'existing' }>({ isOpen: false, target: 'new' });
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isGenerating, setIsGenerating] = useState(false);
    // 3 images will be generated automatically when Generate button is clicked
    const [aiGenerationEnabled, setAiGenerationEnabled] = useState({
        generate3D: false,
        generateDigitalHuman: false
    });
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
    const [manualFeatures, setManualFeatures] = useState<string>('');
    const [showFeatureRefinement, setShowFeatureRefinement] = useState(false);
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
    const [generationError, setGenerationError] = useState<{
        message: string;
        retryCallback?: () => void;
    } | null>(null);
    const [isLoading3D, setIsLoading3D] = useState(false);
    const [render3DError, setRender3DError] = useState<string | null>(null);
    const [presetApplyMode, setPresetApplyMode] = useState<'append' | 'replace'>('replace');

    const [newCharacter, setNewCharacter] = useState<Partial<CharacterWithExtras>>({
        name: '',
        role: 'supporting',
        gender: 'neutral',
        characterType: 'human',
        physicalDescription: '',
        clothingDescription: '',
        personalityTraits: '',
        characterStyle: 'cinematic'
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const openPresetModal = useCallback((target: 'new' | 'existing') => {
        setPresetModalState({ isOpen: true, target });
    }, []);

    // Restore from localStorage on mount
    React.useEffect(() => {
        try {
            const savedData = localStorage.getItem('characterCreatorData');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                if (parsed.characters && Array.isArray(parsed.characters)) {
                    setCharacters(parsed.characters);
                }
                if (parsed.selectedCharacter) {
                    setSelectedCharacter(parsed.selectedCharacter);
                }
                // imageGenerationOptions removed - now automatically generates 3 images
                if (parsed.generation2DOptions) {
                    setGeneration2DOptions(parsed.generation2DOptions);
                }
                console.log('Character data restored from localStorage');
            }
        } catch (error) {
            console.error('Failed to restore character data:', error);
        }
    }, []);

    // Save to localStorage when data changes
    React.useEffect(() => {
        if (characters.length > 0 || selectedCharacter) {
            try {
                const dataToSave = {
                    characters,
                    selectedCharacter,
                    // imageGenerationOptions removed,
                    generation2DOptions,
                    timestamp: Date.now()
                };
                localStorage.setItem('characterCreatorData', JSON.stringify(dataToSave));
            } catch (error) {
                console.error('Failed to save character data:', error);
                // Could show a toast notification here
            }
        }
    }, [characters, selectedCharacter, generation2DOptions]);

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
                gender: newCharacter.gender as Character['gender'] || 'neutral',
                characterType: newCharacter.characterType as Character['characterType'] || 'human',
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
                gender: 'neutral',
                characterType: 'human',
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

        // Save to localStorage
        const savedCharacters = localStorage.getItem('characterCreatorData');
        if (savedCharacters) {
            const parsedData = JSON.parse(savedCharacters);
            const updatedData = {
                ...parsedData,
                characters: updatedCharacters
            };
            localStorage.setItem('characterCreatorData', JSON.stringify(updatedData));
        }
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

            // Generate complete character with AI - only include selected options
            const result = await aiGenerator.generateCharacterFromText(fullDescription, {
                generate2D: undefined, // Removed 2D generation from AI options
                generate3D: aiGenerationEnabled.generate3D ? generation3DOptions : undefined,
                generateDigitalHuman: aiGenerationEnabled.generateDigitalHuman && digitalHumanOptions.provider !== 'none' ? digitalHumanOptions : undefined,
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
                setIsLoading3D(true);
                setRender3DError(null);
                try {
                    await gaussianRenderer.loadGaussianSplat(result.model3D.gaussianSplat.url, selectedCharacter.id);
                } catch (error) {
                    console.error('Failed to load 3D model:', error);
                    setRender3DError((error as Error).message);
                } finally {
                    setIsLoading3D(false);
                }
            } else if (result.model3D && gaussianRenderer) {
                setIsLoading3D(true);
                setRender3DError(null);
                try {
                    await gaussianRenderer.loadModel(result.model3D.url, result.model3D.format as any);
                } catch (error) {
                    console.error('Failed to load 3D model:', error);
                    setRender3DError((error as Error).message);
                } finally {
                    setIsLoading3D(false);
                }
            }

            setGenerationProgress(`✅ Generation complete! Cost: $${result.cost.total.toFixed(2)}`);
        } catch (error) {
            console.error('AI character generation failed:', error);
            setGenerationError({
                message: `${t('characterCreator.aiGenerationFailed')}: ${(error as Error).message}`,
                retryCallback: () => {
                    setGenerationError(null);
                    handleGenerateAICharacter();
                }
            });
            setGenerationProgress('');
        } finally {
            setIsGeneratingAI(false);
        }
    }, [selectedCharacter, aiGenerator, generation2DOptions, generation3DOptions, digitalHumanOptions, gaussianRenderer, handleUpdateCharacter, aiGenerationEnabled, t]);

    // Generate all three images automatically
    const handleGenerateAll = useCallback(async () => {
        if (!selectedCharacter) return;

        // Check if AI options are selected
        const hasAIOptions = aiGenerationEnabled.generate3D || aiGenerationEnabled.generateDigitalHuman;

        // Set loading states
        setIsGenerating(true);
        if (hasAIOptions) setIsGeneratingAI(true);

        try {
            const updatedCharacter = { ...selectedCharacter };

            // Generate basic images (always generate all three)
            const styleModifier = selectedCharacter.characterStyle === 'photorealistic'
                ? 'photorealistic, ultra realistic, 8k resolution'
                : selectedCharacter.characterStyle === 'animation'
                ? '3D animation style, pixar style, disney style'
                : selectedCharacter.characterStyle === 'anime'
                ? 'anime style, manga style, japanese animation'
                : selectedCharacter.characterStyle === 'concept-art'
                ? 'concept art, digital painting, artstation'
                : 'cinematic, movie still, film grain';

            setGenerationProgress(t('characterCreator.generatingImages'));

            // Create a highly detailed consistent character description for all three images
            // This ensures the EXACT SAME person appears in all images
            const characterName = selectedCharacter.name || 'character';
            const gender = selectedCharacter.gender || 'neutral';
            const characterType = selectedCharacter.characterType || 'human';

            // Build character type descriptor
            const characterTypeDesc = characterType === 'human' ? 'human'
                : characterType === 'animal' ? 'anthropomorphic bipedal animal character'
                : characterType === 'fantasy' ? 'fantasy bipedal creature'
                : characterType === 'robot' ? 'humanoid robot'
                : characterType === 'alien' ? 'bipedal alien being'
                : 'character';

            // Build gender descriptor
            const genderDesc = gender === 'male' ? 'male'
                : gender === 'female' ? 'female'
                : 'neutral gender';

            // Extract key features from physical description for consistency
            const physicalDetails = selectedCharacter.physicalDescription || '';
            const clothingDetails = selectedCharacter.clothingDescription || 'casual outfit';

            // Extract VERY specific features for consistency
            const hairMatch = physicalDetails.match(/(\w+\s+hair|hair\s+\w+|\w+\s+hairstyle)/i);
            const skinMatch = physicalDetails.match(/(\w+\s+skin|skin\s+\w+)/i);
            const ageMatch = physicalDetails.match(/(young|old|middle-aged|teen|adult|child)/i);
            const eyeMatch = physicalDetails.match(/(\w+\s+eyes|eyes\s+\w+)/i);

            // Create ultra-specific descriptions
            const hairDesc = hairMatch ? hairMatch[0] : 'straight black shoulder-length hair';
            const skinDesc = skinMatch ? skinMatch[0] : 'light beige skin';
            const ageDesc = ageMatch ? ageMatch[0] : '25-year-old';
            const eyeDesc = eyeMatch ? eyeMatch[0] : 'dark brown almond-shaped eyes';

            // Add more specific facial features
            const faceShape = 'oval face shape';
            const noseDesc = 'straight narrow nose';
            const lipDesc = 'medium-sized lips';
            const browsDesc = 'medium thickness straight eyebrows';

            // Create ULTRA-SPECIFIC character description with exact measurements and details
            const detailedCharacterDesc = `EXACT SAME ${ageDesc} ${genderDesc} ${characterTypeDesc}, PRECISE FEATURES: ${faceShape}, ${hairDesc} with center part, ${eyeDesc}, ${browsDesc} matching hair color, ${noseDesc}, ${lipDesc}, ${skinDesc}, distinctive features: ${physicalDetails}`;

            // Create the consistent base with extreme detail
            const consistentCharacterBase = `IDENTICAL CHARACTER [Unique ID #${Date.now() % 10000}]: ${detailedCharacterDesc}, wearing EXACT outfit: ${clothingDetails}. CRITICAL: Generate the EXACT SAME individual, not similar-looking different people`;

            // Create a consistency seed for this character
            const characterSeed = Math.floor(Math.random() * 1000000);
            const consistencyTag = `[Consistent Character #${characterSeed}]`;

            // Track failed generations
            const failedImages: string[] = [];

            // Generate front face FIRST as reference for consistency
            let frontFaceGenerated = false;
            let enhancedCharacterBase = consistentCharacterBase;

            // 1. Generate front face image FIRST (오른쫜 상단 - 여권 사진 스타일)
            try {
                const frontFacePrompt = `professional ID photo portrait, ${consistentCharacterBase}, single person headshot, direct front-facing camera angle, centered composition, ${styleModifier}, studio lighting, neutral expression, plain white background, photorealistic detail`;
                console.log(`Generating front face FIRST with model: ${generation2DOptions.model}`);
                const frontFaceImages = await aiService.generateImage({
                    prompt: frontFacePrompt,
                    model: generation2DOptions.model,
                    width: 1024,
                    height: 1024,
                    count: 1
                });
                updatedCharacter.frontFaceImage = frontFaceImages[0];
                frontFaceGenerated = true;

                // Add manual features if provided
                const additionalFeatures = manualFeatures ? `, ADDITIONAL DETAILS: ${manualFeatures}` : '';

                // Create enhanced description based on first image
                enhancedCharacterBase = `${consistentCharacterBase}${additionalFeatures}, IMPORTANT: match the exact person from the ID photo - same face structure, same hairstyle, same skin tone, same age, same everything`;
                setGenerationProgress(t('characterCreator.faceGeneratedGeneratingBody'));
            } catch (error) {
                console.error('Failed to generate front face image:', error);
                failedImages.push('front face');
            }

            // 2. Generate full body image USING face reference (왼쪽) - 1:2 aspect ratio (portrait)
            if (frontFaceGenerated) {
                try {
                    // Add specific posture instructions based on character type
                    const postureDesc = characterType === 'human' ? 'human person standing upright on two feet'
                        : characterType === 'animal' ? 'anthropomorphic bipedal animal character standing upright on hind legs in human-like vertical pose'
                        : characterType === 'robot' ? 'humanoid robot standing upright in vertical pose on two legs'
                        : characterType === 'fantasy' ? 'fantasy creature standing upright on two legs in vertical pose'
                        : characterType === 'alien' ? 'alien being standing upright in bipedal vertical pose'
                        : 'bipedal character standing vertically on two legs';

                    const fullBodyPrompt = `full body portrait photography, ${enhancedCharacterBase}, single person standing straight, front-facing camera, ${postureDesc}, complete figure from head to toe, centered in frame, ${styleModifier}, studio lighting, plain white background, photorealistic, vertical composition`;
                    console.log(`Generating full body using face reference with model: ${generation2DOptions.model}`);
                    const fullBodyImages = await aiService.generateImage({
                        prompt: fullBodyPrompt,
                        model: generation2DOptions.model,
                        width: 1024,  // DALL-E 3 portrait size
                        height: 1792, // DALL-E 3 portrait size (1:1.75 ratio, close to 1:2)
                        count: 1
                    });
                    updatedCharacter.fullBodyImage = fullBodyImages[0];
                } catch (error) {
                    console.error('Failed to generate full body image:', error);
                    failedImages.push('full body');
                }
            } else {
                console.warn('Skipping full body generation since face generation failed');
                failedImages.push('full body (skipped)');
            }

            // 3. Generate 45-degree angle face image (오른쪽 하단)
            if (frontFaceGenerated) {
                try {
                    const angleFacePrompt = `three-quarter angle portrait photography, ${enhancedCharacterBase}, single person headshot, face turned 30-45 degrees right, showing left side of face more, ${styleModifier}, professional lighting, plain background, photorealistic detail`;
                    console.log(`Generating angle face using face reference with model: ${generation2DOptions.model}`);
                    const angleFaceImages = await aiService.generateImage({
                        prompt: angleFacePrompt,
                        model: generation2DOptions.model,
                        width: 1024,
                        height: 1024,
                        count: 1
                    });
                    updatedCharacter.angleFaceImage = angleFaceImages[0];
                } catch (error) {
                    console.error('Failed to generate angle face image:', error);
                    failedImages.push('angle face');
                }
            } else {
                console.warn('Skipping angle face generation since face generation failed');
                failedImages.push('angle face (skipped)');
            }

            // Report which images failed (if any)
            if (failedImages.length > 0) {
                console.warn(`Some images could not be generated: ${failedImages.join(', ')}`);
                setGenerationError({
                    message: `${t('characterCreator.partialSuccess')}: ${failedImages.join(', ')} ${t('characterCreator.couldNotGenerate')}`,
                    retryCallback: () => {
                        setGenerationError(null);
                        handleGenerateAll();
                    }
                });
            }

            // Generate AI-powered content if selected and generator is available
            if (hasAIOptions && aiGenerator) {
                setGenerationProgress('Initializing AI generation...');

                const fullDescription = `
                    ${selectedCharacter.name}: ${selectedCharacter.physicalDescription}.
                    Clothing: ${selectedCharacter.clothingDescription}.
                    Personality: ${selectedCharacter.personalityTraits}.
                    Role: ${selectedCharacter.role} character.
                `.trim();

                setGenerationProgress('Generating Character DNA...');

                const result = await aiGenerator.generateCharacterFromText(fullDescription, {
                    generate2D: undefined, // Removed 2D generation from AI options
                    generate3D: aiGenerationEnabled.generate3D ? generation3DOptions : undefined,
                    generateDigitalHuman: aiGenerationEnabled.generateDigitalHuman && digitalHumanOptions.provider !== 'none' ? digitalHumanOptions : undefined,
                    registerOnBlockchain: false
                });

                setGenerationProgress('Processing results...');

                // Update character with AI-generated assets
                if (result.characterDNA) updatedCharacter.characterDNA = result.characterDNA;
                if (result.images2D?.url && !updatedCharacter.fullBodyReference) {
                    updatedCharacter.fullBodyReference = result.images2D.url;
                }
                if (result.images2D?.variations) {
                    updatedCharacter.generatedImages = result.images2D.variations;
                }
                if (result.model3D) {
                    updatedCharacter.model3D = {
                        url: result.model3D.url,
                        format: result.model3D.format,
                        preview: result.model3D.preview
                    };
                }
                if (result.video) updatedCharacter.video = result.video;
                if (result.digitalHuman) updatedCharacter.digitalHuman = result.digitalHuman;
                if (result.characterDNA?.metadata?.blockchainTx) {
                    updatedCharacter.blockchainTx = result.characterDNA.metadata.blockchainTx;
                }

                // Load 3D model in Gaussian renderer if available
                if (result.model3D?.gaussianSplat && gaussianRenderer) {
                    setIsLoading3D(true);
                    setRender3DError(null);
                    try {
                        await gaussianRenderer.loadGaussianSplat(result.model3D.gaussianSplat.url, selectedCharacter.id);
                    } catch (error) {
                        console.error('Failed to load 3D model:', error);
                        setRender3DError((error as Error).message);
                    } finally {
                        setIsLoading3D(false);
                    }
                } else if (result.model3D && gaussianRenderer) {
                    setIsLoading3D(true);
                    setRender3DError(null);
                    try {
                        await gaussianRenderer.loadModel(result.model3D.url, result.model3D.format as any);
                    } catch (error) {
                        console.error('Failed to load 3D model:', error);
                        setRender3DError((error as Error).message);
                    } finally {
                        setIsLoading3D(false);
                    }
                }

                setGenerationProgress(`✅ Generation complete!`);
            }

            // Update character once with all changes
            handleUpdateCharacter(updatedCharacter);
            setSelectedCharacter(updatedCharacter);

        } catch (error) {
            console.error('Failed to generate character assets:', error);
            setGenerationError({
                message: `${t('characterCreator.generationFailed')}: ${(error as Error).message}`,
                retryCallback: () => {
                    setGenerationError(null);
                    handleGenerateAll();
                }
            });
            setGenerationProgress('');
        } finally {
            setIsGenerating(false);
            setIsGeneratingAI(false);
            setGenerationProgress('');
        }
    }, [
        selectedCharacter,
        aiGenerationEnabled,
        apiKeys,
        aiGenerator,
        generation2DOptions,
        generation3DOptions,
        digitalHumanOptions,
        gaussianRenderer,
        handleUpdateCharacter,
        t
    ]);

    // Removed handleBatchImageGeneration - now using handleGenerateAll for automatic 3-image generation

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
                console.error('Failed to read character file:', error);
                setGenerationError({
                    message: t('characterCreator.cannotReadCharacterFile'),
                    retryCallback: undefined
                });
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

    // Utility function to merge text with duplicate removal
    const mergeUnique = (existing: string, newText: string): string => {
        if (!existing) return newText;
        if (!newText) return existing;

        const existingParts = existing.split(',').map(s => s.trim().toLowerCase());
        const newParts = newText.split(',').map(s => s.trim());

        const uniqueNewParts = newParts.filter(part =>
            !existingParts.includes(part.toLowerCase())
        );

        if (uniqueNewParts.length === 0) return existing;
        return existing + ', ' + uniqueNewParts.join(', ');
    };

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
                    physicalDescription: presetApplyMode === 'append'
                        ? mergeUnique(prev.physicalDescription || '', physicalPrompts.join(', '))
                        : physicalPrompts.join(', ')
                }));
            }
            if (clothingPrompts.length > 0) {
                setNewCharacter(prev => ({
                    ...prev,
                    clothingDescription: presetApplyMode === 'append'
                        ? mergeUnique(prev.clothingDescription || '', clothingPrompts.join(', '))
                        : clothingPrompts.join(', ')
                }));
            }
            if (personalityPrompts.length > 0) {
                setNewCharacter(prev => ({
                    ...prev,
                    personalityTraits: presetApplyMode === 'append'
                        ? mergeUnique(prev.personalityTraits || '', personalityPrompts.join(', '))
                        : personalityPrompts.join(', ')
                }));
            }
        } else if (target === 'existing') {
            // Use setSelectedCharacter with callback to get latest state
            setSelectedCharacter(current => {
                if (!current) return current;
                const updatedCharacter = { ...current };
                if (physicalPrompts.length > 0) {
                    updatedCharacter.physicalDescription = presetApplyMode === 'append'
                        ? mergeUnique(current.physicalDescription, physicalPrompts.join(', '))
                        : physicalPrompts.join(', ');
                }
                if (clothingPrompts.length > 0) {
                    updatedCharacter.clothingDescription = presetApplyMode === 'append'
                        ? mergeUnique(current.clothingDescription, clothingPrompts.join(', '))
                        : clothingPrompts.join(', ');
                }
                if (personalityPrompts.length > 0) {
                    updatedCharacter.personalityTraits = presetApplyMode === 'append'
                        ? mergeUnique(current.personalityTraits, personalityPrompts.join(', '))
                        : personalityPrompts.join(', ');
                }
                // Call handleUpdateCharacter outside of setState
                setTimeout(() => handleUpdateCharacter(updatedCharacter), 0);
                return updatedCharacter;
            });
        }

    }, [handleUpdateCharacter]);

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
                                    <div className="flex items-center space-x-2">
                                        {/* Preset Mode Toggle */}
                                        <div className="flex items-center bg-gray-700 rounded p-1">
                                            <button
                                                onClick={() => setPresetApplyMode('replace')}
                                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                                    presetApplyMode === 'replace'
                                                        ? 'bg-purple-600 text-white'
                                                        : 'text-gray-400 hover:text-white'
                                                }`}
                                                title={t('characterCreator.replaceMode')}
                                            >
                                                Replace
                                            </button>
                                            <button
                                                onClick={() => setPresetApplyMode('append')}
                                                className={`px-2 py-1 text-xs rounded transition-colors ${
                                                    presetApplyMode === 'append'
                                                        ? 'bg-purple-600 text-white'
                                                        : 'text-gray-400 hover:text-white'
                                                }`}
                                                title={t('characterCreator.appendMode')}
                                            >
                                                Append
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => openPresetModal('new')}
                                            className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-colors flex items-center space-x-1"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            <span className="text-sm">{t('characterCreator.presets')}</span>
                                        </button>
                                    </div>
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                {t('characterCreator.gender')}
                                            </label>
                                            <select
                                                value={newCharacter.gender || 'neutral'}
                                                onChange={(e) => setNewCharacter({ ...newCharacter, gender: e.target.value as Character['gender'] })}
                                                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                                            >
                                                <option value="male">{t('characterCreator.male')}</option>
                                                <option value="female">{t('characterCreator.female')}</option>
                                                <option value="neutral">{t('characterCreator.neutral')}</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                {t('characterCreator.characterType')}
                                            </label>
                                            <select
                                                value={newCharacter.characterType || 'human'}
                                                onChange={(e) => setNewCharacter({ ...newCharacter, characterType: e.target.value as Character['characterType'] })}
                                                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                                            >
                                                <option value="human">{t('characterCreator.human')}</option>
                                                <option value="animal">{t('characterCreator.animal')}</option>
                                                <option value="fantasy">{t('characterCreator.fantasy')}</option>
                                                <option value="robot">{t('characterCreator.robot')}</option>
                                                <option value="alien">{t('characterCreator.alien')}</option>
                                            </select>
                                        </div>
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
                                            onClick={() => {
                                                // Clean up previous 3D model if switching characters
                                                if (selectedCharacter?.id !== character.id && gaussianRenderer && selectedCharacter?.model3D) {
                                                    gaussianRenderer.destroy();
                                                    setGaussianRenderer(null);
                                                    setRender3DError(null);
                                                }
                                                setSelectedCharacter(character);
                                            }}
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
                        {/* Error Banner */}
                        {generationError && (
                            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-red-300 text-sm">{generationError.message}</span>
                                    <div className="flex items-center space-x-2">
                                        {generationError.retryCallback && (
                                            <button
                                                onClick={generationError.retryCallback}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                                            >
                                                <RefreshCw className="w-3 h-3 inline mr-1" />
                                                {t('characterCreator.retry')}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setGenerationError(null)}
                                            className="text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedCharacter ? (
                            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedCharacter.name}</h2>
                                        <p className="text-gray-400">
                                            {t(`characterCreator.${selectedCharacter.role}`)} •
                                            {t(`characterCreator.${selectedCharacter.gender || 'neutral'}`)} •
                                            {t(`characterCreator.${selectedCharacter.characterType || 'human'}`)}
                                        </p>
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

                                

                                {/* Character Basic Info */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            {t('characterCreator.gender')}
                                        </label>
                                        <select
                                            value={selectedCharacter.gender || 'neutral'}
                                            onChange={(e) => {
                                                const updated = { ...selectedCharacter, gender: e.target.value as Character['gender'] };
                                                handleUpdateCharacter(updated);
                                                setSelectedCharacter(updated);
                                            }}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="male">{t('characterCreator.male')}</option>
                                            <option value="female">{t('characterCreator.female')}</option>
                                            <option value="neutral">{t('characterCreator.neutral')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            {t('characterCreator.characterType')}
                                        </label>
                                        <select
                                            value={selectedCharacter.characterType || 'human'}
                                            onChange={(e) => {
                                                const updated = { ...selectedCharacter, characterType: e.target.value as Character['characterType'] };
                                                handleUpdateCharacter(updated);
                                                setSelectedCharacter(updated);
                                            }}
                                            className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="human">{t('characterCreator.human')}</option>
                                            <option value="animal">{t('characterCreator.animal')}</option>
                                            <option value="fantasy">{t('characterCreator.fantasy')}</option>
                                            <option value="robot">{t('characterCreator.robot')}</option>
                                            <option value="alien">{t('characterCreator.alien')}</option>
                                        </select>
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

                                {/* Unified Character Generation */}
                                <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                                            <Zap className="w-5 h-5 text-yellow-400" />
                                            <span>Character Generation Suite</span>
                                        </h3>
                                        {(generationProgress || isGenerating) && (
                                            <span className="text-sm text-green-400">
                                                {generationProgress || 'Generating...'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Image Generation Model Selection */}
                                    <div className="mb-4">
                                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Image Generation Model</h4>
                                        <div className="ml-4 mb-3">
                                            <select
                                                value={generation2DOptions.model}
                                                onChange={(e) => setGeneration2DOptions({...generation2DOptions, model: e.target.value as any})}
                                                className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm"
                                            >
                                                <optgroup label="Premium Models">
                                                    <option value="dall-e-3">DALL-E 3</option>
                                                    <option value="midjourney-v7">Midjourney v7</option>
                                                    <option value="google-imagen-4">Google Imagen 4</option>
                                                </optgroup>
                                                <optgroup label="Open Source">
                                                    <option value="stable-diffusion-3.5">Stable Diffusion 3.5</option>
                                                    <option value="flux-pro">Flux Pro</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                    </div>

                                    {/* 3D Generation Options */}
                                    <div className="mb-4">
                                        <label className="flex items-center space-x-2 mb-2">
                                            <input
                                                type="checkbox"
                                                checked={aiGenerationEnabled.generate3D}
                                                onChange={(e) => setAiGenerationEnabled({
                                                    ...aiGenerationEnabled,
                                                    generate3D: e.target.checked
                                                })}
                                                className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
                                            />
                                            <h4 className="text-sm font-medium text-gray-300">3D Model Generation</h4>
                                        </label>
                                        {aiGenerationEnabled.generate3D && (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 ml-7">
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
                                        )}
                                    </div>

                                    {/* Digital Human Options */}
                                    <div className="mb-4">
                                        <label className="flex items-center space-x-2 mb-2">
                                            <input
                                                type="checkbox"
                                                checked={aiGenerationEnabled.generateDigitalHuman}
                                                onChange={(e) => setAiGenerationEnabled({
                                                    ...aiGenerationEnabled,
                                                    generateDigitalHuman: e.target.checked
                                                })}
                                                className="w-5 h-5 rounded border-gray-600 text-green-600 focus:ring-green-500 focus:ring-offset-0 bg-gray-700"
                                            />
                                            <h4 className="text-sm font-medium text-gray-300">Digital Human</h4>
                                        </label>
                                        {aiGenerationEnabled.generateDigitalHuman && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2 ml-7">
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
                                        )}
                                    </div>

                                    {/* Unified Generation Button */}
                                    <button
                                        onClick={handleGenerateAll}
                                        disabled={isGeneratingAI || isGenerating}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 transition-all flex items-center justify-center space-x-2 font-semibold"
                                    >
                                        {(isGeneratingAI || isGenerating) ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                <span>Generating Character Images...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                <span>Generate Character Images</span>
                                                <Camera className="w-5 h-5" />
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
                                        <div className="relative">
                                            <div
                                                ref={setRendererContainer}
                                                className="w-full h-96 bg-gray-900 rounded-lg border border-gray-700"
                                            />
                                            {/* 3D Loading State */}
                                            {isLoading3D && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-lg">
                                                    <div className="text-center">
                                                        <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
                                                        <span className="text-gray-300">Loading 3D model...</span>
                                                    </div>
                                                </div>
                                            )}
                                            {/* 3D Error State */}
                                            {render3DError && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-lg">
                                                    <div className="text-center p-4">
                                                        <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                                        <p className="text-red-400 text-sm">Failed to load 3D model</p>
                                                        <p className="text-gray-500 text-xs mt-1">{render3DError}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Manual Feature Refinement for Better Consistency */}
                                {selectedCharacter.frontFaceImage && !selectedCharacter.fullBodyImage && !selectedCharacter.angleFaceImage && (
                                    <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6">
                                        <h4 className="text-yellow-400 font-medium mb-2">🎯 {t('characterCreator.improveConsistency', 'Improve Character Consistency')}</h4>
                                        <p className="text-gray-400 text-sm mb-3">
                                            {t('characterCreator.refineFeatures', '첫 번째 이미지를 보고 더 구체적인 특징을 입력하면 일관성이 향상됩니다')}
                                        </p>
                                        <textarea
                                            value={manualFeatures}
                                            onChange={(e) => setManualFeatures(e.target.value)}
                                            placeholder={t('characterCreator.featurePlaceholder', '예: 검은색 짧은 단발머리, 갈색 눈, 둥근 얼굴형, 작은 코, 검은색 가죽 재킷...')}
                                            className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm"
                                        />
                                        <button
                                            onClick={handleGenerateAll}
                                            className="mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
                                        >
                                            {t('characterCreator.regenerateWithFeatures', '특징 적용하여 나머지 생성')}
                                        </button>
                                    </div>
                                )}

                                {/* Three-Panel Image Gallery - Equal Width Columns */}
                                {(selectedCharacter.fullBodyImage || selectedCharacter.frontFaceImage || selectedCharacter.angleFaceImage || selectedCharacter.fullBodyReference || selectedCharacter.headShotReference) && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Left Panel - Full Body Image (1:2 ratio, fills container) */}
                                        {(selectedCharacter.fullBodyImage || selectedCharacter.fullBodyReference) && (
                                            <div className="flex flex-col">
                                                <h4 className="text-sm font-medium text-gray-300 mb-2">{t('characterCreator.fullBodyReference')}</h4>
                                                <div className="bg-gray-900 rounded-lg border border-gray-700 relative" style={{ paddingBottom: '200%' }}>
                                                    <img
                                                        src={selectedCharacter.fullBodyImage || selectedCharacter.fullBodyReference}
                                                        alt="Full Body Reference (1:2 ratio)"
                                                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                                        style={{ objectPosition: 'center top' }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Right Panel - Two Face Images (square) */}
                                        <div className="flex flex-col h-full">
                                            <div className="flex-1 grid grid-rows-2 gap-4">
                                                {/* Top Right - Front Face */}
                                                {(selectedCharacter.frontFaceImage || selectedCharacter.headShotReference) && (
                                                    <div className="flex flex-col">
                                                        <h4 className="text-sm font-medium text-gray-300 mb-2">{t('characterCreator.frontFace')}</h4>
                                                        <div className="bg-gray-900 rounded-lg border border-gray-700 relative flex-1" style={{ paddingBottom: '95%' }}>
                                                            <img
                                                                src={selectedCharacter.frontFaceImage || selectedCharacter.headShotReference}
                                                                alt="Front Face (Passport Style)"
                                                                className="absolute inset-0 w-full h-full object-contain rounded-lg p-2"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Bottom Right - 45-degree Face */}
                                                {selectedCharacter.angleFaceImage && (
                                                    <div className="flex flex-col">
                                                        <h4 className="text-sm font-medium text-gray-300 mb-2">{t('characterCreator.angleFace')}</h4>
                                                        <div className="bg-gray-900 rounded-lg border border-gray-700 relative flex-1" style={{ paddingBottom: '95%' }}>
                                                            <img
                                                                src={selectedCharacter.angleFaceImage}
                                                                alt="45-Degree Angle Face"
                                                                className="absolute inset-0 w-full h-full object-contain rounded-lg p-2"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Legacy generated images if any */}
                                {selectedCharacter.generatedImages && selectedCharacter.generatedImages.length > 0 && (
                                    <div className="mt-4">
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

