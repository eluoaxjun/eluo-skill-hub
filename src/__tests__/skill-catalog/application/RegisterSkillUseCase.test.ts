import {
  RegisterSkillUseCase,
  type RegisterSkillInput,
  type RegisterSkillResult,
} from '@/skill-catalog/application/RegisterSkillUseCase';
import type { SkillRepository } from '@/skill-catalog/domain/SkillRepository';
import type { StorageAdapter } from '@/skill-catalog/domain/StorageAdapter';
import { Skill } from '@/skill-catalog/domain/Skill';

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
    upload: jest.fn().mockResolvedValue({ path: 'test-uuid.md' }),
    download: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  };
}

/**
 * 유효한 RegisterSkillInput 생성 헬퍼
 */
function createValidInput(
  overrides: Partial<RegisterSkillInput> = {},
): RegisterSkillInput {
  const file = new File(['# Test Markdown'], 'test.md', {
    type: 'text/markdown',
  });
  return {
    title: '테스트 스킬',
    category: '개발',
    file,
    authorId: 'author-uuid-123',
    ...overrides,
  };
}

describe('RegisterSkillUseCase', () => {
  describe('정상적인 스킬 등록 시', () => {
    it('status가 success이고 skill이 반환되어야 한다', async () => {
      const mockRepo = createMockSkillRepository({
        save: jest.fn().mockResolvedValue(undefined),
      });
      const mockStorage = createMockStorageAdapter({
        upload: jest.fn().mockResolvedValue({ path: 'generated-uuid.md' }),
      });
      const useCase = new RegisterSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute(createValidInput());

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.skill).toBeInstanceOf(Skill);
        expect(result.skill.title).toBe('테스트 스킬');
        expect(result.skill.category.value).toBe('개발');
        expect(result.skill.authorId).toBe('author-uuid-123');
      }
    });

    it('Storage에 파일을 먼저 업로드한 후 DB에 저장해야 한다', async () => {
      const callOrder: string[] = [];
      const mockRepo = createMockSkillRepository({
        save: jest.fn().mockImplementation(() => {
          callOrder.push('save');
          return Promise.resolve();
        }),
      });
      const mockStorage = createMockStorageAdapter({
        upload: jest.fn().mockImplementation(() => {
          callOrder.push('upload');
          return Promise.resolve({ path: 'uuid.md' });
        }),
      });
      const useCase = new RegisterSkillUseCase(mockRepo, mockStorage);

      await useCase.execute(createValidInput());

      expect(callOrder).toEqual(['upload', 'save']);
    });

    it('파일 경로가 UUID.md 형식으로 생성되어야 한다', async () => {
      const mockUpload = jest
        .fn()
        .mockResolvedValue({ path: 'generated-uuid.md' });
      const mockStorage = createMockStorageAdapter({ upload: mockUpload });
      const mockRepo = createMockSkillRepository({
        save: jest.fn().mockResolvedValue(undefined),
      });
      const useCase = new RegisterSkillUseCase(mockRepo, mockStorage);

      await useCase.execute(createValidInput());

      expect(mockUpload).toHaveBeenCalledTimes(1);
      const uploadPath = mockUpload.mock.calls[0][1] as string;
      // UUID.md 형식 확인: UUID 패턴 + .md 확장자
      expect(uploadPath).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.md$/,
      );
    });

    it('Skill.create로 도메인 엔티티를 생성해야 한다', async () => {
      const mockRepo = createMockSkillRepository({
        save: jest.fn().mockResolvedValue(undefined),
      });
      const mockStorage = createMockStorageAdapter();
      const useCase = new RegisterSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute(createValidInput());

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.skill.createdAt).toBeInstanceOf(Date);
      }
    });
  });

  describe('도메인 검증 실패 시', () => {
    it('빈 제목으로 등록 시 error를 반환해야 한다', async () => {
      const mockRepo = createMockSkillRepository();
      const mockStorage = createMockStorageAdapter();
      const useCase = new RegisterSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute(
        createValidInput({ title: '' }),
      );

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.message).toContain('제목');
      }
    });

    it('잘못된 카테고리로 등록 시 error를 반환해야 한다', async () => {
      const mockRepo = createMockSkillRepository();
      const mockStorage = createMockStorageAdapter();
      const useCase = new RegisterSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute(
        createValidInput({ category: '존재하지않는카테고리' }),
      );

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.message).toContain('카테고리');
      }
    });

    it('도메인 검증 실패 시 Storage 업로드가 호출되지 않아야 한다', async () => {
      const mockUpload = jest.fn();
      const mockStorage = createMockStorageAdapter({ upload: mockUpload });
      const mockRepo = createMockSkillRepository();
      const useCase = new RegisterSkillUseCase(mockRepo, mockStorage);

      await useCase.execute(createValidInput({ title: '' }));

      expect(mockUpload).not.toHaveBeenCalled();
    });
  });

  describe('Storage 업로드 실패 시', () => {
    it('error를 반환하고 DB에 레코드를 생성하지 않아야 한다', async () => {
      const mockSave = jest.fn();
      const mockRepo = createMockSkillRepository({ save: mockSave });
      const mockStorage = createMockStorageAdapter({
        upload: jest
          .fn()
          .mockRejectedValue(new Error('Storage 업로드 실패')),
      });
      const useCase = new RegisterSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute(createValidInput());

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.message).toBeTruthy();
      }
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('DB 저장 실패 시', () => {
    it('error를 반환하고 Storage 파일 삭제를 시도해야 한다', async () => {
      const mockDelete = jest.fn().mockResolvedValue(undefined);
      const mockStorage = createMockStorageAdapter({
        upload: jest.fn().mockResolvedValue({ path: 'uuid.md' }),
        delete: mockDelete,
      });
      const mockRepo = createMockSkillRepository({
        save: jest.fn().mockRejectedValue(new Error('DB 저장 실패')),
      });
      const useCase = new RegisterSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute(createValidInput());

      expect(result.status).toBe('error');
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    it('Storage 파일 삭제가 실패해도 error를 반환해야 한다', async () => {
      const mockStorage = createMockStorageAdapter({
        upload: jest.fn().mockResolvedValue({ path: 'uuid.md' }),
        delete: jest.fn().mockRejectedValue(new Error('삭제 실패')),
      });
      const mockRepo = createMockSkillRepository({
        save: jest.fn().mockRejectedValue(new Error('DB 저장 실패')),
      });
      const useCase = new RegisterSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute(createValidInput());

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.message).toBeTruthy();
      }
    });
  });

  describe('execute() 반환값 타입 검증', () => {
    it('성공 시 status와 skill 필드를 포함해야 한다', async () => {
      const mockRepo = createMockSkillRepository({
        save: jest.fn().mockResolvedValue(undefined),
      });
      const mockStorage = createMockStorageAdapter();
      const useCase = new RegisterSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute(createValidInput());

      expect(result).toHaveProperty('status');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result).toHaveProperty('skill');
      }
    });

    it('에러 시 status와 message 필드를 포함해야 한다', async () => {
      const mockRepo = createMockSkillRepository();
      const mockStorage = createMockStorageAdapter();
      const useCase = new RegisterSkillUseCase(mockRepo, mockStorage);

      const result = await useCase.execute(
        createValidInput({ title: '' }),
      );

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
      expect(result.status).toBe('error');
    });
  });
});
