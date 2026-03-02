import { Password } from "../value-objects/Password";

describe("Password", () => {
  describe("create", () => {
    it("빈 문자열이면 에러를 던진다", () => {
      expect(() => Password.create("")).toThrow("비밀번호를 입력해주세요");
    });

    it("7자이면 에러를 던진다", () => {
      expect(() => Password.create("Abcde1x")).toThrow(
        "비밀번호는 8자 이상이어야 합니다"
      );
    });

    it("73자이면 에러를 던진다", () => {
      const longPassword = "A".repeat(72) + "1";
      expect(() => Password.create(longPassword)).toThrow(
        "비밀번호는 72자 이하여야 합니다"
      );
    });

    it("숫자만이면 에러를 던진다", () => {
      expect(() => Password.create("12345678")).toThrow(
        "비밀번호에 영문을 포함해주세요"
      );
    });

    it("영문만이면 에러를 던진다", () => {
      expect(() => Password.create("abcdefgh")).toThrow(
        "비밀번호에 숫자를 포함해주세요"
      );
    });

    it("Password1이면 성공한다", () => {
      const password = Password.create("Password1");
      expect(password).toBeInstanceOf(Password);
    });

    it("특수문자 포함 Pass@123이면 성공한다", () => {
      const password = Password.create("Pass@123");
      expect(password).toBeInstanceOf(Password);
    });

    it("정확히 8자 Abcdef12이면 성공한다 (경계값)", () => {
      const password = Password.create("Abcdef12");
      expect(password).toBeInstanceOf(Password);
    });

    it("정확히 72자이면 성공한다 (경계값)", () => {
      const password = "A".repeat(64) + "12345678";
      expect(() => Password.create(password)).not.toThrow();
    });
  });

  describe("value", () => {
    it("원본 비밀번호 값을 반환한다", () => {
      const password = Password.create("Password1");
      expect(password.value).toBe("Password1");
    });
  });

  describe("equals", () => {
    it("같은 비밀번호이면 true를 반환한다", () => {
      const pw1 = Password.create("Password1");
      const pw2 = Password.create("Password1");
      expect(pw1.equals(pw2)).toBe(true);
    });

    it("다른 비밀번호이면 false를 반환한다", () => {
      const pw1 = Password.create("Password1");
      const pw2 = Password.create("Password2");
      expect(pw1.equals(pw2)).toBe(false);
    });
  });
});
