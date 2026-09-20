import { validateAuthConfig } from "@/lib/validate-auth-config";

export async function register() {
  validateAuthConfig();
}
