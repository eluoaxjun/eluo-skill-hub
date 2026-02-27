import * as fs from "fs";
import * as path from "path";

const BASE_PATH = path.resolve(__dirname, "../../skill-catalog");

describe("Skill Catalog 바운디드 컨텍스트 디렉토리 구조", () => {
  describe("3계층 디렉토리", () => {
    it("domain 디렉토리가 존재해야 한다", () => {
      expect(fs.existsSync(path.join(BASE_PATH, "domain"))).toBe(true);
    });

    it("application 디렉토리가 존재해야 한다", () => {
      expect(fs.existsSync(path.join(BASE_PATH, "application"))).toBe(true);
    });

    it("infrastructure 디렉토리가 존재해야 한다", () => {
      expect(fs.existsSync(path.join(BASE_PATH, "infrastructure"))).toBe(true);
    });
  });

  describe("domain 하위 디렉토리", () => {
    it("domain/entities 디렉토리가 존재해야 한다", () => {
      expect(fs.existsSync(path.join(BASE_PATH, "domain/entities"))).toBe(
        true
      );
    });

    it("domain/value-objects 디렉토리가 존재해야 한다", () => {
      expect(
        fs.existsSync(path.join(BASE_PATH, "domain/value-objects"))
      ).toBe(true);
    });

    it("domain/repositories 디렉토리가 존재해야 한다", () => {
      expect(
        fs.existsSync(path.join(BASE_PATH, "domain/repositories"))
      ).toBe(true);
    });

    it("domain/events 디렉토리가 존재해야 한다", () => {
      expect(fs.existsSync(path.join(BASE_PATH, "domain/events"))).toBe(true);
    });
  });

  describe("infrastructure 하위 디렉토리", () => {
    it("infrastructure/repositories 디렉토리가 존재해야 한다", () => {
      expect(
        fs.existsSync(path.join(BASE_PATH, "infrastructure/repositories"))
      ).toBe(true);
    });
  });

  describe("인덱스 파일", () => {
    it("domain/entities/index.ts 파일이 존재해야 한다", () => {
      expect(
        fs.existsSync(path.join(BASE_PATH, "domain/entities/index.ts"))
      ).toBe(true);
    });

    it("domain/value-objects/index.ts 파일이 존재해야 한다", () => {
      expect(
        fs.existsSync(path.join(BASE_PATH, "domain/value-objects/index.ts"))
      ).toBe(true);
    });

    it("domain/repositories/index.ts 파일이 존재해야 한다", () => {
      expect(
        fs.existsSync(path.join(BASE_PATH, "domain/repositories/index.ts"))
      ).toBe(true);
    });

    it("domain/events/index.ts 파일이 존재해야 한다", () => {
      expect(
        fs.existsSync(path.join(BASE_PATH, "domain/events/index.ts"))
      ).toBe(true);
    });

    it("infrastructure/repositories/index.ts 파일이 존재해야 한다", () => {
      expect(
        fs.existsSync(
          path.join(BASE_PATH, "infrastructure/repositories/index.ts")
        )
      ).toBe(true);
    });
  });
});
