'use server';

import { requireAdmin } from '@/shared/infrastructure/supabase/auth';
import { SupabaseAdminRepository } from '@/admin/infrastructure/supabase-admin-repository';
import { CreateSkillUseCase } from '@/admin/application/create-skill-use-case';
import { DeleteSkillUseCase } from '@/admin/application/delete-skill-use-case';
import { GetSkillByIdUseCase } from '@/admin/application/get-skill-by-id-use-case';
import { UpdateSkillUseCase } from '@/admin/application/update-skill-use-case';
import type { CategoryOption, CreateSkillResult, DeleteSkillResult, GetSkillResult, UpdateSkillResult, UploadedFileRef } from '@/admin/domain/types';
import { revalidatePath } from 'next/cache';

interface CreateSkillPayload {
  categoryId: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  isPublished: boolean;
  markdownFileRef?: UploadedFileRef;
  templateFileRefs?: UploadedFileRef[];
}

export async function createSkill(payload: CreateSkillPayload): Promise<CreateSkillResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: '권한이 없습니다' };
  }

  const { categoryId, title, description, version, tags, isPublished, markdownFileRef, templateFileRefs } = payload;

  // 유효성 검사
  const fieldErrors: Record<string, string> = {};
  if (!title.trim() || title.length > 100) {
    fieldErrors.title = title.trim() ? '제목은 100자 이하여야 합니다' : '제목을 입력해주세요';
  }
  if (!description.trim() || description.length > 500) {
    fieldErrors.description = description.trim() ? '설명은 500자 이하여야 합니다' : '설명을 입력해주세요';
  }
  if (!categoryId) {
    fieldErrors.categoryId = '카테고리를 선택해주세요';
  }

  if (markdownFileRef) {
    if (!markdownFileRef.originalName.endsWith('.md')) {
      fieldErrors.markdownFile = '.md 파일만 업로드 가능합니다';
    }
  }

  if (templateFileRefs) {
    for (const ref of templateFileRefs) {
      if (!ref.originalName.endsWith('.zip') && !ref.originalName.endsWith('.md')) {
        fieldErrors.templateFiles = '.zip 또는 .md 파일만 업로드 가능합니다';
        break;
      }
    }
    if (templateFileRefs.length > 5) {
      fieldErrors.templateFiles = '템플릿 파일은 최대 5개까지 업로드 가능합니다';
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: '입력값을 확인해주세요', fieldErrors };
  }

  const repository = new SupabaseAdminRepository();
  const useCase = new CreateSkillUseCase(repository);

  const result = await useCase.execute({
    categoryId,
    title,
    description,
    version,
    tags,
    isPublished,
    markdownFileRef,
    templateFileRefs: templateFileRefs && templateFileRefs.length > 0 ? templateFileRefs : undefined,
  });

  if (result.success) {
    revalidatePath('/admin/skills');
    revalidatePath('/admin');
  }

  return result;
}

export async function getSkillById(id: string): Promise<GetSkillResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: '관리자 권한이 필요합니다.' };
  }

  try {
    const repository = new SupabaseAdminRepository();
    const useCase = new GetSkillByIdUseCase(repository);
    return useCase.execute(id);
  } catch {
    return { success: false, error: '스킬 조회 중 오류가 발생했습니다.' };
  }
}

interface UpdateSkillPayload {
  skillId: string;
  categoryId: string;
  title: string;
  description: string;
  version: string;
  tags: string[];
  isPublished: boolean;
  markdownFileRef?: UploadedFileRef;
  removeMarkdown: boolean;
  templateFileRefs?: UploadedFileRef[];
  removedTemplateIds: string[];
}

export async function updateSkill(payload: UpdateSkillPayload): Promise<UpdateSkillResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: '관리자 권한이 필요합니다.' };
  }

  const {
    skillId, categoryId, title, description, version, tags,
    isPublished, markdownFileRef, removeMarkdown, templateFileRefs, removedTemplateIds,
  } = payload;

  if (!skillId) {
    return { success: false, error: '스킬 ID가 필요합니다.' };
  }

  // 유효성 검사
  const fieldErrors: Record<string, string> = {};
  if (!title.trim() || title.length > 100) {
    fieldErrors.title = title.trim() ? '제목은 100자 이하여야 합니다' : '제목을 입력해주세요';
  }
  if (!description.trim() || description.length > 500) {
    fieldErrors.description = description.trim() ? '설명은 500자 이하여야 합니다' : '설명을 입력해주세요';
  }
  if (!categoryId) {
    fieldErrors.categoryId = '카테고리를 선택해주세요';
  }

  if (markdownFileRef) {
    if (!markdownFileRef.originalName.endsWith('.md')) {
      fieldErrors.markdownFile = '.md 파일만 업로드 가능합니다';
    }
  }

  if (templateFileRefs) {
    for (const ref of templateFileRefs) {
      if (!ref.originalName.endsWith('.zip') && !ref.originalName.endsWith('.md')) {
        fieldErrors.templateFiles = '.zip 또는 .md 파일만 업로드 가능합니다';
        break;
      }
    }
    if (templateFileRefs.length > 5) {
      fieldErrors.templateFiles = '템플릿 파일은 최대 5개까지 업로드 가능합니다';
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: '입력값을 확인해주세요', fieldErrors };
  }

  const repository = new SupabaseAdminRepository();
  const useCase = new UpdateSkillUseCase(repository);

  const result = await useCase.execute({
    skillId,
    categoryId,
    title,
    description,
    version,
    tags,
    isPublished,
    markdownFileRef,
    removeMarkdown,
    templateFileRefs: templateFileRefs && templateFileRefs.length > 0 ? templateFileRefs : undefined,
    removedTemplateIds,
  });

  if (result.success) {
    revalidatePath('/admin/skills');
    revalidatePath('/admin');
  }

  return result;
}

export async function deleteSkill(skillId: string): Promise<DeleteSkillResult> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, error: '권한이 없습니다' };
  }

  if (!skillId) {
    return { success: false, error: '스킬 ID가 필요합니다' };
  }

  try {
    const repository = new SupabaseAdminRepository();
    const useCase = new DeleteSkillUseCase(repository);
    const result = await useCase.execute(skillId);

    if (result.success) {
      revalidatePath('/admin/skills');
      revalidatePath('/admin');
      }

    return result;
  } catch {
    return { success: false, error: '스킬 삭제 중 오류가 발생했습니다' };
  }
}

export async function getCategories(): Promise<{ success: true; categories: CategoryOption[] } | { success: false; error: string }> {
  try {
    const repository = new SupabaseAdminRepository();
    const categories = await repository.getCategories();
    return { success: true, categories };
  } catch {
    return { success: false, error: '카테고리를 불러오는데 실패했습니다' };
  }
}
