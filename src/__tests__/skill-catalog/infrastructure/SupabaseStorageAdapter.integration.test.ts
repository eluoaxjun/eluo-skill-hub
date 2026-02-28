import { SupabaseStorageAdapter } from '@/skill-catalog/infrastructure/SupabaseStorageAdapter';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * SupabaseStorageAdapter 통합 테스트
 *
 * 기존 단위 테스트(SupabaseStorageAdapter.test.ts)에서 다루지 않는
 * 복합 시나리오 및 엣지 케이스를 검증한다.
 *
 * - 전체 파일 라이프사이클 (upload -> download -> verify content -> delete -> verify deleted)
 * - .md 확장자 검증: .txt, .pdf 등 비마크다운 확장자 거부
 * - ContentType 검증: upload 시 text/markdown 설정 확인
 * - 다운로드 텍스트 변환: File 업로드 후 download 시 string 콘텐츠 일치 확인
 * - 에러 핸들링: 존재하지 않는 파일 다운로드/삭제
 */

function createMockFile(name: string, content: string = '# Test Markdown'): File {
  return new File([content], name, { type: 'text/markdown' });
}

/**
 * 통합 테스트용 Supabase Storage 모킹 유틸리티
 */
function createStorageIntegrationMock() {
  const mockUpload = jest.fn();
  const mockDownload = jest.fn();
  const mockRemove = jest.fn();
  const mockFrom = jest.fn().mockReturnValue({
    upload: mockUpload,
    download: mockDownload,
    remove: mockRemove,
  });
  const mockStorage = { from: mockFrom };

  const client = { storage: mockStorage } as unknown as SupabaseClient;

  return {
    client,
    mocks: { mockFrom, mockUpload, mockDownload, mockRemove },
  };
}

