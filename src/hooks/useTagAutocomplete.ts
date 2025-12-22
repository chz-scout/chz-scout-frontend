import { useState, useEffect, useCallback } from 'react';
import { fetchTagAutocomplete } from '../services/tagService';
import type { TagAutocompleteResult, TagType } from '../types/tag';
import { useDebounce } from './useDebounce';

interface UseTagAutocompleteOptions {
  tagType?: TagType;
  limit?: number;
  debounceDelay?: number;
}

/**
 * Custom hook for tag autocomplete with debouncing
 * @param searchTerm - Current search input
 * @param options - Autocomplete options (tagType, limit, debounceDelay)
 * @returns Autocomplete state and results
 *
 * Usage:
 * const { suggestions, isLoading, error } = useTagAutocomplete(searchTerm, {
 *   tagType: TagType.CATEGORY,
 *   limit: 10,
 *   debounceDelay: 300
 * });
 */
export function useTagAutocomplete(
  searchTerm: string,
  options: UseTagAutocompleteOptions = {}
) {
  const {
    tagType,
    limit = 10,
    debounceDelay = 300
  } = options;

  const [suggestions, setSuggestions] = useState<TagAutocompleteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  const fetchSuggestions = useCallback(async () => {
    if (!debouncedSearchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await fetchTagAutocomplete({
        prefix: debouncedSearchTerm,
        tagType,
        limit,
      });
      setSuggestions(results || []);
    } catch (err) {
      console.error('Autocomplete fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, tagType, limit]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
  };
}