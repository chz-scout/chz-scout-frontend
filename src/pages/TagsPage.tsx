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

  // Notification settings
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [notificationToggling, setNotificationToggling] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

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
      fetchNotificationSettings();
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

  const fetchNotificationSettings = async () => {
    if (!user) return;
    try {
      const response = await api.get<{ success: boolean; data: { notificationEnabled?: boolean } }>(
        '/api/v1/members/me'
      );
      const enabled = response.data.data?.notificationEnabled;
      if (enabled !== undefined) {
        setNotificationEnabled(enabled);
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotificationToggling(true);
    try {
      await api.patch<{ success: boolean; data: boolean }>(
        `/api/v1/members/me/notification?enabled=${enabled}`
      );
      setNotificationEnabled(enabled);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      setNotificationEnabled(!enabled);
    } finally {
      setNotificationToggling(false);
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

  const saveChanges = async (enableNotification = false) => {
    if (!user) return;
    setSaving(true);
    setShowNotificationModal(false);

    try {
      // 알림 켜기 요청이 있으면 먼저 처리
      if (enableNotification) {
        await api.patch<{ success: boolean; data: boolean }>(
          `/api/v1/members/me/notification?enabled=true`
        );
        setNotificationEnabled(true);
      }

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

  const handleSaveClick = () => {
    if (!notificationEnabled) {
      setShowNotificationModal(true);
    } else {
      saveChanges();
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
        <p className="text-gray-400 mb-6">
          Add tags to receive notifications when matching streams go live.
        </p>

        {/* Notification Toggle */}
        <div className="mb-8 p-4 rounded-lg bg-gray-800 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Notifications</h3>
              <p className="text-sm text-gray-400">
                Receive notifications when tagged streams go live
              </p>
            </div>
            <button
              onClick={() => handleNotificationToggle(!notificationEnabled)}
              disabled={notificationToggling}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                notificationToggling
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              } ${notificationEnabled ? 'bg-indigo-600' : 'bg-gray-600'}`}
              aria-label="Toggle notifications"
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  notificationEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {notificationToggling && (
            <div className="mt-2 text-sm text-gray-500">Updating...</div>
          )}
        </div>

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
          onClick={handleSaveClick}
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

      {/* Notification Off Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-3">알림이 꺼져 있습니다</h3>
            <p className="text-gray-400 mb-6">
              현재 알림이 비활성화되어 있어 태그를 저장해도 알림을 받을 수 없습니다.
              알림을 켜시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => saveChanges(true)}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              >
                알림 켜고 저장
              </button>
              <button
                onClick={() => saveChanges(false)}
                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                그냥 저장
              </button>
            </div>
            <button
              onClick={() => setShowNotificationModal(false)}
              className="w-full mt-3 py-2 text-gray-400 hover:text-white transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
