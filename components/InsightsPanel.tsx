'use client';

import React, { useState } from 'react';
import { AnalysisItem, Quadrant, Axes } from '@/types';
import { cn, getQuadrantForItem } from '@/lib/utils';
import { 
  LightBulbIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  BullseyeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

interface InsightsPanelProps {
  insights: string[];
  axes: Axes;
  items: AnalysisItem[];
  quadrants: Quadrant[];
  className?: string;
}

interface GeneratedInsight {
  type: 'distribution' | 'confidence' | 'outliers' | 'patterns' | 'recommendations';
  title: string;
  description: string;
  icon: any;
  color: string;
  items?: AnalysisItem[];
}

export default function InsightsPanel({ 
  insights, 
  axes, 
  items, 
  quadrants, 
  className 
}: InsightsPanelProps) {
  const [activeTab, setActiveTab] = useState<'ai-insights' | 'data-insights'>('ai-insights');

  // Generate data-driven insights
  const dataInsights: GeneratedInsight[] = generateDataInsights(items, quadrants, axes);

  const TabButton = ({ 
    tab, 
    label, 
    isActive 
  }: { 
    tab: 'ai-insights' | 'data-insights'; 
    label: string; 
    isActive: boolean; 
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'bg-primary-100 text-primary-700 border border-primary-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      )}
    >
      {label}
    </button>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Insights & Analysis</h2>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <TabButton
            tab="ai-insights"
            label="AI Insights"
            isActive={activeTab === 'ai-insights'}
          />
          <TabButton
            tab="data-insights"
            label="Data Analysis"
            isActive={activeTab === 'data-insights'}
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-4">
          {/* Variable Selection Explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ChartBarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Variable Selection</h3>
                <p className="text-sm text-blue-800">{axes.rationale}</p>
              </div>
            </div>
          </div>

          {/* AI Generated Insights */}
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  <LightBulbIcon className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 text-sm leading-relaxed">{insight}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'data-insights' && (
        <div className="space-y-4">
          {dataInsights.map((insight, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className={cn('p-2 rounded-lg', `bg-${insight.color}-100`)}>
                  <insight.icon className={cn('w-4 h-4', `text-${insight.color}-600`)} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-2">
                    {insight.description}
                  </p>
                  
                  {insight.items && insight.items.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Related Items:</h4>
                      <div className="flex flex-wrap gap-1">
                        {insight.items.slice(0, 5).map((item, itemIndex) => (
                          <span
                            key={itemIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            {item.name}
                          </span>
                        ))}
                        {insight.items.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{insight.items.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {items.length}
            </div>
            <div className="text-xs text-gray-500">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {(items.reduce((sum, item) => sum + item.confidence, 0) / items.length * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">Avg Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {quadrants.length}
            </div>
            <div className="text-xs text-gray-500">Quadrants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {items.filter(item => item.confidence > 0.8).length}
            </div>
            <div className="text-xs text-gray-500">High Confidence</div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Export Insights</h3>
        <div className="flex flex-wrap gap-2">
          <button className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors">
            <ClipboardDocumentListIcon className="w-4 h-4" />
            <span>Copy to Clipboard</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
            <ClipboardDocumentListIcon className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function generateDataInsights(
  items: AnalysisItem[], 
  quadrants: Quadrant[], 
  axes: Axes
): GeneratedInsight[] {
  const insights: GeneratedInsight[] = [];

  // Distribution analysis
  const quadrantCounts = quadrants.map(q => ({
    quadrant: q,
    items: items.filter(item => {
      const itemQuadrant = getQuadrantForItem(item.x, item.y, quadrants);
      return itemQuadrant?.id === q.id;
    })
  }));

  const maxQuadrant = quadrantCounts.reduce((max, current) => 
    current.items.length > max.items.length ? current : max
  );

  if (maxQuadrant.items.length > items.length * 0.4) {
    insights.push({
      type: 'distribution',
      title: 'Clustering Detected',
      description: `${((maxQuadrant.items.length / items.length) * 100).toFixed(0)}% of items are concentrated in the "${maxQuadrant.quadrant.name}" quadrant, suggesting a clear pattern in your data.`,
      icon: BullseyeIcon,
      color: 'blue',
      items: maxQuadrant.items
    });
  }

  // Confidence analysis
  const highConfidenceItems = items.filter(item => item.confidence > 0.8);
  const lowConfidenceItems = items.filter(item => item.confidence < 0.6);

  if (highConfidenceItems.length > items.length * 0.7) {
    insights.push({
      type: 'confidence',
      title: 'High Analysis Confidence',
      description: `${highConfidenceItems.length} out of ${items.length} items have high confidence scores (>80%), indicating reliable positioning.`,
      icon: ArrowTrendingUpIcon,
      color: 'green',
      items: highConfidenceItems
    });
  }

  if (lowConfidenceItems.length > items.length * 0.3) {
    insights.push({
      type: 'confidence',
      title: 'Some Uncertain Positions',
      description: `${lowConfidenceItems.length} items have lower confidence scores, which may require additional context or data for better positioning.`,
      icon: ExclamationTriangleIcon,
      color: 'yellow',
      items: lowConfidenceItems
    });
  }

  // Outlier analysis
  const outliers = items.filter(item => 
    (item.x > 90 || item.x < 10) || (item.y > 90 || item.y < 10)
  );

  if (outliers.length > 0) {
    insights.push({
      type: 'outliers',
      title: 'Extreme Positions Identified',
      description: `${outliers.length} items are positioned at extreme values, representing either exceptional cases or edge scenarios worth special attention.`,
      icon: ExclamationTriangleIcon,
      color: 'red',
      items: outliers
    });
  }

  // Pattern analysis
  const xAverage = items.reduce((sum, item) => sum + item.x, 0) / items.length;
  const yAverage = items.reduce((sum, item) => sum + item.y, 0) / items.length;

  if (xAverage > 60) {
    insights.push({
      type: 'patterns',
      title: `High ${axes.x} Tendency`,
      description: `Most items show high ${axes.x.toLowerCase()} values (average: ${xAverage.toFixed(1)}), indicating a general trend toward this characteristic.`,
      icon: ArrowTrendingUpIcon,
      color: 'blue'
    });
  }

  if (yAverage > 60) {
    insights.push({
      type: 'patterns',
      title: `High ${axes.y} Pattern`,
      description: `The majority of items demonstrate high ${axes.y.toLowerCase()} (average: ${yAverage.toFixed(1)}), suggesting this is a dominant theme.`,
      icon: ArrowTrendingUpIcon,
      color: 'purple'
    });
  }

  // Strategic recommendations
  const topRightItems = items.filter(item => item.x > 70 && item.y > 70);
  if (topRightItems.length > 0) {
    insights.push({
      type: 'recommendations',
      title: 'Priority Focus Areas',
      description: `${topRightItems.length} items in the high-${axes.x}/high-${axes.y} area represent your highest priority opportunities requiring immediate attention.`,
      icon: BullseyeIcon,
      color: 'green',
      items: topRightItems
    });
  }

  return insights;
}