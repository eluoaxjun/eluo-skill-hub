import { Entity } from '@/shared/domain/types/Entity';
import { SkillId } from '../value-objects/SkillId';
import { SemanticVersion } from '../value-objects/SemanticVersion';
import { Result, ok, err, SkillCatalogError } from '../errors';

interface SkillVersionProps {
  skillId: SkillId;
  version: SemanticVersion;
  changelog: string;
  downloadUrl: string;
  isLatest: boolean;
  createdAt: Date;
}

export class SkillVersion extends Entity<SkillId> {
  private props: SkillVersionProps;

  private constructor(id: SkillId, props: SkillVersionProps) {
    super(id);
    this.props = props;
  }

  static create(params: {
    skillId: SkillId;
    version: string;
    changelog: string;
    downloadUrl: string;
  }): Result<SkillVersion, SkillCatalogError> {
    const versionResult = SemanticVersion.fromString(params.version);
    if (!versionResult.ok) return versionResult;

    const id = SkillId.generate();
    return ok(
      new SkillVersion(id, {
        skillId: params.skillId,
        version: versionResult.value,
        changelog: params.changelog,
        downloadUrl: params.downloadUrl,
        isLatest: false,
        createdAt: new Date(),
      }),
    );
  }

  static reconstruct(
    id: SkillId,
    props: {
      skillId: SkillId;
      version: SemanticVersion;
      changelog: string;
      downloadUrl: string;
      isLatest: boolean;
      createdAt: Date;
    },
  ): SkillVersion {
    return new SkillVersion(id, { ...props });
  }

  markAsLatest(): void {
    this.props.isLatest = true;
  }

  unmarkAsLatest(): void {
    this.props.isLatest = false;
  }

  get skillId(): SkillId { return this.props.skillId; }
  get version(): SemanticVersion { return this.props.version; }
  get changelog(): string { return this.props.changelog; }
  get downloadUrl(): string { return this.props.downloadUrl; }
  get isLatest(): boolean { return this.props.isLatest; }
  get createdAt(): Date { return this.props.createdAt; }
}
