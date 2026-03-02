'use server'

import { createClient } from "@/shared/infrastructure/supabase/server";
import { SupabaseAuthRepository } from "@/auth/infrastructure/SupabaseAuthRepository";
import { SignInUseCase } from "@/auth/application/SignInUseCase";
import { sanitizeRedirectTo } from "@/auth/infrastructure/sanitizeRedirectTo";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface LoginActionState {
  error?: string;
  success?: boolean;
}

export async function login(
  prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rawRedirectTo = formData.get("redirectTo") as string | null;
  const sanitizedRedirectTo = sanitizeRedirectTo(rawRedirectTo);

  const supabase = await createClient();
  const authRepository = new SupabaseAuthRepository(supabase);
  const useCase = new SignInUseCase(authRepository);

  let result: Awaited<ReturnType<SignInUseCase["execute"]>>;
  try {
    result = await useCase.execute({ email, password });
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "로그인 중 오류가 발생했습니다" };
  }

  if (!result.success) {
    return { error: result.error };
  }

  revalidatePath("/", "layout");
  redirect(sanitizedRedirectTo);
}
