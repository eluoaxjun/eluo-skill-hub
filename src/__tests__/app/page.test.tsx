import { render, screen } from "@testing-library/react";
import type { SkillSummary } from "@/shared/ui/types/dashboard";

// createSupabaseServerClient 모킹
const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/shared/infrastructure/supabase/server", () => ({
  createSupabaseServerClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

// DashboardShell을 모킹하여 전달된 props를 검증한다
jest.mock("@/shared/ui/components/dashboard-shell", () => ({
  DashboardShell: ({
    userEmail,
    skills,
  }: {
    userEmail?: string;
    skills?: SkillSummary[];
  }) => (
    <div
      data-testid="dashboard-shell"
      data-user-email={userEmail ?? ""}
      data-skills-count={skills?.length ?? 0}
    >
      DashboardShell
    </div>
  ),
}));

// SupabaseSkillRepository 모킹 - findAll이 호출되도록 설정
const mockFindAll = jest.fn();
jest.mock("@/skill-catalog/infrastructure/SupabaseSkillRepository", () => ({
  SupabaseSkillRepository: jest.fn().mockImplementation(() => ({
    findAll: mockFindAll,
  })),
}));

describe("Home (page.tsx) - 서버 컴포넌트 인증 정보 전달", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 기본 findAll 반환값 설정
    mockFindAll.mockResolvedValue([]);
  });

  it("createSupabaseServerClient를 호출하여 사용자 정보를 조회한다", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "test-uuid",
          email: "user@eluocnc.com",
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: "2024-01-01",
        },
      },
      error: null,
    });

    const Home = (await import("@/app/page")).default;
    const Page = await Home();
    render(Page);

    expect(mockGetUser).toHaveBeenCalledTimes(1);
  });

  it("사용자 이메일만 추출하여 DashboardShell에 userEmail props로 전달한다", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "test-uuid",
          email: "user@eluocnc.com",
          app_metadata: { provider: "email" },
          user_metadata: { name: "Test User" },
          aud: "authenticated",
          created_at: "2024-01-01",
        },
      },
      error: null,
    });

    const Home = (await import("@/app/page")).default;
    const Page = await Home();
    render(Page);

    const dashboardShell = screen.getByTestId("dashboard-shell");
    expect(dashboardShell).toHaveAttribute("data-user-email", "user@eluocnc.com");
  });

  it("민감한 데이터(토큰, 비밀번호 등)는 DashboardShell에 전달하지 않는다", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "test-uuid",
          email: "user@eluocnc.com",
          app_metadata: { provider: "email" },
          user_metadata: { name: "Test User" },
          aud: "authenticated",
          created_at: "2024-01-01",
          access_token: "secret-access-token",
          refresh_token: "secret-refresh-token",
        },
      },
      error: null,
    });

    const Home = (await import("@/app/page")).default;
    const Page = await Home();
    render(Page);

    const dashboardShell = screen.getByTestId("dashboard-shell");
    // DashboardShell에는 이메일만 전달되어야 하며, 민감 데이터 속성이 없어야 한다
    expect(dashboardShell).toHaveAttribute("data-user-email", "user@eluocnc.com");
    // 민감 데이터가 HTML에 노출되지 않는지 확인
    expect(dashboardShell.outerHTML).not.toContain("secret-access-token");
    expect(dashboardShell.outerHTML).not.toContain("secret-refresh-token");
  });

  it("getUser 실패 시 빈 문자열을 DashboardShell에 전달한다", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Auth error" },
    });

    const Home = (await import("@/app/page")).default;
    const Page = await Home();
    render(Page);

    const dashboardShell = screen.getByTestId("dashboard-shell");
    expect(dashboardShell).toHaveAttribute("data-user-email", "");
  });
});
