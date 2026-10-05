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

export const STATUS_META: Record<LeadStatus, { label: string; text: string; dot: string }> = {
  new: { label: "New", text: "text-sky-700", dot: "bg-sky-500" },
  contacted: { label: "Contacted", text: "text-amber-700", dot: "bg-amber-500" },
  meeting_booked: { label: "Meeting booked", text: "text-violet-700", dot: "bg-violet-500" },
  closed: { label: "Closed", text: "text-zinc-500", dot: "bg-zinc-400" },
};

export const STATUS_ORDER: LeadStatus[] = ["new", "contacted", "meeting_booked", "closed"];

export const TONE_META: Record<Tone, string> = {
  friendly: "Friendly",
  formal: "Formal",
  short: "Short",
};
