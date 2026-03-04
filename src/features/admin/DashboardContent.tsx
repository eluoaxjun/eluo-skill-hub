import { Users, Zap, MessageSquare } from 'lucide-react';
import type { DashboardStats, RecentMember, RecentSkill } from '@/admin/domain/types';
import SummaryCard from './SummaryCard';
import RecentSkillsList from './RecentSkillsList';
import RecentMembersTable from './RecentMembersTable';

interface DashboardContentProps {
  stats: DashboardStats;
  recentSkills: RecentSkill[];
  recentMembers: RecentMember[];
}

export default function DashboardContent({
  stats,
  recentSkills,
  recentMembers,
}: DashboardContentProps) {
  return (
    <div className="p-8 space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="전체 회원 수" value={stats.totalMembers} icon={Users} />
        <SummaryCard title="전체 스킬 수" value={stats.totalSkills} icon={Zap} />
        <SummaryCard title="누적 피드백 수" value={stats.totalFeedbacks} icon={MessageSquare} change="Total" />
      </div>

      {/* Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentSkillsList skills={recentSkills} />
        <RecentMembersTable members={recentMembers} />
      </div>
    </div>
  );
}
