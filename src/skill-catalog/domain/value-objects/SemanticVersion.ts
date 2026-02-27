import { ValueObject } from '@/shared/domain/types/ValueObject';
import { Result, ok, err, SkillCatalogError } from '../errors';

const SEMVER_REGEX = /^(\d+)\.(\d+)\.(\d+)$/;

export class SemanticVersion extends ValueObject<{
  major: number;
  minor: number;
  patch: number;
}> {
  private constructor(major: number, minor: number, patch: number) {
    super({ major, minor, patch });
  }

  static fromString(
    version: string,
  ): Result<SemanticVersion, SkillCatalogError> {
    const match = version.match(SEMVER_REGEX);
    if (!match) {
      return err({
        type: 'INVALID_SEMANTIC_VERSION',
        message: `유효하지 않은 시맨틱 버전 형식입니다: ${version}. major.minor.patch 형식이어야 합니다.`,
      });
    }

    const major = Number(match[1]);
    const minor = Number(match[2]);
    const patch = Number(match[3]);

    if (major < 0 || minor < 0 || patch < 0) {
      return err({
        type: 'INVALID_SEMANTIC_VERSION',
        message: `버전 숫자는 음수일 수 없습니다: ${version}`,
      });
    }

    return ok(new SemanticVersion(major, minor, patch));
  }

  get major(): number {
    return this.props.major;
  }

  get minor(): number {
    return this.props.minor;
  }

  get patch(): number {
    return this.props.patch;
  }

  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
}
