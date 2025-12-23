
import React, { useState, useEffect } from 'react';
import { Theme, UserProfile } from '../types';
import { SunIcon, MoonIcon, MenuIcon, UserIcon, FeedbackIcon, SuccessIcon, InfoIcon } from './Icons';
import { escapeHTML } from '../constants';

type TFunction = (key: string) => string;

interface HeaderProps {
  t: TFunction;
  // Theme toggle removed from header as per request
  showMenuButton: boolean;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ t, showMenuButton, onMenuClick }) => (
  <header className="w-full p-2.5 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30 flex justify-between items-center dark:bg-gray-800 dark:border-b-gray-700 transition-colors duration-300">
    <div className="w-12 h-10 flex items-center justify-start">
        {showMenuButton && (
            <button 
                onClick={onMenuClick} 
                aria-label="Open menu"
                className="ml-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md transition-all duration-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
                <MenuIcon className="h-5 w-5" />
            </button>
        )}
    </div>
    <div className="flex-grow flex justify-center">
      <h1 className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 text-center flex flex-col leading-none">
        <span className="text-xl flex items-center justify-center gap-2">🎓 Gyan Sangam</span>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">/ {t('app_name')}</span>
      </h1>
    </div>
    <div className="w-12 h-10 flex items-center justify-end">
        {/* Theme toggle removed */}
    </div>
  </header>
);

export const OfflineIndicator: React.FC = () => (
    <div className="sticky bottom-0 w-full bg-gray-800 dark:bg-gray-700 text-white text-xs font-medium py-1.5 text-center z-40 animate-fade-in opacity-95 backdrop-blur-sm border-t border-gray-700 dark:border-gray-600">
        📡 You are currently offline
    </div>
);

interface LoadingOverlayProps {
  t: TFunction;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ t, message }) => (
  <div className="fixed inset-0 flex flex-col justify-center items-center z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm transition-opacity duration-300">
    <dotlottie-wc
      src="https://lottie.host/5b0e3f12-e11c-4216-9d01-a431604ce539/r8437WbDKT.lottie"
      style={{ width: '150px', height: '150px', marginBottom: '1rem' }}
      autoplay
      loop
    ></dotlottie-wc>
    <div className="text-gray-600 text-center dark:text-gray-300 px-4">{message || t('loading_msg')}</div>
  </div>
);

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    children: React.ReactNode;
    zIndex?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, children, zIndex = 'z-40' }) => {
    if (!isOpen) return null;
    return (
        <div className={`fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center ${zIndex} animate-fade-in`}>
            {children}
        </div>
    );
};

interface AdModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: TFunction;
}
export const AdModal: React.FC<AdModalProps> = ({ isOpen, onClose, t }) => (
    <Modal isOpen={isOpen} zIndex="z-50">
        <div className="bg-white p-6 rounded-xl shadow-2xl m-4 w-11/12 max-w-sm dark:bg-gray-800 transition-colors duration-300">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">📢 {t('ad_title')}</h2>
            <div className="h-32 bg-gray-200 flex items-center justify-center rounded-lg mb-4 border border-dashed border-gray-400 dark:bg-gray-700 dark:border-gray-600">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('ad_placeholder')}</p>
            </div>
            <button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-150 shadow-md">
                {t('continue')}
            </button>
        </div>
    </Modal>
);

