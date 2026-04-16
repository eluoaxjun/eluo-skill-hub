import type { Metadata } from "next";
import { LandingPage } from "@/features/root-page/LandingPage";

export const metadata: Metadata = {
  title: "ELUO XCIPE",
  description: "웹 에이전시의 워크플로우를 자동화하는 AI 스킬 마켓플레이스",
};

export default function Home() {
  return <LandingPage />;
}
