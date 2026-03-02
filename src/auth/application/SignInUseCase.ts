import { Email } from "@/auth/domain/value-objects/Email";
import { Password } from "@/auth/domain/value-objects/Password";
import type { AuthRepository } from "@/auth/application/ports/AuthRepository";

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignInResult {
  success: boolean;
  error?: string;
}

export class SignInUseCase {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(input: SignInInput): Promise<SignInResult> {
    Email.create(input.email);
    Password.create(input.password);

    const result = await this.authRepository.signIn(input.email, input.password);

    if (!result.success) {
      if (result.statusCode === 429) {
        return { success: false, error: "잠시 후 다시 시도해주세요" };
      }
      return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다" };
    }

    return { success: true };
  }
}
