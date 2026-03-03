import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "./font/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "100 900",
});

const eluo = localFont({
  src: "./font/ELUOFACEVF.ttf",
  variable: "--font-eluo-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI 스킬 허브",
  description: "웹 에이전시의 워크플로우를 자동화하는 AI 스킬 마켓플레이스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${eluo.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