describe('SupabaseStorageAdapter 통합 테스트', () => {
  describe('전체 파일 라이프사이클', () => {
    it('upload -> download -> verify content -> delete -> verify deleted 순서로 동작해야 한다', async () => {
      const markdownContent = '# 스킬 가이드\n\n## 개요\n\nAPI 스캐폴딩 자동화 스킬입니다.\n\n- 빠른 설정\n- 자동 코드 생성';
      const file = createMockFile('skill-guide.md', markdownContent);
      const filePath = 'uuid-001.md';

      // Step 1: upload
      const { client: uploadClient, mocks: uploadMocks } = createStorageIntegrationMock();
      uploadMocks.mockUpload.mockResolvedValue({
        data: { path: filePath },
        error: null,
      });

      const uploadAdapter = new SupabaseStorageAdapter(uploadClient);
      const uploadResult = await uploadAdapter.upload(file, filePath);

      expect(uploadResult.path).toBe(filePath);
      expect(uploadMocks.mockFrom).toHaveBeenCalledWith('skill-markdowns');

      // Step 2: download + verify content
      const { client: downloadClient, mocks: downloadMocks } = createStorageIntegrationMock();
      const mockBlob = { text: jest.fn().mockResolvedValue(markdownContent) };
      downloadMocks.mockDownload.mockResolvedValue({
        data: mockBlob,
        error: null,
      });

      const downloadAdapter = new SupabaseStorageAdapter(downloadClient);
      const downloadedContent = await downloadAdapter.download(filePath);

      expect(downloadedContent).toBe(markdownContent);
      expect(downloadMocks.mockFrom).toHaveBeenCalledWith('skill-markdowns');
      expect(downloadMocks.mockDownload).toHaveBeenCalledWith(filePath);

      // Step 3: delete
      const { client: deleteClient, mocks: deleteMocks } = createStorageIntegrationMock();
      deleteMocks.mockRemove.mockResolvedValue({ error: null });

      const deleteAdapter = new SupabaseStorageAdapter(deleteClient);
      await deleteAdapter.delete(filePath);

      expect(deleteMocks.mockFrom).toHaveBeenCalledWith('skill-markdowns');
      expect(deleteMocks.mockRemove).toHaveBeenCalledWith([filePath]);

      // Step 4: 삭제 후 다운로드 시도 -> 에러
      const { client: verifyClient, mocks: verifyMocks } = createStorageIntegrationMock();
      verifyMocks.mockDownload.mockResolvedValue({
        data: null,
        error: { message: 'Object not found' },
      });

      const verifyAdapter = new SupabaseStorageAdapter(verifyClient);
      await expect(verifyAdapter.download(filePath)).rejects.toThrow(
        '마크다운 파일을 불러올 수 없습니다',
      );
    });
  });

  describe('.md 확장자 검증', () => {
    it('.txt 확장자 파일 업로드를 거부해야 한다', async () => {
      const file = createMockFile('document.txt', '일반 텍스트 내용');
      const { client } = createStorageIntegrationMock();

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.upload(file, 'document.txt')).rejects.toThrow(
        '마크다운(.md) 파일만 업로드할 수 있습니다',
      );
    });

    it('.pdf 확장자 파일 업로드를 거부해야 한다', async () => {
      const file = createMockFile('document.pdf', 'PDF content');
      const { client } = createStorageIntegrationMock();

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.upload(file, 'document.pdf')).rejects.toThrow(
        '마크다운(.md) 파일만 업로드할 수 있습니다',
      );
    });

    it('.html 확장자 파일 업로드를 거부해야 한다', async () => {
      const file = createMockFile('page.html', '<h1>Test</h1>');
      const { client } = createStorageIntegrationMock();

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.upload(file, 'page.html')).rejects.toThrow(
        '마크다운(.md) 파일만 업로드할 수 있습니다',
      );
    });

    it('.json 확장자 파일 업로드를 거부해야 한다', async () => {
      const file = createMockFile('data.json', '{"key": "value"}');
      const { client } = createStorageIntegrationMock();

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.upload(file, 'data.json')).rejects.toThrow(
        '마크다운(.md) 파일만 업로드할 수 있습니다',
      );
    });

    it('확장자가 없는 파일 업로드를 거부해야 한다', async () => {
      const file = createMockFile('noextension', 'some content');
      const { client } = createStorageIntegrationMock();

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.upload(file, 'noextension')).rejects.toThrow(
        '마크다운(.md) 파일만 업로드할 수 있습니다',
      );
    });

    it('.md 확장자 파일은 정상적으로 업로드되어야 한다', async () => {
      const file = createMockFile('valid-skill.md', '# Valid Skill');
      const { client, mocks } = createStorageIntegrationMock();
      mocks.mockUpload.mockResolvedValue({
        data: { path: 'valid-skill.md' },
        error: null,
      });

      const adapter = new SupabaseStorageAdapter(client);
      const result = await adapter.upload(file, 'valid-skill.md');

      expect(result.path).toBe('valid-skill.md');
    });

    it('.markdown 확장자 파일 업로드를 거부해야 한다 (.md만 허용)', async () => {
      const file = createMockFile('doc.markdown', '# Some Content');
      const { client } = createStorageIntegrationMock();

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.upload(file, 'doc.markdown')).rejects.toThrow(
        '마크다운(.md) 파일만 업로드할 수 있습니다',
      );
    });
  });

  describe('ContentType 검증', () => {
    it('upload 시 contentType이 text/markdown으로 설정되어야 한다', async () => {
      const file = createMockFile('test.md', '# Content');
      const filePath = 'uuid-ct-test.md';

      const { client, mocks } = createStorageIntegrationMock();
      mocks.mockUpload.mockResolvedValue({
        data: { path: filePath },
        error: null,
      });

      const adapter = new SupabaseStorageAdapter(client);
      await adapter.upload(file, filePath);

      expect(mocks.mockUpload).toHaveBeenCalledWith(filePath, file, {
        contentType: 'text/markdown',
        upsert: false,
      });
    });

    it('upload 시 upsert가 false로 설정되어 중복 업로드를 방지해야 한다', async () => {
      const file = createMockFile('test.md', '# Content');
      const filePath = 'uuid-upsert-test.md';

      const { client, mocks } = createStorageIntegrationMock();
      mocks.mockUpload.mockResolvedValue({
        data: { path: filePath },
        error: null,
      });

      const adapter = new SupabaseStorageAdapter(client);
      await adapter.upload(file, filePath);

      const uploadOptions = mocks.mockUpload.mock.calls[0][2];
      expect(uploadOptions.upsert).toBe(false);
    });
  });

  describe('다운로드 텍스트 변환', () => {
    it('업로드한 마크다운 콘텐츠와 다운로드한 텍스트 내용이 일치해야 한다', async () => {
      const originalContent = [
        '# 디자인 토큰 추출기',
        '',
        '## 기능',
        '',
        '- 피그마에서 디자인 토큰을 자동 추출',
        '- CSS 변수로 자동 변환',
        '- 테마 설정 지원',
        '',
        '## 사용법',
        '',
        '```bash',
        'npx design-token-extract --source figma',
        '```',
      ].join('\n');

      const filePath = 'design-token.md';

      // 다운로드 시 동일한 콘텐츠 반환 확인
      const { client, mocks } = createStorageIntegrationMock();
      const mockBlob = { text: jest.fn().mockResolvedValue(originalContent) };
      mocks.mockDownload.mockResolvedValue({
        data: mockBlob,
        error: null,
      });

      const adapter = new SupabaseStorageAdapter(client);
      const downloadedContent = await adapter.download(filePath);

      expect(downloadedContent).toBe(originalContent);
      expect(downloadedContent).toContain('# 디자인 토큰 추출기');
      expect(downloadedContent).toContain('```bash');
      expect(downloadedContent).toContain('npx design-token-extract --source figma');
    });

    it('빈 마크다운 파일을 다운로드하면 빈 문자열을 반환해야 한다', async () => {
      const { client, mocks } = createStorageIntegrationMock();
      const mockBlob = { text: jest.fn().mockResolvedValue('') };
      mocks.mockDownload.mockResolvedValue({
        data: mockBlob,
        error: null,
      });

      const adapter = new SupabaseStorageAdapter(client);
      const result = await adapter.download('empty.md');

      expect(result).toBe('');
    });

    it('한글 마크다운 콘텐츠가 정확하게 다운로드되어야 한다', async () => {
      const koreanContent = '# 한글 제목\n\n한글 본문 내용입니다.\n\n- 항목 1\n- 항목 2\n- 항목 3';

      const { client, mocks } = createStorageIntegrationMock();
      const mockBlob = { text: jest.fn().mockResolvedValue(koreanContent) };
      mocks.mockDownload.mockResolvedValue({
        data: mockBlob,
        error: null,
      });

      const adapter = new SupabaseStorageAdapter(client);
      const result = await adapter.download('korean.md');

      expect(result).toBe(koreanContent);
      expect(result).toContain('한글 제목');
      expect(result).toContain('항목 3');
    });

    it('Blob의 text() 메서드가 호출되어 텍스트 변환이 이루어져야 한다', async () => {
      const content = '# Test';
      const mockTextFn = jest.fn().mockResolvedValue(content);
      const mockBlob = { text: mockTextFn };

      const { client, mocks } = createStorageIntegrationMock();
      mocks.mockDownload.mockResolvedValue({
        data: mockBlob,
        error: null,
      });

      const adapter = new SupabaseStorageAdapter(client);
      await adapter.download('test.md');

      expect(mockTextFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('에러 핸들링', () => {
    it('존재하지 않는 파일 다운로드 시 에러를 반환해야 한다', async () => {
      const { client, mocks } = createStorageIntegrationMock();
      mocks.mockDownload.mockResolvedValue({
        data: null,
        error: { message: 'Object not found', statusCode: 404 },
      });

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.download('nonexistent-uuid.md')).rejects.toThrow(
        '마크다운 파일을 불러올 수 없습니다',
      );
    });

    it('존재하지 않는 파일 삭제 시 에러를 반환해야 한다', async () => {
      const { client, mocks } = createStorageIntegrationMock();
      mocks.mockRemove.mockResolvedValue({
        error: { message: 'Object not found', statusCode: 404 },
      });

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.delete('nonexistent-uuid.md')).rejects.toThrow(
        '파일 삭제에 실패했습니다',
      );
    });

    it('네트워크 타임아웃 에러 시 업로드가 실패해야 한다', async () => {
      const file = createMockFile('timeout.md', '# Timeout Test');

      const { client, mocks } = createStorageIntegrationMock();
      mocks.mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Request timed out' },
      });

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.upload(file, 'timeout.md')).rejects.toThrow(
        '파일 업로드에 실패했습니다',
      );
    });

    it('Storage 권한 없음 에러 시 다운로드가 실패해야 한다', async () => {
      const { client, mocks } = createStorageIntegrationMock();
      mocks.mockDownload.mockResolvedValue({
        data: null,
        error: { message: 'Permission denied', statusCode: 403 },
      });

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.download('restricted.md')).rejects.toThrow(
        '마크다운 파일을 불러올 수 없습니다',
      );
    });

    it('Storage 버킷이 존재하지 않을 때 업로드가 실패해야 한다', async () => {
      const file = createMockFile('no-bucket.md', '# No Bucket');

      const { client, mocks } = createStorageIntegrationMock();
      mocks.mockUpload.mockResolvedValue({
        data: null,
        error: { message: 'Bucket not found' },
      });

      const adapter = new SupabaseStorageAdapter(client);

      await expect(adapter.upload(file, 'no-bucket.md')).rejects.toThrow(
        '파일 업로드에 실패했습니다',
      );
    });

    it('skill-markdowns 버킷 이름이 정확하게 사용되어야 한다', async () => {
      const file = createMockFile('bucket-check.md', '# Bucket Check');
      const filePath = 'bucket-check.md';

      // upload
      const { client: uploadClient, mocks: uploadMocks } = createStorageIntegrationMock();
      uploadMocks.mockUpload.mockResolvedValue({
        data: { path: filePath },
        error: null,
      });
      const uploadAdapter = new SupabaseStorageAdapter(uploadClient);
      await uploadAdapter.upload(file, filePath);
      expect(uploadMocks.mockFrom).toHaveBeenCalledWith('skill-markdowns');

      // download
      const { client: downloadClient, mocks: downloadMocks } = createStorageIntegrationMock();
      const mockBlob = { text: jest.fn().mockResolvedValue('# Bucket Check') };
      downloadMocks.mockDownload.mockResolvedValue({ data: mockBlob, error: null });
      const downloadAdapter = new SupabaseStorageAdapter(downloadClient);
      await downloadAdapter.download(filePath);
      expect(downloadMocks.mockFrom).toHaveBeenCalledWith('skill-markdowns');

      // delete
      const { client: deleteClient, mocks: deleteMocks } = createStorageIntegrationMock();
      deleteMocks.mockRemove.mockResolvedValue({ error: null });
      const deleteAdapter = new SupabaseStorageAdapter(deleteClient);
      await deleteAdapter.delete(filePath);
      expect(deleteMocks.mockFrom).toHaveBeenCalledWith('skill-markdowns');
    });
  });
});
