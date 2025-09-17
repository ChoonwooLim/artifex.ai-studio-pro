import { 
  CharacterReference, 
  VisualStyleGuide, 
  StoryboardPanel,
  PromptEnhancement,
  ImageGenerationSettings,
  LIGHTING_STYLES,
  COMPOSITION_RULES
} from '../types/storyboard';

export class ProfessionalPromptEngineer {
  private cinematicModifiers = {
    photorealistic: [
      'photorealistic',
      'hyperrealistic',
      '8K resolution',
      'highly detailed',
      'sharp focus',
      'professional photography',
      'shot on ARRI Alexa',
      'Zeiss Master Prime lenses'
    ],
    cinematic: [
      'cinematic',
      'film still',
      'movie scene',
      '35mm film',
      'anamorphic lens',
      'depth of field',
      'bokeh',
      'color graded',
      'film grain'
    ],
    artistic: [
      'artistic',
      'stylized',
      'painterly',
      'concept art',
      'digital painting',
      'matte painting',
      'artistic interpretation'
    ],
    animated: [
      'animated',
      'animation style',
      'cartoon',
      'stylized characters',
      'expressive',
      'dynamic poses'
    ]
  };

  private qualityModifiers = {
    ultra: [
      'masterpiece',
      'best quality',
      'ultra-detailed',
      'extremely detailed',
      'professional',
      'award-winning',
      '8K UHD',
      'RAW photo'
    ],
    high: [
      'high quality',
      'highly detailed',
      'professional',
      '4K',
      'sharp',
      'clear'
    ],
    standard: [
      'good quality',
      'detailed',
      'clear',
      'HD'
    ]
  };

  private negativePromptDefaults = [
    'low quality',
    'blurry',
    'pixelated',
    'amateur',
    'distorted',
    'deformed',
    'ugly',
    'bad anatomy',
    'bad proportions',
    'extra limbs',
    'missing limbs',
    'floating limbs',
    'mutated',
    'mutation',
    'bad hands',
    'bad fingers',
    'extra fingers',
    'missing fingers',
    'watermark',
    'signature',
    'text',
    'logo',
    'cropped',
    'worst quality',
    'jpeg artifacts',
    'duplicate',
    'morbid',
    'mutilated',
    'poorly drawn face',
    'bad face',
    'fused face',
    'cloned face',
    'worst face',
    '3d render',
    'cartoon',
    'anime',
    'sketches',
    'worst quality',
    'low quality',
    'normal quality'
  ];

