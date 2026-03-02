import { render, screen } from "@testing-library/react";
import { MyAgentPage } from "../MyAgentPage";

jest.mock("@/app/actions/bookmarkActions", () => ({
  toggleBookmarkAction: jest.fn().mockResolvedValue({ isBookmarked: true }),
}));

describe("MyAgentPage", () => {
  it("renders empty state message when no skills", () => {
    render(<MyAgentPage skills={[]} bookmarkedIds={[]} />);

    expect(
      screen.getByText("아직 북마크한 에이전트가 없습니다")
    ).toBeInTheDocument();
  });

  it("renders empty state description when no skills", () => {
    render(<MyAgentPage skills={[]} bookmarkedIds={[]} />);

    expect(
      screen.getByText("관심 있는 에이전트를 북마크하면 이곳에 표시됩니다.")
    ).toBeInTheDocument();
  });

  it("renders skill grid when skills exist", () => {
    const skills = [
      {
        id: "skill-1",
        name: "테스트 스킬",
        description: "설명",
        icon: "🤖",
        categoryName: "개발",
        markdownContent: null,
        createdAt: new Date().toISOString(),
      },
    ];
    render(<MyAgentPage skills={skills} bookmarkedIds={["skill-1"]} />);

    expect(screen.getByText("테스트 스킬")).toBeInTheDocument();
  });
});
