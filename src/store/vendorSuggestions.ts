import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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
  addVendorSuggestion: (name: string) => void;
};

export const useVendorSuggestionsStore = create<VendorSuggestionsState>()(
  persist(
    (set) => ({
      vendorSuggestions: seedFromLegacyVendors(),
      addVendorSuggestion: (name) =>
        set((state) => {
          const trimmed = name.trim();
          if (!trimmed || state.vendorSuggestions.includes(trimmed)) return state;
          return { vendorSuggestions: [...state.vendorSuggestions, trimmed] };
        }),
    }),
    {
      name: "catering-vendor-suggestions",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
