import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "@/shared/ui/components/search-input";

describe("SearchInput", () => {
  const defaultProps = {
    value: "",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("검색 아이콘과 입력 필드를 렌더링한다", () => {
    render(<SearchInput {...defaultProps} />);

    // 텍스트 입력 필드가 존재하는지 확인
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");

    // 검색 아이콘(Search)이 존재하는지 확인
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
  });

  it("사용자가 타이핑하면 onChange 콜백을 호출한다", async () => {
    const mockOnChange = jest.fn();
    const user = userEvent.setup();

    render(<SearchInput value="" onChange={mockOnChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "테스트");

    // 각 문자 입력마다 onChange가 호출된다
    expect(mockOnChange).toHaveBeenCalled();
    // 첫 번째 호출은 "테" 문자
    expect(mockOnChange).toHaveBeenCalledWith("테");
  });

  it("커스텀 placeholder를 표시한다", () => {
    render(
      <SearchInput
        value=""
        onChange={jest.fn()}
        placeholder="커스텀 플레이스홀더"
      />
    );

    const input = screen.getByPlaceholderText("커스텀 플레이스홀더");
    expect(input).toBeInTheDocument();
  });

  it("placeholder가 없으면 기본 placeholder를 표시한다", () => {
    render(<SearchInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("스킬 검색...");
    expect(input).toBeInTheDocument();
  });

  it("현재 value를 입력 필드에 표시한다", () => {
    render(<SearchInput value="현재 검색어" onChange={jest.fn()} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("현재 검색어");
  });
});
