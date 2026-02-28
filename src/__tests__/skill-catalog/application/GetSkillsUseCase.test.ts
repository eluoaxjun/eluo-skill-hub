import {
  GetSkillsUseCase,
  type GetSkillsInput,
  type GetSkillsResult,
} from '@/skill-catalog/application/GetSkillsUseCase';
import type { SkillRepository } from '@/skill-catalog/domain/SkillRepository';
import { Skill } from '@/skill-catalog/domain/Skill';
import { SkillCategory } from '@/skill-catalog/domain/SkillCategory';

/**
 * SkillRepository mock 생성 헬퍼
 */
function createMockSkillRepository(
  overrides: Partial<SkillRepository> = {},
): SkillRepository {
  return {
    findById: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  };
}

/**
 * 테스트용 Skill 엔티티 생성 헬퍼
 */
function createTestSkill(params: {
  id: string;
  title: string;
  category: string;
  authorId?: string;
}): Skill {
  return Skill.reconstruct(params.id, {
    title: params.title,
    category: SkillCategory.create(params.category),
    markdownFilePath: `${params.id}.md`,
    authorId: params.authorId ?? 'author-uuid',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  });
}

describe('GetSkillsUseCase', () => {
  describe('전체 스킬 목록 조회 시', () => {
    it('status가 success이고 skills 배열에 전체 목록이 포함되어야 한다', async () => {
      const skills = [
        createTestSkill({ id: 'skill-1', title: '기획 스킬', category: '기획' }),
        createTestSkill({ id: 'skill-2', title: '개발 스킬', category: '개발' }),
      ];
      const mockRepo = createMockSkillRepository({
        findAll: jest.fn().mockResolvedValue(skills),
      });
      const useCase = new GetSkillsUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.skills).toHaveLength(2);
        expect(result.skills[0].title).toBe('기획 스킬');
        expect(result.skills[1].title).toBe('개발 스킬');
      }
    });

    it('SkillRepository.findAll이 정확히 한 번 호출되어야 한다', async () => {
      const mockFindAll = jest.fn().mockResolvedValue([]);
      const mockRepo = createMockSkillRepository({ findAll: mockFindAll });
      const useCase = new GetSkillsUseCase(mockRepo);

      await useCase.execute();

      expect(mockFindAll).toHaveBeenCalledTimes(1);
    });

    it('입력 없이 호출 시 카테고리 필터 없이 전체 조회되어야 한다', async () => {
      const mockFindAll = jest.fn().mockResolvedValue([]);
      const mockRepo = createMockSkillRepository({ findAll: mockFindAll });
      const useCase = new GetSkillsUseCase(mockRepo);

      await useCase.execute();

      expect(mockFindAll).toHaveBeenCalledWith(undefined);
    });
  });

  describe('카테고리 필터링 조회 시', () => {
    it('지정된 카테고리의 스킬만 반환되어야 한다', async () => {
      const filteredSkills = [
        createTestSkill({ id: 'skill-1', title: '개발 스킬 1', category: '개발' }),
        createTestSkill({ id: 'skill-2', title: '개발 스킬 2', category: '개발' }),
      ];
      const mockFindAll = jest.fn().mockResolvedValue(filteredSkills);
      const mockRepo = createMockSkillRepository({ findAll: mockFindAll });
      const useCase = new GetSkillsUseCase(mockRepo);

      const result = await useCase.execute({ category: '개발' });

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.skills).toHaveLength(2);
        expect(result.skills.every((s) => s.category.value === '개발')).toBe(
          true,
        );
      }
    });

    it('카테고리 필터가 findAll에 전달되어야 한다', async () => {
      const mockFindAll = jest.fn().mockResolvedValue([]);
      const mockRepo = createMockSkillRepository({ findAll: mockFindAll });
      const useCase = new GetSkillsUseCase(mockRepo);

      await useCase.execute({ category: 'QA' });

      expect(mockFindAll).toHaveBeenCalledWith({ category: 'QA' });
    });
  });

  describe('빈 목록을 반환하는 경우', () => {
    it('status가 success이고 skills가 빈 배열이어야 한다', async () => {
      const mockRepo = createMockSkillRepository({
        findAll: jest.fn().mockResolvedValue([]),
      });
      const useCase = new GetSkillsUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.skills).toHaveLength(0);
        expect(result.skills).toEqual([]);
      }
    });
  });

  describe('Repository가 에러를 throw하는 경우', () => {
    it('status가 error인 결과를 반환해야 한다', async () => {
      const mockRepo = createMockSkillRepository({
        findAll: jest.fn().mockRejectedValue(new Error('DB 조회 실패')),
      });
      const useCase = new GetSkillsUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    });

    it('에러 메시지에 원본 에러 정보가 포함되어야 한다', async () => {
      const mockRepo = createMockSkillRepository({
        findAll: jest
          .fn()
          .mockRejectedValue(new Error('네트워크 타임아웃 발생')),
      });
      const useCase = new GetSkillsUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.message).toContain('네트워크 타임아웃 발생');
      }
    });

    it('Error가 아닌 값이 throw된 경우에도 error를 반환해야 한다', async () => {
      const mockRepo = createMockSkillRepository({
        findAll: jest.fn().mockRejectedValue('문자열 에러'),
      });
      const useCase = new GetSkillsUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('execute() 반환값 타입 검증', () => {
    it('성공 시 status와 skills 필드를 포함해야 한다', async () => {
      const mockRepo = createMockSkillRepository({
        findAll: jest.fn().mockResolvedValue([]),
      });
      const useCase = new GetSkillsUseCase(mockRepo);

      const result = await useCase.execute();

      expect(result).toHaveProperty('status');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result).toHaveProperty('skills');
        expect(Array.isArray(result.skills)).toBe(true);
      }
    });
  });
});
