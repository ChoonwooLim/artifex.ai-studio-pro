import { CharacterReference } from '../types/storyboard';

export class CharacterConsistencyManager {
  private characterCache: Map<string, CharacterReference> = new Map();
  private seedGenerator: number = 42;

  createCharacterReference(
    name: string,
    description: string,
    traits?: Partial<CharacterReference['characterTraits']>
  ): CharacterReference {
    const id = this.generateId(name);
    const seed = this.generateSeed();
    
    const character: CharacterReference = {
      id,
      name,
      description,
      visualDescription: this.generateVisualDescription(description, traits),
      characterTraits: {
        ...traits
      },
      consistencyPrompt: this.generateConsistencyPrompt(name, description, traits),
      seed
    };
    
    this.characterCache.set(id, character);
    return character;
  }

  private generateVisualDescription(
    description: string,
    traits?: Partial<CharacterReference['characterTraits']>
  ): string {
    const parts: string[] = [];
    
    if (traits?.age) parts.push(`${traits.age} years old`);
    if (traits?.gender) parts.push(traits.gender);
    if (traits?.ethnicity) parts.push(traits.ethnicity);
    if (traits?.bodyType) parts.push(`${traits.bodyType} build`);
    
    if (traits?.hairStyle && traits?.hairColor) {
      parts.push(`${traits.hairStyle} ${traits.hairColor} hair`);
    } else if (traits?.hairStyle) {
      parts.push(`${traits.hairStyle} hair`);
    } else if (traits?.hairColor) {
      parts.push(`${traits.hairColor} hair`);
    }
    
    if (traits?.eyeColor) parts.push(`${traits.eyeColor} eyes`);
    if (traits?.clothingStyle) parts.push(`wearing ${traits.clothingStyle}`);
    
    if (traits?.distinctiveFeatures?.length) {
      parts.push(...traits.distinctiveFeatures);
    }
    
    return parts.join(', ');
  }

  private generateConsistencyPrompt(
    name: string,
    description: string,
    traits?: Partial<CharacterReference['characterTraits']>
  ): string {
    const consistencyParts: string[] = [];
    
    // Core identity marker
    consistencyParts.push(`[CHARACTER:${name.toUpperCase()}]`);
    
    // Physical consistency markers
    if (traits?.gender) consistencyParts.push(`${traits.gender} person`);
    if (traits?.age) consistencyParts.push(`${traits.age} years old`);
    if (traits?.ethnicity) consistencyParts.push(traits.ethnicity);
    
    // Facial features for consistency
    if (traits?.eyeColor) consistencyParts.push(`distinctive ${traits.eyeColor} eyes`);
    
    // Hair is crucial for consistency
    if (traits?.hairStyle && traits?.hairColor) {
      consistencyParts.push(`always with ${traits.hairStyle} ${traits.hairColor} hair`);
    }
    
    // Body type
    if (traits?.bodyType) consistencyParts.push(`${traits.bodyType} physique`);
    
    // Distinctive features are key for recognition
    if (traits?.distinctiveFeatures?.length) {
      consistencyParts.push(`featuring ${traits.distinctiveFeatures.join(' and ')}`);
    }
    
    // Add consistency enforcement
    consistencyParts.push('(same person)');
    consistencyParts.push('(consistent appearance)');
    consistencyParts.push('(recognizable features)');
    
    return consistencyParts.join(', ');
  }

  updateCharacterAppearance(
    characterId: string,
    updates: Partial<CharacterReference['characterTraits']>
  ): CharacterReference | null {
    const character = this.characterCache.get(characterId);
    if (!character) return null;
    
    character.characterTraits = {
      ...character.characterTraits,
      ...updates
    };
    
    character.visualDescription = this.generateVisualDescription(
      character.description,
      character.characterTraits
    );
    
    character.consistencyPrompt = this.generateConsistencyPrompt(
      character.name,
      character.description,
      character.characterTraits
    );
    
    this.characterCache.set(characterId, character);
    return character;
  }

  addReferenceImage(characterId: string, imageUrl: string): void {
    const character = this.characterCache.get(characterId);
    if (!character) return;
    
    if (!character.referenceImages) {
      character.referenceImages = [];
    }
    
    character.referenceImages.push(imageUrl);
    this.characterCache.set(characterId, character);
  }

  getCharacterPromptForScene(
    characterId: string,
    sceneContext?: {
      emotion?: string;
      action?: string;
      clothing?: string;
      props?: string[];
    }
  ): string {
    const character = this.characterCache.get(characterId);
    if (!character) return '';
    
    const promptParts: string[] = [character.consistencyPrompt];
    
    if (sceneContext?.emotion) {
      promptParts.push(`${sceneContext.emotion} expression`);
    }
    
    if (sceneContext?.action) {
      promptParts.push(sceneContext.action);
    }
    
    if (sceneContext?.clothing) {
      promptParts.push(`wearing ${sceneContext.clothing}`);
    } else if (character.characterTraits.clothingStyle) {
      promptParts.push(`wearing ${character.characterTraits.clothingStyle}`);
    }
    
    if (sceneContext?.props?.length) {
      promptParts.push(`with ${sceneContext.props.join(' and ')}`);
    }
    
    return promptParts.join(', ');
  }

  generateCharacterSheet(character: CharacterReference): string {
    const views = [
      'front view',
      'side profile',
      'three-quarter view',
      'back view'
    ];
    
    const expressions = [
      'neutral expression',
      'smiling',
      'serious',
      'surprised'
    ];
    
    const basePrompt = `character reference sheet, ${character.consistencyPrompt}`;
    const sheetPrompt = `${basePrompt}, multiple views, ${views.join(', ')}, ${expressions.join(', ')}, white background, character design sheet, model sheet, turnaround, consistent character`;
    
    return sheetPrompt;
  }

  ensureConsistencyAcrossPanels(
    characterId: string,
    panelCount: number
  ): { seed: number; controlPrompt: string }[] {
    const character = this.characterCache.get(characterId);
    if (!character) return [];
    
    const baseSeed = character.seed || this.generateSeed();
    const results: { seed: number; controlPrompt: string }[] = [];
    
    for (let i = 0; i < panelCount; i++) {
      // Use same seed with slight variations for consistency
      const panelSeed = baseSeed + (i * 10);
      
      results.push({
        seed: panelSeed,
        controlPrompt: character.consistencyPrompt
      });
    }
    
    return results;
  }

  private generateId(name: string): string {
    return `char_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  }

  private generateSeed(): number {
    // Generate deterministic seeds for consistency
    this.seedGenerator = (this.seedGenerator * 1664525 + 1013904223) % 2147483647;
    return this.seedGenerator;
  }

  getCharacter(id: string): CharacterReference | undefined {
    return this.characterCache.get(id);
  }

  getAllCharacters(): CharacterReference[] {
    return Array.from(this.characterCache.values());
  }

  clearCache(): void {
    this.characterCache.clear();
  }

  exportCharacterData(): string {
    const characters = this.getAllCharacters();
    return JSON.stringify(characters, null, 2);
  }

  importCharacterData(jsonData: string): void {
    try {
      const characters: CharacterReference[] = JSON.parse(jsonData);
      characters.forEach(char => {
        this.characterCache.set(char.id, char);
      });
    } catch (error) {
      console.error('Failed to import character data:', error);
    }
  }
}

export const characterManager = new CharacterConsistencyManager();