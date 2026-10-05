"use client";

import { STATUS_META, STATUS_ORDER, type LeadStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: LeadStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

/** Borderless <select> so the status can be changed right from the row. */
export function StatusSelect({
  status,
  onChange,
  disabled,
}: {
  status: LeadStatus;
  onChange: (s: LeadStatus) => void;
  disabled?: boolean;
}) {
  const meta = STATUS_META[status];
  return (
    <select
      aria-label="Follow-up status"
      value={status}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
      className={`cursor-pointer rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-medium outline-none transition hover:border-zinc-300 focus:border-zinc-400 disabled:cursor-wait ${meta.text}`}
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {STATUS_META[s].label}
        </option>
      ))}
    </select>
  );
}
