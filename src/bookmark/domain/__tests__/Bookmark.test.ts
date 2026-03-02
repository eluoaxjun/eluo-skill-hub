import { Bookmark } from "../entities/Bookmark";

describe("Bookmark", () => {
  it("Bookmark.create() 호출 시 id, userId, skillId, createdAt을 갖는 엔티티 생성", () => {
    const now = new Date();
    const bookmark = Bookmark.create({
      id: "bookmark-1",
      userId: "user-1",
      skillId: "skill-1",
      createdAt: now,
    });

    expect(bookmark).toBeInstanceOf(Bookmark);
    expect(bookmark.id).toBe("bookmark-1");
    expect(bookmark.userId).toBe("user-1");
    expect(bookmark.skillId).toBe("skill-1");
    expect(bookmark.createdAt).toBe(now);
  });

  it("getter들이 props 값을 올바르게 반환한다", () => {
    const createdAt = new Date("2024-06-01T00:00:00Z");
    const bookmark = Bookmark.create({
      id: "bk-abc",
      userId: "u-123",
      skillId: "s-456",
      createdAt,
    });

    expect(bookmark.id).toBe("bk-abc");
    expect(bookmark.userId).toBe("u-123");
    expect(bookmark.skillId).toBe("s-456");
    expect(bookmark.createdAt).toEqual(createdAt);
  });
});
