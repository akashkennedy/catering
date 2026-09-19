/**
 * Creates the first admin account (idempotent — skips when the email exists).
 *
 * Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/db-seed-admin.mjs
 * (npm run db:seed-admin loads .env via --env-file automatically)
 */
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";

if (!url) {
  console.error("DATABASE_URL is not set. See .env.example.");
  process.exit(1);
}
if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD are both required.");
  process.exit(1);
}
if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const sql = neon(url);

const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
if (existing.length > 0) {
  console.log(`Skip: admin ${email} already exists.`);
  process.exit(0);
}

const id = randomUUID();
const passwordHash = await bcrypt.hash(password, 12);
await sql`
  INSERT INTO users (id, email, password_hash, is_admin, employee_id)
  VALUES (${id}, ${email}, ${passwordHash}, TRUE, NULL)
`;
await sql`
  INSERT INTO permissions
    (user_id, can_view_finance, can_view_other_employee_rates, can_manage_employees, can_manage_settings)
  VALUES (${id}, TRUE, TRUE, TRUE, TRUE)
  ON CONFLICT (user_id) DO NOTHING
`;

console.log(`Created admin ${email}.`);
