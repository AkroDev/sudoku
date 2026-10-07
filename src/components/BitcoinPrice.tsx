'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const KRAKEN_TICKER_URL = 'https://api.kraken.com/0/public/Ticker?pair=XXBTZEUR%2CXXBTZUSD';
const REFRESH_INTERVAL_MS = 60_000;
const ONCHAIN_ADDRESS = 'bc1qwdrmh657exlyvyhwsjrj2a949hsqjh6nh5pdwq';
const BITCOIN_URI = `bitcoin:${ONCHAIN_ADDRESS}`;
const GITHUB_URL = 'https://github.com/AkroDev';

type TickerPair = {
  c?: [string, ...string[]];
};

type KrakenTickerResponse = {
  error?: string[];
  result?: Record<string, TickerPair>;
};

type BitcoinPrices = {
  eur: number | null;
  usd: number | null;
};

function parseLastPrice(pair: TickerPair | undefined) {
  const value = Number(pair?.c?.[0]);
  return Number.isFinite(value) ? value : null;
}

function formatPrice(value: number | null, currency: 'EUR' | 'USD') {
  if (value === null) return '—';

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BitcoinPrice() {
  const [prices, setPrices] = useState<BitcoinPrices>({ eur: null, usd: null });
  const [supportOpen, setSupportOpen] = useState(false);
  const [qrSvg, setQrSvg] = useState('');
  const [addressCopied, setAddressCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadPrices = async () => {
      try {
        const response = await fetch(KRAKEN_TICKER_URL, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`Kraken responded with ${response.status}`);

        const data = await response.json() as KrakenTickerResponse;
        if (data.error?.length || !data.result) throw new Error('Kraken returned an invalid ticker response');

        setPrices((current) => ({
          eur: parseLastPrice(data.result?.XXBTZEUR) ?? current.eur,
          usd: parseLastPrice(data.result?.XXBTZUSD) ?? current.usd,
        }));
      } catch {
        // Keep the last known values so a short API outage does not make the header jump.
      }
    };

    void loadPrices();
    const intervalId = window.setInterval(() => void loadPrices(), REFRESH_INTERVAL_MS);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!supportOpen) return;

    let active = true;
    void QRCode.toString(BITCOIN_URI, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#08080a',
        light: '#ffffff',
      },
    }).then((svg) => {
      if (active) setQrSvg(svg);
    }).catch(() => {
      if (active) setQrSvg('');
    });

    return () => {
      active = false;
    };
  }, [supportOpen]);

  useEffect(() => {
    if (!supportOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSupportOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [supportOpen]);

  const copyOnchainAddress = async () => {
    try {
      await navigator.clipboard.writeText(ONCHAIN_ADDRESS);
      setAddressCopied(true);
      window.setTimeout(() => setAddressCopied(false), 1800);
    } catch {
      setAddressCopied(false);
    }
  };

  return (
    <div className="bitcoin-widget">
      <div className="bitcoin-price" aria-label="Cours du Bitcoin" aria-live="polite">
        <span className="bitcoin-price-item">
          <span className="bitcoin-price-label">BTC/EUR</span>
          <strong>{formatPrice(prices.eur, 'EUR')}</strong>
        </span>
        <span className="bitcoin-price-item">
          <span className="bitcoin-price-label">BTC/USD</span>
          <strong>{formatPrice(prices.usd, 'USD')}</strong>
        </span>
      </div>
      <button
        className="bitcoin-support-button"
        type="button"
        aria-expanded={supportOpen}
        aria-controls="bitcoin-support-panel"
        onClick={() => setSupportOpen((current) => !current)}
      >
        <span aria-hidden="true">⚡</span> Soutenir mes projets open-source
      </button>
      {supportOpen && (
        <div className="bitcoin-support-panel" id="bitcoin-support-panel" role="dialog" aria-label="Soutenir mes projets open-source">
          <div className="support-panel-header">
            <strong>Soutenir mes projets open-source</strong>
            <button
              className="support-close-button"
              type="button"
              aria-label="Fermer"
              onClick={() => setSupportOpen(false)}
            >
              ×
            </button>
          </div>

          <a className="support-github-link" href={GITHUB_URL} target="_blank" rel="noreferrer">
            <span>Voir mes projets GitHub</span>
            <span aria-hidden="true">↗</span>
          </a>

          <section className="support-method" aria-labelledby="bitcoin-onchain-title">
            <div className="support-method-heading">
              <strong id="bitcoin-onchain-title">Bitcoin on-chain</strong>
              <span className="support-method-tag">QR</span>
            </div>
            <div className="support-onchain-content">
              <div className="bitcoin-qr" role="img" aria-label="QR code Bitcoin on-chain">
                {qrSvg ? (
                  <span dangerouslySetInnerHTML={{ __html: qrSvg }} />
                ) : (
                  <span className="bitcoin-qr-placeholder" aria-hidden="true">₿</span>
                )}
              </div>
              <div className="support-address-content">
                <code className="support-address">{ONCHAIN_ADDRESS}</code>
                <button className="support-copy-button" type="button" onClick={copyOnchainAddress}>
                  {addressCopied ? 'Adresse copiée' : 'Copier l’adresse'}
                </button>
              </div>
            </div>
          </section>

          <section className="support-method support-method--future" aria-label="Lightning bientôt disponible">
            <div className="support-method-heading">
              <strong>Lightning</strong>
              <span className="support-method-tag">À venir</span>
            </div>
            <p>QR Lightning bientôt disponible.</p>
          </section>
        </div>
      )}
    </div>
  );
}
