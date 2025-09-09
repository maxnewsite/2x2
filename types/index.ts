export interface AnalysisItem {
  name: string;
  x: number;
  y: number;
  confidence: number;
  rationale: string;
  citations: string[];
}

export interface Quadrant {
  id: string;
  name: string;
  description: string;
  implication: string;
  rule: string;
  color: string;
}

export interface Axes {
  x: string;
  y: string;
  rationale: string;
}

export interface AnalysisResult {
  axes: Axes;
  items: AnalysisItem[];
  quadrants: Quadrant[];
  insights: string[];
  metadata: {
    processing_time: number;
    confidence: number;
  };
}

export interface AnalysisRequest {
  text?: string;
  files?: string[];
  domain_hint?: 'risk' | 'priority' | 'investments' | 'sports' | 'auto';
  force_axes?: {
    x?: string;
    y?: string;
  };
}

export type Domain = 
  | 'risk'
  | 'priority' 
  | 'investments'
  | 'sports'
  | 'auto';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: string;
  preview?: string;
}

export interface AppState {
  // Input state
  inputText: string;
  uploadedFiles: UploadedFile[];
  selectedDomain: Domain;
  customAxes: {
    x?: string;
    y?: string;
  };
  
  // Analysis state
  isAnalyzing: boolean;
  analysisProgress: number;
  analysisResult: AnalysisResult | null;
  analysisError: string | null;
  
  // UI state
  activeTab: 'text' | 'files' | 'settings';
  showAdvancedOptions: boolean;
  exportFormat: 'png' | 'svg' | 'pdf' | 'csv';
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'csv';
  includeInsights: boolean;
  includeDataTable: boolean;
  filename?: string;
}

export interface DomainConfig {
  id: Domain;
  name: string;
  description: string;
  commonAxes: {
    x: string[];
    y: string[];
  };
  examples: string[];
}

export interface ProcessingStatus {
  stage: 'uploading' | 'extracting' | 'analyzing' | 'positioning' | 'finalizing';
  progress: number;
  message: string;
}