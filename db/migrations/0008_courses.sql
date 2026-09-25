-- 0008_courses: reusable course masters; template dishes link to a course.
-- Course ingredient references are plain TEXT (no FK), matching the
-- dangling-tolerant "Unknown ingredient" behavior of template dishes.
-- template_dishes.course_id is plain TEXT as well: course deletion is
-- blocked in the app/API while links exist, never cascaded.

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL DEFAULT '',
  name_ta TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_ingredients (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  ingredient_id TEXT NOT NULL,
  qty_per_100 NUMERIC NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS course_ingredients_course_id_idx
  ON course_ingredients (course_id);

ALTER TABLE template_dishes
  ADD COLUMN IF NOT EXISTS course_id TEXT NOT NULL DEFAULT '';

DO $$
DECLARE
  dish_group RECORD;
  first_dish_id TEXT;
  new_course_id TEXT;
BEGIN
  FOR dish_group IN
    SELECT LOWER(TRIM(name_en)) AS norm, MAX(TRIM(name_en)) AS display_en, MAX(name_ta) AS display_ta
    FROM template_dishes
    WHERE TRIM(COALESCE(name_en, '')) <> ''
    GROUP BY LOWER(TRIM(name_en))
  LOOP
    new_course_id := 'course-' || md5(dish_group.norm);
    INSERT INTO courses (id, name_en, name_ta)
    VALUES (new_course_id, dish_group.display_en, COALESCE(dish_group.display_ta, ''))
    ON CONFLICT (id) DO NOTHING;
    SELECT d.id INTO first_dish_id
    FROM template_dishes d
    WHERE LOWER(TRIM(d.name_en)) = dish_group.norm
    ORDER BY d.created_at ASC, d.id ASC
    LIMIT 1;
    IF first_dish_id IS NOT NULL THEN
      INSERT INTO course_ingredients (id, course_id, ingredient_id, qty_per_100)
      SELECT 'ci-' || md5(dish_group.norm || '|' || tdi.ingredient_id), new_course_id, tdi.ingredient_id, tdi.qty_per_100
      FROM template_dish_ingredients tdi
      WHERE tdi.dish_id = first_dish_id
      ON CONFLICT (id) DO NOTHING;
    END IF;
    UPDATE template_dishes
    SET course_id = new_course_id
    WHERE LOWER(TRIM(name_en)) = dish_group.norm AND (course_id IS NULL OR course_id = '');
  END LOOP;
END;
$$;
