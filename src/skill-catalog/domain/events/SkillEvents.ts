import type { DomainEvent } from '@/shared/domain/events/DomainEvent';

export class SkillCreated implements DomainEvent {
  readonly eventName = 'SkillCreated';
  readonly occurredOn: Date;

  constructor(
    readonly skillId: string,
    readonly authorId: string,
  ) {
    this.occurredOn = new Date();
  }
}

export class SkillPublished implements DomainEvent {
  readonly eventName = 'SkillPublished';
  readonly occurredOn: Date;

  constructor(readonly skillId: string) {
    this.occurredOn = new Date();
  }
}

export class SkillArchived implements DomainEvent {
  readonly eventName = 'SkillArchived';
  readonly occurredOn: Date;

  constructor(readonly skillId: string) {
    this.occurredOn = new Date();
  }
}
