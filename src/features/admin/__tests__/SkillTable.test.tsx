import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillTable } from '../SkillTable';
import type { ManagedSkillRow } from '../SkillTable';

const mockSkills: ManagedSkillRow[] = [
  {
    id: 'skill-001',
    title: '기획 자동화',
    categoryId: 'cat-001',
    categoryName: '기획',
    markdownFilePath: 'author/skill-001.md',
    status: 'active',
    createdAt: new Date('2026-03-01'),
  },
  {
    id: 'skill-002',
    title: '디자인 스킬',
    categoryId: 'cat-002',
    categoryName: '디자인',
    markdownFilePath: null,
    status: 'inactive',
    createdAt: new Date('2026-03-02'),
  },
];

describe('SkillTable', () => {
  it('스킬 목록이 테이블 행으로 렌더링된다', () => {
    render(<SkillTable skills={mockSkills} onRowClick={jest.fn()} />);
    expect(screen.getByText('기획 자동화')).toBeTruthy();
    expect(screen.getByText('디자인 스킬')).toBeTruthy();
  });

  it('컬럼 헤더(스킬명, 카테고리, 등록일, 상태)가 표시된다', () => {
    render(<SkillTable skills={mockSkills} onRowClick={jest.fn()} />);
    expect(screen.getByText('스킬명')).toBeTruthy();
    expect(screen.getByText('카테고리')).toBeTruthy();
    expect(screen.getByText('등록일')).toBeTruthy();
    expect(screen.getByText('상태')).toBeTruthy();
  });

  it('카테고리명(categoryName)이 테이블 셀에 표시된다', () => {
    render(<SkillTable skills={mockSkills} onRowClick={jest.fn()} />);
    expect(screen.getByText('기획')).toBeTruthy();
    expect(screen.getByText('디자인')).toBeTruthy();
  });

  it('active 상태 스킬에 활성 배지가 표시된다', () => {
    render(<SkillTable skills={mockSkills} onRowClick={jest.fn()} />);
    const badges = screen.getAllByTestId('status-badge');
    const activeBadge = badges.find((b) => b.textContent === '활성');
    expect(activeBadge).toBeTruthy();
    expect(activeBadge?.className).toContain('green');
  });

  it('inactive 상태 스킬에 비활성 배지가 표시된다', () => {
    render(<SkillTable skills={mockSkills} onRowClick={jest.fn()} />);
    const badges = screen.getAllByTestId('status-badge');
    const inactiveBadge = badges.find((b) => b.textContent === '비활성');
    expect(inactiveBadge).toBeTruthy();
    expect(inactiveBadge?.className).toContain('gray');
  });

  it('행 클릭 시 onRowClick이 해당 스킬 데이터와 함께 호출된다', async () => {
    const onRowClick = jest.fn();
    render(<SkillTable skills={mockSkills} onRowClick={onRowClick} />);

    await userEvent.click(screen.getByText('기획 자동화'));

    expect(onRowClick).toHaveBeenCalledWith(mockSkills[0]);
  });

  it('빈 목록일 때 "등록된 스킬이 없습니다" 메시지가 표시된다', () => {
    render(<SkillTable skills={[]} onRowClick={jest.fn()} />);
    expect(screen.getByText('등록된 스킬이 없습니다')).toBeTruthy();
  });
});
