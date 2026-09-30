/**
 * Copies meal templates + courses from the live Valar catering module
 * (/api/catering/meals + /api/catering/ingredients, NextAuth credentials
 * session) into this app's local database (courses + food_templates).
 *
 * Merge policy: match by normalized name, skip existing, auto-create
 * missing ingredients (carrying remote unit/price, mapped category).
 * Remote Mongo ids are only used for joins — all local rows get new ids.
 * Meal-level `vessels` have no local equivalent and are reported, not copied.
 *
 * Usage (dry-run, default):
 *   REMOTE_URL=https://<live-app> REMOTE_USER=... REMOTE_PASS=... \
 *     node --env-file=.env scripts/copy-remote-templates.mjs
 *
 * Apply:
 *   ... scripts/copy-remote-templates.mjs --apply
 *
 * Credentials come from env vars only and are never written anywhere.
 */
import { neon } from "@neondatabase/serverless";

const REMOTE_URL = (process.env.REMOTE_URL ?? "").replace(/\/+$/, "");
const REMOTE_USER = process.env.REMOTE_USER ?? "";
const REMOTE_PASS = process.env.REMOTE_PASS ?? "";
const APPLY = process.argv.includes("--apply");

if (!REMOTE_URL || !REMOTE_USER || !REMOTE_PASS) {
  console.error("Set REMOTE_URL, REMOTE_USER and REMOTE_PASS env vars.");
  process.exit(1);
}
const localUrl = process.env.DATABASE_URL;
if (!localUrl) {
  console.error("DATABASE_URL is not set. See .env.example.");
  process.exit(1);
}

const VALID_TAGS = new Set([
  "grocery",
  "vegetables",
  "masala-spices",
  "vessel",
  "meat-fish",
  "fuel",
]);

const CATEGORY_MAP = {
  masala: "masala-spices",
  meat: "meat-fish",
};

const norm = (value) => String(value ?? "").trim().toLowerCase();

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function mapTag(category) {
  const mapped = CATEGORY_MAP[category] ?? category;
  return VALID_TAGS.has(mapped) ? mapped : "grocery";
}

async function remoteLogin() {
  let cookies = [];
  const absorb = (res) => {
    const all =
      typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
    for (const header of all) {
      const pair = header.split(";")[0];
      const name = pair.split("=")[0];
      cookies = cookies.filter((c) => !c.startsWith(`${name}=`));
      cookies.push(pair);
    }
  };
  const csrfRes = await fetch(`${REMOTE_URL}/api/auth/csrf`);
  if (!csrfRes.ok) throw new Error(`Remote CSRF failed (HTTP ${csrfRes.status}).`);
  absorb(csrfRes);
  const { csrfToken } = await csrfRes.json();
  const loginRes = await fetch(`${REMOTE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookies.join("; "),
    },
    body: new URLSearchParams({
      csrfToken,
      callbackUrl: `${REMOTE_URL}/`,
      json: "true",
      username: REMOTE_USER,
      password: REMOTE_PASS,
    }),
    redirect: "manual",
  });
  absorb(loginRes);
  const body = await loginRes.json().catch(() => ({}));
  if (loginRes.status !== 200 || !String(body.url ?? "").startsWith(REMOTE_URL)) {
    throw new Error("Remote login rejected the credentials.");
  }
  return cookies.join("; ");
}

async function remoteGet(cookie, path) {
  const res = await fetch(`${REMOTE_URL}${path}`, {
    headers: { Cookie: cookie, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Remote GET ${path} failed (HTTP ${res.status}).`);
  }
  return res.json();
}

