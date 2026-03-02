import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminSkillsPage } from '../AdminSkillsPage';
import type { ManagedSkillRow } from '../SkillTable';

// MarkdownRenderer mock (react-markdown ESM 패키지 mock 처리)
jest.mock('../MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => (
    <div data-testid="mock-markdown-renderer">{content}</div>
  ),
}));

// sonner mock
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Toaster: () => null,
}));

const mockSkills: ManagedSkillRow[] = [
  {
    id: 'skill-001',
    title: '기획 자동화',
    categoryId: 'cat-001',
    categoryName: '기획',
    markdownFilePath: 'author-id/skill-001.md',
    status: 'active',
    createdAt: new Date('2026-03-01'),
  },
];

const mockGetMarkdown = jest.fn().mockResolvedValue({ content: '# 테스트' });

describe('AdminSkillsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('SkillTable이 스킬 목록과 함께 렌더링된다', () => {
    render(
      <AdminSkillsPage
        initialSkills={mockSkills}
        getMarkdown={mockGetMarkdown}
      />
    );
    expect(screen.getByText('기획 자동화')).toBeTruthy();
  });

  it('스킬 행 클릭 시 SkillPreviewModal이 열린다', async () => {
    render(
      <AdminSkillsPage
        initialSkills={mockSkills}
        getMarkdown={mockGetMarkdown}
      />
    );

    await userEvent.click(screen.getByText('기획 자동화'));

    expect(screen.getByRole('dialog')).toBeTruthy();
  });
});
