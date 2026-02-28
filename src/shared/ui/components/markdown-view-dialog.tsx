"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly skillId: string;
  readonly skillTitle: string;
  readonly markdownFilePath: string;
}

export function MarkdownViewDialog({
  open,
  onOpenChange,
  skillId,
  skillTitle,
}: MarkdownViewDialogProps) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !skillId) {
      return;
    }

    let cancelled = false;

    async function fetchMarkdown() {
      setIsLoading(true);
      setError(null);
      setContent("");

      try {
        const response = await fetch(`/api/skills/${skillId}/markdown`);

        if (cancelled) return;

        if (!response.ok) {
          setError("마크다운 파일을 불러올 수 없습니다.");
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (cancelled) return;

        setContent(data.content);
      } catch {
        if (!cancelled) {
          setError("마크다운 파일을 불러올 수 없습니다.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchMarkdown();

    return () => {
      cancelled = true;
    };
  }, [open, skillId]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        data-testid="markdown-dialog-backdrop"
      />

      {/* Dialog */}
      <div
        className="relative z-50 w-full max-w-3xl max-h-[80vh] bg-background rounded-lg shadow-lg border border-border overflow-hidden flex flex-col mx-4"
        role="dialog"
        aria-label={skillTitle}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {skillTitle}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="닫기"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <span className="text-muted-foreground">로딩 중...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <span className="text-destructive">{error}</span>
            </div>
          )}

          {!isLoading && !error && content && (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
