import type { Skill } from '../domain/Skill';
import type { SkillRepository } from '../domain/SkillRepository';
import type { SkillCategoryValue } from '../domain/SkillCategory';

export interface GetSkillsInput {
  readonly category?: SkillCategoryValue;
}

export type GetSkillsResult =
  | { status: 'success'; skills: ReadonlyArray<Skill> }
  | { status: 'error'; message: string };

export class GetSkillsUseCase {
  constructor(private readonly skillRepository: SkillRepository) {}

  async execute(input?: GetSkillsInput): Promise<GetSkillsResult> {
    try {
      const params = input ? { category: input.category } : undefined;
      const skills = await this.skillRepository.findAll(params);
      return { status: 'success', skills };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? `스킬 목록 조회에 실패했습니다: ${error.message}`
          : '스킬 목록 조회에 실패했습니다: 알 수 없는 오류가 발생했습니다.';
      return { status: 'error', message };
    }
  }
}
