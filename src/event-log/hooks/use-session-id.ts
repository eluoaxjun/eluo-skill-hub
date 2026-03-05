'use client';

import { useMemo } from 'react';

const SESSION_KEY = 'eluo_session_id';

function generateSessionId(): string {
  return crypto.randomUUID();
}

export function useSessionId(): string {
  return useMemo(() => {
    if (typeof window === 'undefined') return '';
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = generateSessionId();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  }, []);
}
