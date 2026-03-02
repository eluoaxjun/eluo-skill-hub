import { SignUpUseCase } from "../SignUpUseCase";
import type { AuthRepository, AuthResult } from "@/auth/application/ports/AuthRepository";
import { AUTH_ERROR_USER_ALREADY_EXISTS } from "@/auth/application/ports/AuthRepository";

const createMockRepository = (result: AuthResult): AuthRepository => ({
  signUp: jest.fn().mockResolvedValue(result),
  signIn: jest.fn(),
  signOut: jest.fn(),
  verifyOtp: jest.fn(),
  resendOtp: jest.fn(),
});

const VALID_EMAIL = "user@eluocnc.com";
const VALID_PASSWORD = "Password1";

describe("SignUpUseCase", () => {
  describe("이메일 유효성 검사", () => {
    it("빈 이메일이면 이메일 유효성 에러를 반환한다", async () => {
      const repository = createMockRepository({ success: true });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: "",
        password: VALID_PASSWORD,
        passwordConfirm: VALID_PASSWORD,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("이메일을 입력해주세요");
      expect(repository.signUp).not.toHaveBeenCalled();
    });

    it("잘못된 이메일 형식이면 유효성 에러를 반환한다", async () => {
      const repository = createMockRepository({ success: true });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: "not-an-email",
        password: VALID_PASSWORD,
        passwordConfirm: VALID_PASSWORD,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("올바른 이메일 형식이 아닙니다");
      expect(repository.signUp).not.toHaveBeenCalled();
    });

    it("허용되지 않은 도메인이면 유효성 에러를 반환한다", async () => {
      const repository = createMockRepository({ success: true });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: "user@gmail.com",
        password: VALID_PASSWORD,
        passwordConfirm: VALID_PASSWORD,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("eluocnc.com 이메일만 사용할 수 있습니다");
      expect(repository.signUp).not.toHaveBeenCalled();
    });
  });

  describe("비밀번호 유효성 검사", () => {
    it("빈 비밀번호이면 비밀번호 유효성 에러를 반환한다", async () => {
      const repository = createMockRepository({ success: true });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: "",
        passwordConfirm: "",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("비밀번호를 입력해주세요");
      expect(repository.signUp).not.toHaveBeenCalled();
    });

    it("8자 미만이면 비밀번호 유효성 에러를 반환한다", async () => {
      const repository = createMockRepository({ success: true });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: "Abc1234",
        passwordConfirm: "Abc1234",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("비밀번호는 8자 이상이어야 합니다");
      expect(repository.signUp).not.toHaveBeenCalled();
    });

    it("영문 없이 숫자만이면 비밀번호 유효성 에러를 반환한다", async () => {
      const repository = createMockRepository({ success: true });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: "12345678",
        passwordConfirm: "12345678",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("비밀번호에 영문을 포함해주세요");
      expect(repository.signUp).not.toHaveBeenCalled();
    });

    it("숫자 없이 영문만이면 비밀번호 유효성 에러를 반환한다", async () => {
      const repository = createMockRepository({ success: true });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: "abcdefgh",
        passwordConfirm: "abcdefgh",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("비밀번호에 숫자를 포함해주세요");
      expect(repository.signUp).not.toHaveBeenCalled();
    });
  });

  describe("비밀번호 확인 검사", () => {
    it("비밀번호와 확인 비밀번호가 다르면 에러를 반환한다", async () => {
      const repository = createMockRepository({ success: true });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
        passwordConfirm: "DifferentPass1",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("비밀번호가 일치하지 않습니다");
      expect(repository.signUp).not.toHaveBeenCalled();
    });
  });

  describe("리포지토리 호출", () => {
    it("유효한 입력이면 authRepository.signUp을 이메일·비밀번호와 함께 호출한다", async () => {
      const repository = createMockRepository({ success: true });
      const useCase = new SignUpUseCase(repository);

      await useCase.execute({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
        passwordConfirm: VALID_PASSWORD,
      });

      expect(repository.signUp).toHaveBeenCalledTimes(1);
      expect(repository.signUp).toHaveBeenCalledWith(VALID_EMAIL, VALID_PASSWORD);
    });
  });

  describe("보안 정책 C-06: 응답 마스킹", () => {
    it("리포지토리가 성공을 반환하면 { success: true }를 반환한다", async () => {
      const repository = createMockRepository({ success: true });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
        passwordConfirm: VALID_PASSWORD,
      });

      expect(result).toEqual({ success: true });
    });

    it("리포지토리가 일반 실패를 반환해도 { success: true }를 반환한다 (계정 존재 여부 노출 방지)", async () => {
      const repository = createMockRepository({
        success: false,
        error: "이미 가입된 이메일입니다",
        statusCode: 400,
      });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
        passwordConfirm: VALID_PASSWORD,
      });

      expect(result).toEqual({ success: true });
    });

    it("리포지토리가 500 에러를 반환해도 { success: true }를 반환한다 (서버 오류 노출 방지)", async () => {
      const repository = createMockRepository({
        success: false,
        error: "Internal Server Error",
        statusCode: 500,
      });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
        passwordConfirm: VALID_PASSWORD,
      });

      expect(result).toEqual({ success: true });
    });

    it("리포지토리가 USER_ALREADY_EXISTS를 반환하면 에러와 코드를 그대로 노출한다", async () => {
      const repository = createMockRepository({
        success: false,
        error: "이미 가입된 회원입니다",
        code: AUTH_ERROR_USER_ALREADY_EXISTS,
      });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
        passwordConfirm: VALID_PASSWORD,
      });

      expect(result).toEqual({
        success: false,
        error: "이미 가입된 회원입니다",
        code: AUTH_ERROR_USER_ALREADY_EXISTS,
      });
    });

    it("리포지토리가 429를 반환하면 rate limit 에러를 노출한다", async () => {
      const repository = createMockRepository({
        success: false,
        error: "Too Many Requests",
        statusCode: 429,
      });
      const useCase = new SignUpUseCase(repository);

      const result = await useCase.execute({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
        passwordConfirm: VALID_PASSWORD,
      });

      expect(result).toEqual({
        success: false,
        error: "잠시 후 다시 시도해주세요",
      });
    });
  });
});
