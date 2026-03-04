'use client';

import { useRef } from 'react';
import { Paperclip, X } from 'lucide-react';

interface TemplateFileUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

const MAX_COUNT = 10;
const MAX_SIZE = 102400; // 100KB

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}KB`;
}

export default function TemplateFileUpload({ files, onChange, error }: TemplateFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const valid = selected.filter((f) => {
      if (!f.name.endsWith('.zip') && !f.name.endsWith('.md')) return false;
      if (f.size > MAX_SIZE) return false;
      return true;
    });
    const merged = [...files, ...valid].slice(0, MAX_COUNT);
    onChange(merged);
    // 동일 파일 재선택 가능하도록 초기화
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {files.map((file, i) => (
          <div
            key={`${file.name}-${i}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-700"
          >
            <Paperclip size={14} className="text-slate-400 shrink-0" />
            <span className="max-w-[160px] truncate">{file.name}</span>
            <span className="text-slate-400 shrink-0">({formatSize(file.size)})</span>
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="text-slate-400 hover:text-red-500 ml-1 shrink-0"
              aria-label={`${file.name} 삭제`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {files.length < MAX_COUNT && (
        <label className="cursor-pointer inline-flex">
          <span className="px-4 py-2 rounded-lg border border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:border-slate-500 hover:text-slate-700 transition-colors flex items-center gap-2">
            <Paperclip size={14} />
            파일 추가 ({files.length}/{MAX_COUNT})
          </span>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".zip,.md"
            className="hidden"
            onChange={handleAdd}
          />
        </label>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
