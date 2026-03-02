import { AuthLayout } from "@/features/auth/AuthLayout";
import { SignupForm } from "@/features/auth/SignupForm";
import { signup } from "./actions";

export default function SignupPage() {
  return (
    <AuthLayout title="회원가입" subtitle="계정을 만들어 시작하세요">
      <SignupForm action={signup} />
    </AuthLayout>
  );
}
