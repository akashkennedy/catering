/**
 * Dashboard-first progressive boot.
 * Phase 0 (events + finance) stays component-driven so the dashboard paints
 * immediately from cache. This orchestrator trickles in everything else
 * during idle time, heaviest last, without ever blocking rendering.
 */

let started = false;

function idle(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ric = (
        window as unknown as {
          requestIdleCallback?: (
            cb: () => void,
            opts?: { timeout: number }
          ) => void;
        }
      ).requestIdleCallback;
      if (typeof ric === "function") {
        ric.call(window, () => resolve(), { timeout: 1500 });
        return;
      }
    } catch {
      // Fall through to setTimeout.
    }
    window.setTimeout(() => resolve(), 0);
  });
}

async function settle(promises: Array<Promise<unknown>>): Promise<void> {
  await Promise.all(
    promises.map((p) =>
      p.catch(() => {
        // One slice failing must not stall later phases.
      })
    )
  );
}

/** Runs once per page load; safe to call from multiple mounts. */
export function startProgressiveBoot(): void {
  if (typeof window === "undefined" || started) return;
  started = true;

  void (async () => {
    try {
      const { scheduleOutboxFlush } = await import("@/lib/outbox");
      scheduleOutboxFlush();
    } catch {
      // Ignore; individual loads retry in background.
    }

    // Phase 1: reminders (feed NotificationCenter + ReminderNotifier).
    await idle();
    try {
      const { useRemindersStore } = await import("@/store/reminders");
      await useRemindersStore.getState().loadReminders();
    } catch {
      // Offline: cached reminders keep rendering.
    }

    // Phase 2: search/catalog (ShellSearch + low-stock signals).
    await idle();
    try {
      const [{ useIngredientsStore }, { useTemplatesStore }, { useCoursesStore }] =
        await Promise.all([
          import("@/store/ingredients"),
          import("@/store/templates"),
          import("@/store/courses"),
        ]);
      await settle([
        useIngredientsStore.getState().loadIngredients(),
        useTemplatesStore.getState().loadTemplates(),
        useCoursesStore.getState().loadCourses(),
      ]);
    } catch {
      // Offline: cached catalog keeps rendering.
    }

    // Phase 3: heavy last (ledgers, staff, site content).
    await idle();
    try {
      const [
        { useStockLedgerStore },
        { useVesselStockLedgerStore },
        { useEmployeesStore },
        { useUtensilsStore },
        { useVendorSuggestionsStore },
      ] = await Promise.all([
        import("@/store/stockLedger"),
        import("@/store/vesselStockLedger"),
        import("@/store/employees"),
        import("@/store/utensils"),
        import("@/store/vendorSuggestions"),
      ]);
      await settle([
        useStockLedgerStore.getState().loadStockLedger(),
        useVesselStockLedgerStore.getState().loadVesselLedger(),
        useEmployeesStore.getState().loadEmployees(),
        useUtensilsStore.getState().loadUtensils(),
        useVendorSuggestionsStore.getState().loadVendorSuggestions(),
      ]);
    } catch {
      // Offline: cached ledgers keep rendering.
    }

    await idle();
    try {
      const { useSiteContentStore } = await import("@/store/siteContent");
      await useSiteContentStore.getState().loadRemote();
    } catch {
      // Site content is non-critical for the CRM shell.
    }
  })();
}
