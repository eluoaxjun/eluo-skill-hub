import { render, screen, fireEvent } from "@testing-library/react";
import { AppHeader } from "@/shared/ui/components/app-header";

jest.mock("@/shared/ui/components/theme-toggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

jest.mock("@/shared/ui/components/search-input", () => ({
  SearchInput: (props: Record<string, unknown>) => (
    <input data-testid="search-input" />
  ),
}));

const defaultProps = {
  pageTitle: "대시보드",
  searchQuery: "",
  onSearchChange: jest.fn(),
  isMobile: false,
  onToggleMobileMenu: jest.fn(),
};

describe("AppHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("header 시맨틱 요소를 렌더링한다", () => {
    render(<AppHeader {...defaultProps} />);
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe("HEADER");
  });

  it("페이지 제목을 표시한다", () => {
    render(<AppHeader {...defaultProps} pageTitle="디자인" />);
    expect(screen.getByText("디자인")).toBeInTheDocument();
  });

  it("ThemeToggle 컴포넌트를 포함한다", () => {
    render(<AppHeader {...defaultProps} />);
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("isMobile=true일 때 햄버거 메뉴 버튼을 표시한다", () => {
    render(<AppHeader {...defaultProps} isMobile={true} />);
    const menuButton = screen.getByRole("button", { name: "메뉴 열기" });
    expect(menuButton).toBeInTheDocument();
  });

  it("isMobile=false일 때 햄버거 메뉴 버튼을 숨긴다", () => {
    render(<AppHeader {...defaultProps} isMobile={false} />);
    const menuButton = screen.queryByRole("button", { name: "메뉴 열기" });
    expect(menuButton).not.toBeInTheDocument();
  });

  it("햄버거 메뉴 버튼 클릭 시 onToggleMobileMenu를 호출한다", () => {
    const onToggleMobileMenu = jest.fn();
    render(
      <AppHeader
        {...defaultProps}
        isMobile={true}
        onToggleMobileMenu={onToggleMobileMenu}
      />
    );
    const menuButton = screen.getByRole("button", { name: "메뉴 열기" });
    fireEvent.click(menuButton);
    expect(onToggleMobileMenu).toHaveBeenCalledTimes(1);
  });

  it("isMobile=false일 때 SearchInput을 표시한다", () => {
    render(<AppHeader {...defaultProps} isMobile={false} />);
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("isMobile=true일 때 SearchInput을 숨긴다", () => {
    render(<AppHeader {...defaultProps} isMobile={true} />);
    expect(screen.queryByTestId("search-input")).not.toBeInTheDocument();
  });

  it("사용자 프로필 아이콘 영역을 표시한다", () => {
    render(<AppHeader {...defaultProps} />);
    const profileArea = screen.getByTestId("user-profile");
    expect(profileArea).toBeInTheDocument();
  });
});
