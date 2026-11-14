import { memo } from "react";
import { BarChart3Icon, FileTextIcon, TableIcon, Loader2Icon, Maximize2Icon } from "lucide-react";
import type { DataMessagePartProps } from "@assistant-ui/react";
import type { ArtifactDescriptor, DocArtifactPayload, SheetArtifactPayload } from "./types";
import { useArtifactViewer } from "./useArtifactViewer";

const KIND_ICON = {
  chart: BarChart3Icon,
  sheet: TableIcon,
  doc: FileTextIcon,
} as const;

const KIND_LABEL = {
  chart: "Chart",
  sheet: "Sheet",
  doc: "Document",
} as const;

/** One-line summary under the title (row count / series / first heading). */
const summarize = (artifact: ArtifactDescriptor): string => {
  const { kind, payload } = artifact;
  if (kind === "sheet") {
    const sheet = payload as SheetArtifactPayload;
    const rows = sheet.totalRows ?? sheet.rows.length;
    const cols = sheet.columns.length;
    return `${rows.toLocaleString()} rows · ${cols} column${cols === 1 ? "" : "s"}`;
  }
  if (kind === "chart") {
    const chart = payload as import("./types").ChartArtifactPayload;
    const count = chart.labels?.length ?? 0;
    return `${count} data point${count === 1 ? "" : "s"}${chart.unit ? ` · ${chart.unit}` : ""}`;
  }
  const doc = payload as DocArtifactPayload;
  const heading = doc.markdown.match(/^#{1,6}\s+(.+)$/m)?.[1];
  if (heading) return heading;
  const words = doc.markdown.trim().split(/\s+/).filter(Boolean).length;
  return words > 0 ? `${words.toLocaleString()} words` : "Empty document";
};

/**
 * In-message artifact card — the inline, clickable representation of a chart,
 * sheet or doc produced by the assistant. Opens the full ArtifactDialog.
 * Registered as the renderer for `data-artifact` message parts.
 */
export const ArtifactInlineCard = memo(
  ({ data }: DataMessagePartProps) => {
  const open = useArtifactViewer((s) => s.open);
  // MessagePartState intersects `data: any`, so narrow explicitly
  const artifact = (data ?? null) as ArtifactDescriptor | null;
  if (!artifact) return null;
  const Icon = KIND_ICON[artifact.kind] ?? FileTextIcon;

  return (
    <button
      type='button'
      onClick={() => open(artifact)}
      disabled={artifact.streaming}
      className='aui-artifact-card group mt-2 flex w-full max-w-sm items-center gap-3 rounded-lg border bg-card px-3.5 py-3
        text-start transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
        disabled:cursor-progress disabled:opacity-80'
      aria-label={`Open ${KIND_LABEL[artifact.kind]}: ${artifact.title}`}
    >
      <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'>
        {artifact.streaming ? (
          <Loader2Icon className='h-4 w-4 animate-spin' />
        ) : (
          <Icon className='h-4 w-4' />
        )}
      </span>
      <span className='min-w-0 flex-1'>
        <span className='block truncate text-sm font-medium'>{artifact.title}</span>
        <span className='block truncate text-xs text-muted-foreground'>
          {KIND_LABEL[artifact.kind]} · {summarize(artifact)}
        </span>
      </span>
      <Maximize2Icon className='h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100' />
    </button>
  );
  }
);

export default ArtifactInlineCard;
