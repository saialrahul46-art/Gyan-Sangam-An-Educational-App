import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Screen, Theme, UserProfile, UserPreferences, PdfViewerState, Content } from './types';
import { translations } from './constants';
import { Header, LoadingOverlay, AdModal, PdfWarningModal, ProfileModal, MenuModal, FeedbackModal, AboutModal, OfflineIndicator, DisclaimerModal } from './components/UI';
import {
    LanguageSelectScreen, OnboardingScreen, HomeScreen, ExtraModeScreen, SimpleModeScreen,
    AITranslatorScreen, NotesListScreen, ContentViewerScreen, PdfSelectScreen, PdfViewerScreen, ThemeSettingsScreen
} from './components/Screens';
import type { User } from 'firebase/auth';
import type { Firestore, DocumentReference, DocumentSnapshot } from 'firebase/firestore';


// --- Firebase Initialization ---

const getFirebaseServices = async () => {
    try {
        const firebase = await import('firebase/app');
        const auth = await import('firebase/auth');
        const firestore = await import('firebase/firestore');

        const configStr = (typeof __firebase_config !== 'undefined') ? __firebase_config : null;
        const firebaseConfig = configStr ? JSON.parse(configStr) : null;

        if (!firebaseConfig) {
            console.warn("Firebase config not found. App will run in a disconnected state.");
            return null;
        }

        const app = firebase.initializeApp(firebaseConfig);
        const firebaseAuth = auth.getAuth(app);
        const db = firestore.getFirestore(app);

        return { firebase, auth, firestore, firebaseAuth, db };
    } catch (error) {
        console.error("Failed to initialize Firebase:", error);
        return null;
    }
};

const firebaseServicesPromise = getFirebaseServices();

// --- Local Data Helpers ---

const getInitialLocalState = () => {
    try {
        const localPrefsStr = localStorage.getItem('user_preferences');
        const localProfileStr = localStorage.getItem('user_profile');
        
        let prefs: Partial<UserPreferences> | null = null;
        let profile: UserProfile | null = null;

        if (localPrefsStr) prefs = JSON.parse(localPrefsStr);
        if (localProfileStr) profile = JSON.parse(localProfileStr);

        return { prefs, profile };
    } catch (e) {
        console.error("Error reading local storage", e);
        return { prefs: null, profile: null };
    }
};

