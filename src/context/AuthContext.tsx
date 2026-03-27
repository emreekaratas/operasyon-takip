"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { User } from "@/types";

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "manager" | "worker"
  ) => Promise<AuthResult>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [meRes, usersRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/users"),
        ]);

        if (meRes.ok) {
          const me: User = await meRes.json();
          setUser(me);
        }

        if (usersRes.ok) {
          const allUsers: User[] = await usersRes.json();
          setUsers(allUsers);
        }
      } catch {
        // API unavailable — stay logged out
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.error || "Giriş başarısız" };
        }

        setUser(data as User);
        return { success: true };
      } catch {
        return { success: false, error: "Sunucuya bağlanılamadı" };
      }
    },
    []
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: "manager" | "worker"
    ): Promise<AuthResult> => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        });

        const data = await res.json();

        if (!res.ok) {
          return { success: false, error: data.error || "Kayıt başarısız" };
        }

        setUser(data as User);

        const usersRes = await fetch("/api/users");
        if (usersRes.ok) {
          setUsers(await usersRes.json());
        }

        return { success: true };
      } catch {
        return { success: false, error: "Sunucuya bağlanılamadı" };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 min

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 401) {
          setUser(null);
        }
      } catch {
        // network error — keep current state
      }
    }, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, users, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
