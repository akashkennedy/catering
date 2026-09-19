export function validateAuthConfig(): void {
  const missing: string[] = [];
  if (!process.env.AUTH_SESSION_SECRET) missing.push("AUTH_SESSION_SECRET");
  if (!process.env.AUTH_USERNAME) missing.push("AUTH_USERNAME");
  if (!process.env.AUTH_PASSWORD) missing.push("AUTH_PASSWORD");

  if (missing.length === 0) return;

  const msg = `Missing required auth environment variables: ${missing.join(", ")}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error(msg);
  }
  console.warn(`[auth] ${msg}`);
}
