"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { AiPanel, type FollowupDraft } from "@/components/AiPanel";
import { StatusSelect } from "@/components/StatusBadge";
import type { Lead, LeadStatus } from "@/lib/types";

function formatUpdated(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function LeadCard({
  lead,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onStatusChange,
  draft,
  onDraftChange,
  onSummary,
  onError,
  busy,
}: {
  lead: Lead;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (s: LeadStatus) => void;
  draft: FollowupDraft | undefined;
  onDraftChange: (d: FollowupDraft | undefined) => void;
  onSummary: (leadId: number, summary: string) => void;
  onError: (msg: string) => void;
  busy: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="border-b border-zinc-200 last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
        aria-expanded={expanded}
        className="grid cursor-pointer grid-cols-1 items-center gap-x-4 gap-y-1 px-4 py-2.5 transition hover:bg-zinc-50 md:grid-cols-[minmax(170px,2fr)_minmax(130px,1.5fr)_minmax(130px,1.4fr)_auto_24px]"
      >
        <div className="min-w-0">
          <p className="truncate text-sm text-zinc-900">{lead.name}</p>
          <p className="truncate text-xs text-zinc-500">{lead.email}</p>
        </div>

        {/* Mobile: company + event on one muted line; desktop: separate columns */}
        <p className="min-w-0 truncate text-sm text-zinc-600 md:hidden">
          {lead.company} · {lead.event_name}
        </p>
        <p className="hidden truncate text-sm text-zinc-600 md:block">{lead.company}</p>
        <p className="hidden truncate text-sm text-zinc-500 md:block">{lead.event_name}</p>

        <div
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <StatusSelect status={lead.status} onChange={onStatusChange} disabled={busy} />
        </div>

        <ChevronDown
          className={`hidden h-3.5 w-3.5 justify-self-end text-zinc-400 transition-transform md:block ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-zinc-100 bg-zinc-50 px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-medium">Notes</span>
                <span>· updated {formatUpdated(lead.updated_at)}</span>
              </div>
              <p className="thin-scroll max-h-40 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap text-zinc-700">
                {lead.notes || <span className="text-zinc-400 italic">No notes yet.</span>}
              </p>
            </div>
            <div className="flex flex-none items-center gap-2">
              <button
                onClick={onEdit}
                className="rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                Edit
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={onDelete}
                    className="rounded bg-rose-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-rose-500"
                  >
                    Confirm delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  aria-label={`Delete ${lead.name}`}
                  className="rounded border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-zinc-100"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          <AiPanel
            lead={lead}
            draft={draft}
            onDraftChange={onDraftChange}
            onSummary={onSummary}
            onError={onError}
          />
        </div>
      )}
    </div>
  );
}
