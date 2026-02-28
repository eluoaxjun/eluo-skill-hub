import { SupabaseSkillRepository } from '@/skill-catalog/infrastructure/SupabaseSkillRepository';
import { Skill } from '@/skill-catalog/domain/Skill';
import { SkillCategory } from '@/skill-catalog/domain/SkillCategory';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * SupabaseSkillRepository 통합 테스트
 *
 * 기존 단위 테스트(SupabaseSkillRepository.test.ts)에서 다루지 않는
 * 복합 시나리오 및 엣지 케이스를 검증한다.
 *
 * - 전체 CRUD 라이프사이클 (save -> findById -> verify -> delete -> verify deleted)
 * - 다수 스킬 저장 후 findAll 검증
 * - 카테고리 필터링 정확성 (여러 카테고리 혼합 저장 후 필터)
 * - 도메인 엔티티 <-> DB 레코드 매핑 무결성 (전체 필드 라운드트립)
 * - 엣지 케이스: 존재하지 않는 ID로 findById, 존재하지 않는 스킬 삭제, 빈 테이블 findAll
 */

// 테스트 데이터
const SKILL_ROWS = {
  planning: {
    id: '11111111-1111-1111-1111-111111111001',
    title: '요구사항 정리 자동화',
    category: '기획',
    markdown_file_path: 'planning-001.md',
    author_id: 'aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: '2026-02-01T09:00:00Z',
  },
  design: {
    id: '11111111-1111-1111-1111-111111111002',
    title: '디자인 토큰 추출기',
    category: '디자인',
    markdown_file_path: 'design-001.md',
    author_id: 'aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: '2026-02-02T09:00:00Z',
  },
  publishing: {
    id: '11111111-1111-1111-1111-111111111003',
    title: '반응형 레이아웃 생성기',
    category: '퍼블리싱',
    markdown_file_path: 'publishing-001.md',
    author_id: 'bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    created_at: '2026-02-03T09:00:00Z',
  },
  development: {
    id: '11111111-1111-1111-1111-111111111004',
    title: 'API 스캐폴딩 자동화',
    category: '개발',
    markdown_file_path: 'dev-001.md',
    author_id: 'bbbb0000-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    created_at: '2026-02-04T09:00:00Z',
  },
  qa: {
    id: '11111111-1111-1111-1111-111111111005',
    title: '회귀 테스트 자동화',
    category: 'QA',
    markdown_file_path: 'qa-001.md',
    author_id: 'aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: '2026-02-05T09:00:00Z',
  },
  developmentExtra: {
    id: '11111111-1111-1111-1111-111111111006',
    title: '코드 리뷰 자동화',
    category: '개발',
    markdown_file_path: 'dev-002.md',
    author_id: 'aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    created_at: '2026-02-06T09:00:00Z',
  },
};

/**
 * Supabase 클라이언트 모킹 유틸리티
 *
 * 통합 테스트에서는 복수의 메서드 호출 체인을 시뮬레이션해야 하므로,
 * 단위 테스트보다 세밀한 모킹이 필요하다.
 * 각 호출마다 독립적인 결과를 반환할 수 있도록 설계한다.
 */
function createIntegrationMockClient() {
  // 내부 데이터 저장소 (in-memory DB 역할)
  const store: Record<string, Record<string, unknown>> = {};

  const mockSingle = jest.fn();
  const mockEqChained = jest.fn();
  const mockOrder = jest.fn();
  const mockEqForSelect = jest.fn();
  const mockSelect = jest.fn();
  const mockInsert = jest.fn();
  const mockDeleteFn = jest.fn();
  const mockEqForDelete = jest.fn();
  const mockFrom = jest.fn();

  // findById: from -> select -> eq -> single
  // findAll: from -> select -> [eq] -> order
  // save: from -> insert
  // delete: from -> delete -> eq

  mockFrom.mockImplementation(() => ({
    select: mockSelect,
    insert: mockInsert,
    delete: mockDeleteFn,
  }));

  mockSelect.mockImplementation(() => ({
    eq: mockEqForSelect,
    order: mockOrder,
  }));

  mockEqForSelect.mockImplementation(() => ({
    single: mockSingle,
    order: mockOrder,
  }));

  mockDeleteFn.mockImplementation(() => ({
    eq: mockEqForDelete,
  }));

  const client = { from: mockFrom } as unknown as SupabaseClient;

  return {
    client,
    store,
    mocks: {
      mockFrom,
      mockSelect,
      mockEqForSelect,
      mockSingle,
      mockOrder,
      mockInsert,
      mockDeleteFn,
      mockEqForDelete,
    },
  };
}

