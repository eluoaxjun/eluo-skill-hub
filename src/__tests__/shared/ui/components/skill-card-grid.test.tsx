import { render, screen } from "@testing-library/react";
import { SkillCardGrid } from "@/shared/ui/components/skill-card-grid";
import type { SkillSummary } from "@/shared/ui/types/dashboard";

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
  {
    id: "skill-3",
    title: "API 스캐폴딩",
    category: "개발",
    createdAt: "2026-01-03T00:00:00.000Z",
    markdownFilePath: "3.md",
  },
];

describe("SkillCardGrid", () => {
  it("스킬 배열이 비어있을 때 빈 상태 메시지를 렌더링한다", () => {
    render(<SkillCardGrid skills={[]} />);

    expect(screen.getByText("등록된 스킬이 없습니다")).toBeInTheDocument();
  });

  it("빈 상태 메시지 텍스트가 '등록된 스킬이 없습니다'이다", () => {
    render(<SkillCardGrid skills={[]} />);

    const emptyMessage = screen.getByText("등록된 스킬이 없습니다");
    expect(emptyMessage).toBeInTheDocument();
    expect(emptyMessage.textContent).toBe("등록된 스킬이 없습니다");
  });

  it("스킬이 제공되면 올바른 개수의 스킬 카드를 렌더링한다", () => {
    render(<SkillCardGrid skills={mockSkills} />);

    expect(screen.getByText("PRD 자동 생성기")).toBeInTheDocument();
    expect(screen.getByText("디자인 토큰 추출기")).toBeInTheDocument();
    expect(screen.getByText("API 스캐폴딩")).toBeInTheDocument();
  });

  it("그리드 컨테이너에 반응형 그리드 클래스가 적용되어 있다", () => {
    const { container } = render(<SkillCardGrid skills={mockSkills} />);

    const gridContainer = container.firstChild as HTMLElement;
    expect(gridContainer.className).toContain("grid");
    expect(gridContainer.className).toContain("grid-cols-1");
    expect(gridContainer.className).toContain("md:grid-cols-2");
    expect(gridContainer.className).toContain("xl:grid-cols-3");
  });

  it("스킬 배열이 비어있을 때 그리드 컨테이너를 렌더링하지 않는다", () => {
    const { container } = render(<SkillCardGrid skills={[]} />);

    const gridElement = container.querySelector(".grid");
    expect(gridElement).toBeNull();
  });
});
