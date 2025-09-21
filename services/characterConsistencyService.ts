import { Character, CharacterSet, StoryboardPanel } from '../types';

interface ConsistencyReport {
    isConsistent: boolean;
    issues: string[];
    suggestions: string[];
}

interface CharacterMention {
    characterId: string;
    characterName: string;
    startIndex: number;
    endIndex: number;
}

class CharacterConsistencyService {
    /**
     * Generate a consistency prompt for a character that ensures visual consistency
     * across multiple image generations
     */
    generateConsistencyPrompt(character: Character): string {
        const parts: string[] = [];
        
        // Character name and role
        parts.push(`[${character.name.toUpperCase()}]`);
        
        // Role-based importance
        if (character.role === 'protagonist') {
            parts.push('(MAIN CHARACTER - MUST BE CONSISTENT)');
        } else if (character.role === 'supporting') {
            parts.push('(SUPPORTING CHARACTER)');
        }
        
        // Physical description with emphasis on key features
        parts.push(`EXACT APPEARANCE: ${character.physicalDescription}`);
        
        // Clothing as a consistency anchor
        if (character.clothingDescription) {
            parts.push(`ALWAYS WEARING: ${character.clothingDescription}`);
        }
        
        // Identity markers for unique identification
        if (character.identityMarkers && character.identityMarkers.length > 0) {
            parts.push(`UNIQUE IDENTIFIERS: ${character.identityMarkers.join(', ')}`);
        }
        
        // Personality traits that might affect posture/expression
        if (character.personalityTraits) {
            parts.push(`PERSONALITY/EXPRESSION: ${character.personalityTraits}`);
        }
        
        // Add consistency enforcement
        parts.push('CRITICAL: Maintain EXACT same appearance in every scene');
        
        return parts.join(' | ');
    }
    
    /**
     * Inject character details into a scene description to ensure consistency
     */
    injectCharacterDetails(
        sceneDescription: string,
        characters: Character[]
    ): string {
        if (!characters || characters.length === 0) {
            return sceneDescription;
        }
        
        // Find character mentions in the scene
        const mentions = this.detectCharacterMentions(sceneDescription, characters);
        
        // Build the enhanced prompt
        const enhancedParts: string[] = [];
        
        // Add the original scene description
        enhancedParts.push('SCENE DESCRIPTION:');
        enhancedParts.push(sceneDescription);
        enhancedParts.push('');
        
        // Add character consistency requirements
        if (mentions.length > 0) {
            enhancedParts.push('CHARACTER CONSISTENCY REQUIREMENTS:');
            enhancedParts.push('The following characters MUST appear EXACTLY as defined:');
            enhancedParts.push('');
            
            const mentionedCharacters = new Set(mentions.map(m => m.characterId));
            
            characters
                .filter(char => mentionedCharacters.has(char.id))
                .forEach(character => {
                    enhancedParts.push(this.formatCharacterForPrompt(character));
                    enhancedParts.push('');
                });
            
            enhancedParts.push('CRITICAL INSTRUCTION: Each character must maintain their EXACT appearance as described above. NO variations in physical features, clothing, or identifying markers.');
        }
        
        return enhancedParts.join('\n');
    }
    
    /**
     * Generate a reference image prompt for a character
     */
    async generateReferenceImagePrompt(
        character: Character,
        style: string
    ): string {
        const prompts: string[] = [];
        
        // Style specification
        prompts.push(`${style} style portrait`);
        
        // Character details
        prompts.push(`Full body shot of ${character.name}`);
        prompts.push(character.physicalDescription);
        
        if (character.clothingDescription) {
            prompts.push(character.clothingDescription);
        }
        
        if (character.personalityTraits) {
            prompts.push(`Expression showing: ${character.personalityTraits}`);
        }
        
        // Technical requirements for consistency
        prompts.push('centered composition');
        prompts.push('neutral background');
        prompts.push('good lighting');
        prompts.push('high detail');
        prompts.push('character reference sheet style');
        
        return prompts.join(', ');
    }
    
