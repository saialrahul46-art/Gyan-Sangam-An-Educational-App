
export enum Screen {
  Loading = 'loading',
  LanguageSelect = 'language_select',
  Onboarding = 'onboarding',
  Home = 'home',
  ExtraMode = 'extra_mode',
  SimpleMode = 'simple_mode',
  AITranslator = 'ai_translator',
  NotesList = 'notes_list',
  ContentViewer = 'content_viewer',
  PdfSelect = 'pdf_select',
  PdfViewer = 'pdf_viewer',
  ThemeSettings = 'theme_settings',
}

export type Theme = 'light' | 'dark';

export interface UserProfile {
  username: string;
  school: string;
  standard: string;
}

export interface UserPreferences {
  language: string;
  theme: Theme;
  useSystemTheme?: boolean;
}

export interface Note {
  id: number;
  subject: string;
  description: string;
  url: string;
}

export interface Kavita {
  id: number;
  title: string;
  appreciation: string;
}

export interface Content {
    type: 'rasagran' | 'lesson_qna' | 'kavita';
    title: string;
    text: string;
}

export type PdfType = 'digest' | 'note';

export interface PdfViewerState {
    id: number;
    type: PdfType;
}

export interface TranslationHistoryItem {
    input: string;
    output: string;
    source: string;
    target: string;
}