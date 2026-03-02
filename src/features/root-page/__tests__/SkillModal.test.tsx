import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillModal } from "@/features/root-page/SkillModal";
import type { SkillViewModel } from "@/features/root-page/types";

const mockSubmitFeedbackAction = jest.fn().mockResolvedValue(undefined);

jest.mock("@/app/actions/feedbackActions", () => ({
  submitFeedbackAction: (...args: unknown[]) => mockSubmitFeedbackAction(...args),
}));

const createTestSkill = (): SkillViewModel => ({
  id: "skill-1",
  name: "코드 오디터 프로",
  description: "JS 및 파이썬 코드베이스를 위한 자동 보안 검사 및 성능 최적화 오디팅 툴입니다.",
  icon: "🤖",
  categoryName: "개발",
  markdownContent: "# 사용법\n마크다운 콘텐츠입니다.",
  createdAt: new Date("2024-01-01").toISOString(),
});

describe("SkillModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("스킬 제목, 카테고리, 설명이 모달에 렌더링된다", () => {
    const skill = createTestSkill();
    render(
      <SkillModal
        skill={skill}
        isBookmarked={false}
        onClose={jest.fn()}
        onToggleBookmark={jest.fn()}
      />
    );

    expect(screen.getByText("코드 오디터 프로")).toBeInTheDocument();
    // "개발"은 헤더 배지와 사이드패널에 중복 표시됨
    expect(screen.getAllByText("개발").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText("JS 및 파이썬 코드베이스를 위한 자동 보안 검사 및 성능 최적화 오디팅 툴입니다.")
    ).toBeInTheDocument();
  });

  it("X 버튼 클릭 시 onClose 콜백이 호출된다", async () => {
    const skill = createTestSkill();
    const handleClose = jest.fn();
    render(
      <SkillModal
        skill={skill}
        isBookmarked={false}
        onClose={handleClose}
        onToggleBookmark={jest.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /닫기|close/i }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("배경(overlay) 클릭 시 onClose 콜백이 호출된다", async () => {
    const skill = createTestSkill();
    const handleClose = jest.fn();
    render(
      <SkillModal
        skill={skill}
        isBookmarked={false}
        onClose={handleClose}
        onToggleBookmark={jest.fn()}
      />
    );

    await userEvent.click(screen.getByTestId("modal-overlay"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("isBookmarked={true} 시 북마크 버튼이 활성 상태로 표시된다", () => {
    const skill = createTestSkill();
    render(
      <SkillModal
        skill={skill}
        isBookmarked={true}
        onClose={jest.fn()}
        onToggleBookmark={jest.fn()}
      />
    );

    expect(screen.getByTestId("bookmark-btn-active")).toBeInTheDocument();
  });

  it("별점 버튼 클릭 시 해당 점수가 선택된다", async () => {
    const skill = createTestSkill();
    render(
      <SkillModal
        skill={skill}
        isBookmarked={false}
        onClose={jest.fn()}
        onToggleBookmark={jest.fn()}
      />
    );

    const starButton = screen.getByRole("button", { name: "★ 3" });
    await userEvent.click(starButton);

    expect(starButton).toHaveAttribute("aria-pressed", "true");
  });

  it("피드백 제출 버튼 클릭 시 submitFeedbackAction이 호출된다", async () => {
    const skill = createTestSkill();
    render(
      <SkillModal
        skill={skill}
        isBookmarked={false}
        onClose={jest.fn()}
        onToggleBookmark={jest.fn()}
      />
    );

    // 별점 선택
    await userEvent.click(screen.getByRole("button", { name: "★ 4" }));

    // 제출
    await userEvent.click(screen.getByRole("button", { name: /피드백 제출/ }));

    expect(mockSubmitFeedbackAction).toHaveBeenCalledWith("skill-1", 4, null);
  });
});
