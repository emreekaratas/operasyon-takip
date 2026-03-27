"use client";

import { useAuth } from "@/context/AuthContext";
import { useOperations } from "@/context/OperationContext";
import { useToast } from "@/context/ToastContext";
import StepProgress from "@/components/StepProgress";

export default function WorkerDashboard() {
  const { user } = useAuth();
  const {
    assignments,
    operations,
    advanceStep,
    getAssignmentProgress,
  } = useOperations();
  const { showToast } = useToast();

  const handleAdvance = (assignmentId: string, opTitle: string, isLastStep: boolean) => {
    advanceStep(assignmentId);
    if (isLastStep) {
      showToast(`"${opTitle}" operasyonu tamamlandı!`, "success");
    } else {
      showToast("Adım tamamlandı, sonraki adıma geçildi", "success");
    }
  };

  if (!user) return null;

  const myAssignments = assignments.filter((a) => a.workerId === user.id);
  const activeAssignments = myAssignments.filter((a) => a.status === "active");
  const completedAssignments = myAssignments.filter(
    (a) => a.status === "completed"
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Görevlerim</h1>
        <p className="text-sm text-muted mt-1">
          {activeAssignments.length} aktif, {completedAssignments.length}{" "}
          tamamlanmış görev
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {myAssignments.length}
              </div>
              <div className="text-xs text-muted">Toplam Görev</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {activeAssignments.length}
              </div>
              <div className="text-xs text-muted">Devam Eden</div>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {completedAssignments.length}
              </div>
              <div className="text-xs text-muted">Tamamlanan</div>
            </div>
          </div>
        </div>
      </div>

      {activeAssignments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Aktif Görevler
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeAssignments.map((assign) => {
              const op = operations.find((o) => o.id === assign.operationId);
              if (!op) return null;
              const progress = getAssignmentProgress(assign.id);
              const currentStep = op.steps[assign.currentStepIndex];

              return (
                <div
                  key={assign.id}
                  className="bg-card rounded-2xl border border-border overflow-hidden animate-slide-in"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-foreground">
                        {op.title}
                      </h3>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        Devam Ediyor
                      </span>
                    </div>
                    {op.description && (
                      <p className="text-sm text-muted mb-4">
                        {op.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        %{progress.percentage}
                      </span>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                      <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                        Şu Anki Adım ({assign.currentStepIndex + 1}/{op.steps.length})
                      </div>
                      <div className="text-sm font-medium text-foreground">
                        {currentStep?.title}
                      </div>
                      {currentStep?.description && (
                        <div className="text-xs text-muted mt-1">
                          {currentStep.description}
                        </div>
                      )}
                    </div>

                    <StepProgress
                      steps={op.steps}
                      currentStepIndex={assign.currentStepIndex}
                    />
                  </div>

                  <div className="px-5 pb-5">
                    <button
                      onClick={() => handleAdvance(assign.id, op.title, assign.currentStepIndex === op.steps.length - 1)}
                      className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {assign.currentStepIndex === op.steps.length - 1
                        ? "Operasyonu Tamamla"
                        : "Adımı Tamamla ve İlerle"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {completedAssignments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Tamamlanan Görevler
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {completedAssignments.map((assign) => {
              const op = operations.find((o) => o.id === assign.operationId);
              if (!op) return null;

              return (
                <div
                  key={assign.id}
                  className="bg-card rounded-2xl border border-border p-5 opacity-75"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{op.title}</h3>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                      Tamamlandı
                    </span>
                  </div>
                  {op.description && (
                    <p className="text-sm text-muted mb-3">{op.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-emerald-200 rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full w-full" />
                    </div>
                    <span className="text-sm font-medium text-success">%100</span>
                  </div>
                  <div className="mt-3">
                    <StepProgress
                      steps={op.steps}
                      currentStepIndex={op.steps.length}
                      isCompleted
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {myAssignments.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            Henüz görev atanmadı
          </h3>
          <p className="text-sm text-muted">
            Yöneticiniz size görev atadığında burada görünecektir
          </p>
        </div>
      )}
    </div>
  );
}
