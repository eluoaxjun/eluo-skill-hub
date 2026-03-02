import type { MemberProfile } from '@/admin/domain/entities/MemberProfile';
import type { MemberRepository } from './ports/MemberRepository';

export interface GetAllMembersResult {
  members: MemberProfile[];
  roles: Array<{ id: string; name: string }>;
}

export class GetAllMembersUseCase {
  constructor(private readonly repository: MemberRepository) {}

  async execute(): Promise<GetAllMembersResult> {
    const [members, roles] = await Promise.all([
      this.repository.findAll(),
      this.repository.findAllRoles(),
    ]);
    return { members, roles };
  }
}
