import { FeedbackLog } from "../entities/FeedbackLog";

describe("FeedbackLog", () => {
  it("FeedbackLog.create() 호출 시 엔티티 생성", () => {
    const log = FeedbackLog.create({
      id: "log-1",
      userId: "user-1",
      skillId: "skill-1",
      rating: 4,
      comment: "훌륭합니다",
      createdAt: new Date(),
    });

    expect(log).toBeInstanceOf(FeedbackLog);
    expect(log.id).toBe("log-1");
    expect(log.userId).toBe("user-1");
    expect(log.skillId).toBe("skill-1");
    expect(log.rating).toBe(4);
    expect(log.comment).toBe("훌륭합니다");
  });

  it("rating이 0이면 RangeError 발생", () => {
    expect(() =>
      FeedbackLog.create({
        id: "log-2",
        userId: "user-1",
        skillId: "skill-1",
        rating: 0,
        comment: null,
        createdAt: new Date(),
      })
    ).toThrow(RangeError);
  });

  it("rating이 6이면 RangeError 발생", () => {
    expect(() =>
      FeedbackLog.create({
        id: "log-3",
        userId: "user-1",
        skillId: "skill-1",
        rating: 6,
        comment: null,
        createdAt: new Date(),
      })
    ).toThrow(RangeError);
  });

  it("comment가 null일 수 있다", () => {
    const log = FeedbackLog.create({
      id: "log-4",
      userId: "user-1",
      skillId: "skill-1",
      rating: 3,
      comment: null,
      createdAt: new Date(),
    });

    expect(log.comment).toBeNull();
  });
});
