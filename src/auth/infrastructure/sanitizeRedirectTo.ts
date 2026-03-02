export function sanitizeRedirectTo(redirectTo: string | null): string {
  if (!redirectTo) return "/";
  if (!redirectTo.startsWith("/")) return "/";
  if (redirectTo.startsWith("//")) return "/";
  return redirectTo;
}
