// SEO card for the product create/edit forms: editable slug (auto-derived
// from the product name unless manually edited), short description, focus
// keyphrase, meta title/description, and tags. Presentational only — the
// parent form owns all state via `value` + `onChange`.
import { useState } from "react";
import { Link2, RotateCcw, X } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Textarea } from "../../../../components/ui/textarea";
import { slugifyText } from "../../../../utils/functions";

export interface ProductSeoValue {
  slug: string;
  shortDescription: string;
  focusKeyphrase: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
}

interface ProductSeoCardProps {
  value: ProductSeoValue;
  onChange: (patch: Partial<ProductSeoValue>) => void;
  /** Called when the slug should revert to auto-derivation from the name */
  onResetSlug: () => void;
  /** Whether the slug is currently manually overridden (shows reset button) */
  slugManuallyEdited: boolean;
  productUrlBase?: string;
}

const counterClass = (length: number, warn: number, max: number) =>
  `text-[11px] font-mono ${
    length > max ? "text-rose-500" : length > warn ? "text-amber-500" : "text-slate-400"
  }`;

export default function ProductSeoCard({
  value,
  onChange,
  onResetSlug,
  slugManuallyEdited,
  productUrlBase = "/product/",
}: ProductSeoCardProps) {
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !value.tags.includes(trimmed)) {
      onChange({ tags: [...value.tags, trimmed] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange({ tags: value.tags.filter((t) => t !== tag) });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const seoTitleLength = value.seoTitle.length;
  const seoDescLength = value.seoDescription.length;
  const shortDescLength = value.shortDescription.length;
  const keyphraseLength = value.focusKeyphrase.length;

  return (
    <div className="space-y-5">
      {/* Slug */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="slug"
            className="text-sm font-semibold flex items-center gap-2">
            <Link2 className="w-4 h-4 text-indigo-500" />
            Slug (URL)
          </Label>
          {slugManuallyEdited && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onResetSlug}
              className="h-6 px-2 text-[11px] text-slate-400 hover:text-slate-600 gap-1">
              <RotateCcw className="h-3 w-3" />
              Reset to auto
            </Button>
          )}
        </div>
        <Input
          id="slug"
          name="slug"
          type="text"
          value={value.slug}
          onChange={(e) => onChange({ slug: e.target.value })}
          placeholder="auto-generated-from-product-name"
          className="font-mono text-sm h-11 border-2 focus:border-indigo-500 transition-colors"
        />
        <p className="text-xs text-slate-400 font-mono truncate">
          {productUrlBase}
          <span className="text-slate-600">{value.slug || "…"}</span>
        </p>
      </div>

      {/* Short description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="shortDescription" className="text-sm font-semibold">
            Short description
          </Label>
          <span className={counterClass(shortDescLength, 300, 500)}>
            {shortDescLength}/500
          </span>
        </div>
        <Input
          id="shortDescription"
          name="shortDescription"
          type="text"
          value={value.shortDescription}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
          placeholder="Brief one-liner for listings and cards"
          className="h-11 border-2 focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Focus keyphrase */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="focusKeyphrase" className="text-sm font-semibold">
            Focus keyphrase
          </Label>
          <span className={counterClass(keyphraseLength, 60, 100)}>
            {keyphraseLength}/100
          </span>
        </div>
        <Input
          id="focusKeyphrase"
          name="focusKeyphrase"
          type="text"
          value={value.focusKeyphrase}
          onChange={(e) => onChange({ focusKeyphrase: e.target.value })}
          placeholder="e.g. samsung 55 inch 4k tv price"
          className="h-11 border-2 focus:border-indigo-500 transition-colors"
        />
        <p className="text-xs text-slate-400">
          The main search phrase this product should rank for.
        </p>
      </div>

      {/* SEO title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="seoTitle" className="text-sm font-semibold">
            SEO title (meta title)
          </Label>
          <span className={counterClass(seoTitleLength, 70, 200)}>
            {seoTitleLength}/200
          </span>
        </div>
        <Input
          id="seoTitle"
          name="seoTitle"
          type="text"
          value={value.seoTitle}
          onChange={(e) => onChange({ seoTitle: e.target.value })}
          placeholder="e.g. Samsung 55&quot; 4K Smart TV - Best Price in Bangladesh"
          className="h-11 border-2 focus:border-indigo-500 transition-colors"
          maxLength={200}
        />
        <p className="text-xs text-slate-400">
          Appears in search engine results. Recommended: 50-60 characters.
        </p>
      </div>

      {/* Meta description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="seoDescription" className="text-sm font-semibold">
            Meta description
          </Label>
          <span className={counterClass(seoDescLength, 160, 500)}>
            {seoDescLength}/500
          </span>
        </div>
        <Textarea
          id="seoDescription"
          name="seoDescription"
          value={value.seoDescription}
          onChange={(e) => onChange({ seoDescription: e.target.value })}
          placeholder="Brief description for search engine results"
          className="min-h-[90px] border-2 focus:border-indigo-500 transition-colors"
          maxLength={500}
        />
        <p className="text-xs text-slate-400">
          Appears below the title in search results. Recommended: 120-160
          characters.
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags" className="text-sm font-semibold">
          Tags
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Type a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="h-11 border-2 focus:border-indigo-500 transition-colors"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            className="h-11 px-4">
            Add
          </Button>
        </div>
        {value.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {value.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 px-2 py-0.5 text-[11px] font-mono">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-0.5 hover:text-rose-500">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
