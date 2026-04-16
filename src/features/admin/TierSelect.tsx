'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useUpdateMemberTier } from '@/admin/hooks/use-admin-mutations';
import { DOWNLOAD_TIERS, TIER_LABEL } from '@/admin/domain/types';
import type { DownloadTier } from '@/admin/domain/types';

interface TierSelectProps {
  memberId: string;
  currentTier: DownloadTier;
  /** admin / viewer 역할은 등급 무관이므로 disabled */
  disabled?: boolean;
}

export default function TierSelect({ memberId, currentTier, disabled = false }: TierSelectProps) {
  const { mutate: updateTier, isPending } = useUpdateMemberTier();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function handleChange(newTier: string) {
    if (newTier === currentTier) return;
    setFeedback(null);
    updateTier(
      { memberId, tier: newTier },
      {
        onSuccess: (result) => {
          if (result.success) {
            setFeedback({ type: 'success', message: '등급이 변경되었습니다' });
            setTimeout(() => setFeedback(null), 3000);
          } else {
            setFeedback({ type: 'error', message: result.error ?? '등급 변경에 실패했습니다' });
            setTimeout(() => setFeedback(null), 5000);
          }
        },
      },
    );
  }

  if (disabled) {
    return <span className="text-[10px] text-[#000080]/30">-</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <Select defaultValue={currentTier} onValueChange={handleChange} disabled={isPending}>
        <SelectTrigger className="h-8 w-28 text-xs border-[#000080]/20 text-[#000080]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DOWNLOAD_TIERS.map((tier) => (
            <SelectItem key={tier} value={tier} className="text-xs">
              {TIER_LABEL[tier]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {feedback && (
        <p className={`text-[10px] ${feedback.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}
