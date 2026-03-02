import { sanitizeRedirectTo } from "../sanitizeRedirectTo";

describe("sanitizeRedirectTo", () => {
  it("null이면 /를 반환한다", () => {
    expect(sanitizeRedirectTo(null)).toBe("/");
  });

  it("빈 문자열이면 /를 반환한다", () => {
    expect(sanitizeRedirectTo("")).toBe("/");
  });

  it("유효한 상대 경로를 그대로 반환한다", () => {
    expect(sanitizeRedirectTo("/dashboard")).toBe("/dashboard");
  });

  it("https://로 시작하면 /를 반환한다", () => {
    expect(sanitizeRedirectTo("https://evil.com")).toBe("/");
  });

  it("http://로 시작하면 /를 반환한다", () => {
    expect(sanitizeRedirectTo("http://evil.com")).toBe("/");
  });

  it("//로 시작하면 /를 반환한다", () => {
    expect(sanitizeRedirectTo("//evil.com")).toBe("/");
  });

  it("\\로 시작하면 /를 반환한다", () => {
    expect(sanitizeRedirectTo("\\evil.com")).toBe("/");
  });

  it("javascript:이면 /를 반환한다", () => {
    expect(sanitizeRedirectTo("javascript:alert(1)")).toBe("/");
  });

  it("쿼리스트링이 있는 경로를 보존한다", () => {
    expect(sanitizeRedirectTo("/login?foo=bar")).toBe("/login?foo=bar");
  });

  it("/로 시작하지 않는 경로이면 /를 반환한다", () => {
    expect(sanitizeRedirectTo("dashboard")).toBe("/");
  });
});
