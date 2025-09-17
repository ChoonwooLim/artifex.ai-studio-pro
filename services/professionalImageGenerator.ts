import { 
  ImageGenerationSettings, 
  StoryboardPanel,
  CharacterReference,
  VisualStyleGuide,
  PromptEnhancement
} from '../types/storyboard';
import { promptEngineer } from './promptEngineering';
import { characterManager } from './characterConsistency';

export interface GenerationResult {
  id: string;
  prompt: string;
  enhancedPrompt: string;
  negativePrompt: string;
  imageUrl: string;
  thumbnailUrl?: string;
  seed?: number;
  model: string;
  settings: ImageGenerationSettings;
  metadata: {
    timestamp: string;
    duration: number;
    quality: number;
    consistency: number;
  };
}

export interface BatchGenerationOptions {
  panels: StoryboardPanel[];
  variations: number;
  parallel: boolean;
  qualityCheck: boolean;
  autoRetry: boolean;
  maxRetries: number;
}

export class ProfessionalImageGenerator {
  private apiKeys: Map<string, string> = new Map();
  private modelConfigs = {
    'dall-e-3': {
      maxSize: '1792x1024',
      supportsSeed: false,
      supportsNegativePrompt: false,
      maxPromptLength: 4000,
      batchSize: 1
    },
    'stable-diffusion-xl': {
      maxSize: '1024x1024',
      supportsSeed: true,
      supportsNegativePrompt: true,
      maxPromptLength: 380,
      batchSize: 4
    },
    'midjourney': {
      maxSize: '2048x2048',
      supportsSeed: true,
      supportsNegativePrompt: true,
      maxPromptLength: 6000,
      batchSize: 4
    },
    'leonardo-ai': {
      maxSize: '1024x1024',
      supportsSeed: true,
      supportsNegativePrompt: true,
      maxPromptLength: 1000,
      batchSize: 4
    }
  };

  private qualityPresets = {
    draft: {
      steps: 20,
      guidanceScale: 7,
      size: '512x512' as const,
      quality: 'standard' as const
    },
    standard: {
      steps: 30,
      guidanceScale: 7.5,
      size: '1024x1024' as const,
      quality: 'standard' as const
    },
    high: {
      steps: 50,
      guidanceScale: 8,
      size: '1024x1024' as const,
      quality: 'hd' as const
    },
    ultra: {
      steps: 100,
      guidanceScale: 8.5,
      size: '1792x1024' as const,
      quality: 'hd' as const
    }
  };

  setApiKey(service: string, key: string): void {
    this.apiKeys.set(service, key);
  }

