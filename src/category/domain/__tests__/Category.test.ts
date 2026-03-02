import { Category } from "../entities/Category";

describe("Category", () => {
  const validProps = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "기획",
    slug: "planning",
    icon: "EditNoteIcon",
    sortOrder: 1,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  it("should create a Category entity with valid props", () => {
    const category = Category.create(validProps);

    expect(category).toBeInstanceOf(Category);
    expect(category.id).toBe(validProps.id);
    expect(category.name).toBe(validProps.name);
    expect(category.slug).toBe(validProps.slug);
    expect(category.icon).toBe(validProps.icon);
    expect(category.sortOrder).toBe(validProps.sortOrder);
    expect(category.createdAt).toEqual(validProps.createdAt);
    expect(category.updatedAt).toEqual(validProps.updatedAt);
  });

  it("should throw error when name is empty", () => {
    expect(() =>
      Category.create({ ...validProps, name: "" })
    ).toThrow("카테고리 이름은 필수입니다");
  });

  it("should throw error when slug is empty", () => {
    expect(() =>
      Category.create({ ...validProps, slug: "" })
    ).toThrow("카테고리 slug는 필수입니다");
  });

  it("should throw error when icon is empty", () => {
    expect(() =>
      Category.create({ ...validProps, icon: "" })
    ).toThrow("카테고리 아이콘은 필수입니다");
  });

  it("should have readonly properties", () => {
    const category = Category.create(validProps);

    expect(category.name).toBe("기획");
    expect(category.slug).toBe("planning");
    expect(category.icon).toBe("EditNoteIcon");
    expect(category.sortOrder).toBe(1);
  });
});
