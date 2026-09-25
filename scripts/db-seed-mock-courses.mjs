/**
 * Seeds mock courses + mock templates into Neon for demo/testing.
 * Idempotent — fixed ids with upserts, so re-running never duplicates.
 * Links to real ingredients by exact name; missing ones are skipped.
 *
 * Usage: npm run db:seed-mock
 * (npm script loads .env via --env-file automatically)
 */
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. See .env.example.");
  process.exit(1);
}
const sql = neon(url);

const MOCK_COURSES = [
  {
    id: "mock-course-sambar",
    nameEn: "Sambar",
    nameTa: "சாம்பார்",
    items: [
      ["Sambar Dal", 5],
      ["Tamarind", 1],
      ["Small Onion", 2],
      ["Tomato", 3],
      ["Sambar Powder (Baby)", 0.5],
      ["Salt Powder", 1],
      ["Sesame Oil", 1],
    ],
  },
  {
    id: "mock-course-rasam",
    nameEn: "Rasam",
    nameTa: "ரசம்",
    items: [
      ["Tomato", 4],
      ["Tamarind", 0.8],
      ["Garlic", 0.5],
      ["Cumin", 0.2],
      ["Green Chilly", 0.2],
      ["Salt Powder", 0.9],
      ["Coriander Leaves", 0.3],
    ],
  },
  {
    id: "mock-course-poriyal",
    nameEn: "Beans Poriyal",
    nameTa: "பீன்ஸ் பொரியல்",
    items: [
      ["Beans", 8],
      ["Coconut", 2],
      ["Small Onion", 1],
      ["Green Chilly", 0.3],
      ["Salt Powder", 0.8],
      ["Sesame Oil", 0.8],
    ],
  },
  {
    id: "mock-course-chicken-biryani",
    nameEn: "Chicken Biryani",
    nameTa: "சிக்கன் பிரியாணி",
    items: [
      ["Chicken", 12],
      ["India Gate White Sella", 10],
      ["Big Onion", 3],
      ["Tomato", 2],
      ["Ginger", 0.5],
      ["Garlic", 0.5],
      ["Curd", 2],
      ["Chicken Masala", 0.5],
      ["VVD Oil", 2],
      ["Salt Powder", 1],
    ],
  },
  {
    id: "mock-course-payasam",
    nameEn: "Semiya Payasam",
    nameTa: "சேமியா பாயசம்",
    items: [
      ["Vermicelli", 3],
      ["Sugar", 4],
      ["Milk Powder (Everyday)", 2],
      ["Cashew Nut", 0.5],
      ["Cardamom", 0.1],
      ["Rkg Ghee", 1],
    ],
  },
];

const MOCK_TEMPLATES = [
  {
    id: "mock-tpl-wedding-lunch",
    nameEn: "Wedding Lunch",
    nameTa: "கல்யாண மதிய சாப்பாடு",
    courses: [
      "mock-course-sambar",
      "mock-course-rasam",
      "mock-course-poriyal",
      "mock-course-payasam",
    ],
  },
  {
    id: "mock-tpl-biryani-combo",
    nameEn: "Chicken Biryani Combo",
    nameTa: "சிக்கன் பிரியாணி காம்போ",
    courses: ["mock-course-chicken-biryani", "mock-course-poriyal"],
  },
];

const warnings = [];
const stats = { courses: 0, links: 0, templates: 0, dishes: 0 };

const ingRows = await sql`SELECT id, name FROM ingredients`;
const ingIdByName = new Map(ingRows.map((r) => [String(r.name).trim(), String(r.id)]));

for (const course of MOCK_COURSES) {
  await sql`
    INSERT INTO courses (id, name_en, name_ta, updated_at)
    VALUES (${course.id}, ${course.nameEn}, ${course.nameTa}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      name_en = EXCLUDED.name_en,
      name_ta = EXCLUDED.name_ta,
      updated_at = NOW()
  `;
  stats.courses += 1;
  await sql`DELETE FROM course_ingredients WHERE course_id = ${course.id}`;
  for (const [name, qty] of course.items) {
    const ingredientId = ingIdByName.get(name);
    if (!ingredientId) {
      warnings.push(`No ingredient "${name}" for course "${course.nameEn}" — skipped`);
      continue;
    }
    await sql`
      INSERT INTO course_ingredients (id, course_id, ingredient_id, qty_per_100)
      VALUES (${`${course.id}-${ingredientId}`}, ${course.id}, ${ingredientId}, ${qty})
      ON CONFLICT (id) DO UPDATE SET qty_per_100 = EXCLUDED.qty_per_100
    `;
    stats.links += 1;
  }
}

const courseById = new Map(MOCK_COURSES.map((c) => [c.id, c]));
for (const template of MOCK_TEMPLATES) {
  await sql`
    INSERT INTO food_templates (id, name_en, name_ta, updated_at)
    VALUES (${template.id}, ${template.nameEn}, ${template.nameTa}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      name_en = EXCLUDED.name_en,
      name_ta = EXCLUDED.name_ta,
      updated_at = NOW()
  `;
  stats.templates += 1;
  let position = 0;
  for (const courseId of template.courses) {
    const course = courseById.get(courseId);
    if (!course) continue;
    const dishId = `${template.id}-${courseId}`;
    await sql`
      INSERT INTO template_dishes (id, template_id, course_id, name_en, name_ta, position)
      VALUES (${dishId}, ${template.id}, ${courseId}, ${course.nameEn}, ${course.nameTa}, ${position})
      ON CONFLICT (id) DO UPDATE SET
        course_id = EXCLUDED.course_id,
        name_en = EXCLUDED.name_en,
        name_ta = EXCLUDED.name_ta,
        position = EXCLUDED.position
    `;
    stats.dishes += 1;
    position += 1;
  }
}

console.log(
  `Done: ${stats.courses} courses, ${stats.links} course links, ` +
    `${stats.templates} templates, ${stats.dishes} dishes.`
);
for (const w of warnings) console.log(`WARN: ${w}`);
