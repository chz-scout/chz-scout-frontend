import api from './api';
import type { TagAutocompleteResult, TagAutocompleteParams } from '../types/tag';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

/**
 * Fetch tag autocomplete suggestions
 * @param params - Autocomplete parameters (prefix, tagType, limit)
 * @returns Promise with autocomplete results
 */
export const fetchTagAutocomplete = async (
  params: TagAutocompleteParams
): Promise<TagAutocompleteResult[]> => {
  const { prefix, tagType, limit = 10 } = params;

  const queryParams = new URLSearchParams({
    prefix,
    limit: limit.toString(),
  });

  if (tagType) {
    queryParams.append('tagType', tagType);
  }

  const response = await api.get<ApiResponse<TagAutocompleteResult[]>>(
    `/api/v1/tags/suggestions?${queryParams.toString()}`
  );

  return response.data.data || [];
};