describe('SupabaseSkillRepository 통합 테스트', () => {
  describe('전체 CRUD 라이프사이클', () => {
    it('save -> findById -> verify -> delete -> verify deleted 순서로 동작해야 한다', async () => {
      // 스킬 생성
      const skill = Skill.create({
        id: SKILL_ROWS.planning.id,
        title: SKILL_ROWS.planning.title,
        category: SKILL_ROWS.planning.category,
        markdownFilePath: SKILL_ROWS.planning.markdown_file_path,
        authorId: SKILL_ROWS.planning.author_id,
      });

      // Step 1: save
      const { client: saveClient, mocks: saveMocks } = createIntegrationMockClient();
      saveMocks.mockInsert.mockResolvedValue({ error: null });
      const saveRepo = new SupabaseSkillRepository(saveClient);
      await saveRepo.save(skill);

      expect(saveMocks.mockFrom).toHaveBeenCalledWith('skills');
      expect(saveMocks.mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: skill.id,
          title: skill.title,
          category: skill.category.value,
          markdown_file_path: skill.markdownFilePath,
          author_id: skill.authorId,
        }),
      );

      // Step 2: findById - 저장된 스킬 조회
      const { client: findClient, mocks: findMocks } = createIntegrationMockClient();
      findMocks.mockSingle.mockResolvedValue({
        data: SKILL_ROWS.planning,
        error: null,
      });
      const findRepo = new SupabaseSkillRepository(findClient);
      const found = await findRepo.findById(skill.id);

      expect(found).toBeInstanceOf(Skill);
      expect(found?.id).toBe(skill.id);
      expect(found?.title).toBe(skill.title);
      expect(found?.category.value).toBe(skill.category.value);
      expect(found?.markdownFilePath).toBe(skill.markdownFilePath);
      expect(found?.authorId).toBe(skill.authorId);

      // Step 3: delete
      const { client: deleteClient, mocks: deleteMocks } = createIntegrationMockClient();
      deleteMocks.mockEqForDelete.mockResolvedValue({ error: null });
      const deleteRepo = new SupabaseSkillRepository(deleteClient);
      await deleteRepo.delete(skill.id);

      expect(deleteMocks.mockFrom).toHaveBeenCalledWith('skills');
      expect(deleteMocks.mockEqForDelete).toHaveBeenCalledWith('id', skill.id);

      // Step 4: findById - 삭제 후 null 반환 확인
      const { client: verifyClient, mocks: verifyMocks } = createIntegrationMockClient();
      verifyMocks.mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });
      const verifyRepo = new SupabaseSkillRepository(verifyClient);
      const deleted = await verifyRepo.findById(skill.id);

      expect(deleted).toBeNull();
    });
  });

  describe('다수 스킬 저장 후 전체 조회', () => {
    it('여러 스킬을 저장한 후 findAll로 모두 반환받아야 한다', async () => {
      const allRows = [
        SKILL_ROWS.planning,
        SKILL_ROWS.design,
        SKILL_ROWS.publishing,
        SKILL_ROWS.development,
        SKILL_ROWS.qa,
      ];

      const { client, mocks } = createIntegrationMockClient();
      mocks.mockOrder.mockResolvedValue({
        data: allRows,
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findAll();

      expect(result).toHaveLength(5);
      // 각 스킬의 카테고리가 올바른지 검증
      const categories = result.map((skill) => skill.category.value);
      expect(categories).toContain('기획');
      expect(categories).toContain('디자인');
      expect(categories).toContain('퍼블리싱');
      expect(categories).toContain('개발');
      expect(categories).toContain('QA');
    });

    it('각 스킬의 모든 필드가 정확하게 매핑되어야 한다', async () => {
      const { client, mocks } = createIntegrationMockClient();
      mocks.mockOrder.mockResolvedValue({
        data: [SKILL_ROWS.planning, SKILL_ROWS.qa],
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findAll();

      // 첫 번째 스킬 전체 필드 검증
      const planningSkill = result.find((s) => s.id === SKILL_ROWS.planning.id);
      expect(planningSkill).toBeDefined();
      expect(planningSkill?.title).toBe(SKILL_ROWS.planning.title);
      expect(planningSkill?.category.value).toBe('기획');
      expect(planningSkill?.markdownFilePath).toBe(SKILL_ROWS.planning.markdown_file_path);
      expect(planningSkill?.authorId).toBe(SKILL_ROWS.planning.author_id);
      expect(planningSkill?.createdAt).toEqual(new Date(SKILL_ROWS.planning.created_at));

      // 두 번째 스킬 전체 필드 검증
      const qaSkill = result.find((s) => s.id === SKILL_ROWS.qa.id);
      expect(qaSkill).toBeDefined();
      expect(qaSkill?.title).toBe(SKILL_ROWS.qa.title);
      expect(qaSkill?.category.value).toBe('QA');
      expect(qaSkill?.markdownFilePath).toBe(SKILL_ROWS.qa.markdown_file_path);
      expect(qaSkill?.authorId).toBe(SKILL_ROWS.qa.author_id);
      expect(qaSkill?.createdAt).toEqual(new Date(SKILL_ROWS.qa.created_at));
    });
  });

  describe('카테고리 필터링', () => {
    it('특정 카테고리로 필터링 시 해당 카테고리의 스킬만 반환해야 한다', async () => {
      // '개발' 카테고리로 필터링하면 개발 카테고리 스킬만 반환
      const devRows = [SKILL_ROWS.development, SKILL_ROWS.developmentExtra];

      const { client, mocks } = createIntegrationMockClient();
      mocks.mockOrder.mockResolvedValue({
        data: devRows,
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findAll({ category: '개발' });

      expect(result).toHaveLength(2);
      result.forEach((skill) => {
        expect(skill.category.value).toBe('개발');
      });
      expect(mocks.mockEqForSelect).toHaveBeenCalledWith('category', '개발');
    });

    it('각 카테고리별 필터링이 독립적으로 동작해야 한다', async () => {
      // 기획 카테고리 필터링
      const { client: planClient, mocks: planMocks } = createIntegrationMockClient();
      planMocks.mockOrder.mockResolvedValue({
        data: [SKILL_ROWS.planning],
        error: null,
      });

      const planRepo = new SupabaseSkillRepository(planClient);
      const planResult = await planRepo.findAll({ category: '기획' });

      expect(planResult).toHaveLength(1);
      expect(planResult[0].category.value).toBe('기획');
      expect(planMocks.mockEqForSelect).toHaveBeenCalledWith('category', '기획');

      // QA 카테고리 필터링
      const { client: qaClient, mocks: qaMocks } = createIntegrationMockClient();
      qaMocks.mockOrder.mockResolvedValue({
        data: [SKILL_ROWS.qa],
        error: null,
      });

      const qaRepo = new SupabaseSkillRepository(qaClient);
      const qaResult = await qaRepo.findAll({ category: 'QA' });

      expect(qaResult).toHaveLength(1);
      expect(qaResult[0].category.value).toBe('QA');
      expect(qaMocks.mockEqForSelect).toHaveBeenCalledWith('category', 'QA');
    });

    it('결과가 없는 카테고리로 필터링 시 빈 배열을 반환해야 한다', async () => {
      const { client, mocks } = createIntegrationMockClient();
      mocks.mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findAll({ category: '퍼블리싱' });

      expect(result).toHaveLength(0);
      expect(mocks.mockEqForSelect).toHaveBeenCalledWith('category', '퍼블리싱');
    });
  });

  describe('도메인 엔티티 <-> DB 레코드 매핑 무결성', () => {
    it('save 시 도메인 엔티티의 모든 필드가 snake_case DB 레코드로 정확하게 변환되어야 한다', async () => {
      const skill = Skill.create({
        id: SKILL_ROWS.design.id,
        title: SKILL_ROWS.design.title,
        category: SKILL_ROWS.design.category,
        markdownFilePath: SKILL_ROWS.design.markdown_file_path,
        authorId: SKILL_ROWS.design.author_id,
      });

      const { client, mocks } = createIntegrationMockClient();
      mocks.mockInsert.mockResolvedValue({ error: null });

      const repository = new SupabaseSkillRepository(client);
      await repository.save(skill);

      const insertedRow = mocks.mockInsert.mock.calls[0][0];

      // snake_case 키 이름 확인
      expect(Object.keys(insertedRow)).toEqual(
        expect.arrayContaining([
          'id',
          'title',
          'category',
          'markdown_file_path',
          'author_id',
          'created_at',
        ]),
      );

      // 값 정확성 확인
      expect(insertedRow.id).toBe(skill.id);
      expect(insertedRow.title).toBe(skill.title);
      expect(insertedRow.category).toBe(skill.category.value);
      expect(insertedRow.markdown_file_path).toBe(skill.markdownFilePath);
      expect(insertedRow.author_id).toBe(skill.authorId);
      expect(insertedRow.created_at).toBe(skill.createdAt.toISOString());
    });

    it('findById 시 DB 레코드가 도메인 엔티티의 모든 필드로 정확하게 복원되어야 한다', async () => {
      const { client, mocks } = createIntegrationMockClient();
      mocks.mockSingle.mockResolvedValue({
        data: SKILL_ROWS.publishing,
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);
      const skill = await repository.findById(SKILL_ROWS.publishing.id);

      expect(skill).not.toBeNull();
      expect(skill?.id).toBe(SKILL_ROWS.publishing.id);
      expect(skill?.title).toBe(SKILL_ROWS.publishing.title);
      expect(skill?.category).toBeInstanceOf(SkillCategory);
      expect(skill?.category.value).toBe('퍼블리싱');
      expect(skill?.markdownFilePath).toBe(SKILL_ROWS.publishing.markdown_file_path);
      expect(skill?.authorId).toBe(SKILL_ROWS.publishing.author_id);
      expect(skill?.createdAt).toBeInstanceOf(Date);
      expect(skill?.createdAt).toEqual(new Date(SKILL_ROWS.publishing.created_at));
    });

    it('5개 카테고리 모두 도메인 엔티티로 정확히 복원되어야 한다', async () => {
      const allRows = [
        SKILL_ROWS.planning,
        SKILL_ROWS.design,
        SKILL_ROWS.publishing,
        SKILL_ROWS.development,
        SKILL_ROWS.qa,
      ];

      const { client, mocks } = createIntegrationMockClient();
      mocks.mockOrder.mockResolvedValue({
        data: allRows,
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findAll();

      const expectedCategories = ['기획', '디자인', '퍼블리싱', '개발', 'QA'];
      const actualCategories = result.map((s) => s.category.value);

      expectedCategories.forEach((cat) => {
        expect(actualCategories).toContain(cat);
      });

      result.forEach((skill) => {
        expect(skill.category).toBeInstanceOf(SkillCategory);
      });
    });

    it('created_at 문자열이 Date 객체로 정확하게 변환되어야 한다', async () => {
      const rowWithPreciseTimestamp = {
        ...SKILL_ROWS.planning,
        created_at: '2026-02-15T14:30:45.123Z',
      };

      const { client, mocks } = createIntegrationMockClient();
      mocks.mockSingle.mockResolvedValue({
        data: rowWithPreciseTimestamp,
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);
      const skill = await repository.findById(rowWithPreciseTimestamp.id);

      expect(skill?.createdAt).toBeInstanceOf(Date);
      expect(skill?.createdAt.toISOString()).toBe('2026-02-15T14:30:45.123Z');
    });
  });

  describe('엣지 케이스', () => {
    it('존재하지 않는 ID로 findById 시 null을 반환해야 한다', async () => {
      const nonExistentId = '99999999-9999-9999-9999-999999999999';

      const { client, mocks } = createIntegrationMockClient();
      mocks.mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'The result contains 0 rows' },
      });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findById(nonExistentId);

      expect(result).toBeNull();
      expect(mocks.mockEqForSelect).toHaveBeenCalledWith('id', nonExistentId);
    });

    it('빈 테이블에서 findAll 시 빈 배열을 반환해야 한다', async () => {
      const { client, mocks } = createIntegrationMockClient();
      mocks.mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);
      const result = await repository.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('findAll 시 created_at DESC 순으로 정렬 요청해야 한다', async () => {
      const { client, mocks } = createIntegrationMockClient();
      mocks.mockOrder.mockResolvedValue({
        data: [],
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);
      await repository.findAll();

      expect(mocks.mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('DB 레코드에 유효하지 않은 카테고리 값이 있으면 findAll에서 에러를 발생시켜야 한다', async () => {
      const invalidRows = [
        { ...SKILL_ROWS.planning },
        { ...SKILL_ROWS.design, category: '유효하지않은카테고리' },
      ];

      const { client, mocks } = createIntegrationMockClient();
      mocks.mockOrder.mockResolvedValue({
        data: invalidRows,
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);

      await expect(repository.findAll()).rejects.toThrow('올바른 카테고리를 선택해 주세요');
    });

    it('한글 문자를 포함한 제목이 정확하게 저장 및 복원되어야 한다', async () => {
      const koreanRow = {
        id: '11111111-1111-1111-1111-111111111099',
        title: '웹 접근성 검증 자동화 스킬 (WCAG 2.1 기준)',
        category: 'QA',
        markdown_file_path: 'korean-title.md',
        author_id: 'aaaa0000-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        created_at: '2026-02-20T12:00:00Z',
      };

      const { client, mocks } = createIntegrationMockClient();
      mocks.mockSingle.mockResolvedValue({
        data: koreanRow,
        error: null,
      });

      const repository = new SupabaseSkillRepository(client);
      const skill = await repository.findById(koreanRow.id);

      expect(skill?.title).toBe('웹 접근성 검증 자동화 스킬 (WCAG 2.1 기준)');
    });

    it('Supabase 네트워크 에러 발생 시 findAll에서 적절한 에러 메시지를 포함해야 한다', async () => {
      const { client, mocks } = createIntegrationMockClient();
      mocks.mockOrder.mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch' },
      });

      const repository = new SupabaseSkillRepository(client);

      await expect(repository.findAll()).rejects.toThrow('스킬 목록 조회에 실패했습니다');
    });
  });
});
