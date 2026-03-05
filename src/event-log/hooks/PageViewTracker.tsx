'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useTrackEvent } from './use-track-event';

export default function PageViewTracker() {
  const pathname = usePathname();
  const trackEvent = useTrackEvent();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      trackEvent('nav.page_view', { path: pathname });
      prevPathRef.current = pathname;
    }
  }, [pathname, trackEvent]);

  return null;
}
