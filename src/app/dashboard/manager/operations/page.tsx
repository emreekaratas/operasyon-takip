"use client";

import { useState } from "react";
import Link from "next/link";
import { useOperations } from "@/context/OperationContext";
import { useAuth } from "@/context/AuthContext";
import { Operation } from "@/types";
import AssignModal from "@/components/AssignModal";
import StepProgress from "@/components/StepProgress";

export default function OperationsPage() {
  const { operations, assignments, deleteOperation } = useOperations();
  const { users } = useAuth();
  const [assignOp, setAssignOp] = useState<Operation | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getAssignedWorkers = (opId: string) => {
    const opAssigns = assignments.filter((a) => a.operationId === opId);
    return opAssigns.map((a) => {
      const worker = users.find((u) => u.id === a.workerId);
      return { assignment: a, worker };
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operasyonlar</h1>
          <p className="text-sm text-muted mt-1">
            Toplam {operations.length} operasyon
          </p>
        </div>
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

      {operations.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="font-semibold text-foreground mb-1">Henüz operasyon yok</h3>
          <p className="text-sm text-muted mb-4">İlk operasyonunuzu oluşturmaya başlayın</p>
          <Link
            href="/dashboard/manager/operations/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-xl hover:bg-primary-hover transition-colors"
          >
            Operasyon Oluştur
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {operations.map((op) => {
            const assigned = getAssignedWorkers(op.id);
            const isExpanded = expandedId === op.id;

            return (
              <div key={op.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{op.title}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            op.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : op.status === "active"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {op.status === "completed"
                            ? "Tamamlandı"
                            : op.status === "active"
                            ? "Aktif"
                            : "Taslak"}
                        </span>
                      </div>
                      {op.description && (
                        <p className="text-sm text-muted mt-1">{op.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                        <span>{op.steps.length} adım</span>
                        <span>{assigned.length} işçi atandı</span>
                        <span>
                          {new Date(op.createdAt).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setAssignOp(op)}
                        className="px-3 py-1.5 text-xs font-medium text-primary bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        Ata
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : op.id)}
                        className="px-3 py-1.5 text-xs font-medium text-muted bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        {isExpanded ? "Kapat" : "Detay"}
                      </button>
                      <button
                        onClick={() => deleteOperation(op.id)}
                        className="px-3 py-1.5 text-xs font-medium text-danger bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                      >
                        Sil
                      </button>
                    </div>
                  </div>

                  {assigned.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-3">
                      {assigned.map(({ worker }) =>
                        worker ? (
                          <div
                            key={worker.id}
                            className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-semibold"
                            title={worker.name}
                          >
                            {worker.name.charAt(0)}
                          </div>
                        ) : null
                      )}
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-border bg-slate-50 animate-fade-in">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Adımlar</h4>
                    <StepProgress steps={op.steps} currentStepIndex={0} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {assignOp && <AssignModal operation={assignOp} onClose={() => setAssignOp(null)} />}
    </div>
  );
}
