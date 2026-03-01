'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(currentQuery);

  // Sincronizar con URL
  useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }

    router.push(`/productos?${params.toString()}`);
  };

  const handleClear = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    router.push(`/productos?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre, SKU o descripción..."
        className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
