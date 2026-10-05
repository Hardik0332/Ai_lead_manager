"use client";

import { useEffect, useState } from "react";

import { STATUS_META, STATUS_ORDER, type Lead, type LeadInput } from "@/lib/types";

const EMPTY: LeadInput = {
  name: "",
  company: "",
  email: "",
  event_name: "",
  notes: "",
  status: "new",
};

export function LeadModal({
  open,
  lead,
  events,
  onClose,
  onSave,
}: {
  open: boolean;
  lead: Lead | null;
  events: string[];
  onClose: () => void;
  onSave: (data: LeadInput) => Promise<void>;
}) {
  // The parent keys this modal by open-state/edit target, so state resets via
  // remount whenever the modal opens for "new" or a different lead.
  const [form, setForm] = useState<LeadInput>(() =>
    lead
      ? {
          name: lead.name,
          company: lead.company,
          email: lead.email,
          event_name: lead.event_name,
          notes: lead.notes,
          status: lead.status,
        }
      : EMPTY,
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const set = (key: keyof LeadInput, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.company.trim()) e.company = "Company is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Enter a valid email address";
    if (!form.event_name.trim()) e.event_name = "Event is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        event_name: form.event_name.trim(),
      });
    } catch {
      /* parent shows the toast */
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (key: string) =>
    `w-full rounded border px-2.5 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none ${
      errors[key] ? "border-rose-500" : "border-zinc-300 focus:border-zinc-500"
    }`;
  const labelCls = "mb-1 block text-xs font-medium text-zinc-600";

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-zinc-900/30 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded border border-zinc-200 bg-white p-5 shadow-lg sm:rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium text-zinc-900">
            {lead ? "Edit lead" : "Add lead"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded px-1.5 py-0.5 text-sm text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
          >
            ✕
          </button>
        </div>

        <form
          className="grid grid-cols-1 gap-3.5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div>
            <label className={labelCls}>Name</label>
            <input
              autoFocus
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Priya Sharma"
              className={inputCls("name")}
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>
          <div>
            <label className={labelCls}>Company</label>
            <input
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Nimbus Analytics"
              className={inputCls("company")}
            />
            {errors.company && <p className="mt-1 text-xs text-rose-600">{errors.company}</p>}
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="priya@company.com"
              className={inputCls("email")}
            />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>
          <div>
            <label className={labelCls}>Event</label>
            <input
              value={form.event_name}
              onChange={(e) => set("event_name", e.target.value)}
              placeholder="SaaS Summit 2026"
              list="event-options"
              className={inputCls("event_name")}
            />
            <datalist id="event-options">
              {events.map((e) => (
                <option key={e} value={e} />
              ))}
            </datalist>
            {errors.event_name && (
              <p className="mt-1 text-xs text-rose-600">{errors.event_name}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Follow-up status</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full rounded border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Interaction notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={5}
              placeholder="Where you met, what you discussed, agreed next steps…"
              className={`${inputCls("notes")} resize-y`}
            />
            <p className="mt-1 text-xs text-zinc-400">
              Good notes make the AI summary and follow-up drafts much better.
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-zinc-100 pt-3.5 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? "Saving…" : lead ? "Save changes" : "Add lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
