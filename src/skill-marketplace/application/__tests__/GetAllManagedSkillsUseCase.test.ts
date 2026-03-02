import { GetAllManagedSkillsUseCase } from '../GetAllManagedSkillsUseCase';
import type { ManagedSkillRepository, ManagedSkillWithCategory } from '../../domain/repositories/ManagedSkillRepository';
import { SkillStatus } from '../../domain/value-objects/SkillStatus';

const mockSkills: ManagedSkillWithCategory[] = [
  {
    id: 'skill-001',
    title: '기획 자동화',
    categoryId: 'cat-001',
    categoryName: '기획',
    markdownFilePath: 'author/skill-001.md',
    authorId: 'author-001',
    status: SkillStatus.active(),
    createdAt: new Date('2026-03-01'),
  },
  {
    id: 'skill-002',
    title: '디자인 스킬',
    categoryId: 'cat-002',
    categoryName: '디자인',
    markdownFilePath: null,
    authorId: 'author-001',
    status: SkillStatus.inactive(),
    createdAt: new Date('2026-03-02'),
  },
];

const createMockRepository = (skills: ManagedSkillWithCategory[] = mockSkills): ManagedSkillRepository => ({
  findAll: jest.fn().mockResolvedValue(skills),
  save: jest.fn(),
});

describe('GetAllManagedSkillsUseCase', () => {
  it('repository.findAll()을 호출한다', async () => {
    const repository = createMockRepository();
    const useCase = new GetAllManagedSkillsUseCase(repository);

    await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it('반환된 목록에 categoryId와 categoryName이 포함된다', async () => {
    const repository = createMockRepository();
    const useCase = new GetAllManagedSkillsUseCase(repository);

    const result = await useCase.execute();

    expect(result.skills[0].categoryId).toBe('cat-001');
    expect(result.skills[0].categoryName).toBe('기획');
    expect(result.skills[1].categoryId).toBe('cat-002');
    expect(result.skills[1].categoryName).toBe('디자인');
  });

  it('status가 SkillStatusValue로 변환된다', async () => {
    const repository = createMockRepository();
    const useCase = new GetAllManagedSkillsUseCase(repository);

    const result = await useCase.execute();

    expect(result.skills[0].status).toBe('active');
    expect(result.skills[1].status).toBe('inactive');
  });

  it('markdownFilePath가 결과에 포함된다', async () => {
    const repository = createMockRepository();
    const useCase = new GetAllManagedSkillsUseCase(repository);

    const result = await useCase.execute();

    expect(result.skills[0].markdownFilePath).toBe('author/skill-001.md');
    expect(result.skills[1].markdownFilePath).toBeNull();
  });

  it('빈 목록 반환 시 { skills: [] }를 반환한다', async () => {
    const repository = createMockRepository([]);
    const useCase = new GetAllManagedSkillsUseCase(repository);

    const result = await useCase.execute();

    expect(result.skills).toEqual([]);
  });
});
