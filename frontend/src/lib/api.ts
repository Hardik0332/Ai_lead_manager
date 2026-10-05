import type { Lead, LeadInput, Tone } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
      else if (Array.isArray(body.detail)) {
        detail = body.detail
          .map((e: { msg?: string }) => e.msg ?? "invalid value")
          .join("; ");
      }
    } catch {
      /* keep default detail */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface ListParams {
  search?: string;
  event?: string;
  status?: string;
  sort?: string;
}

export interface AiSummaryResp {
  lead_id: number;
  summary: string;
  source: string;
}

export interface AiFollowupResp {
  lead_id: number;
  message: string;
  source: string;
}

export const api = {
  health: () => req<{ status: string; ai_mode: string }>("/api/health"),
  listLeads: (p: ListParams) => {
    const qs = new URLSearchParams(
      Object.entries(p).filter(([, v]) => v !== undefined && v !== "") as [string, string][],
    );
    return req<Lead[]>(`/api/leads${qs.size ? `?${qs.toString()}` : ""}`);
  },
  events: () => req<{ events: string[] }>("/api/meta/events"),
  stats: () => req<{ counts: Record<string, number> }>("/api/meta/stats"),
  createLead: (data: LeadInput) =>
    req<Lead>("/api/leads", { method: "POST", body: JSON.stringify(data) }),
  updateLead: (id: number, data: LeadInput) =>
    req<Lead>(`/api/leads/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteLead: (id: number) => req<void>(`/api/leads/${id}`, { method: "DELETE" }),
  summarize: (id: number) =>
    req<AiSummaryResp>(`/api/leads/${id}/summary`, { method: "POST" }),
  followup: (id: number, tone: Tone) =>
    req<AiFollowupResp>(`/api/leads/${id}/followup`, {
      method: "POST",
      body: JSON.stringify({ tone }),
    }),
};
