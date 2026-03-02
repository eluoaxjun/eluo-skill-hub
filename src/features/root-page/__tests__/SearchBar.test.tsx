import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "@/features/root-page/SearchBar";

describe("SearchBar", () => {
  it("renders 'AI 스킬 탐색하기' heading", () => {
    render(<SearchBar />);
    expect(
      screen.getByRole("heading", { name: /AI 스킬 탐색하기/ })
    ).toBeInTheDocument();
  });

  it("renders search input with placeholder '스킬 또는 에이전트 검색...'", () => {
    render(<SearchBar />);
    expect(
      screen.getByPlaceholderText("스킬 또는 에이전트 검색...")
    ).toBeInTheDocument();
  });

  it("renders popular search tag '파이썬 스크립트'", () => {
    render(<SearchBar />);
    expect(screen.getByText(/파이썬 스크립트/)).toBeInTheDocument();
  });

  it("renders popular search tag 'PDF 요약기'", () => {
    render(<SearchBar />);
    expect(screen.getByText(/PDF 요약기/)).toBeInTheDocument();
  });

  it("renders popular search tag '회의록 정리'", () => {
    render(<SearchBar />);
    expect(screen.getByText(/회의록 정리/)).toBeInTheDocument();
  });

  it("allows user to type in search input", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const input = screen.getByPlaceholderText("스킬 또는 에이전트 검색...");
    await user.type(input, "코드 리뷰");

    expect(input).toHaveValue("코드 리뷰");
  });
});