  generateEnhancedPrompt(
    panel: StoryboardPanel,
    characters: CharacterReference[],
    styleGuide: VisualStyleGuide,
    enhancement: PromptEnhancement,
    settings: ImageGenerationSettings
  ): { prompt: string; negativePrompt: string; seed?: number } {
    let promptParts: string[] = [];
    let seed = settings.seed;

    // 1. Base Description
    promptParts.push(panel.visualPrompt);

    // 2. Character Consistency
    if (enhancement.useCharacterReference && panel.characterIds) {
      const panelCharacters = characters.filter(c => 
        panel.characterIds?.includes(c.id)
      );
      
      panelCharacters.forEach(character => {
        promptParts.push(character.consistencyPrompt);
        
        if (character.characterTraits) {
          const traits = Object.entries(character.characterTraits)
            .filter(([_, value]) => value)
            .map(([_, value]) => value)
            .join(', ');
          if (traits) promptParts.push(traits);
        }
        
        // Use character seed for consistency
        if (character.seed && !seed) {
          seed = character.seed;
        }
      });
    }

    // 3. Shot Composition
    if (panel.shotType) {
      promptParts.push(panel.shotType.toLowerCase());
    }
    
    if (panel.cameraAngle) {
      promptParts.push(`${panel.cameraAngle} angle`);
    }
    
    if (panel.cameraMovement && panel.cameraMovement !== 'Static') {
      promptParts.push(`${panel.cameraMovement} motion blur`);
    }

    // 4. Visual Style Guide
    if (enhancement.useStyleGuide && styleGuide) {
      // Art Direction
      if (styleGuide.artDirection.visualStyle) {
        promptParts.push(styleGuide.artDirection.visualStyle);
      }
      
      if (styleGuide.artDirection.referenceArtists?.length) {
        promptParts.push(`in the style of ${styleGuide.artDirection.referenceArtists.join(' and ')}`);
      }
      
      if (styleGuide.artDirection.period) {
        promptParts.push(styleGuide.artDirection.period);
      }
      
      if (styleGuide.artDirection.location) {
        promptParts.push(styleGuide.artDirection.location);
      }
    }

    // 5. Cinematography
    if (enhancement.addCinematography && styleGuide) {
      const cinematography = styleGuide.cinematography;
      
      if (cinematography.lighting) {
        promptParts.push(cinematography.lighting);
      }
      
      if (cinematography.mood) {
        promptParts.push(`${cinematography.mood} mood`);
      }
      
      if (cinematography.atmosphere) {
        promptParts.push(`${cinematography.atmosphere} atmosphere`);
      }
      
      if (cinematography.colorPalette?.length) {
        promptParts.push(`color palette: ${cinematography.colorPalette.join(', ')}`);
      }
    }

    // 6. Lighting
    if (enhancement.addLighting) {
      const lighting = this.selectLighting(panel, styleGuide);
      if (lighting) {
        promptParts.push(lighting);
      }
    }

    // 7. Composition
    if (enhancement.addComposition) {
      const composition = this.selectComposition(panel);
      if (composition) {
        promptParts.push(composition);
      }
    }

    // 8. Technical Quality
    if (enhancement.addTechnicalDetails) {
      const renderStyle = styleGuide?.technicalSpecs.renderStyle || 'cinematic';
      const quality = styleGuide?.technicalSpecs.quality || 'high';
      
      promptParts.push(...this.cinematicModifiers[renderStyle] || []);
      promptParts.push(...this.qualityModifiers[quality] || []);
    }

    // 9. Custom Modifiers
    if (enhancement.customModifiers?.length) {
      promptParts.push(...enhancement.customModifiers);
    }

    // 10. Aspect Ratio and Technical Specs
    const aspectRatio = styleGuide?.technicalSpecs.aspectRatio || '16:9';
    promptParts.push(`aspect ratio ${aspectRatio}`);

    // Build final prompt
    const enhancedPrompt = this.optimizePrompt(promptParts);
    
    // Generate negative prompt
    const negativePrompt = this.generateNegativePrompt(
      settings.negativePrompt,
      styleGuide?.technicalSpecs.renderStyle
    );

    return {
      prompt: enhancedPrompt,
      negativePrompt,
      seed
    };
  }

  private selectLighting(panel: StoryboardPanel, styleGuide?: VisualStyleGuide): string {
    // Analyze scene description for time of day and mood
    const description = panel.description.toLowerCase();
    
    if (description.includes('night') || description.includes('dark')) {
      return 'low key lighting, moonlight, dramatic shadows';
    }
    
    if (description.includes('morning') || description.includes('sunrise')) {
      return 'golden hour, warm light, soft shadows';
    }
    
    if (description.includes('sunset') || description.includes('evening')) {
      return 'golden hour, warm sunset light, long shadows';
    }
    
    if (description.includes('dramatic') || description.includes('tense')) {
      return 'chiaroscuro lighting, high contrast, dramatic shadows';
    }
    
    if (styleGuide?.cinematography.lighting) {
      return styleGuide.cinematography.lighting;
    }
    
    return 'natural lighting, soft light';
  }

  private selectComposition(panel: StoryboardPanel): string {
    const shotType = panel.shotType?.toLowerCase() || '';
    
    if (shotType.includes('close-up')) {
      return 'centered composition, shallow depth of field, bokeh background';
    }
    
    if (shotType.includes('wide') || shotType.includes('establishing')) {
      return 'rule of thirds, depth layers, leading lines';
    }
    
    if (shotType.includes('over-the-shoulder')) {
      return 'foreground element, depth of field, frame within frame';
    }
    
    if (shotType.includes('two-shot')) {
      return 'balanced composition, negative space, eye line match';
    }
    
    return 'rule of thirds, balanced composition';
  }

  private optimizePrompt(parts: string[]): string {
    // Remove duplicates and empty strings
    const uniqueParts = [...new Set(parts.filter(p => p && p.trim()))];
    
    // Reorganize for better generation
    const priorityTerms = uniqueParts.filter(p => 
      p.includes('photorealistic') || 
      p.includes('cinematic') || 
      p.includes('masterpiece')
    );
    
    const characterTerms = uniqueParts.filter(p => 
      p.includes('character') || 
      p.includes('person') || 
      p.includes('face')
    );
    
    const settingTerms = uniqueParts.filter(p => 
      p.includes('location') || 
      p.includes('environment') || 
      p.includes('background')
    );
    
    const technicalTerms = uniqueParts.filter(p => 
      p.includes('shot') || 
      p.includes('angle') || 
      p.includes('lighting') ||
      p.includes('quality') ||
      p.includes('resolution')
    );
    
    const otherTerms = uniqueParts.filter(p => 
      !priorityTerms.includes(p) && 
      !characterTerms.includes(p) && 
      !settingTerms.includes(p) && 
      !technicalTerms.includes(p)
    );
    
    // Combine in optimal order
    const optimized = [
      ...priorityTerms,
      ...characterTerms,
      ...settingTerms,
      ...otherTerms,
      ...technicalTerms
    ];
    
    return optimized.join(', ');
  }

