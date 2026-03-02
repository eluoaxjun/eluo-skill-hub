const SKILL_ICONS = ['🤖', '✍️', '📊', '🔍', '📧', '🎨', '⚡', '📝', '🔧', '🧪', '💡', '🚀'];

export function computeSkillIcon(id: string): string {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return SKILL_ICONS[sum % SKILL_ICONS.length];
}
