import { Entity } from '@/shared/domain/types/Entity';
import { SkillCategory } from './SkillCategory';

export interface SkillProps {
  readonly title: string;
  readonly category: SkillCategory;
  readonly markdownFilePath: string;
  readonly authorId: string;
  readonly createdAt: Date;
}

export interface CreateSkillParams {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly markdownFilePath: string;
  readonly authorId: string;
}

export class Skill extends Entity<string> {
  private readonly props: SkillProps;

  private constructor(id: string, props: SkillProps) {
    super(id);
    this.props = props;
  }

  static create(params: CreateSkillParams): Skill {
    const trimmedTitle = params.title.trim();
    if (trimmedTitle.length === 0) {
      throw new Error('스킬 제목을 입력해 주세요');
    }

    const category = SkillCategory.create(params.category);

    return new Skill(params.id, {
      title: trimmedTitle,
      category,
      markdownFilePath: params.markdownFilePath,
      authorId: params.authorId,
      createdAt: new Date(),
    });
  }

  static reconstruct(id: string, props: SkillProps): Skill {
    return new Skill(id, props);
  }

  get title(): string {
    return this.props.title;
  }

  get category(): SkillCategory {
    return this.props.category;
  }

  get markdownFilePath(): string {
    return this.props.markdownFilePath;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
