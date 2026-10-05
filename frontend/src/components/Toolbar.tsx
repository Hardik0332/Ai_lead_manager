"use client";

import { Plus, Search } from "lucide-react";

export function Toolbar({
  search,
  onSearch,
  events,
  event,
  onEvent,
  sort,
  onSort,
  onAdd,
}: {
  search: string;
  onSearch: (v: string) => void;
  events: string[];
  event: string;
  onEvent: (v: string) => void;
  sort: string;
  onSort: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search name, company, email, event, notes…"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
        />
      </label>
      <div className="flex items-center gap-2">
        <select
          aria-label="Filter by event"
          value={event}
          onChange={(e) => onEvent(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none sm:flex-none"
        >
          <option value="">All events</option>
          {events.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort leads"
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none sm:flex-none"
        >
          <option value="recent">Recently updated</option>
          <option value="name">Name A–Z</option>
          <option value="company">Company A–Z</option>
          <option value="status">Status</option>
        </select>
        <button
          onClick={onAdd}
          className="inline-flex flex-none items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 active:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add lead
        </button>
      </div>
    </div>
  );
}
