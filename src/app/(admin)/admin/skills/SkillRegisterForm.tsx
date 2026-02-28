'use client';

import { useRef, useState } from 'react';
import { registerSkillAction } from './actions';
import { Button } from '@/shared/ui/components/button';

const CATEGORIES = ['기획', '디자인', '퍼블리싱', '개발', 'QA'] as const;

export default function SkillRegisterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    const result = await registerSkillAction(formData);

    setLoading(false);

    if (result.status === 'success') {
      setMessage({ type: 'success', text: result.message });
      formRef.current?.reset();
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-lg font-semibold mb-4">스킬 등록</h2>
      {message && (
        <div
          role="alert"
          className={`mb-4 rounded p-3 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <span>{message.text}</span>
        </div>
      )}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="skill-title" className="block text-sm font-medium mb-1">
            제목
          </label>
          <input
            id="skill-title"
            name="title"
            type="text"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="스킬 제목을 입력하세요"
          />
        </div>
        <div>
          <label htmlFor="skill-category" className="block text-sm font-medium mb-1">
            카테고리
          </label>
          <select
            id="skill-category"
            name="category"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              카테고리 선택
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="skill-file" className="block text-sm font-medium mb-1">
            마크다운 파일
          </label>
          <input
            id="skill-file"
            name="file"
            type="file"
            accept=".md"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? '등록 중...' : '등록'}
        </Button>
      </form>
    </div>
  );
}
