import { CreateManagedSkillUseCase } from '../CreateManagedSkillUseCase';
import type { ManagedSkillRepository } from '../../domain/repositories/ManagedSkillRepository';
import { ManagedSkill } from '../../domain/entities/ManagedSkill';
import { SkillStatus } from '../../domain/value-objects/SkillStatus';

const createdSkill = ManagedSkill.create({
  id: 'new-skill-id',
  title: '새 스킬',
  categoryId: 'cat-uuid-001',
  markdownFilePath: 'author-id/new-skill-id.md',
  authorId: 'author-id',
  status: SkillStatus.active(),
  createdAt: new Date('2026-03-02'),
});

const createMockRepository = (): ManagedSkillRepository => ({
  findAll: jest.fn(),
  save: jest.fn().mockResolvedValue(createdSkill),
});

describe('CreateManagedSkillUseCase', () => {
  const validCommand = {
    title: '새 스킬',
    categoryId: 'cat-uuid-001',
    markdownContent: '# 새 스킬\n\n설명입니다.',
    fileName: 'new-skill.md',
    authorId: 'author-id',
  };

  it('유효한 categoryId와 마크다운으로 스킬 생성 성공', async () => {
    const repository = createMockRepository();
    const useCase = new CreateManagedSkillUseCase(repository);

    const result = await useCase.execute(validCommand);

    expect(result.skill).toBeDefined();
    expect(result.skill.id).toBe('new-skill-id');
  });

  it('repository.save()가 categoryId를 올바르게 전달받아 호출된다', async () => {
    const repository = createMockRepository();
    const useCase = new CreateManagedSkillUseCase(repository);

    await useCase.execute(validCommand);

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 'cat-uuid-001',
        title: '새 스킬',
        markdownContent: '# 새 스킬\n\n설명입니다.',
        authorId: 'author-id',
      })
    );
  });

  it('생성된 스킬 DTO를 반환한다', async () => {
    const repository = createMockRepository();
    const useCase = new CreateManagedSkillUseCase(repository);

    const result = await useCase.execute(validCommand);

    expect(result.skill.title).toBe('새 스킬');
    expect(result.skill.categoryId).toBe('cat-uuid-001');
    expect(result.skill.status).toBe('active');
    expect(result.skill.createdAt).toBeDefined();
  });
});
