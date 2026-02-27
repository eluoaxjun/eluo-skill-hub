import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/shared/ui/components/theme-provider";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eluo Skill Hub",
  description: "웹 에이전시 워크플로우 자동화 플러그인 마켓플레이스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className={`${notoSansKR.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
