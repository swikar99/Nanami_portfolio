'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import WorkCrudManager from '@/components/admin/WorkCrudManager';
import MediaCrudManager from '@/components/admin/MediaCrudManager';
import SectionCrudManager from '@/components/admin/SectionCrudManager';
import LogoManager from '@/components/admin/LogoManager';

type LocaleData = {
  [key: string]: any;
};

type ViewMode = 'nav-crud' | 'hero-crud' | 'about-crud' | 'work-crud' | 'media-crud' | 'contact-crud' | 'footer-crud' | 'logo-crud';

export default function AdminPanel() {
  const params = useParams();
  const currentLocale = params.locale as string;
  const { data: session, status } = useSession();

  const [password, setPassword] = useState('admin123'); // Password for API operations
  const [adminEmail, setAdminEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState(''); // Separate state for login form
  const [selectedLocale, setSelectedLocale] = useState('en');
  const [localeData, setLocaleData] = useState<LocaleData>({});
  const [editedData, setEditedData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('nav-crud');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('nav');

  const locales = [
    { code: 'en', name: 'English', flag: '🇬🇧', color: 'blue' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', color: 'red' },
    { code: 'ne', name: 'नेपाली', flag: '🇳🇵', color: 'green' }
  ];

  // Load locale data
  useEffect(() => {
    if (session) {
      loadLocale(selectedLocale);
    }
  }, [selectedLocale, session]);

  const loadLocale = async (locale: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/locales?locale=${locale}`);
      if (!response.ok) throw new Error('Failed to load locale');
      const data = await response.json();
      setLocaleData(data.content);
      setEditedData(JSON.stringify(data.content, null, 2));
    } catch (err) {
      setError('Failed to load locale data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: adminEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        // Session will be automatically loaded
        setLoginPassword(''); // Clear login password from state for security
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setLoginPassword('');
    setAdminEmail('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const parsedData = JSON.parse(editedData);

      const response = await fetch('/api/admin/locales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locale: selectedLocale,
          content: parsedData,
          password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - Invalid password. Please use: admin123');
        }
        throw new Error(result.error || 'Failed to save');
      }

      setMessage(`✅ Successfully saved ${selectedLocale}.json`);
      setLocaleData(parsedData);

      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEditedData(JSON.stringify(localeData, null, 2));
    setError('');
    setMessage('');
  };

  const countTranslations = (obj: any): number => {
    let count = 0;
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += countTranslations(obj[key]);
      } else {
        count++;
      }
    }
    return count;
  };

  const renderField = (key: string, value: any, path: string = '', depth: number = 0) => {
    const fullPath = path ? `${path}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      return (
        <div key={fullPath} className={`mb-4 ${depth > 0 ? 'ml-4 pl-4 border-l-2 border-gray-200' : ''}`}>
          <h3 className={`font-semibold mb-3 flex items-center gap-2 ${
            depth === 0 ? 'text-xl text-gray-900' : 'text-base text-gray-700'
          }`}>
            <span className="text-purple-600">📁</span>
            {key}
          </h3>
          <div className="space-y-2">
            {Object.entries(value).map(([k, v]) => renderField(k, v, fullPath, depth + 1))}
          </div>
        </div>
      );
    }

    return (
      <div key={fullPath} className="mb-3 group">
        <label className="block text-sm font-medium text-gray-600 mb-1.5 flex items-center gap-2">
          <span className="text-gray-400">•</span>
          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{fullPath}</span>
        </label>
        <textarea
          value={value}
          onChange={(e) => {
            try {
              const newData = JSON.parse(editedData);
              const keys = fullPath.split('.');
              let obj = newData;
              for (let i = 0; i < keys.length - 1; i++) {
                obj = obj[keys[i]];
              }
              obj[keys[keys.length - 1]] = e.target.value;
              const updatedJson = JSON.stringify(newData, null, 2);
              setEditedData(updatedJson);
              setLocaleData(newData);
            } catch (err) {
              // If JSON parsing fails, just update the value directly
              console.error('Failed to parse JSON:', err);
            }
          }}
          rows={Math.min(Math.ceil(String(value).length / 60), 4)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white group-hover:border-gray-300 resize-none"
        />
      </div>
    );
  };

  const getSectionIcon = (section: string) => {
    const icons: { [key: string]: string } = {
      nav: '🧭',
      hero: '⭐',
      about: '👤',
      work: '💼',
      media: '📺',
      contact: '📧',
      footer: '📄'
    };
    return icons[section] || '📝';
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bS0yIDB2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md relative z-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Portal
            </h1>
            <p className="text-gray-500">Translation Management System</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="nextintecknology@gmail.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                autoFocus
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password *
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                💡 Email: <code className="bg-gray-100 px-2 py-0.5 rounded">nextintecknology@gmail.com</code>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                💡 Password: <code className="bg-gray-100 px-2 py-0.5 rounded">admin123</code>
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Translations',
      value: countTranslations(localeData),
      icon: '📝',
      color: 'blue'
    },
    {
      label: 'Sections',
      value: Object.keys(localeData).length,
      icon: '📁',
      color: 'purple'
    },
    {
      label: 'Current Language',
      value: locales.find(l => l.code === selectedLocale)?.name || selectedLocale,
      icon: locales.find(l => l.code === selectedLocale)?.flag || '🌐',
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-lg">Admin Portal</h2>
                <p className="text-xs text-gray-400">Translation CMS</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarOpen && (
            <>
              <div className="pb-2 px-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Content Sections</p>
              </div>

              <button
                onClick={() => setViewMode('nav-crud')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                  viewMode === 'nav-crud'
                    ? 'bg-slate-700/70 text-white'
                    : 'text-gray-300 hover:bg-slate-700/30'
                }`}
              >
                <span className="text-lg">🧭</span>
                <span>Navigation</span>
              </button>

              <button
                onClick={() => setViewMode('hero-crud')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                  viewMode === 'hero-crud'
                    ? 'bg-slate-700/70 text-white'
                    : 'text-gray-300 hover:bg-slate-700/30'
                }`}
              >
                <span className="text-lg">⭐</span>
                <span>Hero Section</span>
              </button>

              <button
                onClick={() => setViewMode('about-crud')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                  viewMode === 'about-crud'
                    ? 'bg-slate-700/70 text-white'
                    : 'text-gray-300 hover:bg-slate-700/30'
                }`}
              >
                <span className="text-lg">👤</span>
                <span>About Section</span>
              </button>

              <button
                onClick={() => setViewMode('work-crud')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                  viewMode === 'work-crud'
                    ? 'bg-slate-700/70 text-white'
                    : 'text-gray-300 hover:bg-slate-700/30'
                }`}
              >
                <span className="text-lg">💼</span>
                <span>Work/Projects</span>
              </button>

              <button
                onClick={() => setViewMode('media-crud')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                  viewMode === 'media-crud'
                    ? 'bg-slate-700/70 text-white'
                    : 'text-gray-300 hover:bg-slate-700/30'
                }`}
              >
                <span className="text-lg">📺</span>
                <span>Media</span>
              </button>

              <button
                onClick={() => setViewMode('contact-crud')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                  viewMode === 'contact-crud'
                    ? 'bg-slate-700/70 text-white'
                    : 'text-gray-300 hover:bg-slate-700/30'
                }`}
              >
                <span className="text-lg">📧</span>
                <span>Contact</span>
              </button>

              <button
                onClick={() => setViewMode('footer-crud')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                  viewMode === 'footer-crud'
                    ? 'bg-slate-700/70 text-white'
                    : 'text-gray-300 hover:bg-slate-700/30'
                }`}
              >
                <span className="text-lg">📄</span>
                <span>Footer</span>
              </button>

              <div className="pt-6 pb-2 px-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Other Tools</p>
              </div>

              <button
                onClick={() => setViewMode('logo-crud')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
                  viewMode === 'logo-crud'
                    ? 'bg-slate-700/70 text-white'
                    : 'text-gray-300 hover:bg-slate-700/30'
                }`}
              >
                <span className="text-lg">🎨</span>
                <span>Logo Manager</span>
              </button>

            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-all"
          >
            <svg className={`w-5 h-5 flex-shrink-0 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Translation Manager</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage multilingual content for your portfolio</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="flex gap-2">
                {locales.map((locale) => (
                  <button
                    key={locale.code}
                    onClick={() => setSelectedLocale(locale.code)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedLocale === locale.code
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-xl">{locale.flag}</span>
                    {selectedLocale === locale.code && <span className="text-sm">{locale.name}</span>}
                  </button>
                ))}
              </div>
              <a
                href={`/${currentLocale}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Preview Site</span>
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {/* Nav CRUD View */}
          {viewMode === 'nav-crud' && (
            <SectionCrudManager
              locale={selectedLocale}
              password={password}
              section="nav"
              sectionTitle="Navigation Menu"
              sectionIcon="🧭"
              description="Manage navigation menu items like Home, About, Work, Media, Contact, etc."
              onSuccess={(msg) => {
                setMessage(msg);
                setTimeout(() => setMessage(''), 5000);
              }}
              onError={(err) => {
                setError(err);
                setTimeout(() => setError(''), 5000);
              }}
            />
          )}

          {/* Hero CRUD View */}
          {viewMode === 'hero-crud' && (
            <SectionCrudManager
              locale={selectedLocale}
              password={password}
              section="hero"
              sectionTitle="Hero Section"
              sectionIcon="⭐"
              description="Manage hero/landing section content including greeting, name, title, subtitle, and CTA button text."
              onSuccess={(msg) => {
                setMessage(msg);
                setTimeout(() => setMessage(''), 5000);
              }}
              onError={(err) => {
                setError(err);
                setTimeout(() => setError(''), 5000);
              }}
            />
          )}

          {/* About CRUD View */}
          {viewMode === 'about-crud' && (
            <SectionCrudManager
              locale={selectedLocale}
              password={password}
              section="about"
              sectionTitle="About Section"
              sectionIcon="👤"
              description="Manage about section content including title, description, and highlight points."
              onSuccess={(msg) => {
                setMessage(msg);
                setTimeout(() => setMessage(''), 5000);
              }}
              onError={(err) => {
                setError(err);
                setTimeout(() => setError(''), 5000);
              }}
            />
          )}

          {/* Contact CRUD View */}
          {viewMode === 'contact-crud' && (
            <SectionCrudManager
              locale={selectedLocale}
              password={password}
              section="contact"
              sectionTitle="Contact Section"
              sectionIcon="📧"
              description="Manage contact page content including title, description, and social media labels."
              onSuccess={(msg) => {
                setMessage(msg);
                setTimeout(() => setMessage(''), 5000);
              }}
              onError={(err) => {
                setError(err);
                setTimeout(() => setError(''), 5000);
              }}
            />
          )}

          {/* Footer CRUD View */}
          {viewMode === 'footer-crud' && (
            <SectionCrudManager
              locale={selectedLocale}
              password={password}
              section="footer"
              sectionTitle="Footer Section"
              sectionIcon="📄"
              description="Manage footer content including copyright notice and mission statement."
              onSuccess={(msg) => {
                setMessage(msg);
                setTimeout(() => setMessage(''), 5000);
              }}
              onError={(err) => {
                setError(err);
                setTimeout(() => setError(''), 5000);
              }}
            />
          )}

          {/* Logo CRUD View */}
          {viewMode === 'logo-crud' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🎨</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Logo Manager</h2>
                    <p className="text-sm text-gray-700 mb-2">
                      Upload, preview, and manage your website logo.
                    </p>
                    <p className="text-xs text-gray-600">
                      The logo will be saved to the public directory and can be accessed site-wide.
                    </p>
                  </div>
                </div>
              </div>
              <LogoManager
                password={password}
                onSuccess={(msg) => {
                  setMessage(msg);
                  setTimeout(() => setMessage(''), 5000);
                }}
                onError={(err) => {
                  setError(err);
                  setTimeout(() => setError(''), 5000);
                }}
              />
            </div>
          )}

          {/* Work CRUD View */}
          {viewMode === 'work-crud' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💼</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Work/Projects CRUD Manager</h2>
                    <p className="text-sm text-gray-700 mb-2">
                      Create, Read, Update, and Delete work items for the {locales.find(l => l.code === selectedLocale)?.name} locale.
                    </p>
                    <p className="text-xs text-gray-600">
                      Changes are saved immediately to the locale file and will appear on the website after refresh.
                    </p>
                  </div>
                </div>
              </div>
              <WorkCrudManager
                locale={selectedLocale}
                password={password}
                onSuccess={(msg) => {
                  setMessage(msg);
                  setTimeout(() => setMessage(''), 5000);
                }}
                onError={(err) => {
                  setError(err);
                  setTimeout(() => setError(''), 5000);
                }}
              />
            </div>
          )}

          {/* Media CRUD View */}
          {viewMode === 'media-crud' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📺</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Media CRUD Manager</h2>
                    <p className="text-sm text-gray-700 mb-2">
                      Create, Read, Update, and Delete media items for the {locales.find(l => l.code === selectedLocale)?.name} locale.
                    </p>
                    <p className="text-xs text-gray-600">
                      Manage media appearances, TEDx talks, interviews, and other media content.
                    </p>
                  </div>
                </div>
              </div>
              <MediaCrudManager
                locale={selectedLocale}
                password={password}
                onSuccess={(msg) => {
                  setMessage(msg);
                  setTimeout(() => setMessage(''), 5000);
                }}
                onError={(err) => {
                  setError(err);
                  setTimeout(() => setError(''), 5000);
                }}
              />
            </div>
          )}


          {/* Status Messages - Global for all views */}
          {(message || error) && (
            <div className="mt-6">
              {message && (
                <div className="flex items-center gap-3 px-6 py-3 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {message}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-3 px-6 py-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-medium mt-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
