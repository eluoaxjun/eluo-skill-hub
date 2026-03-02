import { SignOutUseCase } from "../SignOutUseCase";
import type { AuthRepository, AuthResult } from "@/auth/application/ports/AuthRepository";

const createMockAuthRepository = (
  signOutResult: AuthResult
): AuthRepository => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn().mockResolvedValue(signOutResult),
  verifyOtp: jest.fn(),
  resendOtp: jest.fn(),
});

describe("SignOutUseCase", () => {
  it("authRepository.signOut을 호출한다", async () => {
    const repository = createMockAuthRepository({ success: true });
    const useCase = new SignOutUseCase(repository);

    await useCase.execute();

    expect(repository.signOut).toHaveBeenCalledTimes(1);
  });

  it("signOut 성공 시 { success: true }를 반환한다", async () => {
    const repository = createMockAuthRepository({ success: true });
    const useCase = new SignOutUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual({ success: true });
  });

  it("signOut 실패 시 { success: false, error }를 반환한다", async () => {
    const repository = createMockAuthRepository({
      success: false,
      error: "로그아웃에 실패했습니다",
    });
    const useCase = new SignOutUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual({ success: false, error: "로그아웃에 실패했습니다" });
  });
});
