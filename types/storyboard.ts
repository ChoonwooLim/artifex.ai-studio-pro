export interface CharacterReference {
  id: string;
  name: string;
  description: string;
  visualDescription: string;
  referenceImages?: string[];
  characterTraits: {
    age?: string;
    gender?: string;
    ethnicity?: string;
    bodyType?: string;
    hairStyle?: string;
    hairColor?: string;
    eyeColor?: string;
    clothingStyle?: string;
    distinctiveFeatures?: string[];
  };
  consistencyPrompt: string;
  seed?: number;
}

export interface VisualStyleGuide {
  id: string;
  name: string;
  description: string;
  cinematography: {
    shotTypes: string[];
    cameraAngles: string[];
    lighting: string;
    colorPalette: string[];
    mood: string;
    atmosphere: string;
  };
  artDirection: {
    visualStyle: string;
    referenceArtists?: string[];
    referenceMovies?: string[];
    period?: string;
    location?: string;
    environment?: string;
  };
  technicalSpecs: {
    aspectRatio: '16:9' | '21:9' | '4:3' | '1:1' | '9:16';
    resolution: '1024x576' | '1920x1080' | '2048x1152' | '4096x2304';
    quality: 'draft' | 'standard' | 'high' | 'ultra';
    renderStyle: 'photorealistic' | 'cinematic' | 'artistic' | 'animated' | 'concept-art';
  };
}

export interface ImageGenerationSettings {
  model: string;
  quality: 'standard' | 'hd';
  style: 'vivid' | 'natural';
  size: '1024x1024' | '1024x1792' | '1792x1024';
  seed?: number;
  steps?: number;
  guidanceScale?: number;
  negativePrompt?: string;
  samplerMethod?: string;
  upscale?: boolean;
  enhanceDetails?: boolean;
  batchSize?: number;
}

export interface PromptEnhancement {
  useCharacterReference: boolean;
  useStyleGuide: boolean;
  addCinematography: boolean;
  addLighting: boolean;
  addComposition: boolean;
  addAtmosphere: boolean;
  addTechnicalDetails: boolean;
  customModifiers?: string[];
}

export interface StoryboardPanel {
  id: string;
  sceneNumber: number;
  panelNumber: number;
  shotType: string;
  cameraAngle: string;
  cameraMovement?: string;
  duration?: number;
  description: string;
  dialogue?: string;
  soundEffects?: string[];
  music?: string;
  visualPrompt: string;
  enhancedPrompt?: string;
  characterIds?: string[];
  styleGuideId?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  metadata?: {
    seed?: number;
    model?: string;
    timestamp?: string;
    version?: number;
  };
  annotations?: {
    directorNotes?: string;
    technicalNotes?: string;
    vfxNotes?: string;
  };
}

export interface StoryboardProject {
  id: string;
  title: string;
  description: string;
  genre: string[];
  targetAudience: string;
  duration: string;
  characters: CharacterReference[];
  styleGuide: VisualStyleGuide;
  panels: StoryboardPanel[];
  settings: ImageGenerationSettings;
  enhancement: PromptEnhancement;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    status: 'draft' | 'in-progress' | 'review' | 'approved' | 'final';
    creator: string;
    collaborators?: string[];
  };
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: 'shot' | 'lighting' | 'composition' | 'style' | 'mood';
  template: string;
  variables: string[];
  examples?: string[];
  tags?: string[];
}

export interface QualityPreset {
  id: string;
  name: string;
  description: string;
  settings: Partial<ImageGenerationSettings>;
  use_cases: string[];
}

export const SHOT_TYPES = [
  'Extreme Wide Shot (EWS)',
  'Wide Shot (WS)',
  'Medium Wide Shot (MWS)',
  'Medium Shot (MS)',
  'Medium Close-Up (MCU)',
  'Close-Up (CU)',
  'Extreme Close-Up (ECU)',
  'Over-the-Shoulder (OTS)',
  'Point of View (POV)',
  'Two-Shot',
  'Establishing Shot',
  'Master Shot',
  'Insert Shot',
  'Cutaway Shot'
] as const;

export const CAMERA_ANGLES = [
  'Eye Level',
  'High Angle',
  'Low Angle',
  'Dutch Angle',
  'Birds Eye View',
  'Worms Eye View',
  'Over-the-Shoulder',
  'Profile Shot',
  'Three-Quarter View'
] as const;

export const CAMERA_MOVEMENTS = [
  'Static',
  'Pan Left',
  'Pan Right',
  'Tilt Up',
  'Tilt Down',
  'Dolly In',
  'Dolly Out',
  'Tracking Shot',
  'Crane Shot',
  'Handheld',
  'Steadicam',
  'Zoom In',
  'Zoom Out',
  'Rack Focus'
] as const;

export const LIGHTING_STYLES = [
  'Natural Light',
  'Golden Hour',
  'Blue Hour',
  'High Key',
  'Low Key',
  'Rembrandt Lighting',
  'Split Lighting',
  'Broad Lighting',
  'Short Lighting',
  'Butterfly Lighting',
  'Loop Lighting',
  'Rim Lighting',
  'Backlight',
  'Silhouette',
  'Chiaroscuro',
  'Film Noir',
  'Neon',
  'Candlelight',
  'Moonlight',
  'Studio Lighting'
] as const;

export const COMPOSITION_RULES = [
  'Rule of Thirds',
  'Golden Ratio',
  'Leading Lines',
  'Symmetry',
  'Frame within Frame',
  'Depth Layers',
  'Negative Space',
  'Fill the Frame',
  'Patterns and Repetition',
  'Breaking the Pattern',
  'Triangular Composition',
  'Diagonal Lines',
  'S-Curve',
  'Radial Composition'
] as const;