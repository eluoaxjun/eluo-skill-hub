import * as fs from 'fs';
import * as path from 'path';

describe('create_skill_markdowns_storage_rls 마이그레이션', () => {
  const migrationPath = path.resolve(
    __dirname,
    '../../../../supabase/migrations/20260301000003_create_skill_markdowns_storage_rls.sql'
  );
  let sql: string;

  beforeAll(() => {
    sql = fs.readFileSync(migrationPath, 'utf-8');
  });

  it('마이그레이션 파일이 존재한다', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  describe('SELECT 정책', () => {
    it('인증된 사용자에게 마크다운 파일 읽기를 허용한다', () => {
      expect(sql).toMatch(/CREATE POLICY.*skill_markdowns_select_authenticated/i);
      expect(sql).toMatch(/FOR SELECT/i);
      expect(sql).toMatch(/bucket_id\s*=\s*'skill-markdowns'/i);
    });
  });

  describe('INSERT 정책', () => {
    it('관리자에게만 마크다운 파일 업로드를 허용한다', () => {
      expect(sql).toMatch(/CREATE POLICY.*skill_markdowns_insert_admin/i);
      expect(sql).toMatch(/FOR INSERT/i);
      expect(sql).toMatch(/is_admin\(auth\.uid\(\)\)/i);
    });
  });

  describe('DELETE 정책', () => {
    it('관리자에게만 마크다운 파일 삭제를 허용한다', () => {
      expect(sql).toMatch(/CREATE POLICY.*skill_markdowns_delete_admin/i);
      expect(sql).toMatch(/FOR DELETE/i);
      expect(sql).toMatch(/bucket_id\s*=\s*'skill-markdowns'/i);
    });
  });

  it('storage.objects 테이블에 정책을 설정한다', () => {
    expect(sql).toMatch(/ON storage\.objects/i);
  });
});
