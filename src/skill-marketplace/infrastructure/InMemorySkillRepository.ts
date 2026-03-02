import { Skill } from "../domain/entities/Skill";
import { SkillCategory } from "../domain/value-objects/SkillCategory";
import type { SkillRepository } from "../domain/repositories/SkillRepository";

const SKILLS: Skill[] = [
  new Skill(
    "1",
    "코드 오디터 프로",
    "JS 및 파이썬 코드베이스를 위한 자동 보안 검사 및 성능 최적화 오디팅 툴입니다.",
    "\uD83E\uDD16",
    [
      SkillCategory.create("개발", "default"),
      SkillCategory.create("QA", "primary"),
    ],
    null,
    new Date()
  ),
  new Skill(
    "2",
    "보고서 초안 생성기",
    "간단한 메모를 구조화된 화이트페이퍼, 블로그 포스트 또는 내부 문서로 변환합니다.",
    "\u270D\uFE0F",
    [
      SkillCategory.create("기획", "default"),
      SkillCategory.create("디자인", "primary"),
    ],
    null,
    new Date()
  ),
  new Skill(
    "3",
    "데이터 시각화 도우미",
    "CSV나 SQL에 연결하여 대화형 차트와 트렌드 예측을 즉시 생성합니다.",
    "\uD83D\uDCCA",
    [
      SkillCategory.create("개발", "default"),
      SkillCategory.create("기획", "primary"),
    ],
    null,
    new Date()
  ),
  new Skill(
    "4",
    "메일함 자동 분류기",
    "대량의 고객 지원 이메일을 지능적으로 분류하고 응답 초안을 작성합니다.",
    "\uD83D\uDCE7",
    [
      SkillCategory.create("기획", "default"),
      SkillCategory.create("QA", "primary"),
    ],
    null,
    new Date()
  ),
  new Skill(
    "5",
    "비주얼 어시스턴트",
    "자연어 설명을 통해 일관된 UI 자산과 브랜드 아이콘을 생성합니다.",
    "\uD83C\uDFA8",
    [
      SkillCategory.create("디자인", "default"),
      SkillCategory.create("퍼블리싱", "primary"),
    ],
    null,
    new Date()
  ),
  new Skill(
    "6",
    "회의록 요약 봇",
    "실시간 대화를 요약하고 Slack이나 Jira로 후속 작업을 자동 전송합니다.",
    "\u26A1",
    [
      SkillCategory.create("기획", "default"),
      SkillCategory.create("개발", "primary"),
    ],
    null,
    new Date()
  ),
];

export class InMemorySkillRepository implements SkillRepository {
  async getRecommended(categoryName?: string): Promise<Skill[]> {
    if (!categoryName) {
      return SKILLS;
    }

    return SKILLS.filter((skill) =>
      skill.categories.some((cat) => cat.name === categoryName)
    );
  }
}
