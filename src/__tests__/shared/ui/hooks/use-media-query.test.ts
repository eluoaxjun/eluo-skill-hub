import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "@/shared/ui/hooks/use-media-query";

// matchMedia 모의 객체 헬퍼
function createMatchMediaMock(matches: boolean) {
  const listeners: Array<(event: MediaQueryListEvent) => void> = [];

  const mql: MediaQueryList = {
    matches,
    media: "",
    onchange: null,
    addEventListener: jest.fn(
      (_event: string, handler: (event: MediaQueryListEvent) => void) => {
        listeners.push(handler);
      }
    ),
    removeEventListener: jest.fn(
      (_event: string, handler: (event: MediaQueryListEvent) => void) => {
        const index = listeners.indexOf(handler);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    ),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };

  return {
    mql,
    listeners,
    triggerChange: (newMatches: boolean) => {
      (mql as { matches: boolean }).matches = newMatches;
      listeners.forEach((listener) =>
        listener({ matches: newMatches } as MediaQueryListEvent)
      );
    },
  };
}

describe("useMediaQuery", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("SSR 환경에서 기본값 false를 반환한다", () => {
    // SSR 환경을 시뮬레이션하기 위해 matchMedia를 undefined로 설정
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));

    expect(result.current).toBe(false);
  });

  it("매칭되는 미디어 쿼리에 대해 true를 반환한다", () => {
    const { mql } = createMatchMediaMock(true);

    window.matchMedia = jest.fn().mockReturnValue(mql);

    const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));

    expect(result.current).toBe(true);
  });

  it("매칭되지 않는 미디어 쿼리에 대해 false를 반환한다", () => {
    const { mql } = createMatchMediaMock(false);

    window.matchMedia = jest.fn().mockReturnValue(mql);

    const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));

    expect(result.current).toBe(false);
  });

  it("미디어 쿼리 변경 시 값을 업데이트한다", () => {
    const { mql, triggerChange } = createMatchMediaMock(false);

    window.matchMedia = jest.fn().mockReturnValue(mql);

    const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));

    expect(result.current).toBe(false);

    act(() => {
      triggerChange(true);
    });

    expect(result.current).toBe(true);
  });

  it("언마운트 시 이벤트 리스너를 정리한다", () => {
    const { mql } = createMatchMediaMock(false);

    window.matchMedia = jest.fn().mockReturnValue(mql);

    const { unmount } = renderHook(() => useMediaQuery("(max-width: 767px)"));

    unmount();

    expect(mql.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function)
    );
  });

  it("쿼리 문자열이 변경되면 새로운 matchMedia를 생성한다", () => {
    const mock1 = createMatchMediaMock(true);
    const mock2 = createMatchMediaMock(false);

    let callCount = 0;
    window.matchMedia = jest.fn().mockImplementation(() => {
      callCount++;
      return callCount <= 1 ? mock1.mql : mock2.mql;
    });

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useMediaQuery(query),
      { initialProps: { query: "(max-width: 767px)" } }
    );

    expect(result.current).toBe(true);

    rerender({ query: "(max-width: 1023px)" });

    expect(result.current).toBe(false);
    // 이전 리스너가 정리되었는지 확인
    expect(mock1.mql.removeEventListener).toHaveBeenCalled();
  });
});
