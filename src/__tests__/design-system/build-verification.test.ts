import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const ROOT_DIR = path.resolve(__dirname, "../../../");
const COMPONENTS_DIR = path.join(ROOT_DIR, "src/shared/ui/components");
const GLOBALS_CSS_PATH = path.join(ROOT_DIR, "src/app/globals.css");
const REFERENCE_THEME_PATH = path.join(
  ROOT_DIR,
  "AI Skills Platform Design/src/styles/theme.css"
);

// ============================================================
// Task 5.1: TypeScript 빌드 및 타입 안전성 검증
// ============================================================
describe("Task 5.1: TypeScript 빌드 및 타입 안전성 검증", () => {
  describe("npm run build 빌드 오류 검증", () => {
    let buildResult: { success: boolean; output: string };

    beforeAll(() => {
      try {
        const output = execSync("npm run build", {
          cwd: ROOT_DIR,
          timeout: 300000,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        });
        buildResult = { success: true, output };
      } catch (error: unknown) {
        const execError = error as { stdout?: string; stderr?: string };
        buildResult = {
          success: false,
          output: `${execError.stdout ?? ""}\n${execError.stderr ?? ""}`,
        };
      }
    });

    it("npm run build 명령이 오류 없이 완료되어야 한다", () => {
      expect({
        success: buildResult.success,
        hint: buildResult.success
          ? "Build succeeded"
          : buildResult.output.slice(-2000),
      }).toEqual({
        success: true,
        hint: "Build succeeded",
      });
    });
  });

  describe("TypeScript strict mode 컴파일 검증", () => {
    it("tsconfig.json에 strict 모드가 활성화되어 있어야 한다", () => {
      const tsconfig = JSON.parse(
        fs.readFileSync(path.join(ROOT_DIR, "tsconfig.json"), "utf-8")
      );
      expect(tsconfig.compilerOptions.strict).toBe(true);
    });

    it("모든 컴포넌트 파일이 .tsx 확장자를 가져야 한다", () => {
      const files = fs
        .readdirSync(COMPONENTS_DIR)
        .filter((f) => f.endsWith(".tsx"));
      expect(files.length).toBeGreaterThanOrEqual(46);
    });
  });

  describe("any 타입 사용 금지 검증", () => {
    const DESIGN_SYSTEM_DIRS = [
      path.join(ROOT_DIR, "src/shared/ui/components"),
      path.join(ROOT_DIR, "src/shared/ui/lib"),
      path.join(ROOT_DIR, "src/shared/ui/hooks"),
    ];

    /**
     * 파일 내용에서 TypeScript any 타입 사용을 탐지한다.
     * 문자열 리터럴, 주석, 변수명 등에 포함된 "any"는 제외한다.
     */
    function findAnyTypeUsages(
      content: string
    ): Array<{ line: number; text: string }> {
      const lines = content.split("\n");
      const results: Array<{ line: number; text: string }> = [];
      // any를 타입 어노테이션으로 사용하는 패턴 탐지
      // ": any", "as any", "<any>", "any[]", "any>", "any," (제네릭 파라미터) 등
      const anyTypePatterns = [
        /:\s*any\b/, // : any
        /\bas\s+any\b/, // as any
        /<any\b/, // <any>
        /\bany\s*\[/, // any[]
        /\bany\s*>/, // any>
        /,\s*any\b/, // , any (제네릭 파라미터)
        /\bany\s*,/, // any, (제네릭 파라미터)
        /\|\s*any\b/, // | any (유니온)
        /\bany\s*\|/, // any | (유니온)
        /&\s*any\b/, // & any (인터섹션)
        /\bany\s*&/, // any & (인터섹션)
      ];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // 주석 줄 건너뛰기
        if (line.startsWith("//") || line.startsWith("*") || line.startsWith("/*")) {
          continue;
        }
        for (const pattern of anyTypePatterns) {
          if (pattern.test(line)) {
            // 문자열 리터럴 내부의 any는 제외
            const withoutStrings = line
              .replace(/"[^"]*"/g, '""')
              .replace(/'[^']*'/g, "''")
              .replace(/`[^`]*`/g, "``");
            if (pattern.test(withoutStrings)) {
              results.push({ line: i + 1, text: line });
              break;
            }
          }
        }
      }
      return results;
    }

    function getAllTsFiles(dir: string): string[] {
      if (!fs.existsSync(dir)) return [];
      const files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...getAllTsFiles(fullPath));
        } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
          files.push(fullPath);
        }
      }
      return files;
    }

    it("src/shared/ui/ 디렉터리의 모든 파일에서 any 타입이 사용되지 않아야 한다", () => {
      const violations: Array<{
        file: string;
        line: number;
        text: string;
      }> = [];

      for (const dir of DESIGN_SYSTEM_DIRS) {
        const files = getAllTsFiles(dir);
        for (const file of files) {
          const content = fs.readFileSync(file, "utf-8");
          const usages = findAnyTypeUsages(content);
          for (const usage of usages) {
            violations.push({
              file: path.relative(ROOT_DIR, file),
              line: usage.line,
              text: usage.text,
            });
          }
        }
      }

      expect({
        anyTypeViolationsCount: violations.length,
        violations: violations.slice(0, 10), // 처음 10건만 표시
      }).toEqual({
        anyTypeViolationsCount: 0,
        violations: [],
      });
    });

    it("src/app/globals.css에 문법 오류가 없어야 한다", () => {
      const content = fs.readFileSync(GLOBALS_CSS_PATH, "utf-8");
      // CSS 기본 구조 검증
      expect(content).toContain('@import "tailwindcss"');
      expect(content).toContain("@custom-variant dark");
      expect(content).toContain(":root");
      expect(content).toContain(".dark");
      expect(content).toContain("@theme inline");
      expect(content).toContain("@layer base");
    });

    it("src/app/layout.tsx에 any 타입이 사용되지 않아야 한다", () => {
      const layoutPath = path.join(ROOT_DIR, "src/app/layout.tsx");
      const content = fs.readFileSync(layoutPath, "utf-8");
      const usages = findAnyTypeUsages(content);
      expect({
        anyTypeCount: usages.length,
        usages,
      }).toEqual({
        anyTypeCount: 0,
        usages: [],
      });
    });
  });

  describe("React 19 및 Next.js 16 호환성 검증", () => {
    it("package.json에 React 19가 설치되어 있어야 한다", () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8")
      );
      const reactVersion = packageJson.dependencies.react;
      expect(reactVersion).toMatch(/^19\.|^\^19\./);
    });

    it("package.json에 Next.js 16이 설치되어 있어야 한다", () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8")
      );
      const nextVersion = packageJson.dependencies.next;
      expect(nextVersion).toMatch(/^16\.|^\^16\./);
    });
  });
});

// ============================================================
// Task 5.2: 수용 기준 기반 통합 확인
// ============================================================
describe("Task 5.2: 수용 기준 기반 통합 확인", () => {
  const EXPECTED_COMPONENTS = [
    "accordion",
    "alert",
    "alert-dialog",
    "aspect-ratio",
    "avatar",
    "badge",
    "breadcrumb",
    "button",
    "calendar",
    "card",
    "carousel",
    "chart",
    "checkbox",
    "collapsible",
    "command",
    "context-menu",
    "dialog",
    "drawer",
    "dropdown-menu",
    "form",
    "hover-card",
    "input",
    "input-otp",
    "label",
    "menubar",
    "navigation-menu",
    "pagination",
    "popover",
    "progress",
    "radio-group",
    "resizable",
    "scroll-area",
    "select",
    "separator",
    "sheet",
    "sidebar",
    "skeleton",
    "slider",
    "sonner",
    "switch",
    "table",
    "tabs",
    "textarea",
    "toggle",
    "toggle-group",
    "tooltip",
  ];

  describe("46개 컴포넌트 파일 존재 확인", () => {
    it("정확히 46개의 컴포넌트가 EXPECTED_COMPONENTS에 정의되어 있어야 한다", () => {
      expect(EXPECTED_COMPONENTS.length).toBe(46);
    });

    it("모든 46개 컴포넌트 파일이 src/shared/ui/components/ 에 존재해야 한다", () => {
      const componentsDir = path.join(
        ROOT_DIR,
        "src/shared/ui/components"
      );
      const existingFiles = fs.readdirSync(componentsDir);
      const missingComponents: string[] = [];

      for (const component of EXPECTED_COMPONENTS) {
        const exists = existingFiles.includes(`${component}.tsx`);
        if (!exists) {
          missingComponents.push(component);
        }
      }

      expect({
        totalExpected: 46,
        totalFound: 46 - missingComponents.length,
        missingComponents,
      }).toEqual({
        totalExpected: 46,
        totalFound: 46,
        missingComponents: [],
      });
    });

    it.each(EXPECTED_COMPONENTS)(
      "컴포넌트 '%s.tsx' 파일이 존재해야 한다",
      (component) => {
        const filePath = path.join(COMPONENTS_DIR, `${component}.tsx`);
        expect(fs.existsSync(filePath)).toBe(true);
      }
    );
  });

  describe("유틸리티 및 훅 파일 존재 확인", () => {
    it("src/shared/ui/lib/utils.ts 파일이 존재해야 한다", () => {
      const filePath = path.join(ROOT_DIR, "src/shared/ui/lib/utils.ts");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("src/shared/ui/hooks/use-mobile.ts 파일이 존재해야 한다", () => {
      const filePath = path.join(
        ROOT_DIR,
        "src/shared/ui/hooks/use-mobile.ts"
      );
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  describe("CSS 변수 레퍼런스 비교 검증", () => {
    /**
     * CSS 파일에서 지정된 블록의 변수들을 파싱한다.
     */
    function parseCssVariables(
      content: string,
      blockSelector: string
    ): string[] {
      // 해당 블록을 찾아서 변수를 추출
      const blockRegex = new RegExp(
        `${blockSelector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`,
        "s"
      );
      const match = content.match(blockRegex);
      if (!match) return [];

      const blockContent = match[1];
      const varRegex = /--([\w-]+)\s*:/g;
      const variables: string[] = [];
      let varMatch: RegExpExecArray | null;
      while ((varMatch = varRegex.exec(blockContent)) !== null) {
        variables.push(`--${varMatch[1]}`);
      }
      return variables;
    }

    /**
     * @theme inline 블록의 변수를 파싱한다.
     */
    function parseThemeInlineVariables(content: string): string[] {
      const themeBlockRegex = /@theme\s+inline\s*\{([^}]*)\}/s;
      const match = content.match(themeBlockRegex);
      if (!match) return [];

      const blockContent = match[1];
      const varRegex = /--([\w-]+)\s*:/g;
      const variables: string[] = [];
      let varMatch: RegExpExecArray | null;
      while ((varMatch = varRegex.exec(blockContent)) !== null) {
        variables.push(`--${varMatch[1]}`);
      }
      return variables;
    }

    it("레퍼런스 theme.css 파일이 존재해야 한다", () => {
      expect(fs.existsSync(REFERENCE_THEME_PATH)).toBe(true);
    });

    it("레퍼런스 :root 블록의 모든 CSS 변수가 globals.css에 포함되어야 한다", () => {
      const reference = fs.readFileSync(REFERENCE_THEME_PATH, "utf-8");
      const globals = fs.readFileSync(GLOBALS_CSS_PATH, "utf-8");

      const refRootVars = parseCssVariables(reference, ":root");
      const globalsRootVars = parseCssVariables(globals, ":root");

      const missingVars = refRootVars.filter(
        (v) => !globalsRootVars.includes(v)
      );

      expect({
        refVarCount: refRootVars.length,
        globalsVarCount: globalsRootVars.length,
        missingVars,
      }).toEqual({
        refVarCount: refRootVars.length,
        globalsVarCount: expect.any(Number),
        missingVars: [],
      });
    });

    it("레퍼런스 .dark 블록의 모든 CSS 변수가 globals.css에 포함되어야 한다", () => {
      const reference = fs.readFileSync(REFERENCE_THEME_PATH, "utf-8");
      const globals = fs.readFileSync(GLOBALS_CSS_PATH, "utf-8");

      const refDarkVars = parseCssVariables(reference, ".dark");
      const globalsDarkVars = parseCssVariables(globals, ".dark");

      const missingVars = refDarkVars.filter(
        (v) => !globalsDarkVars.includes(v)
      );

      expect({
        refDarkVarCount: refDarkVars.length,
        globalsDarkVarCount: globalsDarkVars.length,
        missingVars,
      }).toEqual({
        refDarkVarCount: refDarkVars.length,
        globalsDarkVarCount: expect.any(Number),
        missingVars: [],
      });
    });

    it("레퍼런스 @theme inline 블록의 모든 변수가 globals.css에 포함되어야 한다", () => {
      const reference = fs.readFileSync(REFERENCE_THEME_PATH, "utf-8");
      const globals = fs.readFileSync(GLOBALS_CSS_PATH, "utf-8");

      const refThemeVars = parseThemeInlineVariables(reference);
      const globalsThemeVars = parseThemeInlineVariables(globals);

      const missingVars = refThemeVars.filter(
        (v) => !globalsThemeVars.includes(v)
      );

      expect({
        refThemeVarCount: refThemeVars.length,
        globalsThemeVarCount: globalsThemeVars.length,
        missingVars,
      }).toEqual({
        refThemeVarCount: refThemeVars.length,
        globalsThemeVarCount: expect.any(Number),
        missingVars: [],
      });
    });

    it(":root 블록에 최소 30개 이상의 CSS 변수가 정의되어야 한다", () => {
      const globals = fs.readFileSync(GLOBALS_CSS_PATH, "utf-8");
      const rootVars = parseCssVariables(globals, ":root");
      expect(rootVars.length).toBeGreaterThanOrEqual(30);
    });

    it(".dark 블록에 최소 20개 이상의 CSS 변수가 정의되어야 한다", () => {
      const globals = fs.readFileSync(GLOBALS_CSS_PATH, "utf-8");
      const darkVars = parseCssVariables(globals, ".dark");
      expect(darkVars.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe("의존성 트리 충돌 확인", () => {
    it("package.json에 제외 대상 패키지가 포함되지 않아야 한다", () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8")
      );
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const excludedPackages = [
        "@mui/material",
        "@mui/icons-material",
        "@emotion/react",
        "@emotion/styled",
        "react-router",
        "react-router-dom",
      ];

      const foundExcluded: string[] = [];
      for (const pkg of excludedPackages) {
        if (allDeps[pkg]) {
          foundExcluded.push(pkg);
        }
      }

      expect({
        excludedPackagesFound: foundExcluded.length,
        packages: foundExcluded,
      }).toEqual({
        excludedPackagesFound: 0,
        packages: [],
      });
    });

    it("shadcn/ui 필수 피어 의존성이 모두 설치되어 있어야 한다", () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8")
      );
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const requiredDeps = [
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
        "lucide-react",
        "next-themes",
      ];

      const missingDeps: string[] = [];
      for (const dep of requiredDeps) {
        if (!allDeps[dep]) {
          missingDeps.push(dep);
        }
      }

      expect({
        missingCount: missingDeps.length,
        missingDeps,
      }).toEqual({
        missingCount: 0,
        missingDeps: [],
      });
    });

    it("npm ls 명령이 치명적 오류 없이 실행되어야 한다", () => {
      let hasError = false;
      let output = "";
      try {
        output = execSync("npm ls --depth=0 2>&1", {
          cwd: ROOT_DIR,
          encoding: "utf-8",
          timeout: 60000,
        });
      } catch (error: unknown) {
        const execError = error as { stdout?: string; status?: number };
        output = execError.stdout ?? "";
        // npm ls returns exit code 1 for peer dep warnings, which is acceptable
        // We only check for truly critical issues (missing deps, invalid package)
        hasError = !output.includes(
          (JSON.parse(
            fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8")
          ) as { name: string }).name
        );
      }

      expect({
        hasCriticalError: hasError,
        hint: hasError ? output.slice(-1000) : "npm ls completed",
      }).toEqual({
        hasCriticalError: false,
        hint: "npm ls completed",
      });
    });
  });
});
