import { useCallback, useMemo, useRef, useState } from "react";
import { useExternalStoreRuntime, type AppendMessage, type ThreadMessageLike } from "@assistant-ui/react";
import {
  askAssistant,
  getSession,
  type ToolEndEvent,
  type ToolStartEvent,
  type StoredMessage,
} from "../../api/assistant";
import type { ArtifactDescriptor, AssistantPartEvent } from "./artifacts/types";

// ── Message model ──────────────────────────────────────────────────────────

export type UiPart =
  | { type: "text"; text: string }
  // No result → renders as "Running tool" while the message streams
  | {
      type: "tool-call";
      toolCallId: string;
      toolName: string;
      argsText: string;
      result?: string;
      isError?: boolean;
    }
  // data-artifact parts render via the registered ArtifactInlineCard renderer
  | { type: "data-artifact"; id: string; data: ArtifactDescriptor };

export interface UiMessage {
  id: string;
  role: "user" | "assistant";
  content: UiPart[];
  /** Assistant still streaming */
  streaming?: boolean;
}

const newId = (() => {
  let n = 0;
  return () => `m${Date.now().toString(36)}-${n++}`;
})();

/** Welcome-screen suggestion chips (rendered by the thread's ThreadSuggestions). */
const SUGGESTIONS = [
  { title: "Sales this week vs last week", prompt: "Sales this week vs last week" },
  { title: "How do prepayment rules work?", prompt: "How do prepayment rules work?" },
  { title: "Top selling products last 30 days", prompt: "Top selling products last 30 days" },
  { title: "Dead stock older than 90 days", prompt: "Dead stock older than 90 days" },
];

/** Stored session messages → UI messages (tool messages become tool-call parts). */
const mapStoredMessages = (messages: StoredMessage[]): UiMessage[] => {
  const out: UiMessage[] = [];
  for (const m of messages) {
    if (m.role === "user") {
      out.push({ id: newId(), role: "user", content: [{ type: "text", text: m.content }] });
    } else if (m.role === "assistant") {
      const content: UiPart[] = [{ type: "text", text: m.content }];
      // Artifact parts arrive after the text, in order
      for (const part of m.parts ?? []) {
        content.push({ type: "data-artifact", id: part.id, data: storedPartToDescriptor(part) });
      }
      out.push({ id: newId(), role: "assistant", content });
    } else if (m.role === "tool" && m.name) {
      // History collapses tool activity to name-only; render as used-tool rows
      out.push({
        id: newId(),
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: newId(),
            toolName: m.name,
            argsText: "{}",
            result: "Done",
          },
        ],
      });
    }
  }
  return out;
};

const storedPartToDescriptor = (part: import("./artifacts/types").StoredPart): ArtifactDescriptor => {
  if (part.kind === "doc") {
    return { id: part.id, kind: "doc", title: part.title, payload: { markdown: part.markdown } };
  }
  if (part.kind === "sheet") {
    return {
      id: part.id,
      kind: "sheet",
      title: part.title,
      payload: { columns: part.columns, rows: part.rows, totalRows: part.totalRows },
    };
  }
  return { id: part.id, kind: "chart", title: part.title, payload: part.chart };
};

// ── Hook ───────────────────────────────────────────────────────────────────

export interface UseAssistantRuntimeOptions {
  /** Notify the parent of the active session (sidebar highlight) */
  onSessionIdChange?: (sessionId: string | undefined) => void;
  /** Notify the parent to refresh its session list (after each answer) */
  onSessionsRefresh?: () => void;
  /** Surface stream errors as toasts */
  onError?: (message: string) => void;
}

