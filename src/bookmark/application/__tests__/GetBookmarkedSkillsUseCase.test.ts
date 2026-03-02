import { GetBookmarkedSkillsUseCase } from "../GetBookmarkedSkillsUseCase";
import type { BookmarkRepository } from "../../domain/repositories/BookmarkRepository";

const mockRepository: jest.Mocked<BookmarkRepository> = {
  findSkillIdsByUserId: jest.fn(),
  toggle: jest.fn(),
};

describe("GetBookmarkedSkillsUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("execute(userId) 호출 시 repository.findSkillIdsByUserId(userId)를 실행한다", async () => {
    mockRepository.findSkillIdsByUserId.mockResolvedValue([]);
    const useCase = new GetBookmarkedSkillsUseCase(mockRepository);

    await useCase.execute("user-1");

    expect(mockRepository.findSkillIdsByUserId).toHaveBeenCalledWith("user-1");
  });

  it("반환된 skill ID 배열을 그대로 반환한다", async () => {
    const skillIds = ["skill-1", "skill-2", "skill-3"];
    mockRepository.findSkillIdsByUserId.mockResolvedValue(skillIds);
    const useCase = new GetBookmarkedSkillsUseCase(mockRepository);

    const result = await useCase.execute("user-1");

    expect(result).toEqual(skillIds);
  });
});
