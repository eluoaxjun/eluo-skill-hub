import { ValueObject } from "@/shared/domain/types/ValueObject";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_DOMAIN = "@eluocnc.com";

export class Email extends ValueObject<{ value: string }> {
  static create(value: string): Email {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new Error("이메일을 입력해주세요");
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      throw new Error("올바른 이메일 형식이 아닙니다");
    }

    if (!trimmed.endsWith(ALLOWED_DOMAIN)) {
      throw new Error("eluocnc.com 이메일만 사용할 수 있습니다");
    }

    return new Email({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
