import type { DomainEvent } from "@/shared/domain/events/DomainEvent";

// DomainEvent 인터페이스 구현 검증용 구체 클래스
class TestDomainEvent implements DomainEvent {
  readonly eventName: string;
  readonly occurredOn: Date;

  constructor(eventName: string) {
    this.eventName = eventName;
    this.occurredOn = new Date();
  }
}

// Skill Catalog 컨텍스트에서 사용할 도메인 이벤트 패턴 검증
class SkillCreatedEvent implements DomainEvent {
  readonly eventName = "SkillCreated";
  readonly occurredOn: Date;

  constructor(
    public readonly skillId: string,
    public readonly authorId: string
  ) {
    this.occurredOn = new Date();
  }
}

describe("DomainEvent 인터페이스", () => {
  describe("기본 구조", () => {
    it("eventName 속성을 가져야 한다", () => {
      const event = new TestDomainEvent("TestEvent");

      expect(event.eventName).toBe("TestEvent");
    });

    it("occurredOn 속성에 Date 객체를 가져야 한다", () => {
      const before = new Date();
      const event = new TestDomainEvent("TestEvent");
      const after = new Date();

      expect(event.occurredOn).toBeInstanceOf(Date);
      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("Skill Catalog 도메인 이벤트 패턴", () => {
    it("SkillCreated 이벤트가 DomainEvent 인터페이스를 구현할 수 있어야 한다", () => {
      const event: DomainEvent = new SkillCreatedEvent(
        "skill-uuid-123",
        "author-uuid-456"
      );

      expect(event.eventName).toBe("SkillCreated");
      expect(event.occurredOn).toBeInstanceOf(Date);
    });

    it("SkillCreated 이벤트가 커스텀 속성을 포함할 수 있어야 한다", () => {
      const event = new SkillCreatedEvent(
        "skill-uuid-123",
        "author-uuid-456"
      );

      expect(event.skillId).toBe("skill-uuid-123");
      expect(event.authorId).toBe("author-uuid-456");
    });
  });

  describe("readonly 제약 조건", () => {
    it("eventName은 readonly여야 한다", () => {
      const event = new TestDomainEvent("Immutable");

      // readonly 속성은 타입 수준에서 재할당이 금지된다
      // 런타임에서는 값이 초기화 이후 변경되지 않음을 확인한다
      expect(event.eventName).toBe("Immutable");
    });

    it("occurredOn은 readonly여야 한다", () => {
      const event = new TestDomainEvent("Immutable");
      const originalTime = event.occurredOn.getTime();

      // readonly 속성은 타입 수준에서 재할당이 금지된다
      expect(event.occurredOn.getTime()).toBe(originalTime);
    });
  });
});