interface PdfWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: TFunction;
}
export const PdfWarningModal: React.FC<PdfWarningModalProps> = ({ isOpen, onClose, t }) => (
    <Modal isOpen={isOpen} zIndex="z-40">
        <div className="bg-white p-6 rounded-xl shadow-2xl m-4 w-11/12 max-w-sm dark:bg-gray-800 transition-colors duration-300">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">⚠️ {t('pdf_viewer_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{t('pdf_warning_message')}</p>
            <button onClick={onClose} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition duration-150 shadow-md">
                {t('continue')}
            </button>
        </div>
    </Modal>
);

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: TFunction;
    profile: UserProfile | null;
    userId: string | null;
}
export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, t, profile, userId }) => {
    const [editMessage, setEditMessage] = useState<string | null>(null);

    const handleEditClick = () => {
        setEditMessage("Edit profile function will be available 2 hours later.");
    };

    return (
        <Modal isOpen={isOpen}>
            <div className="bg-white p-6 rounded-xl shadow-2xl m-4 w-11/12 max-w-sm dark:bg-gray-800 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4 text-center flex items-center justify-center gap-2">👤 {t('profile_title')}</h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{t('profile_name')}:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold text-right break-words max-w-[60%]">{escapeHTML(profile?.username)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{t('profile_school')}:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold text-right break-words max-w-[60%]">{escapeHTML(profile?.school)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{t('profile_standard')}:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold">{escapeHTML(profile?.standard)}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">User ID:</span>
                        <p className="text-xs font-mono text-blue-500 dark:text-blue-400 break-all mt-1">{escapeHTML(userId)}</p>
                    </div>
                </div>

                {editMessage && (
                    <div className="mt-4 p-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded text-center text-sm text-yellow-800 dark:text-yellow-200 animate-fade-in">
                        ⏳ {editMessage}
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                     <button onClick={handleEditClick} className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-300 shadow-md flex items-center justify-center gap-2">
                        ✏️ Edit Profile
                    </button>
                    <button onClick={onClose} className="w-full p-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold rounded-lg transition duration-300 shadow-md">
                        {t('back')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: TFunction;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, t }) => (
    <Modal isOpen={isOpen}>
        <div className="bg-white p-6 rounded-xl shadow-2xl m-4 w-11/12 max-w-sm max-h-[85vh] overflow-y-auto custom-scroll dark:bg-gray-800 transition-colors duration-300 flex flex-col">
            <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400 mb-4 text-center flex items-center justify-center gap-2">
                ℹ️ {t('about_us')}
            </h2>
            
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
                <div className="text-center">
                    <h3 className="text-lg font-extrabold text-blue-600 dark:text-blue-400">Gyan Sangam</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('version')}: 1.0.0</p>
                </div>

                <div>
                    <p className="text-sm leading-relaxed text-justify">
                        {t('about_app_desc')}
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-indigo-600 dark:text-indigo-300 mb-2 text-sm flex items-center gap-2">
                        📚 {t('simple_mode').split(':')[0]}
                    </h4>
                    <p className="text-xs leading-relaxed">
                        {t('about_simple_mode').split(':')[1]}
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-green-600 dark:text-green-300 mb-2 text-sm flex items-center gap-2">
                        🎒 {t('extra_mode').split(':')[0]}
                    </h4>
                    <p className="text-xs leading-relaxed">
                        {t('about_extra_mode').split(':')[1]}
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <button onClick={onClose} className="w-full p-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-bold rounded-lg transition duration-300 shadow-md">
                    {t('back')}
                </button>
            </div>
        </div>
    </Modal>
);

interface MenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProfileClick: () => void;
    onFeedbackClick: () => void;
    onAboutClick: () => void;
    t: TFunction;
    theme: Theme;
    onThemeSettingsClick: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({ isOpen, onClose, onProfileClick, onFeedbackClick, onAboutClick, t, theme, onThemeSettingsClick }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-30" onClick={onClose}></div>
            <div className="absolute top-16 left-4 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-2xl z-40 border border-gray-200 dark:border-gray-600 animate-fade-in-down p-2">
                <ul className="space-y-1">
                    <li>
                        <button onClick={onProfileClick} className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors">
                            <UserIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                            {t('profile_title')}
                        </button>
                    </li>
                    <li>
                        <button onClick={onThemeSettingsClick} className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors">
                             {theme === 'light' ? <MoonIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" /> : <SunIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />}
                             {t('dark_mode_label')}
                        </button>
                    </li>
                    <li>
                        <button onClick={onFeedbackClick} className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors">
                            <FeedbackIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                            {t('feedback_button')}
                        </button>
                    </li>
                    <li>
                        <button onClick={onAboutClick} className="w-full flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors">
                            <InfoIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                            {t('about_us')}
                        </button>
                    </li>
                </ul>
            </div>
        </>
    );
};

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (feedback: string) => Promise<void>;
    t: TFunction;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, t }) => {
    const [feedbackText, setFeedbackText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        if (feedbackText.trim().length < 10) {
            return;
        }
        setIsSubmitting(true);
        await onSubmit(feedbackText);
        setIsSubmitting(false);
        setIsSuccess(true);
        setTimeout(() => {
            handleClose();
        }, 2000);
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setFeedbackText('');
            setIsSubmitting(false);
            setIsSuccess(false);
        }, 300);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="bg-white p-6 rounded-xl shadow-2xl m-4 w-11/12 max-w-md dark:bg-gray-800 transition-all duration-300 transform animate-fade-in">
                {!isSuccess ? (
                    <>
                        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-4 text-center flex items-center justify-center gap-2">💬 {t('feedback_title')}</h2>
                        <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            placeholder={t('feedback_placeholder')}
                            className="w-full h-32 p-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-0 resize-none transition-colors"
                            maxLength={1000}
                            disabled={isSubmitting}
                        />
                        <p className="text-right text-xs text-gray-400 dark:text-gray-500 mt-1">{feedbackText.length} / 1000</p>
                        <div className="mt-6 flex gap-4">
                            <button onClick={handleClose} className="w-full p-3 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-bold rounded-lg transition duration-300 shadow-sm" disabled={isSubmitting}>
                                {t('cancel_button')}
                            </button>
                            <button onClick={handleSubmit} className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition duration-300 shadow-md disabled:bg-blue-400 dark:disabled:bg-blue-800 flex items-center justify-center" disabled={isSubmitting || feedbackText.trim().length < 10}>
                                {isSubmitting ? <div className="loader"></div> : t('submit_button')}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-4">
                        <SuccessIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">{t('feedback_success_title')}</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t('feedback_success_msg')}</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

interface DisclaimerModalProps {
    isOpen: boolean;
    onConfirm: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onConfirm }) => {
    const [timeLeft, setTimeLeft] = useState(5);

    useEffect(() => {
        if (isOpen) {
            setTimeLeft(5);
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} zIndex="z-50">
             <div className="bg-white p-6 rounded-xl shadow-2xl m-4 w-11/12 max-w-sm dark:bg-gray-800 transition-colors duration-300 text-center">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Attention User</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-6 leading-relaxed font-medium text-justify">
                    "THESE MATERIALS ARE OPENLY SOURCED AND AVAILABLE ON THE INTERNET. WE ARE SIMPLY RELAYING THIS EXISTING CONTENT AND FULLY CREDIT THE ORIGINAL AUTHOR(S) FOR ITS CREATION AND UPLOAD."
                </p>
                <button
                    onClick={onConfirm}
                    disabled={timeLeft > 0}
                    className={`w-full py-3 rounded-lg font-bold shadow-md transition-all duration-200 flex items-center justify-center ${
                        timeLeft > 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {timeLeft > 0 ? `Please wait ${timeLeft}s` : 'Ok and Continue'}
                </button>
            </div>
        </Modal>
    );
};
