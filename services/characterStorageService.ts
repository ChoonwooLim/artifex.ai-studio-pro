import { Character, CharacterSet } from '../types';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface CharacterTemplate {
    id: string;
    name: string;
    category: string;
    description: string;
    character: Partial<Character>;
}

interface CharacterDB extends DBSchema {
    characterSets: {
        key: string;
        value: CharacterSet;
        indexes: {
            'by-name': string;
            'by-date': Date;
        };
    };
    characterTemplates: {
        key: string;
        value: CharacterTemplate;
        indexes: {
            'by-category': string;
        };
    };
}

class CharacterStorageService {
    private dbName = 'artifex-character-db';
    private dbVersion = 1;
    private db: IDBPDatabase<CharacterDB> | null = null;
    
    /**
     * Initialize the database
     */
    private async initDB(): Promise<IDBPDatabase<CharacterDB>> {
        if (this.db) return this.db;
        
        this.db = await openDB<CharacterDB>(this.dbName, this.dbVersion, {
            upgrade(db) {
                // Create characterSets store
                if (!db.objectStoreNames.contains('characterSets')) {
                    const characterSetStore = db.createObjectStore('characterSets', {
                        keyPath: 'id'
                    });
                    characterSetStore.createIndex('by-name', 'name');
                    characterSetStore.createIndex('by-date', 'updatedAt');
                }
                
                // Create characterTemplates store
                if (!db.objectStoreNames.contains('characterTemplates')) {
                    const templateStore = db.createObjectStore('characterTemplates', {
                        keyPath: 'id'
                    });
                    templateStore.createIndex('by-category', 'category');
                }
            }
        });
        
        // Initialize with default templates if empty
        await this.initializeDefaultTemplates();
        
        return this.db;
    }
    
    /**
     * Save a character set to the database
     */
    async saveCharacterSet(characterSet: CharacterSet): Promise<void> {
        const db = await this.initDB();
        
        // Ensure proper dates
        const setToSave: CharacterSet = {
            ...characterSet,
            createdAt: characterSet.createdAt || new Date(),
            updatedAt: new Date()
        };
        
        await db.put('characterSets', setToSave);
    }
    
