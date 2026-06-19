'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import WorkCrudManager from '@/components/admin/WorkCrudManager';
import MediaCrudManager from '@/components/admin/MediaCrudManager';
import SectionCrudManager from '@/components/admin/SectionCrudManager';
import LogoManager from '@/components/admin/LogoManager';

type ViewMode =
  | 'nav-crud' | 'hero-crud' | 'about-crud' | 'work-crud'
  | 'media-crud' | 'contact-crud' | 'footer-crud' | 'logo-crud';

const NAV_ITEMS: { mode: ViewMode; icon: string; label: string }[] = [
  { mode: 'nav-crud',     icon: '🧭', label: 'Navigation'  },
  { mode: 'hero-crud',    icon: '⭐', label: 'Hero'         },
  { mode: 'about-crud',   icon: '👤', label: 'About'        },
  { mode: 'work-crud',    icon: '💼', label: 'Work'         },
  { mode: 'media-crud',   icon: '📺', label: 'Media'        },
  { mode: 'contact-crud', icon: '📧', label: 'Contact'      },
  { mode: 'footer-crud',  icon: '📄', label: 'Footer'       },
];

const LOCALES = [
  { code: 'en', name: 'English',  flag: '🇬🇧' },
  { code: 'ja', name: '日本語',   flag: '🇯🇵' },
  { code: 'ne', name: 'नेपाली',  flag: '🇳🇵' },
];

export default function AdminPanel() {
  const params = useParams();
  const currentLocale = params.locale as string;
  const { data: session, status } = useSession();

  const password = 'admin123';
  const [adminEmail, setAdminEmail]       = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedLocale, setSelectedLocale] = useState('en');
  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState('');
  const [error, setError]       = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('nav-crud');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Open sidebar by default on desktop, closed on mobile
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    setSidebarOpen(mql.matches);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const navigate = (mode: ViewMode) => {
    setViewMode(mode);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const showSuccess = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };
  const showError = (err: string) => {
    setError(err);
    setTimeout(() => setError(''), 5000);
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
      } else {
        setLoginPassword('');
      }
    } catch {
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

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // ── Login ────────────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Portal</h1>
            <p className="text-sm text-gray-500">Translation Management System</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                autoFocus
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-base"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

  // ── Authenticated layout ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-50 flex-shrink-0 h-full
          bg-gradient-to-b from-slate-900 to-slate-800 text-white
          transition-all duration-300 flex flex-col shadow-2xl
          ${sidebarOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full md:translate-x-0 md:w-20'}
        `}
      >
        {/* Sidebar logo */}
        <div className="p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <h2 className="font-bold text-base leading-tight">Admin Portal</h2>
                <p className="text-xs text-gray-400">Translation CMS</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarOpen && (
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold px-3 pb-2">
              Content
            </p>
          )}

          {NAV_ITEMS.map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => navigate(mode)}
              title={!sidebarOpen ? label : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
                ${viewMode === mode ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}
                ${!sidebarOpen ? 'justify-center' : ''}
              `}
            >
              <span className="text-lg flex-shrink-0">{icon}</span>
              {sidebarOpen && <span>{label}</span>}
            </button>
          ))}

          <div className={sidebarOpen ? 'pt-4 pb-1' : 'py-3'}>
            {sidebarOpen && (
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold px-3">
                Tools
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('logo-crud')}
            title={!sidebarOpen ? 'Logo' : undefined}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm
              ${viewMode === 'logo-crud' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5'}
              ${!sidebarOpen ? 'justify-center' : ''}
            `}
          >
            <span className="text-lg flex-shrink-0">🎨</span>
            {sidebarOpen && <span>Logo Manager</span>}
          </button>
        </nav>

        {/* Collapse toggle — desktop only */}
        <div className="p-3 border-t border-slate-700 flex-shrink-0 hidden md:block">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all"
          >
            <svg
              className={`w-5 h-5 flex-shrink-0 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {sidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0 flex flex-col">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm flex-shrink-0">
          <div className="px-4 md:px-6 py-3 flex items-center gap-3">

            {/* Hamburger — mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 flex-shrink-0"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-xl font-bold text-gray-900 truncate">
                Translation Manager
              </h1>
              <p className="hidden md:block text-xs text-gray-500">
                Manage multilingual portfolio content
              </p>
            </div>

            {/* Language switcher */}
            <div className="flex gap-1 flex-shrink-0">
              {LOCALES.map((locale) => (
                <button
                  key={locale.code}
                  onClick={() => setSelectedLocale(locale.code)}
                  title={locale.name}
                  className={`
                    flex items-center gap-1 px-2 py-1.5 rounded-lg font-medium transition-all text-sm
                    ${selectedLocale === locale.code
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  <span className="text-base leading-none">{locale.flag}</span>
                  {selectedLocale === locale.code && (
                    <span className="hidden sm:inline text-xs">{locale.name}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Preview */}
            <a
              href={`/${currentLocale}`}
              target="_blank"
              className="p-2 md:px-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden md:inline text-sm">Preview</span>
            </a>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 md:px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:inline text-sm">Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6 flex-1">

          {viewMode === 'nav-crud' && (
            <SectionCrudManager locale={selectedLocale} password={password} section="nav"
              sectionTitle="Navigation Menu" sectionIcon="🧭"
              description="Manage navigation menu items."
              onSuccess={showSuccess} onError={showError} />
          )}
          {viewMode === 'hero-crud' && (
            <SectionCrudManager locale={selectedLocale} password={password} section="hero"
              sectionTitle="Hero Section" sectionIcon="⭐"
              description="Manage hero section content including greeting, name, title, and CTA."
              onSuccess={showSuccess} onError={showError} />
          )}
          {viewMode === 'about-crud' && (
            <SectionCrudManager locale={selectedLocale} password={password} section="about"
              sectionTitle="About Section" sectionIcon="👤"
              description="Manage about section content including title, description, and highlights."
              onSuccess={showSuccess} onError={showError} />
          )}
          {viewMode === 'contact-crud' && (
            <SectionCrudManager locale={selectedLocale} password={password} section="contact"
              sectionTitle="Contact Section" sectionIcon="📧"
              description="Manage contact page content."
              onSuccess={showSuccess} onError={showError} />
          )}
          {viewMode === 'footer-crud' && (
            <SectionCrudManager locale={selectedLocale} password={password} section="footer"
              sectionTitle="Footer Section" sectionIcon="📄"
              description="Manage footer content."
              onSuccess={showSuccess} onError={showError} />
          )}

          {viewMode === 'work-crud' && (
            <WorkCrudManager locale={selectedLocale} password={password}
              onSuccess={showSuccess} onError={showError} />
          )}
          {viewMode === 'media-crud' && (
            <MediaCrudManager locale={selectedLocale} password={password}
              onSuccess={showSuccess} onError={showError} />
          )}
          {viewMode === 'logo-crud' && (
            <LogoManager password={password} onSuccess={showSuccess} onError={showError} />
          )}

          {/* Status toasts */}
          {(message || error) && (
            <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 space-y-2 z-50">
              {message && (
                <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl font-medium shadow-lg text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {message}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-medium shadow-lg text-sm">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
