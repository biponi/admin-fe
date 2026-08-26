// Shared streaming AI-SEO generation dialog for any entity (category,
// product). Entity labels, copy, endpoints, and applicable suggestions come
// from AiEntityConfig — the SSE flow is identical for all entities.
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../components/ui/accordion";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Square,
  RefreshCw,
  Sparkles,
  Ban,
  Lightbulb,
  Check,
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

export interface StreamingAIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entity: AiEntityConfig;
  mode: "create" | "edit";
  entityId?: string;
  entityName: string;
  /** Extra create-mode context the backend suggest endpoint accepts
   *  (product: categoryId/brand/price; category: parentId). */
  extraPayload?: Record<string, unknown>;
  onVersionGenerated: (version: AIGenerationVersion) => void;
  onApplySuggestion?: (field: AiSeoSuggestion["field"], value: string) => void;
  appliedFields?: Set<string>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

let versionCounter = 0;

export default function StreamingAIModal({
  open,
  onOpenChange,
  entity,
  mode,
  entityId,
  entityName,
  extraPayload,
  onVersionGenerated,
  onApplySuggestion,
  appliedFields = new Set(),
}: StreamingAIModalProps) {
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [streamedDescription, setStreamedDescription] = useState("");
  const [result, setResult] = useState<AiSeoResult | null>(null);
  const [meta, setMeta] = useState<AiSeoMeta | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [notes, setNotes] = useState("");
  const [justApplied, setJustApplied] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Emit-once guard per completed generation
  const emittedRef = useRef<AiSeoResult | null>(null);

  const resetState = useCallback(() => {
    setStatus("idle");
    setStreamedDescription("");
    setResult(null);
    setMeta(null);
    setErrorMessage("");
    setJustApplied(null);
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const triggerFlash = useCallback((key: string) => {
    setJustApplied(key);
    setTimeout(() => setJustApplied(null), 1200);
  }, []);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  // Auto-scroll to bottom during streaming and when result arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [streamedDescription, result]);

  // Abort on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const canGenerate = mode === "edit" || !!entityName.trim();

  const startStreaming = useCallback(
    async (regenerate: boolean) => {
      if (!canGenerate) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus("connecting");
      setStreamedDescription("");
      setResult(null);
      setMeta(null);
      setErrorMessage("");
      emittedRef.current = null;

      const path =
        mode === "edit" && entityId
          ? entity.generatePath(entityId)
          : entity.suggestPath();

      try {
        const finalResult = await streamSeo(
          path,
          {
            name: mode === "create" ? entityName : undefined,
            notes: notes.trim() || undefined,
            regenerate,
            ...(mode === "create" ? extraPayload : {}),
          } as any,
          {
            onMeta: (m) => {
              setMeta(m);
              setStatus("streaming");
            },
            onDescriptionDelta: (chunk) => {
              setStreamedDescription((prev) => prev + chunk);
            },
            onDone: (r) => setResult(r),
          },
          controller.signal
        );

        // Cached hits deliver the whole description in one delta with no
        // further events — ensure status reflects completion
        if (finalResult) {
          setResult(finalResult);
          setStatus("done");
        }
      } catch (err: any) {
        if (err?.name === "AbortError" || controller.signal.aborted) {
          setStatus("aborted");
        } else {
          setStatus("error");
          setErrorMessage(
            err instanceof Error ? err.message : "An unexpected error occurred"
          );
        }
      }
    },
    [canGenerate, entity, entityId, entityName, extraPayload, mode, notes, onVersionGenerated]
  );

  // Mark done when both the done event and full result arrived via callbacks
  useEffect(() => {
    if (result && status === "streaming") {
      setStatus("done");
    }
  }, [result, status]);

  // Emit a version exactly once per completed generation
  useEffect(() => {
    if (status === "done" && result && emittedRef.current !== result) {
      emittedRef.current = result;
      onVersionGenerated({
        id: `v${Date.now()}-${versionCounter++}`,
        createdAt: Date.now(),
        provider: result.provider,
        model: result.model,
        result,
      });
    }
  }, [status, result, onVersionGenerated]);

  const handleStop = () => {
    abortRef.current?.abort();
    setStatus("aborted");
  };

  const handleClose = () => {
    abortRef.current?.abort();
    onOpenChange(false);
  };

  const isBusy = status === "connecting" || status === "streaming";
  const rateLimited = errorMessage.toLowerCase().includes("rate limit");

  const fieldLabel = (key: string) =>
    entity.fields.find((f) => f.key === key)?.label || key;

  const fieldValue = (key: string): string => {
    if (!result) return "";
    if (key === "tags") return (result.content.tags || []).join(", ");
    return (result.content as any)[key] ?? "";
  };

  const isHtmlField = (key: string) => {
    const field = entity.fields.find((f) => f.key === key);
    return key === "description" || !!field?.clip;
  };

  const renderFieldRows = () => {
    if (!result) return null;
    return entity.fields.map((field) => {
      const value = fieldValue(field.key);
      return (
        <div key={field.key} className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {field.label}
          </span>
          <div className="text-[13px] text-[#141413] leading-relaxed bg-white border border-slate-200 rounded-md p-3 min-h-[36px] whitespace-pre-wrap break-words">
            {isHtmlField(field.key) ? stripHtml(value) : value || "—"}
          </div>
        </div>
      );
    });
  };

  const renderSuggestions = () => {
    if (!result?.suggestions?.length) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 pt-2">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Suggestions
          </span>
        </div>
        {result.suggestions.map((s, i) => {
          const sugKey = `suggestion:${s.field}`;
          const isApplied = appliedFields.has(sugKey);
          const isFlashing = justApplied === sugKey;

          return (
            <div
              key={i}
              className="flex items-start justify-between gap-3 bg-amber-50/60 border border-amber-100 rounded-md p-2.5">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#141413]">
                  <span className="text-slate-400 uppercase tracking-wide mr-1.5">
                    {entity.suggestionLabels[s.field] || s.field}:
                  </span>
                  {s.value}
                </p>
                {s.reason && (
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {s.reason}
                  </p>
                )}
              </div>
              {entity.applicableSuggestions.includes(s.field) &&
                onApplySuggestion && (
                  <Button
                    type="button"
                    size="sm"
                    variant={isApplied ? "ghost" : "outline"}
                    disabled={isApplied}
                    onClick={() => {
                      onApplySuggestion(s.field, s.value);
                      triggerFlash(sugKey);
                    }}
                    className={`h-6 px-2 shrink-0 text-[10px] rounded-md gap-1 transition-all duration-300 ${
                      isFlashing
                        ? "bg-emerald-500 text-white scale-110 border-emerald-500"
                        : isApplied
                          ? "text-emerald-600 hover:text-emerald-700 border-transparent"
                          : "border-slate-300"
                    }`}>
                    {isApplied ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    {isApplied ? "Applied" : "Apply"}
                  </Button>
                )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#FAF9F6] border-slate-200 p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {isBusy && (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#141413]">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
            )}
            {status === "done" && (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            )}
            {(status === "error" || status === "aborted") && (
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                  status === "error" ? "bg-rose-600" : "bg-slate-400"
                }`}>
                {status === "error" ? (
                  <XCircle className="h-4 w-4 text-white" />
                ) : (
                  <Ban className="h-4 w-4 text-white" />
                )}
              </div>
            )}
            <DialogTitle className="text-base font-semibold text-[#141413]">
              {isBusy && `Generating content for "${entityName}"...`}
              {status === "idle" && `Generate AI content for "${entityName}"`}
              {status === "done" && "Content generated successfully"}
              {status === "error" && "Generation failed"}
              {status === "aborted" && "Generation stopped"}
            </DialogTitle>
            {meta && (
              <span className="ml-auto text-[10px] text-slate-400 font-mono">
                {meta.provider}
                {meta.cached ? " · cached" : ""}
              </span>
            )}
          </div>
        </DialogHeader>

        <div ref={scrollRef} className="px-6 py-4 max-h-[400px] overflow-y-auto">
          {status === "idle" && (
            <div className="space-y-3">
              <p className="text-[12px] text-slate-500 leading-relaxed">
                {mode === "edit"
                  ? entity.copy.modalHintEdit
                  : entity.copy.modalHintCreate}
              </p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={entity.copy.notesPlaceholder}
                className="min-h-[70px] text-[13px] bg-white border-slate-200 rounded-md"
                maxLength={2000}
              />
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <XCircle className="h-10 w-10 text-rose-400" />
              <p className="text-sm text-slate-600 text-center">
                {rateLimited
                  ? "Rate limit reached (10 generations per minute). Please wait a moment and retry."
                  : errorMessage}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => startStreaming(true)}
                className="border-slate-300 text-slate-600 rounded-md mt-2 gap-1.5">
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </div>
          )}

          {status === "aborted" && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Ban className="h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500 text-center">
                Generation stopped — no content was applied. You can start again.
              </p>
            </div>
          )}

          {isBusy && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Description
                </span>
                <span className="text-[10px] text-slate-400 animate-pulse">
                  generating...
                </span>
              </div>
              <div className="text-[13px] text-[#141413] leading-relaxed bg-white border border-slate-200 rounded-md p-3 min-h-[80px] whitespace-pre-wrap break-words">
                {stripHtml(streamedDescription)}
                <span className="inline-block w-[2px] h-[14px] bg-[#141413] ml-0.5 animate-pulse align-text-bottom" />
              </div>
            </div>
          )}

          {status === "done" && result && (
            <div className="space-y-4">
              <Accordion
                type="multiple"
                defaultValue={entity.fields
                  .slice(1)
                  .map((f) => f.key)}
                className="space-y-2">
                {entity.fields.map((field) => {
                  const value = fieldValue(field.key);
                  return (
                    <AccordionItem
                      key={field.key}
                      value={field.key}
                      className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                      <AccordionTrigger className="px-3 py-2.5 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-slate-100">
                        <div className="flex items-center justify-between w-full mr-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            {field.label}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[200px] ml-2">
                            {isHtmlField(field.key)
                              ? stripHtml(value).slice(0, 50) +
                                (stripHtml(value).length > 50 ? "..." : "")
                              : (value || "—").slice(0, 50) +
                                ((value || "").length > 50 ? "..." : "")}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3">
                        <div className="text-[13px] text-[#141413] leading-relaxed whitespace-pre-wrap break-words">
                          {isHtmlField(field.key)
                            ? stripHtml(value)
                            : value || "—"}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              {renderSuggestions()}
              {result.warnings?.length > 0 && (
                <p className="text-[10px] text-slate-400">
                  {result.warnings.join(" · ")}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {isBusy && (
              <span>
                {streamedDescription.length > 0
                  ? `${streamedDescription.length} characters streamed`
                  : "Connecting..."}
              </span>
            )}
            {status === "done" && (
              <span className="text-emerald-600">
                Version saved — review and apply fields below the form
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isBusy && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStop}
                className="border-slate-300 text-slate-600 hover:bg-slate-50 rounded-md gap-1.5">
                <Square className="h-3 w-3" />
                Stop generating
              </Button>
            )}
            {status === "idle" && (
              <Button
                size="sm"
                onClick={() => startStreaming(false)}
                disabled={!canGenerate}
                className="bg-[#141413] hover:bg-[#2a2a2a] text-white rounded-md gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Generate
              </Button>
            )}
            {status === "done" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => startStreaming(true)}
                className="border-slate-300 text-slate-600 hover:bg-slate-50 rounded-md gap-1.5">
                <RefreshCw className="h-3 w-3" />
                Generate another version
              </Button>
            )}
            {(status === "done" || status === "error" || status === "aborted") && (
              <Button
                size="sm"
                onClick={handleClose}
                className="bg-[#141413] hover:bg-[#2a2a2a] text-white rounded-md">
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
