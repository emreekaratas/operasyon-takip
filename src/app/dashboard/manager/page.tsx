"use client";

import { useOperations } from "@/context/OperationContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function ManagerDashboard() {
  const { operations, assignments } = useOperations();
  const { users } = useAuth();

  const workers = users.filter((u) => u.role === "worker");
  const activeOps = operations.filter((o) => o.status === "active");
  const completedOps = operations.filter((o) => o.status === "completed");
  const activeAssignments = assignments.filter((a) => a.status === "active");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <Link
          href="/dashboard/manager/operations/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yeni Operasyon
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Toplam Operasyon"
          value={operations.length}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Aktif Operasyon"
          value={activeOps.length}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          color="orange"
        />
        <StatCard
          title="Tamamlanan"
          value={completedOps.length}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Aktif Atama"
          value={activeAssignments.length}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Son Operasyonlar</h3>
            <Link href="/dashboard/manager/operations" className="text-sm text-primary hover:underline">
              Tümünü Gör
            </Link>
          </div>
          {operations.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">
              Henüz operasyon oluşturulmadı
            </p>
          ) : (
            <div className="space-y-3">
              {operations.slice(0, 5).map((op) => (
                <div key={op.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      op.status === "completed"
                        ? "bg-success"
                        : op.status === "active"
                        ? "bg-warning"
                        : "bg-muted"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{op.title}</div>
                    <div className="text-xs text-muted">{op.steps.length} adım</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      op.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : op.status === "active"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {op.status === "completed" ? "Tamamlandı" : op.status === "active" ? "Aktif" : "Taslak"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">İşçiler</h3>
            <Link href="/dashboard/manager/workers" className="text-sm text-primary hover:underline">
              Tümünü Gör
            </Link>
          </div>
          {workers.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">Kayıtlı işçi bulunamadı</p>
          ) : (
            <div className="space-y-3">
              {workers.map((w) => {
                const workerAssigns = assignments.filter(
                  (a) => a.workerId === w.id && a.status === "active"
                );
                return (
                  <div key={w.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                      {w.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{w.name}</div>
                      <div className="text-xs text-muted">
                        {workerAssigns.length} aktif görev
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted">{title}</div>
        </div>
      </div>
    </div>
  );
}
