import { VisualStyleGuide } from '../types/storyboard';

export class StyleGuideManager {
  private styleGuides: Map<string, VisualStyleGuide> = new Map();
  
  private presetStyles = {
    'hollywood-blockbuster': {
      id: 'preset_hollywood',
      name: 'Hollywood Blockbuster',
      description: 'Epic cinematic style with dramatic lighting and sweeping shots',
      cinematography: {
        shotTypes: ['Wide Shot', 'Close-Up', 'Establishing Shot', 'Tracking Shot'],
        cameraAngles: ['Low Angle', 'High Angle', 'Dutch Angle'],
        lighting: 'High contrast, dramatic key lighting, rim lighting',
        colorPalette: ['#1a1a2e', '#16213e', '#e94560', '#f47068'],
        mood: 'Epic and dramatic',
        atmosphere: 'Tense and cinematic'
      },
      artDirection: {
        visualStyle: 'Photorealistic cinematic',
        referenceArtists: ['Roger Deakins', 'Emmanuel Lubezki'],
        referenceMovies: ['Blade Runner 2049', 'Mad Max: Fury Road', 'Inception'],
        period: 'Contemporary',
        location: 'Urban metropolis',
        environment: 'High-tech cityscapes'
      },
      technicalSpecs: {
        aspectRatio: '21:9' as const,
        resolution: '4096x2304' as const,
        quality: 'ultra' as const,
        renderStyle: 'cinematic' as const
      }
    },
    'noir-thriller': {
      id: 'preset_noir',
      name: 'Film Noir',
      description: 'Dark, moody atmosphere with high contrast black and white aesthetics',
      cinematography: {
        shotTypes: ['Close-Up', 'Medium Shot', 'Over-the-Shoulder'],
        cameraAngles: ['Dutch Angle', 'Low Angle'],
        lighting: 'Low key lighting, harsh shadows, venetian blind shadows',
        colorPalette: ['#000000', '#2c2c2c', '#808080', '#ffffff'],
        mood: 'Mysterious and dark',
        atmosphere: 'Smoky and oppressive'
      },
      artDirection: {
        visualStyle: 'High contrast black and white',
        referenceArtists: ['John Alton', 'Nicholas Musuraca'],
        referenceMovies: ['The Third Man', 'Double Indemnity', 'The Maltese Falcon'],
        period: '1940s-1950s',
        location: 'Urban nighttime',
        environment: 'Dark alleys, dimly lit offices'
      },
      technicalSpecs: {
        aspectRatio: '4:3' as const,
        resolution: '2048x1152' as const,
        quality: 'high' as const,
        renderStyle: 'cinematic' as const
      }
    },
    'anime-action': {
      id: 'preset_anime',
      name: 'Anime Action',
      description: 'Dynamic anime style with vibrant colors and expressive characters',
      cinematography: {
        shotTypes: ['Extreme Close-Up', 'Wide Shot', 'POV Shot'],
        cameraAngles: ['Eye Level', 'Birds Eye View', 'Worms Eye View'],
        lighting: 'Cel-shaded lighting, rim light, ambient occlusion',
        colorPalette: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#fddb3a'],
        mood: 'Energetic and dynamic',
        atmosphere: 'Vibrant and stylized'
      },
      artDirection: {
        visualStyle: 'Anime/Manga illustration',
        referenceArtists: ['Makoto Shinkai', 'Hayao Miyazaki', 'Satoshi Kon'],
        referenceMovies: ['Your Name', 'Ghost in the Shell', 'Akira'],
        period: 'Modern/Futuristic',
        location: 'Tokyo cityscape',
        environment: 'Urban Japan, neon lights'
      },
      technicalSpecs: {
        aspectRatio: '16:9' as const,
        resolution: '1920x1080' as const,
        quality: 'high' as const,
        renderStyle: 'animated' as const
      }
    },
    'documentary-realism': {
      id: 'preset_documentary',
      name: 'Documentary Realism',
      description: 'Natural, observational style with authentic lighting',
      cinematography: {
        shotTypes: ['Medium Shot', 'Wide Shot', 'Handheld Shot'],
        cameraAngles: ['Eye Level', 'Over-the-Shoulder'],
        lighting: 'Natural lighting, available light, soft shadows',
        colorPalette: ['#f4f4f4', '#e8e8e8', '#888888', '#333333'],
        mood: 'Authentic and raw',
        atmosphere: 'Realistic and unfiltered'
      },
      artDirection: {
        visualStyle: 'Photojournalistic',
        referenceArtists: ['D.A. Pennebaker', 'Albert Maysles'],
        referenceMovies: ['Man on Wire', 'Free Solo', 'The Act of Killing'],
        period: 'Contemporary',
        location: 'Real world locations',
        environment: 'Natural environments'
      },
      technicalSpecs: {
        aspectRatio: '16:9' as const,
        resolution: '1920x1080' as const,
        quality: 'standard' as const,
        renderStyle: 'photorealistic' as const
      }
    },
    'fantasy-epic': {
      id: 'preset_fantasy',
      name: 'Fantasy Epic',
      description: 'Grand fantasy style with magical lighting and epic landscapes',
      cinematography: {
        shotTypes: ['Extreme Wide Shot', 'Establishing Shot', 'Crane Shot'],
        cameraAngles: ['Low Angle', 'Birds Eye View'],
        lighting: 'Magic hour lighting, volumetric light rays, ethereal glow',
        colorPalette: ['#2d3561', '#c05c7e', '#f3826f', '#ffb961'],
        mood: 'Magical and grand',
        atmosphere: 'Mystical and otherworldly'
      },
      artDirection: {
        visualStyle: 'Fantasy concept art',
        referenceArtists: ['Alan Lee', 'John Howe', 'Ted Nasmith'],
        referenceMovies: ['Lord of the Rings', 'Game of Thrones', 'The Witcher'],
        period: 'Medieval fantasy',
        location: 'Fantasy realms',
        environment: 'Castles, forests, mountains'
      },
      technicalSpecs: {
        aspectRatio: '21:9' as const,
        resolution: '4096x2304' as const,
        quality: 'ultra' as const,
        renderStyle: 'artistic' as const
      }
    },
    'sci-fi-cyberpunk': {
      id: 'preset_scifi',
      name: 'Cyberpunk Sci-Fi',
      description: 'Neon-lit futuristic style with high-tech aesthetics',
      cinematography: {
        shotTypes: ['Medium Shot', 'Close-Up', 'Tracking Shot'],
        cameraAngles: ['Dutch Angle', 'Low Angle'],
        lighting: 'Neon lighting, volumetric fog, lens flares',
        colorPalette: ['#00d9ff', '#ff00ff', '#ffff00', '#000000'],
        mood: 'Futuristic and edgy',
        atmosphere: 'High-tech dystopian'
      },
      artDirection: {
        visualStyle: 'Cyberpunk aesthetic',
        referenceArtists: ['Syd Mead', 'Masamune Shirow'],
        referenceMovies: ['Blade Runner', 'Ghost in the Shell', 'The Matrix'],
        period: 'Near future 2077',
        location: 'Mega city',
        environment: 'Neon streets, holographic ads'
      },
      technicalSpecs: {
        aspectRatio: '21:9' as const,
        resolution: '2048x1152' as const,
        quality: 'high' as const,
        renderStyle: 'cinematic' as const
      }
    }
  };

