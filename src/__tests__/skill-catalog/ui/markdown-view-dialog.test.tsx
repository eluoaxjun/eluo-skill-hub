/**
 * @file markdown-view-dialog.test.tsx
 * @description Task 8.3 - 스킬 상세 뷰(마크다운 렌더링 다이얼로그) 컴포넌트 테스트
 *
 * MarkdownViewDialog 컴포넌트가 마크다운 콘텐츠를 가져와
 * react-markdown으로 렌더링하고, 다이얼로그 형태로 표시하는지 검증한다.
 */

import { render, screen, waitFor } from "@testing-library/react";

// react-markdown 및 remark-gfm ESM 모듈을 모킹
jest.mock("react-markdown", () => {
  return {
    __esModule: true,
    default: ({ children }: { children: string }) => {
      // 간단히 마크다운의 # 헤딩을 파싱하여 렌더링
      const lines = children.split("\n");
      return (
        <div data-testid="markdown-content">
          {lines.map((line, i) => {
            if (line.startsWith("# ")) {
              return <h1 key={i}>{line.slice(2)}</h1>;
            }
            if (line.trim()) {
              return <p key={i}>{line}</p>;
            }
            return null;
          })}
        </div>
      );
    },
  };
});

jest.mock("remark-gfm", () => {
  return {
    __esModule: true,
    default: () => {},
  };
});

// global fetch 모킹
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Task 8.3 - MarkdownViewDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("open이 true일 때 다이얼로그를 렌더링한다", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: "# Hello" }),
    });

    const { MarkdownViewDialog } = await import(
      "@/shared/ui/components/markdown-view-dialog"
    );

    render(
      <MarkdownViewDialog
        open={true}
        onOpenChange={jest.fn()}
        skillId="skill-1"
        skillTitle="테스트 스킬"
        markdownFilePath="test.md"
      />
    );

    expect(screen.getByText("테스트 스킬")).toBeInTheDocument();
  });

  it("open이 false일 때 다이얼로그를 렌더링하지 않는다", async () => {
    const { MarkdownViewDialog } = await import(
      "@/shared/ui/components/markdown-view-dialog"
    );

    render(
      <MarkdownViewDialog
        open={false}
        onOpenChange={jest.fn()}
        skillId="skill-1"
        skillTitle="테스트 스킬"
        markdownFilePath="test.md"
      />
    );

    expect(screen.queryByText("테스트 스킬")).not.toBeInTheDocument();
  });

  it("API에서 마크다운 콘텐츠를 가져와 렌더링한다", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ content: "# 마크다운 제목\n\n본문 텍스트입니다." }),
    });

    const { MarkdownViewDialog } = await import(
      "@/shared/ui/components/markdown-view-dialog"
    );

    render(
      <MarkdownViewDialog
        open={true}
        onOpenChange={jest.fn()}
        skillId="skill-1"
        skillTitle="테스트 스킬"
        markdownFilePath="test.md"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("마크다운 제목")).toBeInTheDocument();
    });

    expect(screen.getByText("본문 텍스트입니다.")).toBeInTheDocument();
  });

  it("API 호출 시 올바른 URL을 사용한다", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: "# Test" }),
    });

    const { MarkdownViewDialog } = await import(
      "@/shared/ui/components/markdown-view-dialog"
    );

    render(
      <MarkdownViewDialog
        open={true}
        onOpenChange={jest.fn()}
        skillId="my-skill-id"
        skillTitle="테스트"
        markdownFilePath="test.md"
      />
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/skills/my-skill-id/markdown"
      );
    });
  });

  it("API 호출 실패 시 오류 메시지를 표시한다", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "파일을 찾을 수 없습니다" }),
    });

    const { MarkdownViewDialog } = await import(
      "@/shared/ui/components/markdown-view-dialog"
    );

    render(
      <MarkdownViewDialog
        open={true}
        onOpenChange={jest.fn()}
        skillId="skill-1"
        skillTitle="테스트 스킬"
        markdownFilePath="test.md"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/마크다운 파일을 불러올 수 없습니다/)
      ).toBeInTheDocument();
    });
  });

  it("로딩 중 상태를 표시한다", async () => {
    // fetch가 resolve되지 않는 상태를 시뮬레이션
    mockFetch.mockReturnValue(new Promise(() => {}));

    const { MarkdownViewDialog } = await import(
      "@/shared/ui/components/markdown-view-dialog"
    );

    render(
      <MarkdownViewDialog
        open={true}
        onOpenChange={jest.fn()}
        skillId="skill-1"
        skillTitle="테스트 스킬"
        markdownFilePath="test.md"
      />
    );

    // 로딩 상태가 표시되어야 한다
    expect(screen.getByText(/로딩/)).toBeInTheDocument();
  });
});
