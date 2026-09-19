import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { fetchJson, syncOrQueue } from "@/lib/storeSync";

function seedFromLegacyVendors(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("catering-vendors");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { state?: { vendors?: Array<{ name?: string }> } };
    const names = (parsed.state?.vendors ?? [])
      .map((vendor) => vendor.name?.trim())
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(names));
  } catch {
    return [];
  }
}

type VendorSuggestionsState = {
  vendorSuggestions: string[];
  loaded: boolean;
  addVendorSuggestion: (name: string) => void;
  loadVendorSuggestions: () => Promise<void>;
};

export const useVendorSuggestionsStore = create<VendorSuggestionsState>()(
  persist(
    (set) => ({
      vendorSuggestions: seedFromLegacyVendors(),
      loaded: false,
      addVendorSuggestion: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        let added = false;
        set((state) => {
          if (state.vendorSuggestions.includes(trimmed)) return state;
          added = true;
          return { vendorSuggestions: [...state.vendorSuggestions, trimmed] };
        });
        if (added) {
          void syncOrQueue("POST", "/api/vendor-names", { name: trimmed });
        }
      },
      loadVendorSuggestions: async () => {
        const { flushOutbox } = await import("@/lib/outbox");
        await flushOutbox();
        const body = await fetchJson<{ vendorNames?: unknown }>("/api/vendor-names");
        if (body && Array.isArray(body.vendorNames)) {
          const names = body.vendorNames.filter(
            (name): name is string => typeof name === "string"
          );
          set((state) => ({
            vendorSuggestions: Array.from(new Set([...state.vendorSuggestions, ...names])),
            loaded: true,
          }));
        }
      },
    }),
    {
      name: "catering-vendor-suggestions",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ vendorSuggestions: state.vendorSuggestions }),
    }
  )
);
