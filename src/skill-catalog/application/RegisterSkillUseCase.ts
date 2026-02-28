import { Skill } from '../domain/Skill';
import type { SkillRepository } from '../domain/SkillRepository';
import type { StorageAdapter } from '../domain/StorageAdapter';

export interface RegisterSkillInput {
  readonly title: string;
  readonly category: string;
  readonly file: File;
  readonly authorId: string;
}

export type RegisterSkillResult =
  | { status: 'success'; skill: Skill }
  | { status: 'error'; message: string };

export class RegisterSkillUseCase {
  constructor(
    private readonly skillRepository: SkillRepository,
    private readonly storageAdapter: StorageAdapter,
  ) {}

  async execute(input: RegisterSkillInput): Promise<RegisterSkillResult> {
    // 1. UUID 기반 파일 경로 생성
    const filePath = `${crypto.randomUUID()}.md`;

    // 2. 도메인 엔티티 생성 (제목, 카테고리 유효성 검증)
    let skill: Skill;
    try {
      skill = Skill.create({
        id: crypto.randomUUID(),
        title: input.title,
        category: input.category,
        markdownFilePath: filePath,
        authorId: input.authorId,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : '스킬 생성에 실패했습니다.';
      return { status: 'error', message };
    }

    // 3. Storage에 마크다운 파일 업로드
    try {
      await this.storageAdapter.upload(input.file, filePath);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? `파일 업로드에 실패했습니다: ${error.message}`
          : '파일 업로드에 실패했습니다.';
      return { status: 'error', message };
    }

    // 4. DB에 스킬 레코드 저장
    try {
      await this.skillRepository.save(skill);
    } catch (error: unknown) {
      // DB 저장 실패 시 Storage 파일 삭제 시도 (고아 파일 방지)
      try {
        await this.storageAdapter.delete(filePath);
      } catch {
        // Storage 삭제 실패는 무시하고 원본 에러를 반환
      }

      const message =
        error instanceof Error
          ? `스킬 등록에 실패했습니다: ${error.message}`
          : '스킬 등록에 실패했습니다.';
      return { status: 'error', message };
    }

    return { status: 'success', skill };
  }
}
