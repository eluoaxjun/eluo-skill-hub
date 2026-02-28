/**
 * @file dashboard-integration.test.tsx
 * @description Task 8.1 - 대시보드 목업 데이터를 실제 DB 조회로 대체하는 통합 테스트
 *
 * SkillSummary 타입 변경, useDashboardState 훅의 스킬 파라미터 수용,
 * SkillCard/SkillCardGrid 컴포넌트 업데이트, page.tsx 서버 사이드 데이터 페치를 검증한다.
 */

import { render, screen } from "@testing-library/react";
import type { SkillSummary } from "@/shared/ui/types/dashboard";

describe("Task 8.1 - SkillSummary 타입 변경", () => {
  it("새로운 SkillSummary 타입에 title, category, createdAt, markdownFilePath 필드가 존재한다", () => {
    const skill: SkillSummary = {
      id: "test-id",
      title: "테스트 스킬",
      category: "개발",
      createdAt: "2026-01-01T00:00:00.000Z",
      markdownFilePath: "test.md",
    };

    expect(skill.id).toBe("test-id");
    expect(skill.title).toBe("테스트 스킬");
    expect(skill.category).toBe("개발");
    expect(skill.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(skill.markdownFilePath).toBe("test.md");
  });

  it("category는 JobCategory 타입이어야 한다", () => {
    const categories = ["기획", "디자인", "퍼블리싱", "개발", "QA"] as const;
    categories.forEach((cat) => {
      const skill: SkillSummary = {
        id: "id",
        title: "title",
        category: cat,
        createdAt: "2026-01-01T00:00:00.000Z",
        markdownFilePath: "test.md",
      };
      expect(skill.category).toBe(cat);
    });
  });
});

describe("Task 8.1 - SkillCard 업데이트", () => {
  // SkillCard를 동적으로 import하여 lazy 검증
  it("제목(title)을 h3 태그로 렌더링한다", async () => {
    const { SkillCard } = await import(
      "@/shared/ui/components/skill-card"
    );

    const skill: SkillSummary = {
      id: "test-1",
      title: "API 스캐폴딩 생성",
      category: "개발",
      createdAt: "2026-02-15T09:30:00.000Z",
      markdownFilePath: "abc.md",
    };

    render(<SkillCard skill={skill} />);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("API 스캐폴딩 생성");
  });

  it("카테고리 배지를 렌더링한다", async () => {
    const { SkillCard } = await import(
      "@/shared/ui/components/skill-card"
    );

    const skill: SkillSummary = {
      id: "test-2",
      title: "디자인 토큰 추출",
      category: "디자인",
      createdAt: "2026-02-15T09:30:00.000Z",
      markdownFilePath: "abc.md",
    };

    render(<SkillCard skill={skill} />);

    expect(screen.getByText("디자인")).toBeInTheDocument();
  });

  it("생성일을 렌더링한다", async () => {
    const { SkillCard } = await import(
      "@/shared/ui/components/skill-card"
    );

    const skill: SkillSummary = {
      id: "test-3",
      title: "테스트 스킬",
      category: "QA",
      createdAt: "2026-02-15T09:30:00.000Z",
      markdownFilePath: "abc.md",
    };

    render(<SkillCard skill={skill} />);

    // 날짜가 어떤 형식으로든 표시되어야 한다
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });
});

describe("Task 8.1 - SkillCardGrid 업데이트", () => {
  it("새로운 SkillSummary 타입의 스킬 목록을 렌더링한다", async () => {
    const { SkillCardGrid } = await import(
      "@/shared/ui/components/skill-card-grid"
    );

    const skills: SkillSummary[] = [
      {
        id: "s1",
        title: "스킬 A",
        category: "기획",
        createdAt: "2026-01-01T00:00:00.000Z",
        markdownFilePath: "a.md",
      },
      {
        id: "s2",
        title: "스킬 B",
        category: "개발",
        createdAt: "2026-01-02T00:00:00.000Z",
        markdownFilePath: "b.md",
      },
    ];

    render(<SkillCardGrid skills={skills} />);

    expect(screen.getByText("스킬 A")).toBeInTheDocument();
    expect(screen.getByText("스킬 B")).toBeInTheDocument();
  });

  it("스킬이 없을 때 빈 상태 메시지를 표시한다", async () => {
    const { SkillCardGrid } = await import(
      "@/shared/ui/components/skill-card-grid"
    );

    render(<SkillCardGrid skills={[]} />);

    expect(screen.getByText("등록된 스킬이 없습니다")).toBeInTheDocument();
  });
});

describe("Task 8.1 - page.tsx 서버 사이드 데이터 페치", () => {
  // page.tsx의 서버 컴포넌트에서 GetSkillsUseCase를 호출하여 스킬 데이터를 DashboardShell에 전달하는지 검증
  const mockGetUser = jest.fn();
  const mockFrom = jest.fn();

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("서버 컴포넌트에서 스킬 데이터를 조회하여 DashboardShell에 skills props로 전달한다", async () => {
    const mockSkillRows = [
      {
        id: "skill-1",
        title: "서버 스킬",
        category: "개발",
        markdown_file_path: "test.md",
        author_id: "user-1",
        created_at: "2026-01-01T00:00:00.000Z",
      },
    ];

    mockGetUser.mockResolvedValue({
      data: { user: { email: "test@eluocnc.com" } },
    });

    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockSkillRows,
          error: null,
        }),
      }),
    });

    jest.doMock("@/shared/infrastructure/supabase/server", () => ({
      createSupabaseServerClient: jest.fn().mockResolvedValue({
        auth: { getUser: () => mockGetUser() },
        from: mockFrom,
      }),
    }));

    jest.doMock("@/shared/ui/components/dashboard-shell", () => ({
      DashboardShell: ({
        userEmail,
        skills,
      }: {
        userEmail: string;
        skills: SkillSummary[];
      }) => (
        <div
          data-testid="dashboard-shell"
          data-user-email={userEmail}
          data-skills-count={skills.length}
        >
          DashboardShell
        </div>
      ),
    }));

    const { default: Home } = await import("@/app/page");
    const Page = await Home();
    render(Page);

    const shell = screen.getByTestId("dashboard-shell");
    expect(shell).toHaveAttribute("data-user-email", "test@eluocnc.com");
    expect(shell).toHaveAttribute("data-skills-count", "1");
  });
});
