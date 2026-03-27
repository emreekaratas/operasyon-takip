import { type NextRequest } from "next/server";
import { Assignment, Notification } from "@/types";
import {
  getAssignments,
  addAssignment as storeAddAssignment,
  addNotification,
  findAssignment,
  getOperationById,
  getUserById,
  updateOperation,
} from "@/lib/store";

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const workerId = searchParams.get("workerId");

  const assignments = getAssignments();

  if (workerId) {
    return Response.json(
      assignments.filter((a) => a.workerId === workerId)
    );
  }

  return Response.json(assignments);
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Geçersiz JSON formatı" },
      { status: 400 }
    );
  }

  const { operationId, workerId } = body as {
    operationId?: string;
    workerId?: string;
  };

  if (!operationId || typeof operationId !== "string") {
    return Response.json(
      { error: "operationId zorunludur" },
      { status: 400 }
    );
  }

  if (!workerId || typeof workerId !== "string") {
    return Response.json(
      { error: "workerId zorunludur" },
      { status: 400 }
    );
  }

  const operation = getOperationById(operationId);
  if (!operation) {
    return Response.json(
      { error: "Operasyon bulunamadı" },
      { status: 404 }
    );
  }

  const worker = getUserById(workerId);
  if (!worker) {
    return Response.json(
      { error: "İşçi bulunamadı" },
      { status: 404 }
    );
  }

  if (worker.role !== "worker") {
    return Response.json(
      { error: "Sadece işçilere atama yapılabilir" },
      { status: 400 }
    );
  }

  const existing = findAssignment(operationId, workerId);
  if (existing) {
    return Response.json(
      { error: "Bu operasyon zaten bu işçiye atanmış" },
      { status: 409 }
    );
  }

  updateOperation(operationId, (op) => ({
    ...op,
    status: "active",
  }));

  const newAssignment: Assignment = {
    id: crypto.randomUUID(),
    operationId,
    workerId,
    currentStepIndex: 0,
    status: "active",
    startedAt: new Date().toISOString(),
  };

  storeAddAssignment(newAssignment);

  const notification: Notification = {
    id: crypto.randomUUID(),
    userId: workerId,
    message: `"${operation.title}" operasyonu size atandı.`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  addNotification(notification);

  return Response.json(newAssignment, { status: 201 });
}
