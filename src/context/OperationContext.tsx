"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Operation, Assignment, Step } from "@/types";
import {
  getOperations,
  saveOperations,
  getAssignments,
  saveAssignments,
} from "@/lib/storage";

interface OperationContextType {
  operations: Operation[];
  assignments: Assignment[];
  addOperation: (op: Omit<Operation, "id" | "createdAt">) => void;
  updateOperation: (id: string, updates: Partial<Pick<Operation, "title" | "description" | "steps">>) => void;
  deleteOperation: (id: string) => void;
  assignOperation: (operationId: string, workerId: string) => void;
  unassignOperation: (assignmentId: string) => void;
  advanceStep: (assignmentId: string) => void;
  getWorkerAssignments: (workerId: string) => Assignment[];
  getOperationById: (id: string) => Operation | undefined;
  getAssignmentProgress: (assignmentId: string) => {
    current: number;
    total: number;
    percentage: number;
  };
}

const OperationContext = createContext<OperationContextType | null>(null);

export function OperationProvider({ children }: { children: ReactNode }) {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    setOperations(getOperations());
    setAssignments(getAssignments());
  }, []);

  const persist = (ops: Operation[], assigns: Assignment[]) => {
    setOperations(ops);
    setAssignments(assigns);
    saveOperations(ops);
    saveAssignments(assigns);
  };

  const addOperation = useCallback(
    (op: Omit<Operation, "id" | "createdAt">) => {
      const newOp: Operation = {
        ...op,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const next = [...operations, newOp];
      setOperations(next);
      saveOperations(next);
    },
    [operations]
  );

  const updateOperation = useCallback(
    (id: string, updates: Partial<Pick<Operation, "title" | "description" | "steps">>) => {
      const nextOps = operations.map((o) =>
        o.id === id ? { ...o, ...updates } : o
      );
      setOperations(nextOps);
      saveOperations(nextOps);
    },
    [operations]
  );

  const deleteOperation = useCallback(
    (id: string) => {
      const nextOps = operations.filter((o) => o.id !== id);
      const nextAssigns = assignments.filter((a) => a.operationId !== id);
      persist(nextOps, nextAssigns);
    },
    [operations, assignments]
  );

  const assignOperation = useCallback(
    (operationId: string, workerId: string) => {
      const exists = assignments.find(
        (a) => a.operationId === operationId && a.workerId === workerId
      );
      if (exists) return;

      const op = operations.find((o) => o.id === operationId);
      if (!op) return;

      const nextOps = operations.map((o) =>
        o.id === operationId ? { ...o, status: "active" as const } : o
      );

      const newAssign: Assignment = {
        id: crypto.randomUUID(),
        operationId,
        workerId,
        currentStepIndex: 0,
        status: "active",
        startedAt: new Date().toISOString(),
      };
      const nextAssigns = [...assignments, newAssign];
      persist(nextOps, nextAssigns);
    },
    [operations, assignments]
  );

  const unassignOperation = useCallback(
    (assignmentId: string) => {
      const nextAssigns = assignments.filter((a) => a.id !== assignmentId);
      persist(operations, nextAssigns);
    },
    [operations, assignments]
  );

  const advanceStep = useCallback(
    (assignmentId: string) => {
      const assignment = assignments.find((a) => a.id === assignmentId);
      if (!assignment || assignment.status === "completed") return;

      const op = operations.find((o) => o.id === assignment.operationId);
      if (!op) return;

      const nextIndex = assignment.currentStepIndex + 1;
      const isComplete = nextIndex >= op.steps.length;

      const nextAssigns = assignments.map((a) =>
        a.id === assignmentId
          ? {
              ...a,
              currentStepIndex: isComplete
                ? op.steps.length - 1
                : nextIndex,
              status: isComplete
                ? ("completed" as const)
                : ("active" as const),
              completedAt: isComplete
                ? new Date().toISOString()
                : undefined,
            }
          : a
      );

      const updatedSteps: Step[] = op.steps.map((s, i) => {
        if (i < nextIndex) return { ...s, status: "completed" as const };
        if (i === nextIndex && !isComplete)
          return { ...s, status: "in_progress" as const };
        return { ...s, status: "pending" as const };
      });

      const nextOps = operations.map((o) =>
        o.id === op.id
          ? {
              ...o,
              steps: updatedSteps,
              status: isComplete ? ("completed" as const) : o.status,
            }
          : o
      );

      persist(nextOps, nextAssigns);
    },
    [operations, assignments]
  );

  const getWorkerAssignments = useCallback(
    (workerId: string) => assignments.filter((a) => a.workerId === workerId),
    [assignments]
  );

  const getOperationById = useCallback(
    (id: string) => operations.find((o) => o.id === id),
    [operations]
  );

  const getAssignmentProgress = useCallback(
    (assignmentId: string) => {
      const assignment = assignments.find((a) => a.id === assignmentId);
      if (!assignment) return { current: 0, total: 0, percentage: 0 };
      const op = operations.find((o) => o.id === assignment.operationId);
      if (!op) return { current: 0, total: 0, percentage: 0 };

      const completed =
        assignment.status === "completed"
          ? op.steps.length
          : assignment.currentStepIndex;
      return {
        current: completed,
        total: op.steps.length,
        percentage:
          op.steps.length > 0
            ? Math.round((completed / op.steps.length) * 100)
            : 0,
      };
    },
    [operations, assignments]
  );

  return (
    <OperationContext.Provider
      value={{
        operations,
        assignments,
        addOperation,
        updateOperation,
        deleteOperation,
        assignOperation,
        unassignOperation,
        advanceStep,
        getWorkerAssignments,
        getOperationById,
        getAssignmentProgress,
      }}
    >
      {children}
    </OperationContext.Provider>
  );
}

export function useOperations() {
  const ctx = useContext(OperationContext);
  if (!ctx)
    throw new Error("useOperations must be used within OperationProvider");
  return ctx;
}
