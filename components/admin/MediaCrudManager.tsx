'use client';

import { useState, useEffect } from 'react';

interface MediaItem {
  key: string;
  value: string;
}

interface MediaCrudManagerProps {
  locale: string;
  password: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export default function MediaCrudManager({ locale, password, onSuccess, onError }: MediaCrudManagerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [sectionTitle, setSectionTitle] = useState('');
  const [featured, setFeatured] = useState('');
  const [speeches, setSpeeches] = useState('');
  const [videos, setVideos] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formKey, setFormKey] = useState('');
  const [formValue, setFormValue] = useState('');

  useEffect(() => {
    loadMediaItems();
  }, [locale]);

  const loadMediaItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/media?locale=${locale}`);
      if (!response.ok) throw new Error('Failed to load media items');
      const data = await response.json();
      setItems(data.items || []);
      setSectionTitle(data.title || '');
      setFeatured(data.featured || '');
      setSpeeches(data.speeches || '');
      setVideos(data.videos || '');
    } catch (err) {
      onError?.('Failed to load media items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingItem(null);
    setFormKey('');
    setFormValue('');
  };

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setIsCreating(false);
    setFormKey(item.key);
    setFormValue(item.value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          key: formKey,
          value: formValue,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      onSuccess?.(`Media item "${formKey}" saved successfully`);
      await loadMediaItems();
      handleCancel();
    } catch (err) {
      onError?.((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Are you sure you want to delete "${key}"?`)) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, key, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete');
      }

      onSuccess?.(`Media item "${key}" deleted successfully`);
      await loadMediaItems();
    } catch (err) {
      onError?.((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMetadata = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          title: sectionTitle,
          featured,
          speeches,
          videos,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update metadata');
      }

      onSuccess?.('Media section metadata updated successfully');
    } catch (err) {
      onError?.((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingItem(null);
    setFormKey('');
    setFormValue('');
  };

  return (
    <div className="space-y-6">
      {/* Section Metadata */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          Section Metadata
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Media"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Label</label>
            <input
              type="text"
              value={featured}
              onChange={(e) => setFeatured(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Featured"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Speeches Label</label>
            <input
              type="text"
              value={speeches}
              onChange={(e) => setSpeeches(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Speeches"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Videos Label</label>
            <input
              type="text"
              value={videos}
              onChange={(e) => setVideos(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Videos"
            />
          </div>
        </div>
        <button
          onClick={handleUpdateMetadata}
          disabled={loading}
          className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50"
        >
          Update Metadata
        </button>
      </div>

      {/* Create Button */}
      {!isCreating && !editingItem && (
        <button
          onClick={handleCreate}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600 font-semibold"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Media Item
        </button>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingItem) && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-purple-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">{isCreating ? '➕' : '✏️'}</span>
            {isCreating ? 'Create New Media Item' : 'Edit Media Item'}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key (Identifier) *
              </label>
              <input
                type="text"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                disabled={!!editingItem}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="e.g., tedx, nepalEarthquake, businessInsider"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use camelCase for the key (e.g., tedxTalk, businessInsider).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value/Title *
              </label>
              <input
                type="text"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., TEDx Talk - Social Entrepreneurship"
              />
              <p className="text-xs text-gray-500 mt-1">
                The display text for this media item.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Media Items ({items.length})
        </h3>
        {loading && items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p>Loading media items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="font-semibold">No media items yet</p>
            <p className="text-sm mt-1">Click "Add New Media Item" to create your first item</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.key}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-purple-600">
                        {item.key}
                      </code>
                    </div>
                    <p className="text-sm text-gray-900">{item.value}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.key)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
