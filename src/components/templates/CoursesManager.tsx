"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { Pencil, Plus, Search, Trash } from "lucide-react";
import { useMediaQuery } from "@mantine/hooks";

import { Bilingual } from "@/components/Bilingual";
import { ListPageSkeleton } from "@/components/LoadingSkeletons";
import { preferredText, ui } from "@/lib/i18n";
import { useSettingsStore } from "@/store/settings";
import { useIngredientsStore } from "@/store/ingredients";
import { useTemplatesStore } from "@/store/templates";
import { formatINR } from "@/lib/format";
import { normalizeUnit } from "@/lib/units";
import {
  courseDisplayName,
  courseMatchesQuery,
  useCoursesStore,
  type Course,
} from "@/store/courses";
import { CourseFormModal } from "./CourseFormModal";

/** Courses master list: reusable courses with qty + price, picked by templates. */
export function CoursesManager() {
  const courses = useCoursesStore((state) => state.courses);
  const loaded = useCoursesStore((state) => state.loaded);
  const loadCourses = useCoursesStore((state) => state.loadCourses);
  const deleteCourse = useCoursesStore((state) => state.deleteCourse);
  const templates = useTemplatesStore((state) => state.templates);
  const loadTemplates = useTemplatesStore((state) => state.loadTemplates);
  const ingredients = useIngredientsStore((state) => state.ingredients);
  const uiLanguage = useSettingsStore((state) => state.uiLanguage);

  const [formOpened, setFormOpened] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [blockedCourse, setBlockedCourse] = useState<{ course: Course; usedBy: number } | null>(null);
  const [query, setQuery] = useState("");
  const isMobile = useMediaQuery("(max-width: 639px)");

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);
  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const masterById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients]
  );

  const usageByCourseId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const template of templates) {
      for (const dish of template.dishes) {
        if (!dish.courseId) continue;
        counts.set(dish.courseId, (counts.get(dish.courseId) ?? 0) + 1);
      }
    }
    return counts;
  }, [templates]);

  const courseCost = (course: Course): number =>
    course.ingredients.reduce((sum, row) => {
      const masterItem = masterById.get(row.ingredientId);
      if (!masterItem) return sum;
      return sum + (Number(row.qtyPer100) || 0) * masterItem.globalPrice;
    }, 0);

  const filtered = query.trim()
    ? courses.filter((course) => courseMatchesQuery(course, query))
    : courses;

  const confirmDelete = async (course: Course) => {
    const localUsage = usageByCourseId.get(course.id) ?? 0;
    if (localUsage > 0) {
      setDeletingCourse(null);
      setBlockedCourse({ course, usedBy: localUsage });
      return;
    }
    const result = await deleteCourse(course.id);
    setDeletingCourse(null);
    if (!result.ok) {
      setBlockedCourse({ course, usedBy: result.usedBy ?? usageByCourseId.get(course.id) ?? 0 });
    }
  };

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Text fw={600}>
          <Bilingual label={ui.coursesTitle(courses.length)} />
        </Text>
        <Button
          leftSection={<Plus size={18} />}
          onClick={() => {
            setEditingCourse(null);
            setFormOpened(true);
          }}
        >
          <Bilingual label={ui.templates.createCourse} />
        </Button>
      </Group>

      {courses.length > 0 && (
        <TextInput
          leftSection={<Search size={16} aria-hidden />}
          placeholder={preferredText(ui.templates.searchCourses, uiLanguage)}
          aria-label={preferredText(ui.templates.searchCourses, uiLanguage)}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          mb="md"
        />
      )}

      {!loaded ? (
        <ListPageSkeleton />
      ) : courses.length === 0 ? (
        <Text c="dimmed">
          <Bilingual label={ui.templates.coursesEmpty} />
        </Text>
      ) : filtered.length === 0 ? (
        <Text c="dimmed">
          <Bilingual label={ui.templates.noMatch} />
        </Text>
      ) : isMobile ? (
        <Stack gap="sm">
          {filtered.map((course) => {
            const cost = courseCost(course);
            const usedBy = usageByCourseId.get(course.id) ?? 0;
            return (
              <Card
                key={course.id}
                withBorder
                padding="sm"
                role="button"
                tabIndex={0}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setEditingCourse(course);
                  setFormOpened(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setEditingCourse(course);
                    setFormOpened(true);
                  }
                }}
              >
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Text fw={600}>{courseDisplayName(course, uiLanguage)}</Text>
                    <Text size="sm" c="dimmed">
                      <Bilingual label={ui.ingredientsCount(course.ingredients.length)} />
                      {cost > 0 ? ` · ≈ ${formatINR(Math.round(cost * 100) / 100)} / 100` : ""}
                    </Text>
                    {usedBy > 0 && (
                      <Text size="xs" c="dimmed">
                        <Bilingual label={ui.usedInTemplates(usedBy)} />
                      </Text>
                    )}
                  </Stack>
                  <ActionIcon
                    variant="subtle"
                    color="kumkum"
                    aria-label={`Delete ${courseDisplayName(course, uiLanguage)}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeletingCourse(course);
                    }}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Group>
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Bilingual label={ui.templates.coursesTab} />
              </Table.Th>
              <Table.Th>
                <Bilingual label={ui.templates.qtyPer100} />
              </Table.Th>
              <Table.Th>₹ / 100</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.map((course) => {
              const cost = courseCost(course);
              const usedBy = usageByCourseId.get(course.id) ?? 0;
              const qtyLines = course.ingredients
                .map((row) => {
                  const masterItem = masterById.get(row.ingredientId);
                  const name = masterItem ? masterItem.name : row.ingredientId;
                  const unit = masterItem ? ` ${normalizeUnit(masterItem.unit)}` : "";
                  return `${name} ${row.qtyPer100}${unit}`;
                })
                .join(", ");
              return (
                <Table.Tr key={course.id}>
                  <Table.Td>
                    <Text fw={500}>{courseDisplayName(course, uiLanguage)}</Text>
                    {usedBy > 0 && (
                      <Text size="xs" c="dimmed">
                        <Bilingual label={ui.usedInTemplates(usedBy)} />
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={qtyLines ? undefined : "dimmed"}>
                      {qtyLines || "—"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{cost > 0 ? formatINR(Math.round(cost * 100) / 100) : "—"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <ActionIcon
                        variant="subtle"
                        aria-label={`Edit ${courseDisplayName(course, uiLanguage)}`}
                        onClick={() => {
                          setEditingCourse(course);
                          setFormOpened(true);
                        }}
                      >
                        <Pencil size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="kumkum"
                        aria-label={`Delete ${courseDisplayName(course, uiLanguage)}`}
                        onClick={() => setDeletingCourse(course)}
                      >
                        <Trash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}

      <CourseFormModal
        opened={formOpened}
        course={editingCourse}
        onClose={() => setFormOpened(false)}
      />

      <Modal
        opened={deletingCourse !== null}
        onClose={() => setDeletingCourse(null)}
        title={<Bilingual label={ui.templates.deleteCourse} />}
        centered
      >
        <Stack gap="md">
          <Text>
            <Bilingual
              label={
                deletingCourse
                  ? ui.deleteConfirm(courseDisplayName(deletingCourse, uiLanguage))
                  : { en: "", ta: "" }
              }
            />
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingCourse(null)}>
              <Bilingual label={ui.common.cancel} />
            </Button>
            <Button
              color="kumkum"
              onClick={() => {
                if (deletingCourse) void confirmDelete(deletingCourse);
              }}
            >
              <Bilingual label={ui.common.delete} />
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={blockedCourse !== null}
        onClose={() => setBlockedCourse(null)}
        title={<Bilingual label={ui.templates.deleteCourse} />}
        centered
      >
        <Stack gap="md">
          <Text>
            <Bilingual label={ui.templates.deleteCourseBlocked} />
          </Text>
          {blockedCourse && (
            <Text size="sm" c="dimmed">
              <Bilingual label={ui.usedInTemplates(blockedCourse.usedBy)} />
            </Text>
          )}
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setBlockedCourse(null)}>
              <Bilingual label={ui.common.cancel} />
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
