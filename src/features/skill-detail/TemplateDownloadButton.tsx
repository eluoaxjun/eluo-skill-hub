'use client';

import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useTemplateDownload } from '@/skill-detail/hooks/use-skill-detail-queries';
import type { SkillTemplateInfo } from '@/skill-detail/domain/types';

interface TemplateDownloadButtonProps {
  skillId: string;
  templates: SkillTemplateInfo[];
  isViewer: boolean;
}

export default function TemplateDownloadButton({
  skillId,
  templates,
  isViewer,
}: TemplateDownloadButtonProps) {
  const { mutate: download, isPending: downloading } = useTemplateDownload(skillId);
  const hasTemplates = templates.length > 0;

  function handleDownload() {
    if (!hasTemplates) return;

    if (isViewer) {
      toast.warning(
        '템플릿 다운로드는 뷰어 역할에서 사용할 수 없습니다. 관리자에게 권한 변경을 요청하세요.'
      );
      return;
    }

    download(templates, {
      onSuccess: (results) => {
        for (const result of results) {
          if (result.success) {
            const a = document.createElement('a');
            a.href = result.signedUrl;
            a.download = result.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            toast.error(result.error);
          }
        }
      },
    });
  }

  return (
    <button
      onClick={handleDownload}
      disabled={!hasTemplates || downloading}
      className={`w-full flex items-center justify-center gap-3 font-bold py-4 px-6 rounded-xl transition-all duration-200 ${
        hasTemplates
          ? 'bg-[#00007F] text-white shadow-lg shadow-[#00007F]/20 hover:scale-[1.02] hover:brightness-120 active:scale-[0.98]'
          : 'bg-[#00007F]/30 text-white/60 cursor-not-allowed'
      } ${downloading ? 'opacity-70 cursor-wait' : ''}`}
      style={{ boxShadow: hasTemplates ? 'inset 0 1px 1px rgba(255, 255, 255, 0.2)' : undefined }}
    >
      <Download className="w-6 h-6" />
      <span className="text-base">
        {downloading ? '다운로드 중...' : '템플릿 다운로드'}
      </span>
    </button>
  );
}
