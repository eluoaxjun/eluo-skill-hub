export interface AdminRepository {
  getUserRole(userId: string): Promise<string | null>;
}