    /**
     * Detect and replace character mentions in text with enhanced descriptions
     */
    detectAndReplaceCharacterMentions(
        text: string,
        characters: Character[]
    ): string {
        let enhancedText = text;
        
        // Sort characters by name length (longest first) to avoid partial replacements
        const sortedCharacters = [...characters].sort(
            (a, b) => b.name.length - a.name.length
        );
        
        sortedCharacters.forEach(character => {
            // Create regex patterns for character name variations
            const patterns = this.createNamePatterns(character.name);
            
            patterns.forEach(pattern => {
                const regex = new RegExp(pattern, 'gi');
                enhancedText = enhancedText.replace(regex, (match) => {
                    return `${match} (${this.getShortDescription(character)})`;
                });
            });
        });
        
        return enhancedText;
    }
    
    /**
     * Validate character consistency across scenes
     */
    validateCharacterConsistency(
        scenes: StoryboardPanel[],
        characters: Character[]
    ): ConsistencyReport {
        const report: ConsistencyReport = {
            isConsistent: true,
            issues: [],
            suggestions: []
        };
        
        // Check if characters are defined
        if (!characters || characters.length === 0) {
            report.issues.push('No characters defined for consistency checking');
            report.suggestions.push('Define characters before generating storyboard');
            report.isConsistent = false;
            return report;
        }
        
        // Check each scene for character mentions
        scenes.forEach((scene, index) => {
            const mentions = this.detectCharacterMentions(scene.description, characters);
            
            if (mentions.length === 0 && index === 0) {
                report.issues.push(`Scene ${index + 1}: No characters detected in opening scene`);
                report.suggestions.push('Ensure main characters are introduced in the first scene');
            }
            
            // Check for protagonist presence
            const hasProtagonist = mentions.some(m => {
                const char = characters.find(c => c.id === m.characterId);
                return char?.role === 'protagonist';
            });
            
            if (!hasProtagonist && characters.some(c => c.role === 'protagonist')) {
                if (index < 3) { // Check first few scenes
                    report.issues.push(`Scene ${index + 1}: Protagonist not mentioned`);
                }
            }
        });
        
        // Check character definitions
        characters.forEach(character => {
            if (!character.physicalDescription) {
                report.issues.push(`${character.name}: Missing physical description`);
                report.suggestions.push(`Add physical description for ${character.name}`);
                report.isConsistent = false;
            }
            
            if (!character.clothingDescription) {
                report.issues.push(`${character.name}: Missing clothing description`);
                report.suggestions.push(`Add clothing description for ${character.name}`);
            }
        });
        
        report.isConsistent = report.issues.length === 0;
        
        return report;
    }
    
    /**
     * Create a character consistency reference sheet prompt
     */
    createCharacterReferenceSheet(characters: Character[]): string {
        const lines: string[] = [
            'CHARACTER REFERENCE SHEET',
            '========================',
            ''
        ];
        
        // Group characters by role
        const protagonists = characters.filter(c => c.role === 'protagonist');
        const supporting = characters.filter(c => c.role === 'supporting');
        const extras = characters.filter(c => c.role === 'extra');
        
        if (protagonists.length > 0) {
            lines.push('MAIN CHARACTERS:');
            protagonists.forEach(char => {
                lines.push(this.formatCharacterForReferenceSheet(char));
                lines.push('');
            });
        }
        
        if (supporting.length > 0) {
            lines.push('SUPPORTING CHARACTERS:');
            supporting.forEach(char => {
                lines.push(this.formatCharacterForReferenceSheet(char));
                lines.push('');
            });
        }
        
        if (extras.length > 0) {
            lines.push('BACKGROUND CHARACTERS:');
            extras.forEach(char => {
                lines.push(this.formatCharacterForReferenceSheet(char));
                lines.push('');
            });
        }
        
        return lines.join('\n');
    }
    
    /**
     * Format a character for inclusion in a prompt
     */
    private formatCharacterForPrompt(character: Character): string {
        const lines: string[] = [];
        
        lines.push(`${character.name.toUpperCase()}:`);
        lines.push(`- Physical: ${character.physicalDescription}`);
        
        if (character.clothingDescription) {
            lines.push(`- Clothing: ${character.clothingDescription}`);
        }
        
        if (character.identityMarkers && character.identityMarkers.length > 0) {
            lines.push(`- Unique markers: ${character.identityMarkers.join(', ')}`);
        }
        
        if (character.personalityTraits) {
            lines.push(`- Expression/Demeanor: ${character.personalityTraits}`);
        }
        
        return lines.join('\n');
    }
    
