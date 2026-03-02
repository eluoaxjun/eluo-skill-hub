import type { AuthRepository } from "@/auth/application/ports/AuthRepository";

export interface SignOutResult {
  success: boolean;
  error?: string;
}

export class SignOutUseCase {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(): Promise<SignOutResult> {
    const result = await this.authRepository.signOut();

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true };
  }
}
