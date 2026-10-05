"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

export interface ToastState {
  id: number;
  msg: string;
  kind: "ok" | "error";
}

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  const isErr = toast.kind === "error";
  return (
    <div className="fixed right-4 bottom-4 z-50 animate-[toast-in_.25s_ease-out]">
      <div
        className={`flex max-w-sm items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
          isErr ? "bg-rose-600" : "bg-slate-900"
        }`}
      >
        {isErr ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-400" />
        )}
        <span>{toast.msg}</span>
      </div>
      <style jsx>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
