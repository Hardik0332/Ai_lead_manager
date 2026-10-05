"use client";

import { useState } from "react";
import { Building2, CalendarDays, ChevronDown, Pencil, Trash2 } from "lucide-react";

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
    <div className="border-b border-slate-100 last:border-b-0">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
        aria-expanded={expanded}
        className="grid cursor-pointer grid-cols-1 items-center gap-x-4 gap-y-2 px-4 py-3.5 transition hover:bg-slate-50/70 md:grid-cols-[minmax(170px,2fr)_minmax(130px,1.5fr)_minmax(130px,1.4fr)_auto_32px] md:gap-y-0"
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{lead.name}</p>
          <p className="truncate text-xs text-slate-500">{lead.email}</p>
        </div>

        {/* Mobile: company + event on one muted line; desktop: separate columns */}
        <p className="flex min-w-0 items-center gap-1.5 text-sm text-slate-600 md:hidden">
          <Building2 className="h-3.5 w-3.5 flex-none text-slate-400" />
          <span className="truncate">
            {lead.company} · {lead.event_name}
          </span>
        </p>
        <p className="hidden truncate text-sm text-slate-600 md:block">{lead.company}</p>
        <p className="hidden items-center gap-1.5 text-sm text-slate-500 md:flex">
          <CalendarDays className="h-3.5 w-3.5 flex-none text-slate-400" />
          <span className="truncate">{lead.event_name}</span>
        </p>

        <div
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <StatusSelect status={lead.status} onChange={onStatusChange} disabled={busy} />
        </div>

        <ChevronDown
          className={`hidden h-4 w-4 justify-self-end text-slate-400 transition-transform md:block ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-slate-100 bg-slate-50/60 px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Notes
                <span className="font-normal normal-case text-slate-400">
                  updated {formatUpdated(lead.updated_at)}
                </span>
              </div>
              <p className="thin-scroll max-h-40 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                {lead.notes || <span className="text-slate-400 italic">No notes yet.</span>}
              </p>
            </div>
            <div className="flex flex-none items-center gap-2">
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              {confirmDelete ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={onDelete}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Confirm delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  aria-label={`Delete ${lead.name}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
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
