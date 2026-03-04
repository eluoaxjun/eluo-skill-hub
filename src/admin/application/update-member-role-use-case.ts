import type { AdminRepository } from '@/admin/domain/types';

interface UpdateMemberRoleInput {
  currentUserId: string;
  memberId: string;
  roleId: string;
}

export class UpdateMemberRoleUseCase {
  constructor(private readonly repository: AdminRepository) {}

  async execute({ currentUserId, memberId, roleId }: UpdateMemberRoleInput): Promise<void> {
    if (currentUserId === memberId) {
      throw new Error('자기 자신의 역할은 변경할 수 없습니다');
    }

    const roles = await this.repository.getAllRoles();
    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole) {
      throw new Error('존재하지 않는 역할입니다');
    }

    const currentRole = await this.repository.getMemberRole(memberId);
    if (!currentRole) {
      throw new Error('존재하지 않는 회원입니다');
    }

    const adminRole = roles.find((r) => r.name === 'admin');
    if (adminRole && currentRole === 'admin' && targetRole.name !== 'admin') {
      const adminCount = await this.repository.getAdminCount();
      if (adminCount <= 1) {
        throw new Error('최소 1명의 관리자가 필요합니다');
      }
    }

    await this.repository.updateMemberRole(memberId, roleId);
  }
}
