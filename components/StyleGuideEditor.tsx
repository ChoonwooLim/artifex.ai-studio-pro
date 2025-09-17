import React, { useState, useEffect } from 'react';
import { StyleGuide } from '../services/professionalImageService';

interface StyleGuideEditorProps {
    styleGuide: StyleGuide;
    onStyleGuideUpdate: (styleGuide: StyleGuide) => void;
}

interface PresetStyle {
    name: string;
    description: string;
    guide: StyleGuide;
}

const PRESET_STYLES: PresetStyle[] = [
    {
        name: 'Hollywood Blockbuster',
        description: 'Epic cinematic quality with dramatic lighting and effects',
        guide: {
            cinematography: {
                lighting: 'dramatic',
                colorGrading: 'cinematic',
                cameraAngle: 'low angle',
                depthOfField: 'shallow',
                aspectRatio: '2.39:1'
            },
            artDirection: {
                artStyle: 'hyperrealistic',
                productionQuality: 'blockbuster',
                era: 'contemporary',
                mood: 'epic'
            },
            technicalSpecs: {
                resolution: '8K',
                quality: 'maximum',
                renderEngine: 'unreal engine 5',
                postProcessing: ['color grading', 'lens flare', 'chromatic aberration subtle', 'film grain']
            }
        }
    },
    {
        name: 'Indie Film',
        description: 'Natural, intimate cinematography with artistic touches',
        guide: {
            cinematography: {
                lighting: 'natural',
                colorGrading: 'desaturated',
                cameraAngle: 'eye level',
                depthOfField: 'shallow',
                aspectRatio: '1.85:1'
            },
            artDirection: {
                artStyle: 'photorealistic',
                productionQuality: 'indie',
                era: 'contemporary',
                mood: 'emotional'
            },
            technicalSpecs: {
                resolution: '4K',
                quality: 'high',
                renderEngine: 'arnold',
                postProcessing: ['subtle color grading', 'film grain', 'vignette']
            }
        }
    },
    {
        name: 'Documentary',
        description: 'Realistic, observational style with natural lighting',
        guide: {
            cinematography: {
                lighting: 'natural',
                colorGrading: 'vibrant',
                cameraAngle: 'eye level',
                depthOfField: 'deep',
                aspectRatio: '16:9'
            },
            artDirection: {
                artStyle: 'documentary',
                productionQuality: 'documentary',
                era: 'contemporary',
                mood: 'dramatic'
            },
            technicalSpecs: {
                resolution: '4K',
                quality: 'high',
                renderEngine: 'cycles',
                postProcessing: ['minimal color correction', 'slight sharpening']
            }
        }
    },
    {
        name: 'Commercial',
        description: 'Clean, vibrant, and polished advertising aesthetic',
        guide: {
            cinematography: {
                lighting: 'soft',
                colorGrading: 'vibrant',
                cameraAngle: 'eye level',
                depthOfField: 'shallow',
                aspectRatio: '16:9'
            },
            artDirection: {
                artStyle: 'commercial',
                productionQuality: 'commercial',
                era: 'contemporary',
                mood: 'uplifting'
            },
            technicalSpecs: {
                resolution: '4K',
                quality: 'maximum',
                renderEngine: 'redshift',
                postProcessing: ['vibrant color grading', 'skin smoothing', 'highlight bloom']
            }
        }
    },
    {
        name: 'Film Noir',
        description: 'High contrast black and white with dramatic shadows',
        guide: {
            cinematography: {
                lighting: 'film noir',
                colorGrading: 'desaturated',
                cameraAngle: 'dutch angle',
                depthOfField: 'deep',
                aspectRatio: '4:3'
            },
            artDirection: {
                artStyle: 'cinematic',
                productionQuality: 'arthouse',
                era: 'historical',
                mood: 'mysterious'
            },
            technicalSpecs: {
                resolution: '4K',
                quality: 'high',
                renderEngine: 'arnold',
                postProcessing: ['black and white conversion', 'high contrast', 'film grain heavy', 'vignette strong']
            }
        }
    }
];

