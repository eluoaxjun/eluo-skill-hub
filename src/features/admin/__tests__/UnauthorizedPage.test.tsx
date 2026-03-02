import { render, screen } from "@testing-library/react";
import { UnauthorizedPage } from "../UnauthorizedPage";

describe("UnauthorizedPage", () => {
  it("권한 없음 메시지가 표시된다", () => {
    render(<UnauthorizedPage />);
    expect(screen.getByText("접근 권한이 없습니다")).toBeInTheDocument();
  });

  it("어드민 권한 안내 메시지가 표시된다", () => {
    render(<UnauthorizedPage />);
    expect(
      screen.getByText("어드민 권한이 필요한 페이지입니다.")
    ).toBeInTheDocument();
  });

  it("홈으로 돌아가는 버튼이 존재한다", () => {
    render(<UnauthorizedPage />);
    const backLink = screen.getByRole("link");
    expect(backLink).toHaveAttribute("href", "/");
  });

  it("돌아가기 버튼 텍스트가 표시된다", () => {
    render(<UnauthorizedPage />);
    expect(screen.getByText(/돌아가기/)).toBeInTheDocument();
  });
});
