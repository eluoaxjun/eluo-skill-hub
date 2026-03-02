import { redirect } from "next/navigation";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { VerifyCodeForm } from "@/features/auth/VerifyCodeForm";
import { verifyCode, resendCode } from "./actions";

interface VerifyCodePageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function VerifyCodePage({
  searchParams,
}: VerifyCodePageProps) {
  const { email } = await searchParams;
  if (!email) redirect("/signup");

  return (
    <AuthLayout title="이메일 인증" subtitle="인증 코드를 입력해주세요">
      <VerifyCodeForm
        email={email}
        verifyAction={verifyCode}
        resendAction={resendCode}
      />
    </AuthLayout>
  );
}
