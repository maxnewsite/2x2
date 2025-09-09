'use client';

import React, { useState, useMemo } from 'react';
import { AnalysisItem, Quadrant, Axes } from '@/types';
import { cn, getQuadrantForItem } from '@/lib/utils';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface DataTableProps {
  items: AnalysisItem[];
  axes: Axes;
  quadrants: Quadrant[];
  className?: string;
}

type SortField = 'name' | 'x' | 'y' | 'confidence' | 'quadrant';
type SortDirection = 'asc' | 'desc';

export default function DataTable({ items, axes, quadrants, className }: DataTableProps) {
  const [sortField, setSortField] = useState<SortField>('confidence');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<AnalysisItem | null>(null);

  // Enhanced items with quadrant information
  const enhancedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      quadrant: getQuadrantForItem(item.x, item.y, quadrants)
    }));
  }, [items, quadrants]);

  // Filtered and sorted items
  const processedItems = useMemo(() => {
    let filtered = enhancedItems;

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.rationale.toLowerCase().includes(search) ||
        item.citations.some(citation => citation.toLowerCase().includes(search))
      );
    }

    // Apply quadrant filter
    if (selectedQuadrant !== 'all') {
      filtered = filtered.filter(item => item.quadrant?.id === selectedQuadrant);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'x':
          aVal = a.x;
          bVal = b.x;
          break;
        case 'y':
          aVal = a.y;
          bVal = b.y;
          break;
        case 'confidence':
          aVal = a.confidence;
          bVal = b.confidence;
          break;
        case 'quadrant':
          aVal = a.quadrant?.name || '';
          bVal = b.quadrant?.name || '';
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [enhancedItems, searchTerm, selectedQuadrant, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === 'asc' 
            ? <ChevronUpIcon className="w-4 h-4" />
            : <ChevronDownIcon className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  const ConfidenceBar = ({ confidence }: { confidence: number }) => (
    <div className="flex items-center space-x-2">
      <div className="w-16 bg-gray-200 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: `${confidence * 100}%`,
            backgroundColor: confidence > 0.8 ? '#22c55e' : confidence > 0.6 ? '#f59e0b' : '#ef4444'
          }}
        />
      </div>
      <span className="text-xs text-gray-600 min-w-8">
        {(confidence * 100).toFixed(0)}%
      </span>
    </div>
  );

  const QuadrantBadge = ({ quadrant }: { quadrant: Quadrant | null }) => {
    if (!quadrant) return <span className="text-gray-400 text-xs">-</span>;
    
    return (
      <div className="flex items-center space-x-1">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: quadrant.color }}
        />
        <span className="text-xs font-medium text-gray-700">
          {quadrant.name}
        </span>
      </div>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items, rationales, or citations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quadrant Filter */}
        <div className="flex items-center space-x-2">
          <FunnelIcon className="w-4 h-4 text-gray-400" />
          <select
            value={selectedQuadrant}
            onChange={(e) => setSelectedQuadrant(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Quadrants</option>
            {quadrants.map(quadrant => (
              <option key={quadrant.id} value={quadrant.id}>
                {quadrant.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {processedItems.length} of {items.length} items
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <SortableHeader field="name">Item</SortableHeader>
                <SortableHeader field="x">{axes.x}</SortableHeader>
                <SortableHeader field="y">{axes.y}</SortableHeader>
                <SortableHeader field="confidence">Confidence</SortableHeader>
                <SortableHeader field="quadrant">Quadrant</SortableHeader>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedItems.map((item, index) => (
                <tr 
                  key={index} 
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    selectedItem === item && 'bg-primary-50'
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.x.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.y.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ConfidenceBar confidence={item.confidence} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <QuadrantBadge quadrant={item.quadrant} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedItem(selectedItem === item ? null : item)}
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      {selectedItem === item ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {processedItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No items found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <DocumentTextIcon className="w-5 h-5 text-gray-400" />
              <span>{selectedItem.name}</span>
            </h3>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Position</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{axes.x}: {selectedItem.x.toFixed(1)}</div>
                  <div>{axes.y}: {selectedItem.y.toFixed(1)}</div>
                  <div>Confidence: {(selectedItem.confidence * 100).toFixed(0)}%</div>
                  <div>Quadrant: <QuadrantBadge quadrant={selectedItem.quadrant} /></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Rationale</h4>
                <p className="text-sm text-gray-600">{selectedItem.rationale}</p>
              </div>

              {selectedItem.citations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Citations</h4>
                  <div className="space-y-2">
                    {selectedItem.citations.map((citation, index) => (
                      <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        &ldquo;{citation}&rdquo;
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}