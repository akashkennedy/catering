import bcrypt from "bcryptjs";

/**
 * Password hashing. bcryptjs is pure JS on purpose: no native bindings,
 * no Edge Runtime issues (cf. the earlier node:crypto extraction).
 */

const ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}