export const useAssistantRuntime = ({
  onSessionIdChange,
  onSessionsRefresh,
  onError,
}: UseAssistantRuntimeOptions = {}) => {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const sessionIdRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  // Live artifacts indexed by partId → message id + descriptor id, so deltas
  // and completion can patch the right in-flight part.
  const partIndexRef = useRef<Map<string, { messageId: string; artifactId: string }>>(new Map());
  // Mirror of messages for reading inside callbacks without stale closures
  const messagesRef = useRef<UiMessage[]>(messages);
  messagesRef.current = messages;

  const patchAssistantMessage = useCallback(
    (messageId: string, patch: (msg: UiMessage) => UiMessage) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? patch(m) : m))
      );
    },
    []
  );

  const appendDelta = useCallback(
    (chunk: string) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last.role !== "assistant") return prev;
        const parts = [...last.content];
        const lastText = parts[parts.length - 1];
        if (lastText?.type === "text") {
          parts[parts.length - 1] = { type: "text", text: lastText.text + chunk };
        } else {
          parts.push({ type: "text", text: chunk });
        }
        return [...prev.slice(0, -1), { ...last, content: parts }];
      });
    },
    []
  );

  const handleToolStart = useCallback(
    (event: ToolStartEvent) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last.role !== "assistant") return prev;
        const toolPart: UiPart = {
          type: "tool-call",
          toolCallId: event.toolCallId,
          toolName: event.name,
          argsText: JSON.stringify(event.args ?? {}),
        };
        return [
          ...prev.slice(0, -1),
          { ...last, content: [...last.content, toolPart] },
        ];
      });
    },
    []
  );

  const handleToolEnd = useCallback(
    (event: ToolEndEvent) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.role !== "assistant") return m;
          let changed = false;
          const content = m.content.map((part): UiPart => {
            if (part.type === "tool-call" && part.toolCallId === event.toolCallId && part.result === undefined) {
              changed = true;
              return {
                ...part,
                isError: !event.ok,
                result: event.ok
                  ? `ok · ${event.durationMs}ms`
                  : `failed after ${event.durationMs}ms`,
              };
            }
            return part;
          });
          return changed ? { ...m, content } : m;
        })
      );
    },
    []
  );

  const handlePart = useCallback(
    (event: AssistantPartEvent) => {
      if (event.status === "start") {
        const last = messagesRef.current[messagesRef.current.length - 1];
        if (!last || last.role !== "assistant") return;
        const artifactId = `a-${event.partId}`;
        const descriptor: ArtifactDescriptor = {
          id: artifactId,
          kind: event.type ?? "doc",
          title: event.title ?? "Artifact",
          payload: event.type === "doc" ? { markdown: "" } : { columns: [], rows: [] },
          streaming: true,
        };
        partIndexRef.current.set(event.partId, { messageId: last.id, artifactId });
        setMessages((prev) => {
          const target = prev[prev.length - 1];
          if (!target || target.id !== last.id) return prev;
          return [
            ...prev.slice(0, -1),
            {
              ...target,
              content: [
                ...target.content,
                { type: "data-artifact", id: artifactId, data: descriptor },
              ],
            },
          ];
        });
        return;
      }

      const indexed = partIndexRef.current.get(event.partId);
      if (!indexed) return;
      const { messageId, artifactId } = indexed;

      patchAssistantMessage(messageId, (msg) => ({
        ...msg,
        content: msg.content.map((part) => {
          if (part.type !== "data-artifact" || part.id !== artifactId) return part;
          const data = { ...part.data };
          if (event.status === "delta") {
            // Docs stream markdown chunks
            data.payload = {
              ...(data.payload as { markdown: string }),
              markdown:
                (data.payload as { markdown?: string }).markdown + (event.chunk ?? ""),
            };
          } else if (event.status === "done") {
            data.streaming = false;
            if (event.payload) data.payload = event.payload;
          }
          return { ...part, data };
        }),
      }));

      if (event.status === "done") partIndexRef.current.delete(event.partId);
    },
    [patchAssistantMessage]
  );

  const onNew = useCallback(
    async (message: AppendMessage) => {
      const text = message.content
        .filter((c) => c.type === "text")
        .map((c) => (c as { text: string }).text)
        .join("\n")
        .trim();
      if (!text) return;

      const userMessage: UiMessage = {
        id: newId(),
        role: "user",
        content: [{ type: "text", text }],
      };
      const assistantMessage: UiMessage = {
        id: newId(),
        role: "assistant",
        streaming: true,
        content: [{ type: "text", text: "" }],
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsRunning(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await askAssistant(text, sessionIdRef.current, {
          onMeta: (meta) => {
            sessionIdRef.current = meta.sessionId;
            onSessionIdChange?.(meta.sessionId);
          },
          onDelta: appendDelta,
          onToolStart: handleToolStart,
          onToolEnd: handleToolEnd,
          onPart: handlePart,
          onError: (error) => onError?.(error),
        }, controller.signal);
        onSessionsRefresh?.();
      } catch {
        // Stream aborted or failed — the trailing text part stays as-is
      } finally {
        partIndexRef.current.clear();
        setIsRunning(false);
        abortRef.current = null;
        setMessages((prev) =>
          prev.map((m) => (m.streaming ? { ...m, streaming: false } : m))
        );
      }
    },
    [appendDelta, handleToolEnd, handleToolStart, handlePart, onError, onSessionIdChange, onSessionsRefresh]
  );

  const onCancel = useCallback(async () => {
    abortRef.current?.abort();
  }, []);

  const runtime = useExternalStoreRuntime({
    messages,
    isRunning,
    suggestions: SUGGESTIONS,
    convertMessage: (m: UiMessage): ThreadMessageLike => ({
      id: m.id,
      role: m.role,
      content: m.content,
      // status is only valid on assistant messages
      ...(m.role === "assistant"
        ? m.streaming
          ? { status: { type: "running" as const } }
          : { status: { type: "complete" as const, reason: "stop" as const } }
        : {}),
    }),
    onNew,
    onCancel,
  });

  /** Load a stored session into the runtime (sidebar click). */
  const hydrateSession = useCallback(
    async (id: string) => {
      abortRef.current?.abort();
      const result = await getSession(id);
      if (result.success && result.data) {
        sessionIdRef.current = id;
        onSessionIdChange?.(id);
        setMessages(mapStoredMessages(result.data.messages));
      }
    },
    [onSessionIdChange]
  );

  /** Reset to an empty new chat. */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    sessionIdRef.current = undefined;
    onSessionIdChange?.(undefined);
    setMessages([]);
  }, [onSessionIdChange]);

  return useMemo(
    () => ({ runtime, messages, hydrateSession, reset, busy: isRunning }),
    [runtime, messages, hydrateSession, reset, isRunning]
  );
};
