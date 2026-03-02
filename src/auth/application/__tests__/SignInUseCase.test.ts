import { SignInUseCase } from "../SignInUseCase";
import type { AuthRepository, AuthResult } from "@/auth/application/ports/AuthRepository";

const VALID_EMAIL = "user@eluocnc.com";
const VALID_PASSWORD = "Password1";

const createMockAuthRepository = (
  signInResult: AuthResult
): AuthRepository => ({
  signUp: jest.fn(),
  signIn: jest.fn().mockResolvedValue(signInResult),
  signOut: jest.fn(),
  verifyOtp: jest.fn(),
  resendOtp: jest.fn(),
});

describe("SignInUseCase", () => {
  describe("이메일 유효성 검사", () => {
    it("빈 이메일이면 Email 검증 에러를 던진다", async () => {
      const repository = createMockAuthRepository({ success: true });
      const useCase = new SignInUseCase(repository);

      await expect(
        useCase.execute({ email: "", password: VALID_PASSWORD })
      ).rejects.toThrow("이메일을 입력해주세요");
    });

    it("잘못된 형식의 이메일이면 Email 검증 에러를 던진다", async () => {
      const repository = createMockAuthRepository({ success: true });
      const useCase = new SignInUseCase(repository);

      await expect(
        useCase.execute({ email: "invalid-email", password: VALID_PASSWORD })
      ).rejects.toThrow("올바른 이메일 형식이 아닙니다");
    });

    it("허용되지 않은 도메인 이메일이면 Email 검증 에러를 던진다", async () => {
      const repository = createMockAuthRepository({ success: true });
      const useCase = new SignInUseCase(repository);

      await expect(
        useCase.execute({ email: "user@gmail.com", password: VALID_PASSWORD })
      ).rejects.toThrow("eluocnc.com 이메일만 사용할 수 있습니다");
    });
  });

  describe("비밀번호 유효성 검사", () => {
    it("빈 비밀번호이면 Password 검증 에러를 던진다", async () => {
      const repository = createMockAuthRepository({ success: true });
      const useCase = new SignInUseCase(repository);

      await expect(
        useCase.execute({ email: VALID_EMAIL, password: "" })
      ).rejects.toThrow("비밀번호를 입력해주세요");
    });

    it("8자 미만 비밀번호이면 Password 검증 에러를 던진다", async () => {
      const repository = createMockAuthRepository({ success: true });
      const useCase = new SignInUseCase(repository);

      await expect(
        useCase.execute({ email: VALID_EMAIL, password: "Short1" })
      ).rejects.toThrow("비밀번호는 8자 이상이어야 합니다");
    });

    it("영문이 없는 비밀번호이면 Password 검증 에러를 던진다", async () => {
      const repository = createMockAuthRepository({ success: true });
      const useCase = new SignInUseCase(repository);

      await expect(
        useCase.execute({ email: VALID_EMAIL, password: "12345678" })
      ).rejects.toThrow("비밀번호에 영문을 포함해주세요");
    });
  });

  describe("authRepository.signIn 호출", () => {
    it("유효한 입력이면 authRepository.signIn을 이메일과 비밀번호로 호출한다", async () => {
      const repository = createMockAuthRepository({ success: true });
      const useCase = new SignInUseCase(repository);

      await useCase.execute({ email: VALID_EMAIL, password: VALID_PASSWORD });

      expect(repository.signIn).toHaveBeenCalledTimes(1);
      expect(repository.signIn).toHaveBeenCalledWith(VALID_EMAIL, VALID_PASSWORD);
    });
  });

  describe("성공 케이스", () => {
    it("저장소가 success: true를 반환하면 { success: true }를 반환한다", async () => {
      const repository = createMockAuthRepository({ success: true });
      const useCase = new SignInUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("실패 케이스 (FR-16)", () => {
    it("저장소가 success: false (non-429)를 반환하면 인증 실패 메시지를 반환한다", async () => {
      const repository = createMockAuthRepository({
        success: false,
        error: "invalid credentials",
        statusCode: 400,
      });
      const useCase = new SignInUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      });

      expect(result).toEqual({
        success: false,
        error: "이메일 또는 비밀번호가 올바르지 않습니다",
      });
    });

    it("저장소가 statusCode 없이 success: false를 반환하면 인증 실패 메시지를 반환한다", async () => {
      const repository = createMockAuthRepository({ success: false });
      const useCase = new SignInUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      });

      expect(result).toEqual({
        success: false,
        error: "이메일 또는 비밀번호가 올바르지 않습니다",
      });
    });
  });

  describe("요청 제한 케이스 (FR-36)", () => {
    it("저장소가 statusCode 429를 반환하면 재시도 요청 메시지를 반환한다", async () => {
      const repository = createMockAuthRepository({
        success: false,
        error: "too many requests",
        statusCode: 429,
      });
      const useCase = new SignInUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      });

      expect(result).toEqual({
        success: false,
        error: "잠시 후 다시 시도해주세요",
      });
    });
  });
});
