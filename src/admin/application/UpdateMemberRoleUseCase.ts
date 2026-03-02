import type { MemberRepository } from './ports/MemberRepository';

export interface UpdateMemberRoleInput {
  targetUserId: string;
  newRoleId: string;
  requestingUserId: string;
}

export class UpdateMemberRoleUseCase {
  constructor(private readonly repository: MemberRepository) {}

  async execute(input: UpdateMemberRoleInput): Promise<void> {
    if (input.requestingUserId === input.targetUserId) {
      throw new Error('자기 자신의 역할은 변경할 수 없습니다');
    }
    await this.repository.updateRole(input.targetUserId, input.newRoleId);
  }
}
