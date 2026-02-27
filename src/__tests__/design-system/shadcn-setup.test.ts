import * as fs from "fs";
import * as path from "path";

const ROOT_DIR = path.resolve(__dirname, "../../../");

describe("Task 3.1: components.json 설정 및 shadcn/ui 초기화", () => {
  let componentsJson: Record<string, unknown>;

  beforeAll(() => {
    const filePath = path.join(ROOT_DIR, "components.json");
    expect(fs.existsSync(filePath)).toBe(true);
    componentsJson = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  });

  it("components.json 파일이 프로젝트 루트에 존재해야 한다", () => {
    expect(fs.existsSync(path.join(ROOT_DIR, "components.json"))).toBe(true);
  });

  it("$schema가 shadcn/ui 스키마 URL로 설정되어야 한다", () => {
    expect(componentsJson.$schema).toBe(
      "https://ui.shadcn.com/schema.json"
    );
  });

  it("style이 new-york으로 설정되어야 한다", () => {
    expect(componentsJson.style).toBe("new-york");
  });

  it("rsc가 true로 설정되어야 한다", () => {
    expect(componentsJson.rsc).toBe(true);
  });

  it("tsx가 true로 설정되어야 한다", () => {
    expect(componentsJson.tsx).toBe(true);
  });

  it("tailwind.config가 빈 문자열로 설정되어야 한다 (Tailwind CSS v4 config-free)", () => {
    const tailwind = componentsJson.tailwind as Record<string, unknown>;
    expect(tailwind.config).toBe("");
  });

  it("tailwind.css가 src/app/globals.css로 설정되어야 한다", () => {
    const tailwind = componentsJson.tailwind as Record<string, unknown>;
    expect(tailwind.css).toBe("src/app/globals.css");
  });

  it("tailwind.baseColor가 zinc로 설정되어야 한다", () => {
    const tailwind = componentsJson.tailwind as Record<string, unknown>;
    expect(tailwind.baseColor).toBe("zinc");
  });

  it("tailwind.cssVariables가 true로 설정되어야 한다", () => {
    const tailwind = componentsJson.tailwind as Record<string, unknown>;
    expect(tailwind.cssVariables).toBe(true);
  });

  it("aliases.components가 @/shared/ui/components로 설정되어야 한다", () => {
    const aliases = componentsJson.aliases as Record<string, string>;
    expect(aliases.components).toBe("@/shared/ui/components");
  });

  it("aliases.ui가 @/shared/ui/components로 설정되어야 한다", () => {
    const aliases = componentsJson.aliases as Record<string, string>;
    expect(aliases.ui).toBe("@/shared/ui/components");
  });

  it("aliases.hooks가 @/shared/ui/hooks로 설정되어야 한다", () => {
    const aliases = componentsJson.aliases as Record<string, string>;
    expect(aliases.hooks).toBe("@/shared/ui/hooks");
  });

  it("aliases.lib가 @/shared/ui/lib로 설정되어야 한다", () => {
    const aliases = componentsJson.aliases as Record<string, string>;
    expect(aliases.lib).toBe("@/shared/ui/lib");
  });

  it("aliases.utils가 @/shared/ui/lib/utils로 설정되어야 한다", () => {
    const aliases = componentsJson.aliases as Record<string, string>;
    expect(aliases.utils).toBe("@/shared/ui/lib/utils");
  });

  it("globals.css가 Task 1에서 구성한 디자인 토큰을 유지해야 한다", () => {
    const globalsCss = fs.readFileSync(
      path.join(ROOT_DIR, "src/app/globals.css"),
      "utf-8"
    );
    expect(globalsCss).toContain('@import "tailwindcss"');
    expect(globalsCss).toContain('@import "tw-animate-css"');
    expect(globalsCss).toContain("@custom-variant dark");
    expect(globalsCss).toContain(":root");
    expect(globalsCss).toContain(".dark");
    expect(globalsCss).toContain("@theme inline");
    expect(globalsCss).toContain("@layer base");
    expect(globalsCss).toContain("--background");
    expect(globalsCss).toContain("--foreground");
    expect(globalsCss).toContain("--primary");
    expect(globalsCss).toContain("--sidebar");
    expect(globalsCss).toContain("--font-weight-medium");
    expect(globalsCss).toContain("Noto Sans KR");
  });
});

