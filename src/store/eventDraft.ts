import { create } from "zustand";

export type EventDraftPrefill = {
  headcount: number;
  templateId: string | null;
  totalAmount: number;
};

type EventDraftState = {
  prefill: EventDraftPrefill | null;
  setPrefill: (value: EventDraftPrefill) => void;
  clearPrefill: () => void;
};

export const useEventDraftStore = create<EventDraftState>()((set) => ({
  prefill: null,
  setPrefill: (value) => set({ prefill: value }),
  clearPrefill: () => set({ prefill: null }),
}));