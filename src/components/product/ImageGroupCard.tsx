import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ImageGroupUploader } from "./ImageGroupUploader";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Check,
  X,
  Palette,
  Ruler,
  Shirt,
  Scan,
  Sparkles,
  Tag,
  ImageIcon,
  Users,
} from "lucide-react";
import { IImageGroup, IVariation } from "@/pages/product/interface";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { validateImageGroup } from "@/utils/functions";

interface ImageGroupCardProps {
  group: IImageGroup;
  variations: IVariation[];
  onUpdate: (group: IImageGroup) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  disabled?: boolean;
}

const COLOR_PRESETS: Record<string, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#10b981",
  yellow: "#f59e0b",
  purple: "#8b5cf6",
  pink: "#ec4899",
  black: "#000000",
  white: "#ffffff",
  gray: "#6b7280",
  brown: "#92400e",
  orange: "#f97316",
  navy: "#1e3a8a",
  beige: "#f5f5dc",
  maroon: "#800000",
  olive: "#808000",
  teal: "#14b8a6",
};

const ATTRIBUTE_ICONS: Record<string, React.ReactNode> = {
  color: <Palette className='h-4 w-4' />,
  size: <Ruler className='h-4 w-4' />,
  material: <Shirt className='h-4 w-4' />,
  pattern: <Scan className='h-4 w-4' />,
  fit: <Sparkles className='h-4 w-4' />,
  style: <Sparkles className='h-4 w-4' />,
};

const ATTRIBUTE_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  color: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-800",
  },
  size: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
  },
  material: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  pattern: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
  },
  fit: {
    bg: "bg-teal-50 dark:bg-teal-950/30",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
  },
  style: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-800",
  },
};

const DEFAULT_ATTR_STYLE = {
  bg: "bg-muted/60",
  text: "text-muted-foreground",
  border: "border-border",
};

function getAttrStyle(attribute: string) {
  return ATTRIBUTE_COLORS[attribute.toLowerCase()] ?? DEFAULT_ATTR_STYLE;
}

function getAttrIcon(attribute: string) {
  return (
    ATTRIBUTE_ICONS[attribute.toLowerCase()] ?? <Tag className='h-4 w-4' />
  );
}

function getColorHex(colorValue: string, fallback = "#6b7280") {
  return COLOR_PRESETS[colorValue.toLowerCase()] ?? fallback;
}

