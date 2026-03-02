import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const baseConfig: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/src/__tests__/e2e/"],
};

// ESM 패키지(react-markdown 등)를 Jest가 트랜스폼할 수 있도록 비동기 방식으로 오버라이드
export default async () => {
  const config = await createJestConfig(baseConfig)();
  // react-markdown 생태계(ESM 전용) + sonner를 Jest가 트랜스폼하도록 설정
  // 접두사 매칭 사용 (예: hast.* → hast-util-to-jsx-runtime 포함)
  config.transformIgnorePatterns = [
    "/node_modules/(?!(react-markdown|remark.*|rehype.*|unified|bail|is-plain-obj|trough|vfile.*|unist.*|mdast.*|micromark.*|ccount|comma-separated-tokens|decode-named-character-reference|devlop|escape-string-regexp|estree.*|hast.*|html-url-attributes|is-alphabetical|is-alphanumerical|is-decimal|is-hexadecimal|is-unicode-alphabetical|longest-streak|lowlight|markdown-table|property-information|space-separated-tokens|stringify-entities|trim-lines|zwitch|sonner)/)",
  ];
  return config;
};
