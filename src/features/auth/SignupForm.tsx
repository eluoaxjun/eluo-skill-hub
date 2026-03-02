"use client";

import React, { useRef, useState, useActionState } from "react";
import Link from "next/link";
import { Email } from "@/auth/domain/value-objects/Email";
import { Password } from "@/auth/domain/value-objects/Password";
import type { SignupActionState } from "@/app/signup/actions";

interface SignupFormProps {
  action: (
    prevState: SignupActionState,
    formData: FormData
  ) => Promise<SignupActionState>;
}

function validateEmail(value: string): string | null {
  try {
    Email.create(value);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

function validatePassword(value: string): string | null {
  try {
    Password.create(value);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

function validatePasswordConfirm(
  password: string,
  passwordConfirm: string
): string | null {
  if (!passwordConfirm) {
    return "비밀번호 확인을 입력해주세요";
  }
  if (password !== passwordConfirm) {
    return "비밀번호가 일치하지 않습니다";
  }
  return null;
}

export function SignupForm({ action }: SignupFormProps) {
  const [state, formAction, isPending] = useActionState(action, {});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);

  function handleEmailBlur(e: React.FocusEvent<HTMLInputElement>) {
    const error = validateEmail(e.target.value);
    setFieldErrors((prev) => {
      if (error === null) {
        const { email: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, email: error };
    });
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!fieldErrors.email) return;
    const error = validateEmail(e.target.value);
    setFieldErrors((prev) => {
      if (error === null) {
        const { email: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, email: error };
    });
  }

  function handlePasswordBlur(e: React.FocusEvent<HTMLInputElement>) {
    const error = validatePassword(e.target.value);
    setFieldErrors((prev) => {
      if (error === null) {
        const { password: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, password: error };
    });
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!fieldErrors.password) return;
    const error = validatePassword(e.target.value);
    setFieldErrors((prev) => {
      if (error === null) {
        const { password: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, password: error };
    });
  }

  function handlePasswordConfirmBlur(e: React.FocusEvent<HTMLInputElement>) {
    const passwordValue = passwordRef.current?.value ?? "";
    const error = validatePasswordConfirm(passwordValue, e.target.value);
    setFieldErrors((prev) => {
      if (error === null) {
        const { passwordConfirm: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, passwordConfirm: error };
    });
  }

  function handlePasswordConfirmChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!fieldErrors.passwordConfirm) return;
    const passwordValue = passwordRef.current?.value ?? "";
    const error = validatePasswordConfirm(passwordValue, e.target.value);
    setFieldErrors((prev) => {
      if (error === null) {
        const { passwordConfirm: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, passwordConfirm: error };
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const formData = new FormData(form);

    const emailValue = formData.get("email") as string;
    const passwordValue = formData.get("password") as string;
    const passwordConfirmValue = formData.get("passwordConfirm") as string;

    const errors: Record<string, string> = {};

    const emailError = validateEmail(emailValue);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(passwordValue);
    if (passwordError) errors.password = passwordError;

    const passwordConfirmError = validatePasswordConfirm(
      passwordValue,
      passwordConfirmValue
    );
    if (passwordConfirmError) errors.passwordConfirm = passwordConfirmError;

    if (Object.keys(errors).length > 0) {
      event.preventDefault();
      setFieldErrors(errors);

      if (errors.email) {
        emailRef.current?.focus();
      } else if (errors.password) {
        passwordRef.current?.focus();
      } else if (errors.passwordConfirm) {
        passwordConfirmRef.current?.focus();
      }
      return;
    }
  }

  const inputClass =
    "w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const errorClass = "text-sm text-red-500 mt-1";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate>
      <div className="space-y-5">
        {/* Email field */}
        <div>
          <label htmlFor="email" className={labelClass}>
            이메일
          </label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            onBlur={handleEmailBlur}
            onChange={handleEmailChange}
          />
          {fieldErrors.email && (
            <p className={errorClass} role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" className={labelClass}>
            비밀번호
          </label>
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            onBlur={handlePasswordBlur}
            onChange={handlePasswordChange}
          />
          {fieldErrors.password && (
            <p className={errorClass} role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Password confirm field */}
        <div>
          <label htmlFor="passwordConfirm" className={labelClass}>
            비밀번호 확인
          </label>
          <input
            ref={passwordConfirmRef}
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            onBlur={handlePasswordConfirmBlur}
            onChange={handlePasswordConfirmChange}
          />
          {fieldErrors.passwordConfirm && (
            <p className={errorClass} role="alert">
              {fieldErrors.passwordConfirm}
            </p>
          )}
        </div>

        {/* Server error — existing user */}
        {state.code === "USER_ALREADY_EXISTS" && (
          <div
            className="px-4 py-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-300"
            role="alert"
          >
            <p className="font-medium">{state.error}</p>
            <Link
              href="/login"
              className="mt-2 inline-block w-full py-2 text-center bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
            >
              로그인 페이지로 이동
            </Link>
          </div>
        )}

        {/* Server error — general */}
        {state.error && state.code !== "USER_ALREADY_EXISTS" && (
          <div
            className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? "처리 중..." : "회원가입"}
        </button>

        {/* Login link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-sm text-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </form>
  );
}
