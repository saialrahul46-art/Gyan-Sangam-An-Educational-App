




import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Screen, Content, Kavita, PdfViewerState, UserProfile, TranslationHistoryItem } from '../types';
import {
    translations,
    indianLanguages,
    digestNotes,
    pdfNotes,
    kavitas,
    subjects,
    subjectEmojis,
    getLanguageDisplayName,
} from '../constants';
import { translateText } from '../services/geminiService';
import { BackIcon, ClearIcon, SwapIcon, UserIcon, SchoolIcon, GraduationCapIcon, CheckIcon, RocketIcon, SuccessIcon, MoonIcon, SunIcon, ZoomInIcon, ZoomOutIcon, DeviceIcon, HistoryIcon, TrashIcon } from './Icons';
import { Modal } from './UI';

type TFunction = (key: string) => string;

interface ScreenProps {
  changeScreen: (screen: Screen, data?: any) => void;
  t: TFunction;
  lang: string;
}

interface LanguageSelectProps extends Omit<ScreenProps, 'lang' | 't'> {
  onConfirm: (lang: string) => void;
  userId: string | null;
}

export const LanguageSelectScreen: React.FC<LanguageSelectProps> = ({ onConfirm, userId }) => {
    const [selectedLang, setSelectedLang] = useState('en');
    const t = (key: string) => translations[selectedLang]?.[key] || translations['en'][key];
    const allLanguages = [
        { code: 'en', name: 'English', char: 'Aa' }, { code: 'hi', name: 'हिन्दी', char: 'अ' },
        { code: 'mr', name: 'मराठी', char: 'म' }, { code: 'gu', name: 'ગુજરાતી', char: 'અ' },
        { code: 'kn', name: 'ಕನ್ನಡ', char: 'ಕ' }, { code: 'bn', name: 'বাংলা', char: 'আ' },
        { code: 'te', name: 'తెలుగు', char: 'అ' }, { code: 'ml', name: 'മലയാളം', char: 'മ' },
        { code: 'ur', name: 'اردو', char: 'ا' },
    ];
    
    const languages = allLanguages.filter(lang => Object.keys(translations).includes(lang.code));

    return (
        <div className="p-4 pt-12 w-full max-w-md mx-auto min-h-screen flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center flex items-center justify-center gap-2">🌐 {t('choose_language')}</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
                {languages.map(lang => (
                    <button 
                        key={lang.code} 
                        onClick={() => setSelectedLang(lang.code)} 
                        aria-label={`Select ${lang.name}`}
                        aria-pressed={selectedLang === lang.code}
                        className={`lang-card relative h-28 sm:h-32 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md overflow-hidden p-3 text-left border-2 transition-all duration-200 ${selectedLang === lang.code ? 'border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-700 scale-105' : 'border-transparent'}`}
                    >
                        <span className="absolute top-1 right-2 text-7xl font-bold text-gray-200 dark:text-gray-600 no-select z-0">{lang.char}</span>
                        <span className="absolute bottom-3 left-3 text-lg font-semibold text-gray-900 dark:text-gray-100 z-10">{lang.name}</span>
                    </button>
                ))}
            </div>
            <button onClick={() => onConfirm(selectedLang)} className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl rounded-lg transition duration-300 shadow-lg flex items-center justify-center gap-2">
               ✅ {t('confirm_button')}
            </button>
            <p className="mt-4 text-xs text-center text-blue-400 dark:text-blue-500 break-all px-2">User ID: {userId || '...loading...'}</p>
        </div>
    );
};


interface OnboardingProps extends ScreenProps {
  onComplete: (profile: UserProfile) => void;
}

const LotusLogo = React.memo(() => (
    <div className="logo-container mt-2">
        <svg className="logo-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="sphereGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#3f51b5"/>
                    <stop offset="1" stopColor="#00bcd4"/>
                </linearGradient>
                <filter id="glowEffect">
                    <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            <circle cx="50" cy="50" r="48" fill="url(#sphereGrad)" />
            
            <g stroke="#FFD700" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M50 25 Q 55 40 50 55 Q 45 40 50 25 Z" />
                <path d="M50 55 Q 35 45 35 30 Q 42 35 50 42" />
                <path d="M50 55 Q 65 45 65 30 Q 58 35 50 42" />
                <path d="M50 55 Q 25 50 20 35 Q 30 40 40 45" />
                <path d="M50 55 Q 75 50 80 35 Q 70 40 60 45" />
                <path d="M30 60 Q 50 70 70 60" />
            </g>
            
            <path d="M50 18 L 52 23 L 57 23 L 53 26 L 54 31 L 50 28 L 46 31 L 47 26 L 43 23 L 48 23 Z" fill="#FFFFFF" filter="url(#glowEffect)" />
             <circle cx="30" cy="30" r="1" fill="white" opacity="0.8" />
             <circle cx="70" cy="30" r="1" fill="white" opacity="0.8" />
             <circle cx="20" cy="50" r="0.8" fill="white" opacity="0.6" />
             <circle cx="80" cy="50" r="0.8" fill="white" opacity="0.6" />
        </svg>
    </div>
));

