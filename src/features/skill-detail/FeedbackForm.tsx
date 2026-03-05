'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { useSubmitFeedback } from '@/skill-detail/hooks/use-skill-detail-queries';
import StarRating from './StarRating';

interface FeedbackFormProps {
  skillId: string;
}

export default function FeedbackForm({ skillId }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { mutate: submitFeedback, isPending: submitting } = useSubmitFeedback(skillId);

  function handleSubmit() {
    if (rating === 0) {
      toast.warning('별점을 선택해주세요.');
      return;
    }

    submitFeedback(
      { skillId, rating, comment: comment.trim() || undefined },
      {
        onSuccess: (result) => {
          if (result.success) {
            setRating(0);
            setComment('');
            toast.success('피드백이 등록되었습니다.');
          } else {
            toast.error(result.error);
          }
        },
      },
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-white shadow-sm">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <span className="text-sm font-bold text-[#1a1a1a]">사용자 평점</span>
          <StarRating value={rating} onChange={setRating} disabled={submitting} />
        </div>
        <div className="relative">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            className="w-full bg-white border border-slate-200 rounded-xl p-5 text-[15px] focus:ring-4 focus:ring-[#00007F]/5 focus:border-[#00007F] transition-all resize-none min-h-[120px] text-[#1a1a1a] placeholder:text-slate-400"
            placeholder="사용 후기를 자유롭게 남겨주세요..."
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#FEFE01] text-[#00007F] text-sm font-bold py-3 px-8 rounded-full flex items-center gap-2 border border-[#00007F]/5 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              피드백 제출
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
