import { 
    Tone, 
    AspectRatio, 
    VisualStyle, 
    VideoLength, 
    Mood, 
    MediaArtStyle, 
    FamousPainting, 
    VisualArtEffect,
    MediaArtStyleParams
} from './types';

export const TONE_OPTIONS: { value: Tone; label: string }[] = [
    { value: Tone.PROFESSIONAL, label: 'Professional' },
    { value: Tone.FRIENDLY, label: 'Friendly & Casual' },
    { value: Tone.HUMOROUS, label: 'Witty & Humorous' },
    { value: Tone.LUXURIOUS, label: 'Luxurious & Elegant' },
];

export const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string }[] = [
    { value: AspectRatio.LANDSCAPE, label: '16:9 Landscape' },
    { value: AspectRatio.PORTRAIT, label: '9:16 Portrait' },
    { value: AspectRatio.SQUARE, label: '1:1 Square' },
    { value: AspectRatio.VERTICAL, label: '3:4 Vertical' },
    { value: AspectRatio.CLASSIC, label: '4:3 Classic' },
];

export const VISUAL_STYLE_OPTIONS: { value: VisualStyle; label: string }[] = [
    { value: VisualStyle.PHOTOREALISTIC, label: 'Photorealistic' },
    { value: VisualStyle.CINEMATIC, label: 'Cinematic' },
    { value: VisualStyle.ANIME, label: 'Anime' },
    { value: VisualStyle.WATERCOLOR, label: 'Watercolor' },
    { value: VisualStyle.CLAYMATION, label: 'Claymation' },
    { value: VisualStyle.PIXEL_ART, label: 'Pixel Art' },
];

export const VIDEO_LENGTH_OPTIONS: { value: VideoLength; label: string }[] = [
    { value: VideoLength.SHORT, label: '15 seconds' },
    { value: VideoLength.MEDIUM, label: '30 seconds' },
    { value: VideoLength.LONG, label: '60 seconds' },
];

export const MOOD_OPTIONS: { value: Mood; label: string }[] = [
    { value: Mood.FAST_PACED, label: 'Fast-paced & Energetic' },
    { value: Mood.EMOTIONAL, label: 'Slow & Emotional' },
    { value: Mood.MYSTERIOUS, label: 'Mysterious & Suspenseful' },
    { value: Mood.COMEDIC, label: 'Comedic & Lighthearted' },
    { value: Mood.EPIC, label: 'Epic & Grandiose' },
];

export const DESCRIPTION_LANGUAGE_OPTIONS: { value: string; label: string }[] = [
    { value: 'English', label: 'English' },
    { value: 'Korean', label: '한국어' },
    { value: 'Japanese', label: '日本語' },
    { value: 'Spanish', label: 'Español' },
    { value: 'French', label: 'Français' },
];

export const TEXT_MODEL_OPTIONS: { value: string; label: string; description: string }[] = [
    { value: 'gpt-4o', label: 'GPT-4o', description: 'OpenAI\'s latest multimodal flagship model (Nov 2024).' },
    { value: 'gpt-4o-mini', label: 'GPT-4o mini', description: 'Affordable small model for fast tasks with vision support.' },
    { value: 'o1-preview', label: 'OpenAI o1-preview', description: 'Advanced reasoning model for complex problem-solving.' },
    { value: 'o1-mini', label: 'OpenAI o1-mini', description: 'Fast reasoning model optimized for coding and STEM.' },
    { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Anthropic\'s most intelligent model (Oct 2024).' },
    { value: 'claude-3.5-haiku', label: 'Claude 3.5 Haiku', description: 'Fast and affordable Claude with vision capabilities.' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Powerful model for complex analysis and creativity.' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', description: 'Google\'s latest experimental multimodal model (Dec 2024).' },
    { value: 'gemini-exp-1206', label: 'Gemini Experimental', description: 'Google\'s cutting-edge experimental model.' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', description: 'Advanced model with 2M token context window.' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', description: 'Fast multimodal model for high-volume tasks.' },
    { value: 'grok-2', label: 'Grok 2', description: 'xAI\'s witty AI with real-time X platform knowledge.' },
    { value: 'grok-2-vision', label: 'Grok 2 Vision', description: 'Multimodal Grok with image understanding capabilities.' },
    { value: 'llama-3.2-90b', label: 'Llama 3.2 90B', description: 'Meta\'s vision-enabled open model (Sep 2024).' },
    { value: 'llama-3.1-405b', label: 'Llama 3.1 405B', description: 'Meta\'s largest open-source model.' },
    { value: 'mistral-large-2', label: 'Mistral Large 2', description: '123B parameters with 128k context (Jul 2024).' },
    { value: 'mixtral-8x22b', label: 'Mixtral 8x22B', description: 'Mixture of experts model with strong performance.' },
    { value: 'qwen-2.5-72b', label: 'Qwen 2.5 72B', description: 'Alibaba\'s multilingual model (Sep 2024).' },
    { value: 'deepseek-v3', label: 'DeepSeek V3', description: 'Chinese model with strong reasoning (Dec 2024).' },
    { value: 'command-r-plus', label: 'Command R+', description: 'Cohere\'s 104B model optimized for RAG.' },
];

