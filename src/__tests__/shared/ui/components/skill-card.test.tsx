import { render, screen } from "@testing-library/react";
import { SkillCard } from "@/shared/ui/components/skill-card";
import type { SkillSummary } from "@/shared/ui/types/dashboard";

const mockSkill: SkillSummary = {
  id: "test-skill-1",
  title: "PRD 자동 생성기",
  category: "기획",
  createdAt: "2026-02-15T09:30:00.000Z",
  markdownFilePath: "test.md",
};

describe("SkillCard", () => {
  it("스킬 제목을 렌더링한다", () => {
    render(<SkillCard skill={mockSkill} />);

    expect(screen.getByText("PRD 자동 생성기")).toBeInTheDocument();
  });

  it("카테고리 태그를 렌더링한다", () => {
    render(<SkillCard skill={mockSkill} />);

    expect(screen.getByText("기획")).toBeInTheDocument();
  });

  it("생성일을 렌더링한다", () => {
    render(<SkillCard skill={mockSkill} />);

    expect(screen.getByText("2026.02.15")).toBeInTheDocument();
  });

  it("제목이 h3 태그로 렌더링된다", () => {
    render(<SkillCard skill={mockSkill} />);

    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("PRD 자동 생성기");
  });
});
