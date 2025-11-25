'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArticleMeta } from '@/lib/markdown';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ArticleMeta[]>([]);
  const [allArticles, setAllArticles] = useState<ArticleMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Fetch articles only when search is opened
  useEffect(() => {
    if (isOpen && allArticles.length === 0) {
      setIsLoading(true);
      setError(null);

      fetch('/api/articles')
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch articles');
          return res.json();
        })
        .then(data => {
          setAllArticles(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch articles:', err);
          setError('Não foi possível carregar os artigos');
          setIsLoading(false);
        });
    }
  }, [isOpen, allArticles.length]);

  // Debounced search with 200ms delay
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }

    const debounceTimer = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      const filtered = allArticles
        .filter(article =>
          article.title.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query) ||
          article.category.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query))
        )
        .slice(0, 5);

      setResults(filtered);
      setSelectedIndex(-1);
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, allArticles]);

  // Close on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setSelectedIndex(-1);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
        setSelectedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!results.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          window.location.href = `/noticias/${results[selectedIndex].slug}`;
        }
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    // Focus input after dropdown renders
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(-1);
  }, []);

  return (
    <div ref={searchRef} className="relative">
      {/* Search Button */}
      <button
        onClick={handleOpen}
        className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Pesquisar artigos"
        aria-expanded={isOpen}
        aria-controls="search-dropdown"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Search Dropdown */}
      {isOpen && (
        <div
          id="search-dropdown"
          role="dialog"
          aria-label="Pesquisa de artigos"
          className="absolute top-full right-0 mt-2 w-[90vw] sm:w-96 bg-background border border-border rounded-lg shadow-2xl overflow-hidden z-50 animate-fadeIn"
        >
          {/* Search Input */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                role="searchbox"
                placeholder="Pesquisar notícias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-autocomplete="list"
                aria-controls="search-results"
                aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
                className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Results */}
          <div
            id="search-results"
            role="listbox"
            className="max-h-96 overflow-y-auto"
            ref={resultsRef}
          >
            {/* Loading State */}
            {isLoading && (
              <div className="p-6 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" role="status" aria-label="A carregar"></div>
                <p className="text-sm text-muted mt-3">A carregar artigos...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-6 text-center text-red-600">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && searchQuery && results.length === 0 && (
              <div className="p-6 text-center text-muted">
                <svg className="w-12 h-12 mx-auto mb-3 text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium">Nenhum resultado encontrado</p>
                <p className="text-xs mt-1">Tente pesquisar com outras palavras-chave</p>
              </div>
            )}

            {/* Results List */}
            {!isLoading && !error && searchQuery && results.length > 0 && (
              <div className="py-2">
                {results.map((article, index) => (
                  <Link
                    key={article.slug}
                    id={`result-${index}`}
                    role="option"
                    aria-selected={selectedIndex === index}
                    href={`/noticias/${article.slug}`}
                    onClick={handleClose}
                    className={`block px-4 py-3 transition-colors duration-200 ${
                      selectedIndex === index
                        ? 'bg-primary/10 border-l-4 border-primary'
                        : 'hover:bg-card border-l-4 border-transparent'
                    }`}
                  >
                    <h4 className="text-sm font-semibold text-foreground line-clamp-1 mb-1">
                      {article.title}
                    </h4>
                    <p className="text-xs text-muted line-clamp-1 mb-1">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-primary font-medium capitalize">
                        {article.category}
                      </span>
                      <span className="text-xs text-muted">•</span>
                      <span className="text-xs text-muted">
                        {new Date(article.date).toLocaleDateString('pt-PT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Initial State */}
            {!isLoading && !error && !searchQuery && (
              <div className="p-6 text-center text-muted">
                <svg className="w-12 h-12 mx-auto mb-3 text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm font-medium">Pesquisar artigos</p>
                <p className="text-xs mt-1">Digite para encontrar notícias por título, descrição ou categoria</p>
              </div>
            )}
          </div>

          {/* Keyboard hints */}
          {results.length > 0 && (
            <div className="px-4 py-2 border-t border-border bg-card/50 text-xs text-muted flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">↑↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">Enter</kbd>
                selecionar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">Esc</kbd>
                fechar
              </span>
            </div>
          )}
        </div>
      )}

      {/* Screen reader live region for result count */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {searchQuery && !isLoading && (
          results.length === 0
            ? 'Nenhum resultado encontrado'
            : `${results.length} resultado${results.length === 1 ? '' : 's'} encontrado${results.length === 1 ? '' : 's'}`
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
