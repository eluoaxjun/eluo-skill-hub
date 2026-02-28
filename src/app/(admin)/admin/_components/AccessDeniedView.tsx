import Link from 'next/link';
import { Button } from '@/shared/ui/components/button';

/**
 * 비관리자가 /admin에 접근했을 때 표시되는 접근 불가 안내 컴포넌트.
 * 순수 프레젠테이션 컴포넌트로 외부 상태 의존 없이 동작한다.
 */
export default function AccessDeniedView() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-bold">접근 권한이 없습니다</h1>
        <p className="text-muted-foreground">
          관리자만 접근할 수 있는 페이지입니다.
        </p>
        <Button variant="outline" asChild>
          <Link href="/">메인으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  );
}
