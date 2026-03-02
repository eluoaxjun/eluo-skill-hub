import { GetRecommendedSkillsUseCase } from "../GetRecommendedSkillsUseCase";
import { Skill } from "../../domain/entities/Skill";
import { SkillCategory } from "../../domain/value-objects/SkillCategory";
import type { SkillRepository } from "../../domain/repositories/SkillRepository";

describe("GetRecommendedSkillsUseCase", () => {
  const createMockSkills = (): Skill[] => [
    new Skill(
      "1",
      "코드 오디터 프로",
      "JS 및 파이썬 코드베이스를 위한 자동 보안 검사 및 성능 최적화 오디팅 툴입니다.",
      "\uD83E\uDD16",
      [
        SkillCategory.create("개발", "default"),
        SkillCategory.create("QA", "primary"),
      ]
    ),
    new Skill(
      "2",
      "보고서 초안 생성기",
      "간단한 메모를 구조화된 화이트페이퍼, 블로그 포스트 또는 내부 문서로 변환합니다.",
      "\u270D\uFE0F",
      [
        SkillCategory.create("기획", "default"),
        SkillCategory.create("디자인", "primary"),
      ]
    ),
  ];

  const createMockRepository = (
    skills: Skill[]
  ): SkillRepository => ({
    getRecommended: jest.fn().mockResolvedValue(skills),
  });

  it("should return recommended skills from repository", async () => {
    const mockSkills = createMockSkills();
    const repository = createMockRepository(mockSkills);
    const useCase = new GetRecommendedSkillsUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual(mockSkills);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("코드 오디터 프로");
    expect(result[1].name).toBe("보고서 초안 생성기");
  });

  it("should call repository.getRecommended()", async () => {
    const mockSkills = createMockSkills();
    const repository = createMockRepository(mockSkills);
    const useCase = new GetRecommendedSkillsUseCase(repository);

    await useCase.execute();

    expect(repository.getRecommended).toHaveBeenCalledTimes(1);
  });

  it("should pass categoryName to repository when provided", async () => {
    const mockSkills = createMockSkills();
    const repository = createMockRepository(mockSkills);
    const useCase = new GetRecommendedSkillsUseCase(repository);

    await useCase.execute("개발");

    expect(repository.getRecommended).toHaveBeenCalledWith("개발");
  });

  it("should pass undefined to repository when no categoryName provided", async () => {
    const mockSkills = createMockSkills();
    const repository = createMockRepository(mockSkills);
    const useCase = new GetRecommendedSkillsUseCase(repository);

    await useCase.execute();

    expect(repository.getRecommended).toHaveBeenCalledWith(undefined);
  });
});
