'use client';

import BitcoinPrice from '@/components/BitcoinPrice';
import LocaleSwitch from '@/components/LocaleSwitch';
import { localizedPath, useLocaleText } from '@/i18n';

type AppHeaderProps = {
  page: 'hall-of-fame' | 'statistics';
  grid?: string | null;
  returnGrid?: string | null;
};

export default function AppHeader({ page, grid = null, returnGrid = null }: AppHeaderProps) {
  const { locale, t } = useLocaleText();
  const hallPath = localizedPath('/sudoku/hall-of-fame', locale);

  return (
    <header className="topbar">
      <a className="brand-link" href={locale === 'en' ? 'https://akrolabs.fr/en/labs' : 'https://akrolabs.fr/fr/labs'}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><img src="/logo-akrolabs.svg" alt="" /></span>
          <div>
            <p className="brand-name">AkroLabs</p>
            <p className="brand-subtitle">{t('Sudoku')}</p>
          </div>
        </div>
      </a>
      <BitcoinPrice />
      <div className="topbar-page-info">
        <LocaleSwitch />
        <div className="topbar-meta">
          {page === 'hall-of-fame' ? (
            <>
              <span>{t('HALL OF FAME')}</span>
              {grid && <a className="grid-return-link" href={localizedPath(`/sudoku/${grid}`, locale)}>#{grid}</a>}
              {!grid && returnGrid && <a className="grid-return-link" href={localizedPath(`/sudoku/${returnGrid}`, locale)}>↩ #{returnGrid}</a>}
              {grid && <a className="grid-return-link" href={`${hallPath}?from=${grid}`}>{t('Toutes les grilles')}</a>}
            </>
          ) : (
            <>
              <span>{t('STATISTIQUES PERSONNELLES')}</span>
              <a className="grid-return-link" href={localizedPath('/', locale)}>{t('Sudoku')}</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
