"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useOperations } from "@/context/OperationContext";
import { useAuth } from "@/context/AuthContext";
import StepProgress from "@/components/StepProgress";

export default function OperationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { getOperationById, assignments, getAssignmentProgress } =
    useOperations();
  const { users } = useAuth();

  const operationId = params.id as string;
  const operation = getOperationById(operationId);

  if (!operation) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Operasyon bulunamadı
          </h2>
          <button
            onClick={() => router.push("/dashboard/manager/operations")}
            className="text-sm text-primary hover:underline cursor-pointer"
          >
            Operasyonlara dön
          </button>
        </div>
      </div>
    );
  }

  const opAssignments = assignments.filter(
    (a) => a.operationId === operationId
  );

  const statusLabel = {
    draft: "Taslak",
    active: "Aktif",
    completed: "Tamamlandı",
  };
  const statusColor = {
    draft: "bg-slate-200 text-slate-600",
    active: "bg-orange-100 text-orange-700",
    completed: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors cursor-pointer mb-4"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Geri
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {operation.title}
              </h1>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[operation.status]}`}
              >
                {statusLabel[operation.status]}
              </span>
            </div>
            {operation.description && (
              <p className="text-sm text-muted mt-2">{operation.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted">
              <span>
                Oluşturulma:{" "}
                {new Date(operation.createdAt).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span>{operation.steps.length} adım</span>
              <span>{opAssignments.length} işçi atandı</span>
            </div>
          </div>

          <Link
            href={`/dashboard/manager/operations/${operationId}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Düzenle
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Adımlar</h3>
            <StepProgress
              steps={operation.steps}
              currentStepIndex={
                operation.status === "completed" ? operation.steps.length : 0
              }
              isCompleted={operation.status === "completed"}
            />
          </div>

          {opAssignments.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Atanan İşçiler ve İlerleme
              </h3>
              <div className="space-y-4">
                {opAssignments.map((assign) => {
                  const worker = users.find((u) => u.id === assign.workerId);
                  const progress = getAssignmentProgress(assign.id);
                  const currentStep =
                    operation.steps[assign.currentStepIndex];

                  return (
                    <div
                      key={assign.id}
                      className="bg-slate-50 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                            {worker?.name?.charAt(0) ?? "?"}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {worker?.name ?? "Bilinmeyen"}
                            </div>
                            <div className="text-xs text-muted">
                              {assign.status === "completed"
                                ? "Tamamlandı"
                                : `Adım ${assign.currentStepIndex + 1}/${operation.steps.length}: ${currentStep?.title ?? ""}`}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            assign.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {assign.status === "completed"
                            ? "Tamamlandı"
                            : "Devam Ediyor"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              assign.status === "completed"
                                ? "bg-success"
                                : "bg-primary"
                            }`}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground min-w-[40px] text-right">
                          %{progress.percentage}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Özet</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Durum</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[operation.status]}`}
                >
                  {statusLabel[operation.status]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Adım Sayısı</span>
                <span className="text-sm font-medium text-foreground">
                  {operation.steps.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Atanan İşçi</span>
                <span className="text-sm font-medium text-foreground">
                  {opAssignments.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Tamamlayan</span>
                <span className="text-sm font-medium text-foreground">
                  {
                    opAssignments.filter((a) => a.status === "completed")
                      .length
                  }
                </span>
              </div>
            </div>
          </div>

          {opAssignments.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Genel İlerleme
              </h3>
              {(() => {
                const totalSteps =
                  opAssignments.length * operation.steps.length;
                const completedSteps = opAssignments.reduce((sum, a) => {
                  const p = getAssignmentProgress(a.id);
                  return sum + p.current;
                }, 0);
                const overallPercentage =
                  totalSteps > 0
                    ? Math.round((completedSteps / totalSteps) * 100)
                    : 0;

                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl font-bold text-foreground">
                        %{overallPercentage}
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${overallPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted mt-2">
                      {completedSteps}/{totalSteps} adım tamamlandı
                    </p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
