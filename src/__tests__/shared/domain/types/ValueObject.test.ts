import { ValueObject } from "@/shared/domain/types/ValueObject";

// 테스트용 구체 ValueObject 구현
interface TestProps {
  value: string;
  count: number;
}

class TestValueObject extends ValueObject<TestProps> {
  constructor(value: string, count: number) {
    super({ value, count });
  }

  get value(): string {
    return this.props.value;
  }

  get count(): number {
    return this.props.count;
  }
}

interface NestedProps {
  inner: { name: string; tags: string[] };
}

class NestedValueObject extends ValueObject<NestedProps> {
  constructor(name: string, tags: string[]) {
    super({ inner: { name, tags } });
  }
}

describe("ValueObject 베이스 클래스", () => {
  describe("동등성 비교 (equals)", () => {
    it("동일한 속성을 가진 두 VO는 동등해야 한다", () => {
      const vo1 = new TestValueObject("hello", 42);
      const vo2 = new TestValueObject("hello", 42);

      expect(vo1.equals(vo2)).toBe(true);
    });

    it("다른 속성을 가진 두 VO는 동등하지 않아야 한다", () => {
      const vo1 = new TestValueObject("hello", 42);
      const vo2 = new TestValueObject("world", 42);

      expect(vo1.equals(vo2)).toBe(false);
    });

    it("속성 값이 일부만 다른 경우에도 동등하지 않아야 한다", () => {
      const vo1 = new TestValueObject("hello", 1);
      const vo2 = new TestValueObject("hello", 2);

      expect(vo1.equals(vo2)).toBe(false);
    });

    it("중첩된 속성을 가진 VO도 동등성 비교가 가능해야 한다", () => {
      const vo1 = new NestedValueObject("test", ["a", "b"]);
      const vo2 = new NestedValueObject("test", ["a", "b"]);

      expect(vo1.equals(vo2)).toBe(true);
    });

    it("중첩된 속성이 다른 VO는 동등하지 않아야 한다", () => {
      const vo1 = new NestedValueObject("test", ["a", "b"]);
      const vo2 = new NestedValueObject("test", ["a", "c"]);

      expect(vo1.equals(vo2)).toBe(false);
    });
  });

  describe("불변성 (immutability)", () => {
    it("props가 Object.freeze로 동결되어 있어야 한다", () => {
      const vo = new TestValueObject("frozen", 1);

      // Object.freeze로 동결된 객체는 속성 변경이 불가능하다
      expect(Object.isFrozen(vo["props"])).toBe(true);
    });
  });

  describe("속성 접근", () => {
    it("getter를 통해 내부 속성에 접근할 수 있어야 한다", () => {
      const vo = new TestValueObject("test-value", 99);

      expect(vo.value).toBe("test-value");
      expect(vo.count).toBe(99);
    });
  });
});
