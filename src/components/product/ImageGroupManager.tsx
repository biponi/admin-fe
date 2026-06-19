import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ImageGroupCard } from "./ImageGroupCard";
import {
  Plus,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
  Wand2,
} from "lucide-react";
import { IImageGroup, IVariation } from "@/pages/product/interface";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { validateImageGroup } from "@/utils/functions";

interface ImageGroupManagerProps {
  imageGroups: IImageGroup[];
  variations: IVariation[];
  onImageGroupsChange: (groups: IImageGroup[]) => void;
  disabled?: boolean;
  mode?: "create" | "edit";
  /** Max height of the scrollable groups list. Defaults to 480px */
  maxHeight?: number;
}

const ATTRIBUTE_OPTIONS = [
  { value: "color", label: "Color" },
  { value: "size", label: "Size" },
  { value: "material", label: "Material" },
  { value: "pattern", label: "Pattern" },
  { value: "fit", label: "Fit" },
  { value: "style", label: "Style" },
];

const COLOR_PRESETS: { [key: string]: string } = {
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

export const ImageGroupManager: React.FC<ImageGroupManagerProps> = ({
  imageGroups,
  variations,
  onImageGroupsChange,
  disabled = false,
  mode = "create",
  maxHeight = 480,
}) => {
  const [selectedAttribute, setSelectedAttribute] = useState<string>("color");
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [newlyAddedGroupId, setNewlyAddedGroupId] = useState<string | null>(null);

  const handleAutoGenerateGroups = () => {
    if (!variations || variations.length === 0) {
      toast.error("No variations available to group");
      return;
    }

    const attrMap: Record<string, { variantIds: string[]; value: string }> = {};

    variations.forEach((variant) => {
      const attrValue = variant[selectedAttribute as keyof IVariation];

      // Skip empty values - don't create "Default" group
      if (!attrValue || String(attrValue).trim() === '') {
        return; // Skip this variation
      }

      const stringValue = String(attrValue);

      if (!attrMap[stringValue]) {
        attrMap[stringValue] = { variantIds: [], value: stringValue };
      }
      attrMap[stringValue].variantIds.push(variant.id);
    });

    // Check if any valid groups were created
    if (Object.keys(attrMap).length === 0) {
      toast.error(
        `No variations found with ${selectedAttribute} values. Please fill in the ${selectedAttribute} field for your variations first.`,
      );
      return;
    }

    const newGroups: IImageGroup[] = Object.entries(attrMap).map(
      ([attrValue, data], index) => ({
        id: `group-${Date.now()}-${index}`,
        attribute: selectedAttribute,
        value: data.value,
        displayLabel: data.value,
        colorHex:
          selectedAttribute === "color"
            ? COLOR_PRESETS[data.value.toLowerCase()] || "#6b7280"
            : undefined,
        images: [],
        variantIds: data.variantIds,
        sortOrder: index,
      }),
    );

    onImageGroupsChange(newGroups);
    toast.success(
      `Generated ${newGroups.length} ${selectedAttribute} group${
        newGroups.length > 1 ? "s" : ""
      }`,
    );
  };

  const handleAddNewGroup = () => {
    // Create a temporary group with default values
    const groupId = `group-${Date.now()}`;
    const newGroup: IImageGroup = {
      id: groupId,
      attribute: selectedAttribute,
      value: '', // Empty initially - user must set this
      displayLabel: `New ${selectedAttribute} Group`,
      colorHex: selectedAttribute === "color" ? "#6b7280" : undefined,
      images: [],
      variantIds: [],
      sortOrder: imageGroups.length,
    };

    // Add the group even though it's incomplete - it will be validated before save
    onImageGroupsChange([...imageGroups, newGroup]);
    // Track the newly added group so it auto-opens in edit mode
    setNewlyAddedGroupId(groupId);
    toast.success(`New ${selectedAttribute} group added. Please set the value field before adding images.`, {
      duration: 5000,
    });
  };

  const handleUpdateGroup = (updatedGroup: IImageGroup) => {
    // Validate the updated group before saving
    if (!validateImageGroup(updatedGroup)) {
      toast.error("Cannot save group: Both attribute and value are required");
      return;
    }

    onImageGroupsChange(
      imageGroups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)),
    );
  };

  const handleDeleteGroup = (groupId: string) => {
    onImageGroupsChange(imageGroups.filter((g) => g.id !== groupId));
    toast.success("Group deleted");
  };

  const handleMoveGroup = (groupId: string, direction: "up" | "down") => {
    const index = imageGroups.findIndex((g) => g.id === groupId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= imageGroups.length) return;

    const newGroups = [...imageGroups];
    const [removed] = newGroups.splice(index, 1);
    newGroups.splice(newIndex, 0, removed);

    onImageGroupsChange(newGroups.map((g, idx) => ({ ...g, sortOrder: idx })));
  };

  const hasGroups = imageGroups.length > 0;

  return (
    <div className='rounded-lg border border-border bg-card shadow-sm overflow-hidden'>
      {/* ── Header / Toggle ── */}
      <button
        type='button'
        onClick={() => setIsPanelOpen((p) => !p)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3",
          "bg-muted/40 hover:bg-muted/70 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        aria-expanded={isPanelOpen}>
        <div className='flex items-center gap-2 min-w-0'>
          <Layers className='h-4 w-4 text-muted-foreground shrink-0' />
          <Label
            asChild
            className='text-sm font-semibold cursor-pointer select-none truncate'>
            <span>Image Groups</span>
          </Label>
          {hasGroups && (
            <Badge variant='secondary' className='text-xs shrink-0'>
              {imageGroups.length} group{imageGroups.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        {isPanelOpen ? (
          <ChevronUp className='h-4 w-4 text-muted-foreground shrink-0' />
        ) : (
          <ChevronDown className='h-4 w-4 text-muted-foreground shrink-0' />
        )}
      </button>

      {/* ── Collapsible body ── */}
      {isPanelOpen && (
        <div className='px-4 py-4 space-y-4'>
          {/* ── Toolbar ── */}
          {!disabled && (
            <div className='flex flex-wrap items-center gap-2 justify-between'>
              <p className='text-xs text-muted-foreground'>
                Organize images by attribute and share across variants.
              </p>

              <div className='flex flex-wrap items-center gap-2'>
                {/* Auto-generate visible when there are no groups */}
                {!hasGroups && (
                  <>
                    <div className='w-[130px]'>
                      <Select
                        value={selectedAttribute}
                        onValueChange={setSelectedAttribute}>
                        <SelectTrigger className='h-8 text-xs'>
                          <SelectValue placeholder='Attribute' />
                        </SelectTrigger>
                        <SelectContent>
                          {ATTRIBUTE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={handleAutoGenerateGroups}
                      className='h-8 text-xs gap-1.5'>
                      <Wand2 className='h-3.5 w-3.5' />
                      Auto-generate
                    </Button>
                  </>
                )}

                <Button
                  type='button'
                  variant='default'
                  size='sm'
                  onClick={handleAddNewGroup}
                  className='h-8 text-xs gap-1.5'>
                  <Plus className='h-3.5 w-3.5' />
                  Add group
                </Button>
              </div>
            </div>
          )}

          {/* ── Empty state info ── */}
          {!hasGroups && (
            <div className='flex items-start gap-3 p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-md'>
              <Info className='h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0' />
              <div className='space-y-1 min-w-0'>
                <p className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                  What are image groups?
                </p>
                <p className='text-xs text-blue-700 dark:text-blue-300 leading-relaxed'>
                  Upload images once per attribute (color, material, pattern,
                  etc.) and automatically share them across all matching
                  variants. For example, upload "Red" images once and they'll
                  apply to Red-S, Red-M, Red-L, Red-XL — saving time and
                  storage.
                </p>
              </div>
            </div>
          )}

          {/* ── Scrollable group list ── */}
          {hasGroups && (
            <>
              <Separator />
              <div
                className='overflow-y-auto space-y-3 pr-1'
                style={{ maxHeight }}>
                {imageGroups.map((group, index) => (
                  <ImageGroupCard
                    key={group.id}
                    group={group}
                    variations={variations}
                    onUpdate={handleUpdateGroup}
                    onDelete={() => handleDeleteGroup(group.id)}
                    onMoveUp={
                      index > 0
                        ? () => handleMoveGroup(group.id, "up")
                        : undefined
                    }
                    onMoveDown={
                      index < imageGroups.length - 1
                        ? () => handleMoveGroup(group.id, "down")
                        : undefined
                    }
                    canMoveUp={index > 0}
                    canMoveDown={index < imageGroups.length - 1}
                    disabled={disabled}
                    forceEditMode={group.id === newlyAddedGroupId}
                    onEditModeEnd={() => setNewlyAddedGroupId(null)}
                  />
                ))}
              </div>

              {/* Scroll hint — only shown when list overflows */}
              {imageGroups.length > 3 && (
                <p className='text-xs text-muted-foreground text-center pt-1'>
                  Scroll to see all {imageGroups.length} groups
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
