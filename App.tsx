
import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Header from './components/Header';
import ModeSwitcher from './components/ModeSwitcher';
import InputForm from './components/InputForm';
import DescriptionDisplay from './components/DescriptionDisplay';
import StoryboardInputForm from './components/StoryboardInputForm';
import StoryboardDisplay from './components/StoryboardDisplay';
import DetailedStoryboardModal from './components/DetailedStoryboardModal';
import VideoDisplay from './components/VideoDisplay';
import ProfessionalStoryboardSettings from './components/ProfessionalStoryboardSettings';
import ApiKeyInstructions from './components/ApiKeyInstructions';
import ApiKeyManager from './components/ApiKeyManager';
import SampleGalleryModal from './components/SampleGalleryModal';
import GalleryModal from './components/GalleryModal';
import MediaArtGenerator from './components/MediaArtGenerator';
import ImageSelectionModal from './components/ImageSelectionModal';
import VisualArtGenerator from './components/VisualArtGenerator';

import { 
    AppMode, 
    DescriptionConfig, 
    Tone, 
    StoryboardConfig, 
    AspectRatio, 
    VisualStyle,
    VideoLength,
    Mood,
    StoryboardPanel,
    DetailedStoryboardPanel,
    SampleProduct,
    SampleStory,
    Project,
    MediaArtState,
    MediaArtStyle,
    MediaArtSourceImage,
    VisualArtState,
    VisualArtEffect,
} from './types';
import { aiService } from './services/aiService';
import { professionalImageService, CharacterReference, StyleGuide } from './services/professionalImageService';
import * as db from './services/db';
import { useTranslation } from './i18n/LanguageContext';
import { sampleProductsData, sampleStoryIdeasData } from './sampleData';
import { MEDIA_ART_STYLE_OPTIONS } from './constants';

const hasApiKeys = () => {
    // Check environment variables
    if (import.meta.env.VITE_GOOGLE_API_KEY || 
        import.meta.env.VITE_OPENAI_API_KEY || 
        import.meta.env.VITE_ANTHROPIC_API_KEY ||
        import.meta.env.VITE_XAI_API_KEY ||
        import.meta.env.VITE_REPLICATE_API_KEY) {
        return true;
    }
    
    // Check localStorage
    if (localStorage.getItem('apiKey_google') ||
        localStorage.getItem('apiKey_openai') ||
        localStorage.getItem('apiKey_anthropic') ||
        localStorage.getItem('apiKey_xai') ||
        localStorage.getItem('apiKey_replicate')) {
        return true;
    }
    
    return false;
};

