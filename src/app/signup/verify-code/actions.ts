'use server'

import { createClient } from "@/shared/infrastructure/supabase/server";
import { SupabaseAuthRepository } from "@/auth/infrastructure/SupabaseAuthRepository";
import { VerifyCodeUseCase } from "@/auth/application/VerifyCodeUseCase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface VerifyCodeActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

export async function verifyCode(
  prevState: VerifyCodeActionState,
  formData: FormData
): Promise<VerifyCodeActionState> {
  const email = formData.get("email") as string;
  const code = formData.get("code") as string;

  const supabase = await createClient();
  const authRepository = new SupabaseAuthRepository(supabase);
  const useCase = new VerifyCodeUseCase(authRepository);

  const result = await useCase.execute({ email, code });

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function resendCode(
  prevState: VerifyCodeActionState,
  formData: FormData
): Promise<VerifyCodeActionState> {
  const email = formData.get("email") as string;

  const supabase = await createClient();
  const authRepository = new SupabaseAuthRepository(supabase);

  const result = await authRepository.resendOtp(email);

  if (!result.success) {
    if (result.statusCode === 429) {
      return { error: "잠시 후 다시 시도해주세요" };
    }
    return { error: result.error };
  }

  return { success: true, message: "인증 코드를 재발송했습니다" };
}
