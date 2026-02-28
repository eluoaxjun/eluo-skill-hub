/**
 * @file skill-markdown-api.test.ts
 * @description Task 8.3 - 스킬 마크다운 API 라우트 테스트
 *
 * GET /api/skills/[id]/markdown 엔드포인트가
 * 스킬 ID로 마크다운 파일 경로를 조회하고 Storage에서 콘텐츠를 가져와 반환하는지 검증한다.
 */

// NextResponse를 모킹 (jsdom 환경에서 Request가 없으므로)
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: () => Promise.resolve(body),
    }),
  },
}));

// Supabase 서버 클라이언트 모킹
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockFrom = jest.fn();
const mockDownload = jest.fn();
const mockStorageFrom = jest.fn();

jest.mock("@/shared/infrastructure/supabase/server", () => ({
  createSupabaseServerClient: jest.fn().mockResolvedValue({
    from: (...args: unknown[]) => mockFrom(...args),
    storage: {
      from: (...args: unknown[]) => mockStorageFrom(...args),
    },
  }),
}));

describe("Task 8.3 - GET /api/skills/[id]/markdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 기본 체이닝 설정
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockStorageFrom.mockReturnValue({ download: mockDownload });
  });

  it("스킬 ID로 마크다운 파일 경로를 조회하고 콘텐츠를 반환한다", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "skill-1",
        markdown_file_path: "abc123.md",
      },
      error: null,
    });

    // Blob.text()를 명시적으로 사용하는 모의 객체
    const blobMock = {
      text: () => Promise.resolve("# Hello World"),
    };
    mockDownload.mockResolvedValue({
      data: blobMock,
      error: null,
    });

    const { GET } = await import(
      "@/app/api/skills/[id]/markdown/route"
    );

    const request = {} as Request;
    const response = await GET(request, {
      params: Promise.resolve({ id: "skill-1" }),
    });

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.content).toBe("# Hello World");
  });

  it("스킬이 존재하지 않으면 404를 반환한다", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "Not found" },
    });

    const { GET } = await import(
      "@/app/api/skills/[id]/markdown/route"
    );

    const request = {} as Request;
    const response = await GET(request, {
      params: Promise.resolve({ id: "nonexistent" }),
    });

    expect(response.status).toBe(404);
  });

  it("Storage 다운로드 실패 시 500을 반환한다", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "skill-1",
        markdown_file_path: "abc123.md",
      },
      error: null,
    });

    mockDownload.mockResolvedValue({
      data: null,
      error: { message: "Storage error" },
    });

    const { GET } = await import(
      "@/app/api/skills/[id]/markdown/route"
    );

    const request = {} as Request;
    const response = await GET(request, {
      params: Promise.resolve({ id: "skill-1" }),
    });

    expect(response.status).toBe(500);
  });

  it("skills 테이블에서 from('skills')을 호출한다", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "skill-1",
        markdown_file_path: "test.md",
      },
      error: null,
    });

    const blobMock = { text: () => Promise.resolve("content") };
    mockDownload.mockResolvedValue({
      data: blobMock,
      error: null,
    });

    const { GET } = await import(
      "@/app/api/skills/[id]/markdown/route"
    );

    const request = {} as Request;
    await GET(request, {
      params: Promise.resolve({ id: "skill-1" }),
    });

    expect(mockFrom).toHaveBeenCalledWith("skills");
  });

  it("skill-markdowns 버킷에서 파일을 다운로드한다", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "skill-1",
        markdown_file_path: "abc123.md",
      },
      error: null,
    });

    const blobMock = { text: () => Promise.resolve("# content") };
    mockDownload.mockResolvedValue({
      data: blobMock,
      error: null,
    });

    const { GET } = await import(
      "@/app/api/skills/[id]/markdown/route"
    );

    const request = {} as Request;
    await GET(request, {
      params: Promise.resolve({ id: "skill-1" }),
    });

    expect(mockStorageFrom).toHaveBeenCalledWith("skill-markdowns");
    expect(mockDownload).toHaveBeenCalledWith("abc123.md");
  });
});
