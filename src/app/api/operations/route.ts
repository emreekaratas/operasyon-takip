import { type NextRequest } from "next/server";
import { Operation, Step } from "@/types";
import {
  getOperations,
  addOperation as storeAddOperation,
} from "@/lib/store";

export function GET() {
  return Response.json(getOperations());
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

  const { title, description, steps, status, createdBy } = body as {
    title?: string;
    description?: string;
    steps?: Partial<Step>[];
    status?: string;
    createdBy?: string;
  };

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return Response.json(
      { error: "Başlık zorunludur" },
      { status: 400 }
    );
  }

  if (!steps || !Array.isArray(steps) || steps.length === 0) {
    return Response.json(
      { error: "En az 1 adım zorunludur" },
      { status: 400 }
    );
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!step.title || typeof step.title !== "string" || step.title.trim().length === 0) {
      return Response.json(
        { error: `Adım ${i + 1} için başlık zorunludur` },
        { status: 400 }
      );
    }
  }

  const newSteps: Step[] = steps.map((s, i) => ({
    id: crypto.randomUUID(),
    title: (s.title as string).trim(),
    description: typeof s.description === "string" ? s.description.trim() : "",
    order: i,
    status: "pending" as const,
  }));

  const newOp: Operation = {
    id: crypto.randomUUID(),
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : "",
    steps: newSteps,
    status: status === "active" ? "active" : "draft",
    createdBy: typeof createdBy === "string" ? createdBy : "",
    createdAt: new Date().toISOString(),
  };

  storeAddOperation(newOp);
  return Response.json(newOp, { status: 201 });
}
