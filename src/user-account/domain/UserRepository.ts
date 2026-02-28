import type { UserProfile } from './UserProfile';
import type { UserRole } from './UserRole';

export interface DashboardStats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
}

export interface UserRepository {
  findById(id: string): Promise<UserProfile | null>;
  update(profile: UserProfile): Promise<void>;
  findByEmail(email: string): Promise<UserProfile | null>;
  findAll(): Promise<ReadonlyArray<UserProfile>>;
  getDashboardStats(): Promise<DashboardStats>;
  findAllRoles(): Promise<ReadonlyArray<UserRole>>;
}
