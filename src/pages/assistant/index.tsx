import { useCallback, useEffect, useState } from "react";
import { History, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import AssistantChat, { type ChatMessage } from "./AssistantChat";
import {
  listSessions,
  getSession,
  type SessionSummary,
} from "../../api/assistant";

/**
 * Full-page assistant: sessions sidebar + chat column.
 * The chat itself lives in AssistantChat (also embedded in the header Sheet).
 */
const AssistantPage = () => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [chatKey, setChatKey] = useState(0);
  const [preloaded, setPreloaded] = useState<ChatMessage[] | undefined>(undefined);

  const refreshSessions = useCallback(async () => {
    const result = await listSessions();
    if (result.success && result.data) setSessions(result.data.sessions);
  }, []);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const newChat = () => {
    setSessionId(undefined);
    setPreloaded(undefined);
    setChatKey((k) => k + 1);
  };

  const loadSession = async (id: string) => {
    const result = await getSession(id);
    if (result.success && result.data) {
      setSessionId(id);
      setPreloaded(
        result.data.messages
          .filter((m) => m.role !== "tool")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }))
      );
      setChatKey((k) => k + 1);
    }
  };

  return (
    <div className='flex h-[calc(100vh-8rem)] gap-4'>
      {/* Sessions sidebar */}
      <div className='hidden md:flex w-64 flex-col border rounded-lg bg-card'>
        <div className='flex items-center justify-between p-3 border-b'>
          <span className='text-sm font-medium flex items-center gap-2'>
            <History className='w-4 h-4' /> Sessions
          </span>
          <Button variant='ghost' size='sm' onClick={newChat} title='New chat'>
            <Trash2 className='w-4 h-4' />
          </Button>
        </div>
        <ScrollArea className='flex-1'>
          <div className='p-2 space-y-1'>
            {sessions.length === 0 && (
              <p className='text-xs text-muted-foreground p-2'>No sessions yet</p>
            )}
            {sessions.map((s) => (
              <button
                key={s.sessionId}
                onClick={() => loadSession(s.sessionId)}
                className={`w-full text-left px-2 py-2 rounded-md text-sm hover:bg-accent ${
                  s.sessionId === sessionId ? "bg-accent" : ""
                }`}
              >
                <span className='block truncate font-medium'>{s.title || "Untitled"}</span>
                <span className='block truncate text-xs text-muted-foreground'>
                  {s.preview || s.updatedAt}
                </span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat column */}
      <AssistantChat
        key={chatKey}
        initialMessages={preloaded}
        onSessionIdChange={setSessionId}
        onSessionsRefresh={refreshSessions}
      />
    </div>
  );
};

export default AssistantPage;
