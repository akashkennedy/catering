import { create } from "zustand";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type SessionResponse = {
  authenticated: boolean;
  username: string | null;
};

export type SessionPermissions = {
  canViewFinance: boolean;
  canViewOtherEmployeeRates: boolean;
  canManageEmployees: boolean;
  canManageSettings: boolean;
  canViewEmployees: boolean;
  canViewWebsite: boolean;
  canExportExcel: boolean;
};

type MeResponse = {
  authenticated: boolean;
  user?: {
    id: string;
    username: string;
    isAdmin: boolean;
    employeeId: string | null;
  };
  permissions?: SessionPermissions;
};

const FULL_PERMISSIONS: SessionPermissions = {
  canViewFinance: true,
  canViewOtherEmployeeRates: true,
  canManageEmployees: true,
  canManageSettings: true,
  canViewEmployees: true,
  canViewWebsite: true,
  canExportExcel: true,
};

type AuthState = {
  status: AuthStatus;
  /** Mirrors status === "authenticated"; kept for existing consumers. */
  authed: boolean;
  username: string | null;
  userId: string | null;
  isAdmin: boolean;
  employeeId: string | null;
  permissions: SessionPermissions;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
};

async function loadIdentity(): Promise<Pick<
  AuthState,
  "userId" | "isAdmin" | "employeeId" | "permissions"
> | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as MeResponse;
    if (!data.authenticated || !data.user) return null;
    return {
      userId: data.user.id,
      isAdmin: data.user.isAdmin,
      employeeId: data.user.employeeId,
      permissions: data.permissions ?? FULL_PERMISSIONS,
    };
  } catch {
    return null;
  }
}

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

const signedOutState = {
  status: "unauthenticated" as AuthStatus,
  authed: false,
  username: null as string | null,
  userId: null as string | null,
  isAdmin: false,
  employeeId: null as string | null,
  permissions: FULL_PERMISSIONS,
};

export const useAuthStore = create<AuthState>()((set) => ({
  status: "loading",
  authed: false,
  username: null,
  userId: null,
  isAdmin: false,
  employeeId: null,
  permissions: FULL_PERMISSIONS,
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
        set({ ...signedOutState });
        return false;
      }
      const data = (await response.json()) as { username?: string };
      const sessionUsername =
        typeof data.username === "string" ? data.username : username.trim();
      clearLegacyPersistedAuth();
      const identity = await loadIdentity();
      set({
        status: "authenticated",
        authed: true,
        username: sessionUsername,
        userId: identity?.userId ?? null,
        isAdmin: identity?.isAdmin ?? false,
        employeeId: identity?.employeeId ?? null,
        permissions: identity?.permissions ?? FULL_PERMISSIONS,
      });
      return true;
    } catch {
      set({ ...signedOutState });
      return false;
    }
  },
  logout: async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Logout failed");
    } catch {
      return;
    }
    clearLegacyPersistedAuth();
    set({ ...signedOutState });
  },
  checkSession: async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) {
        set({ ...signedOutState });
        return false;
      }
      const data = (await response.json()) as SessionResponse;
      if (!data.authenticated) {
        set({ ...signedOutState });
        return false;
      }
      const identity = await loadIdentity();
      set({
        status: "authenticated",
        authed: true,
        username: data.username,
        userId: identity?.userId ?? null,
        isAdmin: identity?.isAdmin ?? false,
        employeeId: identity?.employeeId ?? null,
        permissions: identity?.permissions ?? FULL_PERMISSIONS,
      });
      return true;
    } catch {
      const current = useAuthStore.getState();
      if (current.status === "authenticated") {
        return true;
      }
      set({ ...signedOutState });
      return false;
    }
  },
}));