export const IMAGE_MODEL_OPTIONS: { value: string; label: string; description: string }[] = [
    { value: 'dall-e-3-hd', label: 'DALL-E 3 HD', description: 'OpenAI\'s latest with HD quality (1024x1024 or 1792x1024).' },
    { value: 'imagen-3', label: 'Imagen 3', description: 'Google\'s most advanced photorealistic model (Dec 2024).' },
    { value: 'midjourney-v6.1', label: 'Midjourney v6.1', description: 'Latest version with improved coherence (Jul 2024).' },
    { value: 'stable-diffusion-3.5-large', label: 'SD 3.5 Large', description: '8.1B parameters, best quality in SD family (Oct 2024).' },
    { value: 'stable-diffusion-3.5-turbo', label: 'SD 3.5 Turbo', description: 'Fast 4-step generation with high quality.' },
    { value: 'flux-1.1-pro', label: 'FLUX 1.1 Pro', description: 'Black Forest Labs\' ultra mode (Oct 2024).' },
    { value: 'flux-dev', label: 'FLUX Dev', description: 'Open-weight FLUX for developers.' },
    { value: 'ideogram-2.0', label: 'Ideogram 2.0', description: 'Best-in-class text rendering (Aug 2024).' },
    { value: 'playground-v3', label: 'Playground v3', description: 'High-quality graphic design focused (Dec 2024).' },
    { value: 'adobe-firefly-3', label: 'Adobe Firefly 3', description: 'Professional creative AI with Creative Cloud integration.' },
    { value: 'leonardo-phoenix', label: 'Leonardo Phoenix', description: 'Premium model for creative professionals.' },
    { value: 'recraft-v3', label: 'Recraft V3', description: 'Design-focused with vector support (Oct 2024).' },
    { value: 'kolors', label: 'Kolors', description: 'Kwai\'s bilingual text-to-image model.' },
    { value: 'hunyuan-dit', label: 'HunyuanDIT', description: 'Tencent\'s bilingual diffusion model.' },
];

export const VIDEO_MODEL_OPTIONS: { value: string; label: string; description: string }[] = [
    { value: 'sora-turbo', label: 'Sora Turbo', description: 'OpenAI\'s video model, 1080p up to 20s (Dec 2024, limited).' },
    { value: 'veo-2', label: 'Veo 2', description: 'Google\'s latest with 4K resolution & realistic physics (Dec 2024).' },
    { value: 'imagen-video-2', label: 'Imagen Video 2', description: 'Google\'s text-to-video with enhanced quality.' },
    { value: 'dream-machine-1.5', label: 'Dream Machine 1.5', description: 'Luma\'s fast high-quality video generation.' },
    { value: 'runway-gen3-alpha-turbo', label: 'Runway Gen-3 Alpha Turbo', description: 'Latest and fastest Runway model (Oct 2024).' },
    { value: 'pika-2.0', label: 'Pika 2.0', description: 'Advanced cinematic effects and scene editing (Dec 2024).' },
    { value: 'stable-video-2.1', label: 'Stable Video 2.1', description: 'Open-source with improved temporal consistency.' },
    { value: 'haiper-2.0', label: 'Haiper 2.0', description: 'New competitor with realistic motion generation.' },
    { value: 'kling-1.5', label: 'Kling 1.5', description: 'Kuaishou\'s model with 2-minute generation capability.' },
    { value: 'minimax-video-01', label: 'MiniMax Video-01', description: 'Chinese model with 6-second HD generation.' },
    { value: 'cogvideo-x', label: 'CogVideoX', description: 'Open-source model from Tsinghua University.' },
    { value: 'animate-diff-v3', label: 'AnimateDiff v3', description: 'Animation-focused video generation model.' },
    { value: 'morphstudio-1.0', label: 'Morph Studio', description: 'AI filmmaking platform with scene control.' },
    { value: 'genmo-mochi-1', label: 'Genmo Mochi 1', description: 'Open-source with good motion quality.' },
];


