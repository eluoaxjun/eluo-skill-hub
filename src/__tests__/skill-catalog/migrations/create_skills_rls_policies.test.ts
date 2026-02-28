import * as fs from 'fs';
import * as path from 'path';

describe('create_skills_rls_policies 마이그레이션', () => {
  const migrationPath = path.resolve(
    __dirname,
    '../../../../supabase/migrations/20260301000002_create_skills_rls_policies.sql'
  );
  let sql: string;

  beforeAll(() => {
    sql = fs.readFileSync(migrationPath, 'utf-8');
  });

  it('마이그레이션 파일이 존재한다', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  it('skills 테이블에 RLS를 활성화한다', () => {
    expect(sql).toMatch(/ALTER TABLE public\.skills ENABLE ROW LEVEL SECURITY/i);
  });

  describe('SELECT 정책', () => {
    it('인증된 사용자에게 SELECT 접근을 허용한다', () => {
      expect(sql).toMatch(/CREATE POLICY.*skills_select_authenticated/i);
      expect(sql).toMatch(/FOR SELECT/i);
      expect(sql).toMatch(/TO authenticated/i);
    });
  });

  describe('INSERT 정책', () => {
    it('관리자에게만 INSERT 접근을 허용한다', () => {
      expect(sql).toMatch(/CREATE POLICY.*skills_insert_admin/i);
      expect(sql).toMatch(/FOR INSERT/i);
      expect(sql).toMatch(/is_admin\(auth\.uid\(\)\)/i);
    });
  });

  describe('UPDATE 정책', () => {
    it('관리자에게만 UPDATE 접근을 허용한다', () => {
      expect(sql).toMatch(/CREATE POLICY.*skills_update_admin/i);
      expect(sql).toMatch(/FOR UPDATE/i);
    });
  });

  describe('DELETE 정책', () => {
    it('관리자에게만 DELETE 접근을 허용한다', () => {
      expect(sql).toMatch(/CREATE POLICY.*skills_delete_admin/i);
      expect(sql).toMatch(/FOR DELETE/i);
    });
  });
});
