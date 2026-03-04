'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import type { CategoryOption, CreateSkillInput } from '@/admin/domain/types';
import { createSkill, getCategories } from '@/app/admin/skills/actions';
import TemplateFileUpload from './TemplateFileUpload';

interface SkillAddFormProps {
  categories?: CategoryOption[];
  onDirtyChange?: (isDirty: boolean) => void;
  onRequestDraftSave?: (input: CreateSkillInput) => void;
}

interface FormState {
  icon: string;
  categoryId: string;
  title: string;
  description: string;
  isPublished: boolean;
}

const INITIAL_STATE: FormState = {
  icon: '',
  categoryId: '',
  title: '',
  description: '',
  isPublished: false,
};

const EMOJI_GROUPS = [
  { label: '작업·개발', emojis: ['⚡', '🤖', '🛠️', '💻', '🔧', '🔌', '📡', '🧩'] },
  { label: '분석·데이터', emojis: ['📊', '📈', '📉', '🔍', '🧪', '💡', '📋', '🗂️'] },
  { label: '문서·글쓰기', emojis: ['📝', '📄', '✍️', '📚', '🗒️', '💬', '📣', '🌐'] },
  { label: '디자인·창작', emojis: ['🎨', '✏️', '🖼️', '🎭', '🎬', '📸', '🖌️', '✨'] },
];

function isDirtyState(state: FormState, markdownFile: File | undefined, templateFiles: File[]): boolean {
  return (
    state.icon !== '' ||
    state.categoryId !== '' ||
    state.title !== '' ||
    state.description !== '' ||
    state.isPublished !== false ||
    markdownFile !== undefined ||
    templateFiles.length > 0
  );
}

interface FieldErrors {
  title?: string;
  description?: string;
  categoryId?: string;
  markdownFile?: string;
  templateFiles?: string;
}

