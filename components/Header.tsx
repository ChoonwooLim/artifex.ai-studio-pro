import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { DESCRIPTION_LANGUAGE_OPTIONS } from '../constants';
import UploadIcon from './icons/UploadIcon';
import PlusIcon from './icons/PlusIcon';
import GalleryIcon from './icons/GalleryIcon';

interface HeaderProps {
    onOpenGallery: () => void;
    onNewProject: () => void;
    onImport: () => void;
    onOpenApiKeys: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenGallery, onNewProject, onImport, onOpenApiKeys }) => {
    const { t, language, setLanguage } = useTranslation();
    const title = t('header.title');
    const subtitle = t('header.subtitle');

    return (
        <header>
            {/* Top control bar */}
            <div className="flex justify-end items-center h-12 mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="relative">
                         <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 font-medium py-2 pl-3 pr-8 rounded-lg transition-colors text-sm appearance-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            aria-label="Select application language"
                        >
                            {DESCRIPTION_LANGUAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.043-.481 1.576 0L10 10.405l2.908-2.857c.533-.481 1.141-.446 1.574 0 .436.445.408 1.197 0 1.615l-3.712 3.667a1.109 1.109 0 0 1-1.576 0L5.516 9.163c-.409-.418-.436-1.17 0-1.615z"/></svg>
                        </div>
                    </div>
                    <button 
                        onClick={onNewProject}
                        className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-2"
                        title={t('tooltips.newProject')}
                    >
                        <PlusIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">{t('header.newProject')}</span>
                    </button>
                    <button 
                        onClick={onImport}
                        className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-2"
                        title={t('tooltips.importProjectFile')}
                    >
                        <UploadIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">{t('header.importProject')}</span>
                    </button>
                    <button 
                        onClick={onOpenGallery}
                        className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 font-medium py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center gap-2"
                        title={t('tooltips.openGallery')}
                    >
                        <GalleryIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">{t('header.openGallery')}</span>
                    </button>
                    <button 
                        onClick={onOpenApiKeys}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-3 sm:px-4 rounded-lg transition-all flex items-center gap-2 shadow-lg"
                        title={t('tooltips.apiKeys')}
                    >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <span className="hidden sm:inline">{t('header.apiKeys')}</span>
                    </button>
                </div>
            </div>

            {/* Main Title Section */}
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
                    {title}
                </h1>
                <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                    {subtitle}
                </p>
            </div>
        </header>
    );
};

export default Header;