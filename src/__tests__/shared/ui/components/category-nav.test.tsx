import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategoryNav } from "@/shared/ui/components/category-nav";
import { CATEGORIES } from "@/shared/ui/data/categories";
import type { CategorySelection } from "@/shared/ui/types/dashboard";

describe("CategoryNav", () => {
  const defaultProps = {
    selectedCategory: "전체" as CategorySelection,
    onCategoryChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("6개 카테고리 항목(전체 + 5개 직군)을 모두 렌더링한다", () => {
    render(<CategoryNav {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(6);
  });

  it("각 항목에 아이콘과 라벨을 표시한다", () => {
    render(<CategoryNav {...defaultProps} />);

    // 각 카테고리의 라벨 텍스트가 렌더링되는지 확인
    for (const category of CATEGORIES) {
      expect(screen.getByText(category.label)).toBeInTheDocument();
    }
  });

  it("활성 카테고리에 구분되는 스타일을 적용한다", () => {
    render(
      <CategoryNav
        selectedCategory="디자인"
        onCategoryChange={jest.fn()}
      />
    );

    const activeButton = screen.getByText("디자인").closest("button");
    const inactiveButton = screen.getByText("전체").closest("button");

    // 활성 카테고리에 bg-sidebar-accent 클래스가 포함되어야 한다
    expect(activeButton).toHaveClass("bg-sidebar-accent");
    expect(activeButton).toHaveClass("font-medium");

    // 비활성 카테고리에는 bg-sidebar-accent가 포함되지 않아야 한다
    expect(inactiveButton).not.toHaveClass("bg-sidebar-accent");
    expect(inactiveButton).not.toHaveClass("font-medium");
  });

  it("클릭 시 올바른 카테고리 id로 onCategoryChange를 호출한다", async () => {
    const mockOnCategoryChange = jest.fn();
    const user = userEvent.setup();

    render(
      <CategoryNav
        selectedCategory="전체"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    // "디자인" 카테고리 클릭
    await user.click(screen.getByText("디자인"));
    expect(mockOnCategoryChange).toHaveBeenCalledWith("디자인");

    // "QA" 카테고리 클릭
    await user.click(screen.getByText("QA"));
    expect(mockOnCategoryChange).toHaveBeenCalledWith("QA");

    // "전체" 카테고리 클릭
    await user.click(screen.getByText("전체"));
    expect(mockOnCategoryChange).toHaveBeenCalledWith("전체");
  });

  it("Enter 키로 포커스된 항목을 활성화한다", async () => {
    const mockOnCategoryChange = jest.fn();
    const user = userEvent.setup();

    render(
      <CategoryNav
        selectedCategory="전체"
        onCategoryChange={mockOnCategoryChange}
      />
    );

    // 첫 번째 버튼에 포커스 후 Enter 키 입력
    const firstButton = screen.getAllByRole("button")[0];
    firstButton.focus();
    await user.keyboard("{Enter}");

    expect(mockOnCategoryChange).toHaveBeenCalledWith("전체");
  });

  it("모든 항목이 button 요소로 구성되어 포커스 가능하다", () => {
    render(<CategoryNav {...defaultProps} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(6);

    // 모든 버튼 요소는 기본적으로 포커스 가능하다
    for (const button of buttons) {
      expect(button.tagName).toBe("BUTTON");
    }
  });

  it("각 카테고리에 해당하는 아이콘 SVG가 렌더링된다", () => {
    const { container } = render(<CategoryNav {...defaultProps} />);

    // lucide-react 아이콘은 SVG로 렌더링된다
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(6);
  });

  it("selectedCategory가 변경되면 활성 스타일이 이동한다", () => {
    const { rerender } = render(
      <CategoryNav
        selectedCategory="전체"
        onCategoryChange={jest.fn()}
      />
    );

    // 초기: "전체"가 활성
    expect(screen.getByText("전체").closest("button")).toHaveClass(
      "bg-sidebar-accent"
    );
    expect(screen.getByText("개발").closest("button")).not.toHaveClass(
      "bg-sidebar-accent"
    );

    // "개발"로 변경
    rerender(
      <CategoryNav
        selectedCategory="개발"
        onCategoryChange={jest.fn()}
      />
    );

    expect(screen.getByText("개발").closest("button")).toHaveClass(
      "bg-sidebar-accent"
    );
    expect(screen.getByText("전체").closest("button")).not.toHaveClass(
      "bg-sidebar-accent"
    );
  });
});
