"use client";

import { useAuth } from "@/context/AuthContext";
import { useOperations } from "@/context/OperationContext";
import { useToast } from "@/context/ToastContext";
import { Operation } from "@/types";

interface AssignModalProps {
  operation: Operation;
  onClose: () => void;
}

export default function AssignModal({ operation, onClose }: AssignModalProps) {
  const { users } = useAuth();
  const { assignOperation, assignments, unassignOperation } = useOperations();
  const { showToast } = useToast();

  const workers = users.filter((u) => u.role === "worker");
  const operationAssignments = assignments.filter(
    (a) => a.operationId === operation.id
  );

  const isAssigned = (workerId: string) =>
    operationAssignments.some((a) => a.workerId === workerId);

  const getAssignmentId = (workerId: string) =>
    operationAssignments.find((a) => a.workerId === workerId)?.id;

  const handleToggle = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (isAssigned(workerId)) {
      const assignmentId = getAssignmentId(workerId);
      if (assignmentId) {
        unassignOperation(assignmentId);
        showToast(`${worker?.name} ataması kaldırıldı`, "info");
      }
    } else {
      assignOperation(operation.id, workerId);
      showToast(`${worker?.name} başarıyla atandı`, "success");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">İşçi Ata</h3>
          <p className="text-sm text-muted mt-1">{operation.title}</p>
        </div>

        <div className="p-4 max-h-80 overflow-auto">
          {workers.length === 0 ? (
            <p className="text-center text-muted py-8">Kayıtlı işçi bulunamadı</p>
          ) : (
            <div className="space-y-2">
              {workers.map((worker) => {
                const assigned = isAssigned(worker.id);
                return (
                  <button
                    key={worker.id}
                    onClick={() => handleToggle(worker.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                      assigned
                        ? "border-success bg-emerald-50"
                        : "border-transparent bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                      {worker.name.charAt(0)}
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-foreground text-sm">{worker.name}</div>
                    </div>
                    {assigned ? (
                      <span className="text-xs bg-success text-white px-2 py-1 rounded-full">
                        Atandı
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-200 text-muted px-2 py-1 rounded-full">
                        Atanmadı
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-muted bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