export const MEDIA_ART_STYLE_OPTIONS: { value: MediaArtStyle; labelKey: string; descriptionKey: string; icon: string; defaultParams: MediaArtStyleParams }[] = [
    {
        value: MediaArtStyle.DATA_COMPOSITION,
        labelKey: 'dataComposition',
        descriptionKey: 'dataCompositionDesc',
        icon: '📊',
        defaultParams: { dataDensity: 50, glitchIntensity: 20, colorPalette: 'binary' },
    },
    {
        value: MediaArtStyle.DIGITAL_NATURE,
        labelKey: 'digitalNature',
        descriptionKey: 'digitalNatureDesc',
        icon: '🦋',
        defaultParams: { particleSystem: 'flowers', interactivity: 40, bloomEffect: 60 },
    },
    {
        value: MediaArtStyle.AI_DATA_SCULPTURE,
        labelKey: 'aiDataSculpture',
        descriptionKey: 'aiDataSculptureDesc',
        icon: '🌊',
        defaultParams: { fluidity: 70, colorScheme: 'nebula', complexity: 50 },
    },
    {
        value: MediaArtStyle.LIGHT_AND_SPACE,
        labelKey: 'lightAndSpace',
        descriptionKey: 'lightAndSpaceDesc',
        icon: '🔦',
        defaultParams: { pattern: 'grids', speed: 60, color: 'electric_blue' },
    },
    {
        value: MediaArtStyle.KINETIC_MIRRORS,
        labelKey: 'kineticMirrors',
        descriptionKey: 'kineticMirrorsDesc',
        icon: '💎',
        defaultParams: { fragmentation: 40, motionSpeed: 50, reflection: 'prismatic' },
    },
    {
        value: MediaArtStyle.GENERATIVE_BOTANY,
        labelKey: 'generativeBotany',
        descriptionKey: 'generativeBotanyDesc',
        icon: '🌿',
        defaultParams: { growthSpeed: 50, plantType: 'alien_flora', density: 60 },
    },
    {
        value: MediaArtStyle.QUANTUM_PHANTASM,
        labelKey: 'quantumPhantasm',
        descriptionKey: 'quantumPhantasmDesc',
        icon: '✨',
        defaultParams: { particleSize: 30, shimmerSpeed: 70, colorPalette: 'iridescent' },
    },
    {
        value: MediaArtStyle.ARCHITECTURAL_PROJECTION,
        labelKey: 'architecturalProjection',
        descriptionKey: 'architecturalProjectionDesc',
        icon: '🏛️',
        defaultParams: { deconstruction: 60, lightSource: 'volumetric', texture: 'holographic' },
    },
];


export const VISUAL_ART_EFFECT_OPTIONS: { value: VisualArtEffect, labelKey: string, descriptionKey: string }[] = [
    { value: VisualArtEffect.GLITCH, labelKey: 'glitch', descriptionKey: 'glitchDesc' },
    { value: VisualArtEffect.KALEIDOSCOPE, labelKey: 'kaleidoscope', descriptionKey: 'kaleidoscopeDesc' },
    { value: VisualArtEffect.LIQUID_CHROMATIC, labelKey: 'liquidChromatic', descriptionKey: 'liquidChromaticDesc' },
    { value: VisualArtEffect.PIXEL_SORT, labelKey: 'pixelSort', descriptionKey: 'pixelSortDesc' },
    { value: VisualArtEffect.ASCII_STORM, labelKey: 'asciiStorm', descriptionKey: 'asciiStormDesc' },
];


