/**
 * @file mock-skills.test.ts
 * @description 목 스킬 데이터의 구조, 무결성, 카테고리 분포를 검증한다.
 */

import { mockSkills } from "@/shared/ui/data/mock-skills";
import type { JobCategory, SkillSummary } from "@/shared/ui/types/dashboard";

const JOB_CATEGORIES: readonly JobCategory[] = [
  "기획",
  "디자인",
  "퍼블리싱",
  "개발",
  "QA",
] as const;

describe("mockSkills", () => {
  it("최소 10개 이상의 스킬 데이터를 포함한다", () => {
    expect(mockSkills.length).toBeGreaterThanOrEqual(10);
  });

  it("각 카테고리별로 최소 2개 이상의 스킬이 존재한다", () => {
    for (const category of JOB_CATEGORIES) {
      const skillsInCategory = mockSkills.filter(
        (skill) => skill.category === category
      );
      expect(skillsInCategory.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("각 스킬이 필수 필드(id, title, category, createdAt, markdownFilePath)를 모두 가진다", () => {
    for (const skill of mockSkills) {
      expect(skill).toHaveProperty("id");
      expect(skill).toHaveProperty("title");
      expect(skill).toHaveProperty("category");
      expect(skill).toHaveProperty("createdAt");
      expect(skill).toHaveProperty("markdownFilePath");
    }
  });

  it("모든 스킬의 category가 유효한 JobCategory 값이다", () => {
    for (const skill of mockSkills) {
      expect(JOB_CATEGORIES).toContain(skill.category);
    }
  });

  it("모든 스킬의 id가 비어있지 않은 문자열이다", () => {
    for (const skill of mockSkills) {
      expect(typeof skill.id).toBe("string");
      expect(skill.id.length).toBeGreaterThan(0);
    }
  });

  it("모든 스킬의 id가 고유하다", () => {
    const ids = mockSkills.map((skill) => skill.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("모든 스킬의 title이 비어있지 않은 문자열이다", () => {
    for (const skill of mockSkills) {
      expect(typeof skill.title).toBe("string");
      expect(skill.title.length).toBeGreaterThan(0);
    }
  });

  it("모든 스킬의 createdAt이 비어있지 않은 문자열이다", () => {
    for (const skill of mockSkills) {
      expect(typeof skill.createdAt).toBe("string");
      expect(skill.createdAt.length).toBeGreaterThan(0);
    }
  });

  it("모든 스킬의 markdownFilePath가 비어있지 않은 문자열이다", () => {
    for (const skill of mockSkills) {
      expect(typeof skill.markdownFilePath).toBe("string");
      expect(skill.markdownFilePath.length).toBeGreaterThan(0);
    }
  });

  it("mockSkills가 SkillSummary 타입의 readonly 배열이다", () => {
    // TypeScript 컴파일 타임 검증을 보완하는 런타임 확인
    const skills: readonly SkillSummary[] = mockSkills;
    expect(skills).toBe(mockSkills);
  });
});
