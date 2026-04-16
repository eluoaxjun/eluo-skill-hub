import type { ISkillDetailRepository } from './ports';
import type { GetTemplateDownloadResult } from '../domain/types';

const TIER_LEVEL: Record<string, number> = {
  general: 1,
  senior: 2,
  executive: 3,
};

export class GetTemplateDownloadUrlUseCase {
  constructor(private readonly repository: ISkillDetailRepository) {}

  async execute(
    userId: string,
    skillId: string,
    filePath: string,
    fileName: string,
    bucket: string,
  ): Promise<GetTemplateDownloadResult> {
    const userInfo = await this.repository.getUserRoleAndTier(userId);

    // admin은 항상 허용
    if (userInfo?.roleName === 'admin') {
      const signedUrl = await this.repository.getTemplateSignedUrl(filePath, bucket);
      return { success: true, signedUrl, fileName };
    }

    // viewer는 항상 차단
    if (userInfo?.roleName === 'viewer') {
      return {
        success: false,
        error: '템플릿 다운로드는 뷰어 역할에서 사용할 수 없습니다. 관리자에게 권한 변경을 요청하세요.',
        blockedReason: 'viewer',
      };
    }

    // user 역할: 등급(tier) 비교
    const userTierLevel = TIER_LEVEL[userInfo?.downloadTier ?? 'general'] ?? 1;
    const skillMinTier = await this.repository.getSkillMinTier(skillId);
    const skillTierLevel = TIER_LEVEL[skillMinTier] ?? 1;

    if (userTierLevel < skillTierLevel) {
      return {
        success: false,
        error: '해당 스킬을 다운로드할 권한이 없습니다. 관리자에게 권한 상향을 요청하세요.',
        blockedReason: 'insufficient_level',
      };
    }

    const signedUrl = await this.repository.getTemplateSignedUrl(filePath, bucket);
    return { success: true, signedUrl, fileName };
  }
}
