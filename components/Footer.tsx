'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="py-12 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">{t('mission')}</p>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Nanami Wakayama. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