export const OnboardingScreen: React.FC<OnboardingProps> = ({ onComplete, t, changeScreen }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [profile, setProfile] = useState<UserProfile>({ username: '', school: '', standard: '' });
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
    const [shakingFields, setShakingFields] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const step1Ref = useRef<HTMLDivElement>(null);
    const step2Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.body.classList.add('onboarding-background');
        return () => document.body.classList.remove('onboarding-background');
    }, []);

    const triggerShake = (field: string) => {
        setShakingFields(prev => [...prev, field]);
        setTimeout(() => {
            setShakingFields(prev => prev.filter(f => f !== field));
        }, 500);
    };

    const handleStepTransition = (targetStep: number) => {
        if (!step1Ref.current || !step2Ref.current) return;
        const isForward = targetStep > currentStep;
        const currentEl = currentStep === 1 ? step1Ref.current : step2Ref.current;
        const targetEl = targetStep === 1 ? step1Ref.current : step2Ref.current;
        
        targetEl.style.display = 'flex';
        targetEl.style.transform = isForward ? 'translateX(100%)' : 'translateX(-100%)';
        targetEl.style.opacity = '0';
        
        requestAnimationFrame(() => {
            currentEl.style.transform = isForward ? 'translateX(-100%)' : 'translateX(100%)';
            currentEl.style.opacity = '0';
            targetEl.style.transform = 'translateX(0)';
            targetEl.style.opacity = '1';
        });

        setTimeout(() => {
            currentEl.style.display = 'none';
            setCurrentStep(targetStep);
        }, 600);
    };

    const validateStep1 = () => {
        const newErrors: { [key: string]: string | null } = {};
        let isValid = true;

        if (profile.username.trim().length < 4 || !/^[A-Za-z\s]+$/.test(profile.username)) {
            newErrors.username = "Username must be at least 4 letters (A-Z, a-z, space only).";
            triggerShake('username');
            isValid = false;
        } else {
            newErrors.username = null;
        }

        if (profile.school.trim() === '') {
            newErrors.school = "School name cannot be empty.";
            triggerShake('school');
            isValid = false;
        } else {
            newErrors.school = null;
        }

        if (!termsAgreed) {
            newErrors.terms = t('onboarding_terms_error');
            triggerShake('terms');
            isValid = false;
        } else {
            newErrors.terms = null;
        }

        setErrors(prev => ({...prev, ...newErrors}));
        return isValid;
    };

    const handleNext = () => {
        if (validateStep1()) {
            handleStepTransition(2);
        }
    };
    
    const handleBack = () => {
        handleStepTransition(1);
    };

    const handleSubmit = async () => {
        if (profile.standard === '') {
            setErrors({ standard: t('standard_error') });
            triggerShake('standard');
            return;
        }
        setErrors({});
        setIsSubmitting(true);
        await onComplete(profile);
        setIsSubmitting(false);
        setShowSuccessModal(true);
    };

    return (
        <div ref={containerRef} className="relative w-full h-full flex-grow overflow-hidden">
            {/* --- Step 1 --- */}
            <div ref={step1Ref} style={{ transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.4s ease-in-out', display: 'flex' }} className="absolute inset-0 p-6 flex-col">
                <header className="mb-8 pt-8 animate-fade-in-slide-up" style={{ animationDelay: '0.3s' }}>
                    <div className="flex justify-between items-start">
                        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white leading-none mb-2 tracking-tight">Welcome<br/>TO,<br/>GYAN<br/><span className="purple-text" style={{ letterSpacing: '0.1em' }}>SANGAM</span></h1>
                        <LotusLogo />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">We waiting for you, please enter your details.</p>
                </header>
                <div className="flex justify-between items-center space-x-2 mb-10 animate-fade-in-slide-up" style={{ animationDelay: '0.5s' }}>
                    <span className="text-xs font-bold purple-text tracking-widest flex items-center gap-1">📝 STEP 1/2</span>
                    <div className="h-1 w-24 bg-purple-200 rounded-full"><div id="progress-fill" className="h-1 bg-purple-600 rounded-full" style={{ width: '50%' }}></div></div>
                </div>
                <main className="space-y-6 animate-fade-in-slide-up" style={{ animationDelay: '0.7s' }}>
                    <div className={`input-group ${errors.username ? 'invalid' : ''} ${shakingFields.includes('username') ? 'animate-shake' : ''}`}>
                        <UserIcon className="w-5 h-5 input-icon" />
                        <input type="text" value={profile.username} onChange={e => setProfile(p => ({...p, username: e.target.value}))} className="input-base dark:text-white" placeholder=" " />
                        <label className="input-label dark:text-gray-300">Username</label>
                    </div>
                    {errors.username && <p className="text-red-500 text-xs mt-1 ml-3">{errors.username}</p>}
                    
                    <div className={`input-group ${errors.school ? 'invalid' : ''} ${shakingFields.includes('school') ? 'animate-shake' : ''}`}>
                        <SchoolIcon className="w-5 h-5 input-icon" />
                        <input type="text" value={profile.school} onChange={e => setProfile(p => ({...p, school: e.target.value}))} className="input-base dark:text-white" placeholder=" " />
                        <label className="input-label dark:text-gray-300">School Name</label>
                    </div>
                    {errors.school && <p className="text-red-500 text-xs mt-1 ml-3">{errors.school}</p>}

                    <div className="relative pt-2">
                        <label htmlFor="terms-condition" className={`flex items-center cursor-pointer ${shakingFields.includes('terms') ? 'animate-shake' : ''}`}>
                            <input id="terms-condition" type="checkbox" className="hidden-checkbox" checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} />
                            <span className="custom-checkbox"><CheckIcon /></span>
                            <span className="ml-3 text-sm text-gray-600 dark:text-gray-300 uppercase tracking-wide">{t('onboarding_agree_terms')}</span>
                        </label>
                        {errors.terms && <p className="text-red-500 text-xs mt-1.5 ml-3">{errors.terms}</p>}
                    </div>
                    <button onClick={handleNext} className="w-full mt-10 p-4 text-white bg-purple-600 hover:bg-purple-700 btn-premium rounded-xl flex items-center justify-center font-bold text-lg">{t('next')} <span className="ml-2 text-xl">➡️</span></button>
                </main>
                <footer className="text-center mt-auto pb-8 animate-fade-in-slide-up" style={{ animationDelay: '0.9s' }}>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">TODAY'S TIME IS BEST TO <span className="purple-text">START 🚀</span></p>
                </footer>
            </div>
            
            {/* --- Step 2 --- */}
            <div ref={step2Ref} style={{ transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)', display: 'none', opacity: 0 }} className="absolute inset-0 p-6 h-full flex flex-col justify-between">
                <div className="pt-8 flex-grow">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none tracking-tight mb-4 pt-16">🎓 SELECT YOUR STD</h1>
                    <div className="border-b-2 border-purple-300 w-full mb-6"></div>
                    <div className="flex justify-between items-center space-x-2 mb-10">
                        <span className="text-xs font-bold purple-text tracking-widest flex items-center gap-1">🎓 STEP 2/2</span>
                        <div className="h-1 w-24 bg-purple-200 rounded-full"><div className="h-1 bg-purple-600 rounded-full" style={{ width: '100%' }}></div></div>
                    </div>
                    <div className={`input-group ${errors.standard ? 'invalid' : ''} ${shakingFields.includes('standard') ? 'animate-shake' : ''}`}>
                        <GraduationCapIcon className="w-5 h-5 input-icon" />
                        <select value={profile.standard} onChange={e => setProfile(p => ({...p, standard: e.target.value}))} className="input-base appearance-none pr-10 dark:text-white">
                            <option value="" disabled>Select a Standard</option>
                            <option value="10th" className="text-black">10th Standard</option>
                        </select>
                        <div className="pointer-events-none flex items-center px-2 absolute right-2 top-1/2 -translate-y-1/2 text-gray-700 dark:text-gray-300"><svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
                    </div>
                    {errors.standard && <p className="text-red-500 text-sm mt-2 ml-3">{errors.standard}</p>}
                </div>
                <div className="mt-auto pb-8 space-y-4">
                    <button onClick={handleSubmit} disabled={isSubmitting} className="w-full p-4 text-white bg-purple-600 hover:bg-purple-800 btn-premium rounded-xl flex items-center justify-center font-extrabold text-lg">
                        {isSubmitting ? <div className="loader"></div> : <>{t('get_started')} <RocketIcon /></>}
                    </button>
                    <button onClick={handleBack} className="w-full p-4 text-purple-600 border-2 border-purple-300 hover:bg-purple-50 transition duration-300 rounded-xl flex items-center justify-center font-bold text-base shadow-sm dark:text-purple-400 dark:border-purple-700 dark:hover:bg-gray-800">{t('back_to_edit')}</button>
                </div>
            </div>

            {/* --- Success Modal --- */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center dark:bg-gray-800">
                        <SuccessIcon />
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">{t('registration_complete')}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{t('registration_success_msg')}</p>
                        <div className="text-left text-sm text-gray-800 dark:text-gray-200 space-y-1 mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p><strong>👤 User:</strong> {profile.username}</p>
                            <p><strong>🏫 School:</strong> {profile.school}</p>
                            <p><strong>🎓 Standard:</strong> {profile.standard}</p>
                        </div>
                        <button onClick={() => changeScreen(Screen.Home)} className="w-full p-4 text-white bg-purple-600 hover:bg-purple-700 btn-premium rounded-xl font-extrabold text-lg">{t('get_started')}</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Props extended to include appOpens, theme toggling, and Simple Mode handler
export const HomeScreen: React.FC<ScreenProps & { username: string | null, appOpens: number, theme: string, toggleTheme: () => void, onSimpleModeClick: () => void }> = ({ changeScreen, t, username, appOpens, theme, toggleTheme, onSimpleModeClick }) => {
    const [showDarkPrompt, setShowDarkPrompt] = useState(false);

    useEffect(() => {
        // Show prompt if user has opened app more than 2 times and is still in light mode
        if (appOpens > 2 && theme === 'light') {
            setShowDarkPrompt(true);
        } else {
            setShowDarkPrompt(false);
        }
    }, [appOpens, theme]);

    return (
        <div className="text-center p-4 flex-grow flex flex-col justify-start pt-6">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 font-medium">👋 {t('welcome_msg')} <span className="font-bold text-blue-600 dark:text-blue-400 break-words">{username || 'User'}</span></p>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">✨ {t('choose_mode')}</h2>
            <div className="space-y-4">
                <button onClick={() => changeScreen(Screen.ExtraMode)} className="w-full p-4 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-xl transition duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]">
                    <div className="flex flex-row items-center text-left">
                        <span className="text-4xl mr-4 bg-white/20 rounded-full p-2">🎒</span>
                        <div>
                             <div className="font-bold text-xl">{t('extra_mode')}</div>
                             <p className="text-sm font-normal mt-1 opacity-90">{t('extra_mode_desc')}</p>
                        </div>
                    </div>
                </button>
                <button onClick={onSimpleModeClick} className="w-full p-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xl rounded-xl transition duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]">
                    <div className="flex flex-row items-center text-left">
                        <span className="text-4xl mr-4 bg-white/20 rounded-full p-2">📚</span>
                        <div>
                             <div className="font-bold text-xl">{t('simple_mode')}</div>
                             <p className="text-sm font-normal mt-1 opacity-90">{t('simple_mode_desc')}</p>
                        </div>
                    </div>
                </button>
                <button onClick={() => changeScreen(Screen.AITranslator)} className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl rounded-xl transition duration-300 shadow-lg transform hover:scale-[1.02] active:scale-[0.98]">
                    <div className="flex flex-row items-center text-left">
                        <span className="text-4xl mr-4 bg-white/20 rounded-full p-2">🧠</span>
                        <div>
                             <div className="font-bold text-xl">{t('ai_translator_mode')}</div>
                             <p className="text-sm font-normal mt-1 opacity-90">{t('ai_translator_desc')}</p>
                        </div>
                    </div>
                </button>
            </div>
            
            {/* Notification to try Dark Mode */}
            {showDarkPrompt && (
                <div 
                    onClick={toggleTheme}
                    className="mt-8 p-4 bg-gray-900 text-white rounded-xl shadow-xl flex items-center justify-between cursor-pointer animate-fade-in-up transform hover:scale-105 transition-transform duration-200 ring-2 ring-indigo-400"
                    role="button"
                    aria-label="Enable Dark Mode"
                >
                    <div className="flex items-center text-left">
                        <MoonIcon className="h-8 w-8 text-yellow-400 mr-3" />
                        <div>
                            <p className="font-bold text-sm">🌙 Try Dark Mode?</p>
                            <p className="text-xs text-gray-300">Easier on your eyes.</p>
                        </div>
                    </div>
                    <span className="bg-indigo-600 px-3 py-1 rounded-full text-xs font-bold">Turn On</span>
                </div>
            )}
        </div>
    );
};

const ScreenWrapper: React.FC<{ children: React.ReactNode, onBack: () => void, t: TFunction }> = ({ children, onBack, t }) => (
    <div className="p-4 w-full flex-grow flex flex-col">
        <button onClick={onBack} aria-label="Go back" className="mb-4 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center self-start">
            <BackIcon /> {t('back')}
        </button>
        {children}
    </div>
);

export const ThemeSettingsScreen: React.FC<ScreenProps & { theme: string, toggleTheme: () => void, useSystemTheme: boolean, toggleSystemTheme: () => void }> = ({ changeScreen, t, theme, toggleTheme, useSystemTheme, toggleSystemTheme }) => (
    <ScreenWrapper onBack={() => changeScreen(Screen.Home)} t={t}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">🎨 {t('theme_settings_title')}</h2>
        
        {/* Dark Mode Card */}
        <div className={`bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600 p-6 mb-6 transition-all duration-300 ${useSystemTheme ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-4 ${theme === 'dark' ? 'bg-gray-600 text-yellow-300' : 'bg-yellow-100 text-orange-500'}`}>
                        {theme === 'dark' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                    </div>
                    <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">{t('dark_mode_label')}</span>
                </div>
                <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    role="switch"
                    aria-checked={theme === 'dark'}
                    aria-label="Toggle dark mode"
                    disabled={useSystemTheme}
                >
                    <span className={`${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-300`} />
                </button>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {t('dark_mode_description')}
                </p>
            </div>
        </div>

        {/* System Sync Card */}
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600 p-6 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 rounded-full mr-4 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        <DeviceIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">{t('system_theme_label')}</span>
                </div>
                <button
                    onClick={toggleSystemTheme}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${useSystemTheme ? 'bg-blue-600' : 'bg-gray-300'}`}
                    role="switch"
                    aria-checked={useSystemTheme}
                    aria-label="Toggle system theme sync"
                >
                    <span className={`${useSystemTheme ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-300`} />
                </button>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {t('system_theme_description')}
                </p>
            </div>
        </div>
    </ScreenWrapper>
);

export const ExtraModeScreen: React.FC<ScreenProps> = ({ changeScreen, t, lang }) => (
    <ScreenWrapper onBack={() => changeScreen(Screen.Home)} t={t}>
        <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4">🎒 {t('extra_mode_title')}</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">💡 {t('purpose_1')}</p>
        <p className="text-gray-700 dark:text-gray-300 mb-6 font-semibold">👉 {t('purpose_2')}</p>
        <div className="mt-4 space-y-2">
            {Object.entries(subjects).map(([en, hi]) => (
                <button key={en} onClick={() => changeScreen(Screen.NotesList, { subject: en })} className="w-full p-3 bg-white border border-blue-400 text-blue-700 font-semibold rounded-lg shadow transition hover:bg-blue-50 dark:bg-gray-700 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-gray-600 flex items-center gap-3">
                     <span className="text-2xl">{subjectEmojis[en] || '📘'}</span>
                     <span className="flex-grow text-left">{lang === 'hi' ? hi : en} {t('subject_class')}</span>
                     <span className="text-gray-400">›</span>
                </button>
            ))}
        </div>
    </ScreenWrapper>
);

export const SimpleModeScreen: React.FC<ScreenProps> = ({ changeScreen, t }) => (
    <ScreenWrapper onBack={() => changeScreen(Screen.Home)} t={t}>
        <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-6">📚 {t('simple_mode_title')}</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-md dark:bg-gray-700 dark:border-gray-600">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">📖 {t('free_digest')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">{t('free_digest_desc')}</p>
            <button onClick={() => changeScreen(Screen.PdfSelect, { type: 'digest' })} className="w-full p-3 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold rounded-lg transition duration-150 shadow flex items-center justify-center gap-2">
                👀 {t('view_digest')}
            </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-md dark:bg-gray-700 dark:border-gray-600">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">📝 {t('graded_notes')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">{t('graded_notes_desc')}</p>
            <button onClick={() => changeScreen(Screen.PdfSelect, { type: 'note' })} className="w-full p-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition duration-150 shadow flex items-center justify-center gap-2">
                📄 {t('view_pdf_notes')}
            </button>
        </div>
        <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-6">⚠️ {t('download_warning')}</p>
    </ScreenWrapper>
);

export const AITranslatorScreen: React.FC<ScreenProps> = ({ changeScreen, t }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [sourceLang, setSourceLang] = useState('en');
    const [targetLang, setTargetLang] = useState('hi');
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState('');
    const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    useEffect(() => {
        const savedHistory = localStorage.getItem('ai_translation_history');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    const handleTranslate = useCallback(async () => {
        if (!input.trim()) {
            setError(t('ai_input_error'));
            return;
        }
        setError('');
        setIsTranslating(true);
        setOutput('');
        try {
            const result = await translateText(input, sourceLang, targetLang);
            setOutput(result);
            
            // Save to history
            const newItem: TranslationHistoryItem = { input, output: result, source: sourceLang, target: targetLang };
            const updatedHistory = [newItem, ...history].slice(0, 3);
            setHistory(updatedHistory);
            localStorage.setItem('ai_translation_history', JSON.stringify(updatedHistory));

        } catch (e) {
            setError(t('ai_error'));
            console.error(e);
        } finally {
            setIsTranslating(false);
        }
    }, [input, sourceLang, targetLang, t, history]);

    const handleSwap = useCallback(() => {
        if (sourceLang === 'auto') return; // Cannot swap 'auto'
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
    }, [sourceLang, targetLang]);

    const handleClear = useCallback(() => {
        setInput('');
        setOutput('');
        setError('');
    }, []);

    const handleRestoreHistory = (item: TranslationHistoryItem) => {
        setInput(item.input);
        setOutput(item.output);
        setSourceLang(item.source);
        setTargetLang(item.target);
        setIsHistoryOpen(false);
    };

    const handleClearHistory = () => {
        setHistory([]);
        localStorage.removeItem('ai_translation_history');
    };

    const sourceLangOptions = useMemo(() => Object.entries(indianLanguages), []);
    const targetLangOptions = useMemo(() => Object.entries(indianLanguages).filter(([code]) => code !== 'auto'), []);
    
    return (
        <ScreenWrapper onBack={() => changeScreen(Screen.Home)} t={t}>
            <div className="relative text-center mb-6">
                 <button 
                    onClick={() => setIsHistoryOpen(true)}
                    className="absolute right-0 top-0 p-2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                    aria-label="Translation History"
                >
                    <HistoryIcon className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold text-purple-700 dark:text-purple-400 flex items-center justify-center gap-2">🗣️ {t('ai_title')}</h2>
                <p className="text-gray-600 dark:text-gray-400">Instantly translate Indian languages.</p>
            </div>

            <div className="space-y-4 flex-grow flex flex-col">
                {/* Input Card */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('ai_source')}</label>
                        <select value={sourceLang} onChange={e => setSourceLang(e.target.value)} className="p-1 border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:border-gray-500 text-sm focus:ring-purple-500 focus:border-purple-500">
                           {sourceLangOptions.map(([code, name]) => <option key={code} value={code}>{getLanguageDisplayName(code, name)}</option>)}
                        </select>
                    </div>
                    <div className="relative flex-grow">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            maxLength={1000}
                            placeholder={t('ai_prompt')}
                            className="w-full h-full p-3 text-lg bg-transparent rounded-lg resize-none focus:outline-none text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-400"
                        />
                        {input && (
                            <button onClick={handleClear} aria-label="Clear input" className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <ClearIcon />
                            </button>
                        )}
                        <p className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">{input.length}/1000</p>
                    </div>
                </div>

                {/* Swap & Translate Controls */}
                <div className="flex items-center justify-center my-[-8px] z-10">
                    <button 
                        onClick={handleSwap} 
                        disabled={sourceLang === 'auto'} 
                        aria-label="Swap languages"
                        className="p-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-90"
                    >
                        <SwapIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                
                 {/* Output Card */}
                 <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col flex-grow">
                     <div className="flex justify-between items-center mb-2">
                         <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('ai_target')}</label>
                         <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="p-1 border border-gray-300 rounded-lg bg-white dark:bg-gray-600 dark:border-gray-500 text-sm focus:ring-purple-500 focus:border-purple-500">
                            {targetLangOptions.map(([code, name]) => <option key={code} value={code}>{getLanguageDisplayName(code, name)}</option>)}
                         </select>
                     </div>
                     <div className="relative flex-grow min-h-[100px]">
                         {isTranslating ? (
                             <div className="absolute inset-0 flex items-center justify-center"><div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>
                         ) : (
                             <p className="w-full h-full p-3 text-lg text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{output || <span className="text-gray-400 dark:text-gray-500">{t('ai_output')}</span>}</p>
                         )}
                     </div>
                </div>

                {error && <p className="text-red-500 text-sm text-center my-2">{error}</p>}

                <button onClick={handleTranslate} disabled={isTranslating} className="w-full mt-4 p-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl transition-transform active:scale-95 shadow-lg disabled:bg-purple-400 dark:disabled:bg-purple-800 flex items-center justify-center gap-2">
                    {isTranslating ? t('ai_translating') : <>{t('ai_translate_btn')} <span className="text-xl">🔄</span></>}
                </button>
            </div>

            {/* History Modal */}
            <Modal isOpen={isHistoryOpen}>
                <div className="bg-white p-6 rounded-xl shadow-2xl m-4 w-11/12 max-w-sm dark:bg-gray-800 transition-colors duration-300 flex flex-col max-h-[80vh]">
                     <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center justify-center gap-2">
                        <HistoryIcon className="w-5 h-5" /> {t('history_title')}
                     </h2>
                     <div className="flex-grow overflow-y-auto custom-scroll space-y-3 mb-4">
                        {history.length === 0 ? (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('history_empty')}</p>
                        ) : (
                            history.map((item, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <span>{indianLanguages[item.source] || item.source}</span>
                                        <span>→</span>
                                        <span>{indianLanguages[item.target] || item.target}</span>
                                    </div>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-medium truncate mb-1">{item.input}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-2">{item.output}</p>
                                    <button 
                                        onClick={() => handleRestoreHistory(item)}
                                        className="w-full py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 rounded text-xs font-bold transition-colors"
                                    >
                                        {t('use_this')}
                                    </button>
                                </div>
                            ))
                        )}
                     </div>
                     <button onClick={() => setIsHistoryOpen(false)} className="w-full p-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold rounded-lg transition duration-300">
                        {t('back')}
                     </button>
                     {history.length > 0 && (
                        <button 
                            onClick={handleClearHistory}
                            className="w-full mt-3 p-3 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 font-bold rounded-lg transition duration-300 flex items-center justify-center gap-2"
                        >
                            <TrashIcon className="w-5 h-5" /> {t('clear_history')}
                        </button>
                     )}
                </div>
            </Modal>
        </ScreenWrapper>
    );
};


interface NotesListProps extends ScreenProps { data: { subject: string }; }

export const NotesListScreen: React.FC<NotesListProps> = ({ changeScreen, t, data, lang }) => {
    const subject = data.subject;
    const subjectName = lang === 'hi' ? subjects[subject] : subject;

    const handleKavitaClick = (kavita: Kavita) => {
        changeScreen(Screen.ContentViewer, {
            subject,
            content: {
                type: 'kavita',
                title: kavita.title,
                text: `${kavita.appreciation}\n\n(${t('content_area_warning')})`
            }
        });
    };
    
    return (
        <ScreenWrapper onBack={() => changeScreen(Screen.ExtraMode)} t={t}>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">📒 {subjectName} {t('notes_title')}</h2>
            {subject === 'Marathi' ? (
                <>
                    <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mt-4 mb-3 flex items-center gap-2">📋 {t('pattern_notes')}</h3>
                    <button onClick={() => changeScreen(Screen.ContentViewer, { subject, content: { type: 'rasagran', title: t('rasagran_basics'), text: t('rasagran_text') }})} className="w-full mb-3 p-4 bg-red-100 border border-red-300 text-red-700 font-bold rounded-lg shadow transition hover:bg-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-800 text-left flex items-center gap-2">
                        🎭 {t('rasagran_notes')}
                    </button>
                    <button onClick={() => changeScreen(Screen.ContentViewer, { subject, content: { type: 'lesson_qna', title: t('lesson_qna_notes'), text: t('lesson_qna_text') }})} className="w-full mb-3 p-4 bg-yellow-100 border border-yellow-300 text-yellow-700 font-bold rounded-lg shadow transition hover:bg-yellow-200 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200 dark:hover:bg-yellow-800 text-left flex items-center gap-2">
                        ❓ {t('lesson_qna_notes')}
                    </button>
                    <div className="mt-6">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">🎶 {t('rasagran_list_title')}</h4>
                        <div className="space-y-2 custom-scroll max-h-64 overflow-y-auto p-2">
                            {kavitas.map(k => <button key={k.id} onClick={() => handleKavitaClick(k)} className="w-full text-left p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"><span className="text-blue-500">🎵</span> {k.title}</button>)}
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl mt-4 dark:bg-gray-700 dark:border-yellow-800 text-center">
                    <p className="text-4xl mb-2">🚧</p>
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">{t('subject_coming_soon')}</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">{t('subject_placeholder')}</p>
                </div>
            )}
        </ScreenWrapper>
    );
};

interface ContentViewerProps extends ScreenProps { data: { content: Content, subject: string }; }

export const ContentViewerScreen: React.FC<ContentViewerProps> = ({ changeScreen, t, data }) => (
    <div className="w-full flex-grow flex flex-col bg-gray-50 text-gray-900"> {/* Force Light BG */}
         <div className="p-4 flex-shrink-0">
            <button onClick={() => changeScreen(Screen.NotesList, { subject: data.subject })} aria-label="Go back" className="mb-4 text-blue-600 hover:text-blue-800 font-semibold flex items-center self-start">
                <BackIcon /> {t('back')}
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{data.content.title}</h2>
         </div>
         <div className="flex-grow p-4 pt-0 overflow-hidden flex flex-col">
            <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-lg h-full custom-scroll overflow-y-auto text-gray-900">
                <pre className="whitespace-pre-wrap leading-relaxed font-sans text-base">{data.content.text}</pre>
                <p className="mt-6 text-xs text-red-600 font-medium border-t pt-2 border-gray-100">⚠️ {t('content_area_warning')}</p>
            </div>
         </div>
    </div>
);

interface PdfSelectProps extends ScreenProps { data: { type: 'digest' | 'note' }; }

export const PdfSelectScreen: React.FC<PdfSelectProps> = ({ changeScreen, t, data }) => {
    const isDigest = data.type === 'digest';
    const items = isDigest ? digestNotes : pdfNotes;
    const title = isDigest ? t('digest_select_title') : t('pdf_select_title');
    const headerColor = isDigest ? 'text-yellow-700 dark:text-yellow-400' : 'text-red-700 dark:text-red-400';
    const buttonText = isDigest ? t('view_digest') : t('view_pdf_notes');

    return (
        <ScreenWrapper onBack={() => changeScreen(Screen.SimpleMode)} t={t}>
            <h2 className={`text-2xl font-bold mb-6 ${headerColor} flex items-center gap-2`}>
                {isDigest ? '📚' : '📑'} {title}
            </h2>
            <div className="space-y-4">
                {items.map(item => {
                    // Find appropriate emoji regardless of case
                    const emojiKey = Object.keys(subjectEmojis).find(k => item.subject.toLowerCase().includes(k.toLowerCase()));
                    const emoji = emojiKey ? subjectEmojis[emojiKey] : (isDigest ? '📒' : '📄');

                    return (
                        <div key={item.id} className="bg-white border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center dark:bg-gray-700">
                            <div className="flex items-center gap-3 mb-3 sm:mb-0">
                                 <span className="text-3xl">{emoji}</span>
                                 <div>
                                    <h3 className="text-lg font-extrabold text-gray-800 dark:text-gray-100 mb-1">{item.subject}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                                 </div>
                            </div>
                            <button onClick={() => changeScreen(Screen.PdfViewer, { id: item.id, type: data.type })} className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition duration-150 shadow-md transform hover:scale-105">
                                {buttonText}
                            </button>
                        </div>
                    );
                })}
            </div>
        </ScreenWrapper>
    );
};

interface PdfViewerProps {
    data: PdfViewerState;
    changeScreen: (screen: Screen, data?: any) => void;
    t: TFunction;
}

export const PdfViewerScreen: React.FC<PdfViewerProps> = ({ data, changeScreen, t }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);

    const item = useMemo(() => {
        const sourceArray = data.type === 'digest' ? digestNotes : pdfNotes;
        return sourceArray.find(i => i.id === data.id);
    }, [data.id, data.type]);

    const backScreen = Screen.PdfSelect;
    const backScreenData = { type: data.type };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 100));

    // Fix: Add timeout to prevent infinite loading state if iframe load event doesn't fire (e.g. about:blank)
    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 3000); // 3 second fallback
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!item) {
        return (
            <div className="w-full flex-grow flex flex-col bg-white text-gray-900 h-full">
                <header className="w-full bg-gray-800 text-white p-3 flex justify-between items-center shadow-md flex-shrink-0">
                    <button onClick={() => changeScreen(backScreen, backScreenData)} aria-label="Go back" className="text-white hover:text-gray-200 font-semibold flex items-center text-sm"><BackIcon /> {t('back')}</button>
                    <h2 className="text-lg font-bold">Error</h2>
                    <div className="w-20"></div>
                </header>
                <div className="flex-grow flex items-center justify-center text-red-600">{error}</div>
            </div>
        );
    }
    
    const headerColor = data.type === 'digest' ? 'bg-yellow-700' : 'bg-red-700';

    return (
        <div className="w-full flex-grow flex flex-col bg-gray-100 text-gray-900 overflow-hidden h-full relative">
            <header className={`w-full ${headerColor} text-white p-3 flex justify-between items-center shadow-md flex-shrink-0 z-20`}>
                <button onClick={() => changeScreen(backScreen, backScreenData)} aria-label="Go back" className="text-white hover:text-gray-200 font-semibold flex items-center text-sm"><BackIcon /> {t('back')}</button>
                <h2 className="text-lg font-bold truncate max-w-[60%] text-center mx-2 flex items-center justify-center gap-2">📄 {item.subject}</h2>
                <div className="flex items-center gap-2">
                     <button 
                        onClick={handleZoomOut}
                        disabled={zoom <= 100}
                        aria-label="Zoom Out"
                        className="text-white hover:text-gray-300 transition-colors disabled:opacity-50 p-1"
                    >
                        <ZoomOutIcon className="h-6 w-6" />
                    </button>
                    <button 
                        onClick={handleZoomIn}
                        disabled={zoom >= 300}
                        aria-label="Zoom In"
                        className="text-white hover:text-gray-300 transition-colors disabled:opacity-50 p-1"
                    >
                        <ZoomInIcon className="h-6 w-6" />
                    </button>
                </div>
            </header>
            
            <div className="flex-grow relative w-full bg-white z-10">
                 <div className="absolute inset-0 overflow-auto custom-scroll">
                    {isLoading && (
                         <div className="absolute inset-0 flex flex-col justify-center items-center z-30 bg-white">
                            <dotlottie-wc src="https://lottie.host/5b0e3f12-e11c-4216-9d01-a431604ce539/r8437WbDKT.lottie" style={{ width: '150px', height: '150px' }} autoplay loop></dotlottie-wc>
                            <p className="text-gray-600 mt-4">{t('pdf_viewer_title')} {t('loading_msg')}</p>
                        </div>
                    )}
                    {error && <div className="absolute inset-0 flex items-center justify-center text-red-600 bg-white px-4 text-center z-30">{error}</div>}
                    
                    <iframe
                        src={item.url}
                        style={{ width: `${zoom}%`, minWidth: '100%', height: '100%', display: 'block', border: 'none' }}
                        title="PDF Viewer"
                        className={`block transition-opacity duration-300 ${isLoading || error ? 'opacity-0' : 'opacity-100'}`}
                        allow="autoplay; encrypted-media"
                        onLoad={() => setIsLoading(false)}
                    ></iframe>
                 </div>
            </div>
        </div>
    );
};
