export type UserRole = "manager" | "worker";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type StepStatus = "pending" | "in_progress" | "completed";

export interface Step {
  id: string;
  title: string;
  description: string;
  order: number;
  status: StepStatus;
}

export type OperationStatus = "draft" | "active" | "completed";

export interface Operation {
  id: string;
  title: string;
  description: string;
  steps: Step[];
  status: OperationStatus;
  createdBy: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  operationId: string;
  workerId: string;
  currentStepIndex: number;
  status: "active" | "completed";
  startedAt: string;
  completedAt?: string;
}
