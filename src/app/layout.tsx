import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github.css";

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSansKR = Noto_Sans_KR({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "AI 스킬 허브",
  description:
    "웹 에이전시의 워크플로우를 자동화하는 AI 스킬 마켓플레이스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${inter.variable} ${notoSansKR.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
