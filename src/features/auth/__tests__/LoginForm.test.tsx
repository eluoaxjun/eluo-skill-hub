import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/features/auth/LoginForm";
import type { LoginActionState } from "@/app/login/actions";

const mockAction = jest.fn(
  async (_prev: LoginActionState, _formData: FormData): Promise<LoginActionState> => ({})
);

describe("LoginForm", () => {
  beforeEach(() => {
    mockAction.mockClear();
  });

  it("이메일, 비밀번호 필드를 렌더링한다", () => {
    render(<LoginForm action={mockAction} />);

    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
  });

  it("'로그인' 버튼을 렌더링한다", () => {
    render(<LoginForm action={mockAction} />);

    expect(
      screen.getByRole("button", { name: "로그인" })
    ).toBeInTheDocument();
  });

  it("'회원가입' 링크가 /signup을 가리킨다", () => {
    render(<LoginForm action={mockAction} />);

    const signupLink = screen.getByRole("link", { name: "회원가입" });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  it("redirectTo hidden input이 렌더링된다", () => {
    render(<LoginForm action={mockAction} redirectTo="/dashboard" />);

    const hiddenInput = document.querySelector('input[name="redirectTo"]') as HTMLInputElement;
    expect(hiddenInput).not.toBeNull();
    expect(hiddenInput.type).toBe("hidden");
    expect(hiddenInput.value).toBe("/dashboard");
  });

  it("redirectTo prop 없을 때 기본값 '/'으로 렌더링된다", () => {
    render(<LoginForm action={mockAction} />);

    const hiddenInput = document.querySelector('input[name="redirectTo"]') as HTMLInputElement;
    expect(hiddenInput).not.toBeNull();
    expect(hiddenInput.value).toBe("/");
  });

  it("onBlur: 이메일 필드 이탈 시 형식 검증 에러를 표시한다", async () => {
    const user = userEvent.setup();
    render(<LoginForm action={mockAction} />);

    const emailInput = screen.getByLabelText("이메일");
    await user.click(emailInput);
    await user.type(emailInput, "invalid-email");
    await user.tab();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("onBlur: 비밀번호 필드 이탈 시 규칙 검증 에러를 표시한다", async () => {
    const user = userEvent.setup();
    render(<LoginForm action={mockAction} />);

    const passwordInput = screen.getByLabelText("비밀번호");
    await user.click(passwordInput);
    await user.type(passwordInput, "short");
    await user.tab();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("onChange: 에러 있는 이메일 필드 수정 시 에러를 해제한다", async () => {
    const user = userEvent.setup();
    render(<LoginForm action={mockAction} />);

    const emailInput = screen.getByLabelText("이메일");

    // 에러 유발: 잘못된 이메일 입력 후 blur (Tab 사용 시 password 필드 blur 에러가 함께 발생할 수 있으므로
    // 이메일 에러 텍스트로 특정)
    await user.click(emailInput);
    await user.type(emailInput, "bad");
    await act(async () => { emailInput.blur(); });
    expect(
      await screen.findByText("올바른 이메일 형식이 아닙니다")
    ).toBeInTheDocument();

    // 에러 해제: 올바른 이메일로 수정
    await user.click(emailInput);
    await user.clear(emailInput);
    await user.type(emailInput, "valid@eluocnc.com");

    expect(
      screen.queryByText("올바른 이메일 형식이 아닙니다")
    ).not.toBeInTheDocument();
  });

  it("빈 폼 제출 시 모든 에러를 표시한다", async () => {
    const user = userEvent.setup();
    render(<LoginForm action={mockAction} />);

    await user.click(screen.getByRole("button", { name: "로그인" }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts.length).toBeGreaterThanOrEqual(2);
  });
});