  createStyleGuide(
    name: string,
    description: string,
    basePreset?: string
  ): VisualStyleGuide {
    const id = this.generateId(name);
    
    let styleGuide: VisualStyleGuide;
    
    if (basePreset && this.presetStyles[basePreset as keyof typeof this.presetStyles]) {
      // Start with preset
      const preset = this.presetStyles[basePreset as keyof typeof this.presetStyles];
      styleGuide = {
        ...preset,
        id,
        name,
        description
      };
    } else {
      // Create from scratch
      styleGuide = {
        id,
        name,
        description,
        cinematography: {
          shotTypes: [],
          cameraAngles: [],
          lighting: '',
          colorPalette: [],
          mood: '',
          atmosphere: ''
        },
        artDirection: {
          visualStyle: '',
          referenceArtists: [],
          referenceMovies: [],
          period: '',
          location: '',
          environment: ''
        },
        technicalSpecs: {
          aspectRatio: '16:9',
          resolution: '1920x1080',
          quality: 'high',
          renderStyle: 'cinematic'
        }
      };
    }
    
    this.styleGuides.set(id, styleGuide);
    return styleGuide;
  }

  updateStyleGuide(
    id: string,
    updates: Partial<VisualStyleGuide>
  ): VisualStyleGuide | null {
    const styleGuide = this.styleGuides.get(id);
    if (!styleGuide) return null;
    
    const updated = {
      ...styleGuide,
      ...updates,
      id: styleGuide.id // Preserve original ID
    };
    
    this.styleGuides.set(id, updated);
    return updated;
  }

  applyColorGrading(
    styleGuide: VisualStyleGuide,
    intensity: number = 1.0
  ): string {
    const colors = styleGuide.cinematography.colorPalette;
    if (!colors.length) return '';
    
    const colorGrading = [
      `color grading with ${colors[0]} shadows`,
      `${colors[1]} midtones`,
      colors[2] ? `${colors[2]} highlights` : '',
      `intensity ${intensity}`
    ].filter(Boolean).join(', ');
    
    return colorGrading;
  }

  generateLightingSetup(styleGuide: VisualStyleGuide): string {
    const lighting = styleGuide.cinematography.lighting;
    const mood = styleGuide.cinematography.mood;
    
    const lightingSetup = [
      lighting,
      mood && `creating ${mood} mood`,
      styleGuide.artDirection.period && `period-appropriate lighting for ${styleGuide.artDirection.period}`
    ].filter(Boolean).join(', ');
    
    return lightingSetup;
  }

