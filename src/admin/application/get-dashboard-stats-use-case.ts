import type { AdminRepository, DashboardStats, RecentMember, RecentSkill } from '@/admin/domain/types';

export interface DashboardData {
  stats: DashboardStats;
  recentSkills: RecentSkill[];
  recentMembers: RecentMember[];
}

export class GetDashboardStatsUseCase {
  constructor(private readonly repository: AdminRepository) {}

  async execute(): Promise<DashboardData> {
    const [stats, recentSkills, recentMembers] = await Promise.all([
      this.repository.getDashboardStats(),
      this.repository.getRecentSkills(5),
      this.repository.getRecentMembers(5),
    ]);

    return { stats, recentSkills, recentMembers };
  }
}
