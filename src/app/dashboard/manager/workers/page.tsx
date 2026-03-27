"use client";

import { useAuth } from "@/context/AuthContext";
import { useOperations } from "@/context/OperationContext";

export default function WorkersPage() {
  const { users } = useAuth();
  const { assignments, operations, getAssignmentProgress } = useOperations();

  const workers = users.filter((u) => u.role === "worker");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">İşçiler</h1>
        <p className="text-sm text-muted mt-1">
          Toplam {workers.length} işçi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map((worker) => {
          const workerAssigns = assignments.filter(
            (a) => a.workerId === worker.id
          );
          const activeAssigns = workerAssigns.filter(
            (a) => a.status === "active"
          );
          const completedAssigns = workerAssigns.filter(
            (a) => a.status === "completed"
          );

          return (
            <div
              key={worker.id}
              className="bg-card rounded-2xl border border-border p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  {worker.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {worker.name}
                  </div>
                  <div className="text-xs text-muted">İşçi</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {activeAssigns.length}
                  </div>
                  <div className="text-xs text-blue-600/70">Aktif</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-emerald-600">
                    {completedAssigns.length}
                  </div>
                  <div className="text-xs text-emerald-600/70">Tamamlanan</div>
                </div>
              </div>

              {activeAssigns.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Aktif Görevler
                  </h4>
                  {activeAssigns.map((assign) => {
                    const op = operations.find(
                      (o) => o.id === assign.operationId
                    );
                    const progress = getAssignmentProgress(assign.id);
                    return (
                      <div
                        key={assign.id}
                        className="bg-slate-50 rounded-lg p-3"
                      >
                        <div className="text-sm font-medium text-foreground truncate">
                          {op?.title ?? "—"}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted">
                            %{progress.percentage}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
