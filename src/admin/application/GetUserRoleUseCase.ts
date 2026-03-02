import type { AdminRepository } from "./ports/AdminRepository";

interface UserRoleResult {
  role: string | null;
  isAdmin: boolean;
}

export class GetUserRoleUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(userId: string): Promise<UserRoleResult> {
    const role = await this.adminRepository.getUserRole(userId);
    return {
      role,
      isAdmin: role === "admin",
    };
  }
}
