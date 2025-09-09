'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AnalysisResult } from '@/types';
import { useAppStore } from '@/lib/store';
import { cn, downloadAsJSON, downloadAsCSV } from '@/lib/utils';
import { 
  ChartBarIcon,
  TableCellsIcon,
  DocumentArrowDownIcon,
  PhotoIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import QuadrantLegend from './QuadrantLegend';
import DataTable from './DataTable';
import InsightsPanel from './InsightsPanel';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  )
});

interface AnalysisResultsProps {
  result: AnalysisResult;
  className?: string;
}

type ViewMode = 'chart' | 'table' | 'insights';

export default function AnalysisResults({ result, className }: AnalysisResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  const plotRef = useRef<any>(null);
  const exportFormat = useAppStore(state => state.exportFormat);

  const handleExport = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `analysis-${timestamp}`;

    switch (exportFormat) {
      case 'json':
        downloadAsJSON(result, filename);
        break;
      case 'csv':
        downloadAsCSV(result.items, filename);
        break;
      case 'png':
        if (plotRef.current && plotRef.current.plotly) {
          plotRef.current.plotly.downloadImage(plotRef.current.el, {
            format: 'png',
            width: 1200,
            height: 800,
            filename: filename
          });
        }
        break;
      case 'svg':
        if (plotRef.current && plotRef.current.plotly) {
          plotRef.current.plotly.downloadImage(plotRef.current.el, {
            format: 'svg',
            width: 1200,
            height: 800,
            filename: filename
          });
        }
        break;
    }
  };

  const plotData = [
    {
      x: result.items.map(item => item.x),
      y: result.items.map(item => item.y),
      text: result.items.map(item => item.name),
      mode: 'markers+text',
      type: 'scatter',
      textposition: 'top center',
      marker: {
        size: result.items.map(item => 12 + (item.confidence * 8)),
        color: result.items.map(item => {
          const quadrant = result.quadrants.find(q => {
            // Simple quadrant detection based on position
            const midX = 50;
            const midY = 50;
            if (q.id === 'Q1') return item.x >= midX && item.y >= midY;
            if (q.id === 'Q2') return item.x < midX && item.y >= midY;
            if (q.id === 'Q3') return item.x < midX && item.y < midY;
            if (q.id === 'Q4') return item.x >= midX && item.y < midY;
            return false;
          });
          return quadrant?.color || '#3b82f6';
        }),
        opacity: 0.8,
        line: {
          color: 'white',
          width: 2
        }
      },
      hovertemplate: 
        '<b>%{text}</b><br>' +
        `${result.axes.x}: %{x}<br>` +
        `${result.axes.y}: %{y}<br>` +
        '<extra></extra>'
    }
  ];

  const plotLayout = {
    title: {
      text: `${result.axes.x} vs ${result.axes.y}`,
      font: { size: 18, family: 'Inter, sans-serif' }
    },
    xaxis: {
      title: result.axes.x,
      range: [0, 100],
      showgrid: true,
      gridcolor: '#e5e7eb',
      zeroline: false
    },
    yaxis: {
      title: result.axes.y,
      range: [0, 100],
      showgrid: true,
      gridcolor: '#e5e7eb',
      zeroline: false
    },
    shapes: [
      // Vertical line at x=50
      {
        type: 'line',
        x0: 50,
        x1: 50,
        y0: 0,
        y1: 100,
        line: {
          color: '#9ca3af',
          width: 1,
          dash: 'dash'
        }
      },
      // Horizontal line at y=50
      {
        type: 'line',
        x0: 0,
        x1: 100,
        y0: 50,
        y1: 50,
        line: {
          color: '#9ca3af',
          width: 1,
          dash: 'dash'
        }
      }
    ],
    annotations: result.quadrants.map(quadrant => {
      let x, y;
      switch (quadrant.id) {
        case 'Q1': x = 75; y = 75; break;
        case 'Q2': x = 25; y = 75; break;
        case 'Q3': x = 25; y = 25; break;
        case 'Q4': x = 75; y = 25; break;
        default: x = 50; y = 50;
      }
      
      return {
        x,
        y,
        text: quadrant.name,
        showarrow: false,
        font: {
          size: 12,
          color: '#6b7280'
        },
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        bordercolor: quadrant.color,
        borderwidth: 1
      };
    }),
    margin: { t: 60, r: 40, b: 60, l: 80 },
    height: 500,
    showlegend: false,
    font: { family: 'Inter, sans-serif' },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white'
  };

  const plotConfig = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
    responsive: true
  };

  const ViewModeButton = ({ 
    mode, 
    icon: Icon, 
    label, 
    isActive 
  }: { 
    mode: ViewMode; 
    icon: any; 
    label: string; 
    isActive: boolean; 
  }) => (
    <button
      onClick={() => setViewMode(mode)}
      className={cn(
        'flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'bg-primary-100 text-primary-700 border border-primary-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
            <p className="text-sm text-gray-600 mt-1">
              {result.items.length} items • {result.axes.x} vs {result.axes.y}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <ViewModeButton
                mode="chart"
                icon={ChartBarIcon}
                label="Chart"
                isActive={viewMode === 'chart'}
              />
              <ViewModeButton
                mode="table"
                icon={TableCellsIcon}
                label="Data"
                isActive={viewMode === 'table'}
              />
              <ViewModeButton
                mode="insights"
                icon={InformationCircleIcon}
                label="Insights"
                isActive={viewMode === 'insights'}
              />
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
          <div>
            Processing time: {result.metadata.processing_time.toFixed(1)}s
          </div>
          <div>
            Confidence: {(result.metadata.confidence * 100).toFixed(0)}%
          </div>
          <div>
            Generated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'chart' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Variable Selection</h3>
              <p className="text-sm text-gray-700">{result.axes.rationale}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Plot
                  ref={plotRef}
                  data={plotData}
                  layout={plotLayout}
                  config={plotConfig}
                  className="w-full"
                />
              </div>
              
              <div className="lg:col-span-1">
                <QuadrantLegend
                  quadrants={result.quadrants}
                  items={result.items}
                  selectedQuadrant={selectedQuadrant}
                  onQuadrantSelect={setSelectedQuadrant}
                />
              </div>
            </div>
          </div>
        )}

        {viewMode === 'table' && (
          <DataTable
            items={result.items}
            axes={result.axes}
            quadrants={result.quadrants}
          />
        )}

        {viewMode === 'insights' && (
          <InsightsPanel
            insights={result.insights}
            axes={result.axes}
            items={result.items}
            quadrants={result.quadrants}
          />
        )}
      </div>
    </div>
  );
}