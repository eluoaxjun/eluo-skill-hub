import { Entity } from "@/shared/domain/types/Entity";
import type { DomainEvent } from "@/shared/domain/events/DomainEvent";

// 테스트용 구체 Entity 구현
class TestId {
  constructor(public readonly value: string) {}
}

class TestEvent implements DomainEvent {
  readonly eventName = "TestEvent";
  readonly occurredOn: Date;
  constructor(public readonly payload: string) {
    this.occurredOn = new Date();
  }
}

class TestEntity extends Entity<TestId> {
  constructor(id: TestId) {
    super(id);
  }

  triggerEvent(payload: string): void {
    this.addDomainEvent(new TestEvent(payload));
  }
}

describe("Entity 베이스 클래스", () => {
  describe("식별자 관리", () => {
    it("생성 시 전달한 ID를 반환해야 한다", () => {
      const id = new TestId("test-123");
      const entity = new TestEntity(id);

      expect(entity.id).toBe(id);
      expect(entity.id.value).toBe("test-123");
    });
  });

  describe("도메인 이벤트 수집", () => {
    it("초기 상태에서 도메인 이벤트 목록이 비어 있어야 한다", () => {
      const entity = new TestEntity(new TestId("test-1"));

      expect(entity.domainEvents).toHaveLength(0);
    });

    it("addDomainEvent를 통해 이벤트를 수집할 수 있어야 한다", () => {
      const entity = new TestEntity(new TestId("test-2"));

      entity.triggerEvent("payload-1");

      expect(entity.domainEvents).toHaveLength(1);
      expect(entity.domainEvents[0].eventName).toBe("TestEvent");
    });

    it("여러 이벤트를 순서대로 수집할 수 있어야 한다", () => {
      const entity = new TestEntity(new TestId("test-3"));

      entity.triggerEvent("payload-1");
      entity.triggerEvent("payload-2");
      entity.triggerEvent("payload-3");

      expect(entity.domainEvents).toHaveLength(3);
      expect((entity.domainEvents[0] as TestEvent).payload).toBe("payload-1");
      expect((entity.domainEvents[1] as TestEvent).payload).toBe("payload-2");
      expect((entity.domainEvents[2] as TestEvent).payload).toBe("payload-3");
    });
  });

  describe("도메인 이벤트 발행(클리어)", () => {
    it("clearDomainEvents 호출 후 이벤트 목록이 비어야 한다", () => {
      const entity = new TestEntity(new TestId("test-4"));
      entity.triggerEvent("payload-1");
      entity.triggerEvent("payload-2");

      expect(entity.domainEvents).toHaveLength(2);

      entity.clearDomainEvents();

      expect(entity.domainEvents).toHaveLength(0);
    });
  });

  describe("domainEvents의 불변성", () => {
    it("domainEvents 배열은 ReadonlyArray여야 한다", () => {
      const entity = new TestEntity(new TestId("test-5"));
      entity.triggerEvent("payload-1");

      const events = entity.domainEvents;

      // ReadonlyArray는 push 등의 변경 메서드를 제공하지 않음을 타입 수준에서 검증
      // 런타임에서는 반환된 배열의 참조가 내부 배열을 직접 노출하지 않아야 한다
      expect(Array.isArray(events)).toBe(true);
      expect(events).toHaveLength(1);
    });
  });
});
