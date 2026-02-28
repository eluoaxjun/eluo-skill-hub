import {
  GetSkillMarkdownUseCase,
  type GetSkillMarkdownInput,
  type GetSkillMarkdownResult,
} from '@/skill-catalog/application/GetSkillMarkdownUseCase';
import type { StorageAdapter } from '@/skill-catalog/domain/StorageAdapter';

/**
 * StorageAdapter mock 생성 헬퍼
 */
function createMockStorageAdapter(
  overrides: Partial<StorageAdapter> = {},
): StorageAdapter {
  return {
    upload: jest.fn(),
    download: jest.fn().mockResolvedValue('# Default Content'),
    delete: jest.fn(),
    ...overrides,
  };
}

describe('GetSkillMarkdownUseCase', () => {
  describe('정상적인 마크다운 콘텐츠 조회 시', () => {
    it('status가 success이고 content에 마크다운 내용이 포함되어야 한다', async () => {
      const markdownContent = '# 테스트 스킬\n\n이것은 테스트입니다.';
      const mockStorage = createMockStorageAdapter({
        download: jest.fn().mockResolvedValue(markdownContent),
      });
      const useCase = new GetSkillMarkdownUseCase(mockStorage);

      const result = await useCase.execute({ filePath: 'uuid-123.md' });

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.content).toBe(markdownContent);
      }
    });

    it('StorageAdapter.download가 올바른 파일 경로로 호출되어야 한다', async () => {
      const mockDownload = jest.fn().mockResolvedValue('# Content');
      const mockStorage = createMockStorageAdapter({
        download: mockDownload,
      });
      const useCase = new GetSkillMarkdownUseCase(mockStorage);

      await useCase.execute({ filePath: 'specific-uuid.md' });

      expect(mockDownload).toHaveBeenCalledTimes(1);
      expect(mockDownload).toHaveBeenCalledWith('specific-uuid.md');
    });

    it('빈 마크다운 파일도 성공으로 반환되어야 한다', async () => {
      const mockStorage = createMockStorageAdapter({
        download: jest.fn().mockResolvedValue(''),
      });
      const useCase = new GetSkillMarkdownUseCase(mockStorage);

      const result = await useCase.execute({ filePath: 'empty-file.md' });

      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result.content).toBe('');
      }
    });
  });

  describe('Storage 다운로드 실패 시', () => {
    it('status가 error인 결과를 반환해야 한다', async () => {
      const mockStorage = createMockStorageAdapter({
        download: jest
          .fn()
          .mockRejectedValue(new Error('파일을 찾을 수 없습니다')),
      });
      const useCase = new GetSkillMarkdownUseCase(mockStorage);

      const result = await useCase.execute({
        filePath: 'nonexistent-file.md',
      });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    });

    it('에러 메시지에 원본 에러 정보가 포함되어야 한다', async () => {
      const mockStorage = createMockStorageAdapter({
        download: jest
          .fn()
          .mockRejectedValue(new Error('네트워크 오류')),
      });
      const useCase = new GetSkillMarkdownUseCase(mockStorage);

      const result = await useCase.execute({ filePath: 'file.md' });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(result.message).toContain('네트워크 오류');
      }
    });

    it('Error가 아닌 값이 throw된 경우에도 error를 반환해야 한다', async () => {
      const mockStorage = createMockStorageAdapter({
        download: jest.fn().mockRejectedValue('문자열 에러'),
      });
      const useCase = new GetSkillMarkdownUseCase(mockStorage);

      const result = await useCase.execute({ filePath: 'file.md' });

      expect(result.status).toBe('error');
      if (result.status === 'error') {
        expect(typeof result.message).toBe('string');
        expect(result.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('execute() 반환값 타입 검증', () => {
    it('성공 시 status와 content 필드를 포함해야 한다', async () => {
      const mockStorage = createMockStorageAdapter({
        download: jest.fn().mockResolvedValue('# Content'),
      });
      const useCase = new GetSkillMarkdownUseCase(mockStorage);

      const result = await useCase.execute({ filePath: 'file.md' });

      expect(result).toHaveProperty('status');
      expect(result.status).toBe('success');
      if (result.status === 'success') {
        expect(result).toHaveProperty('content');
        expect(typeof result.content).toBe('string');
      }
    });

    it('에러 시 status와 message 필드를 포함해야 한다', async () => {
      const mockStorage = createMockStorageAdapter({
        download: jest.fn().mockRejectedValue(new Error('에러')),
      });
      const useCase = new GetSkillMarkdownUseCase(mockStorage);

      const result = await useCase.execute({ filePath: 'file.md' });

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
      expect(result.status).toBe('error');
    });
  });
});
