"use client";

import { STATUS_META, STATUS_ORDER, type LeadStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: LeadStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

/** Badge-styled <select> so the status can be changed right from the row. */
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
    <div className={`inline-flex items-center rounded-full ring-1 ring-inset ${meta.chip}`}>
      <span className={`ml-2.5 h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      <select
        aria-label="Follow-up status"
        value={status}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as LeadStatus)}
        className="cursor-pointer appearance-none bg-transparent py-1 pr-2 pl-1.5 text-xs font-medium outline-none disabled:cursor-wait"
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>
    </div>
  );
}
