import { useCallback, useEffect, useState } from 'react';
import type { CompletedGameRecord } from '@/lib/statistics';
import { getStoredPublicNickname, submitPublicScore } from '@/lib/public-score';

export function usePublicScoreSubmission() {
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setNickname(getStoredPublicNickname());
  }, []);

  const submitScore = useCallback(async (record: CompletedGameRecord) => {
    setBusy(true);
    try {
      return await submitPublicScore(record, nickname);
    } finally {
      setBusy(false);
    }
  }, [nickname]);

  return { nickname, setNickname, busy, submitScore };
}