const App: React.FC = () => {
    const { t, language } = useTranslation();

    // Global State
    const [mode, setMode] = useState<AppMode>(AppMode.DESCRIPTION);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

    // Description Mode State
    const initialDescriptionConfig: DescriptionConfig = {
        productName: '',
        keyFeatures: '',
        targetAudience: '',
        tone: Tone.FRIENDLY,
        language: 'English',
        textModel: 'gpt-5-turbo',
        imageModel: 'dall-e-4-hd',
        videoModel: 'sora-2-turbo',
    };
    const [descriptionConfig, setDescriptionConfig] = useState<DescriptionConfig>(initialDescriptionConfig);
    const [description, setDescription] = useState('');
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

    // Storyboard Mode State
    const initialStoryboardConfig: StoryboardConfig = {
        sceneCount: 4,
        aspectRatio: AspectRatio.LANDSCAPE,
        visualStyle: VisualStyle.CINEMATIC,
        videoLength: VideoLength.SHORT,
        mood: Mood.EPIC,
        descriptionLanguage: 'English',
        textModel: 'gpt-5-turbo',
        imageModel: 'dall-e-4-hd',
        videoModel: 'sora-2-turbo',
    };
    const [storyboardConfig, setStoryboardConfig] = useState<StoryboardConfig>(initialStoryboardConfig);
    const [storyIdea, setStoryIdea] = useState('');
    const [storyboardPanels, setStoryboardPanels] = useState<StoryboardPanel[]>([]);
    const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);
    
    // Professional Mode State
    const [isProfessionalMode, setIsProfessionalMode] = useState(true);
    const [characters, setCharacters] = useState<CharacterReference[]>([]);
    const [styleGuide, setStyleGuide] = useState<StyleGuide>({
        cinematography: {
            lighting: 'dramatic' as const,
            colorGrading: 'cinematic' as const,
            cameraAngle: 'eye level' as const,
            depthOfField: 'shallow' as const,
            aspectRatio: '2.39:1' as const
        },
        artDirection: {
            artStyle: 'hyperrealistic' as const,
            productionQuality: 'blockbuster' as const,
            era: 'contemporary' as const,
            mood: 'dramatic' as const
        },
        technicalSpecs: {
            resolution: '8K' as const,
            quality: 'maximum' as const,
            renderEngine: 'unreal engine 5' as const,
            postProcessing: ['color grading', 'film grain', 'chromatic aberration subtle']
        }
    });
    
    // Media Art Mode State
    const initialMediaArtState: MediaArtState = {
        sourceImage: null,
        style: MediaArtStyle.DATA_COMPOSITION,
        styleParams: MEDIA_ART_STYLE_OPTIONS.find(opt => opt.value === MediaArtStyle.DATA_COMPOSITION)!.defaultParams,
        panels: [],
    };
    const [mediaArtState, setMediaArtState] = useState<MediaArtState>(initialMediaArtState);
    const [isGeneratingMediaArtScenes, setIsGeneratingMediaArtScenes] = useState(false);
    const [mediaArtError, setMediaArtError] = useState<string | null>(null);

    // Visual Art Mode State
    const initialVisualArtState: VisualArtState = {
        inputText: '',
        effect: VisualArtEffect.GLITCH,
        resultVideoUrl: null,
        isLoading: false,
        error: null,
    };
    const [visualArtState, setVisualArtState] = useState<VisualArtState>(initialVisualArtState);

    // Modal State
    const [isDetailedModalOpen, setIsDetailedModalOpen] = useState(false);
    const [detailedModalPanels, setDetailedModalPanels] = useState<DetailedStoryboardPanel[]>([]);
    const [isDetailedModalLoading, setIsDetailedModalLoading] = useState(false);
    const [detailedModalError, setDetailedModalError] = useState<string | null>(null);
    const [originalSceneContext, setOriginalSceneContext] = useState<{ description: string, index: number } | null>(null);
    const [isSampleGalleryOpen, setIsSampleGalleryOpen] = useState(false);
    const [sampleGalleryType, setSampleGalleryType] = useState<'product' | 'story'>('product');
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
    const [isApiKeyManagerOpen, setIsApiKeyManagerOpen] = useState(false);
    
    // Generic loading/error for now
    const [error, setError] = useState<string | null>(null);
    
    const getSampleProducts = useCallback(() => {
        const langCode = language === 'Korean' ? 'ko' : 'en';
        return Object.values(sampleProductsData).map(p => p[langCode]);
    }, [language]);

    const getSampleStories = useCallback(() => {
        const langCode = language === 'Korean' ? 'ko' : 'en';
        return Object.values(sampleStoryIdeasData).map(s => s[langCode]);
    }, [language]);

    // Handlers for Description Mode
    const handleGenerateDescription = async () => {
        setIsGeneratingDescription(true);
        setError(null);
        setDescription('');
        try {
            const prompt = `Generate a compelling product description.
    - Product Name: ${descriptionConfig.productName}
    - Key Features: ${descriptionConfig.keyFeatures}
    - Target Audience: ${descriptionConfig.targetAudience}
    - Tone: ${descriptionConfig.tone}
    - Language: ${descriptionConfig.language}
    
    The description should be concise, engaging, and highlight the key benefits for the target audience. Do not include a title or header.`;
            const result = await aiService.generateText({
                prompt,
                model: descriptionConfig.textModel,
                temperature: 0.7
            });
            setDescription(result);
        } catch (e: any) {
            setError(e.message || t('errors.descriptionGeneration'));
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    // Handlers for Storyboard Mode
    const handleGenerateStoryboard = async (idea: string, config: StoryboardConfig) => {
        setStoryIdea(idea);
        setStoryboardConfig(config);
        setIsGeneratingStoryboard(true);
        setIsGeneratingImages(true);
        setError(null);
        setStoryboardPanels([]);

        try {
            if (isProfessionalMode && characters.length > 0) {
                // Professional mode with character consistency
                const prompt = `Generate a ${config.sceneCount}-scene storyboard for a ${config.videoLength} video.
    - Idea: ${idea}
    - Visual Style: ${config.visualStyle}
    - Mood: ${config.mood}
    - Language for descriptions: ${config.descriptionLanguage}
    - Characters: ${characters.map(c => c.name).join(', ')}
    
    Return exactly ${config.sceneCount} scene descriptions. Each should be visual, cinematic, and include the characters where appropriate.`;
                const storyboardText = await aiService.generateText({
                    prompt,
                    model: config.textModel,
                    temperature: 0.8
                });
                const scenes = storyboardText.split('\n\n').filter(p => p.trim()).slice(0, config.sceneCount);
                
                // Use professional image service for consistent generation
                const images = await professionalImageService.generateStoryboardWithConsistency(
                    scenes,
                    characters,
                    styleGuide,
                    config.imageModel
                );
                
                const panels: StoryboardPanel[] = scenes.map((description, i) => ({
                    description,
                    imageUrl: images[i].startsWith('data:') || images[i].startsWith('http') 
                        ? images[i] 
                        : `data:image/jpeg;base64,${images[i]}`,
                    isLoadingImage: false
                }));
                setStoryboardPanels(panels);
            } else {
                // Standard mode or professional mode without characters
                const prompt = `Generate a ${config.sceneCount}-scene storyboard for a ${config.videoLength} video.
    - Idea: ${idea}
    - Visual Style: ${config.visualStyle}
    - Aspect Ratio: ${config.aspectRatio}
    - Mood: ${config.mood}
    - Language for descriptions: ${config.descriptionLanguage}
    
    Return exactly ${config.sceneCount} scene descriptions. Each should be visual, cinematic, and suitable for the specified mood and style.`;
                const storyboardText = await aiService.generateText({
                    prompt,
                    model: config.textModel,
                    temperature: 0.8
                });
                const panels = storyboardText.split('\n\n').filter(p => p.trim()).slice(0, config.sceneCount).map(description => ({ description }));
                const initialPanels: StoryboardPanel[] = panels.map(p => ({ ...p, isLoadingImage: true }));
                setStoryboardPanels(initialPanels);
                setIsGeneratingStoryboard(false);

                // Generate images
                let currentPanels = [...initialPanels];
                for (let i = 0; i < panels.length; i++) {
                    try {
                        let imageUrls;
                        if (isProfessionalMode) {
                            // Use professional service even without characters
                            imageUrls = await professionalImageService.generateProfessionalImage({
                                prompt: panels[i].description,
                                model: config.imageModel,
                                styleGuide: styleGuide,
                                qualitySettings: {
                                    steps: 50,
                                    cfgScale: 7.5,
                                    upscale: true,
                                    enhanceFaces: true
                                }
                            });
                        } else {
                            imageUrls = await aiService.generateImage({
                                prompt: panels[i].description,
                                model: config.imageModel,
                                aspectRatio: config.aspectRatio,
                                count: 1
                            });
                        }
                        const imageBase64 = imageUrls[0];
                        const imageUrl = imageBase64.startsWith('data:') || imageBase64.startsWith('http') 
                            ? imageBase64 
                            : `data:image/jpeg;base64,${imageBase64}`;
                        currentPanels[i] = { ...currentPanels[i], imageUrl, isLoadingImage: false };
                    } catch (imgErr: any) {
                        console.error(`Image generation failed for panel ${i}:`, imgErr);
                        const isQuotaError = imgErr.message?.includes('429');
                        currentPanels[i] = { ...currentPanels[i], imageUrl: isQuotaError ? 'quota_error' : 'error', isLoadingImage: false };
                    }
                    setStoryboardPanels([...currentPanels]);
                }
            }
        } catch (e: any) {
            setError(e.message || t('errors.storyboardGeneration'));
            setIsGeneratingStoryboard(false);
        } finally {
            setIsGeneratingImages(false);
        }
    };
    
    const handleExpandScene = async (sceneDescription: string, index: number) => {
        setOriginalSceneContext({ description: sceneDescription, index });
        setIsDetailedModalOpen(true);
        setIsDetailedModalLoading(true);
        setDetailedModalError(null);
        setDetailedModalPanels([]);
        try {
            const prompt = `Generate a detailed 4-scene expansion of this scene: "${sceneDescription}".
    Language: ${storyboardConfig.descriptionLanguage}
    Return exactly 4 detailed scene descriptions that expand on the original scene. Do not use markdown formatting, headers, or numbering. Just provide clean text descriptions separated by line breaks.`;
            const detailedText = await aiService.generateText({
                prompt,
                model: storyboardConfig.textModel,
                temperature: 0.8
            });
            
            // Clean the response from markdown and extract descriptions
            const cleanedText = detailedText
                .replace(/#{1,6}\s*/g, '') // Remove markdown headers
                .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1') // Remove bold/italic markdown
                .replace(/^\d+\.\s*/gm, '') // Remove numbered lists
                .replace(/^[-*]\s*/gm, '') // Remove bullet points
                .trim();
            
            // Split by double newlines or scene indicators
            const descriptions = cleanedText
                .split(/\n{2,}|(?=확장된 장면|Scene\s*\d+|Panel\s*\d+|장면\s*\d+)/i)
                .map(text => text
                    .replace(/^(확장된 장면|Scene|Panel|장면)\s*\d+[:.]?\s*/i, '') // Remove scene/panel prefixes
                    .replace(/^[\s:]+/, '') // Remove leading colons and spaces
                    .replace(/^(출발과 준비|팀원들의 첫 만남|준비 단계 완료|출발 직전)[:.]?\s*/, '') // Remove common Korean scene titles
                    .trim()
                )
                .filter(text => text.length > 20) // Filter out too-short segments
                .slice(0, 4); // Take exactly 4 scenes
            
            // Ensure we have exactly 4 descriptions
            while (descriptions.length < 4) {
                descriptions.push(`Extended scene ${descriptions.length + 1}: Continuation of the narrative`);
            }
            
            const newPanelsData = descriptions.map(description => ({ description }));
            const newPanels: DetailedStoryboardPanel[] = newPanelsData.map(p => ({ ...p, isLoadingImage: true }));
            setDetailedModalPanels(newPanels);
            setIsDetailedModalLoading(false);

            let currentDetailedPanels = [...newPanels];
            for (let i = 0; i < newPanels.length; i++) {
                try {
                    const imageUrls = await aiService.generateImage({
                        prompt: newPanels[i].description,
                        model: storyboardConfig.imageModel,
                        aspectRatio: storyboardConfig.aspectRatio,
                        count: 1
                    });
                    const imageBase64 = imageUrls[0];
                    currentDetailedPanels[i] = { ...currentDetailedPanels[i], imageUrl: `data:image/jpeg;base64,${imageBase64}`, isLoadingImage: false };
                } catch (imgErr) {
                    currentDetailedPanels[i] = { ...currentDetailedPanels[i], imageUrl: 'error', isLoadingImage: false };
                }
                setDetailedModalPanels([...currentDetailedPanels]);
            }
        } catch (e: any) {
            setDetailedModalError(e.message || t('errors.sceneExpansion'));
            setIsDetailedModalLoading(false);
        }
    };

    const handleSaveChangesFromModal = (editedPanels: DetailedStoryboardPanel[]) => {
        if (originalSceneContext) {
            const { index } = originalSceneContext;
            const newStoryboardPanels = [...storyboardPanels];
            const panelsToInsert = editedPanels.map(p => ({
                description: p.description,
                imageUrl: p.imageUrl,
                isLoadingImage: false,
                sceneDuration: 4,
            }));
            newStoryboardPanels.splice(index, 1, ...panelsToInsert);
            setStoryboardPanels(newStoryboardPanels);
        }
        setIsDetailedModalOpen(false);
    };

    const handleRegenerateImage = async (index: number) => {
        const panels = [...storyboardPanels];
        panels[index] = { ...panels[index], imageUrl: undefined, isLoadingImage: true };
        setStoryboardPanels(panels);

        try {
            let imageUrls;
            if (isProfessionalMode) {
                imageUrls = await professionalImageService.generateProfessionalImage({
                    prompt: panels[index].description,
                    model: storyboardConfig.imageModel,
                    characters: characters,
                    styleGuide: styleGuide,
                    qualitySettings: {
                        steps: 50,
                        cfgScale: 7.5,
                        upscale: true,
                        enhanceFaces: true
                    }
                });
            } else {
                imageUrls = await aiService.generateImage({
                    prompt: panels[index].description,
                    model: storyboardConfig.imageModel,
                    aspectRatio: storyboardConfig.aspectRatio,
                    count: 1
                });
            }
            const imageBase64 = imageUrls[0];
            panels[index].imageUrl = imageBase64.startsWith('data:') || imageBase64.startsWith('http')
                ? imageBase64
                : `data:image/jpeg;base64,${imageBase64}`;
        } catch (e) {
            panels[index].imageUrl = 'error';
        } finally {
            panels[index].isLoadingImage = false;
            setStoryboardPanels([...panels]);
        }
    };
    
    const handleRegenerateVideo = async (index: number) => {
        const panel = storyboardPanels[index];
        if (!panel.imageUrl || !panel.imageUrl.startsWith('data:image')) return;

        const panels = [...storyboardPanels];
        panels[index] = { ...panels[index], videoUrl: undefined, isLoadingVideo: true, videoError: null };
        setStoryboardPanels(panels);

        try {
            const imageBase64 = panel.imageUrl.split(',')[1];
            const videoUrl = await aiService.generateVideo({
                prompt: panel.description,
                model: storyboardConfig.videoModel,
                duration: panel.sceneDuration || 4
            });
            panels[index].videoUrl = videoUrl;
        } catch (e: any) {
            panels[index].videoUrl = 'error';
            panels[index].videoError = e.message || t('errors.videoGeneration');
        } finally {
            panels[index].isLoadingVideo = false;
            setStoryboardPanels([...panels]);
        }
    };

    // Sample Gallery Handlers
    const handleShowSampleGallery = (type: 'product' | 'story') => {
        setSampleGalleryType(type);
        setIsSampleGalleryOpen(true);
    };

    const handleSelectSampleProduct = (product: SampleProduct) => {
        setDescriptionConfig({ ...descriptionConfig, ...product });
        setIsSampleGalleryOpen(false);
    };
    
    const handleSelectSampleStory = (story: SampleStory) => {
        setStoryIdea(story.idea);
        setStoryboardConfig(story.config);
        setIsSampleGalleryOpen(false);
        handleGenerateStoryboard(story.idea, story.config);
    };

    // Project Management (DB)
    const loadProjects = async () => {
        const savedProjects = await db.getProjects();
        setProjects(savedProjects);
    };

    const handleOpenGallery = () => {
        loadProjects();
        setIsGalleryOpen(true);
    };

    const handleNewProject = () => {
        setCurrentProjectId(null);
        setDescriptionConfig(initialDescriptionConfig);
        setDescription('');
        setStoryboardConfig(initialStoryboardConfig);
        setStoryIdea('');
        setStoryboardPanels([]);
        setMediaArtState(initialMediaArtState);
        setVisualArtState(initialVisualArtState);
        setError(null);
    };
    
    // Media Art Handlers
    const handleGenerateMediaArtScenes = async () => {
        if (!mediaArtState.sourceImage) return;
        setIsGeneratingMediaArtScenes(true);
        setMediaArtError(null);
        setMediaArtState(s => ({ ...s, panels: [] }));

        try {
            const { sourceImage, style, styleParams } = mediaArtState;
            // For now, use text generation to create media art panels
            const styleDescription = style.replace(/_/g, ' ').toLowerCase();
            const prompt = `Create a 4-scene artistic transformation of an image (${sourceImage.title}) using the ${styleDescription} style.
    Language: ${language}
    Return exactly 4 scene descriptions that artistically transform the original image.`;
            const panelText = await aiService.generateText({
                prompt,
                model: 'gemini-2.5-flash',
                temperature: 0.9
            });
            const panels = panelText.split('\n\n').filter(p => p.trim()).slice(0, 4).map(description => ({ description }));
            const initialPanels: StoryboardPanel[] = panels.map(p => ({ ...p, isLoadingImage: true, sceneDuration: 4 }));
            setMediaArtState(s => ({ ...s, panels: initialPanels }));
            
            let currentPanels = [...initialPanels];
            for (let i = 0; i < panels.length; i++) {
                try {
                    const imageUrls = await aiService.generateImage({
                        prompt: panels[i].description,
                        model: 'flux-pro',
                        aspectRatio: AspectRatio.LANDSCAPE,
                        count: 1
                    });
                    const imageBase64 = imageUrls[0];
                    // Check if it's already a data URL or a placeholder URL
                    const imageUrl = imageBase64.startsWith('data:') || imageBase64.startsWith('http') 
                        ? imageBase64 
                        : `data:image/jpeg;base64,${imageBase64}`;
                    currentPanels[i] = { ...currentPanels[i], imageUrl, isLoadingImage: false };
                } catch (imgErr) {
                    currentPanels[i] = { ...currentPanels[i], imageUrl: 'error', isLoadingImage: false };
                }
                setMediaArtState(s => ({ ...s, panels: [...currentPanels] }));
            }
        } catch (e: any) {
            setMediaArtError(e.message || t('errors.mediaArtGeneration'));
        } finally {
            setIsGeneratingMediaArtScenes(false);
        }
    };
    
    const handleRegenerateMediaArtImage = async (index: number) => {
        const panels = [...mediaArtState.panels];
        if (!panels[index]) return;
    
        const updatedPanels = [...panels];
        updatedPanels[index] = { ...updatedPanels[index], imageUrl: undefined, isLoadingImage: true };
        setMediaArtState(s => ({ ...s, panels: updatedPanels }));
    
        try {
            const imageUrls = await aiService.generateImage({
                prompt: updatedPanels[index].description,
                model: 'flux-pro',
                aspectRatio: AspectRatio.LANDSCAPE,
                count: 1
            });
            const imageBase64 = imageUrls[0];
            updatedPanels[index] = { ...updatedPanels[index], imageUrl: `data:image/jpeg;base64,${imageBase64}`, isLoadingImage: false };
        } catch (e) {
            updatedPanels[index] = { ...updatedPanels[index], imageUrl: 'error', isLoadingImage: false };
        } finally {
            setMediaArtState(s => ({ ...s, panels: [...updatedPanels] }));
        }
    };

    // Visual Art Handlers
    const handleGenerateVisualArt = async () => {
        setVisualArtState(s => ({ ...s, isLoading: true, error: null, resultVideoUrl: null }));
        try {
            const resultUrl = await aiService.generateVideo({
                prompt: `Create a visual art video with ${visualArtState.effect} effects based on: ${visualArtState.inputText}`,
                model: 'luma-dream-machine',
                duration: 5
            });
            setVisualArtState(s => ({ ...s, resultVideoUrl: resultUrl }));
        } catch (e: any) {
            setVisualArtState(s => ({ ...s, error: e.message || t('errors.visualArtGeneration') }));
        } finally {
            setVisualArtState(s => ({ ...s, isLoading: false }));
        }
    };

    if (!hasApiKeys()) {
        return <ApiKeyInstructions />;
    }

    return (
        <>
            <div className="bg-slate-900 text-white min-h-screen font-sans">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Header 
                        onOpenGallery={handleOpenGallery} 
                        onNewProject={handleNewProject} 
                        onImport={() => {}} 
                        onOpenApiKeys={() => setIsApiKeyManagerOpen(true)}
                    />
                    <div className="mt-12">
                        <ModeSwitcher mode={mode} setMode={setMode} />
                    </div>
                    <div className="mt-8">
                        {mode === AppMode.DESCRIPTION && (
                            <div className="max-w-3xl mx-auto">
                                <InputForm 
                                    config={descriptionConfig} 
                                    setConfig={setDescriptionConfig}
                                    onGenerate={handleGenerateDescription}
                                    isLoading={isGeneratingDescription}
                                    onShowSampleGallery={() => handleShowSampleGallery('product')}
                                />
                                {error && <p className="text-red-400 mt-4">{error}</p>}
                                {description && !isGeneratingDescription && <DescriptionDisplay description={description} />}
                            </div>
                        )}
                        {mode === AppMode.STORYBOARD && (
                            <div className="max-w-5xl mx-auto">
                                {!storyboardPanels.length && !isGeneratingStoryboard && (
                                    <>
                                        <div className="flex justify-center mb-6">
                                            <button
                                                onClick={() => setIsProfessionalMode(!isProfessionalMode)}
                                                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                                    isProfessionalMode
                                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                                }`}
                                            >
                                                {isProfessionalMode ? '🎬 Professional Mode' : '✨ Standard Mode'}
                                            </button>
                                        </div>
                                        {isProfessionalMode ? (
                                            <div className="mb-8">
                                                <ProfessionalStoryboardSettings
                                                    config={storyboardConfig}
                                                    setConfig={setStoryboardConfig}
                                                    characters={characters}
                                                    setCharacters={setCharacters}
                                                    styleGuide={styleGuide}
                                                    setStyleGuide={setStyleGuide}
                                                />
                                                <div className="mt-6">
                                                    <StoryboardInputForm
                                                        onGenerate={handleGenerateStoryboard}
                                                        isLoading={isGeneratingStoryboard}
                                                        config={storyboardConfig}
                                                        setConfig={setStoryboardConfig}
                                                        onShowSampleGallery={() => handleShowSampleGallery('story')}
                                                        hideSettings={true}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <StoryboardInputForm
                                                onGenerate={handleGenerateStoryboard}
                                                isLoading={isGeneratingStoryboard}
                                                config={storyboardConfig}
                                                setConfig={setStoryboardConfig}
                                                onShowSampleGallery={() => handleShowSampleGallery('story')}
                                            />
                                        )}
                                    </>
                                )}
                                {error && <p className="text-red-400 mt-4">{error}</p>}
                                {(isGeneratingStoryboard || storyboardPanels.length > 0) && (
                                    <StoryboardDisplay 
                                        panels={storyboardPanels} 
                                        storyIdea={storyIdea}
                                        onExpandScene={handleExpandScene}
                                        onSceneDurationChange={(index, duration) => {
                                            const newPanels = [...storyboardPanels];
                                            newPanels[index].sceneDuration = duration;
                                            setStoryboardPanels(newPanels);
                                        }}
                                        onRegenerateVideo={handleRegenerateVideo}
                                        onRegenerateImage={handleRegenerateImage}
                                        onDeletePanel={(index) => setStoryboardPanels(storyboardPanels.filter((_, i) => i !== index))}
                                        isGeneratingImages={isGeneratingImages}
                                    />
                                )}
                                <VideoDisplay panels={storyboardPanels} />
                            </div>
                        )}
                        {mode === AppMode.MEDIA_ART && (
                            <div className="max-w-5xl mx-auto">
                                {/* FIX: Removed unused props (`onGenerateClip`, `onGenerateAllClips`, `onSave`, `onExport`, `canSave`) to align with the component's defined interface and fix the type error. */}
                                <MediaArtGenerator 
                                    state={mediaArtState}
                                    setState={setMediaArtState}
                                    onOpenImageSelector={() => setIsImageSelectorOpen(true)}
                                    onGenerateScenes={handleGenerateMediaArtScenes}
                                    onRegenerateImage={handleRegenerateMediaArtImage}
                                    onDeletePanel={(index) => setMediaArtState(s => ({ ...s, panels: s.panels.filter((_, i) => i !== index)}))}
                                    isLoading={isGeneratingMediaArtScenes}
                                    error={mediaArtError}
                                />
                            </div>
                        )}
                         {mode === AppMode.VISUAL_ART && (
                            <div className="max-w-5xl mx-auto">
                                <VisualArtGenerator
                                    state={visualArtState}
                                    setState={setVisualArtState}
                                    onGenerate={handleGenerateVisualArt}
                                />
                            </div>
                         )}
                    </div>
                </main>
            </div>
            {/* Modals */}
            <DetailedStoryboardModal 
                isOpen={isDetailedModalOpen}
                onClose={() => setIsDetailedModalOpen(false)}
                panels={detailedModalPanels}
                isLoading={isDetailedModalLoading}
                error={detailedModalError}
                originalSceneDescription={originalSceneContext?.description}
                onSaveChanges={handleSaveChangesFromModal}
            />
            <SampleGalleryModal
                isOpen={isSampleGalleryOpen}
                onClose={() => setIsSampleGalleryOpen(false)}
                type={sampleGalleryType}
                products={getSampleProducts()}
                stories={getSampleStories()}
                onSelectProduct={handleSelectSampleProduct}
                onSelectStory={handleSelectSampleStory}
            />
            <GalleryModal 
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                projects={projects}
                onLoad={() => {}} // Simplified for now
                onDelete={() => {}} // Simplified for now
                onExport={() => {}} // Simplified for now
            />
            <ApiKeyManager
                isOpen={isApiKeyManagerOpen}
                onClose={() => setIsApiKeyManagerOpen(false)}
            />
            <ImageSelectionModal
                isOpen={isImageSelectorOpen}
                onClose={() => setIsImageSelectorOpen(false)}
                onSelect={(source: MediaArtSourceImage) => {
                    setMediaArtState(s => ({...s, sourceImage: source, panels: []}));
                    setIsImageSelectorOpen(false);
                }}
            />
        </>
    );
};

export default App;
