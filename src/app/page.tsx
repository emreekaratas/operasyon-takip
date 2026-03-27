"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@/types";

export default function LoginPage() {
  const { user, users, login, loading } = useAuth();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = () => {
    if (!selectedUser) return;
    login(selectedUser);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  const managers = users.filter((u) => u.role === "manager");
  const workers = users.filter((u) => u.role === "worker");

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
      <div className="w-full max-w-md mx-4 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Operasyon Takip</h1>
          <p className="text-muted mt-1">Devam etmek için hesabınızı seçin</p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Yöneticiler</h3>
            <div className="space-y-2">
              {managers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedUser?.id === u.id
                      ? "border-primary bg-blue-50 shadow-sm"
                      : "border-transparent bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {u.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-xs text-muted">Yönetici</div>
                  </div>
                  {selectedUser?.id === u.id && (
                    <svg className="w-5 h-5 text-primary ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">İşçiler</h3>
            <div className="space-y-2">
              {workers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                    selectedUser?.id === u.id
                      ? "border-primary bg-blue-50 shadow-sm"
                      : "border-transparent bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                    {u.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-xs text-muted">İşçi</div>
                  </div>
                  {selectedUser?.id === u.id && (
                    <svg className="w-5 h-5 text-primary ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedUser}
            className="w-full py-3 px-4 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );
}
