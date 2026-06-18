'use client';

import { useState, useEffect } from 'react';

interface LogoManagerProps {
  password: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export default function LogoManager({ password, onSuccess, onError }: LogoManagerProps) {
  const [logo, setLogo] = useState<{ exists: boolean; filename: string | null; path: string | null }>({
    exists: false,
    filename: null,
    path: null
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/logo');
      if (!response.ok) throw new Error('Failed to load logo');
      const data = await response.json();
      setLogo(data);
    } catch (err) {
      console.error('Failed to load logo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password', password);

      const response = await fetch('/api/admin/logo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload logo');
      }

      onSuccess?.(`Logo uploaded successfully: ${result.filename}`);
      await loadLogo();
    } catch (err) {
      onError?.((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleLogoDelete = async () => {
    if (!confirm('Are you sure you want to delete the logo?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/logo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete logo');
      }

      onSuccess?.('Logo deleted successfully');
      await loadLogo();
    } catch (err) {
      onError?.((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🎨</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Site Logo Manager</h3>
            <p className="text-sm text-gray-600">
              Upload and manage your website logo. The logo will be saved as <code className="bg-gray-100 px-2 py-0.5 rounded">logo.{'{ext}'}</code> in the public directory.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Status</div>
            <div className={`text-lg font-bold ${logo.exists ? 'text-green-600' : 'text-gray-400'}`}>
              {logo.exists ? '✓ Active' : '✗ No Logo'}
            </div>
          </div>
        </div>
      </div>

      {/* Current Logo Preview */}
      {logo.exists && logo.path && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">👁️</span>
            Current Logo
          </h3>
          <div className="border-2 border-gray-200 rounded-xl p-8 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <img
                  src={logo.path}
                  alt="Current Logo"
                  className="w-full h-auto max-h-48 object-contain"
                />
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Filename: <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{logo.filename}</code>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Path: <code className="bg-gray-100 px-2 py-1 rounded font-mono">{logo.path}</code>
                </p>
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleLogoDelete}
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {loading ? 'Deleting...' : 'Delete Logo'}
            </button>
          </div>
        </div>
      )}

      {/* Upload New Logo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📤</span>
          {logo.exists ? 'Upload New Logo (Replace)' : 'Upload Logo'}
        </h3>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors bg-gradient-to-br from-purple-50/30 to-pink-50/30">
          <input
            type="file"
            id="logoUpload"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="logoUpload"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">
                {uploading ? 'Uploading...' : 'Click to upload logo'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                PNG, JPG, SVG or WEBP (max 2MB)
              </p>
              {logo.exists && (
                <p className="text-xs text-orange-600 mt-2 font-medium">
                  ⚠️ This will replace the current logo
                </p>
              )}
            </div>
          </label>
        </div>
      </div>

      {/* Logo Usage Guidelines */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-3">Logo Guidelines</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <p className="font-semibold text-blue-900">📏 Recommended Size</p>
                <p className="text-xs text-gray-600 mt-1">Width: 200-400px, Height: 50-100px (or proportional)</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <p className="font-semibold text-blue-900">🎨 Format</p>
                <p className="text-xs text-gray-600 mt-1">PNG with transparent background recommended, or SVG for scalability</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <p className="font-semibold text-blue-900">📁 File Location</p>
                <p className="text-xs text-gray-600 mt-1">Logo is saved to <code className="bg-gray-100 px-1 rounded">/public/logo.{'{ext}'}</code> and accessible at <code className="bg-gray-100 px-1 rounded">/logo.{'{ext}'}</code></p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <p className="font-semibold text-blue-900">🔄 Auto-Replace</p>
                <p className="text-xs text-gray-600 mt-1">Uploading a new logo automatically deletes the old one to prevent conflicts</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
