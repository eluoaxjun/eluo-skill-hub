import * as fs from 'fs';
import * as path from 'path';

describe('create_skill_markdowns_bucket 마이그레이션', () => {
  const migrationPath = path.resolve(
    __dirname,
    '../../../../supabase/migrations/20260301000001_create_skill_markdowns_bucket.sql'
  );
  let sql: string;

  beforeAll(() => {
    sql = fs.readFileSync(migrationPath, 'utf-8');
  });

  it('마이그레이션 파일이 존재한다', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  describe('Storage 버킷 구조', () => {
    it('storage.buckets 테이블에 INSERT한다', () => {
      expect(sql).toMatch(/INSERT INTO\s+storage\.buckets/i);
    });

    it('버킷 ID가 skill-markdowns이다', () => {
      expect(sql).toContain("'skill-markdowns'");
    });

    it('프라이빗 버킷으로 생성한다 (public = false)', () => {
      expect(sql).toMatch(/false/i);
    });

    it('id, name, public 컬럼에 값을 삽입한다', () => {
      expect(sql).toMatch(/\(\s*id\s*,\s*name\s*,\s*public\s*\)/i);
    });

    it('버킷 id와 name이 skill-markdowns로 동일하다', () => {
      const matches = sql.match(/VALUES\s*\(\s*'([^']+)'\s*,\s*'([^']+)'/i);
      expect(matches).not.toBeNull();
      if (matches) {
        expect(matches[1]).toBe('skill-markdowns');
        expect(matches[2]).toBe('skill-markdowns');
      }
    });
  });
});
