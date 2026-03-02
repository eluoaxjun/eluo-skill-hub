import { ValueObject } from "@/shared/domain/types/ValueObject";

const MIN_LENGTH = 8;
const MAX_LENGTH = 72;
const HAS_LETTER = /[a-zA-Z]/;
const HAS_DIGIT = /[0-9]/;

export class Password extends ValueObject<{ value: string }> {
  static create(value: string): Password {
    if (!value) {
      throw new Error("비밀번호를 입력해주세요");
    }

    if (value.length < MIN_LENGTH) {
      throw new Error("비밀번호는 8자 이상이어야 합니다");
    }

    if (value.length > MAX_LENGTH) {
      throw new Error("비밀번호는 72자 이하여야 합니다");
    }

    if (!HAS_LETTER.test(value)) {
      throw new Error("비밀번호에 영문을 포함해주세요");
    }

    if (!HAS_DIGIT.test(value)) {
      throw new Error("비밀번호에 숫자를 포함해주세요");
    }

    return new Password({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
