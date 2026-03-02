import { Skill } from "../entities/Skill";
import { SkillCategory } from "../value-objects/SkillCategory";

describe("SkillCategory", () => {
  it("should create a SkillCategory with name and variant", () => {
    const category = SkillCategory.create("코딩 지원", "default");

    expect(category.name).toBe("코딩 지원");
    expect(category.variant).toBe("default");
  });

  it("should support 'primary' variant", () => {
    const category = SkillCategory.create("업무 자동화", "primary");

    expect(category.variant).toBe("primary");
  });

  it("should be equal when two SkillCategories have identical values", () => {
    const categoryA = SkillCategory.create("코딩 지원", "default");
    const categoryB = SkillCategory.create("코딩 지원", "default");

    expect(categoryA.equals(categoryB)).toBe(true);
  });

  it("should NOT be equal when SkillCategories have different names", () => {
    const categoryA = SkillCategory.create("코딩 지원", "default");
    const categoryB = SkillCategory.create("디자인", "default");

    expect(categoryA.equals(categoryB)).toBe(false);
  });

  it("should NOT be equal when SkillCategories have different variants", () => {
    const categoryA = SkillCategory.create("코딩 지원", "default");
    const categoryB = SkillCategory.create("코딩 지원", "primary");

    expect(categoryA.equals(categoryB)).toBe(false);
  });
});

describe("Skill", () => {
  const createTestSkill = (): Skill => {
    const categories = [
      SkillCategory.create("코딩 지원", "default"),
      SkillCategory.create("업무 자동화", "primary"),
    ];

    return new Skill(
      "1",
      "코드 오디터 프로",
      "JS 및 파이썬 코드베이스를 위한 자동 보안 검사 및 성능 최적화 오디팅 툴입니다.",
      "🤖",
      categories,
      "# 사용법\n이 스킬을 사용하세요.",
      new Date("2024-01-01T00:00:00Z")
    );
  };

  it("should create a Skill entity with all fields", () => {
    const skill = createTestSkill();

    expect(skill).toBeInstanceOf(Skill);
  });

  it("should have the correct id", () => {
    const skill = createTestSkill();

    expect(skill.id).toBe("1");
  });

  it("should have the correct name", () => {
    const skill = createTestSkill();

    expect(skill.name).toBe("코드 오디터 프로");
  });

  it("should have the correct description", () => {
    const skill = createTestSkill();

    expect(skill.description).toBe(
      "JS 및 파이썬 코드베이스를 위한 자동 보안 검사 및 성능 최적화 오디팅 툴입니다."
    );
  });

  it("should have the correct icon", () => {
    const skill = createTestSkill();

    expect(skill.icon).toBe("🤖");
  });

  it("should have the correct categories", () => {
    const skill = createTestSkill();

    expect(skill.categories).toHaveLength(2);
    expect(skill.categories[0].name).toBe("코딩 지원");
    expect(skill.categories[0].variant).toBe("default");
    expect(skill.categories[1].name).toBe("업무 자동화");
    expect(skill.categories[1].variant).toBe("primary");
  });

  it("markdownContent getter가 문자열을 반환한다", () => {
    const skill = createTestSkill();
    expect(typeof skill.markdownContent).toBe("string");
    expect(skill.markdownContent).toBe("# 사용법\n이 스킬을 사용하세요.");
  });

  it("markdownContent getter가 null을 반환할 수 있다", () => {
    const categories = [SkillCategory.create("개발", "default")];
    const skill = new Skill("2", "테스트", "설명", "🔧", categories, null, new Date());
    expect(skill.markdownContent).toBeNull();
  });

  it("createdAt getter가 Date 인스턴스를 반환한다", () => {
    const skill = createTestSkill();
    expect(skill.createdAt).toBeInstanceOf(Date);
    expect(skill.createdAt.toISOString()).toBe("2024-01-01T00:00:00.000Z");
  });
});
