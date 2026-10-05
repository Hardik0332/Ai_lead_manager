"use client";

import { Search } from "lucide-react";

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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search leads"
          className="w-full rounded border border-zinc-300 bg-white py-1.5 pr-3 pl-8 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none"
        />
      </label>
      <div className="flex items-center gap-2">
        <select
          aria-label="Filter by event"
          value={event}
          onChange={(e) => onEvent(e.target.value)}
          className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-700 focus:border-zinc-500 focus:outline-none sm:flex-none"
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
          className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-700 focus:border-zinc-500 focus:outline-none sm:flex-none"
        >
          <option value="recent">Recently updated</option>
          <option value="name">Name A–Z</option>
          <option value="company">Company A–Z</option>
          <option value="status">Status</option>
        </select>
        <button
          onClick={onAdd}
          className="flex-none rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700 active:bg-zinc-900"
        >
          Add lead
        </button>
      </div>
    </div>
  );
}
