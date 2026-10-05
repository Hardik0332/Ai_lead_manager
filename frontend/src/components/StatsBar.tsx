"use client";

import { STATUS_META, STATUS_ORDER, type LeadStatus } from "@/lib/types";

export function StatsBar({
  counts,
  total,
  activeStatus,
  onSelectStatus,
}: {
  counts: Record<string, number>;
  total: number;
  activeStatus: string | null;
  onSelectStatus: (s: LeadStatus | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onSelectStatus(null)}
        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
          activeStatus === null
            ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
        }`}
      >
        All leads <span className="ml-1 opacity-70">{total}</span>
      </button>
      {STATUS_ORDER.map((s) => {
        const meta = STATUS_META[s];
        const active = activeStatus === s;
        return (
          <button
            key={s}
            onClick={() => onSelectStatus(active ? null : s)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition ${
              active
                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
            {meta.label}
            <span className="font-semibold text-slate-900">{counts[s] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
