'use server'

import { createClient } from "@/shared/infrastructure/supabase/server";
import { SupabaseAuthRepository } from "@/auth/infrastructure/SupabaseAuthRepository";
import { SignUpUseCase } from "@/auth/application/SignUpUseCase";
import { redirect } from "next/navigation";

export interface SignupActionState {
  error?: string;
  code?: string;
  success?: boolean;
}

export async function signup(
  prevState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("passwordConfirm") as string;

  const supabase = await createClient();
  const authRepository = new SupabaseAuthRepository(supabase);
  const useCase = new SignUpUseCase(authRepository);

  const result = await useCase.execute({ email, password, passwordConfirm });

  if (!result.success) {
    return { error: result.error, code: result.code };
  }

  redirect(`/signup/verify-code?email=${encodeURIComponent(email)}`);
}
