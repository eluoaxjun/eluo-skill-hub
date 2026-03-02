import { render, screen } from "@testing-library/react";
import { LandingPage } from "@/features/root-page/LandingPage";

describe("LandingPage", () => {
  it("renders service name 'AI 스킬 허브'", () => {
    render(<LandingPage />);
    expect(
      screen.getByRole("heading", { name: /AI 스킬 허브/i })
    ).toBeInTheDocument();
  });

  it("renders service description", () => {
    render(<LandingPage />);
    expect(
      screen.getByText(
        /웹 에이전시의 기획-디자인-퍼블리싱-개발-QA 워크플로우를 자동화하는 AI 스킬 마켓플레이스/
      )
    ).toBeInTheDocument();
  });

  it("renders login link to /login", () => {
    render(<LandingPage />);
    const loginLink = screen.getByRole("link", { name: /로그인/ });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("renders signup link to /signup", () => {
    render(<LandingPage />);
    const signupLink = screen.getByRole("link", { name: /회원가입/ });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute("href", "/signup");
  });
});
