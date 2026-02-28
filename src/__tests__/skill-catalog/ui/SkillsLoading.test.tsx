/**
 * 스킬 관리 페이지 로딩 컴포넌트 테스트 (Task 7.2)
 *
 * 테스트 대상:
 * - 로딩 중 안내 메시지 표시
 *
 * Requirements: 1.1
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import SkillsLoading from '@/app/(admin)/admin/skills/loading';

describe('SkillsLoading 컴포넌트', () => {
  it('로딩 중 안내 메시지를 표시해야 한다', () => {
    render(<SkillsLoading />);

    expect(screen.getByText(/스킬 목록을 불러오는 중/)).toBeInTheDocument();
  });
});
