import { SubmitFeedbackUseCase } from "../SubmitFeedbackUseCase";
import { FeedbackLog } from "../../domain/entities/FeedbackLog";
import type { FeedbackLogRepository } from "../../domain/repositories/FeedbackLogRepository";

const mockRepository: jest.Mocked<FeedbackLogRepository> = {
  save: jest.fn(),
};

describe("SubmitFeedbackUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("유효한 rating(3)과 comment로 execute() 호출 시 repository.save()가 실행된다", async () => {
    mockRepository.save.mockResolvedValue(undefined);
    const useCase = new SubmitFeedbackUseCase(mockRepository);

    await useCase.execute("user-1", "skill-1", 3, "좋습니다");

    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("repository.save() 인수로 전달된 FeedbackLog의 rating, comment가 올바르다", async () => {
    mockRepository.save.mockResolvedValue(undefined);
    const useCase = new SubmitFeedbackUseCase(mockRepository);

    await useCase.execute("user-1", "skill-1", 5, "최고입니다");

    const savedLog = mockRepository.save.mock.calls[0][0] as FeedbackLog;
    expect(savedLog).toBeInstanceOf(FeedbackLog);
    expect(savedLog.rating).toBe(5);
    expect(savedLog.comment).toBe("최고입니다");
    expect(savedLog.userId).toBe("user-1");
    expect(savedLog.skillId).toBe("skill-1");
  });

  it("rating이 0이면 에러가 발생한다", async () => {
    const useCase = new SubmitFeedbackUseCase(mockRepository);

    await expect(
      useCase.execute("user-1", "skill-1", 0, null)
    ).rejects.toThrow(RangeError);
  });
});
