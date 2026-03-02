import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignupForm } from "@/features/auth/SignupForm";
import type { SignupActionState } from "@/app/signup/actions";

const mockAction = jest.fn(
  async (_prev: SignupActionState, _formData: FormData): Promise<SignupActionState> => ({})
);

describe("SignupForm", () => {
  beforeEach(() => {
    mockAction.mockClear();
  });

  it("이메일, 비밀번호, 비밀번호 확인 필드를 렌더링한다", () => {
    render(<SignupForm action={mockAction} />);

    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호 확인")).toBeInTheDocument();
  });

  it("'회원가입' 버튼을 렌더링한다", () => {
    render(<SignupForm action={mockAction} />);

    expect(
      screen.getByRole("button", { name: "회원가입" })
    ).toBeInTheDocument();
  });

  it("'로그인' 링크가 /login을 가리킨다", () => {
    render(<SignupForm action={mockAction} />);

    const loginLink = screen.getByRole("link", { name: "로그인" });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("onBlur: 이메일 필드 이탈 시 형식 검증 에러를 표시한다", async () => {
    const user = userEvent.setup();
    render(<SignupForm action={mockAction} />);

    const emailInput = screen.getByLabelText("이메일");
    await user.click(emailInput);
    await user.type(emailInput, "invalid-email");
    await user.tab();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("onBlur: 비밀번호 필드 이탈 시 규칙 검증 에러를 표시한다", async () => {
    const user = userEvent.setup();
    render(<SignupForm action={mockAction} />);

    const passwordInput = screen.getByLabelText("비밀번호");
    await user.click(passwordInput);
    await user.type(passwordInput, "short");
    await user.tab();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("onBlur: 비밀번호 확인 불일치 에러를 표시한다", async () => {
    const user = userEvent.setup();
    render(<SignupForm action={mockAction} />);

    const passwordInput = screen.getByLabelText("비밀번호");
    const confirmInput = screen.getByLabelText("비밀번호 확인");

    await user.type(passwordInput, "Password1");
    await user.click(confirmInput);
    await user.type(confirmInput, "Password2");
    await user.tab();

    expect(
      await screen.findByText("비밀번호가 일치하지 않습니다")
    ).toBeInTheDocument();
  });

  it("onChange: 에러 있는 필드 수정 시 에러를 해제한다", async () => {
    const user = userEvent.setup();
    render(<SignupForm action={mockAction} />);

    const emailInput = screen.getByLabelText("이메일");

    // 에러 유발: 잘못된 이메일 입력 후 blur (Tab으로 이동 — 다음 필드 blur 에러가 생길 수 있으므로
    // 이메일 에러 메시지 텍스트로 특정)
    await user.click(emailInput);
    await user.type(emailInput, "bad");
    // blur를 명시적으로 발생시켜 이메일 에러만 나타나게 한다
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
    render(<SignupForm action={mockAction} />);

    await user.click(screen.getByRole("button", { name: "회원가입" }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts.length).toBeGreaterThanOrEqual(3);
  });
});
