'use server'

import { createClient } from "@/shared/infrastructure/supabase/server";
import { SupabaseAuthRepository } from "@/auth/infrastructure/SupabaseAuthRepository";
import { SignOutUseCase } from "@/auth/application/SignOutUseCase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logout(): Promise<void> {
  const supabase = await createClient();
  const authRepository = new SupabaseAuthRepository(supabase);
  const useCase = new SignOutUseCase(authRepository);

  await useCase.execute();

  revalidatePath("/", "layout");
  redirect("/");
}
