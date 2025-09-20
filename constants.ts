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
    // Google Models (Sep 2025)
    { value: 'gemini-2.5-flash', label: '🔷 Gemini 2.5 Flash', description: 'Stable thinking model for fast, high-volume tasks (Released June 2025).' },
    { value: 'gemini-2.5-pro', label: '🔷 Gemini 2.5 Pro', description: 'Most advanced Gemini with adaptive thinking (Released 2025).' },
    { value: 'gemini-2.5-flash-lite', label: '🔷 Gemini 2.5 Flash-Lite', description: 'Cost-efficient, fastest 2.5 model (Preview).' },
    { value: 'gemini-2.0-flash', label: '🔷 Gemini 2.0 Flash', description: 'Superior speed with 1M token context window.' },
    
    // OpenAI Models (Sep 2025)
    { value: 'gpt-5', label: '🟢 GPT-5', description: 'Latest flagship - Best for coding (74.9% SWE-bench), math, and reasoning.' },
    { value: 'gpt-5-mini', label: '🟢 GPT-5 Mini', description: 'Balanced performance GPT-5 variant.' },
    { value: 'gpt-5-nano', label: '🟢 GPT-5 Nano', description: 'Most efficient GPT-5 for simple tasks.' },
    { value: 'gpt-4.1', label: '🟢 GPT-4.1', description: 'Released 2025 - 1M context, superior coding and instruction following.' },
    { value: 'gpt-4.1-mini', label: '🟢 GPT-4.1 Mini', description: 'Efficient GPT-4.1 variant.' },
    { value: 'o4-mini', label: '🟢 o4-mini', description: 'Fast reasoning model, best on AIME 2024/2025.' },
    { value: 'gpt-realtime', label: '🟢 GPT-Realtime', description: 'Speech-to-speech model for voice interactions.' },
    
    // Anthropic Models (Sep 2025)  
    { value: 'claude-opus-4-1-20250805', label: '🔴 Claude Opus 4.1', description: 'Aug 5, 2025 - Best coding (72.5% SWE-bench), long tasks.' },
    { value: 'claude-sonnet-4', label: '🔴 Claude Sonnet 4', description: 'May 22, 2025 - Fast with 1M context (beta), hybrid reasoning.' },
];

export const IMAGE_MODEL_OPTIONS: { value: string; label: string; description: string }[] = [
    // Google Models (Sep 2025)
    { value: 'imagen-4', label: '🔷 Imagen 4', description: 'Latest image model with 2K resolution, remarkable clarity.' },
    { value: 'gemini-2.5-flash-image', label: '🔷 Gemini 2.5 Flash Image', description: 'Nano-banana - Multi-image blending, character consistency.' },
    
    // OpenAI Models
    { value: 'dall-e-3', label: '🟢 DALL·E 3', description: 'OpenAI\'s latest image generation with text rendering.' },
    { value: 'dall-e-3-hd', label: '🟢 DALL·E 3 HD', description: 'High-quality version of DALL·E 3.' },
    { value: 'dall-e-2', label: '🟢 DALL·E 2', description: 'Previous generation, faster and cheaper.' },
    
    // Stable Diffusion Models (via Replicate)
    { value: 'stable-diffusion-xl', label: '🟡 Stable Diffusion XL', description: 'Open-source, highly customizable.' },
    { value: 'sdxl-turbo', label: '🟡 SDXL Turbo', description: 'Ultra-fast variant of SDXL.' },
    { value: 'flux-1.1-pro', label: '🟡 Flux 1.1 Pro', description: 'Next-gen AI art model by Black Forest Labs.' },
    
    // Midjourney Style Models (via Replicate)
    { value: 'midjourney-v6', label: '🟣 Midjourney v6', description: 'Artistic and stylized image generation.' },
    { value: 'realvis-xl', label: '🟣 RealVis XL', description: 'Photorealistic image generation.' },
];

export const VIDEO_MODEL_OPTIONS: { value: string; label: string; description: string }[] = [
    // Google Models (Sep 2025)
    { value: 'veo-3', label: '🔷 Veo 3', description: 'Sep 2025 - Native audio generation, lip sync, 4K video.' },
    { value: 'veo-2', label: '🔷 Veo 2', description: 'Dec 2024 - 4K video, enhanced physics simulation.' },
    
    // OpenAI Models
    { value: 'sora-turbo', label: '🟢 Sora Turbo', description: 'OpenAI\'s video generation (ChatGPT Plus/Pro only).' },
    
    // Local Models
    { value: 'wan2.2-local', label: '🖥️ Wan2.2 (Local)', description: 'Offline video generation, requires GPU (RTX 4090).' },
    
    // Other Video Models (via Replicate)
    { value: 'runway-gen3', label: '🟠 Runway Gen-3 Alpha', description: 'Professional video generation.' },
    { value: 'pika-2.2', label: '🟠 Pika 2.2', description: '1080p, 10-second video generation.' },
    { value: 'luma-ray2', label: '🟠 Luma Ray 2', description: 'Realistic motion and physics.' },
    { value: 'stable-video', label: '🟡 Stable Video Diffusion', description: 'Open-source video generation.' },
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
