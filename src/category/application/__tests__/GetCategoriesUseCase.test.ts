import { GetCategoriesUseCase } from "../GetCategoriesUseCase";
import { Category } from "../../domain/entities/Category";
import type { CategoryRepository } from "../../domain/repositories/CategoryRepository";

describe("GetCategoriesUseCase", () => {
  const createMockCategories = (): Category[] => [
    Category.create({
      id: "1",
      name: "기획",
      slug: "planning",
      icon: "EditNoteIcon",
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    Category.create({
      id: "2",
      name: "디자인",
      slug: "design",
      icon: "BrushIcon",
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ];

  const createMockRepository = (
    categories: Category[]
  ): CategoryRepository => ({
    findAll: jest.fn().mockResolvedValue(categories),
    findBySlug: jest.fn(),
  });

  it("should return sorted category list from repository", async () => {
    const mockCategories = createMockCategories();
    const repository = createMockRepository(mockCategories);
    const useCase = new GetCategoriesUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual(mockCategories);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("기획");
    expect(result[1].name).toBe("디자인");
  });

  it("should call repository.findAll()", async () => {
    const mockCategories = createMockCategories();
    const repository = createMockRepository(mockCategories);
    const useCase = new GetCategoriesUseCase(repository);

    await useCase.execute();

    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  it("should return empty array when no categories exist", async () => {
    const repository = createMockRepository([]);
    const useCase = new GetCategoriesUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });
});
