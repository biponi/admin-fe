import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ICategory, IChangeEvent } from "../../interface";
import {
  ArrowLeft,
  Save,
  Loader2,
  Tag,
  Percent,
  Settings2,
  ImageIcon,
  ChevronRight,
  Layers,
  FolderPlus,
  FolderEdit,
  Search,
  X,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Badge } from "../../../../components/ui/badge";
import TiptapEditor from "../../../../components/ui/tiptap";
import PlaceHolderImage from "../../../../assets/placeholder.svg";
import AIGenerateButton from "./AIGenerateButton";
import StreamingAIModal from "./StreamingAIModal";
import AIVersionsPanel from "./AIVersionsPanel";
import {
  AIGenerationVersion,
  AiSeoContent,
  AiSeoSuggestion,
} from "../../../../api/aiSeo";

interface CategoryFormProps {
  mode: "create" | "edit";
  categories: ICategory[];
  existingCategory?: ICategory | null;
  loading: boolean;
  onSubmit: (data: any) => Promise<boolean>;
}

const defaultCategory = {
  id: "",
  name: "",
  img: "",
  description: "",
  shortDescription: "",
  discount: 0,
  discountType: "%" as "%" | "fixed" | "flat",
  active: true,
  parentId: null as string | null,
  google_category_type: "",
  focusKeyphrase: "",
  seoTitle: "",
  metaDescription: "",
  tags: [] as string[],
};

// Cap on stored AI generation versions (newest kept)
const MAX_VERSIONS = 5;

const SectionHeading: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  aiButton?: React.ReactNode;
}> = ({ icon, title, subtitle, aiButton }) => (
  <div className='flex items-center justify-between mb-4 pb-3 border-b border-slate-100'>
    <div>
      <h3 className='text-[11px] font-semibold uppercase tracking-wider text-slate-500'>
        {title}
      </h3>
      {subtitle && (
        <p className='text-[11px] text-slate-400 mt-0.5'>{subtitle}</p>
      )}
    </div>
    {aiButton}
  </div>
);

