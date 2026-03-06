import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalyticsDateFilter from '../AnalyticsDateFilter';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams('preset=7d'),
}));

const defaultRange = {
  startDate: '2026-02-28T00:00:00.000Z',
  endDate: '2026-03-06T23:59:59.999Z',
};

describe('AnalyticsDateFilter', () => {
  beforeEach(() => jest.clearAllMocks());

  it('프리셋 버튼이 모두 렌더링된다', () => {
    render(<AnalyticsDateFilter range={defaultRange} />);

    expect(screen.getByText('오늘')).toBeInTheDocument();
    expect(screen.getByText('7일')).toBeInTheDocument();
    expect(screen.getByText('30일')).toBeInTheDocument();
    expect(screen.getByText('기간 선택')).toBeInTheDocument();
  });

  it('프리셋 버튼 클릭 시 URL이 업데이트된다', async () => {
    const user = userEvent.setup();
    render(<AnalyticsDateFilter range={defaultRange} />);

    await user.click(screen.getByText('30일'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('preset=30d'),
    );
  });

  it('오늘 프리셋 클릭 시 URL이 업데이트된다', async () => {
    const user = userEvent.setup();
    render(<AnalyticsDateFilter range={defaultRange} />);

    await user.click(screen.getByText('오늘'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('preset=today'),
    );
  });
});
