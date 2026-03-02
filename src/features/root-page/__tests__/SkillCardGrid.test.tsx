import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillCardGrid } from "@/features/root-page/SkillCardGrid";
import type { SkillViewModel } from "@/features/root-page/types";

jest.mock("@/app/actions/bookmarkActions", () => ({
  toggleBookmarkAction: jest.fn().mockResolvedValue({ isBookmarked: true }),
}));

const createSkillViewModels = (): SkillViewModel[] => [
  {
    id: "skill-1",
    name: "스킬 하나",
    description: "설명 하나",
    icon: "🤖",
    categoryName: "개발",
    markdownContent: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: "skill-2",
    name: "스킬 둘",
    description: "설명 둘",
    icon: "📝",
    categoryName: "기획",
    markdownContent: "# 마크다운 콘텐츠",
    createdAt: new Date().toISOString(),
  },
];

describe("SkillCardGrid", () => {
  it("skills 배열이 전달되면 각 SkillCard가 렌더링된다", () => {
    const skills = createSkillViewModels();
    render(
      <SkillCardGrid skills={skills} initialBookmarkedIds={[]} />
    );

    expect(screen.getByText("스킬 하나")).toBeInTheDocument();
    expect(screen.getByText("스킬 둘")).toBeInTheDocument();
  });

  it("스킬 카드 클릭 시 모달이 열린다 (SkillModal이 렌더링된다)", async () => {
    const skills = createSkillViewModels();
    render(
      <SkillCardGrid skills={skills} initialBookmarkedIds={[]} />
    );

    const buttons = screen.getAllByRole("button");
    // 카드 버튼 클릭 (첫 번째 카드)
    const cardButton = buttons.find((btn) =>
      btn.textContent?.includes("스킬 하나")
    );
    expect(cardButton).toBeDefined();
    await userEvent.click(cardButton!);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("initialBookmarkedIds에 포함된 스킬은 북마크 상태로 렌더링된다", () => {
    const skills = createSkillViewModels();
    render(
      <SkillCardGrid skills={skills} initialBookmarkedIds={["skill-1"]} />
    );

    expect(screen.getByTestId("bookmark-icon-active")).toBeInTheDocument();
  });
});
