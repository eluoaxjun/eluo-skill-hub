import { createClient } from "@/shared/infrastructure/supabase/server";
import type {
  AuthRepository,
  SigninCredentials,
  SigninResult,
  SignupCredentials,
  SignupResult,
  VerifyOtpCredentials,
  VerifyOtpResult,
  ResendOtpResult,
} from "@/auth/domain/types";

export class SupabaseAuthRepository implements AuthRepository {
  async signIn(credentials: SigninCredentials): Promise<SigninResult> {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async signUp(credentials: SignupCredentials): Promise<SignupResult> {
    const supabase = await createClient();
    const email = credentials.email.toLowerCase();

    // RPC로 이메일 중복 체크 (SECURITY DEFINER로 RLS 우회, boolean만 반환)
    const { data: emailExists } = await supabase.rpc("check_email_exists", {
      check_email: email,
    });

    if (emailExists) {
      return { success: false, error: "이미 가입된 이메일입니다" };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password: credentials.password,
      options: {
        data: {
          display_name: credentials.name,
        },
      },
    });

    if (error) {
      // 레이트 리밋: 미인증 계정에 OTP 재발송 시 발생. 기존 OTP가 유효하므로 인증 단계로 전환
      const isRateLimit =
        error.status === 429 ||
        error.message.toLowerCase().includes("rate limit") ||
        error.message.toLowerCase().includes("email rate");
      if (isRateLimit) {
        return { success: "pending" };
      }
      return { success: false, error: error.message };
    }

    return { success: "pending" };
  }

  async verifyOtp(credentials: VerifyOtpCredentials): Promise<VerifyOtpResult> {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      email: credentials.email,
      token: credentials.token,
      type: "signup",
    });

    if (error) {
      if (error.message.toLowerCase().includes("expired") || error.message.toLowerCase().includes("otp")) {
        return { success: false, error: "인증코드가 만료되었습니다. 다시 시도해주세요" };
      }
      return { success: false, error: "인증코드가 올바르지 않습니다" };
    }

    return { success: true };
  }

  async resendOtp(email: string): Promise<ResendOtpResult> {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      if (error.status === 429 || error.message.toLowerCase().includes("rate limit")) {
        return { success: false, error: "이메일 발송 횟수 제한에 도달했습니다. 잠시 후 다시 시도해주세요", isRateLimited: true };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}
