import { useState } from 'react';
import TagAutocomplete from './TagAutocomplete';
import type { TagAutocompleteResult } from '../types/tag';

/**
 * Example component demonstrating TagAutocomplete usage
 * This file shows how to use the TagAutocomplete component in different scenarios
 */
export default function TagAutocompleteExample() {
  const [basicSearch, setBasicSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [customSearch, setCustomSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagSelect = (tag: TagAutocompleteResult) => {
    if (!selectedTags.includes(tag.name)) {
      setSelectedTags([...selectedTags, tag.name]);
    }
    setBasicSearch('');
  };

  const removeTag = (tagName: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagName));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold">TagAutocomplete Examples</h1>

        {/* Example 1: Basic Usage */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-indigo-400">1. Basic Usage</h2>
          <p className="text-gray-400">
            Simple autocomplete with tag selection. Selected tags are displayed below.
          </p>
          <TagAutocomplete
            value={basicSearch}
            onChange={setBasicSearch}
            onSelect={handleTagSelect}
            placeholder="Search for any tag..."
          />
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-600 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Example 2: Category Tags Only */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-indigo-400">2. Category Tags Only</h2>
          <p className="text-gray-400">
            Filter to show only category tags (e.g., game genres, stream types)
          </p>
          <TagAutocomplete
            value={categorySearch}
            onChange={setCategorySearch}
            tagType="CATEGORY"
            placeholder="Search category tags..."
          />
        </section>

        {/* Example 3: Custom Tags Only */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-indigo-400">3. Custom Tags Only</h2>
          <p className="text-gray-400">
            Filter to show only user-created custom tags
          </p>
          <TagAutocomplete
            value={customSearch}
            onChange={setCustomSearch}
            tagType="CUSTOM"
            placeholder="Search custom tags..."
          />
        </section>

        {/* Technical Details */}
        <section className="space-y-4 border-t border-gray-700 pt-8">
          <h2 className="text-2xl font-semibold text-indigo-400">Technical Details</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            <li>300ms debounce delay on API calls</li>
            <li>Maximum 10 suggestions displayed</li>
            <li>Keyboard navigation support (↑↓ arrows, Enter, Escape)</li>
            <li>Click outside to close dropdown</li>
            <li>Shows usage count for popularity indication</li>
            <li>Loading spinner during API requests</li>
            <li>Empty state when no results found</li>
          </ul>
        </section>
      </div>
    </div>
  );
}