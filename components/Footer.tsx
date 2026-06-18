'use client';

import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="py-12 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4">
          <p className="text-sm opacity-70">{t('mission')}</p>
          <p className="text-sm opacity-50">
            © {new Date().getFullYear()} Nanami Wakayama. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
