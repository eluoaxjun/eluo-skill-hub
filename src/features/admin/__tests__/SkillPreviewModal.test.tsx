import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillPreviewModal } from '../SkillPreviewModal';

jest.mock('../MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => (
    <div data-testid="mock-markdown-renderer">{content}</div>
  ),
}));
import type { ManagedSkillRow } from '../SkillTable';

const mockSkill: ManagedSkillRow = {
  id: 'skill-001',
  title: '기획 자동화',
  categoryId: 'cat-001',
  categoryName: '기획',
  markdownFilePath: 'author-id/skill-001.md',
  status: 'active',
  createdAt: new Date('2026-03-01'),
};

const mockGetMarkdown = jest.fn().mockResolvedValue({ content: '# 기획 자동화\n\n설명 내용입니다.' });

describe('SkillPreviewModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('모달이 열렸을 때 스킬명이 표시된다', async () => {
    render(
      <SkillPreviewModal
        isOpen={true}
        skill={mockSkill}
        onClose={jest.fn()}
        getMarkdown={mockGetMarkdown}
      />
    );
    expect(screen.getByText('기획 자동화')).toBeTruthy();
  });

  it('모달이 열렸을 때 카테고리가 표시된다', () => {
    render(
      <SkillPreviewModal
        isOpen={true}
        skill={mockSkill}
        onClose={jest.fn()}
        getMarkdown={mockGetMarkdown}
      />
    );
    expect(screen.getByText('기획')).toBeTruthy();
  });

  it('모달이 열렸을 때 등록일이 표시된다', () => {
    render(
      <SkillPreviewModal
        isOpen={true}
        skill={mockSkill}
        onClose={jest.fn()}
        getMarkdown={mockGetMarkdown}
      />
    );
    expect(screen.getByTestId('skill-created-at')).toBeTruthy();
  });

  it('마크다운 미리보기 섹션이 표시된다', () => {
    render(
      <SkillPreviewModal
        isOpen={true}
        skill={mockSkill}
        onClose={jest.fn()}
        getMarkdown={mockGetMarkdown}
      />
    );
    expect(screen.getByTestId('markdown-preview-section')).toBeTruthy();
  });

  it('마크다운 로딩 중 스피너 또는 로딩 상태가 표시된다', () => {
    render(
      <SkillPreviewModal
        isOpen={true}
        skill={mockSkill}
        onClose={jest.fn()}
        getMarkdown={mockGetMarkdown}
      />
    );
    expect(screen.getByTestId('markdown-loading')).toBeTruthy();
  });

  it('ESC 키 누를 시 onClose가 호출된다', async () => {
    const onClose = jest.fn();
    render(
      <SkillPreviewModal
        isOpen={true}
        skill={mockSkill}
        onClose={onClose}
        getMarkdown={mockGetMarkdown}
      />
    );

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
    const onClose = jest.fn();
    render(
      <SkillPreviewModal
        isOpen={true}
        skill={mockSkill}
        onClose={onClose}
        getMarkdown={mockGetMarkdown}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /닫기/ });
    await userEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('isOpen이 false이면 렌더링되지 않는다', () => {
    render(
      <SkillPreviewModal
        isOpen={false}
        skill={mockSkill}
        onClose={jest.fn()}
        getMarkdown={mockGetMarkdown}
      />
    );
    expect(screen.queryByText('기획 자동화')).toBeNull();
  });

  it('skill이 null이면 렌더링되지 않는다', () => {
    render(
      <SkillPreviewModal
        isOpen={true}
        skill={null}
        onClose={jest.fn()}
        getMarkdown={mockGetMarkdown}
      />
    );
    expect(screen.queryByTestId('markdown-preview-section')).toBeNull();
  });
});
