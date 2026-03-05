import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// .env.test 파일에서 테스트 계정 정보 로드
dotenv.config({ path: path.resolve(__dirname, ".env.test") });

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const isProduction = baseURL.includes("vercel.app");

export default defineConfig({
  testDir: "./src/__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    // 1) 인증 setup (로그인 -> storageState 저장)
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    // 2) 인증이 필요한 테스트 (storageState 사용)
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
      testMatch: /.*\.auth\.spec\.ts/,
    },
    // 3) 인증이 필요 없는 테스트 (기존 테스트)
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: [/auth\.setup\.ts/, /.*\.auth\.spec\.ts/],
    },
  ],
  // 프로덕션 테스트 시에는 로컬 서버를 띄우지 않음
  ...(!isProduction && {
    webServer: {
      command: "npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
    },
  }),
});
