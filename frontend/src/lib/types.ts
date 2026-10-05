export type LeadStatus = "new" | "contacted" | "meeting_booked" | "closed";

export type Tone = "friendly" | "formal" | "short";

export interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  event_name: string;
  notes: string;
  status: LeadStatus;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadInput {
  name: string;
  company: string;
  email: string;
  event_name: string;
  notes: string;
  status: LeadStatus;
}

export const STATUS_META: Record<LeadStatus, { label: string; chip: string; dot: string }> = {
  new: {
    label: "New",
    chip: "bg-sky-50 text-sky-700 ring-sky-600/20",
    dot: "bg-sky-500",
  },
  contacted: {
    label: "Contacted",
    chip: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  meeting_booked: {
    label: "Meeting booked",
    chip: "bg-violet-50 text-violet-700 ring-violet-600/20",
    dot: "bg-violet-500",
  },
  closed: {
    label: "Closed",
    chip: "bg-slate-100 text-slate-600 ring-slate-500/20",
    dot: "bg-slate-400",
  },
};

export const STATUS_ORDER: LeadStatus[] = ["new", "contacted", "meeting_booked", "closed"];

export const TONE_META: Record<Tone, string> = {
  friendly: "Friendly",
  formal: "Formal",
  short: "Short",
};
