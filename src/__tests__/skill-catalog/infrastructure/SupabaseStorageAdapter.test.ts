import { SupabaseStorageAdapter } from '@/skill-catalog/infrastructure/SupabaseStorageAdapter';
import type { SupabaseClient } from '@supabase/supabase-js';

function createMockFile(name: string, content: string = '# Test'): File {
  return new File([content], name, { type: 'text/markdown' });
}

describe('SupabaseStorageAdapter', () => {
  describe('upload()', () => {
    function createUploadMock() {
      const mockUpload = jest.fn();
      const mockFrom = jest.fn().mockReturnValue({ upload: mockUpload });
      const mockStorage = { from: mockFrom };

      const client = { storage: mockStorage } as unknown as SupabaseClient;
      return { client, mocks: { mockFrom, mockUpload } };
    }

    it('.md 파일을 skill-markdowns 버킷에 업로드해야 한다', async () => {
      const file = createMockFile('test-skill.md');
      const filePath = 'abc123.md';

      const { client, mocks } = createUploadMock();
      mocks.mockUpload.mockResolvedValue({
        data: { path: filePath },
        error: null,
      });

      const adapter = new SupabaseStorageAdapter(client);
      const result = await adapter.upload(file, filePath);

      expect(result.path).toBe(filePath);
      expect(mocks.mockFrom).toHaveBeenCalledWith('skill-markdowns');
      expect(mocks.mockUpload).toHaveBeenCalledWith(filePath, file, {
        contentType: 'text/markdown',
        upsert: false,
      });
    });

    it('.md 확장자가 아닌 파일 업로드를 거부해야 한다', async () => {
      const file = createMockFile('test-skill.txt');
      const filePath = 'abc123.txt';

      const { client } = createUploadMock();

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.upload(file, filePath)).rejects.toThrow(
        '마크다운(.md) 파일만 업로드할 수 있습니다',
      );
    });

    it('.MD 확장자(대문자)도 허용해야 한다', async () => {
      const file = createMockFile('test-skill.MD');
      const filePath = 'abc123.MD';

      const { client, mocks } = createUploadMock();
      mocks.mockUpload.mockResolvedValue({
        data: { path: filePath },
        error: null,
      });

      const adapter = new SupabaseStorageAdapter(client);
      const result = await adapter.upload(file, filePath);

      expect(result.path).toBe(filePath);
    });

    it('Storage 업로드 실패 시 에러를 반환해야 한다', async () => {
      const file = createMockFile('test-skill.md');
      const filePath = 'abc123.md';

      const { client, mocks } = createUploadMock();
      mocks.mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Bucket not found' },
      });

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.upload(file, filePath)).rejects.toThrow(
        '파일 업로드에 실패했습니다',
      );
    });

    it('업로드 성공 시 경로를 포함한 객체를 반환해야 한다', async () => {
      const file = createMockFile('test-skill.md');
      const filePath = 'abc123.md';

      const { client, mocks } = createUploadMock();
      mocks.mockUpload.mockResolvedValue({
        data: { path: filePath },
        error: null,
      });

      const adapter = new SupabaseStorageAdapter(client);
      const result = await adapter.upload(file, filePath);

      expect(result).toEqual({ path: filePath });
    });
  });

  describe('download()', () => {
    function createDownloadMock() {
      const mockDownload = jest.fn();
      const mockFrom = jest.fn().mockReturnValue({ download: mockDownload });
      const mockStorage = { from: mockFrom };

      const client = { storage: mockStorage } as unknown as SupabaseClient;
      return { client, mocks: { mockFrom, mockDownload } };
    }

    it('마크다운 파일을 다운로드하여 텍스트 문자열로 반환해야 한다', async () => {
      const markdownContent = '# 스킬 제목\n\n이것은 테스트 마크다운입니다.';
      const mockBlob = {
        text: jest.fn().mockResolvedValue(markdownContent),
      };

      const { client, mocks } = createDownloadMock();
      mocks.mockDownload.mockResolvedValue({
        data: mockBlob,
        error: null,
      });

      const adapter = new SupabaseStorageAdapter(client);
      const result = await adapter.download('abc123.md');

      expect(result).toBe(markdownContent);
      expect(mocks.mockFrom).toHaveBeenCalledWith('skill-markdowns');
      expect(mocks.mockDownload).toHaveBeenCalledWith('abc123.md');
    });

    it('Storage 다운로드 실패 시 에러를 반환해야 한다', async () => {
      const { client, mocks } = createDownloadMock();
      mocks.mockDownload.mockResolvedValue({
        data: null,
        error: { message: 'Object not found' },
      });

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.download('nonexistent.md')).rejects.toThrow(
        '마크다운 파일을 불러올 수 없습니다',
      );
    });

    it('다운로드한 Blob 데이터가 null이면 에러를 반환해야 한다', async () => {
      const { client, mocks } = createDownloadMock();
      mocks.mockDownload.mockResolvedValue({
        data: null,
        error: null,
      });

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.download('abc123.md')).rejects.toThrow(
        '마크다운 파일을 불러올 수 없습니다',
      );
    });
  });

  describe('delete()', () => {
    function createDeleteMock() {
      const mockRemove = jest.fn();
      const mockFrom = jest.fn().mockReturnValue({ remove: mockRemove });
      const mockStorage = { from: mockFrom };

      const client = { storage: mockStorage } as unknown as SupabaseClient;
      return { client, mocks: { mockFrom, mockRemove } };
    }

    it('skill-markdowns 버킷에서 파일을 삭제해야 한다', async () => {
      const filePath = 'abc123.md';

      const { client, mocks } = createDeleteMock();
      mocks.mockRemove.mockResolvedValue({ error: null });

      const adapter = new SupabaseStorageAdapter(client);
      await adapter.delete(filePath);

      expect(mocks.mockFrom).toHaveBeenCalledWith('skill-markdowns');
      expect(mocks.mockRemove).toHaveBeenCalledWith([filePath]);
    });

    it('Storage 삭제 실패 시 에러를 반환해야 한다', async () => {
      const { client, mocks } = createDeleteMock();
      mocks.mockRemove.mockResolvedValue({
        error: { message: 'Object not found' },
      });

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.delete('abc123.md')).rejects.toThrow(
        '파일 삭제에 실패했습니다',
      );
    });

    it('delete 성공 시 void를 반환해야 한다', async () => {
      const { client, mocks } = createDeleteMock();
      mocks.mockRemove.mockResolvedValue({ error: null });

      const adapter = new SupabaseStorageAdapter(client);
      const result = await adapter.delete('abc123.md');

      expect(result).toBeUndefined();
    });
  });
});
