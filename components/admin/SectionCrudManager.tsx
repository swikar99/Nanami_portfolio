'use client';

import { useState, useEffect } from 'react';

interface SectionField {
  key: string;
  value: string;
}

interface SectionCrudManagerProps {
  locale: string;
  password: string;
  section: 'nav' | 'hero' | 'about' | 'contact' | 'footer';
  sectionTitle: string;
  sectionIcon: string;
  description: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export default function SectionCrudManager({
  locale,
  password,
  section,
  sectionTitle,
  sectionIcon,
  description,
  onSuccess,
  onError
}: SectionCrudManagerProps) {
  const [fields, setFields] = useState<SectionField[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingField, setEditingField] = useState<SectionField | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formKey, setFormKey] = useState('');
  const [formValue, setFormValue] = useState('');

  useEffect(() => {
    loadSection();
    loadImages();
  }, [locale, section]);

  const loadSection = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/sections?locale=${locale}&section=${section}`);
      if (!response.ok) throw new Error('Failed to load section');
      const result = await response.json();

      // Convert object to array
      const fieldsArray: SectionField[] = Object.entries(result.data || {}).map(([key, value]) => ({
        key,
        value: value as string
      }));

      setFields(fieldsArray);
    } catch (err) {
      onError?.(`Failed to load ${section} section`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingField(null);
    setFormKey('');
    setFormValue('');
  };

  const handleEdit = (field: SectionField) => {
    setEditingField(field);
    setIsCreating(false);
    setFormKey(field.key);
    setFormValue(field.value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          section,
          key: formKey,
          value: formValue,
          password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      onSuccess?.(`Field "${formKey}" saved successfully in ${section}`);
      await loadSection();
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
      const response = await fetch('/api/admin/sections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, section, key, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete');
      }

      onSuccess?.(`Field "${key}" deleted successfully`);
      await loadSection();
    } catch (err) {
      onError?.((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingField(null);
    setFormKey('');
    setFormValue('');
  };

  const loadImages = async () => {
    try {
      const response = await fetch('/api/admin/images');
      if (!response.ok) throw new Error('Failed to load images');
      const data = await response.json();
      setImages(data[section] || []);
    } catch (err) {
      console.error('Failed to load images:', err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[Image Upload] Starting upload:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      category: section
    });

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', section);
      formData.append('password', password);

      console.log('[Image Upload] Sending request to /api/admin/images');

      const response = await fetch('/api/admin/images', {
        method: 'POST',
        body: formData,
      });

      console.log('[Image Upload] Response status:', response.status);

      const result = await response.json();
      console.log('[Image Upload] Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image');
      }

      onSuccess?.(`Image uploaded successfully: ${result.filename}`);
      console.log('[Image Upload] Reloading images...');
      await loadImages();
      console.log('[Image Upload] Upload complete!');
    } catch (err) {
      console.error('[Image Upload] Error:', err);
      onError?.((err as Error).message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleImageDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: section,
          filename,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete image');
      }

      onSuccess?.(`Image deleted successfully`);
      await loadImages();
    } catch (err) {
      onError?.((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{sectionIcon}</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{sectionTitle}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Fields</div>
            <div className="text-3xl font-bold text-purple-600">{fields.length}</div>
          </div>
        </div>
      </div>

      {/* Create Button */}
      {!isCreating && !editingField && (
        <button
          onClick={handleCreate}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-purple-600 font-semibold"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Field
        </button>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingField) && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-purple-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">{isCreating ? '➕' : '✏️'}</span>
            {isCreating ? 'Create New Field' : 'Edit Field'}
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Key *
              </label>
              <input
                type="text"
                value={formKey}
                onChange={(e) => setFormKey(e.target.value)}
                disabled={!!editingField}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="e.g., home, about, greeting, title"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use camelCase for keys (e.g., contactUs, learnMore).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value *
              </label>
              <textarea
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Enter the text content..."
              />
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

      {/* Fields List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          All Fields ({fields.length})
        </h3>
        {loading && fields.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <p>Loading fields...</p>
          </div>
        ) : fields.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-semibold">No fields yet</p>
            <p className="text-sm mt-1">Click "Add New Field" to create your first field</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field) => (
              <div
                key={field.key}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-purple-100 px-2 py-1 rounded text-purple-700 font-semibold">
                        {field.key}
                      </code>
                    </div>
                    <p className="text-sm text-gray-900 break-words">{field.value}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(field)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(field.key)}
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

      {/* Image Management */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🖼️</span>
          Section Images ({images.length})
        </h3>

        {/* Upload Area */}
        <div className="mb-6 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors bg-gradient-to-br from-purple-50/30 to-pink-50/30">
          <input
            type="file"
            id={`imageUpload-${section}`}
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploadingImage}
          />
          <label
            htmlFor={`imageUpload-${section}`}
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {uploadingImage ? 'Uploading...' : 'Click to upload image'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, GIF, SVG or WEBP (max 5MB)
              </p>
            </div>
          </label>
        </div>

        {/* Images Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((filename) => (
              <div
                key={filename}
                className="group relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:border-purple-500 transition-all"
              >
                <div className="aspect-square relative">
                  <img
                    src={`/images/${section}/${filename}`}
                    alt={filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                    <button
                      onClick={() => handleImageDelete(filename)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-white">
                  <p className="text-xs font-mono text-gray-600 truncate" title={filename}>
                    {filename}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    /images/{section}/{filename}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-semibold">No images uploaded yet</p>
            <p className="text-sm mt-1">Upload your first image for this section</p>
          </div>
        )}
      </div>
    </div>
  );
}
