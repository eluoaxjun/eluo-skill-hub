import { Entity } from '@/shared/domain/types/Entity';
import { SkillId } from '../value-objects/SkillId';
import { SkillSlug } from '../value-objects/SkillSlug';
import { SkillStatus } from '../value-objects/SkillStatus';
import type { SkillStatusType } from '../value-objects/SkillStatus';
import { Result, ok, err, SkillCatalogError } from '../errors';
import { SkillCreated, SkillPublished, SkillArchived } from '../events/SkillEvents';

interface SkillProps {
  name: string;
  slug: SkillSlug;
  summary: string;
  description: string;
  authorId: string;
  status: SkillStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Skill extends Entity<SkillId> {
  private props: SkillProps;

  private constructor(id: SkillId, props: SkillProps) {
    super(id);
    this.props = props;
  }

  static create(params: {
    name: string;
    slug: string;
    summary: string;
    description: string;
    authorId: string;
  }): Result<Skill, SkillCatalogError> {
    if (params.name.length < 1 || params.name.length > 100) {
      return err({
        type: 'INVALID_SKILL_NAME',
        message: `스킬 이름은 1자 이상 100자 이하여야 합니다. (현재: ${params.name.length}자)`,
      });
    }

    const slugResult = SkillSlug.create(params.slug);
    if (!slugResult.ok) return slugResult;

    const id = SkillId.generate();
    const now = new Date();
    const skill = new Skill(id, {
      name: params.name,
      slug: slugResult.value,
      summary: params.summary,
      description: params.description,
      authorId: params.authorId,
      status: SkillStatus.draft(),
      createdAt: now,
      updatedAt: now,
    });

    skill.addDomainEvent(new SkillCreated(id.value, params.authorId));
    return ok(skill);
  }

  static reconstruct(
    id: SkillId,
    props: {
      name: string;
      slug: SkillSlug;
      summary: string;
      description: string;
      authorId: string;
      status: SkillStatus;
      createdAt: Date;
      updatedAt: Date;
    },
  ): Skill {
    return new Skill(id, { ...props });
  }

  updateMetadata(params: {
    name?: string;
    summary?: string;
    description?: string;
  }): Result<void, SkillCatalogError> {
    if (params.name !== undefined) {
      if (params.name.length < 1 || params.name.length > 100) {
        return err({
          type: 'INVALID_SKILL_NAME',
          message: `스킬 이름은 1자 이상 100자 이하여야 합니다. (현재: ${params.name.length}자)`,
        });
      }
      this.props.name = params.name;
    }
    if (params.summary !== undefined) this.props.summary = params.summary;
    if (params.description !== undefined) this.props.description = params.description;
    this.props.updatedAt = new Date();
    return ok(undefined);
  }

  publish(): Result<void, SkillCatalogError> {
    const target = SkillStatus.published();
    if (!this.props.status.canTransitionTo(target)) {
      return err({
        type: 'INVALID_STATUS_TRANSITION',
        currentStatus: this.props.status.value,
        targetStatus: target.value,
      });
    }
    this.props.status = target;
    this.props.updatedAt = new Date();
    this.addDomainEvent(new SkillPublished(this._id.value));
    return ok(undefined);
  }

  archive(): Result<void, SkillCatalogError> {
    const target = SkillStatus.archived();
    if (!this.props.status.canTransitionTo(target)) {
      return err({
        type: 'INVALID_STATUS_TRANSITION',
        currentStatus: this.props.status.value,
        targetStatus: target.value,
      });
    }
    this.props.status = target;
    this.props.updatedAt = new Date();
    this.addDomainEvent(new SkillArchived(this._id.value));
    return ok(undefined);
  }

  republish(): Result<void, SkillCatalogError> {
    return this.publish();
  }

  get name(): string { return this.props.name; }
  get slug(): SkillSlug { return this.props.slug; }
  get summary(): string { return this.props.summary; }
  get description(): string { return this.props.description; }
  get authorId(): string { return this.props.authorId; }
  get status(): SkillStatus { return this.props.status; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
}
