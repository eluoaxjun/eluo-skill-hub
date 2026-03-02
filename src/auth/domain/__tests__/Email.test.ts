import { Email } from "../value-objects/Email";

describe("Email", () => {
  describe("create", () => {
    it("빈 문자열이면 에러를 던진다", () => {
      expect(() => Email.create("")).toThrow("이메일을 입력해주세요");
    });

    it("공백만 있으면 에러를 던진다", () => {
      expect(() => Email.create("  ")).toThrow("이메일을 입력해주세요");
    });

    it("잘못된 형식 (abc)이면 에러를 던진다", () => {
      expect(() => Email.create("abc")).toThrow(
        "올바른 이메일 형식이 아닙니다"
      );
    });

    it("잘못된 형식 (abc@)이면 에러를 던진다", () => {
      expect(() => Email.create("abc@")).toThrow(
        "올바른 이메일 형식이 아닙니다"
      );
    });

    it("잘못된 형식 (@test.com)이면 에러를 던진다", () => {
      expect(() => Email.create("@test.com")).toThrow(
        "올바른 이메일 형식이 아닙니다"
      );
    });

    it("다른 도메인 (gmail.com)이면 에러를 던진다", () => {
      expect(() => Email.create("user@gmail.com")).toThrow(
        "eluocnc.com 이메일만 사용할 수 있습니다"
      );
    });

    it("다른 도메인 (example.com)이면 에러를 던진다", () => {
      expect(() => Email.create("user@example.com")).toThrow(
        "eluocnc.com 이메일만 사용할 수 있습니다"
      );
    });

    it("올바른 이메일이면 Email 인스턴스를 생성한다", () => {
      const email = Email.create("user@eluocnc.com");
      expect(email).toBeInstanceOf(Email);
    });
  });

  describe("value", () => {
    it("원본 이메일 값을 반환한다", () => {
      const email = Email.create("user@eluocnc.com");
      expect(email.value).toBe("user@eluocnc.com");
    });
  });

  describe("equals", () => {
    it("같은 이메일이면 true를 반환한다", () => {
      const email1 = Email.create("user@eluocnc.com");
      const email2 = Email.create("user@eluocnc.com");
      expect(email1.equals(email2)).toBe(true);
    });

    it("다른 이메일이면 false를 반환한다", () => {
      const email1 = Email.create("user1@eluocnc.com");
      const email2 = Email.create("user2@eluocnc.com");
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
