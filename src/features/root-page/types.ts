export interface SkillViewModel {
  id: string;
  name: string;
  description: string;
  icon: string;
  categoryName: string;
  markdownContent: string | null;
  createdAt: string; // ISO string
}
