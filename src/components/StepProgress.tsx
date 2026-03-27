"use client";

import { Step } from "@/types";

interface StepProgressProps {
  steps: Step[];
  currentStepIndex: number;
  isCompleted?: boolean;
}

export default function StepProgress({
  steps,
  currentStepIndex,
  isCompleted,
}: StepProgressProps) {
  return (
    <div className="space-y-2">
      {steps.map((step, i) => {
        let status: "done" | "active" | "pending";
        if (isCompleted || i < currentStepIndex) status = "done";
        else if (i === currentStepIndex) status = "active";
        else status = "pending";

        return (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  status === "done"
                    ? "bg-success border-success text-white"
                    : status === "active"
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-border text-muted"
                }`}
              >
                {status === "done" ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 h-6 ${
                    status === "done" ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
            <div className="pt-0.5">
              <div
                className={`text-sm font-medium ${
                  status === "done"
                    ? "text-success"
                    : status === "active"
                    ? "text-primary"
                    : "text-muted"
                }`}
              >
                {step.title}
              </div>
              {step.description && (
                <div className="text-xs text-muted mt-0.5">{step.description}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
