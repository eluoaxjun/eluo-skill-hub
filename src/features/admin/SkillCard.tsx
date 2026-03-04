import {
  MessageCircle,
  BarChart2,
  Palette,
  Languages,
  Code2,
  Zap,
  BookOpen,
  Settings,
  Users,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import type { SkillRow } from '@/admin/domain/types';

const ICON_MAP: Record<string, LucideIcon> = {
  // Material Symbols → lucide equivalents
  chat_bubble: MessageCircle,
  analytics: BarChart2,
  brush: Palette,
  translate: Languages,
  code: Code2,
  bolt: Zap,
  book: BookOpen,
  settings: Settings,
  group: Users,
  description: FileText,
  // Lucide names (for future-proof DB values)
  MessageCircle,
  BarChart2,
  Palette,
  Languages,
  Code2,
  Zap,
};

const CATEGORY_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  'Customer Service': { bg: 'bg-blue-100', text: 'text-blue-600' },
  Analytics: { bg: 'bg-purple-100', text: 'text-purple-600' },
  Creative: { bg: 'bg-orange-100', text: 'text-orange-600' },
  Productivity: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  Development: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
};

function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Zap;
}

function getCategoryColors(categoryName: string): { bg: string; text: string } {
  return CATEGORY_COLOR_MAP[categoryName] ?? { bg: 'bg-slate-100', text: 'text-slate-600' };
}

interface SkillCardProps {
  skill: SkillRow;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const Icon = getIconComponent(skill.categoryIcon);
  const colors = getCategoryColors(skill.categoryName);

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-white/30 shadow-lg shadow-[#000080]/5 rounded-2xl p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center`}>
          <Icon size={28} />
        </div>
        {skill.status === 'published' ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
            Published
          </span>
        ) : (
          <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase">
            Draft
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{skill.title}</h3>
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">{skill.description ?? ''}</p>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span className="text-sm">⊞</span>
          <span>{skill.categoryName}</span>
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
        <button
          type="button"
          className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-colors"
        >
          수정
        </button>
        <button
          type="button"
          className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
