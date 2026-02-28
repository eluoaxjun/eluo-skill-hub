/**
 * 관리자 사이드바 스킬 관리 네비게이션 항목 테스트 (Task 7.1)
 *
 * 테스트 대상:
 * - 관리자 레이아웃 사이드바에 "스킬 관리" 링크가 존재하는지 확인
 * - /admin/skills 경로로 이동하는지 확인
 *
 * Requirements: 1.1
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

// next/navigation 모킹
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Supabase server client 모킹
jest.mock('@/shared/infrastructure/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

// User repository 모킹
jest.mock('@/user-account/infrastructure/SupabaseUserRepository', () => ({
  SupabaseUserRepository: jest.fn(),
}));

// GetCurrentUserRoleUseCase 모킹
jest.mock('@/user-account/application/GetCurrentUserRoleUseCase', () => ({
  GetCurrentUserRoleUseCase: jest.fn(),
}));

// AccessDeniedView 모킹
jest.mock('@/app/(admin)/admin/_components/AccessDeniedView', () => {
  return function MockAccessDeniedView() {
    return <div data-testid="access-denied">Access Denied</div>;
  };
});

import { createSupabaseServerClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseUserRepository } from '@/user-account/infrastructure/SupabaseUserRepository';
import { GetCurrentUserRoleUseCase } from '@/user-account/application/GetCurrentUserRoleUseCase';
import AdminLayout from '@/app/(admin)/admin/layout';

const mockCreateSupabaseServerClient = createSupabaseServerClient as jest.MockedFunction<typeof createSupabaseServerClient>;
const MockSupabaseUserRepository = SupabaseUserRepository as jest.MockedClass<typeof SupabaseUserRepository>;
const MockGetCurrentUserRoleUseCase = GetCurrentUserRoleUseCase as jest.MockedClass<typeof GetCurrentUserRoleUseCase>;

describe('관리자 사이드바 스킬 관리 네비게이션', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Supabase client mock 설정
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'admin-user-id' } },
        }),
      },
    };
    mockCreateSupabaseServerClient.mockResolvedValue(mockSupabase as never);

    // User repository mock
    MockSupabaseUserRepository.mockImplementation(() => ({} as never));

    // GetCurrentUserRoleUseCase mock - 관리자 역할 반환
    MockGetCurrentUserRoleUseCase.mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue({
        status: 'success',
        role: { isAdmin: () => true },
      }),
    }) as never);
  });

  it('사이드바에 "스킬 관리" 링크가 표시되어야 한다', async () => {
    const layout = await AdminLayout({
      children: <div>테스트 콘텐츠</div>,
    });
    render(layout as React.ReactElement);

    const skillLink = screen.getByRole('link', { name: /스킬 관리/i });
    expect(skillLink).toBeInTheDocument();
  });

  it('"스킬 관리" 링크가 /admin/skills 경로를 가리켜야 한다', async () => {
    const layout = await AdminLayout({
      children: <div>테스트 콘텐츠</div>,
    });
    render(layout as React.ReactElement);

    const skillLink = screen.getByRole('link', { name: /스킬 관리/i });
    expect(skillLink).toHaveAttribute('href', '/admin/skills');
  });

  it('기존 네비게이션 항목(대시보드, 사용자 관리)도 유지되어야 한다', async () => {
    const layout = await AdminLayout({
      children: <div>테스트 콘텐츠</div>,
    });
    render(layout as React.ReactElement);

    expect(screen.getByRole('link', { name: /대시보드/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /사용자 관리/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /스킬 관리/i })).toBeInTheDocument();
  });
});
