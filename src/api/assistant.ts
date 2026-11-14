import axios from "./axios";
import { handleApiError, refreshApiToken } from ".";
import { parseSseFrames } from "./aiSeo";

// Backend contract: biponi-express routes/v1/Assistant + service/assistant
const BASE = "/api/v1/assistant";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface ToolUsed {
  name: string;
  ok: boolean;
  durationMs: number;
}

export interface AssistantAnswer {
  sessionId: string;
  messageId: string;
  content: string;
  toolsUsed: ToolUsed[];
  provider: string;
  model: string;
}

export interface AssistantMeta {
  sessionId: string;
  messageId: string;
  provider?: string;
  model?: string;
  toolsAvailable?: number;
}

export interface ToolStartEvent {
  toolCallId: string;
  name: string;
  args?: Record<string, unknown>;
}

export interface ToolEndEvent {
  toolCallId: string;
  name: string;
  ok: boolean;
  durationMs: number;
  resultBytes: number;
}

export interface SessionSummary {
  sessionId: string;
  title: string;
  preview: string;
  updatedAt: string;
}

export interface StoredMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  toolCalls?: { name: string }[];
  name?: string;
  createdAt?: string;
}

export interface ToolSummary {
  name: string;
  description: string;
  permission: { page: string; action: string } | null;
  readOnly: boolean;
}

export interface AssistantStreamCallbacks {
  onMeta?: (meta: AssistantMeta) => void;
  onDelta?: (chunk: string) => void;
  onToolStart?: (event: ToolStartEvent) => void;
  onToolEnd?: (event: ToolEndEvent) => void;
  onDone?: (answer: AssistantAnswer) => void;
  onError?: (error: string) => void;
}

// ── Chat (SSE, mirrors aiSeo.ts openSse) ───────────────────────────────────

async function openAssistantSse(
  body: { message: string; sessionId?: string },
  signal: AbortSignal
): Promise<Response> {
  const host = import.meta.env.VITE_API_BASE_URL || "";
  const doFetch = () =>
    fetch(`${host}${BASE}/chat?stream=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "x-access-token": localStorage.getItem("token") || "",
      },
      body: JSON.stringify(body),
      signal,
    });
  let response = await doFetch();
  // Raw fetch bypasses the axios 403-refresh interceptor — handle it once here
  if (response.status === 403) {
    const refreshed = await refreshApiToken();
    if (refreshed) response = await doFetch();
  }
  return response;
}

/**
 * Send one assistant message over SSE.
 * Events: meta → (tool_start → tool_end)* → delta* → done, or error.
 * Resolves with the final answer; onError fires for every failure path too.
 */
export async function askAssistant(
  message: string,
  sessionId: string | undefined,
  callbacks: AssistantStreamCallbacks,
  signal: AbortSignal
): Promise<AssistantAnswer | null> {
  let response: Response;
  try {
    response = await openAssistantSse({ message, sessionId }, signal);
  } catch (err: any) {
    const msg =
      err?.name === "AbortError" ? "Request stopped" : "No response received from server";
    callbacks.onError?.(msg);
    throw err;
  }

  if (!response.ok) {
    let msg = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      msg = body?.error || msg;
    } catch {
      // Non-JSON error body — keep the default message
    }
    callbacks.onError?.(msg);
    throw new Error(msg);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError?.("Streaming is not supported by this browser");
    throw new Error("No readable stream");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let finalAnswer: AssistantAnswer | null = null;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { events, rest } = parseSseFrames(buffer);
      buffer = rest;
      for (const evt of events) {
        if (evt.event === "meta") {
          callbacks.onMeta?.(evt.data as AssistantMeta);
        } else if (evt.event === "delta") {
          callbacks.onDelta?.(evt.data?.chunk || "");
        } else if (evt.event === "tool_start") {
          callbacks.onToolStart?.(evt.data as ToolStartEvent);
        } else if (evt.event === "tool_end") {
          callbacks.onToolEnd?.(evt.data as ToolEndEvent);
        } else if (evt.event === "done") {
          finalAnswer = evt.data as AssistantAnswer;
          callbacks.onDone?.(finalAnswer);
        } else if (evt.event === "error") {
          const msg = evt.data?.error || "Assistant request failed";
          callbacks.onError?.(msg);
          throw new Error(msg);
        }
      }
    }
  } catch (err: any) {
    if (err?.name === "AbortError") callbacks.onError?.("Request stopped");
    throw err;
  }

  return finalAnswer;
}

// ── Sessions / tools (axios REST) ──────────────────────────────────────────

export async function listSessions(
  page = 1,
  limit = 20
): Promise<ApiResponse<{ sessions: SessionSummary[]; total: number; totalPages: number }>> {
  try {
    const response = await axios.get<any>(`${BASE}/sessions?page=${page}&limit=${limit}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error listing assistant sessions:", error.message);
    return handleApiError(error);
  }
}

export async function getSession(
  sessionId: string
): Promise<ApiResponse<{ sessionId: string; title: string; messages: StoredMessage[] }>> {
  try {
    const response = await axios.get<any>(`${BASE}/sessions/${sessionId}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error loading assistant session:", error.message);
    return handleApiError(error);
  }
}

export async function listMyTools(): Promise<ApiResponse<{ tools: ToolSummary[] }>> {
  try {
    const response = await axios.get<any>(`${BASE}/tools`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error listing assistant tools:", error.message);
    return handleApiError(error);
  }
}

export async function reindexDocs(): Promise<ApiResponse<Record<string, number>>> {
  try {
    const response = await axios.post<any>(`${BASE}/docs/reindex`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    console.error("Error reindexing docs:", error.message);
    return handleApiError(error);
  }
}
