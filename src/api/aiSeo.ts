import axios from "./axios";
import config from "../utils/config";
import { handleApiError, refreshApiToken } from ".";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Types (backend contract: biponi-express service/ai) ───────────────────

export interface AiSeoContent {
  description: string;
  shortDescription: string;
  focusKeyphrase: string;
  seoTitle: string;
  metaDescription: string;
  tags: string[];
  google_category_type: string;
}

export interface AiSeoSuggestion {
  field: "discount" | "discountType" | "name" | "img" | "internalLinks" | "general";
  value: string;
  reason: string;
}

export interface AiSeoResult {
  entityType: string;
  cached: boolean;
  provider: string;
  model: string;
  generatedAt: string;
  content: AiSeoContent;
  suggestions: AiSeoSuggestion[];
  suggestedUpdateBody: Partial<AiSeoContent>;
  warnings: string[];
}

// A stored generation for the version-history panel
export interface AIGenerationVersion {
  id: string;
  createdAt: number;
  provider: string;
  model: string;
  result: AiSeoResult;
}

export interface AiSeoMeta {
  provider: string;
  model: string;
  cached: boolean;
  generatedAt?: string;
}

export interface AiSeoStreamCallbacks {
  onMeta?: (meta: AiSeoMeta) => void;
  onDescriptionDelta?: (chunk: string) => void;
  onDone?: (result: AiSeoResult) => void;
  onError?: (error: string) => void;
}

export interface AiSeoPayload {
  name?: string;
  parentId?: string | null;
  notes?: string;
  sampleProducts?: string[];
  regenerate?: boolean;
}

// ── SSE parsing (pure, exported for tests) ─────────────────────────────────

export interface SseEvent {
  event: string;
  data: any;
}

/**
 * Split a raw SSE buffer into complete frames.
 * Returns parsed events plus the trailing partial frame to carry into the
 * next chunk. Frames without a data: line are skipped.
 */
export function parseSseFrames(buffer: string): { events: SseEvent[]; rest: string } {
  const events: SseEvent[] = [];
  let rest = buffer;
  let sep = rest.indexOf("\n\n");
  while (sep !== -1) {
    const frame = rest.slice(0, sep);
    rest = rest.slice(sep + 2);
    const evLine = frame.split("\n").find((l) => l.startsWith("event:"));
    const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
    if (evLine && dataLine) {
      try {
        events.push({
          event: evLine.slice(6).trim(),
          data: JSON.parse(dataLine.slice(5).trim()),
        });
      } catch {
        // Malformed JSON payload — skip the frame
      }
    }
    sep = rest.indexOf("\n\n");
  }
  return { events, rest };
}

// ── Non-streaming (axios) ──────────────────────────────────────────────────

export const suggestCategorySeo = async (
  data: AiSeoPayload
): Promise<ApiResponse<AiSeoResult>> => {
  try {
    const response = await axios.post<any>(config.category.aiSeoSuggest(), data);
    if (response.status === 200)
      return { success: true, data: response.data?.data };
    return { success: false, error: response.data.error || "Failed to generate SEO content" };
  } catch (error: any) {
    console.error("Error suggesting category SEO:", error.message);
    return handleApiError(error);
  }
};

export const generateCategorySeo = async (
  categoryId: string,
  data: AiSeoPayload
): Promise<ApiResponse<AiSeoResult>> => {
  try {
    const response = await axios.post<any>(
      config.category.aiSeoGenerate(categoryId),
      data
    );
    if (response.status === 200)
      return { success: true, data: response.data?.data };
    return { success: false, error: response.data.error || "Failed to generate SEO content" };
  } catch (error: any) {
    console.error("Error generating category SEO:", error.message);
    return handleApiError(error);
  }
};

// ── Streaming (fetch + ReadableStream; first SSE consumer in the app) ──────

function absoluteUrl(path: string): string {
  const host = import.meta.env.VITE_API_BASE_URL || "";
  return `${host}${path}`;
}

async function openSse(
  path: string,
  data: AiSeoPayload,
  signal: AbortSignal
): Promise<Response> {
  const doFetch = () =>
    fetch(`${absoluteUrl(path)}?stream=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "x-access-token": localStorage.getItem("token") || "",
      },
      body: JSON.stringify({ ...data, regenerate: data.regenerate === true }),
      signal,
    });
  let response = await doFetch();
  // Raw fetch bypasses the axios 403-refresh interceptor — handle it once here
  if (response.status === 403) {
    const refreshed = await refreshApiToken();
    if (refreshed) {
      response = await doFetch();
    }
  }
  return response;
}

/**
 * Stream AI SEO generation over SSE. Events: meta → description* → done,
 * or error. Resolves with the final result, or rejects on transport errors
 * (callback onError also fires for every failure, including stream-level
 * error events from the server).
 */
export async function streamCategorySeo(
  path: string,
  data: AiSeoPayload,
  callbacks: AiSeoStreamCallbacks,
  signal: AbortSignal
): Promise<AiSeoResult | null> {
  let response: Response;
  try {
    response = await openSse(path, data, signal);
  } catch (err: any) {
    const message = err?.name === "AbortError" ? "Generation stopped by user" : "No response received from server";
    callbacks.onError?.(message);
    throw err;
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body?.error || message;
    } catch {
      // Non-JSON error body — keep the default message
    }
    callbacks.onError?.(message);
    throw new Error(message);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError?.("Streaming is not supported by this browser");
    throw new Error("No readable stream");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: AiSeoResult | null = null;
  let meta: AiSeoMeta | null = null;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { events, rest } = parseSseFrames(buffer);
      buffer = rest;
      for (const evt of events) {
        if (evt.event === "meta") {
          meta = evt.data as AiSeoMeta;
          callbacks.onMeta?.(meta);
        } else if (evt.event === "description") {
          callbacks.onDescriptionDelta?.(evt.data?.chunk || "");
        } else if (evt.event === "done") {
          finalResult = {
            ...(evt.data as AiSeoResult),
            cached: meta?.cached ?? false,
          };
          callbacks.onDone?.(finalResult);
        } else if (evt.event === "error") {
          callbacks.onError?.(evt.data?.error || "AI generation failed");
          throw new Error(evt.data?.error || "AI generation failed");
        }
      }
    }
  } catch (err: any) {
    if (err?.name === "AbortError") {
      callbacks.onError?.("Generation stopped by user");
    }
    throw err;
  }

  return finalResult;
}
