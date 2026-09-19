import { create } from "zustand";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type SessionResponse = {
  authenticated: boolean;
  username: string | null;
};

type AuthState = {
  status: AuthStatus;
  /** Mirrors status === "authenticated"; kept for existing consumers. */
  authed: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
};

function clearLegacyPersistedAuth(): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("catering-auth");
    }
  } catch {
    // Ignore storage errors; server session remains the source of truth.
  }
}

clearLegacyPersistedAuth();

export const useAuthStore = create<AuthState>()((set) => ({
  status: "loading",
  authed: false,
  username: null,
  login: async (username, password) => {
    set({ status: "loading" });
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        set({ status: "unauthenticated", authed: false, username: null });
        return false;
      }
      const data = (await response.json()) as { username?: string };
      const sessionUsername =
        typeof data.username === "string" ? data.username : username.trim();
      clearLegacyPersistedAuth();
      set({ status: "authenticated", authed: true, username: sessionUsername });
      return true;
    } catch {
      set({ status: "unauthenticated", authed: false, username: null });
      return false;
    }
  },
  logout: async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // Ignore network errors; still clear local session state.
    }
    clearLegacyPersistedAuth();
    set({ status: "unauthenticated", authed: false, username: null });
  },
  checkSession: async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) {
        set({ status: "unauthenticated", authed: false, username: null });
        return false;
      }
      const data = (await response.json()) as SessionResponse;
      if (!data.authenticated) {
        set({ status: "unauthenticated", authed: false, username: null });
        return false;
      }
      set({ status: "authenticated", authed: true, username: data.username });
      return true;
    } catch {
      set({ status: "unauthenticated", authed: false, username: null });
      return false;
    }
  },
}));
