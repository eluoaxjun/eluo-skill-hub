import { useState, useEffect } from "react";

/**
 * CSS 미디어 쿼리 문자열을 받아 현재 매칭 여부를 boolean으로 반환하는 유틸리티 훅.
 * SSR 환경에서는 기본값 false를 반환하여 하이드레이션 불일치를 방지한다.
 *
 * @param query - CSS 미디어 쿼리 문자열 (예: "(max-width: 767px)")
 * @returns 미디어 쿼리 매칭 여부
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia === "undefined") {
      return;
    }

    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mql.addEventListener("change", handleChange);

    return () => {
      mql.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