export default function App() {
    // --- Synchronous State Initialization ---
    // We initialize state lazily function to read LocalStorage BEFORE the first render.
    // This prevents the "Loading" flash at startup.
    const [initialData] = useState(getInitialLocalState);

    const [screen, setScreen] = useState<Screen>(() => {
        if (initialData.prefs?.language) {
            if (initialData.profile?.username) {
                return Screen.Home;
            }
            return Screen.Onboarding;
        }
        return Screen.LanguageSelect;
    });

    const [screenData, setScreenData] = useState<any>(null);
    
    // Theme State
    const [theme, setTheme] = useState<Theme>(() => {
        if (initialData.prefs && !initialData.prefs.useSystemTheme && initialData.prefs.theme) {
            return initialData.prefs.theme;
        }
        return 'light';
    });

    const [useSystemTheme, setUseSystemTheme] = useState(() => {
        if (initialData.prefs && initialData.prefs.useSystemTheme !== undefined) {
            return initialData.prefs.useSystemTheme;
        }
        return true;
    });

    const [lang, setLang] = useState(() => initialData.prefs?.language || 'en');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(initialData.profile);
    
    const [userId, setUserId] = useState<string | null>(null);
    const [isAdModalOpen, setIsAdModalOpen] = useState(false);
    const [isPdfWarningOpen, setIsPdfWarningOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
    const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
    
    // Start loading only if we are waiting for something critical (usually only happens on very first open)
    const [isLoading, setIsLoading] = useState(false); 
    const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);
    const [appOpens, setAppOpens] = useState(0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    // --- Translation Function ---
    const t = useCallback((key: string) => {
        return translations[lang]?.[key] || translations['en'][key] || key;
    }, [lang]);

    // --- Helper for Local Persistence ---
    const persistLocal = (key: string, data: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) { console.error("Local save failed", e); }
    };

    // --- User Data Management ---
    const saveUserPreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
        const currentPrefs = { language: lang, theme: theme, useSystemTheme, ...prefs };
        persistLocal('user_preferences', currentPrefs);

        const services = await firebaseServicesPromise;
        if (services && services.db && userId && userId !== 'offline_user') {
            try {
                const { firestore } = services;
                const prefsDocRef = firestore.doc(services.db, 'users', userId, 'settings', 'preferences');
                await firestore.setDoc(prefsDocRef, prefs, { merge: true });
            } catch (error) { console.error("Error saving preferences:", error); }
        }
    }, [userId, lang, theme, useSystemTheme]);

    // --- Connectivity Logic ---
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // --- Theming Logic ---
    useEffect(() => {
        if (!useSystemTheme) return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const applySystemTheme = (matches: boolean) => {
            const newTheme = matches ? 'dark' : 'light';
            if (theme !== newTheme) {
                setTheme(newTheme);
            }
        };
        applySystemTheme(mediaQuery.matches);
        const handleChange = (e: MediaQueryListEvent) => applySystemTheme(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [useSystemTheme, theme]);

    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        setUseSystemTheme(false); 
        persistLocal('user_preferences', { language: lang, theme: newTheme, useSystemTheme: false });
        saveUserPreferences({ theme: newTheme, useSystemTheme: false });
    }, [theme, saveUserPreferences, lang]);

    const toggleSystemTheme = useCallback(() => {
        const newVal = !useSystemTheme;
        setUseSystemTheme(newVal);
        persistLocal('user_preferences', { language: lang, theme: theme, useSystemTheme: newVal });
        saveUserPreferences({ useSystemTheme: newVal });
    }, [useSystemTheme, theme, lang, saveUserPreferences]);

    useEffect(() => {
        document.documentElement.classList.remove(theme === 'light' ? 'dark' : 'light');
        document.documentElement.classList.add(theme);
    }, [theme]);

    // --- Navigation ---
    const changeScreen = useCallback((newScreen: Screen, data: any = null) => {
        setScreenData(data); // Set data first to prevent race condition in render
        setScreen(newScreen);
        window.scrollTo(0, 0);
    }, []);

    // --- Async Initialization (Firebase & Background Sync) ---
    useEffect(() => {
        // App Opens Counter
        const storedOpens = localStorage.getItem('app_opens');
        const count = storedOpens ? parseInt(storedOpens, 10) : 0;
        const newCount = count + 1;
        localStorage.setItem('app_opens', newCount.toString());
        setAppOpens(newCount);

        const disclaimerAccepted = localStorage.getItem('simple_mode_disclaimer_accepted') === 'true';
        setHasAcceptedDisclaimer(disclaimerAccepted);

        // Firebase Background Logic
        const init = async () => {
            const services = await firebaseServicesPromise;
            
            if (!services) {
                setUserId('offline_user');
                return;
            }

            services.auth.onAuthStateChanged(services.firebaseAuth, async (user: User | null) => {
                if (user) {
                    setUserId(user.uid);
                    
                    // Fetch remote data silently to keep UI responsive
                    try {
                        const { firestore } = services;
                        const prefsRef = firestore.doc(services.db, 'users', user.uid, 'settings', 'preferences');
                        const profileRef = firestore.doc(services.db, 'users', user.uid, 'settings', 'profile');

                        const [prefsSnap, profileSnap] = await Promise.all([
                            firestore.getDoc(prefsRef),
                            firestore.getDoc(profileRef)
                        ]);
                        
                        const remotePrefs = prefsSnap.exists() ? prefsSnap.data() as UserPreferences : null;
                        const remoteProfile = profileSnap.exists() ? profileSnap.data() as UserProfile : null;

                        // Sync Remote to Local & State if remote is newer or exists
                        if (remotePrefs) {
                            if (remotePrefs.useSystemTheme !== undefined) setUseSystemTheme(remotePrefs.useSystemTheme);
                            if (remotePrefs.theme && (!remotePrefs.useSystemTheme)) setTheme(remotePrefs.theme);
                            if (remotePrefs.language) setLang(remotePrefs.language);
                            persistLocal('user_preferences', remotePrefs);
                        }
                        if (remoteProfile) {
                            setUserProfile(remoteProfile);
                            persistLocal('user_profile', remoteProfile);
                        }
                    } catch (err) {
                        console.error("Data fetch error", err);
                    }
                } else {
                    try {
                        const authToken = (typeof __initial_auth_token !== 'undefined') ? __initial_auth_token : null;
                        if (authToken) {
                            await services.auth.signInWithCustomToken(services.firebaseAuth, authToken);
                        } else {
                            await services.auth.signInAnonymously(services.firebaseAuth);
                        }
                    } catch (authError) {
                        console.error("Authentication failed:", authError);
                        setUserId('auth_failed');
                    }
                }
            });
        };
        init();
    }, []); // Run once on mount


    const handleLanguageConfirm = useCallback((chosenLang: string) => {
        setLang(chosenLang);
        persistLocal('user_preferences', { language: chosenLang, theme: theme, useSystemTheme });
        saveUserPreferences({ language: chosenLang });
        
        if (userProfile) {
            changeScreen(Screen.Home);
        } else {
            changeScreen(Screen.Onboarding);
        }
    }, [saveUserPreferences, userProfile, changeScreen, theme, useSystemTheme]);

    const handleOnboardingComplete = useCallback(async (profile: UserProfile) => {
        setUserProfile(profile);
        persistLocal('user_profile', profile);
        
        // Short loading state for onboarding completion effect
        setIsLoading(true);

        const services = await firebaseServicesPromise;
        if (services && services.db && userId && userId !== 'offline_user') {
             try {
                const { firestore } = services;
                const profileDocRef = firestore.doc(services.db, 'users', userId, 'settings', 'profile');
                await firestore.setDoc(profileDocRef, profile);
             } catch (error) { console.error("Error saving profile:", error); }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
    }, [userId]);
    
    const handleFeedbackSubmit = useCallback(async (feedback: string) => {
        const services = await firebaseServicesPromise;
        if (services && services.db && userId && userId !== 'offline_user') {
            try {
                const { firestore, db } = services;
                const feedbackColRef = firestore.collection(db, 'feedback');
                await firestore.addDoc(feedbackColRef, {
                    userId: userId,
                    profile: userProfile,
                    feedback: feedback,
                    timestamp: firestore.serverTimestamp(),
                    appVersion: '1.0.0'
                });
            } catch (error) {
                console.error("Error submitting feedback:", error);
            }
        }
    }, [userId, userProfile]);

    const handleSimpleModeClick = () => {
        if (hasAcceptedDisclaimer) {
            changeScreen(Screen.SimpleMode);
        } else {
            setIsDisclaimerOpen(true);
        }
    };

    const handleDisclaimerConfirm = () => {
        localStorage.setItem('simple_mode_disclaimer_accepted', 'true');
        setHasAcceptedDisclaimer(true);
        setIsDisclaimerOpen(false);
        changeScreen(Screen.SimpleMode);
    };

    const renderScreen = () => {
        const props = { changeScreen, t, lang };
        let Component = null;
        switch (screen) {
            case Screen.LanguageSelect: Component = <LanguageSelectScreen onConfirm={handleLanguageConfirm} userId={userId} changeScreen={changeScreen} />; break;
            case Screen.Onboarding: Component = <OnboardingScreen {...props} onComplete={handleOnboardingComplete} />; break;
            case Screen.Home: Component = <HomeScreen {...props} username={userProfile?.username || null} appOpens={appOpens} theme={theme} toggleTheme={toggleTheme} onSimpleModeClick={handleSimpleModeClick} />; break;
            case Screen.ExtraMode: Component = <ExtraModeScreen {...props} />; break;
            case Screen.SimpleMode: Component = <SimpleModeScreen {...props} />; break;
            case Screen.AITranslator: Component = <AITranslatorScreen {...props} />; break;
            case Screen.NotesList: Component = <NotesListScreen {...props} data={screenData as { subject: string }} />; break;
            case Screen.ContentViewer: Component = <ContentViewerScreen {...props} data={screenData as { content: Content, subject: string }} />; break;
            case Screen.PdfSelect: Component = <PdfSelectScreen {...props} data={screenData as { type: 'digest' | 'note' }} />; break;
            case Screen.PdfViewer: Component = <PdfViewerScreen data={screenData as PdfViewerState} changeScreen={changeScreen} t={t} />; break;
            case Screen.ThemeSettings: Component = <ThemeSettingsScreen {...props} theme={theme} toggleTheme={toggleTheme} useSystemTheme={useSystemTheme} toggleSystemTheme={toggleSystemTheme} />; break;
            default: return null;
        }
        return (
            <div key={screen} className="w-full flex-grow flex flex-col animate-page-enter">
                {Component}
            </div>
        );
    };

    const showHeader = useMemo(() => ![Screen.Loading, Screen.LanguageSelect, Screen.Onboarding, Screen.PdfViewer].includes(screen), [screen]);

    return (
        <div className={`w-full max-w-lg mx-auto min-h-screen ${screen === Screen.Onboarding ? '' : 'bg-white dark:bg-gray-800'} shadow-lg flex flex-col transition-colors duration-300 relative`}>
            {isLoading && <LoadingOverlay t={t} message={loadingMessage} />}
            
            <AdModal t={t} isOpen={isAdModalOpen} onClose={() => setIsAdModalOpen(false)} />
            <PdfWarningModal t={t} isOpen={isPdfWarningOpen} onClose={() => setIsPdfWarningOpen(false)} />
            <ProfileModal t={t} isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} profile={userProfile} userId={userId} />
            <AboutModal t={t} isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
            <DisclaimerModal isOpen={isDisclaimerOpen} onConfirm={handleDisclaimerConfirm} />
            <FeedbackModal
                t={t}
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
                onSubmit={handleFeedbackSubmit}
            />

            {showHeader && <Header t={t} showMenuButton={true} onMenuClick={() => setIsMenuOpen(prev => !prev)} />}
            
            <MenuModal
                t={t}
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onProfileClick={() => {
                    setIsMenuOpen(false);
                    setIsProfileModalOpen(true);
                }}
                onFeedbackClick={() => {
                    setIsMenuOpen(false);
                    setIsFeedbackModalOpen(true);
                }}
                onAboutClick={() => {
                    setIsMenuOpen(false);
                    setIsAboutModalOpen(true);
                }}
                onThemeSettingsClick={() => {
                    setIsMenuOpen(false);
                    changeScreen(Screen.ThemeSettings);
                }}
                theme={theme}
            />
            
            <main className="flex-grow flex flex-col w-full">
                {renderScreen()}
            </main>
            {!isOnline && <OfflineIndicator />}
        </div>
    );
}