  async generateImage(
    panel: StoryboardPanel,
    characters: CharacterReference[],
    styleGuide: VisualStyleGuide,
    enhancement: PromptEnhancement,
    settings: ImageGenerationSettings
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    
    // Generate enhanced prompt
    const { prompt, negativePrompt, seed } = promptEngineer.generateEnhancedPrompt(
      panel,
      characters,
      styleGuide,
      enhancement,
      settings
    );
    
    // Validate and optimize prompt for model
    const optimizedPrompt = this.optimizeForModel(prompt, settings.model);
    
    // Apply quality preset
    const finalSettings = this.applyQualityPreset(settings);
    
    try {
      // Generate image based on model
      const result = await this.callImageAPI(
        settings.model,
        optimizedPrompt,
        negativePrompt,
        finalSettings,
        seed
      );
      
      // Post-process if needed
      let processedUrl = result.imageUrl;
      if (settings.upscale) {
        processedUrl = await this.upscaleImage(result.imageUrl);
      }
      
      if (settings.enhanceDetails) {
        processedUrl = await this.enhanceImageDetails(processedUrl);
      }
      
      // Analyze quality
      const quality = await this.analyzeImageQuality(processedUrl);
      const consistency = this.checkCharacterConsistency(processedUrl, characters);
      
      return {
        id: this.generateId(),
        prompt: panel.visualPrompt,
        enhancedPrompt: optimizedPrompt,
        negativePrompt,
        imageUrl: processedUrl,
        thumbnailUrl: await this.generateThumbnail(processedUrl),
        seed,
        model: settings.model,
        settings: finalSettings,
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          quality,
          consistency
        }
      };
    } catch (error) {
      console.error('Image generation failed:', error);
      throw error;
    }
  }

  async generateBatch(
    options: BatchGenerationOptions
  ): Promise<GenerationResult[]> {
    const results: GenerationResult[] = [];
    const chunks = this.chunkPanels(options.panels, options.parallel ? 4 : 1);
    
    for (const chunk of chunks) {
      const promises = chunk.map(panel => 
        this.generateWithRetry(panel, options)
      );
      
      const chunkResults = await Promise.all(promises);
      results.push(...chunkResults.filter(r => r !== null) as GenerationResult[]);
    }
    
    // Quality check and filter
    if (options.qualityCheck) {
      return this.filterByQuality(results);
    }
    
    return results;
  }

  private async generateWithRetry(
    panel: StoryboardPanel,
    options: BatchGenerationOptions
  ): Promise<GenerationResult | null> {
    let retries = 0;
    
    while (retries < options.maxRetries) {
      try {
        // This is simplified - in reality you'd pass all required params
        const result = await this.generateImage(
          panel,
          [], // characters would come from context
          {} as VisualStyleGuide, // styleGuide from context
          {} as PromptEnhancement, // enhancement from context
          {} as ImageGenerationSettings // settings from context
        );
        
        if (!options.qualityCheck || result.metadata.quality > 70) {
          return result;
        }
        
        retries++;
      } catch (error) {
        retries++;
        if (retries >= options.maxRetries) {
          console.error(`Failed after ${retries} retries:`, error);
          return null;
        }
        await this.delay(1000 * retries); // Exponential backoff
      }
    }
    
    return null;
  }

  private optimizeForModel(prompt: string, model: string): string {
    const config = this.modelConfigs[model as keyof typeof this.modelConfigs];
    if (!config) return prompt;
    
    // Truncate if too long
    if (prompt.length > config.maxPromptLength) {
      prompt = prompt.substring(0, config.maxPromptLength - 3) + '...';
    }
    
    // Model-specific optimizations
    switch (model) {
      case 'dall-e-3':
        // DALL-E 3 prefers natural language
        prompt = prompt.replace(/\[.*?\]/g, ''); // Remove brackets
        prompt = prompt.replace(/\(.*?\)/g, ''); // Remove parentheses
        break;
        
      case 'stable-diffusion-xl':
        // SD prefers weighted terms
        prompt = this.addWeights(prompt);
        break;
        
      case 'midjourney':
        // MJ specific parameters
        prompt = `${prompt} --ar 16:9 --v 6 --style raw`;
        break;
    }
    
    return prompt;
  }

  private addWeights(prompt: string): string {
    // Add emphasis to important terms
    const importantTerms = ['character', 'face', 'cinematic', 'high quality'];
    
    importantTerms.forEach(term => {
      if (prompt.includes(term)) {
        prompt = prompt.replace(term, `(${term}:1.2)`);
      }
    });
    
    return prompt;
  }

  private applyQualityPreset(settings: ImageGenerationSettings): ImageGenerationSettings {
    const quality = settings.quality || 'standard';
    const preset = this.qualityPresets[quality];
    
    return {
      ...settings,
      ...preset,
      steps: settings.steps || preset.steps,
      guidanceScale: settings.guidanceScale || preset.guidanceScale
    };
  }

  private async callImageAPI(
    model: string,
    prompt: string,
    negativePrompt: string,
    settings: ImageGenerationSettings,
    seed?: number
  ): Promise<{ imageUrl: string }> {
    // This would be replaced with actual API calls
    // For now, returning a placeholder
    
    switch (model) {
      case 'dall-e-3':
        return this.callDallE3(prompt, settings);
      case 'stable-diffusion-xl':
        return this.callStableDiffusion(prompt, negativePrompt, settings, seed);
      case 'midjourney':
        return this.callMidjourney(prompt, negativePrompt, settings, seed);
      case 'leonardo-ai':
        return this.callLeonardoAI(prompt, negativePrompt, settings, seed);
      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  }

  private async callDallE3(
    prompt: string,
    settings: ImageGenerationSettings
  ): Promise<{ imageUrl: string }> {
    // Placeholder for DALL-E 3 API call
    console.log('Calling DALL-E 3 with:', { prompt, settings });
    
    // In production, this would make actual API call
    return {
      imageUrl: `https://placeholder.com/dalle3/${Date.now()}.jpg`
    };
  }

  private async callStableDiffusion(
    prompt: string,
    negativePrompt: string,
    settings: ImageGenerationSettings,
    seed?: number
  ): Promise<{ imageUrl: string }> {
    // Placeholder for Stable Diffusion API call
    console.log('Calling Stable Diffusion with:', { prompt, negativePrompt, settings, seed });
    
    return {
      imageUrl: `https://placeholder.com/sd/${Date.now()}.jpg`
    };
  }

  private async callMidjourney(
    prompt: string,
    negativePrompt: string,
    settings: ImageGenerationSettings,
    seed?: number
  ): Promise<{ imageUrl: string }> {
    // Placeholder for Midjourney API call
    console.log('Calling Midjourney with:', { prompt, negativePrompt, settings, seed });
    
    return {
      imageUrl: `https://placeholder.com/mj/${Date.now()}.jpg`
    };
  }

  private async callLeonardoAI(
    prompt: string,
    negativePrompt: string,
    settings: ImageGenerationSettings,
    seed?: number
  ): Promise<{ imageUrl: string }> {
    // Placeholder for Leonardo AI API call
    console.log('Calling Leonardo AI with:', { prompt, negativePrompt, settings, seed });
    
    return {
      imageUrl: `https://placeholder.com/leonardo/${Date.now()}.jpg`
    };
  }

  private async upscaleImage(imageUrl: string): Promise<string> {
    // Placeholder for upscaling service
    console.log('Upscaling image:', imageUrl);
    return imageUrl + '?upscaled=true';
  }

  private async enhanceImageDetails(imageUrl: string): Promise<string> {
    // Placeholder for enhancement service
    console.log('Enhancing image details:', imageUrl);
    return imageUrl + '&enhanced=true';
  }

  private async analyzeImageQuality(imageUrl: string): Promise<number> {
    // Placeholder for quality analysis
    // In production, this could use CV models to assess:
    // - Sharpness
    // - Composition
    // - Lighting
    // - Color balance
    // - Artifacts
    
    return Math.random() * 30 + 70; // Random score between 70-100
  }

  private checkCharacterConsistency(
    imageUrl: string,
    characters: CharacterReference[]
  ): number {
    // Placeholder for consistency check
    // In production, this could use:
    // - Face recognition
    // - Feature matching
    // - Style consistency analysis
    
    return Math.random() * 20 + 80; // Random score between 80-100
  }

  private async generateThumbnail(imageUrl: string): Promise<string> {
    // Placeholder for thumbnail generation
    return imageUrl + '?thumbnail=true';
  }

  private filterByQuality(
    results: GenerationResult[],
    threshold: number = 75
  ): GenerationResult[] {
    return results.filter(r => r.metadata.quality >= threshold);
  }

  private chunkPanels(
    panels: StoryboardPanel[],
    chunkSize: number
  ): StoryboardPanel[][] {
    const chunks: StoryboardPanel[][] = [];
    
    for (let i = 0; i < panels.length; i += chunkSize) {
      chunks.push(panels.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testConnection(model: string): Promise<boolean> {
    try {
      const testPrompt = 'A simple test image';
      const result = await this.callImageAPI(
        model,
        testPrompt,
        '',
        this.qualityPresets.draft,
        undefined
      );
      return !!result.imageUrl;
    } catch (error) {
      console.error(`Connection test failed for ${model}:`, error);
      return false;
    }
  }

  getAvailableModels(): string[] {
    return Object.keys(this.modelConfigs);
  }

  getModelCapabilities(model: string) {
    return this.modelConfigs[model as keyof typeof this.modelConfigs];
  }
}

export const imageGenerator = new ProfessionalImageGenerator();