import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Mock credentials for the placeholder login form — no real auth yet.
// Swap these (and login()) for a real auth call during the backend phase.
export const MOCK_USERNAME = "admin";
export const MOCK_PASSWORD = "admin";

type AuthState = {
  authed: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authed: false,
      username: null,
      login: (username, password) => {
        if (username.trim() === MOCK_USERNAME && password === MOCK_PASSWORD) {
          set({ authed: true, username: MOCK_USERNAME });
          return true;
        }
        return false;
      },
      logout: () => set({ authed: false, username: null }),
    }),
    {
      name: "catering-auth",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
