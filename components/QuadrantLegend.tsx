'use client';

import React from 'react';
import { Quadrant, AnalysisItem } from '@/types';
import { cn, getQuadrantForItem } from '@/lib/utils';

interface QuadrantLegendProps {
  quadrants: Quadrant[];
  items: AnalysisItem[];
  selectedQuadrant?: string | null;
  onQuadrantSelect?: (quadrantId: string | null) => void;
  className?: string;
}

export default function QuadrantLegend({ 
  quadrants, 
  items, 
  selectedQuadrant,
  onQuadrantSelect,
  className 
}: QuadrantLegendProps) {
  
  const getItemsInQuadrant = (quadrant: Quadrant) => {
    return items.filter(item => {
      const itemQuadrant = getQuadrantForItem(item.x, item.y, quadrants);
      return itemQuadrant?.id === quadrant.id;
    });
  };

  const handleQuadrantClick = (quadrantId: string) => {
    if (onQuadrantSelect) {
      onQuadrantSelect(selectedQuadrant === quadrantId ? null : quadrantId);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <h3 className="font-semibold text-gray-900 text-sm">Quadrants</h3>
      
      <div className="space-y-2">
        {quadrants.map((quadrant) => {
          const itemsInQuadrant = getItemsInQuadrant(quadrant);
          const isSelected = selectedQuadrant === quadrant.id;
          
          return (
            <div
              key={quadrant.id}
              className={cn(
                'p-3 rounded-lg border cursor-pointer transition-all',
                isSelected
                  ? 'border-primary-300 bg-primary-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              )}
              onClick={() => handleQuadrantClick(quadrant.id)}
            >
              {/* Quadrant Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: quadrant.color }}
                  />
                  <span className="font-medium text-sm text-gray-900">
                    {quadrant.name}
                  </span>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {itemsInQuadrant.length}
                </span>
              </div>
              
              {/* Quadrant Description */}
              <p className="text-xs text-gray-600 mb-2">
                {quadrant.description}
              </p>
              
              {/* Items in Quadrant */}
              {itemsInQuadrant.length > 0 && (
                <div className="space-y-1">
                  {itemsInQuadrant.slice(0, 3).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-700 font-medium truncate">
                        {item.name}
                      </span>
                      <div className="flex items-center space-x-1 ml-2">
                        <span className="text-gray-500">
                          {item.confidence.toFixed(2)}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                      </div>
                    </div>
                  ))}
                  
                  {itemsInQuadrant.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{itemsInQuadrant.length - 3} more
                    </div>
                  )}
                </div>
              )}
              
              {/* Strategic Implication */}
              {quadrant.implication && (
                <div className={cn(
                  'mt-2 p-2 rounded text-xs',
                  isSelected
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                )}>
                  <strong>Strategy:</strong> {quadrant.implication}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Summary Stats */}
      <div className="border-t pt-3 space-y-2">
        <div className="text-xs text-gray-500">
          <strong>Total Items:</strong> {items.length}
        </div>
        <div className="text-xs text-gray-500">
          <strong>Avg Confidence:</strong>{' '}
          {items.length > 0 
            ? (items.reduce((sum, item) => sum + item.confidence, 0) / items.length * 100).toFixed(0) + '%'
            : 'N/A'
          }
        </div>
        <div className="text-xs text-gray-500">
          <strong>Distribution:</strong>
        </div>
        {quadrants.map(quadrant => {
          const itemsCount = getItemsInQuadrant(quadrant).length;
          const percentage = items.length > 0 ? (itemsCount / items.length * 100).toFixed(0) : '0';
          
          return (
            <div key={quadrant.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: quadrant.color }}
                />
                <span className="text-gray-600">Q{quadrant.id.slice(-1)}</span>
              </div>
              <span className="text-gray-500">{percentage}%</span>
            </div>
          );
        })}
      </div>
      
      {/* Legend Help */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        💡 <strong>Tip:</strong> Click on quadrants to highlight items on the chart
      </div>
    </div>
  );
}