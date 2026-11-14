import { useEffect, useRef, useState } from "react";
import { Send, Square, Wrench, Trash2, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { ScrollArea } from "../../components/ui/scroll-area";
import toast from "react-hot-toast";
import {
  askAssistant,
  getSession,
  type ToolUsed,
  type ToolStartEvent,
  type ToolEndEvent,
} from "../../api/assistant";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  tools?: ToolUsed[];
  streaming?: boolean;
}

// Live tool activity shown while the agent works (between tool_start and done)
interface ToolActivity {
  toolCallId: string;
  name: string;
  startedAt: number;
  done?: boolean;
  ok?: boolean;
  durationMs?: number;
}

const SUGGESTIONS = [
  "Sales this week vs last week",
  "How do prepayment rules work?",
  "Top selling products last 30 days",
  "Dead stock older than 90 days",
];

interface AssistantChatProps {
  /** Sheet/panel mode: fill parent height, hide title chrome, compact controls */
  embedded?: boolean;
  /** Initial messages — used when the parent pre-loads a session */
  initialMessages?: ChatMessage[];
  /** Notify the parent of the active session (sidebar highlight) */
  onSessionIdChange?: (sessionId: string | undefined) => void;
  /** Notify the parent to refresh its session list (after each answer) */
  onSessionsRefresh?: () => void;
}

/**
 * The assistant conversation column (messages + input + live tool activity).
 * Standalone in pages/assistant/index.tsx (title chrome + suggestions) and
 * embedded in components/assistant/AssistantSheet.tsx (compact controls).
 * The parent can pre-load a session via key-remount + initialMessages.
 */
const AssistantChat = ({
  embedded = false,
  initialMessages,
  onSessionIdChange,
  onSessionsRefresh,
}: AssistantChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [toolsOpen, setToolsOpen] = useState(!embedded);
  const [liveTools, setLiveTools] = useState<ToolActivity[]>([]);

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveTools]);

  const appendDelta = (chunk: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.role !== "assistant" || !last.streaming) {
        return [...prev, { role: "assistant", content: chunk, streaming: true }];
      }
      return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
    });
  };

  const finalizeMessage = (tools: ToolUsed[]) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && last.streaming) {
        return [...prev.slice(0, -1), { ...last, streaming: false, tools }];
      }
      return prev;
    });
  };

  const handleToolStart = (event: ToolStartEvent) => {
    setLiveTools((prev) => [
      ...prev.filter((t) => t.toolCallId !== event.toolCallId),
      { toolCallId: event.toolCallId, name: event.name, startedAt: Date.now() },
    ]);
  };

  const handleToolEnd = (event: ToolEndEvent) => {
    setLiveTools((prev) =>
      prev.map((t) =>
        t.toolCallId === event.toolCallId
          ? { ...t, done: true, ok: event.ok, durationMs: event.durationMs }
          : t
      )
    );
    // Drop finished entries shortly after — provenance chips carry the record
    setTimeout(() => {
      setLiveTools((prev) => prev.filter((t) => t.toolCallId !== event.toolCallId));
    }, 1200);
  };

  const send = async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setBusy(true);
    setLiveTools([]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const answer = await askAssistant(message, sessionId, {
        onMeta: (meta) => {
          setSessionId(meta.sessionId);
          onSessionIdChange?.(meta.sessionId);
        },
        onDelta: appendDelta,
        onToolStart: handleToolStart,
        onToolEnd: handleToolEnd,
        onError: (error) => toast.error(error),
      }, controller.signal);
      finalizeMessage(answer?.toolsUsed ?? []);
      onSessionsRefresh?.();
    } catch {
      finalizeMessage([]);
    } finally {
      setBusy(false);
      setLiveTools([]);
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
  };

  const newChat = () => {
    stop();
    setSessionId(undefined);
    onSessionIdChange?.(undefined);
    setMessages([]);
  };

  return (
    <div className={`flex flex-1 min-h-0 overflow-hidden ${embedded ? "h-full" : ""}`}>
      {/* Chat column */}
      <div
        className={`flex flex-1 flex-col overflow-hidden ${
          embedded ? "" : "border rounded-lg bg-card"
        }`}
      >
        {/* Title chrome — full page only; the sheet provides its own header */}
        {!embedded && (
          <div className='flex items-center justify-between px-4 py-3 border-b'>
            <div>
              <h1 className='text-base font-semibold'>AI Assistant</h1>
              <p className='text-xs text-muted-foreground'>
                Customer lookups · order status · analytics · internal docs
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setToolsOpen((v) => !v)}
              title='Toggle tool activity'
            >
              <Wrench className='w-4 h-4 mr-1' /> Tools
            </Button>
          </div>
        )}

        <ScrollArea className='flex-1 p-4'>
          <div className='space-y-4 max-w-3xl mx-auto'>
            {messages.length === 0 && (
              <div className='text-center py-10 space-y-4'>
                <p className='text-muted-foreground'>
                  Ask about a customer, order, courier status, sales, or how something works.
                </p>
                <div className='flex flex-wrap justify-center gap-2'>
                  {SUGGESTIONS.map((s) => (
                    <Button key={s} variant='secondary' size='sm' onClick={() => send(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 whitespace-pre-wrap text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {m.content}
                  {m.streaming && (
                    <span className='inline-block animate-pulse ml-1'>▍</span>
                  )}
                  {m.tools && m.tools.length > 0 && (
                    <div className='mt-2 flex flex-wrap gap-1'>
                      {m.tools.map((t, ti) => (
                        <span
                          key={ti}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            t.ok
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-destructive/10 text-destructive"
                          }`}
                          title={t.ok ? `${t.durationMs} ms` : "tool failed"}
                        >
                          {t.name} · {t.durationMs}ms
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Live tool activity */}
            {toolsOpen && liveTools.length > 0 && (
              <div className='flex justify-start'>
                <div className='bg-muted/60 rounded-lg px-3 py-2 space-y-1'>
                  {liveTools.map((t) => (
                    <div key={t.toolCallId} className='text-xs flex items-center gap-2'>
                      {t.done ? (
                        t.ok ? (
                          <span className='text-green-600'>✓</span>
                        ) : (
                          <span className='text-destructive'>✗</span>
                        )
                      ) : (
                        <Loader2 className='w-3 h-3 animate-spin' />
                      )}
                      <span className='font-mono'>{t.name}</span>
                      {t.durationMs !== undefined && (
                        <span className='text-muted-foreground'>{t.durationMs}ms</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className='border-t p-3'>
          <div className={`flex gap-2 items-end ${embedded ? "" : "max-w-3xl mx-auto"}`}>
            {embedded && (
              <>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={newChat}
                  title='New chat'
                  className='shrink-0'
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => setToolsOpen((v) => !v)}
                  title='Toggle tool activity'
                  className={`shrink-0 ${toolsOpen ? "text-primary" : ""}`}
                >
                  <Wrench className='w-4 h-4' />
                </Button>
              </>
            )}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder='Ask anything — e.g. "order 12345 status" or "sales this week vs last week"'
              rows={1}
              className='min-h-[44px] max-h-40 resize-none'
              disabled={busy}
            />
            {busy ? (
              <Button variant='destructive' size='icon' onClick={stop} title='Stop'>
                <Square className='w-4 h-4' />
              </Button>
            ) : (
              <Button size='icon' onClick={() => send()} disabled={!input.trim()} title='Send'>
                <Send className='w-4 h-4' />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantChat;
export type { ChatMessage };
