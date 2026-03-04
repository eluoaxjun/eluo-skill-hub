export interface DashboardStats {
  readonly totalMembers: number;
  readonly totalSkills: number;
  readonly totalFeedbacks: number;
}

export interface RecentSkill {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly categoryName: string;
  readonly createdAt: string;
}

export interface RecentMember {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly roleName: string;
  readonly createdAt: string;
}

export interface MemberRow {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly roleName: string;
  readonly roleId: string;
  readonly createdAt: string;
  readonly status: 'active' | 'pending';
}

export interface Role {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
}

export interface Permission {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
}

export interface RolePermission {
  readonly id: string;
  readonly roleId: string;
  readonly permissionId: string;
}

export interface SkillRow {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly categoryName: string;
  readonly status: 'active' | 'inactive';
  readonly createdAt: string;
}

export interface FeedbackRow {
  readonly id: string;
  readonly rating: number;
  readonly comment: string | null;
  readonly userName: string;
  readonly skillTitle: string;
  readonly createdAt: string;
}

export interface PaginatedResult<T> {
  readonly data: T[];
  readonly totalCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export interface AdminRepository {
  getDashboardStats(): Promise<DashboardStats>;
  getRecentSkills(limit: number): Promise<RecentSkill[]>;
  getRecentMembers(limit: number): Promise<RecentMember[]>;
  getMembers(page: number, pageSize: number, search?: string, currentUserId?: string): Promise<PaginatedResult<MemberRow>>;
  getMemberById(id: string): Promise<MemberRow | null>;
  getSkills(page: number, pageSize: number): Promise<PaginatedResult<SkillRow>>;
  getFeedbacks(page: number, pageSize: number): Promise<PaginatedResult<FeedbackRow>>;
  getAllRoles(): Promise<Role[]>;
  updateMemberRole(memberId: string, roleId: string): Promise<void>;
  getAdminCount(): Promise<number>;
  getMemberRole(memberId: string): Promise<string | null>;
  getPermissionsByRole(roleId: string): Promise<Permission[]>;
}
