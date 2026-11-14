import { useCallback, useEffect, useMemo, useState } from "react";
import {
  History,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { Skeleton } from "../../components/ui/skeleton";
import AssistantThread, {
  type AssistantRuntimeApi,
} from "../../components/assistant/AssistantThread";
import { useAssistantRuntime } from "../../components/assistant/useAssistantRuntime";
import { listSessions, type SessionSummary } from "../../api/assistant";

/** "Today 14:32" / "12 Nov" style stamp for session rows. */
const formatSessionTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

interface SessionListProps {
  sessions: SessionSummary[];
  activeId: string | undefined;
  loading: boolean;
  onSelect: (id: string) => void;
}

/** Shared session list — rendered in the desktop sidebar and the mobile sheet. */
const SessionList = ({
  sessions,
  activeId,
  loading,
  onSelect,
}: SessionListProps) => {
  if (loading) {
    return (
      <div className='space-y-2 p-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='space-y-1.5 rounded-md p-2'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-3 w-1/2' />
          </div>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2 p-6 pt-10 text-center'>
        <MessageSquare className='h-6 w-6 text-muted-foreground/50' />
        <p className='text-xs text-muted-foreground'>No sessions yet</p>
        <p className='text-[11px] text-muted-foreground/70'>
          Your conversations will appear here
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-1 p-2'>
      {sessions.map((s) => (
        <button
          key={s.sessionId}
          onClick={() => onSelect(s.sessionId)}
          className={`group w-full rounded-md px-2.5 py-2 text-left transition-colors ${
            s.sessionId === activeId ? "bg-accent" : "hover:bg-accent/60"
          }`}>
          <span className='flex items-baseline justify-between gap-2'>
            <span className='min-w-0 flex-1 truncate text-sm font-medium'>
              {s.title || "Untitled"}
            </span>
            <span className='shrink-0 text-[10px] tabular-nums text-muted-foreground'>
              {formatSessionTime(s.updatedAt)}
            </span>
          </span>
          <span className='mt-0.5 block truncate text-xs text-muted-foreground'>
            {s.preview || "—"}
          </span>
        </button>
      ))}
    </div>
  );
};

/**
 * Full-page assistant: page header + sessions sidebar + assistant-ui thread.
 * The runtime lives here so the sidebar can hydrate/reset the thread without
 * remounting it (the header sheet owns its own runtime instead).
 */
const AssistantPage = () => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [sessionsOpen, setSessionsOpen] = useState(false); // mobile sheet

  const { runtime, hydrateSession, reset } = useAssistantRuntime({
    onSessionIdChange: setSessionId,
    onSessionsRefresh: () => void refreshSessions(),
    onError: (message) => toast.error(message),
  });

  const runtimeApi: AssistantRuntimeApi = { runtime, hydrateSession, reset };

  const refreshSessions = useCallback(async () => {
    setSessionsLoading(true);
    const result = await listSessions();
    if (result.success && result.data) setSessions(result.data.sessions);
    setSessionsLoading(false);
  }, []);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.preview || "").toLowerCase().includes(q),
    );
  }, [sessions, query]);

  const newChat = () => {
    reset();
    setSessionsOpen(false);
  };

  const loadSession = async (id: string) => {
    await hydrateSession(id);
    setSessionsOpen(false);
  };

  return (
    <div className='flex h-[calc(100dvh-84px)] min-h-0 flex-col gap-0 overflow-hidden md:h-[calc(100vh-80px)] '>
      {/* Page header */}
      <div className='flex items-center justify-between gap-2 bg-white px-5 py-4 shadow-sm dark:bg-slate-800 md:rounded-none'>
        <div className='min-w-0'>
          <h1 className='flex items-center gap-2 truncate text-lg font-semibold'>
            <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm'>
              <Sparkles className='h-3.5 w-3.5 text-white' />
            </span>
            PROMX AI
          </h1>
          <p className='truncate text-xs text-muted-foreground mt-1'>
            Customer lookups · order status · analytics · internal docs
          </p>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          {/* Mobile: sessions live in a sheet (sidebar is hidden below md) */}
          <Button
            variant='outline'
            size='sm'
            className='md:hidden'
            onClick={() => setSessionsOpen(true)}>
            <History className='h-4 w-4' />
            Sessions
          </Button>
          <Button variant='outline' size='sm' onClick={newChat}>
            <Plus className='h-4 w-4' />
            New chat
          </Button>
        </div>
      </div>

      <div className='flex min-h-0 flex-1 gap-0'>
        {/* Desktop sessions sidebar */}
        <aside className='hidden w-72 shrink-0 flex-col overflow-hidden rounded-none border-r border-t bg-card md:flex'>
          <div className='space-y-2 border-b p-3'>
            <div className='flex items-center justify-between'>
              <span className='flex items-center gap-2 text-sm font-medium'>
                <History className='h-4 w-4' /> Sessions
              </span>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={() => void refreshSessions()}
                title='Refresh sessions'>
                <RefreshCw className='h-3.5 w-3.5' />
              </Button>
            </div>
            <div className='relative'>
              <Search className='pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search sessions'
                className='h-8 pl-8 text-xs'
              />
            </div>
          </div>
          <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain'>
            <SessionList
              sessions={filteredSessions}
              activeId={sessionId}
              loading={sessionsLoading}
              onSelect={loadSession}
            />
          </div>
        </aside>

        {/* Thread column */}
        <AssistantThread
          runtimeApi={runtimeApi}
          onError={(m) => toast.error(m)}
        />
      </div>

      {/* Mobile sessions sheet */}
      <Sheet open={sessionsOpen} onOpenChange={setSessionsOpen}>
        <SheetContent side='left' className='w-72 p-0 flex flex-col gap-0'>
          <SheetHeader className='flex flex-row items-center justify-between space-y-0 border-b px-3 py-3'>
            <SheetTitle className='flex items-center gap-2 text-sm font-medium'>
              <History className='h-4 w-4' /> Sessions
            </SheetTitle>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7'
              onClick={() => void refreshSessions()}
              title='Refresh sessions'>
              <RefreshCw className='h-3.5 w-3.5' />
            </Button>
          </SheetHeader>
          <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain'>
            <SessionList
              sessions={filteredSessions}
              activeId={sessionId}
              loading={sessionsLoading}
              onSelect={loadSession}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AssistantPage;
