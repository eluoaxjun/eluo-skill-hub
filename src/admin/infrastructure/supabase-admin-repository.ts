import { createClient } from '@/shared/infrastructure/supabase/server';
import type {
  AdminRepository,
  DashboardStats,
  FeedbackRow,
  MemberRow,
  PaginatedResult,
  RecentMember,
  RecentSkill,
  SkillRow,
} from '@/admin/domain/types';

type JoinedName = { name: string } | { name: string }[] | null;

function extractName(joined: JoinedName): string {
  if (!joined) return '';
  if (Array.isArray(joined)) return joined[0]?.name ?? '';
  return joined.name;
}

type JoinedEmail = { email: string } | { email: string }[] | null;

function extractEmail(joined: JoinedEmail): string {
  if (!joined) return '';
  if (Array.isArray(joined)) return joined[0]?.email ?? '';
  return joined.email;
}

type JoinedTitle = { title: string } | { title: string }[] | null;

function extractTitle(joined: JoinedTitle): string {
  if (!joined) return '';
  if (Array.isArray(joined)) return joined[0]?.title ?? '';
  return joined.title;
}

export class SupabaseAdminRepository implements AdminRepository {
  async getDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient();

    const [membersResult, skillsResult, feedbacksResult] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('skills').select('*', { count: 'exact', head: true }),
      supabase.from('skill_feedback_logs').select('*', { count: 'exact', head: true }),
    ]);

    return {
      totalMembers: membersResult.count ?? 0,
      totalSkills: skillsResult.count ?? 0,
      totalFeedbacks: feedbacksResult.count ?? 0,
    };
  }

  async getRecentSkills(limit: number): Promise<RecentSkill[]> {
    const supabase = await createClient();

    const { data } = await supabase
      .from('skills')
      .select('id, title, description, created_at, categories(name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!data) return [];

    return data.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: (row.description as string | null) ?? null,
      categoryName: extractName(row.categories as JoinedName),
      createdAt: row.created_at as string,
    }));
  }

  async getRecentMembers(limit: number): Promise<RecentMember[]> {
    const supabase = await createClient();

    const { data } = await supabase
      .from('profiles')
      .select('id, email, created_at, roles(name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!data) return [];

    return data.map((row) => ({
      id: row.id as string,
      email: row.email as string,
      displayName: null,
      roleName: extractName(row.roles as JoinedName),
      createdAt: row.created_at as string,
    }));
  }

  async getMembers(page: number, pageSize: number): Promise<PaginatedResult<MemberRow>> {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count } = await supabase
      .from('profiles')
      .select('id, email, created_at, roles(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    const totalCount = count ?? 0;
    const rows: MemberRow[] = (data ?? []).map((row) => ({
      id: row.id as string,
      email: row.email as string,
      displayName: null,
      roleName: extractName(row.roles as JoinedName),
      createdAt: row.created_at as string,
      status: 'active' as const,
    }));

    return {
      data: rows,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async getSkills(page: number, pageSize: number): Promise<PaginatedResult<SkillRow>> {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count } = await supabase
      .from('skills')
      .select('id, title, description, status, created_at, categories(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    const totalCount = count ?? 0;
    const rows: SkillRow[] = (data ?? []).map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: (row.description as string | null) ?? null,
      categoryName: extractName(row.categories as JoinedName),
      status: ((row.status as string) === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
      createdAt: row.created_at as string,
    }));

    return {
      data: rows,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  async getFeedbacks(page: number, pageSize: number): Promise<PaginatedResult<FeedbackRow>> {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count } = await supabase
      .from('skill_feedback_logs')
      .select(
        'id, rating, comment, created_at, profiles(email), skills(title)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    const totalCount = count ?? 0;
    const rows: FeedbackRow[] = (data ?? []).map((row) => ({
      id: row.id as string,
      rating: row.rating as number,
      comment: (row.comment as string | null) ?? null,
      userName: extractEmail(row.profiles as JoinedEmail),
      skillTitle: extractTitle(row.skills as JoinedTitle),
      createdAt: row.created_at as string,
    }));

    return {
      data: rows,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }
}
