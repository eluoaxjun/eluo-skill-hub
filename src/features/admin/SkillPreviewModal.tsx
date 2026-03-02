'use client';

import React, { useState, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { ManagedSkillRow } from './SkillTable';

interface SkillPreviewModalProps {
  isOpen: boolean;
  skill: ManagedSkillRow | null;
  onClose: () => void;
  getMarkdown: (markdownFilePath: string) => Promise<{ content: string } | { error: string }>;
}

export function SkillPreviewModal({ isOpen, skill, onClose, getMarkdown }: SkillPreviewModalProps) {
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !skill) return;

    setMarkdownContent(null);
    setLoadError(null);
    setIsLoading(true);

    const path = skill.markdownFilePath;
    if (!path) {
      setLoadError('마크다운 파일 경로가 없습니다.');
      setIsLoading(false);
      return;
    }

    getMarkdown(path)
      .then((result) => {
        if ('content' in result) {
          setMarkdownContent(result.content);
        } else {
          setLoadError(result.error);
        }
      })
      .catch(() => {
        setLoadError('마크다운을 불러오는 데 실패했습니다.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, skill, getMarkdown]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !skill) return null;

  function formatDate(date: Date): string {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200">
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold text-slate-900">{skill.title}</h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                {skill.categoryName}
              </span>
              <span data-testid="skill-created-at" className="text-xs text-slate-500">
                {formatDate(skill.createdAt)}
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="닫기"
            className="text-slate-400 hover:text-slate-600 transition-colors"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div
          data-testid="markdown-preview-section"
          className="flex-1 overflow-y-auto p-6"
        >
          {isLoading && (
            <div data-testid="markdown-loading" className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!isLoading && loadError && (
            <p className="text-red-500 text-sm">{loadError}</p>
          )}
          {!isLoading && markdownContent && (
            <MarkdownRenderer content={markdownContent} />
          )}
        </div>
      </div>
    </div>
  );
}
