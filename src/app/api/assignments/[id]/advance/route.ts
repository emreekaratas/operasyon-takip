import {
  getAssignmentById,
  getOperationById,
  updateAssignment,
  updateOperation,
} from "@/lib/store";
import { Step } from "@/types";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const assignment = getAssignmentById(id);
  if (!assignment) {
    return Response.json(
      { error: "Atama bulunamadı" },
      { status: 404 }
    );
  }

  if (assignment.status === "completed") {
    return Response.json(
      { error: "Bu atama zaten tamamlanmış" },
      { status: 400 }
    );
  }

  const operation = getOperationById(assignment.operationId);
  if (!operation) {
    return Response.json(
      { error: "İlgili operasyon bulunamadı" },
      { status: 404 }
    );
  }

  const nextIndex = assignment.currentStepIndex + 1;
  const isComplete = nextIndex >= operation.steps.length;

  const updatedAssignment = updateAssignment(id, (a) => ({
    ...a,
    currentStepIndex: isComplete ? operation.steps.length - 1 : nextIndex,
    status: isComplete ? "completed" : "active",
    completedAt: isComplete ? new Date().toISOString() : undefined,
  }));

  const updatedSteps: Step[] = operation.steps.map((s, i) => {
    if (i < nextIndex) return { ...s, status: "completed" as const };
    if (i === nextIndex && !isComplete)
      return { ...s, status: "in_progress" as const };
    return { ...s, status: "pending" as const };
  });

  updateOperation(operation.id, (op) => ({
    ...op,
    steps: updatedSteps,
    status: isComplete ? "completed" : op.status,
  }));

  return Response.json(updatedAssignment);
}