const CategoryForm: React.FC<CategoryFormProps> = ({
  mode,
  categories,
  existingCategory,
  loading,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);
  const [formData, setFormData] = useState(defaultCategory);
  const [tagInput, setTagInput] = useState("");
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiVersions, setAiVersions] = useState<AIGenerationVersion[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (existingCategory && mode === "edit") {
      setFormData({
        id: existingCategory.id,
        name: existingCategory.name || "",
        img: existingCategory.img || "",
        description: existingCategory.description || "",
        shortDescription: existingCategory.shortDescription || "",
        discount: existingCategory.discount || 0,
        discountType: existingCategory.discountType || "%",
        active: existingCategory.active ?? true,
        parentId: existingCategory.parentId || null,
        google_category_type: existingCategory.google_category_type || "",
        focusKeyphrase: existingCategory.focusKeyphrase || "",
        seoTitle: existingCategory.seoTitle || "",
        metaDescription: existingCategory.metaDescription || "",
        tags: existingCategory.tags || [],
      });
    }
  }, [existingCategory, mode]);

  const getAvailableParentCategories = () => {
    if (mode === "create") return categories;
    if (!existingCategory?.id) return categories;

    return categories.filter((cat) => {
      if (cat.id === existingCategory.id) return false;
      if (cat.ancestors && cat.ancestors.includes(existingCategory.id))
        return false;
      return true;
    });
  };

  const buildCategoryDisplayName = (cat: ICategory): string => {
    const levelIndicator = "\u00A0\u00A0".repeat(cat.level || 0);
    return `${levelIndicator}${cat.name} (Level ${cat.level || 0})`;
  };

  const getCategoryBreadcrumb = (parentId: string | null): string => {
    if (!parentId) return "Root Category";
    const parent = categories.find((cat) => cat.id === parentId);
    if (!parent) return "Root Category";
    const breadcrumb = parent.categoryHierarchy
      ? parent.categoryHierarchy.map((c: any) => c.name).join(" > ") +
        " > " +
        parent.name
      : parent.name;
    return breadcrumb + " > " + (formData.name || "New Category");
  };

  const handleChange = (e: IChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParentChange = (parentId: string) => {
    setFormData((prev) => ({
      ...prev,
      parentId: parentId === "root" ? null : parentId,
    }));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async () => {
    const submitData = {
      ...formData,
      ...(image ? { img: image } : {}),
    };
    const res = await onSubmit(submitData);
    if (res) {
      navigate("/category");
    }
  };

  // ── AI version handling ──────────────────────────────────────────────
  const versionsStorageKey = `ai-seo-versions:${
    mode === "edit" ? existingCategory?.id : `new:${formData.name}`
  }`;

  // Restore persisted versions once per form target
  useEffect(() => {
    try {
      const raw = localStorage.getItem(versionsStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((v) => v?.result?.content)) {
        setAiVersions(parsed.slice(0, MAX_VERSIONS));
        setActiveVersionIndex(0);
      }
    } catch {
      // Corrupt payload — start fresh
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, existingCategory?.id]);

  useEffect(() => {
    if (aiVersions.length === 0) return;
    try {
      localStorage.setItem(versionsStorageKey, JSON.stringify(aiVersions));
    } catch {
      // Storage full/unavailable — in-memory versions still work
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiVersions]);

  // Auto-detect when form content matches AI-generated content (e.g. copy-paste)
  useEffect(() => {
    if (aiVersions.length === 0) return;
    const active = aiVersions[activeVersionIndex]?.result?.content;
    if (!active) return;

    const newApplied = new Set(appliedFields);
    let changed = false;

    const markIfMatch = (key: string, formVal: string, aiVal: string) => {
      if (formVal === aiVal && !newApplied.has(key)) {
        newApplied.add(key);
        changed = true;
      }
    };

    markIfMatch("description", formData.description, active.description || "");
    markIfMatch("shortDescription", formData.shortDescription, active.shortDescription || "");
    markIfMatch("seoTitle", formData.seoTitle, active.seoTitle || "");
    markIfMatch("focusKeyphrase", formData.focusKeyphrase, active.focusKeyphrase || "");
    markIfMatch("metaDescription", formData.metaDescription, active.metaDescription || "");
    markIfMatch("google_category_type", formData.google_category_type, active.google_category_type || "");

    const sortedFormTags = [...(formData.tags || [])].sort();
    const sortedAiTags = [...(active.tags || [])].sort();
    if (
      sortedFormTags.length === sortedAiTags.length &&
      sortedFormTags.every((t, i) => t === sortedAiTags[i]) &&
      !newApplied.has("tags")
    ) {
      newApplied.add("tags");
      changed = true;
    }

    if (changed) setAppliedFields(newApplied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, aiVersions, activeVersionIndex]);

  const handleVersionGenerated = (version: AIGenerationVersion) => {
    setAiVersions((prev) => [version, ...prev].slice(0, MAX_VERSIONS));
    setActiveVersionIndex(0);
  };

  const ALL_AI_FIELDS = [
    "description",
    "shortDescription",
    "focusKeyphrase",
    "seoTitle",
    "metaDescription",
    "tags",
    "google_category_type",
  ];

  const handleApplyAIField = (
    field: keyof AiSeoContent,
    value: AiSeoContent[keyof AiSeoContent],
  ) => {
    setFormData((prev) => {
      if (field === "tags" && Array.isArray(value)) {
        const merged = Array.from(new Set([...(prev.tags || []), ...value]));
        return { ...prev, tags: merged };
      }
      return { ...prev, [field]: value } as typeof prev;
    });
    setAppliedFields((prev) => new Set([...prev, field as string]));
  };

  const handleApplyAllFromVersion = (version: AIGenerationVersion) => {
    const body = version.result.suggestedUpdateBody || version.result.content;
    setFormData((prev) => ({
      ...prev,
      description: body.description ?? prev.description,
      shortDescription: body.shortDescription ?? prev.shortDescription,
      focusKeyphrase: body.focusKeyphrase ?? prev.focusKeyphrase,
      seoTitle: body.seoTitle ?? prev.seoTitle,
      metaDescription: body.metaDescription ?? prev.metaDescription,
      tags: body.tags ?? prev.tags,
      google_category_type:
        body.google_category_type ?? prev.google_category_type,
    }));
    setAppliedFields((prev) => new Set([...prev, ...ALL_AI_FIELDS]));
  };

  const handleApplySuggestion = (
    field: AiSeoSuggestion["field"],
    value: string,
  ) => {
    if (field === "discount") {
      const parsed = parseFloat(value);
      if (!Number.isNaN(parsed)) {
        setFormData((prev) => ({ ...prev, discount: parsed }));
      }
    } else if (field === "discountType") {
      if (value === "%" || value === "fixed" || value === "flat") {
        setFormData((prev) => ({ ...prev, discountType: value }));
      }
    } else if (field === "name") {
      if (value.trim())
        setFormData((prev) => ({ ...prev, name: value.trim() }));
    }
    setAppliedFields((prev) => new Set([...prev, `suggestion:${field}`]));
  };

  const handleClearVersions = () => {
    setAiVersions([]);
    setActiveVersionIndex(0);
    setAppliedFields(new Set());
    try {
      localStorage.removeItem(versionsStorageKey);
    } catch {
      // ignore
    }
  };

  const previewImageSrc =
    existingCategory?.img && typeof existingCategory.img === "string"
      ? existingCategory.img
      : image
        ? URL.createObjectURL(image)
        : PlaceHolderImage;

  const isFixedDiscount = formData.discountType === "fixed";
  const seoTitleLength = formData.seoTitle.length;
  const metaDescLength = formData.metaDescription.replace(
    /<[^>]*>/g,
    "",
  ).length;

  return (
    <div className='min-h-screen bg-[#FAF9F6]'>
      <div className='max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        {/* Page Header */}
        <div className='flex items-center justify-between gap-3 mb-6'>
          <div className='flex items-center gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate("/category")}
              className='border-slate-300 text-slate-600 hover:bg-slate-50 rounded-md'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Button>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center w-9 h-9 rounded-lg bg-[#141413]'>
                {mode === "create" ? (
                  <FolderPlus className='h-4 w-4 text-white' />
                ) : (
                  <FolderEdit className='h-4 w-4 text-white' />
                )}
              </div>
              <div>
                <h1 className='text-lg font-semibold text-[#141413] leading-tight'>
                  {mode === "create" ? "Create Category" : "Edit Category"}
                </h1>
                <p className='text-[12px] text-slate-500 mt-0.5'>
                  {mode === "create"
                    ? "Add a new category to your store"
                    : `Updating "${existingCategory?.name || ""}"`}
                </p>
              </div>
            </div>
          </div>
          <AIGenerateButton
            onClick={() => setIsAIModalOpen(true)}
            disabled={(mode === "create" && !formData.name) || loading}
          />
        </div>

        <StreamingAIModal
          open={isAIModalOpen}
          onOpenChange={setIsAIModalOpen}
          mode={mode}
          categoryId={existingCategory?.id}
          categoryName={formData.name || existingCategory?.name || "Category"}
          parentId={formData.parentId}
          onVersionGenerated={handleVersionGenerated}
          onApplySuggestion={handleApplySuggestion}
          appliedFields={appliedFields}
        />

        {/* AI Generated Versions Panel */}
        {aiVersions.length > 0 && (
          <div className='mb-6'>
            <AIVersionsPanel
              versions={aiVersions}
              activeIndex={activeVersionIndex}
              onSelectVersion={setActiveVersionIndex}
              onApplyField={handleApplyAIField}
              onApplyAll={handleApplyAllFromVersion}
              onApplySuggestion={handleApplySuggestion}
              onClear={handleClearVersions}
              appliedFields={appliedFields}
            />
          </div>
        )}

        {/* Preview Strip */}
        <div className='flex items-center gap-3 rounded-lg border border-slate-200 bg-[#FAF9F6] p-3 mb-6'>
          <img
            alt='Category preview'
            src={previewImageSrc}
            className='h-10 w-10 shrink-0 rounded-md object-cover border border-slate-200'
          />
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-1.5'>
              <span className='truncate text-[13px] font-semibold text-[#141413]'>
                {formData.name || "New category"}
              </span>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  formData.active
                    ? "bg-[#141413] text-white"
                    : "bg-slate-200 text-slate-600"
                }`}>
                {formData.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className='truncate text-[11px] text-slate-400 mt-0.5 font-mono'>
              {formData.parentId ? (
                getCategoryBreadcrumb(formData.parentId)
              ) : (
                <span className='inline-flex items-center gap-1 font-sans'>
                  <Layers className='h-3 w-3' />
                  Root category
                </span>
              )}
            </div>
          </div>
          {!!formData.discount && Number(formData.discount) > 0 && (
            <span className='shrink-0 rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-mono font-medium text-[#141413]'>
              {isFixedDiscount
                ? `\u09F3${formData.discount}`
                : `${formData.discount}%`}{" "}
              off
            </span>
          )}
        </div>

        {/* Form Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6'>
          {/* Section 1: Basic Information (Left Column) */}
          <div className='rounded-lg border border-slate-200 bg-white p-4'>
            <SectionHeading
              icon={<Tag className='h-3.5 w-3.5' />}
              title='Basic information'
            />
            <div className='space-y-3'>
              <div className='grid w-full gap-1.5'>
                <Label
                  htmlFor='name'
                  className='text-[13px] font-medium text-slate-600'>
                  Category name <span className='text-rose-500'>*</span>
                </Label>
                <Input
                  type='text'
                  id='name'
                  name='name'
                  onChange={handleChange}
                  placeholder='e.g. Electronics'
                  value={formData.name}
                  className='h-9 border-slate-200 focus-visible:ring-[#141413] focus-visible:border-[#141413] rounded-md text-[13px]'
                />
              </div>

              <div className='grid w-full gap-1.5'>
                <Label
                  htmlFor='parentId'
                  className='text-[13px] font-medium text-slate-600'>
                  Parent category
                </Label>
                <Select
                  value={formData.parentId || "root"}
                  onValueChange={handleParentChange}>
                  <SelectTrigger className='h-9 border-slate-200 focus:ring-[#141413] rounded-md text-[13px]'>
                    <SelectValue placeholder='Select parent category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='root'>
                      Root category (no parent)
                    </SelectItem>
                    {getAvailableParentCategories()
                      .sort((a, b) => (a.level || 0) - (b.level || 0))
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {buildCategoryDisplayName(cat)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {formData.parentId && (
                  <div className='flex items-center gap-1 text-[11px] text-slate-400 mt-1 font-mono'>
                    <ChevronRight className='h-3 w-3 shrink-0' />
                    <span className='truncate'>
                      {getCategoryBreadcrumb(formData.parentId)}
                    </span>
                  </div>
                )}
              </div>

              <div className='grid w-full gap-1.5'>
                <Label
                  htmlFor='shortDescription'
                  className='text-[13px] font-medium text-slate-600'>
                  Short description
                </Label>
                <Input
                  type='text'
                  id='shortDescription'
                  name='shortDescription'
                  placeholder='Brief one-liner for this category'
                  onChange={handleChange}
                  value={formData.shortDescription}
                  className='h-9 border-slate-200 focus-visible:ring-[#141413] focus-visible:border-[#141413] rounded-md text-[13px]'
                />
                <p className='text-[11px] text-slate-400'>
                  A short summary used in listings and cards
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Discounts (Left Column) */}
          <div className='rounded-lg border border-slate-200 bg-white p-4'>
            <SectionHeading
              icon={<Percent className='h-3.5 w-3.5' />}
              title='Pricing & discounts'
            />
            <div className='grid grid-cols-2 gap-3'>
              <div className='grid w-full gap-1.5'>
                <Label
                  htmlFor='discountType'
                  className='text-[13px] font-medium text-slate-600'>
                  Discount type
                </Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value: "%" | "fixed" | "flat") =>
                    setFormData((prev) => ({ ...prev, discountType: value }))
                  }>
                  <SelectTrigger className='h-9 border-slate-200 focus:ring-[#141413] rounded-md text-[13px]'>
                    <SelectValue placeholder='Select discount type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='%'>Percentage (%)</SelectItem>
                    <SelectItem value='fixed'>Fixed amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='grid w-full gap-1.5'>
                <Label
                  htmlFor='discount'
                  className='text-[13px] font-medium text-slate-600'>
                  Discount {isFixedDiscount ? "(\u09F3)" : "(%)"}
                </Label>
                <div className='relative'>
                  {isFixedDiscount && (
                    <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400 font-mono'>
                      \u09F3
                    </span>
                  )}
                  <Input
                    type='number'
                    id='discount'
                    name='discount'
                    placeholder='0.00'
                    min='0'
                    max={isFixedDiscount ? undefined : "100"}
                    step='0.01'
                    onChange={handleChange}
                    value={formData.discount || ""}
                    className={`h-9 border-slate-200 focus-visible:ring-[#141413] focus-visible:border-[#141413] rounded-md text-[13px] font-mono ${
                      isFixedDiscount ? "pl-7" : ""
                    } ${!isFixedDiscount ? "pr-7" : ""}`}
                  />
                  {!isFixedDiscount && (
                    <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-400 font-mono'>
                      %
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Description & Content (Right Column) */}
          <div className='rounded-lg border border-slate-200 bg-white p-4'>
            <SectionHeading
              icon={<Search className='h-3.5 w-3.5' />}
              title='Description & content'
            />
            <div className='space-y-3'>
              <div className='grid w-full gap-1.5'>
                <Label
                  htmlFor='description'
                  className='text-[13px] font-medium text-slate-600'>
                  Description
                </Label>
                <TiptapEditor
                  content={formData.description}
                  onChange={(content) =>
                    setFormData((prev) => ({ ...prev, description: content }))
                  }
                  placeholder='What belongs in this category? Describe the products, use cases, or themes.'
                  className='border-slate-200 rounded-md min-h-[150px]'
                />
              </div>

              <div className='grid w-full gap-1.5'>
                <Label className='text-[13px] font-medium text-slate-600'>
                  Tags
                </Label>
                <div className='flex items-center gap-2'>
                  <Input
                    type='text'
                    placeholder='Type a tag and press Enter'
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className='h-9 border-slate-200 focus-visible:ring-[#141413] focus-visible:border-[#141413] rounded-md text-[13px]'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                    className='h-9 px-3 border-slate-300 text-slate-600 hover:bg-slate-50 rounded-md text-[13px]'>
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1.5 mt-1'>
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant='secondary'
                        className='gap-1 px-2 py-0.5 text-[11px] bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md font-mono'>
                        {tag}
                        <button
                          type='button'
                          onClick={() => handleRemoveTag(tag)}
                          className='ml-0.5 hover:text-rose-500'>
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: SEO Settings (Right Column) */}
          <div className='rounded-lg border border-slate-200 bg-white p-4'>
            <SectionHeading
              icon={<Search className='h-3.5 w-3.5' />}
              title='SEO settings'
              subtitle='Optimize for search engines'
            />
            <div className='space-y-3'>
              <div className='grid w-full gap-1.5'>
                <div className='flex items-center justify-between'>
                  <Label
                    htmlFor='seoTitle'
                    className='text-[13px] font-medium text-slate-600'>
                    SEO title
                  </Label>
                  <span
                    className={`text-[11px] font-mono ${
                      seoTitleLength > 100
                        ? "text-rose-500"
                        : seoTitleLength > 70
                          ? "text-amber-500"
                          : "text-slate-400"
                    }`}>
                    {seoTitleLength}/100
                  </span>
                </div>
                <Input
                  type='text'
                  id='seoTitle'
                  name='seoTitle'
                  placeholder='e.g. Electronics - Best Gadgets & Devices Online'
                  onChange={handleChange}
                  value={formData.seoTitle}
                  maxLength={100}
                  className='h-9 border-slate-200 focus-visible:ring-[#141413] focus-visible:border-[#141413] rounded-md text-[13px]'
                />
                <p className='text-[11px] text-slate-400'>
                  Appears in search engine results. Recommended: 50-60
                  characters.
                </p>
              </div>

              <div className='grid w-full gap-1.5'>
                <div className='flex items-center justify-between'>
                  <Label
                    htmlFor='metaDescription'
                    className='text-[13px] font-medium text-slate-600'>
                    Meta description
                  </Label>
                  <span
                    className={`text-[11px] font-mono ${
                      metaDescLength > 200
                        ? "text-rose-500"
                        : metaDescLength > 160
                          ? "text-amber-500"
                          : "text-slate-400"
                    }`}>
                    {metaDescLength}/200
                  </span>
                </div>
                <TiptapEditor
                  content={formData.metaDescription}
                  onChange={(content) =>
                    setFormData((prev) => ({
                      ...prev,
                      metaDescription: content,
                    }))
                  }
                  placeholder='Brief description for search engine results'
                  className='border-slate-200 rounded-md min-h-[120px]'
                />
                <p className='text-[11px] text-slate-400'>
                  Appears below the title in search results. Recommended:
                  120-160 characters.
                </p>
              </div>

              <div className='grid w-full gap-1.5'>
                <Label
                  htmlFor='focusKeyphrase'
                  className='text-[13px] font-medium text-slate-600'>
                  Focus keyphrase
                </Label>
                <Input
                  type='text'
                  id='focusKeyphrase'
                  name='focusKeyphrase'
                  placeholder='e.g. electronics gadgets'
                  onChange={handleChange}
                  value={formData.focusKeyphrase}
                  className='h-9 border-slate-200 focus-visible:ring-[#141413] focus-visible:border-[#141413] rounded-md text-[13px]'
                />
                <p className='text-[11px] text-slate-400'>
                  The main keyword phrase this category should rank for.
                </p>
              </div>

              <div className='grid w-full gap-1.5'>
                <Label
                  htmlFor='google_category_type'
                  className='text-[13px] font-medium text-slate-600'>
                  Google category type
                </Label>
                <Input
                  type='text'
                  id='google_category_type'
                  name='google_category_type'
                  placeholder='e.g. Electronics > Computers > Laptops'
                  onChange={handleChange}
                  value={formData.google_category_type}
                  className='h-9 border-slate-200 focus-visible:ring-[#141413] focus-visible:border-[#141413] rounded-md text-[13px]'
                />
                <p className='text-[11px] text-slate-400'>
                  Optional — used for Google Shopping integration
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Settings & Media (Full Width) */}
        <div className='rounded-lg border border-slate-200 bg-white p-4 mb-6'>
          <SectionHeading
            icon={<Settings2 className='h-3.5 w-3.5' />}
            title='Settings & media'
          />
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6'>
            <div className='flex items-center justify-between gap-3 rounded-md bg-slate-50 border border-slate-200 p-3 flex-1'>
              <div>
                <Label
                  htmlFor='active-status'
                  className='cursor-pointer text-[13px] font-medium text-slate-600'>
                  Active status
                </Label>
                <p className='text-[11px] text-slate-400 mt-0.5'>
                  {formData.active
                    ? "Visible to customers"
                    : "Hidden from customers"}
                </p>
              </div>
              <Switch
                id='active-status'
                checked={formData.active}
                onCheckedChange={(value) =>
                  setFormData((prev) => ({ ...prev, active: value }))
                }
              />
            </div>

            <div className='grid w-full sm:w-auto gap-1.5 flex-1'>
              <Label
                htmlFor='picture'
                className='flex items-center gap-2 text-[13px] font-medium text-slate-600'>
                <ImageIcon className='h-3.5 w-3.5' />
                Category image
              </Label>
              <div className='flex items-center gap-3'>
                <img
                  alt='Selected'
                  src={previewImageSrc}
                  className='h-9 w-9 shrink-0 rounded-md object-cover border border-slate-200'
                />
                <Input
                  id='picture'
                  type='file'
                  accept='image/*'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImage(file);
                  }}
                  className='h-9 border-slate-200 text-[13px] rounded-md file:mr-3 file:h-full file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:text-[11px] file:font-medium file:text-slate-700 hover:file:bg-slate-200'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className='sticky bottom-0 bg-[#FAF9F6] border-t border-slate-200 py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-end gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate("/category")}
              className='border-slate-300 text-slate-600 hover:bg-slate-50 rounded-md'>
              Cancel
            </Button>
            <Button
              disabled={!formData.name || loading}
              onClick={handleSubmit}
              className='bg-[#141413] hover:bg-[#2a2a2a] active:bg-black text-white rounded-md'>
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  {mode === "create" ? "Create Category" : "Save Changes"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;
