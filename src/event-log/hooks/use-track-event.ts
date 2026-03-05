'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/shared/infrastructure/supabase/client';
import { useCurrentUserId } from '@/features/dashboard/DashboardLayoutClient';
import { useSessionId } from './use-session-id';
import type { EventName, EventPropertiesMap, EventLogInsert } from '@/event-log/domain/types';

const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 2000;

export function useTrackEvent() {
  const userId = useCurrentUserId();
  const sessionId = useSessionId();
  const bufferRef = useRef<EventLogInsert[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flush = useCallback(() => {
    const events = bufferRef.current;
    if (events.length === 0) return;
    bufferRef.current = [];

    const supabase = createClient();
    void Promise.resolve(supabase.from('event_logs').insert(events)).catch(() => {
      // fire-and-forget
    });
  }, []);

  const flushBeacon = useCallback(() => {
    const events = bufferRef.current;
    if (events.length === 0) return;
    bufferRef.current = [];

    const blob = new Blob([JSON.stringify(events)], { type: 'application/json' });
    navigator.sendBeacon('/api/event-log', blob);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(flush, FLUSH_INTERVAL_MS);

    const handleBeforeUnload = () => {
      flushBeacon();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      flush();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flush, flushBeacon]);

  const trackEvent = useCallback(
    <T extends EventName>(eventName: T, properties: EventPropertiesMap[T]) => {
      const event: EventLogInsert = {
        event_name: eventName,
        properties,
        user_id: userId || undefined,
        session_id: sessionId || undefined,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      };

      bufferRef.current.push(event);

      if (bufferRef.current.length >= BATCH_SIZE) {
        flush();
      }
    },
    [userId, sessionId, flush]
  );

  return trackEvent;
}
