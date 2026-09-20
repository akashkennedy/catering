/**
 * Login username rules (client-safe: no server imports).
 * Lowercase letters, digits, dot, underscore, hyphen; 3–30 chars.
 * Stored normalized (trimmed + lowercased) so uniqueness is exact-match.
 */

export const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/;

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(normalizeUsername(username));
}