    /**
     * Format a character for a reference sheet
     */
    private formatCharacterForReferenceSheet(character: Character): string {
        const lines: string[] = [];
        
        lines.push(`■ ${character.name}`);
        lines.push(`  Role: ${this.getRoleLabel(character.role)}`);
        lines.push(`  Appearance: ${character.physicalDescription}`);
        
        if (character.clothingDescription) {
            lines.push(`  Attire: ${character.clothingDescription}`);
        }
        
        if (character.identityMarkers && character.identityMarkers.length > 0) {
            lines.push(`  Distinguishing features: ${character.identityMarkers.join(', ')}`);
        }
        
        return lines.join('\n');
    }
    
    /**
     * Get a short description of a character for inline mentions
     */
    private getShortDescription(character: Character): string {
        const parts: string[] = [];
        
        // Extract key physical features
        const ageMatch = character.physicalDescription.match(/(\d+)대|(\d+)s|(\d+) years?/i);
        const hairMatch = character.physicalDescription.match(/([\w\s]+)(?:머리|hair)/i);
        
        if (ageMatch) {
            parts.push(ageMatch[0]);
        }
        
        if (hairMatch) {
            parts.push(hairMatch[0]);
        }
        
        // Add first identity marker if exists
        if (character.identityMarkers && character.identityMarkers[0]) {
            parts.push(character.identityMarkers[0]);
        }
        
        return parts.length > 0 ? parts.join(', ') : character.physicalDescription.substring(0, 50);
    }
    
    /**
     * Detect character mentions in text
     */
    private detectCharacterMentions(
        text: string,
        characters: Character[]
    ): CharacterMention[] {
        const mentions: CharacterMention[] = [];
        
        characters.forEach(character => {
            const patterns = this.createNamePatterns(character.name);
            
            patterns.forEach(pattern => {
                const regex = new RegExp(pattern, 'gi');
                let match;
                
                while ((match = regex.exec(text)) !== null) {
                    mentions.push({
                        characterId: character.id,
                        characterName: character.name,
                        startIndex: match.index,
                        endIndex: match.index + match[0].length
                    });
                }
            });
        });
        
        // Sort by position and remove duplicates
        return mentions
            .sort((a, b) => a.startIndex - b.startIndex)
            .filter((mention, index, array) => {
                // Remove overlapping mentions
                if (index === 0) return true;
                return mention.startIndex >= array[index - 1].endIndex;
            });
    }
    
    /**
     * Create name patterns for matching
     */
    private createNamePatterns(name: string): string[] {
        const patterns: string[] = [name];
        
        // Add common variations
        const parts = name.split(' ');
        if (parts.length > 1) {
            // First name only
            patterns.push(parts[0]);
            // Last name only (for Western names)
            if (parts.length === 2) {
                patterns.push(parts[1]);
            }
        }
        
        // Korean name variations
        if (/[가-힣]/.test(name)) {
            // Add -씨 honorific
            patterns.push(`${name}씨`);
            // Add -님 honorific
            patterns.push(`${name}님`);
        }
        
        return patterns;
    }
    
    /**
     * Get role label in Korean
     */
    private getRoleLabel(role: Character['role']): string {
        switch (role) {
            case 'protagonist':
                return '주인공';
            case 'supporting':
                return '조연';
            case 'extra':
                return '엑스트라';
            default:
                return role;
        }
    }
    
    /**
     * Build character consistency instructions for AI models
     */
    buildConsistencyInstructions(characters: Character[]): string {
        if (!characters || characters.length === 0) {
            return '';
        }
        
        const instructions: string[] = [
            '=== CHARACTER CONSISTENCY INSTRUCTIONS ===',
            'CRITICAL: The following characters MUST maintain their EXACT appearance throughout ALL scenes:',
            ''
        ];
        
        // Add each character's consistency requirements
        characters.forEach(character => {
            instructions.push(`[${character.name}]`);
            instructions.push(`ALWAYS appears as: ${character.physicalDescription}`);
            if (character.clothingDescription) {
                instructions.push(`ALWAYS wearing: ${character.clothingDescription}`);
            }
            if (character.identityMarkers && character.identityMarkers.length > 0) {
                instructions.push(`ALWAYS has: ${character.identityMarkers.join(', ')}`);
            }
            instructions.push('---');
        });
        
        instructions.push('ENFORCEMENT: Each character MUST look IDENTICAL in every scene. NO variations allowed.');
        instructions.push('=== END CHARACTER CONSISTENCY ===');
        
        return instructions.join('\n');
    }
}

export default new CharacterConsistencyService();