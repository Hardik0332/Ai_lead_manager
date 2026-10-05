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
    <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
      <FilterTab label="All" count={total} active={activeStatus === null} onClick={() => onSelectStatus(null)} />
      {STATUS_ORDER.map((s) => (
        <FilterTab
          key={s}
          label={STATUS_META[s].label}
          count={counts[s] ?? 0}
          active={activeStatus === s}
          onClick={() => onSelectStatus(activeStatus === s ? null : s)}
        />
      ))}
    </div>
  );
}

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm transition ${
        active
          ? "bg-zinc-900 font-medium text-white"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {label} <span className={active ? "text-zinc-400" : "text-zinc-400"}>{count}</span>
    </button>
  );
}
