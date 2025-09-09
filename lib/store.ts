import { create } from 'zustand';
import { AppState, UploadedFile, AnalysisResult, Domain, ExportOptions, ProcessingStatus } from '@/types';

interface AppStore extends AppState {
  // Actions
  setInputText: (text: string) => void;
  setSelectedDomain: (domain: Domain) => void;
  setCustomAxes: (axes: { x?: string; y?: string }) => void;
  setActiveTab: (tab: 'text' | 'files' | 'settings') => void;
  setShowAdvancedOptions: (show: boolean) => void;
  setExportFormat: (format: 'png' | 'svg' | 'pdf' | 'csv') => void;
  
  // File management
  addFile: (file: UploadedFile) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  updateFile: (fileId: string, updates: Partial<UploadedFile>) => void;
  
  // Analysis management
  setAnalyzing: (analyzing: boolean) => void;
  setAnalysisProgress: (progress: number) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setAnalysisError: (error: string | null) => void;
  clearAnalysis: () => void;
  
  // Utility actions
  reset: () => void;
  canAnalyze: () => boolean;
  getTotalCharacters: () => number;
}

const initialState: AppState = {
  inputText: '',
  uploadedFiles: [],
  selectedDomain: 'auto',
  customAxes: {},
  
  isAnalyzing: false,
  analysisProgress: 0,
  analysisResult: null,
  analysisError: null,
  
  activeTab: 'text',
  showAdvancedOptions: false,
  exportFormat: 'png',
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  // Input actions
  setInputText: (text: string) => 
    set({ inputText: text }),
  
  setSelectedDomain: (domain: Domain) =>
    set({ selectedDomain: domain }),
  
  setCustomAxes: (axes: { x?: string; y?: string }) =>
    set((state) => ({ 
      customAxes: { ...state.customAxes, ...axes } 
    })),
  
  setActiveTab: (tab: 'text' | 'files' | 'settings') =>
    set({ activeTab: tab }),
  
  setShowAdvancedOptions: (show: boolean) =>
    set({ showAdvancedOptions: show }),
  
  setExportFormat: (format: 'png' | 'svg' | 'pdf' | 'csv') =>
    set({ exportFormat: format }),

  // File management
  addFile: (file: UploadedFile) =>
    set((state) => ({ 
      uploadedFiles: [...state.uploadedFiles, file] 
    })),
  
  removeFile: (fileId: string) =>
    set((state) => ({
      uploadedFiles: state.uploadedFiles.filter(f => f.id !== fileId)
    })),
  
  clearFiles: () =>
    set({ uploadedFiles: [] }),
  
  updateFile: (fileId: string, updates: Partial<UploadedFile>) =>
    set((state) => ({
      uploadedFiles: state.uploadedFiles.map(f => 
        f.id === fileId ? { ...f, ...updates } : f
      )
    })),

  // Analysis management
  setAnalyzing: (analyzing: boolean) =>
    set({ isAnalyzing: analyzing }),
  
  setAnalysisProgress: (progress: number) =>
    set({ analysisProgress: Math.min(100, Math.max(0, progress)) }),
  
  setAnalysisResult: (result: AnalysisResult | null) =>
    set({ 
      analysisResult: result,
      isAnalyzing: false,
      analysisProgress: result ? 100 : 0,
      analysisError: null 
    }),
  
  setAnalysisError: (error: string | null) =>
    set({ 
      analysisError: error,
      isAnalyzing: false,
      analysisProgress: 0 
    }),
  
  clearAnalysis: () =>
    set({ 
      analysisResult: null, 
      analysisError: null,
      analysisProgress: 0,
      isAnalyzing: false 
    }),

  // Utility actions
  reset: () =>
    set(initialState),
  
  canAnalyze: () => {
    const state = get();
    const hasText = state.inputText.trim().length > 10;
    const hasFiles = state.uploadedFiles.some(f => f.content && f.content.length > 10);
    return !state.isAnalyzing && (hasText || hasFiles);
  },
  
  getTotalCharacters: () => {
    const state = get();
    const textChars = state.inputText.length;
    const fileChars = state.uploadedFiles.reduce((total, file) => 
      total + (file.content?.length || 0), 0
    );
    return textChars + fileChars;
  },
}));

// Selectors for common computed values
export const useInputData = () => {
  const store = useAppStore();
  return {
    inputText: store.inputText,
    uploadedFiles: store.uploadedFiles,
    selectedDomain: store.selectedDomain,
    customAxes: store.customAxes,
    canAnalyze: store.canAnalyze(),
    totalCharacters: store.getTotalCharacters(),
  };
};

export const useAnalysisData = () => {
  const store = useAppStore();
  return {
    isAnalyzing: store.isAnalyzing,
    analysisProgress: store.analysisProgress,
    analysisResult: store.analysisResult,
    analysisError: store.analysisError,
  };
};

export const useUIState = () => {
  const store = useAppStore();
  return {
    activeTab: store.activeTab,
    showAdvancedOptions: store.showAdvancedOptions,
    exportFormat: store.exportFormat,
    setActiveTab: store.setActiveTab,
    setShowAdvancedOptions: store.setShowAdvancedOptions,
    setExportFormat: store.setExportFormat,
  };
};

// Persist store to localStorage
export const persistStore = () => {
  const state = useAppStore.getState();
  const persistedState = {
    inputText: state.inputText,
    uploadedFiles: state.uploadedFiles,
    selectedDomain: state.selectedDomain,
    customAxes: state.customAxes,
    showAdvancedOptions: state.showAdvancedOptions,
    exportFormat: state.exportFormat,
  };
  
  try {
    localStorage.setItem('il-mondo-2d-state', JSON.stringify(persistedState));
  } catch (error) {
    console.warn('Failed to persist state to localStorage:', error);
  }
};

// Load store from localStorage
export const loadPersistedState = (): Partial<AppState> | null => {
  try {
    const stored = localStorage.getItem('il-mondo-2d-state');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that the stored data has the expected structure
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Failed to load persisted state:', error);
  }
  return null;
};

// Initialize store with persisted state if available
if (typeof window !== 'undefined') {
  const persistedState = loadPersistedState();
  if (persistedState) {
    useAppStore.setState(persistedState, false);
  }
  
  // Auto-persist on state changes
  useAppStore.subscribe((state) => {
    // Debounce persistence to avoid too many writes
    setTimeout(persistStore, 1000);
  });
}