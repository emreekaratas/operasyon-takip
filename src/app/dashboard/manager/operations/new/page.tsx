"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOperations } from "@/context/OperationContext";
import { useAuth } from "@/context/AuthContext";
import { Step } from "@/types";

export default function NewOperationPage() {
  const router = useRouter();
  const { addOperation } = useOperations();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<Omit<Step, "id" | "status">[]>([
    { title: "", description: "", order: 1 },
  ]);

  const addStep = () => {
    setSteps([
      ...steps,
      { title: "", description: "", order: steps.length + 1 },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length <= 1) return;
    const next = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    setSteps(next);
  };

  const updateStep = (index: number, field: "title" | "description", value: string) => {
    const next = [...steps];
    next[index] = { ...next[index], [field]: value };
    setSteps(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || steps.some((s) => !s.title.trim())) return;

    const fullSteps: Step[] = steps.map((s, i) => ({
      ...s,
      id: crypto.randomUUID(),
      status: i === 0 ? "in_progress" : "pending",
    }));

    addOperation({
      title: title.trim(),
      description: description.trim(),
      steps: fullSteps,
      status: "draft",
      createdBy: user?.id ?? "",
    });

    router.push("/dashboard/manager/operations");
  };

  const isValid = title.trim() && steps.every((s) => s.title.trim());

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors cursor-pointer mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Geri
        </button>
        <h1 className="text-2xl font-bold text-foreground">Yeni Operasyon</h1>
        <p className="text-sm text-muted mt-1">
          Operasyon detaylarını ve adımlarını tanımlayın
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Operasyon Adı *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Üretim Hattı Kurulumu"
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Açıklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Operasyon hakkında kısa açıklama..."
              rows={3}
              className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Adımlar</h3>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover font-medium cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Adım Ekle
            </button>
          </div>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl animate-fade-in"
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                  {i + 1}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateStep(i, "title", e.target.value)}
                    placeholder="Adım başlığı *"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  />
                  <input
                    type="text"
                    value={step.description}
                    onChange={(e) => updateStep(i, "description", e.target.value)}
                    placeholder="Açıklama (isteğe bağlı)"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  />
                </div>
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="p-1.5 text-muted hover:text-danger hover:bg-red-50 rounded-lg transition-colors cursor-pointer mt-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 text-sm font-medium text-muted bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="flex-1 py-3 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Operasyon Oluştur
          </button>
        </div>
      </form>
    </div>
  );
}
