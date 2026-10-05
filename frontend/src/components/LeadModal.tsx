"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

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
    `w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none ${
      errors[key] ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-indigo-500"
    }`;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            {lead ? "Edit lead" : "Add lead"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 uppercase">
              Name *
            </label>
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
            <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 uppercase">
              Company *
            </label>
            <input
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Nimbus Analytics"
              className={inputCls("company")}
            />
            {errors.company && <p className="mt-1 text-xs text-rose-600">{errors.company}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 uppercase">
              Email *
            </label>
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
            <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 uppercase">
              Event *
            </label>
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
            <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 uppercase">
              Follow-up status
            </label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold tracking-wide text-slate-600 uppercase">
              Interaction notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={5}
              placeholder="Where you met, what you discussed, agreed next steps…"
              className={`${inputCls("notes")} resize-y`}
            />
            <p className="mt-1 text-xs text-slate-400">
              Good notes make the AI summary and follow-up drafts much better.
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {lead ? "Save changes" : "Add lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
