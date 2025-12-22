import { useState, useRef, useEffect } from 'react';
import { useTagAutocomplete } from '../hooks/useTagAutocomplete';
import type { TagType, TagAutocompleteResult } from '../types/tag';

interface TagAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (tag: TagAutocompleteResult) => void;
  placeholder?: string;
  tagType?: TagType;
  className?: string;
}

/**
 * Tag autocomplete search input component
 * Features:
 * - 300ms debounced API calls
 * - Displays up to 10 suggestions
 * - Shows usage count for each tag
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Click outside to close dropdown
 *
 * Usage:
 * <TagAutocomplete
 *   value={searchTerm}
 *   onChange={setSearchTerm}
 *   onSelect={(tag) => console.log('Selected:', tag)}
 *   tagType={TagType.CATEGORY}
 *   placeholder="Search tags..."
 * />
 */
export default function TagAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Enter a tag (e.g., LOL, FPS, Music)',
  tagType,
  className = '',
}: TagAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading } = useTagAutocomplete(value, {
    tagType,
    limit: 10,
    debounceDelay: 300,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show dropdown when suggestions are available
  useEffect(() => {
    if (suggestions.length > 0) {
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setIsOpen(false);
    }
  }, [suggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelectTag = (tag: TagAutocompleteResult) => {
    onChange(tag.name);
    setIsOpen(false);
    if (onSelect) {
      onSelect(tag);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectTag(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const formatUsageCount = (count: number | undefined): string => {
    if (count === undefined || count === null) {
      return '0';
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none text-white placeholder-gray-500"
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((tag, index) => (
            <button
              key={`${tag.name}-${index}`}
              type="button"
              onClick={() => handleSelectTag(tag)}
              className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors ${
                index === selectedIndex
                  ? 'bg-indigo-600 text-white'
                  : 'hover:bg-gray-700 text-white'
              } ${index !== suggestions.length - 1 ? 'border-b border-gray-700' : ''}`}
            >
              <span className="font-medium">{tag.name}</span>
              <span
                className={`text-sm ${
                  index === selectedIndex ? 'text-indigo-200' : 'text-gray-400'
                }`}
              >
                {formatUsageCount(tag.usageCount)} users
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Empty state when searching but no results */}
      {isOpen && !isLoading && value.trim() && suggestions.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 text-center text-gray-400">
          No tags found for "{value}"
        </div>
      )}
    </div>
  );
}