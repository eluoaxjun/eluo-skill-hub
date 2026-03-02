import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillCard } from "@/features/root-page/SkillCard";
import type { SkillViewModel } from "@/features/root-page/types";

const createTestSkillViewModel = (): SkillViewModel => ({
  id: "test-skill-1",
  name: "코드 오디터 프로",
  description: "JS 및 파이썬 코드베이스를 위한 자동 보안 검사 및 성능 최적화 오디팅 툴입니다.",
  icon: "🤖",
  categoryName: "개발",
  markdownContent: null,
  createdAt: new Date().toISOString(),
});

describe("SkillCard", () => {
  it("renders skill icon", () => {
    const skill = createTestSkillViewModel();
    render(<SkillCard skill={skill} index={0} isBookmarked={false} onClick={jest.fn()} />);
    expect(screen.getByText("🤖")).toBeInTheDocument();
  });

  it("renders skill name", () => {
    const skill = createTestSkillViewModel();
    render(<SkillCard skill={skill} index={0} isBookmarked={false} onClick={jest.fn()} />);
    expect(screen.getByText("코드 오디터 프로")).toBeInTheDocument();
  });

  it("renders skill description", () => {
    const skill = createTestSkillViewModel();
    render(<SkillCard skill={skill} index={0} isBookmarked={false} onClick={jest.fn()} />);
    expect(
      screen.getByText(
        "JS 및 파이썬 코드베이스를 위한 자동 보안 검사 및 성능 최적화 오디팅 툴입니다."
      )
    ).toBeInTheDocument();
  });

  it("renders category tag", () => {
    const skill = createTestSkillViewModel();
    render(<SkillCard skill={skill} index={0} isBookmarked={false} onClick={jest.fn()} />);
    expect(screen.getByText("개발")).toBeInTheDocument();
  });

  it("<Link> 대신 <button> 렌더링", () => {
    const skill = createTestSkillViewModel();
    render(<SkillCard skill={skill} index={0} isBookmarked={false} onClick={jest.fn()} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("onClick prop 전달 및 클릭 시 호출", async () => {
    const skill = createTestSkillViewModel();
    const handleClick = jest.fn();
    render(<SkillCard skill={skill} index={0} isBookmarked={false} onClick={handleClick} />);

    await userEvent.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(skill);
  });

  it("isBookmarked={true} 시 북마크 아이콘 표시", () => {
    const skill = createTestSkillViewModel();
    render(<SkillCard skill={skill} index={0} isBookmarked={true} onClick={jest.fn()} />);
    expect(screen.getByTestId("bookmark-icon-active")).toBeInTheDocument();
  });

  it("isBookmarked={false} 시 비활성 북마크 아이콘 표시", () => {
    const skill = createTestSkillViewModel();
    render(<SkillCard skill={skill} index={0} isBookmarked={false} onClick={jest.fn()} />);
    expect(screen.getByTestId("bookmark-icon-inactive")).toBeInTheDocument();
  });
});
