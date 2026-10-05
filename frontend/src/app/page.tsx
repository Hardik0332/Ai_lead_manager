"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchX, Sparkles, Users } from "lucide-react";

import type { FollowupDraft } from "@/components/AiPanel";
import { LeadCard } from "@/components/LeadCard";
import { LeadModal } from "@/components/LeadModal";
import { StatsBar } from "@/components/StatsBar";
import { Toast, type ToastState } from "@/components/Toast";
import { Toolbar } from "@/components/Toolbar";
import { api } from "@/lib/api";
import type { Lead, LeadInput, LeadStatus } from "@/lib/types";

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [aiMode, setAiMode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [event, setEvent] = useState("");
  const [sort, setSort] = useState("recent");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [busyLeadId, setBusyLeadId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, FollowupDraft>>({});
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, kind: "ok" | "error" = "ok") => {
    setToast({ id: Date.now(), msg, kind });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Debounce the search box so we don't hammer the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filtersActive = Boolean(search || status || event);

  // Initial + filter-driven loads. The previous list stays visible while a
  // refetch is in flight; only the very first load shows skeletons.
  useEffect(() => {
    let ignore = false;
    api
      .listLeads({ search, status: status ?? "", event, sort })
      .then((data) => {
        if (ignore) return;
        setLeads(data);
        setListError(null);
      })
      .catch((e) => {
        if (ignore) return;
        setListError(
          e instanceof Error
            ? `Could not load leads: ${e.message}`
            : "Could not load leads — is the backend running?",
        );
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [search, status, event, sort]);

  useEffect(() => {
    let ignore = false;
    Promise.all([api.events(), api.stats(), api.health().catch(() => null)])
      .then(([ev, st, health]) => {
        if (ignore) return;
        setEvents(ev.events);
        setCounts(st.counts);
        if (health) setAiMode(health.ai_mode);
      })
      .catch(() => {
        /* non-fatal — stats/events refresh on next mutation */
      });
    return () => {
      ignore = true;
    };
  }, []);

  const total = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts],
  );

  const refreshAfterMutation = useCallback(async () => {
    try {
      const [data, ev, st, health] = await Promise.all([
        api.listLeads({ search, status: status ?? "", event, sort }),
        api.events(),
        api.stats(),
        api.health().catch(() => null),
      ]);
      setLeads(data);
      setEvents(ev.events);
      setCounts(st.counts);
      setListError(null);
      if (health) setAiMode(health.ai_mode);
    } catch {
      /* list error state, if any, is left as-is; toast already shown */
    }
  }, [search, status, event, sort]);

  const saveLead = async (data: LeadInput) => {
    try {
      if (editing) {
        await api.updateLead(editing.id, data);
        showToast("Lead updated");
      } else {
        const created = await api.createLead(data);
        showToast("Lead added");
        setExpandedId(created.id);
      }
      setModalOpen(false);
      setEditing(null);
      await refreshAfterMutation();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Save failed", "error");
      throw e; // keep the modal open so the user can fix the input
    }
  };

  const deleteLead = async (lead: Lead) => {
    setBusyLeadId(lead.id);
    try {
      await api.deleteLead(lead.id);
      setDrafts((d) => {
        const next = { ...d };
        delete next[lead.id];
        return next;
      });
      if (expandedId === lead.id) setExpandedId(null);
      showToast(`Deleted ${lead.name}`);
      await refreshAfterMutation();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Delete failed", "error");
    } finally {
      setBusyLeadId(null);
    }
  };

  const changeStatus = async (lead: Lead, s: LeadStatus) => {
    if (s === lead.status) return;
    setBusyLeadId(lead.id);
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, status: s } : l)));
    try {
      await api.updateLead(lead.id, {
        name: lead.name,
        company: lead.company,
        email: lead.email,
        event_name: lead.event_name,
        notes: lead.notes,
        status: s,
      });
      await refreshAfterMutation();
    } catch (e) {
      setLeads((ls) => ls.map((l) => (l.id === lead.id ? { ...l, status: lead.status } : l)));
      showToast(e instanceof Error ? e.message : "Status change failed", "error");
    } finally {
      setBusyLeadId(null);
    }
  };

  const setSummary = (leadId: number, summary: string) => {
    setLeads((ls) => ls.map((l) => (l.id === leadId ? { ...l, ai_summary: summary } : l)));
  };

  const setDraft = (leadId: number) => (d: FollowupDraft | undefined) => {
    setDrafts((prev) => {
      const next = { ...prev };
      if (d) next[leadId] = d;
      else delete next[leadId];
      return next;
    });
  };

  const clearFilters = () => {
    setSearchInput("");
    setStatus(null);
    setEvent("");
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-semibold text-slate-900">LeadLoop</h1>
              <p className="truncate text-xs text-slate-500">AI Event Lead Manager</p>
            </div>
          </div>
          {aiMode && (
            <span
              title={
                aiMode === "llm"
                  ? "AI features are calling the configured LLM"
                  : "No API key set — AI features use the built-in offline fallback"
              }
              className={`inline-flex flex-none items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
                aiMode === "llm"
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                  : "bg-slate-100 text-slate-600 ring-slate-500/20"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {aiMode === "llm" ? "AI: LLM connected" : "AI: offline fallback"}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6">
        <StatsBar
          counts={counts}
          total={total}
          activeStatus={status}
          onSelectStatus={(s) => setStatus(s)}
        />

        <Toolbar
          search={searchInput}
          onSearch={setSearchInput}
          events={events}
          event={event}
          onEvent={setEvent}
          sort={sort}
          onSort={setSort}
          onAdd={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        />

        {listError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {listError}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(170px,2fr)_minmax(130px,1.5fr)_minmax(130px,1.4fr)_auto_32px] gap-x-4 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-xs font-semibold tracking-wide text-slate-500 uppercase md:grid">
            <span>Name</span>
            <span>Company</span>
            <span>Event</span>
            <span>Status</span>
            <span />
          </div>

          {loading ? (
            <div className="space-y-3 p-4" aria-label="Loading leads">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
              {filtersActive ? (
                <>
                  <SearchX className="h-8 w-8 text-slate-300" />
                  <p className="font-medium text-slate-700">No leads match your filters</p>
                  <button
                    onClick={clearFilters}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <Users className="h-8 w-8 text-slate-300" />
                  <p className="font-medium text-slate-700">No leads yet</p>
                  <p className="max-w-sm text-sm text-slate-500">
                    Add the first person you met at an event, then let AI summarize the
                    conversation and draft the follow-up.
                  </p>
                  <button
                    onClick={() => {
                      setEditing(null);
                      setModalOpen(true);
                    }}
                    className="mt-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                  >
                    Add your first lead
                  </button>
                </>
              )}
            </div>
          ) : (
            leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                expanded={expandedId === lead.id}
                onToggle={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                onEdit={() => {
                  setEditing(lead);
                  setModalOpen(true);
                }}
                onDelete={() => void deleteLead(lead)}
                onStatusChange={(s) => void changeStatus(lead, s)}
                draft={drafts[lead.id]}
                onDraftChange={setDraft(lead.id)}
                onSummary={setSummary}
                onError={(msg) => showToast(msg, "error")}
                busy={busyLeadId === lead.id}
              />
            ))
          )}

          {!loading && leads.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2 text-xs text-slate-500">
              {leads.length} lead{leads.length === 1 ? "" : "s"}
              {filtersActive && " matching filters"} · click a row to expand notes &amp; AI tools
            </div>
          )}
        </div>
      </main>

      <LeadModal
        key={modalOpen ? (editing ? `edit-${editing.id}` : "new") : "closed"}
        open={modalOpen}
        lead={editing}
        events={events}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={saveLead}
      />
      <Toast toast={toast} />
    </div>
  );
}
