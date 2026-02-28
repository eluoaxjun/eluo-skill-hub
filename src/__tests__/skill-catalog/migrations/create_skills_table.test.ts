import * as fs from 'fs';
import * as path from 'path';

describe('create_skills_table 마이그레이션', () => {
  const migrationPath = path.resolve(
    __dirname,
    '../../../../supabase/migrations/20260301000000_create_skills_table.sql'
  );
  let sql: string;

  beforeAll(() => {
    sql = fs.readFileSync(migrationPath, 'utf-8');
  });

  it('마이그레이션 파일이 존재한다', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  describe('skills 테이블 구조', () => {
    it('public.skills 테이블을 생성한다', () => {
      expect(sql).toMatch(/CREATE TABLE public\.skills/i);
    });

    it('id 컬럼이 UUID PK이며 gen_random_uuid 기본값을 갖는다', () => {
      expect(sql).toMatch(/id\s+uuid\s+PRIMARY KEY\s+DEFAULT\s+gen_random_uuid\(\)/i);
    });

    it('title 컬럼이 text NOT NULL이다', () => {
      expect(sql).toMatch(/title\s+text\s+NOT NULL/i);
    });

    it('category 컬럼이 text NOT NULL이며 5개 카테고리 CHECK 제약이 있다', () => {
      expect(sql).toMatch(/category\s+text\s+NOT NULL/i);
      expect(sql).toMatch(/CHECK\s*\(\s*category\s+IN\s*\(/i);
      expect(sql).toContain("'기획'");
      expect(sql).toContain("'디자인'");
      expect(sql).toContain("'퍼블리싱'");
      expect(sql).toContain("'개발'");
      expect(sql).toContain("'QA'");
    });

    it('markdown_file_path 컬럼이 text NOT NULL이다', () => {
      expect(sql).toMatch(/markdown_file_path\s+text\s+NOT NULL/i);
    });

    it('author_id 컬럼이 uuid NOT NULL이며 auth.users(id)를 참조한다', () => {
      expect(sql).toMatch(/author_id\s+uuid\s+NOT NULL\s+REFERENCES\s+auth\.users\(id\)/i);
    });

    it('created_at 컬럼이 timestamptz NOT NULL이며 DEFAULT now()를 갖는다', () => {
      expect(sql).toMatch(/created_at\s+timestamptz\s+NOT NULL\s+DEFAULT\s+now\(\)/i);
    });
  });

  describe('인덱스', () => {
    it('category 인덱스를 생성한다', () => {
      expect(sql).toMatch(/CREATE INDEX\s+idx_skills_category\s+ON\s+public\.skills\s*\(\s*category\s*\)/i);
    });

    it('author_id 인덱스를 생성한다', () => {
      expect(sql).toMatch(/CREATE INDEX\s+idx_skills_author_id\s+ON\s+public\.skills\s*\(\s*author_id\s*\)/i);
    });

    it('created_at DESC 인덱스를 생성한다', () => {
      expect(sql).toMatch(/CREATE INDEX\s+idx_skills_created_at\s+ON\s+public\.skills\s*\(\s*created_at\s+DESC\s*\)/i);
    });
  });

  describe('명명 규칙', () => {
    it('테이블 이름이 snake_case이다', () => {
      expect(sql).toMatch(/public\.skills/);
    });

    it('컬럼 이름이 snake_case이다', () => {
      expect(sql).toMatch(/markdown_file_path/);
      expect(sql).toMatch(/author_id/);
      expect(sql).toMatch(/created_at/);
    });
  });
});