  private generateNegativePrompt(
    customNegative?: string,
    renderStyle?: string
  ): string {
    let negativeTerms = [...this.negativePromptDefaults];
    
    // Add style-specific negative prompts
    if (renderStyle === 'photorealistic') {
      negativeTerms = negativeTerms.filter(term => 
        !term.includes('3d render') && 
        !term.includes('cartoon') && 
        !term.includes('anime')
      );
    } else if (renderStyle === 'animated') {
      negativeTerms = negativeTerms.filter(term => 
        !term.includes('photorealistic') && 
        !term.includes('photo')
      );
      negativeTerms.push('realistic', 'photo', 'photograph');
    }
    
    // Add custom negative prompts
    if (customNegative) {
      negativeTerms.push(...customNegative.split(',').map(t => t.trim()));
    }
    
    // Remove duplicates
    return [...new Set(negativeTerms)].join(', ');
  }

  generateBatchVariations(
    basePrompt: string,
    count: number = 4,
    variationType: 'angle' | 'lighting' | 'mood' | 'style' = 'angle'
  ): string[] {
    const variations: string[] = [];
    
    switch (variationType) {
      case 'angle':
        const angles = ['eye level', 'low angle', 'high angle', 'dutch angle'];
        for (let i = 0; i < Math.min(count, angles.length); i++) {
          variations.push(`${basePrompt}, ${angles[i]} shot`);
        }
        break;
        
      case 'lighting':
        const lighting = ['golden hour', 'blue hour', 'high key lighting', 'low key lighting'];
        for (let i = 0; i < Math.min(count, lighting.length); i++) {
          variations.push(`${basePrompt}, ${lighting[i]}`);
        }
        break;
        
      case 'mood':
        const moods = ['dramatic', 'peaceful', 'intense', 'mysterious'];
        for (let i = 0; i < Math.min(count, moods.length); i++) {
          variations.push(`${basePrompt}, ${moods[i]} mood`);
        }
        break;
        
      case 'style':
        const styles = ['cinematic', 'artistic', 'documentary', 'noir'];
        for (let i = 0; i < Math.min(count, styles.length); i++) {
          variations.push(`${basePrompt}, ${styles[i]} style`);
        }
        break;
    }
    
    return variations;
  }

  analyzePromptQuality(prompt: string): {
    score: number;
    strengths: string[];
    improvements: string[];
  } {
    const strengths: string[] = [];
    const improvements: string[] = [];
    let score = 50; // Base score
    
    // Check for essential elements
    if (prompt.includes('shot') || prompt.includes('angle')) {
      strengths.push('Includes camera information');
      score += 10;
    } else {
      improvements.push('Add shot type or camera angle');
    }
    
    if (prompt.includes('lighting')) {
      strengths.push('Specifies lighting');
      score += 10;
    } else {
      improvements.push('Specify lighting conditions');
    }
    
    if (prompt.includes('mood') || prompt.includes('atmosphere')) {
      strengths.push('Defines mood/atmosphere');
      score += 10;
    } else {
      improvements.push('Add mood or atmosphere descriptors');
    }
    
    if (prompt.length > 50 && prompt.length < 500) {
      strengths.push('Good prompt length');
      score += 10;
    } else if (prompt.length < 50) {
      improvements.push('Add more detail to the prompt');
      score -= 10;
    } else {
      improvements.push('Consider simplifying - prompt may be too long');
      score -= 5;
    }
    
    if (prompt.includes('quality') || prompt.includes('detailed')) {
      strengths.push('Includes quality modifiers');
      score += 10;
    } else {
      improvements.push('Add quality descriptors');
    }
    
    return {
      score: Math.min(100, Math.max(0, score)),
      strengths,
      improvements
    };
  }
}

export const promptEngineer = new ProfessionalPromptEngineer();