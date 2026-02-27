import * as fs from "fs";
import * as path from "path";

const ROOT_DIR = path.resolve(__dirname, "../../../");

describe("Task 4: 제외 라이브러리 검증 및 의존성 정리", () => {
  let packageJson: Record<string, unknown>;
  let allDeps: Record<string, string>;

  beforeAll(() => {
    const filePath = path.join(ROOT_DIR, "package.json");
    expect(fs.existsSync(filePath)).toBe(true);
    packageJson = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    allDeps = {
      ...(packageJson.dependencies as Record<string, string>),
      ...(packageJson.devDependencies as Record<string, string>),
    };
  });

  describe("4.1: 제외 대상 패키지가 포함되지 않아야 한다", () => {
    const EXCLUDED_PACKAGES = [
      "@mui/material",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
      "react-router",
      "react-router-dom",
      "react-dnd",
      "react-dnd-html5-backend",
      "react-popper",
      "@popperjs/core",
      "react-slick",
      "react-responsive-masonry",
    ];

    it.each(EXCLUDED_PACKAGES)(
      "%s 패키지가 package.json에 포함되지 않아야 한다",
      (pkg) => {
        expect(allDeps).not.toHaveProperty(pkg);
      }
    );
  });

  describe("4.2: shadcn/ui 허용 의존성이 올바르게 설치되어 있어야 한다", () => {
    const REQUIRED_PACKAGES = [
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "lucide-react",
      "next-themes",
      "tw-animate-css",
      "sonner",
      "vaul",
      "cmdk",
      "embla-carousel-react",
      "input-otp",
      "react-day-picker",
      "date-fns",
      "react-resizable-panels",
      "recharts",
      "react-hook-form",
    ];

    it.each(REQUIRED_PACKAGES)(
      "%s 패키지가 package.json에 포함되어야 한다",
      (pkg) => {
        expect(allDeps).toHaveProperty(pkg);
      }
    );

    it("Radix UI 패키지가 설치되어 있어야 한다", () => {
      const hasRadixUI =
        Object.keys(allDeps).some((key) =>
          key.startsWith("@radix-ui/react-")
        ) || allDeps["radix-ui"] !== undefined;
      expect(hasRadixUI).toBe(true);
    });
  });

  describe("4.3: 경로 별칭이 올바르게 설정되어 있어야 한다", () => {
    let tsconfig: Record<string, unknown>;

    beforeAll(() => {
      const tsconfigPath = path.join(ROOT_DIR, "tsconfig.json");
      expect(fs.existsSync(tsconfigPath)).toBe(true);
      tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf-8"));
    });

    it("tsconfig.json에 @/* 경로 별칭이 ./src/*로 매핑되어야 한다", () => {
      const compilerOptions = tsconfig.compilerOptions as Record<
        string,
        unknown
      >;
      const paths = compilerOptions.paths as Record<string, string[]>;
      expect(paths).toHaveProperty("@/*");
      expect(paths["@/*"]).toContain("./src/*");
    });

    it("@/shared/ui/components/button 경로에 해당하는 파일이 존재해야 한다", () => {
      const buttonPath = path.join(
        ROOT_DIR,
        "src/shared/ui/components/button.tsx"
      );
      expect(fs.existsSync(buttonPath)).toBe(true);
    });

    it("@/shared/ui/lib/utils 경로에 해당하는 파일이 존재해야 한다", () => {
      const utilsPath = path.join(
        ROOT_DIR,
        "src/shared/ui/lib/utils.ts"
      );
      expect(fs.existsSync(utilsPath)).toBe(true);
    });

    it("@/shared/ui/hooks 경로에 해당하는 디렉터리가 존재해야 한다", () => {
      const hooksDir = path.join(ROOT_DIR, "src/shared/ui/hooks");
      expect(fs.existsSync(hooksDir)).toBe(true);
      expect(fs.statSync(hooksDir).isDirectory()).toBe(true);
    });

    it("components.json의 aliases가 tsconfig.json paths와 일관되어야 한다", () => {
      const componentsJsonPath = path.join(ROOT_DIR, "components.json");
      const componentsJson = JSON.parse(
        fs.readFileSync(componentsJsonPath, "utf-8")
      );
      const aliases = componentsJson.aliases as Record<string, string>;

      // All aliases use @/ prefix which maps to ./src/ via tsconfig
      expect(aliases.components).toMatch(/^@\//);
      expect(aliases.ui).toMatch(/^@\//);
      expect(aliases.hooks).toMatch(/^@\//);
      expect(aliases.lib).toMatch(/^@\//);
      expect(aliases.utils).toMatch(/^@\//);

      // Verify actual file/directory existence for each alias path
      const aliasPathMap: Record<string, string> = {
        components: aliases.components.replace("@/", "src/"),
        ui: aliases.ui.replace("@/", "src/"),
        hooks: aliases.hooks.replace("@/", "src/"),
        lib: aliases.lib.replace("@/", "src/"),
      };

      for (const [key, relativePath] of Object.entries(aliasPathMap)) {
        const fullPath = path.join(ROOT_DIR, relativePath);
        expect({
          alias: key,
          exists: fs.existsSync(fullPath),
        }).toEqual({
          alias: key,
          exists: true,
        });
      }

      // Verify utils file specifically
      const utilsRelativePath = aliases.utils.replace("@/", "src/");
      const utilsFullPath = path.join(ROOT_DIR, `${utilsRelativePath}.ts`);
      expect(fs.existsSync(utilsFullPath)).toBe(true);
    });
  });

  describe("4.4: Next.js와 충돌하는 패키지가 없어야 한다", () => {
    const CONFLICTING_PACKAGES = [
      "react-router",
      "react-router-dom",
      "webpack",
      "babel-loader",
      "@babel/core",
      "css-loader",
      "style-loader",
      "sass-loader",
    ];

    it.each(CONFLICTING_PACKAGES)(
      "%s 패키지가 package.json에 포함되지 않아야 한다 (Next.js 충돌 가능)",
      (pkg) => {
        expect(allDeps).not.toHaveProperty(pkg);
      }
    );

    it("Next.js 코어 패키지가 설치되어 있어야 한다", () => {
      expect(allDeps).toHaveProperty("next");
    });

    it("React 19가 설치되어 있어야 한다", () => {
      expect(allDeps).toHaveProperty("react");
      const reactVersion = allDeps["react"];
      // React 19.x
      expect(reactVersion).toMatch(/^19\./);
    });

    it("react-dom 19가 설치되어 있어야 한다", () => {
      expect(allDeps).toHaveProperty("react-dom");
      const reactDomVersion = allDeps["react-dom"];
      expect(reactDomVersion).toMatch(/^19\./);
    });
  });

  describe("4.5: jest moduleNameMapper가 @/ 별칭을 해석해야 한다", () => {
    it("jest.config.ts에 @/* -> <rootDir>/src/$1 매핑이 존재해야 한다", () => {
      const jestConfigPath = path.join(ROOT_DIR, "jest.config.ts");
      expect(fs.existsSync(jestConfigPath)).toBe(true);
      const content = fs.readFileSync(jestConfigPath, "utf-8");
      expect(content).toContain('"^@/(.*)$"');
      expect(content).toContain('"<rootDir>/src/$1"');
    });
  });

  describe("4.6: cn() 함수가 @/shared/ui/lib/utils 경로로 import 가능해야 한다", () => {
    it("cn() 함수를 import하고 정상 동작해야 한다", async () => {
      const { cn } = await import("@/shared/ui/lib/utils");
      expect(typeof cn).toBe("function");
      expect(cn("p-4", "p-2")).toBe("p-2");
    });
  });
});
