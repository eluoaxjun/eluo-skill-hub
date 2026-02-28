/**
 * SkillTable 클라이언트 컴포넌트 단위 테스트 (Task 7.2)
 *
 * 테스트 대상:
 * - 스킬 목록을 테이블 형태로 표시
 * - 제목, 카테고리, 작성자 ID, 생성일 컬럼 표시
 * - 삭제 버튼 클릭 시 server action 호출
 * - 삭제 성공/실패 메시지 표시
 *
 * Requirements: 1.1, 5.5
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// deleteSkillAction 모킹
jest.mock('@/app/(admin)/admin/skills/actions', () => ({
  deleteSkillAction: jest.fn(),
}));

import SkillTable from '@/app/(admin)/admin/skills/SkillTable';
import { deleteSkillAction } from '@/app/(admin)/admin/skills/actions';

const mockDeleteSkillAction = deleteSkillAction as jest.MockedFunction<typeof deleteSkillAction>;

interface SkillRow {
  id: string;
  title: string;
  category: string;
  authorId: string;
  createdAt: string;
}

const mockSkills: SkillRow[] = [
  {
    id: 'skill-1',
    title: 'React 컴포넌트 자동 생성',
    category: '개발',
    authorId: 'user-1',
    createdAt: '2026-02-28T09:00:00.000Z',
  },
  {
    id: 'skill-2',
    title: '와이어프레임 생성기',
    category: '기획',
    authorId: 'user-2',
    createdAt: '2026-03-01T10:00:00.000Z',
  },
];

describe('SkillTable 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('테이블 헤더', () => {
    it('제목, 카테고리, 작성자, 생성일, 작업 컬럼 헤더를 표시해야 한다', () => {
      render(<SkillTable skills={mockSkills} />);

      expect(screen.getByText('제목')).toBeInTheDocument();
      expect(screen.getByText('카테고리')).toBeInTheDocument();
      expect(screen.getByText('작성자')).toBeInTheDocument();
      expect(screen.getByText('생성일')).toBeInTheDocument();
      expect(screen.getByText('작업')).toBeInTheDocument();
    });
  });

  describe('스킬 데이터 렌더링', () => {
    it('각 스킬의 제목을 표시해야 한다', () => {
      render(<SkillTable skills={mockSkills} />);

      expect(screen.getByText('React 컴포넌트 자동 생성')).toBeInTheDocument();
      expect(screen.getByText('와이어프레임 생성기')).toBeInTheDocument();
    });

    it('각 스킬의 카테고리를 표시해야 한다', () => {
      render(<SkillTable skills={mockSkills} />);

      expect(screen.getByText('개발')).toBeInTheDocument();
      expect(screen.getByText('기획')).toBeInTheDocument();
    });

    it('각 스킬의 작성자 ID를 표시해야 한다', () => {
      render(<SkillTable skills={mockSkills} />);

      expect(screen.getByText('user-1')).toBeInTheDocument();
      expect(screen.getByText('user-2')).toBeInTheDocument();
    });

    it('각 스킬의 생성일을 포맷팅하여 표시해야 한다', () => {
      render(<SkillTable skills={mockSkills} />);

      // Korean date format
      expect(screen.getByText('2026. 2. 28.')).toBeInTheDocument();
      expect(screen.getByText('2026. 3. 1.')).toBeInTheDocument();
    });

    it('빈 목록일 때 "등록된 스킬이 없습니다" 메시지를 표시해야 한다', () => {
      render(<SkillTable skills={[]} />);

      expect(screen.getByText(/등록된 스킬이 없습니다/)).toBeInTheDocument();
    });
  });

  describe('스킬 삭제', () => {
    it('각 행에 삭제 버튼이 있어야 한다', () => {
      render(<SkillTable skills={mockSkills} />);

      const deleteButtons = screen.getAllByRole('button', { name: /삭제/i });
      expect(deleteButtons).toHaveLength(2);
    });

    it('삭제 버튼 클릭 시 deleteSkillAction을 해당 스킬 ID로 호출해야 한다', async () => {
      mockDeleteSkillAction.mockResolvedValue({ status: 'success', message: '삭제되었습니다.' });

      render(<SkillTable skills={mockSkills} />);

      const deleteButtons = screen.getAllByRole('button', { name: /삭제/i });
      await userEvent.click(deleteButtons[0]);

      expect(mockDeleteSkillAction).toHaveBeenCalledWith('skill-1');
    });

    it('삭제 성공 시 성공 메시지를 표시해야 한다', async () => {
      mockDeleteSkillAction.mockResolvedValue({ status: 'success', message: '스킬이 삭제되었습니다.' });

      render(<SkillTable skills={mockSkills} />);

      const deleteButtons = screen.getAllByRole('button', { name: /삭제/i });
      await userEvent.click(deleteButtons[0]);

      expect(screen.getByText('스킬이 삭제되었습니다.')).toBeInTheDocument();
    });

    it('삭제 실패 시 오류 메시지를 표시해야 한다', async () => {
      mockDeleteSkillAction.mockResolvedValue({ status: 'error', message: '삭제에 실패했습니다.' });

      render(<SkillTable skills={mockSkills} />);

      const deleteButtons = screen.getAllByRole('button', { name: /삭제/i });
      await userEvent.click(deleteButtons[0]);

      expect(screen.getByText('삭제에 실패했습니다.')).toBeInTheDocument();
    });
  });
});