describe("Task 3.2: cn() 유틸리티 함수 생성 및 검증", () => {
  it("src/shared/ui/lib/utils.ts 파일이 존재해야 한다", () => {
    const filePath = path.join(
      ROOT_DIR,
      "src/shared/ui/lib/utils.ts"
    );
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("cn() 함수가 export되어야 한다", () => {
    const filePath = path.join(
      ROOT_DIR,
      "src/shared/ui/lib/utils.ts"
    );
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("export function cn");
  });

  it("cn() 함수가 clsx를 import해야 한다", () => {
    const filePath = path.join(
      ROOT_DIR,
      "src/shared/ui/lib/utils.ts"
    );
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain('from "clsx"');
  });

  it("cn() 함수가 tailwind-merge를 import해야 한다", () => {
    const filePath = path.join(
      ROOT_DIR,
      "src/shared/ui/lib/utils.ts"
    );
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain('from "tailwind-merge"');
  });

  it("cn() 함수가 정상적으로 동작해야 한다", async () => {
    const { cn } = await import("@/shared/ui/lib/utils");
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("flex", "items-center")).toBe("flex items-center");
    expect(cn(undefined, null, false, "flex")).toBe("flex");
    expect(cn("bg-red-500", "bg-blue-500", "text-white")).toBe(
      "bg-blue-500 text-white"
    );
  });

  it("clsx 패키지가 설치되어 있어야 한다", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8")
    );
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    expect(allDeps).toHaveProperty("clsx");
  });

  it("tailwind-merge 패키지가 설치되어 있어야 한다", () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8")
    );
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    expect(allDeps).toHaveProperty("tailwind-merge");
  });
});

describe("Task 3.3: 46개 프리미티브 컴포넌트 일괄 설치", () => {
  const COMPONENTS_DIR = path.join(
    ROOT_DIR,
    "src/shared/ui/components"
  );

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

  it("46개 컴포넌트 파일이 모두 src/shared/ui/components/ 에 존재해야 한다", () => {
    const existingFiles = fs.readdirSync(COMPONENTS_DIR);
    for (const component of EXPECTED_COMPONENTS) {
      const exists = existingFiles.some(
        (f) => f === `${component}.tsx` || f === component
      );
      expect({
        component,
        exists,
      }).toEqual({
        component,
        exists: true,
      });
    }
  });

  it("컴포넌트 파일 이름이 kebab-case를 따라야 한다", () => {
    const files = fs
      .readdirSync(COMPONENTS_DIR)
      .filter((f) => f.endsWith(".tsx"));
    const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*\.tsx$/;
    for (const file of files) {
      expect({
        file,
        isKebabCase: kebabCaseRegex.test(file),
      }).toEqual({
        file,
        isKebabCase: true,
      });
    }
  });

  it("use-mobile 훅이 src/shared/ui/hooks/ 에 존재해야 한다", () => {
    const hooksDir = path.join(ROOT_DIR, "src/shared/ui/hooks");
    expect(fs.existsSync(hooksDir)).toBe(true);
    const files = fs.readdirSync(hooksDir);
    expect(files.some((f) => f.includes("use-mobile"))).toBe(true);
  });

  it("theme-provider.tsx가 유지되어야 한다", () => {
    const filePath = path.join(COMPONENTS_DIR, "theme-provider.tsx");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("use client");
    expect(content).toContain("next-themes");
  });

  it("모든 컴포넌트가 cn() 함수를 @/shared/ui/lib/utils에서 import해야 한다 (cn을 사용하는 컴포넌트에 한함)", () => {
    const files = fs
      .readdirSync(COMPONENTS_DIR)
      .filter((f) => f.endsWith(".tsx"));

    for (const file of files) {
      const filePath = path.join(COMPONENTS_DIR, file);
      const content = fs.readFileSync(filePath, "utf-8");
      if (content.includes("cn(")) {
        expect({
          file,
          importsCorrectly:
            content.includes('@/shared/ui/lib/utils') ||
            content.includes("../lib/utils"),
        }).toEqual({
          file,
          importsCorrectly: true,
        });
      }
    }
  });

  it("클라이언트 컴포넌트에 'use client' 지시문이 포함되어야 한다", () => {
    const clientComponents = [
      "accordion",
      "alert-dialog",
      "avatar",
      "calendar",
      "carousel",
      "checkbox",
      "collapsible",
      "command",
      "context-menu",
      "dialog",
      "drawer",
      "dropdown-menu",
      "hover-card",
      "input-otp",
      "menubar",
      "navigation-menu",
      "popover",
      "progress",
      "radio-group",
      "resizable",
      "scroll-area",
      "select",
      "sheet",
      "sidebar",
      "slider",
      "sonner",
      "switch",
      "tabs",
      "toggle",
      "toggle-group",
      "tooltip",
    ];

    for (const component of clientComponents) {
      const filePath = path.join(COMPONENTS_DIR, `${component}.tsx`);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        // Only check if the file uses React hooks or browser APIs
        const needsClient =
          content.includes("useState") ||
          content.includes("useEffect") ||
          content.includes("useRef") ||
          content.includes("useContext") ||
          content.includes("React.forwardRef") ||
          content.includes("forwardRef");

        if (needsClient) {
          expect({
            component,
            hasUseClient: content.startsWith('"use client"'),
          }).toEqual({
            component,
            hasUseClient: true,
          });
        }
      }
    }
  });
});
