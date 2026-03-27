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
import { getCurrentUser, setCurrentUser, getUsers } from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setUsers(getUsers());
    setLoading(false);
  }, []);

  const login = useCallback((u: User) => {
    setUser(u);
    setCurrentUser(u);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, users, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