  getCameraSetup(
    styleGuide: VisualStyleGuide,
    shotType: string
  ): {
    camera: string;
    lens: string;
    settings: string;
  } {
    const renderStyle = styleGuide.technicalSpecs.renderStyle;
    
    const cameraSetups = {
      cinematic: {
        camera: 'ARRI Alexa LF',
        lens: 'Zeiss Master Prime 50mm',
        settings: 'f/2.8, ISO 800, 1/48 shutter'
      },
      photorealistic: {
        camera: 'Canon R5',
        lens: 'RF 24-70mm f/2.8',
        settings: 'f/4, ISO 400, 1/125 shutter'
      },
      artistic: {
        camera: 'Medium format Hasselblad',
        lens: '80mm f/2.8',
        settings: 'f/5.6, ISO 100, natural light'
      },
      animated: {
        camera: 'Virtual camera',
        lens: 'Animation lens equivalent',
        settings: 'Cel-shaded rendering'
      },
      'concept-art': {
        camera: 'Digital painting',
        lens: 'Artistic perspective',
        settings: 'Matte painting techniques'
      }
    };
    
    return cameraSetups[renderStyle] || cameraSetups.cinematic;
  }

  suggestComplementaryStyles(
    currentStyle: VisualStyleGuide
  ): VisualStyleGuide[] {
    const suggestions: VisualStyleGuide[] = [];
    const currentMood = currentStyle.cinematography.mood.toLowerCase();
    
    // Find styles with complementary moods
    for (const preset of Object.values(this.presetStyles)) {
      const presetMood = preset.cinematography.mood.toLowerCase();
      
      // Skip same style
      if (preset.id === currentStyle.id) continue;
      
      // Check for compatibility
      if (
        (currentMood.includes('dramatic') && presetMood.includes('intense')) ||
        (currentMood.includes('dark') && presetMood.includes('mysterious')) ||
        (currentMood.includes('epic') && presetMood.includes('grand'))
      ) {
        suggestions.push(preset as VisualStyleGuide);
      }
    }
    
    return suggestions.slice(0, 3);
  }

  blendStyles(
    style1: VisualStyleGuide,
    style2: VisualStyleGuide,
    ratio: number = 0.5
  ): VisualStyleGuide {
    const blendedId = `blend_${Date.now()}`;
    
    // Blend color palettes
    const palette1 = style1.cinematography.colorPalette;
    const palette2 = style2.cinematography.colorPalette;
    const blendedPalette = [
      ...palette1.slice(0, Math.floor(palette1.length * ratio)),
      ...palette2.slice(0, Math.floor(palette2.length * (1 - ratio)))
    ];
    
    return {
      id: blendedId,
      name: `${style1.name} × ${style2.name}`,
      description: `Blend of ${style1.name} and ${style2.name}`,
      cinematography: {
        shotTypes: [...new Set([...style1.cinematography.shotTypes, ...style2.cinematography.shotTypes])],
        cameraAngles: [...new Set([...style1.cinematography.cameraAngles, ...style2.cinematography.cameraAngles])],
        lighting: `${style1.cinematography.lighting} mixed with ${style2.cinematography.lighting}`,
        colorPalette: blendedPalette,
        mood: `${style1.cinematography.mood} meets ${style2.cinematography.mood}`,
        atmosphere: `${style1.cinematography.atmosphere} and ${style2.cinematography.atmosphere}`
      },
      artDirection: {
        visualStyle: `${style1.artDirection.visualStyle} with ${style2.artDirection.visualStyle} influences`,
        referenceArtists: [...style1.artDirection.referenceArtists || [], ...style2.artDirection.referenceArtists || []],
        referenceMovies: [...style1.artDirection.referenceMovies || [], ...style2.artDirection.referenceMovies || []],
        period: style1.artDirection.period || style2.artDirection.period,
        location: style1.artDirection.location || style2.artDirection.location,
        environment: style1.artDirection.environment || style2.artDirection.environment
      },
      technicalSpecs: ratio > 0.5 ? style1.technicalSpecs : style2.technicalSpecs
    };
  }

  private generateId(name: string): string {
    return `style_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  }

  getStyleGuide(id: string): VisualStyleGuide | undefined {
    return this.styleGuides.get(id);
  }

  getAllStyleGuides(): VisualStyleGuide[] {
    return Array.from(this.styleGuides.values());
  }

  getPresetStyles(): typeof this.presetStyles {
    return this.presetStyles;
  }

  exportStyleGuide(id: string): string | null {
    const styleGuide = this.styleGuides.get(id);
    if (!styleGuide) return null;
    
    return JSON.stringify(styleGuide, null, 2);
  }

  importStyleGuide(jsonData: string): VisualStyleGuide | null {
    try {
      const styleGuide: VisualStyleGuide = JSON.parse(jsonData);
      this.styleGuides.set(styleGuide.id, styleGuide);
      return styleGuide;
    } catch (error) {
      console.error('Failed to import style guide:', error);
      return null;
    }
  }
}

export const styleGuideManager = new StyleGuideManager();