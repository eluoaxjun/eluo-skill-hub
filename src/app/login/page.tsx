import { AuthLayout } from "@/features/auth/AuthLayout";
import { LoginForm } from "@/features/auth/LoginForm";
import { login } from "./actions";

interface LoginPageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams;

  return (
    <AuthLayout title="로그인" subtitle="계정에 로그인하세요">
      <LoginForm action={login} redirectTo={redirectTo} />
    </AuthLayout>
  );
}
