/**
 * SearchBar Component
 * Advanced search with debouncing, recent searches, and keyboard shortcuts
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, debounce } from '../lib/utils';
import { slideInFromTop } from '../lib/animations';
import { Input } from '../../../components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
  recentSearches?: string[];
  onClearRecent?: () => void;
  className?: string;
  showRecent?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search orders by number, customer name, or phone...',
  recentSearches = [],
  onClearRecent,
  className,
  showRecent = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const debouncedSearch = useRef(
    debounce((query: string) => {
      onSearch?.(query);
    }, 300)
  ).current;

  useEffect(() => {
    if (value) {
      debouncedSearch(value);
    }
  }, [value, debouncedSearch]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showRecent && recentSearches.length > 0 && !value) {
      setShowSuggestions(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div
        className={cn(
          'relative flex items-center transition-shadow',
          isFocused && 'ring-2 ring-blue-500 ring-opacity-50 rounded-lg'
        )}
      >
        <Search className="absolute left-3 h-5 w-5 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'pl-10 pr-10 h-11 text-base',
            'border-gray-300 focus:border-blue-500 focus:ring-0'
          )}
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}

        {/* Keyboard Hint */}
        {!isFocused && !value && (
          <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        )}
      </div>

      {/* Recent Searches Dropdown */}
      <AnimatePresence>
        {showSuggestions && showRecent && recentSearches.length > 0 && !value && (
          <motion.div
            variants={slideInFromTop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4" />
                <span>Recent Searches</span>
              </div>
              {onClearRecent && (
                <button
                  onClick={onClearRecent}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto">
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(search)}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 group"
                >
                  <Clock className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">
                    {search}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Stats (optional) */}
      {value && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <TrendingUp className="h-3 w-3" />
          <span>Searching for: "{value}"</span>
        </div>
      )}
    </div>
  );
};
