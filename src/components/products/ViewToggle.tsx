'use client';

import { LayoutGrid, List } from 'lucide-react';
import { useState, useEffect } from 'react';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ onViewChange }: ViewToggleProps) {
  const [view, setView] = useState<ViewMode>('grid');

  // Cargar preferencia desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('productViewMode') as ViewMode;
    if (saved === 'grid' || saved === 'list') {
      setView(saved);
      onViewChange(saved);
    }
  }, [onViewChange]);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem('productViewMode', newView);
    onViewChange(newView);
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg border border-gray-200">
      <button
        onClick={() => handleViewChange('grid')}
        className={`p-1.5 rounded transition-colors ${
          view === 'grid'
            ? 'bg-white shadow-sm text-primary'
            : 'text-gray-400 hover:text-gray-600'
        }`}
        aria-label="Vista de cuadrícula"
        title="Vista de cuadrícula"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleViewChange('list')}
        className={`p-1.5 rounded transition-colors ${
          view === 'list'
            ? 'bg-white shadow-sm text-primary'
            : 'text-gray-400 hover:text-gray-600'
        }`}
        aria-label="Vista de lista"
        title="Vista de lista"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}
