'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';

interface SkillDeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillTitle: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function SkillDeleteConfirmDialog({
  open,
  onOpenChange,
  skillTitle,
  onConfirm,
  isDeleting,
}: SkillDeleteConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isDeleting) return;
        onOpenChange(isOpen);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>스킬 삭제</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                <span className="font-semibold text-slate-900">&ldquo;{skillTitle}&rdquo;</span> 스킬을 삭제하시겠습니까?
              </p>
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  이 스킬을 삭제하면 관련 피드백 및 통계 데이터도 함께 삭제되어 통계 분석에 영향을 미칩니다. 삭제된 데이터는 복구할 수 없습니다.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1" />
                삭제 중...
              </>
            ) : (
              '삭제'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
