/**
 * @file skill-card-click.test.tsx
 * @description Task 8.3 - SkillCard 클릭 시 onSkillClick 콜백 호출 테스트
 *
 * SkillCard가 클릭 가능하고, 클릭 시 onSkillClick 콜백을 호출하는지 검증한다.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SkillSummary } from "@/shared/ui/types/dashboard";

const mockSkill: SkillSummary = {
  id: "skill-1",
  title: "테스트 스킬",
  category: "개발",
  createdAt: "2026-02-15T09:30:00.000Z",
  markdownFilePath: "test.md",
};

describe("Task 8.3 - SkillCard 클릭 동작", () => {
  it("onSkillClick 콜백이 제공되면 클릭 시 호출한다", async () => {
    const { SkillCard } = await import(
      "@/shared/ui/components/skill-card"
    );

    const handleClick = jest.fn();

    render(<SkillCard skill={mockSkill} onSkillClick={handleClick} />);

    const user = userEvent.setup();
    const card = screen.getByText("테스트 스킬").closest("div[role='button']")
      || screen.getByText("테스트 스킬").closest("button")
      || screen.getByText("테스트 스킬").parentElement?.parentElement;

    if (card) {
      await user.click(card);
    }

    expect(handleClick).toHaveBeenCalledWith(mockSkill);
  });

  it("클릭 가능한 스타일(cursor-pointer)이 적용되어 있다", async () => {
    const { SkillCard } = await import(
      "@/shared/ui/components/skill-card"
    );

    const { container } = render(
      <SkillCard skill={mockSkill} onSkillClick={jest.fn()} />
    );

    const cardEl = container.firstElementChild;
    expect(cardEl?.className).toContain("cursor-pointer");
  });
});