function isLight(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export const ImageGroupCard: React.FC<ImageGroupCardProps> = ({
  group,
  variations,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(group.displayLabel);
  const [editedColorHex, setEditedColorHex] = useState(
    group.colorHex || getColorHex(group.value),
  );

  const isColorAttr = group.attribute === "color";
  const groupVariants = variations.filter((v) =>
    group.variantIds.includes(v.id),
  );
  const attrStyle = getAttrStyle(group.attribute);
  const currentColor = isColorAttr
    ? editedColorHex || getColorHex(group.value)
    : "";
  const colorIsDark = isColorAttr && !isLight(currentColor);

  const handleSaveEdit = () => {
    if (!editedLabel.trim()) {
      toast.error("Display label cannot be empty");
      return;
    }

    // Ensure required fields exist before saving
    if (!validateImageGroup(group)) {
      toast.error("Cannot save group: Missing required attribute or value");
      setIsEditing(false);
      return;
    }

    onUpdate({
      ...group,
      displayLabel: editedLabel.trim(),
      colorHex: isColorAttr ? editedColorHex : group.colorHex,
    });
    setIsEditing(false);
    toast.success("Group updated");
  };

  const handleCancelEdit = () => {
    setEditedLabel(group.displayLabel);
    setEditedColorHex(group.colorHex || getColorHex(group.value));
    setIsEditing(false);
  };

  const handleImagesChange = (_groupId: string, images: (File | string)[]) => {
    // Ensure required fields exist before updating images
    if (!validateImageGroup(group)) {
      toast.error("Cannot update images: Group is missing required attribute or value");
      return;
    }
    onUpdate({ ...group, images });
  };

  // Build a readable variant label from any attribute fields
  const variantLabel = (v: IVariation) => {
    const parts: string[] = [];
    if (v.color) parts.push(v.color);
    if (v.size) parts.push(v.size);
    if (v.material) parts.push((v as any).material);
    if (v.pattern) parts.push((v as any).pattern);
    return parts.length ? parts.join(" / ") : v.id;
  };

  return (
    <Card
      className={cn(
        "w-full transition-shadow duration-200",
        "hover:shadow-md",
        isEditing && "ring-2 ring-primary/20",
      )}>
      {/* ── Card Header ── */}
      <CardHeader className='p-0'>
        <div className='flex items-stretch gap-0'>
          {/* Left accent — color swatch or attribute icon */}
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-tl-lg",
              isColorAttr ? "min-w-[52px]" : cn("min-w-[52px]", attrStyle.bg),
              !isExpanded && "rounded-bl-lg",
            )}
            style={isColorAttr ? { backgroundColor: currentColor } : undefined}
            title={isColorAttr ? `#${currentColor}` : group.attribute}>
            {isColorAttr ? (
              <div
                className={cn(
                  "text-[10px] font-mono px-1 rounded",
                  colorIsDark
                    ? "text-white/80 bg-black/20"
                    : "text-black/60 bg-white/30",
                )}>
                {currentColor.toUpperCase()}
              </div>
            ) : (
              <span className={attrStyle.text}>
                {getAttrIcon(group.attribute)}
              </span>
            )}

            {/* Move buttons stacked vertically */}
            <div className='flex flex-col gap-0.5'>
              <button
                type='button'
                onClick={onMoveUp}
                disabled={!canMoveUp || disabled}
                title='Move up'
                className={cn(
                  "rounded p-0.5 transition-colors",
                  canMoveUp && !disabled
                    ? isColorAttr
                      ? "text-white/70 hover:text-white hover:bg-white/20"
                      : cn(attrStyle.text, "hover:bg-black/5")
                    : "opacity-20 cursor-not-allowed",
                  isColorAttr ? "text-white/50" : attrStyle.text,
                )}>
                <ChevronUp className='h-3 w-3' />
              </button>
              <button
                type='button'
                onClick={onMoveDown}
                disabled={!canMoveDown || disabled}
                title='Move down'
                className={cn(
                  "rounded p-0.5 transition-colors",
                  canMoveDown && !disabled
                    ? isColorAttr
                      ? "text-white/70 hover:text-white hover:bg-white/20"
                      : cn(attrStyle.text, "hover:bg-black/5")
                    : "opacity-20 cursor-not-allowed",
                  isColorAttr ? "text-white/50" : attrStyle.text,
                )}>
                <ChevronDown className='h-3 w-3' />
              </button>
            </div>
          </div>

          {/* Main header content */}
          <div className='flex flex-1 items-center justify-between gap-2 px-3 py-3 min-w-0'>
            {isEditing ? (
              /* ── Edit mode ── */
              <div className='flex-1 space-y-2 min-w-0'>
                <div className='flex items-center gap-2'>
                  <Input
                    value={editedLabel}
                    onChange={(e) => setEditedLabel(e.target.value)}
                    placeholder='Display label'
                    className='text-sm h-8 flex-1 min-w-0'
                    disabled={disabled}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                  />
                </div>
                {isColorAttr && (
                  <div className='flex items-center gap-2'>
                    <input
                      type='color'
                      value={editedColorHex || "#6b7280"}
                      onChange={(e) => setEditedColorHex(e.target.value)}
                      className='h-8 w-10 rounded border border-border cursor-pointer p-0.5 bg-background'
                      disabled={disabled}
                    />
                    <Input
                      value={editedColorHex}
                      onChange={(e) => setEditedColorHex(e.target.value)}
                      placeholder='#HEX color'
                      className='text-xs h-8 flex-1 font-mono'
                      disabled={disabled}
                    />
                  </div>
                )}
                {!isColorAttr && (
                  <p className='text-xs text-muted-foreground'>
                    Attribute type:{" "}
                    <span className='font-medium capitalize'>
                      {group.attribute}
                    </span>
                  </p>
                )}
              </div>
            ) : (
              /* ── View mode ── */
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold capitalize truncate leading-tight'>
                  {group.displayLabel}
                </p>
                <div className='flex flex-wrap items-center gap-1.5 mt-1.5'>
                  {/* Attribute badge */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded border capitalize",
                      attrStyle.bg,
                      attrStyle.text,
                      attrStyle.border,
                    )}>
                    {getAttrIcon(group.attribute)}
                    {group.attribute}
                  </span>

                  {/* Value badge */}
                  <Badge variant='secondary' className='text-[11px] capitalize'>
                    {group.value || "—"}
                  </Badge>

                  {/* Variant count */}
                  <span className='inline-flex items-center gap-1 text-[11px] text-muted-foreground'>
                    <Users className='h-3 w-3' />
                    {groupVariants.length} variant
                    {groupVariants.length !== 1 ? "s" : ""}
                  </span>

                  {/* Image count */}
                  {group.images.length > 0 && (
                    <span className='inline-flex items-center gap-1 text-[11px] text-muted-foreground'>
                      <ImageIcon className='h-3 w-3' />
                      {group.images.length} image
                      {group.images.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className='flex items-center gap-0.5 shrink-0'>
              {isEditing ? (
                <>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30'
                    onClick={handleSaveEdit}
                    title='Save changes'>
                    <Check className='h-3.5 w-3.5' />
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10'
                    onClick={handleCancelEdit}
                    title='Cancel'>
                    <X className='h-3.5 w-3.5' />
                  </Button>
                </>
              ) : (
                <>
                  {!disabled && (
                    <>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        onClick={() => setIsEditing(true)}
                        title='Edit group'>
                        <Edit2 className='h-3.5 w-3.5' />
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10'
                        onClick={onDelete}
                        title='Delete group'>
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </>
                  )}
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                    onClick={() => setIsExpanded((p) => !p)}
                    title={isExpanded ? "Collapse" : "Expand"}>
                    {isExpanded ? (
                      <ChevronUp className='h-3.5 w-3.5' />
                    ) : (
                      <ChevronDown className='h-3.5 w-3.5' />
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      {/* ── Expanded body ── */}
      {isExpanded && (
        <>
          <Separator />
          <CardContent className='pt-4 pb-4 px-4 space-y-4'>
            {/* Linked variants */}
            {groupVariants.length > 0 && (
              <div>
                <Label className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block'>
                  Linked variants
                </Label>
                <div className='flex flex-wrap gap-1.5'>
                  {groupVariants.map((v) => (
                    <Badge
                      key={v.id}
                      variant='outline'
                      className='text-xs font-normal'>
                      {variantLabel(v)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {groupVariants.length === 0 && !disabled && (
              <p className='text-xs text-muted-foreground italic'>
                No variants linked to this group yet.
              </p>
            )}

            {/* Image uploader */}
            <div>
              <Label className='text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block'>
                Images
              </Label>
              <ImageGroupUploader
                groupId={group.id}
                groupName={group.displayLabel}
                images={group.images}
                maxImages={10}
                onImagesChange={handleImagesChange}
                disabled={disabled}
              />
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};
