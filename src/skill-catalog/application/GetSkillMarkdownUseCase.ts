import type { StorageAdapter } from '../domain/StorageAdapter';

export interface GetSkillMarkdownInput {
  readonly filePath: string;
}

export type GetSkillMarkdownResult =
  | { status: 'success'; content: string }
  | { status: 'error'; message: string };

export class GetSkillMarkdownUseCase {
  constructor(private readonly storageAdapter: StorageAdapter) {}

  async execute(
    input: GetSkillMarkdownInput,
  ): Promise<GetSkillMarkdownResult> {
    try {
      const content = await this.storageAdapter.download(input.filePath);
      return { status: 'success', content };
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? `마크다운 파일을 불러올 수 없습니다: ${error.message}`
          : '마크다운 파일을 불러올 수 없습니다: 알 수 없는 오류가 발생했습니다.';
      return { status: 'error', message };
    }
  }
}
