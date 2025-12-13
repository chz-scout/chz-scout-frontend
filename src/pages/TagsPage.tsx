import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Tag {
  id: number;
  name: string;
  enabled: boolean;
}

export default function TagsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTags();
    }
  }, [isAuthenticated]);

  const fetchTags = async () => {
    try {
      const response = await api.get('/api/v1/tags');
      setTags(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      const response = await api.post('/api/v1/tags', { name: newTag.trim() });
      setTags([...tags, response.data.data]);
      setNewTag('');
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const toggleTag = async (tagId: number, enabled: boolean) => {
    try {
      await api.patch(`/api/v1/tags/${tagId}`, { enabled: !enabled });
      setTags(tags.map(tag =>
        tag.id === tagId ? { ...tag, enabled: !enabled } : tag
      ));
    } catch (error) {
      console.error('Failed to toggle tag:', error);
    }
  };

  const deleteTag = async (tagId: number) => {
    try {
      await api.delete(`/api/v1/tags/${tagId}`);
      setTags(tags.filter(tag => tag.id !== tagId));
    } catch (error) {
      console.error('Failed to delete tag:', error);
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
        <h2 className="text-3xl font-bold mb-8">Tag Settings</h2>
        <p className="text-gray-400 mb-6">
          Add tags to receive notifications when matching streams go live.
        </p>

        <form onSubmit={addTag} className="flex gap-2 mb-8">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Enter a tag (e.g., LOL, FPS, Music)"
            className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </form>

        <div className="space-y-3">
          {tags.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No tags added yet. Add your first tag above!
            </p>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700"
              >
                <span className={tag.enabled ? 'text-white' : 'text-gray-500'}>
                  {tag.name}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleTag(tag.id, tag.enabled)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      tag.enabled
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {tag.enabled ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => deleteTag(tag.id)}
                    className="px-3 py-1 rounded text-sm bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}