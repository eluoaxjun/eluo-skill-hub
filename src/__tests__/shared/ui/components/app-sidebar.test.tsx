import { render, screen } from "@testing-library/react";
import { AppSidebar } from "@/shared/ui/components/app-sidebar";
import type { CategorySelection } from "@/shared/ui/types/dashboard";

// CategoryNav와 SearchInput을 모킹하여 AppSidebar 자체 로직에 집중한다
jest.mock("@/shared/ui/components/category-nav", () => ({
  CategoryNav: ({
    selectedCategory,
    onCategoryChange,
  }: {
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
  }) => (
    <div data-testid="category-nav" data-selected={selectedCategory}>
      <button onClick={() => onCategoryChange("디자인")}>카테고리 변경</button>
    </div>
  ),
}));

jest.mock("@/shared/ui/components/search-input", () => ({
  SearchInput: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <input
      data-testid="search-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe("AppSidebar", () => {
  const defaultProps = {
    selectedCategory: "전체" as CategorySelection,
    onCategoryChange: jest.fn(),
    searchQuery: "",
    onSearchChange: jest.fn(),
    isMobileMenuOpen: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("nav 요소를 aria-label='메인 내비게이션'으로 렌더링한다", () => {
    render(<AppSidebar {...defaultProps} />);

    const nav = screen.getByRole("navigation", { name: "메인 내비게이션" });
    expect(nav).toBeInTheDocument();
  });

  it("'Eluo Skill Hub' 로고/타이틀을 표시한다", () => {
    render(<AppSidebar {...defaultProps} />);

    expect(screen.getByText("Eluo Skill Hub")).toBeInTheDocument();
  });

  it("CategoryNav 컴포넌트를 포함한다", () => {
    render(<AppSidebar {...defaultProps} />);

    expect(screen.getByTestId("category-nav")).toBeInTheDocument();
  });

  it("SearchInput 컴포넌트를 포함한다", () => {
    render(<AppSidebar {...defaultProps} />);

    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("isMobileMenuOpen이 true일 때 translate-x-0을 적용한다", () => {
    render(<AppSidebar {...defaultProps} isMobileMenuOpen={true} />);

    const nav = screen.getByRole("navigation", { name: "메인 내비게이션" });
    expect(nav.className).toContain("translate-x-0");
    expect(nav.className).not.toContain("-translate-x-full");
  });

  it("isMobileMenuOpen이 false일 때 -translate-x-full을 적용한다", () => {
    render(<AppSidebar {...defaultProps} isMobileMenuOpen={false} />);

    const nav = screen.getByRole("navigation", { name: "메인 내비게이션" });
    expect(nav.className).toContain("-translate-x-full");
  });

  it("z-40 클래스로 z-index를 관리한다", () => {
    render(<AppSidebar {...defaultProps} />);

    const nav = screen.getByRole("navigation", { name: "메인 내비게이션" });
    expect(nav.className).toContain("z-40");
  });
});
