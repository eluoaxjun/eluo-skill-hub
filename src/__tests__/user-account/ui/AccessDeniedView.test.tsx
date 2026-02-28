/**
 * AccessDeniedView 컴포넌트 단위 테스트 (Task 5.2)
 *
 * 테스트 대상:
 * - 접근 불가 안내 메시지 렌더링
 * - 메인 페이지(/)로 돌아가는 링크 렌더링
 * - 순수 프레젠테이션 컴포넌트로 외부 상태 의존 없이 동작
 *
 * Requirements: 2.4, 2.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Next.js Link 모킹
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

import AccessDeniedView from '@/app/(admin)/admin/_components/AccessDeniedView';

describe('AccessDeniedView 컴포넌트', () => {
  describe('접근 불가 안내 메시지', () => {
    it('"접근 권한이 없습니다" 메시지를 표시해야 한다', () => {
      render(<AccessDeniedView />);

      expect(
        screen.getByText(/접근 권한이 없습니다/)
      ).toBeInTheDocument();
    });

    it('"관리자만 접근할 수 있는 페이지입니다" 안내 문구를 표시해야 한다', () => {
      render(<AccessDeniedView />);

      expect(
        screen.getByText(/관리자만 접근할 수 있는 페이지입니다/)
      ).toBeInTheDocument();
    });
  });

  describe('메인 페이지 링크', () => {
    it('메인 페이지(/)로 돌아가는 링크를 제공해야 한다', () => {
      render(<AccessDeniedView />);

      const mainLink = screen.getByRole('link', { name: /메인으로 돌아가기/i });
      expect(mainLink).toBeInTheDocument();
      expect(mainLink).toHaveAttribute('href', '/');
    });
  });
});
