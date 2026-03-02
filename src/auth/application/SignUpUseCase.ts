import { Email } from "@/auth/domain/value-objects/Email";
import { Password } from "@/auth/domain/value-objects/Password";
import {
  AUTH_ERROR_USER_ALREADY_EXISTS,
  type AuthRepository,
} from "@/auth/application/ports/AuthRepository";

export interface SignUpInput {
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface SignUpOutput {
  success: boolean;
  error?: string;
  code?: string;
}

export class SignUpUseCase {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(input: SignUpInput): Promise<SignUpOutput> {
    // Step 1: Validate email via VO (throws on invalid)
    try {
      Email.create(input.email);
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "이메일 유효성 검사에 실패했습니다" };
    }

    // Step 2: Validate password via VO (throws on invalid)
    try {
      Password.create(input.password);
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "비밀번호 유효성 검사에 실패했습니다" };
    }

    // Step 3: Check password confirmation
    if (input.password !== input.passwordConfirm) {
      return { success: false, error: "비밀번호가 일치하지 않습니다" };
    }

    // Step 4: Call repository
    const result = await this.authRepository.signUp(input.email, input.password);

    // Step 5: Handle specific error cases
    if (!result.success) {
      if (result.statusCode === 429) {
        return { success: false, error: "잠시 후 다시 시도해주세요" };
      }
      if (result.code === AUTH_ERROR_USER_ALREADY_EXISTS) {
        return {
          success: false,
          error: result.error,
          code: AUTH_ERROR_USER_ALREADY_EXISTS,
        };
      }
      // Other failures: mask for security (C-06)
      return { success: true };
    }

    return { success: true };
  }
}
