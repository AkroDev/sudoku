'use client';

import { usePathname } from 'next/navigation';
import { localizedPath, useLocaleText } from '@/i18n';

export default function LocaleSwitch() {
  const pathname = usePathname() ?? '/';
  const { locale, t } = useLocaleText();
  const nextLocale = locale === 'fr' ? 'en' : 'fr';

  return (
    <button
      className="locale-switch"
      type="button"
      aria-label={locale === 'fr' ? 'English' : 'Français'}
      title={locale === 'fr' ? 'English' : 'Français'}
      onClick={() => window.location.assign(`${localizedPath(pathname, nextLocale)}${window.location.search}${window.location.hash}`)}
    >
      {locale === 'fr' ? 'EN' : 'FR'}
      <span className="sr-only">{t(locale === 'fr' ? 'English' : 'Français')}</span>
    </button>
  );
}
