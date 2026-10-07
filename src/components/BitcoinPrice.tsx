'use client';

import { useEffect, useState } from 'react';

const KRAKEN_TICKER_URL = 'https://api.kraken.com/0/public/Ticker?pair=XXBTZEUR%2CXXBTZUSD';
const REFRESH_INTERVAL_MS = 60_000;

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
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BitcoinPrice() {
  const [prices, setPrices] = useState<BitcoinPrices>({ eur: null, usd: null });

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

  return (
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
  );
}
