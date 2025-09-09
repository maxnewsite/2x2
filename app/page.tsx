'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppStore, useInputData, useAnalysisData } from '@/lib/store';
import { processFile, validateFile } from '@/lib/fileProcessor';
import { combineFileContents } from '@/lib/fileProcessor';
import { DOMAIN_CONFIGS, generateId } from '@/lib/utils';
import AnalysisResults from '@/components/AnalysisResults';
import { 
  CloudArrowUpIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  PlayIcon,
  XMarkIcon,
  InformationCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  const {
    inputText,
    uploadedFiles,
    selectedDomain,
    customAxes,
    canAnalyze,
    totalCharacters
  } = useInputData();

  const { isAnalyzing, analysisResult, analysisError } = useAnalysisData();

  const {
    setInputText,
    setSelectedDomain,
    setCustomAxes,
    addFile,
    removeFile,
    setActiveTab,
    activeTab,
    showAdvancedOptions,
    setShowAdvancedOptions,
    clearAnalysis,
    setAnalyzing,
    setAnalysisResult,
    setAnalysisError
  } = useAppStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    setProcessingMessage('Processing files...');

    for (const file of acceptedFiles) {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        const fileId = generateId();
        setProcessingMessage(`Processing ${file.name}...`);
        
        const processedFile = await processFile(file, fileId);
        
        addFile({
          id: processedFile.id,
          name: processedFile.name,
          size: processedFile.size,
          type: processedFile.type,
          content: processedFile.content,
          preview: processedFile.preview
        });
        
      } catch (error) {
        console.error('File processing error:', error);
        alert(`Failed to process ${file.name}: ${error}`);
      }
    }

    setIsProcessing(false);
    setProcessingMessage('');
    
    // Switch to files tab if files were added
    if (acceptedFiles.length > 0) {
      setActiveTab('files');
    }
  }, [addFile, setActiveTab]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const handleAnalyze = async () => {
    if (!canAnalyze || isAnalyzing) return;

    setAnalyzing(true);
    clearAnalysis();

    try {
      // Combine text from input and files
      let combinedText = inputText.trim();
      
      if (uploadedFiles.length > 0) {
        const filesText = combineFileContents(uploadedFiles);
        combinedText = combinedText 
          ? `${combinedText}\n\n${filesText}`
          : filesText;
      }

      const requestBody = {
        text: combinedText,
        domain_hint: selectedDomain,
        force_axes: customAxes.x && customAxes.y ? customAxes : undefined
      };

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      setAnalysisResult(result);

    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError(
        error instanceof Error 
          ? error.message 
          : 'Analysis failed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Il Mondo in Due Dimensioni
                </h1>
                <p className="text-sm text-gray-600">
                  Transform complex information into clear 2x2 matrices
                </p>
              </div>
            </div>
            
            {!analysisResult && (
              <div className="text-sm text-gray-500">
                {totalCharacters.toLocaleString()} characters loaded
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisResult ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full">
                  <SparklesIcon className="w-12 h-12 text-primary-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Discover Patterns in Your Data
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Upload documents or paste text to automatically identify the most meaningful 
                variables and visualize relationships in an intuitive 2x2 matrix.
              </p>
            </div>

            {/* Input Interface */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200 bg-gray-50">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'text'
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                    Text Input
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'files'
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <DocumentIcon className="w-4 h-4 inline mr-2" />
                    File Upload ({uploadedFiles.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'settings'
                        ? 'text-primary-600 border-b-2 border-primary-600 bg-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Cog6ToothIcon className="w-4 h-4 inline mr-2" />
                    Settings
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'text' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paste your text content
                      </label>
                      <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Paste reports, documents, or any text you'd like to analyze. The AI will automatically identify entities and the most meaningful variables for visualization..."
                        className="form-textarea h-64"
                        maxLength={50000}
                      />
                      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                        <span>AI works best with 100+ characters of content</span>
                        <span>{inputText.length.toLocaleString()} / 50,000</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="space-y-6">
                    {/* File Upload Area */}
                    <div
                      {...getRootProps()}
                      className={`dropzone relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                        isDragActive 
                          ? 'border-primary-400 bg-primary-50' 
                          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {isDragActive ? 'Drop files here' : 'Upload documents'}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Drag and drop files here, or click to browse
                      </p>
                      <div className="text-xs text-gray-400">
                        Supports PDF, DOCX, DOC, TXT • Max 10MB per file
                      </div>
                      
                      {(isProcessing || isAnalyzing) && (
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">{processingMessage || 'Processing...'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-900">Uploaded Files</h3>
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <DocumentIcon className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024).toFixed(1)} KB • {file.preview && `${file.preview.length} chars`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    {/* Domain Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Analysis Domain
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.values(DOMAIN_CONFIGS).map((domain) => (
                          <button
                            key={domain.id}
                            onClick={() => setSelectedDomain(domain.id)}
                            className={`p-4 text-left rounded-lg border transition-all ${
                              selectedDomain === domain.id
                                ? 'border-primary-300 bg-primary-50 text-primary-900'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <h4 className="font-medium mb-1">{domain.name}</h4>
                            <p className="text-sm text-gray-600">{domain.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <div>
                      <button
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        className="flex items-center space-x-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        <span>Advanced Options</span>
                      </button>

                      {showAdvancedOptions && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Force X-axis variable
                              </label>
                              <input
                                type="text"
                                value={customAxes.x || ''}
                                onChange={(e) => setCustomAxes({ x: e.target.value || undefined })}
                                placeholder="e.g., Risk, Importance, Cost"
                                className="form-input"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Force Y-axis variable
                              </label>
                              <input
                                type="text"
                                value={customAxes.y || ''}
                                onChange={(e) => setCustomAxes({ y: e.target.value || undefined })}
                                placeholder="e.g., Impact, Urgency, Benefit"
                                className="form-input"
                              />
                            </div>
                          </div>
                          <div className="flex items-start space-x-2 text-xs text-gray-600">
                            <InformationCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>
                              Leave blank to let AI automatically select the most informative variables. 
                              Use custom variables when you have specific dimensions in mind.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="border-t bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {canAnalyze 
                      ? `Ready to analyze ${totalCharacters.toLocaleString()} characters`
                      : 'Add text or files to begin analysis'
                    }
                  </div>
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={!canAnalyze || isAnalyzing}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      canAnalyze && !isAnalyzing
                        ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-4 h-4" />
                        <span>Create Matrix</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {analysisError && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <XMarkIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-900">Analysis Error</h3>
                    <p className="text-sm text-red-700 mt-1">{analysisError}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analysis Complete</h2>
                <p className="text-gray-600">Your 2x2 matrix is ready for exploration</p>
              </div>
              <button
                onClick={() => {
                  clearAnalysis();
                }}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>New Analysis</span>
              </button>
            </div>

            {/* Results */}
            <AnalysisResults result={analysisResult} />
          </>
        )}
      </main>
    </div>
  );
}