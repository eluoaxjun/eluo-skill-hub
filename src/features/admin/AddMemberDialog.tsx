'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserPlus, X } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { createMember } from '@/app/admin/members/actions';
import type { Role } from '@/admin/domain/types';
import { DOWNLOAD_TIERS, ROLE_LABEL, TIER_LABEL } from '@/admin/domain/types';

interface AddMemberDialogProps {
  roles: Role[];
}

export default function AddMemberDialog({ roles }: AddMemberDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [downloadTier, setDownloadTier] = useState<'general' | 'senior' | 'executive'>('general');

  const userRole = roles.find((r) => r.name === 'user');
  const defaultRoleId = userRole?.id ?? roles[0]?.id ?? '';
  const effectiveRoleId = roleId || defaultRoleId;

  function close() {
    if (submitting) return;
    setOpen(false);
    setEmail('');
    setPassword('');
    setName('');
    setRoleId('');
    setDownloadTier('general');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createMember({
        email: email.trim(),
        password,
        name: name.trim(),
        roleId: effectiveRoleId,
        downloadTier,
      });
      if (result.success) {
        toast.success('회원이 등록되었습니다');
        setOpen(false);
        setEmail('');
        setPassword('');
        setName('');
        setRoleId('');
        setDownloadTier('general');
        router.refresh();
      } else {
        toast.error(result.error ?? '회원 등록에 실패했습니다');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-[#00007F] hover:brightness-110 text-white font-bold gap-2"
      >
        <UserPlus className="w-4 h-4" />
        회원 등록
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 127, 0.1)', backdropFilter: 'blur(12px)' }}
          onClick={close}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              aria-label="닫기"
            >
              <X size={18} />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-6">회원 등록</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">임시 비밀번호 (6자 이상)</Label>
                <Input
                  id="password"
                  type="text"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="최소 6자"
                />
              </div>
              <div>
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="홍길동"
                />
              </div>
              <div>
                <Label>역할</Label>
                <Select value={effectiveRoleId} onValueChange={setRoleId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {ROLE_LABEL[role.name] ?? role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>다운로드 등급</Label>
                <Select
                  value={downloadTier}
                  onValueChange={(v) => setDownloadTier(v as 'general' | 'senior' | 'executive')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOWNLOAD_TIERS.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {TIER_LABEL[tier]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-400 mt-1">
                  역할이 admin / viewer 인 경우 등급은 무시됩니다.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={close} disabled={submitting}>
                  취소
                </Button>
                <Button type="submit" disabled={submitting} className="bg-[#00007F] hover:brightness-110 text-white">
                  {submitting ? '등록 중...' : '등록'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
