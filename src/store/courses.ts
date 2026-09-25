import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CourseIngredient = {
  ingredientId: string;
  qtyPer100: number;
};

export type Course = {
  id: string;
  nameEn: string;
  nameTa: string;
  ingredients: CourseIngredient[];
};

export function courseDisplayName(
  course: Pick<Course, "nameEn" | "nameTa">,
  lang: "en" | "ta"
): string {
  if (lang === "ta") return course.nameTa.trim() || course.nameEn;
  return course.nameEn;
}

export function courseMatchesQuery(course: Course, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (course.nameEn.toLowerCase().includes(q)) return true;
  if (course.nameTa.includes(query.trim())) return true;
  return false;
}

export type CourseInput = Omit<Course, "id">;

type CoursesState = {
  courses: Course[];
  loaded: boolean;
  addCourse: (input: CourseInput) => Promise<Course>;
  updateCourse: (id: string, input: CourseInput) => Promise<void>;
  deleteCourse: (id: string) => Promise<{ ok: boolean; usedBy?: number }>;
  loadCourses: () => Promise<void>;
};

function newClientId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `local-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

async function sendJson(path: string, method: "POST" | "PATCH", body: unknown): Promise<boolean> {
  try {
    const response = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Shared in-flight load so simultaneous mounts fire a single request.
let loadCoursesRequest: Promise<void> | null = null;

export const useCoursesStore = create<CoursesState>()(
  persist(
    /** Builds the persisted course store and its synchronized actions. */
    (set, get) => ({
      courses: [],
      loaded: false,
      addCourse: async (input) => {
        const course: Course = { id: newClientId(), ...input };
        set((state) => ({ courses: [...state.courses, course] }));
        const ok = await sendJson("/api/courses", "POST", course);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "POST", path: "/api/courses", body: course });
        }
        return course;
      },
      updateCourse: async (id, input) => {
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === id ? { ...course, ...input } : course
          ),
        }));
        const ok = await sendJson(`/api/courses/${encodeURIComponent(id)}`, "PATCH", input);
        if (!ok) {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "PATCH", path: `/api/courses/${encodeURIComponent(id)}`, body: input });
        }
      },
      deleteCourse: async (id) => {
        try {
          const response = await fetch(`/api/courses/${encodeURIComponent(id)}`, {
            method: "DELETE",
            credentials: "same-origin",
          });
          if (response.status === 409) {
            const body = (await response.json()) as { usedBy?: number };
            return { ok: false, usedBy: Number(body.usedBy ?? 0) };
          }
          if (!response.ok) {
            const { queueOp } = await import("@/lib/outbox");
            queueOp({ method: "DELETE", path: `/api/courses/${encodeURIComponent(id)}` });
          }
        } catch {
          const { queueOp } = await import("@/lib/outbox");
          queueOp({ method: "DELETE", path: `/api/courses/${encodeURIComponent(id)}` });
        }
        set((state) => ({
          courses: state.courses.filter((course) => course.id !== id),
        }));
        return { ok: true };
      },
      loadCourses: async () => {
        if (get().loaded) return;
        if (!loadCoursesRequest) {
          loadCoursesRequest = (async () => {
            const { flushOutbox } = await import("@/lib/outbox");
            await flushOutbox();
            try {
              const response = await fetch("/api/courses", { credentials: "same-origin" });
              if (!response.ok) return;
              const body = (await response.json()) as { courses?: Course[] };
              if (Array.isArray(body.courses)) {
                set({ courses: body.courses, loaded: true });
              }
            } catch {
              // Offline: keep the localStorage cache as the read source.
            }
          })().finally(() => {
            loadCoursesRequest = null;
          });
        }
        await loadCoursesRequest;
      },
    }),
    {
      name: "catering-courses",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ courses: state.courses }),
    }
  )
);
