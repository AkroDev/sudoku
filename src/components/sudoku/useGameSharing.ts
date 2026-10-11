import { useEffect, useState } from 'react';
import { buildSharePagePath, getShareText, type ShareDetails } from '@/lib/share';
import type { Locale } from '@/i18n';

export function useGameSharing(puzzleId: string, locale: Locale) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBusy(false);
    setCopied(false);
  }, [puzzleId]);

  const share = async (details: ShareDetails) => {
    const localizedDetails = { ...details, locale };
    const shareText = getShareText(localizedDetails, locale);
    const shareUrl = new URL(buildSharePagePath(localizedDetails, locale), window.location.origin).toString();
    const clipboardText = `${shareText}\n${shareUrl}`;
    setBusy(true);
    setCopied(false);

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Sudoku #${details.puzzleId}`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(clipboardText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2400);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(clipboardText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2400);
      } catch {
        setCopied(false);
      }
    } finally {
      setBusy(false);
    }
  };

  return { busy, copied, share };
}
