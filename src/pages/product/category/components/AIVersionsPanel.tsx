import { formatDistanceToNow } from "date-fns";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../../../components/ui/accordion";
import {
  Sparkles,
  Check,
  Trash2,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  AIGenerationVersion,
  AiSeoSuggestion,
  AiSeoContent,
} from "../../../../api/aiSeo";

interface AIVersionsPanelProps {
  versions: AIGenerationVersion[];
  activeIndex: number;
  onSelectVersion: (index: number) => void;
  onApplyField: (field: keyof AiSeoContent, value: AiSeoContent[keyof AiSeoContent]) => void;
  onApplyAll: (version: AIGenerationVersion) => void;
  onApplySuggestion: (field: AiSeoSuggestion["field"], value: string) => void;
  onClear: () => void;
}

const FIELD_LABELS: { key: keyof AiSeoContent; label: string; clip?: boolean }[] = [
  { key: "description", label: "Description", clip: true },
  { key: "shortDescription", label: "Short Description", clip: true },
  { key: "focusKeyphrase", label: "Focus Keyphrase" },
  { key: "seoTitle", label: "SEO Title" },
  { key: "metaDescription", label: "Meta Description", clip: true },
  { key: "tags", label: "Tags" },
  { key: "google_category_type", label: "Google Category" },
];

const SUGGESTION_LABELS: Record<AiSeoSuggestion["field"], string> = {
  discount: "Discount",
  discountType: "Discount Type",
  name: "Category Name",
  img: "Image",
  internalLinks: "Internal Links",
  general: "General",
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function displayValue(field: keyof AiSeoContent, value: any): string {
  if (field === "tags" && Array.isArray(value)) return value.join(", ");
  if (
    (field === "description" || field === "metaDescription") &&
    typeof value === "string" &&
    value.startsWith("<")
  ) {
    return stripHtml(value);
  }
  return value == null || value === "" ? "—" : String(value);
}

export default function AIVersionsPanel({
  versions,
  activeIndex,
  onSelectVersion,
  onApplyField,
  onApplyAll,
  onApplySuggestion,
  onClear,
}: AIVersionsPanelProps) {
  if (versions.length === 0) return null;

  const clampedIndex = Math.min(activeIndex, versions.length - 1);
  const active = versions[clampedIndex];
  const applicable: AiSeoSuggestion["field"][] = ["discount", "discountType", "name"];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 overflow-hidden">
      {/* Header: version switcher + clear */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            AI Versions
          </span>
          <div className="flex items-center gap-1 ml-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={clampedIndex === 0}
              onClick={() => onSelectVersion(clampedIndex - 1)}
              className="h-6 w-6 p-0">
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[11px] font-medium text-[#141413] tabular-nums">
              {clampedIndex + 1} / {versions.length}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={clampedIndex === versions.length - 1}
              onClick={() => onSelectVersion(clampedIndex + 1)}
              className="h-6 w-6 p-0">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">
            {active.provider} · {formatDistanceToNow(active.createdAt, { addSuffix: true })}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 px-2 text-[10px] text-slate-400 hover:text-rose-600 gap-1">
            <Trash2 className="h-3 w-3" />
            Clear
          </Button>
        </div>
      </div>

      {/* Fields - Accordion */}
      <div className="px-3 py-3 max-h-[340px] overflow-y-auto">
        <Accordion
          type="multiple"
          defaultValue={FIELD_LABELS.map(({ key }) => key)}
          className="space-y-1.5">
          {FIELD_LABELS.map(({ key, label }) => {
            const value = displayValue(key, active.result.content?.[key]);
            const isTag = key === "tags";
            const tags = isTag
              ? Array.isArray(active.result.content?.tags)
                ? active.result.content.tags
                : []
              : [];
            return (
              <AccordionItem
                key={key}
                value={key}
                className="rounded-md border border-slate-200 bg-white overflow-hidden">
                <AccordionTrigger className="px-2.5 py-2 hover:no-underline [&[data-state=open]]:border-b [&[data-state=open]]:border-slate-100">
                  <div className="flex items-center justify-between w-full mr-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                        {value.length > 30 ? value.slice(0, 30) + "..." : value}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplyField(key, active.result.content?.[key]);
                        }}
                        className="h-5 px-1.5 shrink-0 text-[9px] border-slate-300 rounded gap-0.5">
                        <Check className="h-2.5 w-2.5" />
                        Use
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-2.5 pb-2.5">
                  <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap break-words">
                    {value}
                  </p>
                  {isTag && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100">
                      {tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => onApplyField("tags", [tag])}
                          title="Merge this tag into the form"
                          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500 hover:border-[#141413] hover:text-[#141413] transition-colors">
                          + {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Suggestions */}
        {active.result.suggestions?.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Suggestions
              </span>
            </div>
            {active.result.suggestions.map((s, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 bg-amber-50/60 border border-amber-100 rounded-md p-2.5">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#141413]">
                    <span className="text-slate-400 uppercase tracking-wide mr-1.5">
                      {SUGGESTION_LABELS[s.field] || s.field}:
                    </span>
                    {s.value}
                  </p>
                  {s.reason && (
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {s.reason}
                    </p>
                  )}
                </div>
                {applicable.includes(s.field) && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onApplySuggestion(s.field, s.value)}
                    className="h-6 px-2 shrink-0 text-[10px] border-slate-300 rounded-md gap-1">
                    <Check className="h-3 w-3" />
                    Apply
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer: use all */}
      <div className="px-3 py-2.5 border-t border-slate-200 bg-white flex items-center justify-between">
        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200">
          Newest first
        </Badge>
        <Button
          type="button"
          size="sm"
          onClick={() => onApplyAll(active)}
          className="h-7 px-3 text-[11px] bg-[#141413] hover:bg-[#2a2a2a] text-white rounded-md gap-1.5">
          <Check className="h-3 w-3" />
          Use all from this version
        </Button>
      </div>
    </div>
  );
}
