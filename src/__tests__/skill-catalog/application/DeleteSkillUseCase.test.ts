import {
  DeleteSkillUseCase,
  type DeleteSkillInput,
  type DeleteSkillResult,
} from '@/skill-catalog/application/DeleteSkillUseCase';
import type { SkillRepository } from '@/skill-catalog/domain/SkillRepository';
import type { StorageAdapter } from '@/skill-catalog/domain/StorageAdapter';
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
    findAll: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  };
}

/**
 * StorageAdapter mock 생성 헬퍼
 */
function createMockStorageAdapter(
  overrides: Partial<StorageAdapter> = {},
): StorageAdapter {
  return {
    upload: jest.fn(),
    download: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

/**
 * 테스트용 Skill 엔티티 생성 헬퍼
 */
function createTestSkill(
  id: string = 'skill-uuid-123',
  markdownFilePath: string = 'file-uuid.md',
): Skill {
  return Skill.reconstruct(id, {
    title: '테스트 스킬',
    category: SkillCategory.create('개발'),
    markdownFilePath,
    authorId: 'author-uuid',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  });
}

describe('DeleteSkillUseCase', () => {
  describe('정상적인 스킬 삭제 시', () => {
    it('status가 success인 결과를 반환해야 한다', async () => {
      const testSkill = createTestSkill('skill-1', 'file-123.md');
      const mockRepo = createMockSkillRepository({
        findById: jest.fn().mockResolvedValue(testSkill),
        delete: jest.fn().mockResolvedValue(undefined),
      });
      const mockStorage = createMockStorageAdapter({
        delete: jest.fn().mockResolvedValue(undefined),
      });
      const useCase = new DeleteSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute({ skillId: 'skill-1' });

      expect(result.status).toBe('success');
    });

    it('먼저 findById로 스킬을 조회해야 한다', async () => {
      const testSkill = createTestSkill('skill-1', 'file-123.md');
      const mockFindById = jest.fn().mockResolvedValue(testSkill);
      const mockRepo = createMockSkillRepository({
        findById: mockFindById,
        delete: jest.fn().mockResolvedValue(undefined),
      });
      const mockStorage = createMockStorageAdapter();
      const useCase = new DeleteSkillUseCase(mockRepo, mockStorage);

      await useCase.execute({ skillId: 'skill-1' });

      expect(mockFindById).toHaveBeenCalledTimes(1);
      expect(mockFindById).toHaveBeenCalledWith('skill-1');
    });

    it('Storage에서 마크다운 파일을 삭제한 후 DB에서 레코드를 삭제해야 한다', async () => {
      const callOrder: string[] = [];
      const testSkill = createTestSkill('skill-1', 'file-123.md');
      const mockRepo = createMockSkillRepository({
        findById: jest.fn().mockResolvedValue(testSkill),
        delete: jest.fn().mockImplementation(() => {
          callOrder.push('db-delete');
          return Promise.resolve();
        }),
      });
      const mockStorage = createMockStorageAdapter({
        delete: jest.fn().mockImplementation(() => {
          callOrder.push('storage-delete');
          return Promise.resolve();
        }),
      });
      const useCase = new DeleteSkillUseCase(mockRepo, mockStorage);

      await useCase.execute({ skillId: 'skill-1' });

      expect(callOrder).toEqual(['storage-delete', 'db-delete']);
    });

    it('조회된 스킬의 마크다운 파일 경로로 Storage 삭제를 호출해야 한다', async () => {
      const testSkill = createTestSkill('skill-1', 'specific-file.md');
      const mockStorageDelete = jest.fn().mockResolvedValue(undefined);
      const mockRepo = createMockSkillRepository({
        findById: jest.fn().mockResolvedValue(testSkill),
        delete: jest.fn().mockResolvedValue(undefined),
      });
      const mockStorage = createMockStorageAdapter({
        delete: mockStorageDelete,
      });
      const useCase = new DeleteSkillUseCase(mockRepo, mockStorage);

      await useCase.execute({ skillId: 'skill-1' });

      expect(mockStorageDelete).toHaveBeenCalledWith('specific-file.md');
    });
  });

  describe('존재하지 않는 스킬 삭제 시', () => {
    it('error를 반환해야 한다', async () => {
      const mockRepo = createMockSkillRepository({
        findById: jest.fn().mockResolvedValue(null),
      });
      const mockStorage = createMockStorageAdapter();
      const useCase = new DeleteSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute({ skillId: 'nonexistent-id' });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    });

    it('Storage 삭제와 DB 삭제가 호출되지 않아야 한다', async () => {
      const mockDelete = jest.fn();
      const mockStorageDelete = jest.fn();
      const mockRepo = createMockSkillRepository({
        findById: jest.fn().mockResolvedValue(null),
        delete: mockDelete,
      });
      const mockStorage = createMockStorageAdapter({
        delete: mockStorageDelete,
      });
      const useCase = new DeleteSkillUseCase(mockRepo, mockStorage);

      await useCase.execute({ skillId: 'nonexistent-id' });

      expect(mockStorageDelete).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('Storage 파일 삭제 실패 시', () => {
    it('error를 반환해야 한다', async () => {
      const testSkill = createTestSkill('skill-1', 'file-123.md');
      const mockRepo = createMockSkillRepository({
        findById: jest.fn().mockResolvedValue(testSkill),
      });
      const mockStorage = createMockStorageAdapter({
        delete: jest.fn().mockRejectedValue(new Error('Storage 삭제 실패')),
      });
      const useCase = new DeleteSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute({ skillId: 'skill-1' });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.message).toBeTruthy();
      }
    });
  });

  describe('DB 레코드 삭제 실패 시', () => {
    it('error를 반환해야 한다', async () => {
      const testSkill = createTestSkill('skill-1', 'file-123.md');
      const mockRepo = createMockSkillRepository({
        findById: jest.fn().mockResolvedValue(testSkill),
        delete: jest.fn().mockRejectedValue(new Error('DB 삭제 실패')),
      });
      const mockStorage = createMockStorageAdapter({
        delete: jest.fn().mockResolvedValue(undefined),
      });
      const useCase = new DeleteSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute({ skillId: 'skill-1' });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.message).toBeTruthy();
      }
    });
  });

  describe('execute() 반환값 타입 검증', () => {
    it('성공 시 status 필드를 포함해야 한다', async () => {
      const testSkill = createTestSkill();
      const mockRepo = createMockSkillRepository({
        findById: jest.fn().mockResolvedValue(testSkill),
        delete: jest.fn().mockResolvedValue(undefined),
      });
      const mockStorage = createMockStorageAdapter();
      const useCase = new DeleteSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute({ skillId: 'skill-uuid-123' });

      expect(result).toHaveProperty('status');
      expect(result.status).toBe('success');
    });

    it('에러 시 status와 message 필드를 포함해야 한다', async () => {
      const mockRepo = createMockSkillRepository({
        findById: jest.fn().mockResolvedValue(null),
      });
      const mockStorage = createMockStorageAdapter();
      const useCase = new DeleteSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute({ skillId: 'nonexistent' });

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
      expect(result.status).toBe('error');
    });
  });
});
