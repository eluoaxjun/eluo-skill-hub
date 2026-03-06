export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    skills: (params: { search?: string; categoryId?: string }) =>
      ['dashboard', 'skills', params] as const,
    categories: () => ['dashboard', 'categories'] as const,
  },
  bookmarks: {
    all: ['bookmarks'] as const,
    ids: (userId: string) => ['bookmarks', 'ids', userId] as const,
    skills: (userId: string) => ['bookmarks', 'skills', userId] as const,
  },
  skillDetail: {
    all: ['skill-detail'] as const,
    detail: (skillId: string) => ['skill-detail', skillId] as const,
    feedbacks: (skillId: string) => ['skill-detail', skillId, 'feedbacks'] as const,
  },
  admin: {
    all: ['admin'] as const,
    stats: () => ['admin', 'stats'] as const,
    skills: (params: { page: number; limit: number; search?: string; status?: string; categoryId?: string }) =>
      ['admin', 'skills', params] as const,
    skillStatusCounts: () => ['admin', 'skill-status-counts'] as const,
    skillById: (id: string) => ['admin', 'skill', id] as const,
    categories: () => ['admin', 'categories'] as const,
    members: (params: { page: number; limit: number; search?: string; currentUserId: string }) =>
      ['admin', 'members', params] as const,
    roles: () => ['admin', 'roles'] as const,
    analytics: {
      all: ['admin', 'analytics'] as const,
      overview: (range: { startDate: string; endDate: string }) =>
        ['admin', 'analytics', 'overview', range] as const,
      dailyTrend: (range: { startDate: string; endDate: string }) =>
        ['admin', 'analytics', 'daily-trend', range] as const,
      skillRankings: (range: { startDate: string; endDate: string }) =>
        ['admin', 'analytics', 'skill-rankings', range] as const,
      userBehavior: (range: { startDate: string; endDate: string }) =>
        ['admin', 'analytics', 'user-behavior', range] as const,
    },
  },
} as const;
