import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import TagAutocomplete from '../components/TagAutocomplete';
import type { TagType, TagAutocompleteResult, MemberTagsResponse } from '../types/tag';

export default function TagsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [selectedTagType, setSelectedTagType] = useState<TagType>('CUSTOM');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Original tags from server
  const [originalCustomTags, setOriginalCustomTags] = useState<string[]>([]);
  const [originalCategoryTags, setOriginalCategoryTags] = useState<string[]>([]);

  // Current edited tags
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [categoryTags, setCategoryTags] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTags();
    }
  }, [isAuthenticated, user]);

  const fetchTags = async () => {
    if (!user) return;
    try {
      const response = await api.get<{ success: boolean; data: MemberTagsResponse }>(
        `/api/v1/members/${user.uuid}/tags`
      );
      const data = response.data.data;
      const custom = (data?.customTags || []).map((t) => t.tagName);
      const category = (data?.categoryTags || []).map((t) => t.tagName);

      setOriginalCustomTags(custom);
      setOriginalCategoryTags(category);
      setCustomTags(custom);
      setCategoryTags(category);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = useMemo(() => {
    const customChanged =
      customTags.length !== originalCustomTags.length ||
      customTags.some((tag) => !originalCustomTags.includes(tag));
    const categoryChanged =
      categoryTags.length !== originalCategoryTags.length ||
      categoryTags.some((tag) => !originalCategoryTags.includes(tag));
    return customChanged || categoryChanged;
  }, [customTags, categoryTags, originalCustomTags, originalCategoryTags]);

  const handleTagSelect = (tag: TagAutocompleteResult) => {
    const tagName = tag.name;
    if (selectedTagType === 'CUSTOM') {
      if (!customTags.includes(tagName)) {
        setCustomTags([...customTags, tagName]);
      }
    } else {
      if (!categoryTags.includes(tagName)) {
        setCategoryTags([...categoryTags, tagName]);
      }
    }
    setSearchValue('');
  };

  const removeTag = (tagName: string, type: TagType) => {
    if (type === 'CUSTOM') {
      setCustomTags(customTags.filter((t) => t !== tagName));
    } else {
      setCategoryTags(categoryTags.filter((t) => t !== tagName));
    }
  };

  const saveChanges = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const customChanged =
        customTags.length !== originalCustomTags.length ||
        customTags.some((tag) => !originalCustomTags.includes(tag));
      const categoryChanged =
        categoryTags.length !== originalCategoryTags.length ||
        categoryTags.some((tag) => !originalCategoryTags.includes(tag));

      if (customChanged) {
        await api.patch(`/api/v1/members/${user.uuid}/tags`, {
          names: customTags,
          tagType: 'CUSTOM',
        });
      }

      if (categoryChanged) {
        await api.patch(`/api/v1/members/${user.uuid}/tags`, {
          names: categoryTags,
          tagType: 'CATEGORY',
        });
      }

      setOriginalCustomTags([...customTags]);
      setOriginalCategoryTags([...categoryTags]);
    } catch (error) {
      console.error('Failed to save tags:', error);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-400">
            <a href="/">CHZ Scout</a>
          </h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-4">Tag Settings</h2>
        <p className="text-gray-400 mb-8">
          Add tags to receive notifications when matching streams go live.
        </p>

        {/* Tag Type Selector + Search */}
        <div className="flex gap-2 mb-8">
          <select
            value={selectedTagType}
            onChange={(e) => setSelectedTagType(e.target.value as TagType)}
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="CUSTOM">Tag</option>
            <option value="CATEGORY">Category</option>
          </select>
          <TagAutocomplete
            value={searchValue}
            onChange={setSearchValue}
            onSelect={handleTagSelect}
            tagType={selectedTagType}
            placeholder={
              selectedTagType === 'CUSTOM'
                ? 'Search tags (e.g., LOL, FPS)'
                : 'Search categories'
            }
            className="flex-1"
          />
        </div>

        {/* Custom Tags Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-indigo-400">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {customTags.length === 0 ? (
              <p className="text-gray-500">No custom tags added yet.</p>
            ) : (
              customTags.map((tag) => (
                <span
                  key={tag}
                  className="group inline-flex items-center px-3 py-1 rounded-full bg-indigo-600 text-white"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag, 'CUSTOM')}
                    className="ml-1 w-0 overflow-hidden opacity-0 group-hover:w-4 group-hover:opacity-100 hover:text-red-300 transition-all duration-200"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Category Tags Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-green-400">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {categoryTags.length === 0 ? (
              <p className="text-gray-500">No category tags added yet.</p>
            ) : (
              categoryTags.map((tag) => (
                <span
                  key={tag}
                  className="group inline-flex items-center px-3 py-1 rounded-full bg-green-600 text-white"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag, 'CATEGORY')}
                    className="ml-1 w-0 overflow-hidden opacity-0 group-hover:w-4 group-hover:opacity-100 hover:text-red-300 transition-all duration-200"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={saveChanges}
          disabled={!hasChanges || saving}
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            hasChanges && !saving
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </main>
    </div>
  );
}