export const FAMOUS_PAINTINGS: FamousPainting[] = [
    { 
        id: 'starry-night', 
        titleKey: 'paintings.starryNight.title', 
        artistKey: 'paintings.starryNight.artist', 
        year: '1889', 
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'
    },
    { 
        id: 'great-wave', 
        titleKey: 'paintings.greatWave.title', 
        artistKey: 'paintings.greatWave.artist', 
        year: 'c. 1831', 
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1280px-Tsunami_by_hokusai_19th_century.jpg'
    },
    { 
        id: 'pearl-earring', 
        titleKey: 'paintings.pearlEarring.title', 
        artistKey: 'paintings.pearlEarring.artist', 
        year: 'c. 1665', 
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/1280px-1665_Girl_with_a_Pearl_Earring.jpg'
    },
    { 
        id: 'mona-lisa', 
        titleKey: 'paintings.monaLisa.title', 
        artistKey: 'paintings.monaLisa.artist', 
        year: 'c. 1503-1506', 
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/1280px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg'
    },
    { 
        id: 'wanderer-sea-fog', 
        titleKey: 'paintings.wandererSeaFog.title', 
        artistKey: 'paintings.wandererSeaFog.artist', 
        year: 'c. 1818', 
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/1280px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg'
    },
    {
        id: 'birth-of-venus',
        titleKey: 'paintings.birthOfVenus.title',
        artistKey: 'paintings.birthOfVenus.artist',
        year: 'c. 1486',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg'
    },
    {
        id: 'the-scream',
        titleKey: 'paintings.theScream.title',
        artistKey: 'paintings.theScream.artist',
        year: '1893',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/1280px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg'
    },
    {
        id: 'american-gothic',
        titleKey: 'paintings.americanGothic.title',
        artistKey: 'paintings.americanGothic.artist',
        year: '1930',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg/1280px-Grant_Wood_-_American_Gothic_-_Google_Art_Project.jpg'
    },
    {
        id: 'the-night-watch',
        titleKey: 'paintings.theNightWatch.title',
        artistKey: 'paintings.theNightWatch.artist',
        year: '1642',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1280px-The_Night_Watch_-_HD.jpg'
    },
    {
        id: 'luncheon-boating-party',
        titleKey: 'paintings.luncheonBoatingParty.title',
        artistKey: 'paintings.luncheonBoatingParty.artist',
        year: '1881',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg/1280px-Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg'
    },
    {
        id: 'persistence-of-memory',
        titleKey: 'paintings.persistenceOfMemory.title',
        artistKey: 'paintings.persistenceOfMemory.artist',
        year: '1931',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg'
    },
    {
        id: 'the-kiss',
        titleKey: 'paintings.theKiss.title',
        artistKey: 'paintings.theKiss.artist',
        year: '1908',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/1280px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg'
    },
    {
        id: 'arnolfini-portrait',
        titleKey: 'paintings.arnolfiniPortrait.title',
        artistKey: 'paintings.arnolfiniPortrait.artist',
        year: '1434',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Van_Eyck_-_Arnolfini_Portrait.jpg/1280px-Van_Eyck_-_Arnolfini_Portrait.jpg'
    },
    {
        id: 'garden-of-earthly-delights',
        titleKey: 'paintings.gardenOfEarthlyDelights.title',
        artistKey: 'paintings.gardenOfEarthlyDelights.artist',
        year: 'c. 1503',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/El_jard%C3%ADn_de_las_Delicias%2C_de_El_Bosco.jpg/1920px-El_jard%C3%ADn_de_las_Delicias%2C_de_El_Bosco.jpg'
    },
    {
        id: 'a-sunday-afternoon',
        titleKey: 'paintings.aSundayAfternoon.title',
        artistKey: 'paintings.aSundayAfternoon.artist',
        year: '1884',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1920px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg'
    },
    {
        id: 'the-fighting-temeraire',
        titleKey: 'paintings.theFightingTemeraire.title',
        artistKey: 'paintings.theFightingTemeraire.artist',
        year: '1839',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/JMW_Turner_-_The_Fighting_Temeraire.jpg/1280px-JMW_Turner_-_The_Fighting_Temeraire.jpg'
    },
    {
        id: 'liberty-leading-the-people',
        titleKey: 'paintings.libertyLeadingThePeople.title',
        artistKey: 'paintings.libertyLeadingThePeople.artist',
        year: '1830',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/1280px-Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg'
    },
    {
        id: 'las-meninas',
        titleKey: 'paintings.lasMeninas.title',
        artistKey: 'paintings.lasMeninas.artist',
        year: '1656',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg/1280px-Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg'
    },
    {
        id: 'the-school-of-athens',
        titleKey: 'paintings.theSchoolOfAthens.title',
        artistKey: 'paintings.theSchoolOfAthens.artist',
        year: '1511',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg'
    },
    {
        id: 'nighthawks',
        titleKey: 'paintings.nighthawks.title',
        artistKey: 'paintings.nighthawks.artist',
        year: '1942',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/1280px-Nighthawks_by_Edward_Hopper_1942.jpg'
    },
    {
        id: 'creation-of-adam',
        titleKey: 'paintings.creationOfAdam.title',
        artistKey: 'paintings.creationOfAdam.artist',
        year: 'c. 1512',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28Sistine_Chapel_ceiling%29.jpg/1280px-Michelangelo_-_Creation_of_Adam_%28Sistine_Chapel_ceiling%29.jpg'
    },
    {
        id: 'whistlers-mother',
        titleKey: 'paintings.whistlersMother.title',
        artistKey: 'paintings.whistlersMother.artist',
        year: '1871',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Whistlers_Mother_high_res.jpg/1280px-Whistlers_Mother_high_res.jpg'
    },
    {
        id: 'impression-sunrise',
        titleKey: 'paintings.impressionSunrise.title',
        artistKey: 'paintings.impressionSunrise.artist',
        year: '1872',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_soleil_levant.jpg/1280px-Monet_-_Impression%2C_soleil_levant.jpg'
    },
    {
        id: 'the-swing',
        titleKey: 'paintings.theSwing.title',
        artistKey: 'paintings.theSwing.artist',
        year: '1767',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Fragonard%2C_The_Swing.jpg/1280px-Fragonard%2C_The_Swing.jpg'
    },
    {
        id: 'saturn-devouring-his-son',
        titleKey: 'paintings.saturnDevouringHisSon.title',
        artistKey: 'paintings.saturnDevouringHisSon.artist',
        year: 'c. 1823',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Francisco_de_Goya%2C_Saturno_devorando_a_su_hijo_%281819-1823%29.jpg/1280px-Francisco_de_Goya%2C_Saturno_devorando_a_su_hijo_%281819-1823%29.jpg'
    },
    {
        id: 'anatomy-lesson',
        titleKey: 'paintings.anatomyLesson.title',
        artistKey: 'paintings.anatomyLesson.artist',
        year: '1632',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Rembrandt_-_The_Anatomy_Lesson_of_Dr_Nicolaes_Tulp.jpg/1280px-Rembrandt_-_The_Anatomy_Lesson_of_Dr_Nicolaes_Tulp.jpg'
    },
    {
        id: 'tower-of-babel',
        titleKey: 'paintings.towerOfBabel.title',
        artistKey: 'paintings.towerOfBabel.artist',
        year: '1563',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project.jpg/1280px-Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project.jpg'
    },
    {
        id: 'sleeping-gypsy',
        titleKey: 'paintings.sleepingGypsy.title',
        artistKey: 'paintings.sleepingGypsy.artist',
        year: '1897',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Henri_Rousseau_016.jpg/1280px-Henri_Rousseau_016.jpg'
    },
    {
        id: 'bacchus',
        titleKey: 'paintings.bacchus.title',
        artistKey: 'paintings.bacchus.artist',
        year: 'c. 1595',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Caravaggio_-_Bacchus.jpg/1280px-Caravaggio_-_Bacchus.jpg'
    },
    {
        id: 'third-of-may',
        titleKey: 'paintings.thirdOfMay.title',
        artistKey: 'paintings.thirdOfMay.artist',
        year: '1814',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/El_tres_de_mayo_de_1808_en_Madrid%2C_por_Francisco_de_Goya.jpg/1280px-El_tres_de_mayo_de_1808_en_Madrid%2C_por_Francisco_de_Goya.jpg'
    }
];
