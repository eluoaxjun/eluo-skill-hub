import type { SkillRepository } from '../domain/SkillRepository';
import type { StorageAdapter } from '../domain/StorageAdapter';

export interface DeleteSkillInput {
  readonly skillId: string;
}

export type DeleteSkillResult =
  | { status: 'success' }
  | { status: 'error'; message: string };

export class DeleteSkillUseCase {
  constructor(
    private readonly skillRepository: SkillRepository,
    private readonly storageAdapter: StorageAdapter,
  ) {}

  async execute(input: DeleteSkillInput): Promise<DeleteSkillResult> {
    // 1. 스킬 조회하여 마크다운 파일 경로 획득
    const skill = await this.skillRepository.findById(input.skillId);
    if (skill === null) {
      return {
        status: 'error',
        message: '해당 스킬을 찾을 수 없습니다.',
      };
    }

    // 2. Storage에서 마크다운 파일 삭제
    try {
      await this.storageAdapter.delete(skill.markdownFilePath);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? `마크다운 파일 삭제에 실패했습니다: ${error.message}`
          : '마크다운 파일 삭제에 실패했습니다.';
      return { status: 'error', message };
    }

    // 3. DB에서 스킬 레코드 삭제
    try {
      await this.skillRepository.delete(input.skillId);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? `스킬 삭제에 실패했습니다: ${error.message}`
          : '스킬 삭제에 실패했습니다.';
      return { status: 'error', message };
    }

    return { status: 'success' };
  }
}
