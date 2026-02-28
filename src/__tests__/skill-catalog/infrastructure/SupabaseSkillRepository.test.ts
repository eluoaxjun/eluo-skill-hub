import { SupabaseSkillRepository } from '@/skill-catalog/infrastructure/SupabaseSkillRepository';
import { Skill } from '@/skill-catalog/domain/Skill';
import { SkillCategory } from '@/skill-catalog/domain/SkillCategory';
import type { SupabaseClient } from '@supabase/supabase-js';

const SAMPLE_SKILL_ROW = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  title: 'API 스캐폴딩 자동화',
  category: '개발',
  markdown_file_path: 'abc123.md',
  author_id: '550e8400-e29b-41d4-a716-446655440099',
  created_at: '2026-02-20T09:00:00Z',
};

const SAMPLE_SKILL_ROW_2 = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  title: '디자인 토큰 추출기',
  category: '디자인',
  markdown_file_path: 'def456.md',
  author_id: '550e8400-e29b-41d4-a716-446655440099',
  created_at: '2026-02-21T09:00:00Z',
};

describe('SupabaseSkillRepository', () => {
  describe('findById()', () => {
    function createFindByIdMock() {
      const mockSingle = jest.fn();
      const mockEq = jest.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      const client = { from: mockFrom } as unknown as SupabaseClient;
      return { client, mocks: { mockFrom, mockSelect, mockEq, mockSingle } };
    }

    it('스킬이 존재하면 Skill 도메인 엔티티를 반환해야 한다', async () => {
      const { client, mocks } = createFindByIdMock();
      mocks.mockSingle.mockResolvedValue({ data: SAMPLE_SKILL_ROW, error: null });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findById(SAMPLE_SKILL_ROW.id);

      expect(result).toBeInstanceOf(Skill);
      expect(result?.id).toBe(SAMPLE_SKILL_ROW.id);
      expect(result?.title).toBe(SAMPLE_SKILL_ROW.title);
      expect(result?.category.value).toBe(SAMPLE_SKILL_ROW.category);
      expect(result?.markdownFilePath).toBe(SAMPLE_SKILL_ROW.markdown_file_path);
      expect(result?.authorId).toBe(SAMPLE_SKILL_ROW.author_id);
      expect(result?.createdAt).toEqual(new Date(SAMPLE_SKILL_ROW.created_at));
    });

    it('스킬이 존재하지 않으면 null을 반환해야 한다', async () => {
      const { client, mocks } = createFindByIdMock();
      mocks.mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });

    it('skills 테이블에서 id로 조회해야 한다', async () => {
      const targetId = SAMPLE_SKILL_ROW.id;
      const { client, mocks } = createFindByIdMock();
      mocks.mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const repository = new SupabaseSkillRepository(client);
      await repository.findById(targetId);

      expect(mocks.mockFrom).toHaveBeenCalledWith('skills');
      expect(mocks.mockSelect).toHaveBeenCalledWith('*');
      expect(mocks.mockEq).toHaveBeenCalledWith('id', targetId);
    });

    it('DB 레코드의 snake_case를 도메인 엔티티의 camelCase로 변환해야 한다', async () => {
      const { client, mocks } = createFindByIdMock();
      mocks.mockSingle.mockResolvedValue({ data: SAMPLE_SKILL_ROW, error: null });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findById(SAMPLE_SKILL_ROW.id);

      // snake_case -> camelCase 매핑 확인
      expect(result?.markdownFilePath).toBe(SAMPLE_SKILL_ROW.markdown_file_path);
      expect(result?.authorId).toBe(SAMPLE_SKILL_ROW.author_id);
      expect(result?.createdAt).toEqual(new Date(SAMPLE_SKILL_ROW.created_at));
    });

    it('DB 레코드에서 SkillCategory 유효성을 재검증해야 한다', async () => {
      const invalidRow = { ...SAMPLE_SKILL_ROW, category: '잘못된카테고리' };
      const { client, mocks } = createFindByIdMock();
      mocks.mockSingle.mockResolvedValue({ data: invalidRow, error: null });

      const repository = new SupabaseSkillRepository(client);

      await expect(repository.findById(invalidRow.id)).rejects.toThrow(
        '올바른 카테고리를 선택해 주세요',
      );
    });
  });

  describe('findAll()', () => {
    function createFindAllMock() {
      const mockOrder = jest.fn();
      const mockEq = jest.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq, order: mockOrder });
      const mockFrom = jest.fn().mockReturnValue({ select: mockSelect });

      const client = { from: mockFrom } as unknown as SupabaseClient;
      return { client, mocks: { mockFrom, mockSelect, mockEq, mockOrder } };
    }

    it('전체 스킬 목록을 Skill 배열로 반환해야 한다', async () => {
      const { client, mocks } = createFindAllMock();
      mocks.mockOrder.mockResolvedValue({
        data: [SAMPLE_SKILL_ROW, SAMPLE_SKILL_ROW_2],
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Skill);
      expect(result[0].title).toBe(SAMPLE_SKILL_ROW.title);
      expect(result[0].category.value).toBe('개발');
      expect(result[1].title).toBe(SAMPLE_SKILL_ROW_2.title);
      expect(result[1].category.value).toBe('디자인');
    });

    it('카테고리 필터를 적용하여 조회할 수 있어야 한다', async () => {
      const { client, mocks } = createFindAllMock();
      mocks.mockOrder.mockResolvedValue({
        data: [SAMPLE_SKILL_ROW],
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findAll({ category: '개발' });

      expect(result).toHaveLength(1);
      expect(result[0].category.value).toBe('개발');
      expect(mocks.mockEq).toHaveBeenCalledWith('category', '개발');
    });

    it('카테고리 필터 없이 전체 조회 시 eq를 호출하지 않아야 한다', async () => {
      const { client, mocks } = createFindAllMock();
      mocks.mockOrder.mockResolvedValue({ data: [], error: null });

      const repository = new SupabaseSkillRepository(client);
      await repository.findAll();

      expect(mocks.mockEq).not.toHaveBeenCalled();
    });

    it('데이터가 없으면 빈 배열을 반환해야 한다', async () => {
      const { client, mocks } = createFindAllMock();
      mocks.mockOrder.mockResolvedValue({ data: [], error: null });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });

    it('data가 null이면 빈 배열을 반환해야 한다', async () => {
      const { client, mocks } = createFindAllMock();
      mocks.mockOrder.mockResolvedValue({ data: null, error: null });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findAll();

      expect(result).toHaveLength(0);
    });

    it('Supabase가 에러를 반환하면 예외를 발생시켜야 한다', async () => {
      const { client, mocks } = createFindAllMock();
      mocks.mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'permission denied' },
      });

      const repository = new SupabaseSkillRepository(client);

      await expect(repository.findAll()).rejects.toThrow('스킬 목록 조회에 실패했습니다');
    });

    it('skills 테이블에서 전체 조회해야 한다', async () => {
      const { client, mocks } = createFindAllMock();
      mocks.mockOrder.mockResolvedValue({ data: [], error: null });

      const repository = new SupabaseSkillRepository(client);
      await repository.findAll();

      expect(mocks.mockFrom).toHaveBeenCalledWith('skills');
      expect(mocks.mockSelect).toHaveBeenCalledWith('*');
    });
  });

  describe('save()', () => {
    function createSaveMock() {
      const mockInsert = jest.fn();
      const mockFrom = jest.fn().mockReturnValue({ insert: mockInsert });

      const client = { from: mockFrom } as unknown as SupabaseClient;
      return { client, mocks: { mockFrom, mockInsert } };
    }

    it('Skill 엔티티를 snake_case DB 레코드로 변환하여 저장해야 한다', async () => {
      const skill = Skill.create({
        id: SAMPLE_SKILL_ROW.id,
        title: SAMPLE_SKILL_ROW.title,
        category: SAMPLE_SKILL_ROW.category,
        markdownFilePath: SAMPLE_SKILL_ROW.markdown_file_path,
        authorId: SAMPLE_SKILL_ROW.author_id,
      });

      const { client, mocks } = createSaveMock();
      mocks.mockInsert.mockResolvedValue({ error: null });

      const repository = new SupabaseSkillRepository(client);
      await repository.save(skill);

      expect(mocks.mockFrom).toHaveBeenCalledWith('skills');
      expect(mocks.mockInsert).toHaveBeenCalledWith({
        id: skill.id,
        title: skill.title,
        category: skill.category.value,
        markdown_file_path: skill.markdownFilePath,
        author_id: skill.authorId,
        created_at: skill.createdAt.toISOString(),
      });
    });

    it('Supabase가 에러를 반환하면 예외를 발생시켜야 한다', async () => {
      const skill = Skill.create({
        id: SAMPLE_SKILL_ROW.id,
        title: SAMPLE_SKILL_ROW.title,
        category: SAMPLE_SKILL_ROW.category,
        markdownFilePath: SAMPLE_SKILL_ROW.markdown_file_path,
        authorId: SAMPLE_SKILL_ROW.author_id,
      });

      const { client, mocks } = createSaveMock();
      mocks.mockInsert.mockResolvedValue({
        error: { message: 'duplicate key value' },
      });

      const repository = new SupabaseSkillRepository(client);

      await expect(repository.save(skill)).rejects.toThrow('스킬 저장에 실패했습니다');
    });

    it('save 성공 시 void를 반환해야 한다', async () => {
      const skill = Skill.create({
        id: SAMPLE_SKILL_ROW.id,
        title: SAMPLE_SKILL_ROW.title,
        category: SAMPLE_SKILL_ROW.category,
        markdownFilePath: SAMPLE_SKILL_ROW.markdown_file_path,
        authorId: SAMPLE_SKILL_ROW.author_id,
      });

      const { client, mocks } = createSaveMock();
      mocks.mockInsert.mockResolvedValue({ error: null });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.save(skill);

      expect(result).toBeUndefined();
    });
  });

  describe('delete()', () => {
    function createDeleteMock() {
      const mockEq = jest.fn();
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ delete: mockDelete });

      const client = { from: mockFrom } as unknown as SupabaseClient;
      return { client, mocks: { mockFrom, mockDelete, mockEq } };
    }

    it('skills 테이블에서 id로 삭제해야 한다', async () => {
      const targetId = SAMPLE_SKILL_ROW.id;
      const { client, mocks } = createDeleteMock();
      mocks.mockEq.mockResolvedValue({ error: null });

      const repository = new SupabaseSkillRepository(client);
      await repository.delete(targetId);

      expect(mocks.mockFrom).toHaveBeenCalledWith('skills');
      expect(mocks.mockEq).toHaveBeenCalledWith('id', targetId);
    });

    it('Supabase가 에러를 반환하면 예외를 발생시켜야 한다', async () => {
      const { client, mocks } = createDeleteMock();
      mocks.mockEq.mockResolvedValue({
        error: { message: 'row not found' },
      });

      const repository = new SupabaseSkillRepository(client);

      await expect(repository.delete('some-id')).rejects.toThrow('스킬 삭제에 실패했습니다');
    });

    it('delete 성공 시 void를 반환해야 한다', async () => {
      const { client, mocks } = createDeleteMock();
      mocks.mockEq.mockResolvedValue({ error: null });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.delete(SAMPLE_SKILL_ROW.id);

      expect(result).toBeUndefined();
    });
  });
});