const StyleGuideEditor: React.FC<StyleGuideEditorProps> = ({ styleGuide, onStyleGuideUpdate }) => {
    const [localGuide, setLocalGuide] = useState<StyleGuide>(styleGuide);
    const [selectedPreset, setSelectedPreset] = useState<string>('');
    const [customPostProcessing, setCustomPostProcessing] = useState('');

    useEffect(() => {
        setLocalGuide(styleGuide);
    }, [styleGuide]);

    const applyPreset = (preset: PresetStyle) => {
        setLocalGuide(preset.guide);
        onStyleGuideUpdate(preset.guide);
        setSelectedPreset(preset.name);
    };

    const updateCinematography = (field: keyof StyleGuide['cinematography'], value: any) => {
        const updated = {
            ...localGuide,
            cinematography: {
                ...localGuide.cinematography,
                [field]: value
            }
        };
        setLocalGuide(updated);
        onStyleGuideUpdate(updated);
    };

    const updateArtDirection = (field: keyof StyleGuide['artDirection'], value: any) => {
        const updated = {
            ...localGuide,
            artDirection: {
                ...localGuide.artDirection,
                [field]: value
            }
        };
        setLocalGuide(updated);
        onStyleGuideUpdate(updated);
    };

    const updateTechnicalSpecs = (field: keyof StyleGuide['technicalSpecs'], value: any) => {
        const updated = {
            ...localGuide,
            technicalSpecs: {
                ...localGuide.technicalSpecs,
                [field]: value
            }
        };
        setLocalGuide(updated);
        onStyleGuideUpdate(updated);
    };

    const addPostProcessing = () => {
        if (customPostProcessing.trim()) {
            const updated = {
                ...localGuide,
                technicalSpecs: {
                    ...localGuide.technicalSpecs,
                    postProcessing: [...localGuide.technicalSpecs.postProcessing, customPostProcessing.trim()]
                }
            };
            setLocalGuide(updated);
            onStyleGuideUpdate(updated);
            setCustomPostProcessing('');
        }
    };

    const removePostProcessing = (index: number) => {
        const updated = {
            ...localGuide,
            technicalSpecs: {
                ...localGuide.technicalSpecs,
                postProcessing: localGuide.technicalSpecs.postProcessing.filter((_, i) => i !== index)
            }
        };
        setLocalGuide(updated);
        onStyleGuideUpdate(updated);
    };

    return (
        <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Visual Style Guide</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Preset:</span>
                    <select
                        value={selectedPreset}
                        onChange={(e) => {
                            const preset = PRESET_STYLES.find(p => p.name === e.target.value);
                            if (preset) applyPreset(preset);
                        }}
                        className="bg-slate-700 text-white px-3 py-1 rounded border border-slate-600 focus:border-purple-500"
                    >
                        <option value="">Custom</option>
                        {PRESET_STYLES.map(preset => (
                            <option key={preset.name} value={preset.name}>
                                {preset.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Cinematography Section */}
            <div className="bg-slate-800 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎬</span> Cinematography
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Lighting</label>
                        <select
                            value={localGuide.cinematography.lighting}
                            onChange={(e) => updateCinematography('lighting', e.target.value)}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 text-sm"
                        >
                            <option value="natural">Natural</option>
                            <option value="dramatic">Dramatic</option>
                            <option value="soft">Soft</option>
                            <option value="hard">Hard</option>
                            <option value="golden hour">Golden Hour</option>
                            <option value="blue hour">Blue Hour</option>
                            <option value="neon">Neon</option>
                            <option value="film noir">Film Noir</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Color Grading</label>
                        <select
                            value={localGuide.cinematography.colorGrading}
                            onChange={(e) => updateCinematography('colorGrading', e.target.value)}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 text-sm"
                        >
                            <option value="cinematic">Cinematic</option>
                            <option value="vibrant">Vibrant</option>
                            <option value="desaturated">Desaturated</option>
                            <option value="warm">Warm</option>
                            <option value="cool">Cool</option>
                            <option value="high contrast">High Contrast</option>
                            <option value="low contrast">Low Contrast</option>
                            <option value="film emulation">Film Emulation</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Camera Angle</label>
                        <select
                            value={localGuide.cinematography.cameraAngle}
                            onChange={(e) => updateCinematography('cameraAngle', e.target.value)}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 text-sm"
                        >
                            <option value="eye level">Eye Level</option>
                            <option value="low angle">Low Angle</option>
                            <option value="high angle">High Angle</option>
                            <option value="dutch angle">Dutch Angle</option>
                            <option value="aerial">Aerial</option>
                            <option value="close-up">Close-up</option>
                            <option value="wide shot">Wide Shot</option>
                            <option value="medium shot">Medium Shot</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Depth of Field</label>
                        <select
                            value={localGuide.cinematography.depthOfField}
                            onChange={(e) => updateCinematography('depthOfField', e.target.value)}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 text-sm"
                        >
                            <option value="shallow">Shallow (Bokeh)</option>
                            <option value="deep">Deep (All in focus)</option>
                            <option value="tilt-shift">Tilt-shift</option>
                            <option value="bokeh">Strong Bokeh</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Art Direction Section */}
            <div className="bg-slate-800 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎨</span> Art Direction
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Art Style</label>
                        <select
                            value={localGuide.artDirection.artStyle}
                            onChange={(e) => updateArtDirection('artStyle', e.target.value)}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 text-sm"
                        >
                            <option value="photorealistic">Photorealistic</option>
                            <option value="hyperrealistic">Hyperrealistic</option>
                            <option value="cinematic">Cinematic</option>
                            <option value="documentary">Documentary</option>
                            <option value="commercial">Commercial</option>
                            <option value="artistic">Artistic</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Production Quality</label>
                        <select
                            value={localGuide.artDirection.productionQuality}
                            onChange={(e) => updateArtDirection('productionQuality', e.target.value)}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 text-sm"
                        >
                            <option value="blockbuster">Blockbuster</option>
                            <option value="indie">Indie</option>
                            <option value="commercial">Commercial</option>
                            <option value="documentary">Documentary</option>
                            <option value="arthouse">Arthouse</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Era</label>
                        <select
                            value={localGuide.artDirection.era}
                            onChange={(e) => updateArtDirection('era', e.target.value)}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 text-sm"
                        >
                            <option value="contemporary">Contemporary</option>
                            <option value="futuristic">Futuristic</option>
                            <option value="historical">Historical</option>
                            <option value="timeless">Timeless</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Mood</label>
                        <select
                            value={localGuide.artDirection.mood}
                            onChange={(e) => updateArtDirection('mood', e.target.value)}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 text-sm"
                        >
                            <option value="dramatic">Dramatic</option>
                            <option value="uplifting">Uplifting</option>
                            <option value="tense">Tense</option>
                            <option value="mysterious">Mysterious</option>
                            <option value="romantic">Romantic</option>
                            <option value="action">Action</option>
                            <option value="horror">Horror</option>
                            <option value="comedy">Comedy</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Technical Specifications Section */}
            <div className="bg-slate-800 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚙️</span> Technical Specifications
                </h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Resolution</label>
                        <select
                            value={localGuide.technicalSpecs.resolution}
                            onChange={(e) => updateTechnicalSpecs('resolution', e.target.value)}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 text-sm"
                        >
                            <option value="8K">8K (Ultra HD)</option>
                            <option value="4K">4K (UHD)</option>
                            <option value="2K">2K</option>
                            <option value="HD">HD (1080p)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Quality</label>
                        <select
                            value={localGuide.technicalSpecs.quality}
                            onChange={(e) => updateTechnicalSpecs('quality', e.target.value)}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 text-sm"
                        >
                            <option value="maximum">Maximum</option>
                            <option value="high">High</option>
                            <option value="balanced">Balanced</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Render Engine</label>
                        <select
                            value={localGuide.technicalSpecs.renderEngine}
                            onChange={(e) => updateTechnicalSpecs('renderEngine', e.target.value)}
                            className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 text-sm"
                        >
                            <option value="unreal engine 5">Unreal Engine 5</option>
                            <option value="octane">Octane Render</option>
                            <option value="arnold">Arnold</option>
                            <option value="redshift">Redshift</option>
                            <option value="cycles">Cycles</option>
                        </select>
                    </div>
                </div>

                {/* Post Processing */}
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Post Processing Effects</label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={customPostProcessing}
                            onChange={(e) => setCustomPostProcessing(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPostProcessing())}
                            className="flex-1 bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 text-sm"
                            placeholder="e.g., lens flare, chromatic aberration"
                        />
                        <button
                            onClick={addPostProcessing}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {localGuide.technicalSpecs.postProcessing.map((effect, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm flex items-center gap-1"
                            >
                                {effect}
                                <button
                                    onClick={() => removePostProcessing(idx)}
                                    className="text-red-400 hover:text-red-300 ml-1"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StyleGuideEditor;