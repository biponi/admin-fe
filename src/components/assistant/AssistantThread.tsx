import {
  AssistantRuntimeProvider,
  useAssistantDataUI,
} from "@assistant-ui/react";
import { Thread } from "../assistant-ui/elements/thread.aui";
import ArtifactDialog from "./artifacts/ArtifactDialog";
import ArtifactInlineCard from "./artifacts/ArtifactInlineCard";
import { useAssistantRuntime, type UiMessage } from "./useAssistantRuntime";

export interface AssistantRuntimeApi {
  runtime: ReturnType<typeof useAssistantRuntime>["runtime"];
  hydrateSession: (id: string) => Promise<void>;
  reset: () => void;
}

interface AssistantThreadProps {
  /** Sheet mode: fill parent height, compact composer */
  embedded?: boolean;
  /**
   * Externally owned runtime — the /assistant page creates it (so the
   * sessions sidebar can call hydrateSession/reset). The header sheet
   * omits this and lets the thread own its own runtime.
   */
  runtimeApi?: AssistantRuntimeApi;
  /** Notify the parent of the active session (sidebar highlight) */
  onSessionIdChange?: (sessionId: string | undefined) => void;
  /** Notify the parent to refresh its session list (after each answer) */
  onSessionsRefresh?: () => void;
  /** Surface stream errors as toasts */
  onError?: (message: string) => void;
}

/** Registers the inline artifact card as the `data-artifact` part renderer. */
const ArtifactDataUI = () => {
  useAssistantDataUI({ name: "artifact", render: ArtifactInlineCard as never });
  return null;
};

/**
 * assistant-ui thread host. Renders the Thread and the modal artifact viewer;
 * message state lives in useAssistantRuntime (owned here or by the parent).
 */
const AssistantThread = ({
  embedded = false,
  runtimeApi,
  onSessionIdChange,
  onSessionsRefresh,
  onError,
}: AssistantThreadProps) => {
  const internalApi = useAssistantRuntime({
    onSessionIdChange,
    onSessionsRefresh,
    onError,
  });
  const api = runtimeApi ?? internalApi;

  return (
    <AssistantRuntimeProvider runtime={api.runtime}>
      <ArtifactDataUI />
      <div
        className={
          embedded
            ? "flex h-full min-h-0 flex-col"
            : "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-none border bg-card"
        }>
        <div className='min-h-0 flex-1'>
          <Thread />
        </div>
      </div>
      <ArtifactDialog />
    </AssistantRuntimeProvider>
  );
};

export default AssistantThread;
export type { UiMessage };
