'use client';

import { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import type { FeedbackReplyRow } from '@/admin/domain/types';
import { updateReplyAction, deleteReplyAction } from '@/app/admin/feedbacks/actions';

interface FeedbackRepliesProps {
  replies: FeedbackReplyRow[];
  loading: boolean;
  currentUserId: string | null;
  onReplyUpdated: () => void;
}

export default function FeedbackReplies({ replies, loading, currentUserId, onReplyUpdated }: FeedbackRepliesProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function startEdit(reply: FeedbackReplyRow) {
    setEditingId(reply.id);
    setEditContent(reply.content);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent('');
  }

  async function handleUpdate(replyId: string) {
    const trimmed = editContent.trim();
    if (!trimmed) {
      toast.warning('댓글 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateReplyAction(replyId, trimmed);
      if (result.success) {
        toast.success('댓글이 수정되었습니다.');
        setEditingId(null);
        setEditContent('');
        onReplyUpdated();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('댓글 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(replyId: string) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    setSubmitting(true);
    try {
      const result = await deleteReplyAction(replyId);
      if (result.success) {
        toast.success('댓글이 삭제되었습니다.');
        onReplyUpdated();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('댓글 삭제 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-4 text-sm text-[#000080]/40 animate-pulse">
        댓글을 불러오는 중...
      </div>
    );
  }

  if (replies.length === 0) {
    return (
      <div className="px-6 py-4 text-sm text-[#000080]/40">
        댓글이 없습니다
      </div>
    );
  }

  return (
    <div className="px-6 py-3 space-y-3">
      {replies.map((reply) => {
        const isOwner = currentUserId === reply.userId;
        const isEditing = editingId === reply.id;

        return (
          <div key={reply.id} className="flex gap-3 p-3 bg-[#000080]/3 rounded-lg">
            <div className="size-7 rounded-full bg-[#000080]/10 flex-shrink-0 flex items-center justify-center text-xs font-bold text-[#000080]/60">
              {reply.userName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#000080]/70">{reply.userName || '알 수 없음'}</span>
                <span className="text-xs text-[#000080]/40">
                  {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                </span>
                {isOwner && !isEditing && (
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => startEdit(reply)}
                      disabled={submitting}
                      className="p-1 rounded hover:bg-[#000080]/8 text-[#000080]/40 hover:text-[#000080]/70 transition-colors disabled:opacity-40"
                      title="수정"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => void handleDelete(reply.id)}
                      disabled={submitting}
                      className="p-1 rounded hover:bg-red-50 text-[#000080]/40 hover:text-red-500 transition-colors disabled:opacity-40"
                      title="삭제"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleUpdate(reply.id);
                      }
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    disabled={submitting}
                    className="flex-1 bg-white border border-[#000080]/10 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#000080]/10 focus:border-[#000080]/30 transition-all"
                    autoFocus
                  />
                  <button
                    onClick={() => void handleUpdate(reply.id)}
                    disabled={submitting || !editContent.trim()}
                    className="p-1.5 rounded-lg bg-[#000080] text-white hover:opacity-90 transition-opacity disabled:opacity-40"
                    title="저장"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={submitting}
                    className="p-1.5 rounded-lg border border-[#000080]/20 text-[#000080]/60 hover:bg-[#000080]/5 transition-colors disabled:opacity-40"
                    title="취소"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-sm text-[#000080]/70 break-words">{reply.content}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
