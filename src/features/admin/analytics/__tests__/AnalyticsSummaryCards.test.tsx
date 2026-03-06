import React from 'react';
import { render, screen } from '@testing-library/react';
import AnalyticsSummaryCards from '../AnalyticsSummaryCards';
import type { AnalyticsOverview } from '@/event-log/domain/types';

const mockOverview: AnalyticsOverview = {
  activeUsers: 56,
  skillViews: 789,
  templateDownloads: 12,
  activeUsersChange: -5.0,
  skillViewsChange: 0,
  templateDownloadsChange: 25.3,
};

describe('AnalyticsSummaryCards', () => {
  it('3개 카드가 모두 렌더링된다', () => {
    render(<AnalyticsSummaryCards overview={mockOverview} />);

    expect(screen.getByText('활성 사용자')).toBeInTheDocument();
    expect(screen.getByText('스킬 조회')).toBeInTheDocument();
    expect(screen.getByText('템플릿 다운로드')).toBeInTheDocument();
  });

  it('값이 올바르게 표시된다', () => {
    render(<AnalyticsSummaryCards overview={mockOverview} />);

    expect(screen.getByText('56')).toBeInTheDocument();
    expect(screen.getByText('789')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('음수 증감률은 빨간색으로 표시된다', () => {
    render(<AnalyticsSummaryCards overview={mockOverview} />);

    const negativeChange = screen.getByText('-5%');
    expect(negativeChange).toHaveClass('text-red-500');
  });

  it('양수 증감률은 초록색으로 표시된다', () => {
    render(<AnalyticsSummaryCards overview={mockOverview} />);

    const positiveChange = screen.getByText('+25.3%');
    expect(positiveChange).toHaveClass('text-emerald-600');
  });

  it('0% 증감률은 중립 색상으로 표시된다', () => {
    render(<AnalyticsSummaryCards overview={mockOverview} />);

    const zeroChanges = screen.getAllByText('0%');
    expect(zeroChanges.length).toBeGreaterThan(0);
    zeroChanges.forEach((el) => {
      expect(el).toHaveClass('text-[#000080]/40');
    });
  });
});
