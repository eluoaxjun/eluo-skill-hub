import { render, screen } from "@testing-library/react";
import { SkillCard } from "@/shared/ui/components/skill-card";
import type { SkillSummary } from "@/shared/ui/types/dashboard";

const mockSkill: SkillSummary = {
  id: "test-skill-1",
  name: "PRD 자동 생성기",
  description: "요구사항 문서를 기반으로 PRD를 자동 생성하는 스킬입니다.",
  category: "기획",
  tags: ["PRD", "문서화"],
  icon: "\uD83D\uDCDD",
};

describe("SkillCard", () => {
  it("스킬 이름을 렌더링한다", () => {
    render(<SkillCard skill={mockSkill} />);

    expect(screen.getByText("PRD 자동 생성기")).toBeInTheDocument();
  });

  it("스킬 설명을 렌더링한다", () => {
    render(<SkillCard skill={mockSkill} />);

    expect(
      screen.getByText(
        "요구사항 문서를 기반으로 PRD를 자동 생성하는 스킬입니다."
      )
    ).toBeInTheDocument();
  });

  it("스킬 아이콘을 렌더링한다", () => {
    render(<SkillCard skill={mockSkill} />);

    expect(screen.getByText("\uD83D\uDCDD")).toBeInTheDocument();
  });

  it("카테고리 태그를 렌더링한다", () => {
    render(<SkillCard skill={mockSkill} />);

    expect(screen.getByText("기획")).toBeInTheDocument();
  });

  it("스킬 태그를 렌더링한다", () => {
    render(<SkillCard skill={mockSkill} />);

    expect(screen.getByText("PRD")).toBeInTheDocument();
    expect(screen.getByText("문서화")).toBeInTheDocument();
  });
});
