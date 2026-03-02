import React from "react";
import { render, screen } from "@testing-library/react";
import { VerifyCodeForm } from "@/features/auth/VerifyCodeForm";
import type { VerifyCodeActionState } from "@/app/signup/verify-code/actions";

const mockVerify = jest.fn(
  async (_prev: VerifyCodeActionState, _formData: FormData): Promise<VerifyCodeActionState> => ({})
);
const mockResend = jest.fn(
  async (_prev: VerifyCodeActionState, _formData: FormData): Promise<VerifyCodeActionState> => ({})
);

const TEST_EMAIL = "test@eluocnc.com";

describe("VerifyCodeForm", () => {
  beforeEach(() => {
    mockVerify.mockClear();
    mockResend.mockClear();
  });

  it("이메일 주소를 표시한다", () => {
    render(
      <VerifyCodeForm
        email={TEST_EMAIL}
        verifyAction={mockVerify}
        resendAction={mockResend}
      />
    );

    expect(screen.getByText(TEST_EMAIL)).toBeInTheDocument();
  });

  it("인증 코드 입력 필드가 존재한다", () => {
    render(
      <VerifyCodeForm
        email={TEST_EMAIL}
        verifyAction={mockVerify}
        resendAction={mockResend}
      />
    );

    expect(screen.getByLabelText("인증 코드")).toBeInTheDocument();
  });

  it("'인증하기' 버튼이 존재한다", () => {
    render(
      <VerifyCodeForm
        email={TEST_EMAIL}
        verifyAction={mockVerify}
        resendAction={mockResend}
      />
    );

    expect(
      screen.getByRole("button", { name: "인증하기" })
    ).toBeInTheDocument();
  });

  it("'인증 코드 재발송' 버튼이 존재한다", () => {
    render(
      <VerifyCodeForm
        email={TEST_EMAIL}
        verifyAction={mockVerify}
        resendAction={mockResend}
      />
    );

    expect(
      screen.getByRole("button", { name: "인증 코드 재발송" })
    ).toBeInTheDocument();
  });

  it("hidden email input이 올바른 값을 가진다", () => {
    render(
      <VerifyCodeForm
        email={TEST_EMAIL}
        verifyAction={mockVerify}
        resendAction={mockResend}
      />
    );

    const hiddenInputs = document.querySelectorAll(
      'input[type="hidden"][name="email"]'
    ) as NodeListOf<HTMLInputElement>;

    expect(hiddenInputs.length).toBeGreaterThanOrEqual(1);
    hiddenInputs.forEach((input) => {
      expect(input.value).toBe(TEST_EMAIL);
    });
  });
});
