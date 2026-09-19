import { validateAuthConfig } from "@/lib/server-auth";

export async function register() {
  validateAuthConfig();
}
