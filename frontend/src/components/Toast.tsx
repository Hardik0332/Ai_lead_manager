"use client";

export interface ToastState {
  id: number;
  msg: string;
  kind: "ok" | "error";
}

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  return (
    <div className="fixed right-4 bottom-4 z-50">
      <div
        className={`max-w-sm rounded border px-3.5 py-2.5 text-sm shadow-lg ${
          toast.kind === "error"
            ? "border-rose-200 bg-white text-rose-700"
            : "border-zinc-700 bg-zinc-900 text-white"
        }`}
      >
        {toast.msg}
      </div>
    </div>
  );
}
