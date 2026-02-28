import Link from 'next/link';
import { createSupabaseServerClient } from '@/shared/infrastructure/supabase/server';
import { SupabaseUserRepository } from '@/user-account/infrastructure/SupabaseUserRepository';
import { GetDashboardStatsUseCase } from '@/user-account/application/GetDashboardStatsUseCase';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/components/card';
import { Button } from '@/shared/ui/components/button';

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const userRepository = new SupabaseUserRepository(supabase);
  const getDashboardStatsUseCase = new GetDashboardStatsUseCase(userRepository);

  const result = await getDashboardStatsUseCase.execute();

  if (result.status === 'error') {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">
          데이터를 불러오는 데 실패했습니다.
        </p>
        <Button variant="outline" asChild>
          <Link href="/admin">다시 시도</Link>
        </Button>
      </div>
    );
  }

  const { stats } = result;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">대시보드</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>전체 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>관리자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.adminCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>일반 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.userCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Link */}
      <Button asChild>
        <Link href="/admin/users">사용자 관리</Link>
      </Button>
    </div>
  );
}