async function main() {
  console.log(`Remote: ${REMOTE_URL}`);
  console.log(`Mode: ${APPLY ? "APPLY (writes local DB)" : "DRY-RUN (no writes)"}`);

  const cookie = await remoteLogin();
  console.log("Remote login: OK");

  const [rMeals, rIngredients] = await Promise.all([
    remoteGet(cookie, "/api/catering/meals"),
    remoteGet(cookie, "/api/catering/ingredients"),
  ]);
  if (!Array.isArray(rMeals) || !Array.isArray(rIngredients)) {
    throw new Error("Unexpected remote payload shape.");
  }
  console.log(
    `Remote: ${rMeals.length} meals, ${rIngredients.length} ingredients.`
  );

  // Flatten courses across meals, deduped by name (union of items).
  const courseByName = new Map();
  for (const meal of rMeals) {
    for (const course of meal.courses ?? []) {
      const key = norm(course.nameEn);
      if (!key) continue;
      const entry = courseByName.get(key) ?? {
        nameEn: String(course.nameEn ?? ""),
        nameTa: String(course.nameTa ?? ""),
        items: new Map(),
      };
      if (!entry.nameTa && course.nameTa) entry.nameTa = String(course.nameTa);
      for (const item of course.items ?? []) {
        const itemKey = norm(item.nameEn);
        if (!itemKey || entry.items.has(itemKey)) continue;
        entry.items.set(itemKey, item);
      }
      courseByName.set(key, entry);
    }
  }
  const rCourses = [...courseByName.values()].map((entry) => ({
    ...entry,
    items: [...entry.items.values()],
  }));
  const withItems = rCourses.filter((c) => c.items.length > 0).length;
  console.log(
    `Remote courses (deduped): ${rCourses.length} (${withItems} with ingredients).`
  );
  const vesselCount = rMeals.reduce(
    (sum, meal) => sum + (meal.vessels ?? []).length,
    0
  );
  if (vesselCount > 0) {
    console.log(
      `Note: ${vesselCount} meal-level vessel lines ignored (no local equivalent).`
    );
  }

  const sql = neon(localUrl);
  const lIngredients = await sql`SELECT id, name FROM ingredients`;
  const lCourses = await sql`SELECT id, name_en FROM courses`;
  const lTemplates = await sql`SELECT id, name_en FROM food_templates`;

  const localIngByName = new Map(lIngredients.map((r) => [norm(r.name), String(r.id)]));
  const localCourseByName = new Map(lCourses.map((r) => [norm(r.name_en), String(r.id)]));
  const localTemplateNames = new Set(lTemplates.map((r) => norm(r.name_en)));
  console.log(
    `Local: ${lIngredients.length} ingredients, ${lCourses.length} courses, ${lTemplates.length} templates.`
  );

  // Remote-name -> local-id maps (including already-existing rows).
  const ingMap = new Map();
  const toCreateIngredients = [];
  for (const ing of rIngredients) {
    const key = norm(ing.nameEn);
    if (!key) continue;
    const existing = localIngByName.get(key);
    if (existing) ingMap.set(key, existing);
    else if (!toCreateIngredients.some((item) => norm(item.nameEn) === key)) {
      toCreateIngredients.push(ing);
    }
  }

  const courseMap = new Map();
  const toCreateCourses = [];
  const skippedCourses = [];
  for (const course of rCourses) {
    const key = norm(course.nameEn);
    const existing = localCourseByName.get(key);
    if (existing) {
      courseMap.set(key, existing);
      skippedCourses.push(course.nameEn);
    } else {
      toCreateCourses.push(course);
    }
  }

  const toCreateTemplates = [];
  const skippedTemplates = [];
  for (const meal of rMeals) {
    if (localTemplateNames.has(norm(meal.nameEn))) {
      skippedTemplates.push(meal.nameEn);
    } else {
      toCreateTemplates.push(meal);
    }
  }

  console.log(
    `\nIngredients: ${toCreateIngredients.length} to create, ${ingMap.size} already exist.`
  );
  for (const ing of toCreateIngredients) console.log(`  + ${ing.nameEn}`);
  console.log(
    `Courses: ${toCreateCourses.length} to create, ${skippedCourses.length} skipped (exist).`
  );
  for (const c of toCreateCourses) {
    console.log(
      `  + ${c.nameEn} (${c.items.length} ingredients${c.items.length === 0 ? " — empty" : ""})`
    );
  }
  console.log(
    `Templates: ${toCreateTemplates.length} to create, ${skippedTemplates.length} skipped (exist).`
  );
  for (const t of toCreateTemplates) {
    console.log(`  + ${t.nameEn} (${(t.courses ?? []).length} dishes)`);
  }

  if (!APPLY) {
    console.log("\nDry-run complete. Re-run with --apply to write to the local DB.");
    return;
  }

  // 1. Missing ingredients (carry remote unit/price/mapped category; zero stock).
  for (const ing of toCreateIngredients) {
    const key = norm(ing.nameEn);
    const id = newId("ing");
    await sql`
      INSERT INTO ingredients
        (id, name, tamil_name, tag, unit, qty, global_price, opening_stock, low_stock_threshold, updated_at)
      VALUES
        (${id}, ${String(ing.nameEn ?? "")}, ${String(ing.nameTa ?? "")}, ${mapTag(ing.category)},
         ${String(ing.unit ?? "")}, 0, ${Number(ing.pricePerUnit) || 0}, 0, 0, NOW())
      ON CONFLICT (id) DO NOTHING
    `;
    ingMap.set(key, id);
  }
  console.log(`Created ${toCreateIngredients.length} ingredients.`);

  // 2. Missing courses (+ ingredient lines, remapped to local ids).
  for (const course of toCreateCourses) {
    const key = norm(course.nameEn);
    const id = newId("course");
    const items = (course.items ?? []).filter((item) => ingMap.has(norm(item.nameEn)));
    const dropped = (course.items ?? []).length - items.length;
    await sql.transaction((txn) => [
      txn`
        INSERT INTO courses (id, name_en, name_ta, updated_at)
        VALUES (${id}, ${String(course.nameEn ?? "")}, ${String(course.nameTa ?? "")}, NOW())
        ON CONFLICT (id) DO NOTHING
      `,
      txn`DELETE FROM course_ingredients WHERE course_id = ${id}`,
      ...items.map((item) =>
        txn`
          INSERT INTO course_ingredients (id, course_id, ingredient_id, qty_per_100)
          VALUES (${newId("ci")}, ${id}, ${ingMap.get(norm(item.nameEn))}, ${Number(item.qtyPer100) || 0})
        `
      ),
    ]);
    courseMap.set(key, id);
    if (dropped > 0) {
      console.log(`  note: ${course.nameEn}: dropped ${dropped} lines with unknown ingredients.`);
    }
  }
  console.log(`Created ${toCreateCourses.length} courses.`);

  // 3. Missing templates (dish links remapped to local course ids).
  for (const meal of toCreateTemplates) {
    const id = newId("tpl");
    const dishes = meal.courses ?? [];
    await sql.transaction((txn) => [
      txn`
        INSERT INTO food_templates (id, name_en, name_ta, updated_at)
        VALUES (${id}, ${String(meal.nameEn ?? "")}, ${String(meal.nameTa ?? "")}, NOW())
        ON CONFLICT (id) DO NOTHING
      `,
      ...dishes.map((course, position) =>
        txn`
          INSERT INTO template_dishes (id, template_id, course_id, name_en, name_ta, position)
          VALUES (${newId("dish")}, ${id}, ${courseMap.get(norm(course.nameEn)) ?? ""},
                  ${String(course.nameEn ?? "")}, ${String(course.nameTa ?? "")}, ${position})
        `
      ),
    ]);
  }
  console.log(`Created ${toCreateTemplates.length} templates.`);
  console.log("Done.");
}

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