export default function SkillAddForm({ categories: initialCategories, onDirtyChange, onRequestDraftSave }: SkillAddFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryOption[]>(initialCategories ?? []);
  const [categoriesLoading, setCategoriesLoading] = useState(!initialCategories);
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [markdownFile, setMarkdownFile] = useState<File | undefined>(undefined);
  const [templateFiles, setTemplateFiles] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleCloseEmojiPicker = useCallback((e: MouseEvent) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
      setShowEmojiPicker(false);
    }
  }, []);

  useEffect(() => {
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleCloseEmojiPicker);
    }
    return () => document.removeEventListener('mousedown', handleCloseEmojiPicker);
  }, [showEmojiPicker, handleCloseEmojiPicker]);

  useEffect(() => {
    if (initialCategories) return;
    getCategories().then((result) => {
      if (result.success) setCategories(result.categories);
      setCategoriesLoading(false);
    });
  }, [initialCategories]);

  const notifyDirty = (newForm: FormState, md: File | undefined, tmpl: File[]) => {
    onDirtyChange?.(isDirtyState(newForm, md, tmpl));
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    const newForm = { ...form, [key]: value };
    setForm(newForm);
    notifyDirty(newForm, markdownFile, templateFiles);
    if (fieldErrors[key as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleMarkdownFileChange = (file: File | undefined) => {
    setMarkdownFile(file);
    notifyDirty(form, file, templateFiles);
  };

  const handleTemplateFilesChange = (files: File[]) => {
    setTemplateFiles(files);
    notifyDirty(form, markdownFile, files);
  };

  const buildInput = (overridePublished?: boolean): CreateSkillInput => ({
    icon: form.icon,
    categoryId: form.categoryId,
    title: form.title,
    description: form.description,
    isPublished: overridePublished ?? form.isPublished,
    markdownFile,
    templateFiles: templateFiles.length > 0 ? templateFiles : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('icon', form.icon);
      formData.append('categoryId', form.categoryId);
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('isPublished', String(form.isPublished));
      if (markdownFile) formData.append('markdownFile', markdownFile);
      for (const f of templateFiles) formData.append('templateFiles', f);

      const result = await createSkill(formData);
      if (result.success) {
        toast.success('스킬이 저장되었습니다');
        router.back();
        router.refresh();
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors as FieldErrors);
        } else {
          toast.error(result.error);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 외부에서 임시저장 요청 시 호출
  const handleDraftSaveRequest = () => {
    onRequestDraftSave?.(buildInput(false));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 이모지 아이콘 */}
      <div className="space-y-1.5">
        <Label>아이콘 (이모지)</Label>
        <div className="flex items-center gap-3">
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#000080] flex items-center justify-center text-3xl transition-colors"
              onClick={() => setShowEmojiPicker((v) => !v)}
              title="이모지 선택"
            >
              {form.icon || '⚡'}
            </button>
            {showEmojiPicker && (
              <div className="absolute left-0 top-16 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-64">
                {EMOJI_GROUPS.map((group) => (
                  <div key={group.label} className="mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{group.label}</p>
                    <div className="flex flex-wrap gap-1">
                      {group.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className="w-8 h-8 text-xl rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                          onClick={() => {
                            updateField('icon', emoji);
                            setShowEmojiPicker(false);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 카테고리 */}
      <div className="space-y-1.5">
        <Label htmlFor="categoryId">카테고리 *</Label>
        <Select value={form.categoryId} onValueChange={(v) => updateField('categoryId', v)} disabled={categoriesLoading}>
          <SelectTrigger id="categoryId" className={fieldErrors.categoryId ? 'border-red-400' : ''}>
            <SelectValue placeholder={categoriesLoading ? '로딩 중...' : '카테고리 선택'} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldErrors.categoryId && (
          <p className="text-xs text-red-500">{fieldErrors.categoryId}</p>
        )}
      </div>

      {/* 제목 */}
      <div className="space-y-1.5">
        <Label htmlFor="title">제목 * <span className="text-slate-400 font-normal">({form.title.length}/100)</span></Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="스킬 제목을 입력해주세요"
          maxLength={100}
          className={fieldErrors.title ? 'border-red-400' : ''}
        />
        {fieldErrors.title && (
          <p className="text-xs text-red-500">{fieldErrors.title}</p>
        )}
      </div>

      {/* 설명 */}
      <div className="space-y-1.5">
        <Label htmlFor="description">설명 * <span className="text-slate-400 font-normal">({form.description.length}/500)</span></Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="스킬에 대한 간단한 설명을 입력해주세요"
          maxLength={500}
          rows={3}
          className={fieldErrors.description ? 'border-red-400' : ''}
        />
        {fieldErrors.description && (
          <p className="text-xs text-red-500">{fieldErrors.description}</p>
        )}
      </div>

      {/* 설명 마크다운 파일 */}
      <div className="space-y-1.5">
        <Label>설명 마크다운 파일 (.md, 최대 1MB)</Label>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <span className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:border-slate-400 transition-colors">
              파일 선택
            </span>
            <input
              type="file"
              accept=".md"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleMarkdownFileChange(file);
                if (file && !file.name.endsWith('.md')) {
                  setFieldErrors((prev) => ({ ...prev, markdownFile: '.md 파일만 업로드 가능합니다' }));
                } else if (file && file.size > 1048576) {
                  setFieldErrors((prev) => ({ ...prev, markdownFile: '파일 크기는 1MB 이하여야 합니다' }));
                } else {
                  setFieldErrors((prev) => ({ ...prev, markdownFile: undefined }));
                }
              }}
            />
          </label>
          {markdownFile && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>{markdownFile.name}</span>
              <button
                type="button"
                className="text-slate-400 hover:text-red-500"
                onClick={() => handleMarkdownFileChange(undefined)}
              >
                ×
              </button>
            </div>
          )}
        </div>
        {fieldErrors.markdownFile && (
          <p className="text-xs text-red-500">{fieldErrors.markdownFile}</p>
        )}
      </div>

      {/* 템플릿 파일 업로드 */}
      <div className="space-y-1.5">
        <Label>템플릿 파일 (.zip / .md, 각 100KB 이하, 최대 10개)</Label>
        <TemplateFileUpload
          files={templateFiles}
          onChange={handleTemplateFilesChange}
          error={fieldErrors.templateFiles}
        />
      </div>

      {/* 공개 여부 */}
      <div className="flex items-center justify-between py-3 border-t border-slate-100">
        <div>
          <p className="text-sm font-medium text-slate-900">공개 여부</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {form.isPublished ? '즉시 공개됩니다' : '초안으로 저장됩니다'}
          </p>
        </div>
        <Switch
          checked={form.isPublished}
          onCheckedChange={(v) => updateField('isPublished', v)}
          aria-label="공개 여부"
        />
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={handleDraftSaveRequest}
          disabled={isSubmitting}
        >
          임시저장
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-[#000080] hover:bg-[#000070] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
