import { render, screen } from "@testing-library/react";
import { MainContent } from "@/shared/ui/components/main-content";
import type { SkillSummary } from "@/shared/ui/types/dashboard";

// SkillCardGrid를 모킹하여 MainContent 자체 로직에 집중한다
jest.mock("@/shared/ui/components/skill-card-grid", () => ({
  SkillCardGrid: ({ skills }: { skills: readonly SkillSummary[] }) => (
    <div data-testid="skill-card-grid">
      {skills.length === 0
        ? "등록된 스킬이 없습니다"
        : `${skills.length} skills`}
    </div>
  ),
}));

const mockSkills: readonly SkillSummary[] = [
  {
    id: "skill-1",
    title: "PRD 자동 생성기",
    category: "기획",
    createdAt: "2026-01-01T00:00:00.000Z",
    markdownFilePath: "1.md",
  },
  {
    id: "skill-2",
    title: "디자인 토큰 추출기",
    category: "디자인",
    createdAt: "2026-01-02T00:00:00.000Z",
    markdownFilePath: "2.md",
  },
];

describe("MainContent", () => {
  it("main 시맨틱 요소를 렌더링한다", () => {
    render(
      <MainContent
        filteredSkills={mockSkills}
        selectedCategory="전체"
        isLoading={false}
      />
    );

    const mainElement = screen.getByRole("main");
    expect(mainElement).toBeInTheDocument();
  });

  it("selectedCategory가 '전체'일 때 히어로 섹션을 표시한다", () => {
    render(
      <MainContent
        filteredSkills={mockSkills}
        selectedCategory="전체"
        isLoading={false}
      />
    );

    expect(
      screen.getByText("Eluo Skill Hub에 오신 것을 환영합니다")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "웹 에이전시의 기획-디자인-퍼블리싱-개발-QA 워크플로우를 자동화하는 스킬을 탐색하세요."
      )
    ).toBeInTheDocument();
  });

  it("특정 카테고리가 선택되면 히어로 섹션을 숨긴다", () => {
    render(
      <MainContent
        filteredSkills={mockSkills}
        selectedCategory="기획"
        isLoading={false}
      />
    );

    expect(
      screen.queryByText("Eluo Skill Hub에 오신 것을 환영합니다")
    ).not.toBeInTheDocument();
  });

  it("isLoading이 true일 때 로딩 인디케이터를 표시한다", () => {
    const { container } = render(
      <MainContent
        filteredSkills={[]}
        selectedCategory="전체"
        isLoading={true}
      />
    );

    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("isLoading이 true일 때 히어로 섹션과 스킬 그리드를 표시하지 않는다", () => {
    render(
      <MainContent
        filteredSkills={mockSkills}
        selectedCategory="전체"
        isLoading={true}
      />
    );

    expect(
      screen.queryByText("Eluo Skill Hub에 오신 것을 환영합니다")
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("skill-card-grid")).not.toBeInTheDocument();
  });

  it("SkillCardGrid에 스킬 데이터를 전달한다", () => {
    render(
      <MainContent
        filteredSkills={mockSkills}
        selectedCategory="전체"
        isLoading={false}
      />
    );

    const grid = screen.getByTestId("skill-card-grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveTextContent("2 skills");
  });

  it("세로 스크롤 지원을 위해 overflow-y-auto 클래스가 적용되어 있다", () => {
    render(
      <MainContent
        filteredSkills={mockSkills}
        selectedCategory="전체"
        isLoading={false}
      />
    );

    const mainElement = screen.getByRole("main");
    expect(mainElement.className).toContain("overflow-y-auto");
  });

  it("스킬이 없을 때 SkillCardGrid가 빈 상태 메시지를 처리한다", () => {
    render(
      <MainContent
        filteredSkills={[]}
        selectedCategory="기획"
        isLoading={false}
      />
    );

    const grid = screen.getByTestId("skill-card-grid");
    expect(grid).toHaveTextContent("등록된 스킬이 없습니다");
  });
});
