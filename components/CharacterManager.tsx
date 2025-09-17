import React, { useState } from 'react';
import { CharacterReference } from '../services/professionalImageService';
import { v4 as uuidv4 } from 'uuid';

interface CharacterManagerProps {
    characters: CharacterReference[];
    onCharactersUpdate: (characters: CharacterReference[]) => void;
}

const CharacterManager: React.FC<CharacterManagerProps> = ({ characters, onCharactersUpdate }) => {
    const [isAddingCharacter, setIsAddingCharacter] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState<CharacterReference | null>(null);

    const initialCharacter: CharacterReference = {
        id: '',
        name: '',
        description: '',
        visualDetails: {
            age: '',
            gender: '',
            ethnicity: '',
            hairColor: '',
            hairStyle: '',
            eyeColor: '',
            height: '',
            build: '',
            clothing: '',
            distinctiveFeatures: [],
            personality: '',
            occupation: ''
        },
        seedNumber: Math.floor(Math.random() * 1000000),
        styleConsistencyPrompt: ''
    };

    const [newCharacter, setNewCharacter] = useState<CharacterReference>(initialCharacter);
    const [distinctiveFeature, setDistinctiveFeature] = useState('');

    const handleAddCharacter = () => {
        const character = {
            ...newCharacter,
            id: uuidv4()
        };
        onCharactersUpdate([...characters, character]);
        setNewCharacter(initialCharacter);
        setIsAddingCharacter(false);
    };

    const handleDeleteCharacter = (id: string) => {
        onCharactersUpdate(characters.filter(c => c.id !== id));
    };

    const handleUpdateCharacter = (character: CharacterReference) => {
        onCharactersUpdate(characters.map(c => c.id === character.id ? character : c));
        setEditingCharacter(null);
    };

    const addDistinctiveFeature = () => {
        if (distinctiveFeature.trim()) {
            const features = [...(newCharacter.visualDetails.distinctiveFeatures || []), distinctiveFeature];
            setNewCharacter({
                ...newCharacter,
                visualDetails: {
                    ...newCharacter.visualDetails,
                    distinctiveFeatures: features
                }
            });
            setDistinctiveFeature('');
        }
    };

    return (
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">Character Registry</h3>
                <button
                    onClick={() => setIsAddingCharacter(!isAddingCharacter)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                    {isAddingCharacter ? 'Cancel' : '+ Add Character'}
                </button>
            </div>

            {/* Character List */}
            <div className="space-y-4 mb-6">
                {characters.map((character) => (
                    <div key={character.id} className="bg-slate-800 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-white font-medium text-lg">{character.name}</h4>
                                <p className="text-slate-400 text-sm mt-1">{character.description}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {character.visualDetails.age && (
                                        <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                            {character.visualDetails.age}y
                                        </span>
                                    )}
                                    {character.visualDetails.gender && (
                                        <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                            {character.visualDetails.gender}
                                        </span>
                                    )}
                                    {character.visualDetails.hairColor && (
                                        <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                            {character.visualDetails.hairColor} hair
                                        </span>
                                    )}
                                    {character.visualDetails.eyeColor && (
                                        <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                            {character.visualDetails.eyeColor} eyes
                                        </span>
                                    )}
                                    <span className="px-2 py-1 bg-purple-700 text-purple-200 rounded text-xs">
                                        Seed: {character.seedNumber}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingCharacter(character)}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteCharacter(character.id)}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {characters.length === 0 && (
                    <p className="text-slate-500 text-center py-8">No characters registered yet</p>
                )}
            </div>

            {/* Add/Edit Character Form */}
            {isAddingCharacter && (
                <div className="bg-slate-800 p-6 rounded-lg space-y-4">
                    <h4 className="text-white font-medium mb-4">Add New Character</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Character Name*</label>
                            <input
                                type="text"
                                value={newCharacter.name}
                                onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                                placeholder="e.g., John Smith"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Occupation</label>
                            <input
                                type="text"
                                value={newCharacter.visualDetails.occupation || ''}
                                onChange={(e) => setNewCharacter({
                                    ...newCharacter, 
                                    visualDetails: {...newCharacter.visualDetails, occupation: e.target.value}
                                })}
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                                placeholder="e.g., Detective"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Character Description</label>
                        <textarea
                            value={newCharacter.description}
                            onChange={(e) => setNewCharacter({...newCharacter, description: e.target.value})}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                            rows={2}
                            placeholder="Brief description of the character's role in the story"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Age</label>
                            <input
                                type="text"
                                value={newCharacter.visualDetails.age || ''}
                                onChange={(e) => setNewCharacter({
                                    ...newCharacter,
                                    visualDetails: {...newCharacter.visualDetails, age: e.target.value}
                                })}
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                                placeholder="e.g., 35"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Gender</label>
                            <select
                                value={newCharacter.visualDetails.gender || ''}
                                onChange={(e) => setNewCharacter({
                                    ...newCharacter,
                                    visualDetails: {...newCharacter.visualDetails, gender: e.target.value}
                                })}
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                            >
                                <option value="">Select...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="non-binary">Non-binary</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Ethnicity</label>
                            <input
                                type="text"
                                value={newCharacter.visualDetails.ethnicity || ''}
                                onChange={(e) => setNewCharacter({
                                    ...newCharacter,
                                    visualDetails: {...newCharacter.visualDetails, ethnicity: e.target.value}
                                })}
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                                placeholder="e.g., Caucasian"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Hair Color</label>
                            <input
                                type="text"
                                value={newCharacter.visualDetails.hairColor || ''}
                                onChange={(e) => setNewCharacter({
                                    ...newCharacter,
                                    visualDetails: {...newCharacter.visualDetails, hairColor: e.target.value}
                                })}
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                                placeholder="e.g., dark brown"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Hair Style</label>
                            <input
                                type="text"
                                value={newCharacter.visualDetails.hairStyle || ''}
                                onChange={(e) => setNewCharacter({
                                    ...newCharacter,
                                    visualDetails: {...newCharacter.visualDetails, hairStyle: e.target.value}
                                })}
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                                placeholder="e.g., short wavy"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Eye Color</label>
                            <input
                                type="text"
                                value={newCharacter.visualDetails.eyeColor || ''}
                                onChange={(e) => setNewCharacter({
                                    ...newCharacter,
                                    visualDetails: {...newCharacter.visualDetails, eyeColor: e.target.value}
                                })}
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                                placeholder="e.g., blue"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Height</label>
                            <input
                                type="text"
                                value={newCharacter.visualDetails.height || ''}
                                onChange={(e) => setNewCharacter({
                                    ...newCharacter,
                                    visualDetails: {...newCharacter.visualDetails, height: e.target.value}
                                })}
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                                placeholder="e.g., 6'2\" or tall"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Build</label>
                            <input
                                type="text"
                                value={newCharacter.visualDetails.build || ''}
                                onChange={(e) => setNewCharacter({
                                    ...newCharacter,
                                    visualDetails: {...newCharacter.visualDetails, build: e.target.value}
                                })}
                                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                                placeholder="e.g., athletic"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Typical Clothing</label>
                        <input
                            type="text"
                            value={newCharacter.visualDetails.clothing || ''}
                            onChange={(e) => setNewCharacter({
                                ...newCharacter,
                                visualDetails: {...newCharacter.visualDetails, clothing: e.target.value}
                            })}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                            placeholder="e.g., dark suit with white shirt and red tie"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Distinctive Features</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={distinctiveFeature}
                                onChange={(e) => setDistinctiveFeature(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDistinctiveFeature())}
                                className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                                placeholder="e.g., scar on left cheek"
                            />
                            <button
                                onClick={addDistinctiveFeature}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        {newCharacter.visualDetails.distinctiveFeatures && newCharacter.visualDetails.distinctiveFeatures.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {newCharacter.visualDetails.distinctiveFeatures.map((feature, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm">
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Style Consistency Prompt (Advanced)</label>
                        <textarea
                            value={newCharacter.styleConsistencyPrompt || ''}
                            onChange={(e) => setNewCharacter({...newCharacter, styleConsistencyPrompt: e.target.value})}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500"
                            rows={2}
                            placeholder="Additional prompt to ensure visual consistency across scenes"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsAddingCharacter(false)}
                            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddCharacter}
                            disabled={!newCharacter.name}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Character
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CharacterManager;