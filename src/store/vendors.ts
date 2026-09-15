import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Vendor = {
  id: string;
  name: string;
  phone: string;
};

export type VendorInput = Omit<Vendor, "id">;

type VendorsState = {
  vendors: Vendor[];
  addVendor: (input: VendorInput) => string;
  updateVendor: (id: string, input: VendorInput) => void;
  deleteVendor: (id: string) => void;
};

export const useVendorsStore = create<VendorsState>()(
  persist(
    (set) => ({
      vendors: [],
      addVendor: (input) => {
        const id = crypto.randomUUID();
        set((state) => ({
          vendors: [...state.vendors, { id, ...input }],
        }));
        return id;
      },
      updateVendor: (id, input) =>
        set((state) => ({
          vendors: state.vendors.map((vendor) =>
            vendor.id === id ? { ...vendor, ...input } : vendor
          ),
        })),
      deleteVendor: (id) =>
        set((state) => ({
          vendors: state.vendors.filter((vendor) => vendor.id !== id),
        })),
    }),
    {
      name: "catering-vendors",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
