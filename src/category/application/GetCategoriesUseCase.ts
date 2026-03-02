import type { Category } from "../domain/entities/Category";
import type { CategoryRepository } from "../domain/repositories/CategoryRepository";

export class GetCategoriesUseCase {
  private readonly repository: CategoryRepository;

  constructor(repository: CategoryRepository) {
    this.repository = repository;
  }

  async execute(): Promise<Category[]> {
    return this.repository.findAll();
  }
}
