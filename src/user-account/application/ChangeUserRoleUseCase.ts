import type { UserRepository } from '../domain/UserRepository';

export interface ChangeUserRoleInput {
  readonly adminUserId: string;
  readonly targetUserId: string;
  readonly newRoleId: string;
}

export type ChangeUserRoleErrorCode =
  | 'self_role_change'
  | 'user_not_found'
  | 'invalid_role'
  | 'update_failed';

export type ChangeUserRoleResult =
  | { status: 'success'; message: string }
  | { status: 'error'; code: ChangeUserRoleErrorCode; message: string };

export class ChangeUserRoleUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: ChangeUserRoleInput): Promise<ChangeUserRoleResult> {
    // 1. 자기 자신의 역할 변경 차단
    if (input.adminUserId === input.targetUserId) {
      return {
        status: 'error',
        code: 'self_role_change',
        message: '본인의 관리자 역할은 변경할 수 없습니다.',
      };
    }

    // 2. 역할 ID 유효성 검증: roles 테이블에서 해당 ID가 존재하는지 확인
    const allRoles = await this.userRepository.findAllRoles();
    const targetRole = allRoles.find((r) => r.id === input.newRoleId);

    if (!targetRole) {
      return {
        status: 'error',
        code: 'invalid_role',
        message: '유효하지 않은 역할 값입니다.',
      };
    }

    // 3. 대상 사용자 조회
    const profile = await this.userRepository.findById(input.targetUserId);
    if (profile === null) {
      return {
        status: 'error',
        code: 'user_not_found',
        message: '해당 사용자를 찾을 수 없습니다.',
      };
    }

    // 4. Aggregate Root를 통한 역할 변경
    profile.changeRole(targetRole);

    // 5. 리포지토리에 저장
    try {
      await this.userRepository.update(profile);
    } catch {
      return {
        status: 'error',
        code: 'update_failed',
        message: '역할 변경에 실패했습니다.',
      };
    }

    // 6. 성공 결과 반환
    return {
      status: 'success',
      message: `사용자 역할이 '${targetRole.toString()}'(으)로 변경되었습니다.`,
    };
  }
}
