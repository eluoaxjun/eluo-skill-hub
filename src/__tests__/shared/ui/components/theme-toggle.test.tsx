import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/shared/ui/components/theme-toggle";

// next-themes useTheme 훅 모킹
const mockSetTheme = jest.fn();
let mockResolvedTheme: string | undefined = "light";

jest.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
    mockResolvedTheme = "light";
  });

  it("크래시 없이 렌더링된다", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /테마 전환/i });
    expect(button).toBeInTheDocument();
  });

  it("라이트 모드일 때 Moon 아이콘을 표시한다", () => {
    mockResolvedTheme = "light";

    render(<ThemeToggle />);

    // 라이트 모드에서는 Moon 아이콘 표시 (다크 모드로 전환하기 위해)
    const button = screen.getByRole("button", { name: /테마 전환/i });
    expect(button).toBeInTheDocument();

    // Moon 아이콘이 존재하는지 확인 (data-testid 사용)
    expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("sun-icon")).not.toBeInTheDocument();
  });

  it("다크 모드일 때 Sun 아이콘을 표시한다", () => {
    mockResolvedTheme = "dark";

    render(<ThemeToggle />);

    // 다크 모드에서는 Sun 아이콘 표시 (라이트 모드로 전환하기 위해)
    expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("moon-icon")).not.toBeInTheDocument();
  });

  it("라이트 모드에서 클릭하면 다크 테마로 전환한다", async () => {
    mockResolvedTheme = "light";
    const user = userEvent.setup();

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /테마 전환/i });
    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("다크 모드에서 클릭하면 라이트 테마로 전환한다", async () => {
    mockResolvedTheme = "dark";
    const user = userEvent.setup();

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: /테마 전환/i });
    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("resolvedTheme이 undefined일 때 안전하게 렌더링된다", () => {
    mockResolvedTheme = undefined;

    render(<ThemeToggle />);

    // 하이드레이션 전 상태에서도 버튼이 렌더링되어야 한다
    const button = screen.getByRole("button", { name: /테마 전환/i });
    expect(button).toBeInTheDocument();
  });
});