    /**
     * Load all character sets from the database
     */
    async loadCharacterSets(): Promise<CharacterSet[]> {
        const db = await this.initDB();
        const sets = await db.getAll('characterSets');
        
        // Sort by updated date (most recent first)
        return sets.sort((a, b) => {
            const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt);
            const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt);
            return dateB.getTime() - dateA.getTime();
        });
    }
    
    /**
     * Load a specific character set by ID
     */
    async loadCharacterSet(id: string): Promise<CharacterSet | undefined> {
        const db = await this.initDB();
        return await db.get('characterSets', id);
    }
    
    /**
     * Delete a character set from the database
     */
    async deleteCharacterSet(id: string): Promise<void> {
        const db = await this.initDB();
        await db.delete('characterSets', id);
    }
    
    /**
     * Update an existing character set
     */
    async updateCharacterSet(id: string, updates: Partial<CharacterSet>): Promise<void> {
        const db = await this.initDB();
        const existing = await db.get('characterSets', id);
        
        if (!existing) {
            throw new Error(`Character set with id ${id} not found`);
        }
        
        const updated: CharacterSet = {
            ...existing,
            ...updates,
            updatedAt: new Date()
        };
        
        await db.put('characterSets', updated);
    }
    
    /**
     * Search character sets by name
     */
    async searchCharacterSets(query: string): Promise<CharacterSet[]> {
        const db = await this.initDB();
        const allSets = await db.getAll('characterSets');
        
        const lowerQuery = query.toLowerCase();
        return allSets.filter(set => 
            set.name.toLowerCase().includes(lowerQuery) ||
            (set.description && set.description.toLowerCase().includes(lowerQuery)) ||
            set.characters.some(char => char.name.toLowerCase().includes(lowerQuery))
        );
    }
    
    /**
     * Get character templates
     */
    async getCharacterTemplates(): Promise<CharacterTemplate[]> {
        const db = await this.initDB();
        return await db.getAll('characterTemplates');
    }
    
    /**
     * Get templates by category
     */
    async getTemplatesByCategory(category: string): Promise<CharacterTemplate[]> {
        const db = await this.initDB();
        const index = db.transaction('characterTemplates').store.index('by-category');
        return await index.getAll(category);
    }
    
    /**
     * Save a character as a template
     */
    async saveAsTemplate(character: Character, templateName: string, category: string): Promise<void> {
        const db = await this.initDB();
        
        const template: CharacterTemplate = {
            id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: templateName,
            category: category,
            description: `Template based on ${character.name}`,
            character: {
                role: character.role,
                physicalDescription: character.physicalDescription,
                clothingDescription: character.clothingDescription,
                personalityTraits: character.personalityTraits,
                identityMarkers: character.identityMarkers
            }
        };
        
        await db.put('characterTemplates', template);
    }
    
    /**
     * Delete a character template
     */
    async deleteTemplate(id: string): Promise<void> {
        const db = await this.initDB();
        await db.delete('characterTemplates', id);
    }
    
    /**
     * Export character sets as JSON
     */
    async exportCharacterSets(): Promise<string> {
        const sets = await this.loadCharacterSets();
        return JSON.stringify(sets, null, 2);
    }
    
    /**
     * Import character sets from JSON
     */
    async importCharacterSets(jsonString: string): Promise<number> {
        try {
            const imported = JSON.parse(jsonString);
            const sets = Array.isArray(imported) ? imported : [imported];
            
            let count = 0;
            for (const set of sets) {
                if (this.isValidCharacterSet(set)) {
                    // Generate new ID to avoid conflicts
                    const newSet: CharacterSet = {
                        ...set,
                        id: `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        createdAt: new Date(set.createdAt || Date.now()),
                        updatedAt: new Date()
                    };
                    await this.saveCharacterSet(newSet);
                    count++;
                }
            }
            
            return count;
        } catch (error) {
            console.error('Failed to import character sets:', error);
            throw new Error('Invalid JSON format');
        }
    }
    
    /**
     * Validate character set structure
     */
    private isValidCharacterSet(obj: any): obj is CharacterSet {
        return (
            obj &&
            typeof obj === 'object' &&
            typeof obj.name === 'string' &&
            Array.isArray(obj.characters) &&
            obj.characters.every((char: any) => this.isValidCharacter(char))
        );
    }
    
    /**
     * Validate character structure
     */
    private isValidCharacter(obj: any): obj is Character {
        return (
            obj &&
            typeof obj === 'object' &&
            typeof obj.name === 'string' &&
            typeof obj.physicalDescription === 'string' &&
            typeof obj.clothingDescription === 'string' &&
            ['protagonist', 'supporting', 'extra'].includes(obj.role)
        );
    }
    
    /**
     * Initialize default character templates
     */
    private async initializeDefaultTemplates(): Promise<void> {
        const db = await this.initDB();
        const existingTemplates = await db.getAll('characterTemplates');
        
        if (existingTemplates.length > 0) {
            return; // Templates already exist
        }
        
        const defaultTemplates: CharacterTemplate[] = [
            // Business Templates
            {
                id: 'template_business_ceo',
                name: 'CEO/경영진',
                category: 'Business',
                description: '기업 경영진 캐릭터',
                character: {
                    role: 'protagonist',
                    physicalDescription: '40대 중반, 단정한 헤어스타일, 자신감 있는 표정, 날카로운 눈빛',
                    clothingDescription: '고급 네이비 정장, 흰색 드레스 셔츠, 실크 넥타이, 고급 시계',
                    personalityTraits: '카리스마, 결단력, 리더십'
                }
            },
            {
                id: 'template_business_employee',
                name: '직장인',
                category: 'Business',
                description: '일반 회사원 캐릭터',
                character: {
                    role: 'supporting',
                    physicalDescription: '30대 초반, 깔끔한 단발머리, 친근한 미소',
                    clothingDescription: '회색 정장, 파란색 셔츠, 검은색 구두',
                    personalityTraits: '성실, 협조적, 적극적'
                }
            },
            
            // Fantasy Templates
            {
                id: 'template_fantasy_warrior',
                name: '전사',
                category: 'Fantasy',
                description: '판타지 전사 캐릭터',
                character: {
                    role: 'protagonist',
                    physicalDescription: '키가 크고 근육질 체격, 긴 갈색 머리, 흉터가 있는 얼굴',
                    clothingDescription: '가죽 갑옷, 철제 어깨 보호대, 검집이 달린 벨트, 부츠',
                    personalityTraits: '용감, 명예로움, 충성심',
                    identityMarkers: ['왼쪽 눈썹의 흉터', '오른팔의 문신']
                }
            },
            {
                id: 'template_fantasy_mage',
                name: '마법사',
                category: 'Fantasy',
                description: '판타지 마법사 캐릭터',
                character: {
                    role: 'supporting',
                    physicalDescription: '노년의 현자, 긴 흰 수염, 지혜로운 눈빛',
                    clothingDescription: '보라색 로브, 뾰족한 모자, 마법 지팡이',
                    personalityTraits: '지혜로움, 신비로움, 침착함'
                }
            },
            
            // Modern/Casual Templates
            {
                id: 'template_modern_student',
                name: '학생',
                category: 'Modern',
                description: '현대 학생 캐릭터',
                character: {
                    role: 'protagonist',
                    physicalDescription: '10대 후반, 짧은 검은 머리, 밝은 표정',
                    clothingDescription: '교복 또는 캐주얼한 후드티와 청바지',
                    personalityTraits: '활발, 호기심, 열정적'
                }
            },
            {
                id: 'template_modern_parent',
                name: '부모님',
                category: 'Modern',
                description: '현대 부모 캐릭터',
                character: {
                    role: 'supporting',
                    physicalDescription: '40대, 따뜻한 미소, 친근한 인상',
                    clothingDescription: '캐주얼한 셔츠와 슬랙스 또는 블라우스와 스커트',
                    personalityTraits: '자애로움, 이해심, 보호적'
                }
            },
            
            // SciFi Templates
            {
                id: 'template_scifi_pilot',
                name: '우주 파일럿',
                category: 'SciFi',
                description: 'SF 우주선 파일럿',
                character: {
                    role: 'protagonist',
                    physicalDescription: '운동선수 같은 체격, 짧은 머리, 날카로운 눈매',
                    clothingDescription: '우주복, 헬멧, 각종 장비가 달린 벨트',
                    personalityTraits: '대담, 빠른 판단력, 모험심',
                    identityMarkers: ['어깨의 부대 마크', '헬멧의 콜사인']
                }
            },
            {
                id: 'template_scifi_scientist',
                name: '과학자',
                category: 'SciFi',
                description: 'SF 연구원/과학자',
                character: {
                    role: 'supporting',
                    physicalDescription: '30대, 안경 착용, 지적인 인상',
                    clothingDescription: '흰색 연구복, 보호 고글, 태블릿 PC',
                    personalityTraits: '분석적, 호기심, 논리적'
                }
            }
        ];
        
        // Save all default templates
        for (const template of defaultTemplates) {
            await db.put('characterTemplates', template);
        }
    }
    
    /**
     * Clear all character data (for debugging/reset)
     */
    async clearAllData(): Promise<void> {
        const db = await this.initDB();
        
        // Clear character sets
        const sets = await db.getAll('characterSets');
        for (const set of sets) {
            await db.delete('characterSets', set.id);
        }
        
        // Clear templates (but will be re-initialized on next access)
        const templates = await db.getAll('characterTemplates');
        for (const template of templates) {
            await db.delete('characterTemplates', template.id);
        }
    }
}

export default new CharacterStorageService();