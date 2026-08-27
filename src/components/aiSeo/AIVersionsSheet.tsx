// Claude-style right-side sheet for AI-generated content versions.
// Replaces the inline AIVersionsPanel + StreamingAIModal with a single
// side panel that handles both streaming and version browsing.
import { useState, useCallback, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "../../components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "../../components/ui/tooltip";
import {
  Sparkles,
  Check,
  CheckCircle2,
  Trash2,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Ban,
  Square,
  RefreshCw,
  SquareCheck,
} from "lucide-react";
import {
  streamSeo,
  AIGenerationVersion,
  AiSeoResult,
  AiSeoMeta,
  AiSeoSuggestion,
} from "../../api/aiSeo";
import { AiEntityConfig } from "./aiEntityConfig";

type StreamStatus =
  | "idle"
  | "connecting"
  | "streaming"
  | "done"
  | "error"
  | "aborted";

interface AIVersionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: AiEntityConfig;
  mode: "create" | "edit";
  entityId?: string;
  entityName: string;
  extraPayload?: Record<string, unknown>;
  versions: AIGenerationVersion[];
  activeIndex: number;
  onSelectVersion: (index: number) => void;
  onVersionGenerated: (version: AIGenerationVersion) => void;
  onApplyField: (
    field: keyof AiSeoResult["content"],
    value: AiSeoResult["content"][keyof AiSeoResult["content"]],
  ) => void;
  onApplyAll: (version: AIGenerationVersion) => void;
  onApplySuggestion: (field: AiSeoSuggestion["field"], value: string) => void;
  onClear: () => void;
  appliedFields: Set<string>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

let versionCounter = 0;

export default function AIVersionsSheet({
  open,
  onOpenChange,
  entity,
  mode,
  entityId,
  entityName,
  extraPayload,
  versions,
  activeIndex,
  onSelectVersion,
  onVersionGenerated,
  onApplyField,
  onApplyAll,
  onApplySuggestion,
  onClear,
  appliedFields,
}: AIVersionsSheetProps) {
  // ── Streaming state ──
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [streamedDescription, setStreamedDescription] = useState("");
  const [result, setResult] = useState<AiSeoResult | null>(null);
  const [meta, setMeta] = useState<AiSeoMeta | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [notes, setNotes] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const emittedRef = useRef<AiSeoResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Version flash state ──
  const [justApplied, setJustApplied] = useState<string | null>(null);
  const triggerFlash = useCallback((key: string) => {
    setJustApplied(key);
    setTimeout(() => setJustApplied(null), 1200);
  }, []);

  // Reset streaming state when sheet closes
  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setStreamedDescription("");
      setResult(null);
      setMeta(null);
      setErrorMessage("");
      setNotes("");
      abortRef.current?.abort();
      abortRef.current = null;
      emittedRef.current = null;
    }
  }, [open]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (status === "streaming" && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedDescription, status]);

  const resetState = useCallback(() => {
    setStatus("idle");
    setStreamedDescription("");
    setResult(null);
    setMeta(null);
    setErrorMessage("");
    setNotes("");
    abortRef.current?.abort();
    abortRef.current = null;
    emittedRef.current = null;
  }, []);

  const startStreaming = useCallback(
    async (regenerate = false) => {
      resetState();
      setStatus("connecting");
      const controller = new AbortController();
      abortRef.current = controller;

      const payload: Record<string, unknown> = {
        name: entityName,
        ...(extraPayload || {}),
        ...(regenerate ? { regenerate: true } : {}),
      };

      try {
        const path =
          mode === "edit" && entityId
            ? entity.generatePath(entityId)
            : entity.suggestPath();

        await streamSeo(
          path,
          payload,
          {
            onMeta: (m: AiSeoMeta) => {
              setMeta(m);
              setStatus("streaming");
            },
            onDescriptionDelta: (chunk: string) => {
              setStreamedDescription((prev) => prev + chunk);
            },
            onDone: (r: AiSeoResult) => {
              setResult(r);
              setStatus("done");
            },
          },
          controller.signal,
        );
      } catch (err: any) {
        if (err?.name === "AbortError") {
          setStatus("aborted");
        } else {
          setErrorMessage(err?.message || "Generation failed");
          setStatus("error");
        }
      }
    },
    [entity, mode, entityId, entityName, extraPayload, resetState],
  );

  // Emit version once when generation completes
  useEffect(() => {
    if (status === "done" && result && emittedRef.current !== result) {
      emittedRef.current = result;
      versionCounter++;
      onVersionGenerated({
        id: `v${Date.now()}-${versionCounter}`,
        createdAt: Date.now(),
        provider: result.provider,
        model: result.model,
        result,
      });
    }
  }, [status, result, onVersionGenerated]);

  const displayValue = (fieldKey: string, value: any): string => {
    if (fieldKey === "tags" && Array.isArray(value)) return value.join(", ");
    const field = entity.fields.find((f) => f.key === fieldKey);
    if (
      (fieldKey === "description" || field?.clip) &&
      typeof value === "string" &&
      value.startsWith("<")
    ) {
      return stripHtml(value);
    }
    return value == null || value === "" ? "—" : String(value);
  };

  const clampedIndex = Math.min(activeIndex, Math.max(0, versions.length - 1));
  const activeVersion = versions[clampedIndex] || null;
  const allApplied = activeVersion
    ? entity.fields.every((f) => appliedFields.has(f.key))
    : false;

  // ── Streaming view (when no versions yet or user triggered new gen) ──
  const isStreaming =
    status === "streaming" || status === "connecting";
  const showStreamingView =
    open && (isStreaming || status === "error" || status === "aborted" || (status === "idle" && versions.length === 0));
  const showVersionsView =
    open && versions.length > 0 && !isStreaming && status !== "error" && status !== "aborted";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='w-full sm:max-w-[420px] p-0 flex flex-col gap-0 
          data-[state=open]:duration-300'>
        {/* ── Header ── */}
        <SheetHeader className='px-4 py-3 border-b border-slate-200 dark:border-slate-700 
          bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 
          flex flex-row items-center justify-between space-y-0'>
          <div className='flex items-center gap-2'>
            <div className='flex items-center justify-center w-7 h-7 rounded-lg 
              bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm'>
              <Sparkles className='w-3.5 h-3.5 text-white' />
            </div>
            <div>
              <SheetTitle className='text-sm font-semibold text-slate-900 dark:text-white leading-tight'>
                AI Content
              </SheetTitle>
              {activeVersion && (
                <p className='text-[10px] text-slate-500 dark:text-slate-400'>
                  {activeVersion.provider} ·{" "}
                  {formatDistanceToNow(activeVersion.createdAt, {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
          </div>
          <SheetClose asChild>
            <Button variant='ghost' size='sm' className='h-7 w-7 p-0 rounded-lg'>
              <X className='w-4 h-4' />
            </Button>
          </SheetClose>
        </SheetHeader>

        {/* ── Version pills (when versions exist) ── */}
        {versions.length > 0 && (
          <div className='px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 
            bg-white dark:bg-slate-900'>
            <div className='flex items-center gap-1.5 overflow-x-auto scrollbar-hide'>
              {versions.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => {
                    onSelectVersion(i);
                    // Reset streaming state when switching versions
                    if (!isStreaming) {
                      setStatus("idle");
                      setStreamedDescription("");
                      setResult(null);
                      setErrorMessage("");
                    }
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium 
                    transition-all duration-200 border
                    ${
                      i === clampedIndex
                        ? "bg-amber-100 dark:bg-amber-900/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}>
                  v{versions.length - i}
                </button>
              ))}
              <Button
                variant='ghost'
                size='sm'
                onClick={onClear}
                className='flex-shrink-0 h-7 w-7 p-0 text-slate-400 hover:text-rose-500 rounded-lg ml-1'>
                <Trash2 className='w-3 h-3' />
              </Button>
            </div>
          </div>
        )}

        {/* ── Content area ── */}
        <div ref={scrollRef} className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
          {/* Streaming view */}
          {showStreamingView && (
            <div className='space-y-4'>
              {/* Status message */}
              {status === "connecting" && (
                <div className='flex items-center gap-2 text-sm text-slate-500'>
                  <Loader2 className='w-4 h-4 animate-spin text-amber-500' />
                  <span>Connecting...</span>
                </div>
              )}
              {status === "error" && (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-sm text-rose-600'>
                    <X className='w-4 h-4' />
                    <span className='font-medium'>Generation failed</span>
                  </div>
                  <p className='text-xs text-slate-500'>{errorMessage}</p>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => startStreaming(false)}
                    className='gap-1.5'>
                    <RefreshCw className='w-3 h-3' />
                    Retry
                  </Button>
                </div>
              )}
              {status === "aborted" && (
                <div className='flex items-center gap-2 text-sm text-slate-500'>
                  <Ban className='w-4 h-4' />
                  <span>Generation stopped</span>
                </div>
              )}

              {/* Streaming content */}
              {(isStreaming || streamedDescription) && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <div className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse' />
                    <span className='text-[11px] font-semibold uppercase tracking-wider text-slate-400'>
                      {isStreaming ? "Generating..." : "Generated"}
                    </span>
                  </div>
                  <div className='rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4'>
                    <p className='text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap'>
                      {streamedDescription}
                      {isStreaming && (
                        <span className='inline-block w-0.5 h-4 bg-amber-500 animate-pulse ml-0.5 align-text-bottom' />
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes input (idle state) */}
              {status === "idle" && (
                <div className='space-y-3'>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    {entity.copy.modalHintCreate}
                  </p>
                  <Textarea
                    value={notes}
                    onChange={(e) =>
                      setNotes(e.target.value.slice(0, 2000))
                    }
                    placeholder={entity.copy.notesPlaceholder}
                    className='min-h-[80px] text-[13px] resize-none border-slate-200 
                      dark:border-slate-700 focus-visible:ring-amber-500'
                  />
                  <div className='flex items-center justify-between'>
                    <span className='text-[10px] text-slate-400'>
                      {notes.length}/2000
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Version content view */}
          {showVersionsView && activeVersion && (
            <div className='space-y-4'>
              {/* Applied fields summary */}
              {appliedFields.size > 0 && (
                <div className='flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400'>
                  <SquareCheck className='w-3 h-3' />
                  <span>
                    {appliedFields.size} field{appliedFields.size !== 1 ? "s" : ""} applied
                  </span>
                </div>
              )}

              {/* Field blocks */}
              {entity.fields.map(({ key, label, clip }) => {
                const rawValue = (activeVersion.result.content as any)?.[key];
                const value = displayValue(key, rawValue);
                const isTag = key === "tags";
                const tags = isTag
                  ? Array.isArray(activeVersion.result.content?.tags)
                    ? activeVersion.result.content.tags
                    : []
                  : [];
                const isApplied = appliedFields.has(key);
                const isFlashing = justApplied === key;

                return (
                  <div
                    key={key}
                    className='rounded-xl border border-slate-200 dark:border-slate-700 
                      bg-white dark:bg-slate-800 overflow-hidden'>
                    {/* Field header */}
                    <div className='flex items-center justify-between px-3 py-2 
                      border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50'>
                      <span className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                        {label}
                      </span>
                      <Button
                        type='button'
                        size='sm'
                        variant={isApplied ? "ghost" : "outline"}
                        disabled={isApplied}
                        onClick={() => {
                          onApplyField(
                            key as keyof AiSeoResult["content"],
                            rawValue,
                          );
                          triggerFlash(key);
                        }}
                        className={`h-6 px-2 text-[10px] rounded-md gap-1 transition-all duration-300 ${
                          isFlashing
                            ? "bg-emerald-500 text-white scale-105 border-emerald-500"
                            : isApplied
                              ? "text-emerald-600 hover:text-emerald-700 border-transparent"
                              : "border-slate-200 dark:border-slate-600"
                        }`}>
                        {isApplied ? (
                          <CheckCircle2 className='w-3 h-3' />
                        ) : (
                          <Check className='w-3 h-3' />
                        )}
                        {isApplied ? "Applied" : "Use"}
                      </Button>
                    </div>
                    {/* Field value */}
                    <div className='px-3 py-3'>
                      <p className='text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words'>
                        {value}
                      </p>
                      {isTag && tags.length > 0 && (
                        <div className='flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50'>
                          {tags.map((tag) => (
                            <button
                              key={tag}
                              type='button'
                              onClick={() => onApplyField("tags", [tag])}
                              className='inline-flex items-center rounded-full border border-slate-200 
                                dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 
                                text-[10px] text-slate-500 dark:text-slate-400 
                                hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 
                                transition-colors'>
                                + {tag}
                              </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Suggestions */}
              {activeVersion.result.suggestions?.length > 0 && (
                <div className='space-y-2'>
                  <div className='flex items-center gap-1.5'>
                    <Lightbulb className='w-3.5 h-3.5 text-amber-500' />
                    <span className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                      Suggestions
                    </span>
                  </div>
                  {activeVersion.result.suggestions.map((s, i) => {
                    const sugKey = `suggestion:${s.field}`;
                    const isApplied = appliedFields.has(sugKey);
                    const isFlashing = justApplied === sugKey;

                    return (
                      <div
                        key={i}
                        className='rounded-xl border border-amber-200/60 dark:border-amber-800/40 
                          bg-amber-50/40 dark:bg-amber-950/20 p-3'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='min-w-0'>
                            <p className='text-[12px] font-medium text-slate-700 dark:text-slate-300'>
                              <span className='text-amber-600 dark:text-amber-400 uppercase tracking-wide text-[10px] mr-1.5'>
                                {entity.suggestionLabels[s.field] || s.field}:
                              </span>
                              {s.value}
                            </p>
                            {s.reason && (
                              <p className='text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug'>
                                {s.reason}
                              </p>
                            )}
                          </div>
                          {entity.applicableSuggestions.includes(s.field) && (
                            <Button
                              type='button'
                              size='sm'
                              variant={isApplied ? "ghost" : "outline"}
                              disabled={isApplied}
                              onClick={() => {
                                onApplySuggestion(s.field, s.value);
                                triggerFlash(sugKey);
                              }}
                              className={`h-6 px-2 shrink-0 text-[10px] rounded-md gap-1 transition-all duration-300 ${
                                isFlashing
                                  ? "bg-emerald-500 text-white scale-105 border-emerald-500"
                                  : isApplied
                                    ? "text-emerald-600 border-transparent"
                                    : "border-amber-300 dark:border-amber-700"
                              }`}>
                              {isApplied ? (
                                <CheckCircle2 className='w-3 h-3' />
                              ) : (
                                <Check className='w-3 h-3' />
                              )}
                              {isApplied ? "Applied" : "Apply"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className='px-4 py-3 border-t border-slate-200 dark:border-slate-700 
          bg-white dark:bg-slate-900 space-y-2'>
          {/* Streaming footer */}
          {showStreamingView && (
            <div className='flex items-center justify-between'>
              <span className='text-[10px] text-slate-400'>
                {status === "streaming"
                  ? `${streamedDescription.length} chars`
                  : status === "done"
                    ? "Version saved"
                    : ""}
              </span>
              <div className='flex items-center gap-2'>
                {isStreaming && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => abortRef.current?.abort()}
                    className='h-8 gap-1.5 text-[11px]'>
                    <Square className='w-3 h-3' />
                    Stop
                  </Button>
                )}
                {(status === "idle" || status === "error" || status === "aborted") && (
                  <Button
                    size='sm'
                    onClick={() => startStreaming(false)}
                    disabled={!entityName}
                    className='h-8 gap-1.5 text-[11px] bg-gradient-to-r from-amber-500 to-orange-600 
                      hover:from-amber-600 hover:to-orange-700'>
                    <Sparkles className='w-3 h-3' />
                    Generate
                  </Button>
                )}
                {status === "done" && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => startStreaming(true)}
                    className='h-8 gap-1.5 text-[11px]'>
                    <RefreshCw className='w-3 h-3' />
                    Regenerate
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Versions footer */}
          {showVersionsView && activeVersion && (
            <div className='flex items-center justify-between'>
              <Badge
                variant='outline'
                className='text-[10px] text-slate-400 border-slate-200 dark:border-slate-700'>
                {clampedIndex + 1} of {versions.length}
              </Badge>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => startStreaming(true)}
                  disabled={!entityName}
                  className='h-8 gap-1.5 text-[11px]'>
                  <RefreshCw className='w-3 h-3' />
                  New
                </Button>
                <Button
                  type='button'
                  size='sm'
                  disabled={allApplied}
                  onClick={() => {
                    onApplyAll(activeVersion);
                    triggerFlash("all");
                  }}
                  className={`h-8 px-3 text-[11px] gap-1.5 transition-all duration-300 ${
                    allApplied
                      ? "bg-emerald-600 text-white hover:bg-emerald-600"
                      : justApplied === "all"
                        ? "bg-emerald-500 text-white scale-105"
                        : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                  }`}>
                  {allApplied ? (
                    <CheckCircle2 className='w-3 h-3' />
                  ) : (
                    <Check className='w-3 h-3' />
                  )}
                  {allApplied ? "Applied" : "Use All"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
