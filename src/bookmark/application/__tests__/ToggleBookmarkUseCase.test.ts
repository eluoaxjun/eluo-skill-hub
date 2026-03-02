import { ToggleBookmarkUseCase } from "../ToggleBookmarkUseCase";
import type { BookmarkRepository } from "../../domain/repositories/BookmarkRepository";

const mockRepository: jest.Mocked<BookmarkRepository> = {
  findSkillIdsByUserId: jest.fn(),
  toggle: jest.fn(),
};

describe("ToggleBookmarkUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("execute() 호출 시 repository.toggle(userId, skillId)를 실행한다", async () => {
    mockRepository.toggle.mockResolvedValue({ isBookmarked: true });
    const useCase = new ToggleBookmarkUseCase(mockRepository);

    await useCase.execute("user-1", "skill-1");

    expect(mockRepository.toggle).toHaveBeenCalledWith("user-1", "skill-1");
  });

  it("반환값 { isBookmarked: boolean }을 그대로 반환한다 (true)", async () => {
    mockRepository.toggle.mockResolvedValue({ isBookmarked: true });
    const useCase = new ToggleBookmarkUseCase(mockRepository);

    const result = await useCase.execute("user-1", "skill-1");

    expect(result).toEqual({ isBookmarked: true });
  });

  it("반환값 { isBookmarked: boolean }을 그대로 반환한다 (false)", async () => {
    mockRepository.toggle.mockResolvedValue({ isBookmarked: false });
    const useCase = new ToggleBookmarkUseCase(mockRepository);

    const result = await useCase.execute("user-1", "skill-1");

    expect(result).toEqual({ isBookmarked: false });
  });
});
