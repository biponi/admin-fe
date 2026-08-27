import {
  Package,
  Upload,
  Save,
  X as XIcon,
  PlusCircle,
  X,
  DollarSign,
  FileText,
  Layers,
  Image,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { useEffect, useState, useRef } from "react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import TiptapEditor from "../../../components/ui/tiptap";
import { Switch } from "../../../components/ui/switch";
import PlaceHolderImage from "../../../assets/placeholder.svg";
import CustomAlertDialog from "../../../coreComponents/OptionModal";
import AIGenerateButton from "../../../components/aiSeo/AIGenerateButton";
import AIVersionsSheet from "../../../components/aiSeo/AIVersionsSheet";
import { productAiConfig } from "../../../components/aiSeo/aiEntityConfig";
import ProductSeoCard from "./components/ProductSeoCard";
import { slugifyText, validateImageGroup } from "../../../utils/functions";
import {
  AIGenerationVersion,
  AiSeoContent,
  AiSeoSuggestion,
} from "../../../api/aiSeo";

import {
  ICategory,
  IProductUpdateData,
  IVariation,
  IVariantImageMapping,
  IImageGroup,
} from "../interface";
import { filterImageGroups } from "../../../utils/functions";
import MultiCategorySelect from "../../../components/customComponent/MultiCategorySelect";
import { VariantImageUploader } from "../../../components/product/VariantImageUploader";
import { ImageGroupManager } from "../../../components/product/ImageGroupManager";
import V2SimpleVariationManager from "../../../components/product/V2SimpleVariationManager";
import V1VariationManager from "../../../components/product/V1VariationManager";
import { BRAND_CONFIG } from "../../../config/brand";

interface Props {
  productData: IProductUpdateData;
  updateProduct: (productData: IProductUpdateData) => Promise<boolean>;
  categories: ICategory[];
}

const defaultVariation = {
  id: "0",
  size: "",
  color: "",
  name: "",
  title: "",
  sku: "",
  quantity: 0,
  unitPrice: 0,
};

// Cap on stored AI generation versions (newest kept)
const MAX_VERSIONS = 5;

const EditProduct: React.FC<Props> = ({
  productData,
  updateProduct,
  categories,
}) => {
  const [formData, updateFormData] = useState<IProductUpdateData>(productData);
  const [hasVariation, setHasVariation] = useState(
    !!productData?.variation && productData.variation.length > 0,
  );
  const [isSameUnitPrice, setSameunitPrice] = useState(true);
  const [variationTab, setVariationTab] = useState("v1");
  const [variantImages, setVariantImages] = useState<
    Record<string, (File | string)[]>
  >({});
  const [imageGroups, setImageGroups] = useState<IImageGroup[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  // ── AI SEO generation state (mirrors CategoryForm) ──
  const [isAISheetOpen, setIsAISheetOpen] = useState(false);
  const [aiVersions, setAiVersions] = useState<AIGenerationVersion[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const fileRef = useRef(null);
  const fileRef2 = useRef(null);
  const dialogBtn = useRef(null);
  const updateDialogBtn = useRef(null);

  useEffect(() => {
    if (!!productData) {
      // Initialize categoryIds array from categoryId if not present
      // Handle multiple scenarios for backward compatibility
      let categoryIds: string[] = [];

      if (
        productData.categoryIds &&
        Array.isArray(productData.categoryIds) &&
        productData.categoryIds.length > 0
      ) {
        // Scenario A: API returns categoryIds array (new format)
        categoryIds = productData.categoryIds;
      } else if (productData.categoryId) {
        // Scenario B: API returns only categoryId (old format) - convert to array
        categoryIds = [productData.categoryId];
      }
      // Scenario C: Neither field exists - categoryIds remains empty array

      const initializedData = {
        ...productData,
        categoryIds: categoryIds,
        categoryId: productData.categoryId || categoryIds[0] || "",
        commissionType: productData.commissionType || "none",
        commissionRate: productData.commissionRate || 0,
        // SEO fields (full doc comes back from GET /product/single/:id)
        slug: productData.slug || "",
        shortDescription: productData.shortDescription || "",
        focusKeyphrase: productData.focusKeyphrase || "",
        seoTitle: productData.seoTitle || "",
        seoDescription: productData.seoDescription || "",
        tags: productData.tags || [],
        brand: productData.brand || BRAND_CONFIG.shortName,
      };

      console.log("Edit Product - Initialized data:", {
        originalCategoryIds: productData.categoryIds,
        originalCategoryId: productData.categoryId,
        finalCategoryIds: categoryIds,
        finalCategoryId: categoryIds[0] || productData.categoryId,
      });

      updateFormData(initializedData);

      // Initialize variant images from product data
      const initialVariantImages: Record<string, (File | string)[]> = {};
      productData.variation?.forEach((variant) => {
        initialVariantImages[variant.id] = variant.images ?? [];
      });
      setVariantImages(initialVariantImages);

      // Initialize image groups from product data
      const imageData = (productData as any).imageGroups;
      if (imageData && imageData.length > 0) {
        // Filter out any incomplete groups that might have come from the backend
        const { validGroups, invalidCount } = filterImageGroups(imageData);
        if (invalidCount > 0) {
          console.warn(
            `Filtered out ${invalidCount} incomplete imageGroup(s) from backend data missing attribute or value`,
          );
        }
        setImageGroups(validGroups);
      }
    }
  }, [productData]);

  // Calculate total quantity from all variations
  const totalQuantity =
    formData?.variation?.reduce(
      (sum, variant) => sum + (variant.quantity || 0),
      0,
    ) ||
    formData?.quantity ||
    0;

  // Get unique colors and sizes
  const uniqueColors = formData?.variation
    ? Array.from(
        new Set(formData.variation.map((v) => v.color).filter(Boolean)),
      )
    : [];
  const uniqueSizes = formData?.variation
    ? Array.from(new Set(formData.variation.map((v) => v.size).filter(Boolean)))
    : [];

  // Handle form field changes
  //@ts-ignore
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validate numeric input for unit price field
    if (name === "unitPrice" && !/^\d*\.?\d*$/.test(value)) {
      return; // Exit if input is not a valid number format
    }

    if (name === "unitPrice" && isSameUnitPrice) {
      onUnitPriceChange(parseFloat(value));
    } else {
      updateFormData({
        ...formData,
        [name]: name === "unitPrice" ? parseFloat(value) : value,
      });
      if (name === "sku") {
        onSkuChange(value);
      }
    }
  };

  // Handle Tiptap editor description changes
  const handleDescriptionChange = (content: string) => {
    updateFormData({
      ...formData,
      description: content,
    });
  };

  // ── SEO card + AI version handling ──────────────────────────────────

  // Auto-derive the slug from the name while it hasn't been manually edited
  useEffect(() => {
    if (!slugManuallyEdited && formData?.name) {
      const derived = slugifyText(formData.name);
      if (derived !== formData.slug) {
        updateFormData({ ...formData, slug: derived });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.name, slugManuallyEdited]);

  const handleSeoChange = (patch: Partial<IProductUpdateData>) => {
    if (patch.slug !== undefined && patch.slug !== formData?.slug) {
      setSlugManuallyEdited(true);
    }
    updateFormData({ ...formData, ...patch } as IProductUpdateData);
  };

  const handleResetSlug = () => {
    setSlugManuallyEdited(false);
    updateFormData({
      ...formData,
      slug: slugifyText(formData?.name || ""),
    } as IProductUpdateData);
  };

  const versionsStorageKey = `ai-seo-versions:product:${productData?.id}`;

  // Restore persisted versions once per product
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
  }, [productData?.id]);

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
    if (aiVersions.length === 0 || !formData) return;
    const active = aiVersions[activeVersionIndex]?.result?.content;
    if (!active) return;

    const newApplied = new Set(appliedFields);
    let changed = false;

    const markIfMatch = (key: string, formVal: any, aiVal: any) => {
      if (formVal === aiVal && !newApplied.has(key)) {
        newApplied.add(key);
        changed = true;
      }
    };

    markIfMatch("description", formData.description, active.description || "");
    markIfMatch(
      "shortDescription",
      formData.shortDescription || "",
      active.shortDescription || "",
    );
    markIfMatch("seoTitle", formData.seoTitle || "", active.seoTitle || "");
    markIfMatch(
      "focusKeyphrase",
      formData.focusKeyphrase || "",
      active.focusKeyphrase || "",
    );
    markIfMatch(
      "seoDescription",
      formData.seoDescription || "",
      active.seoDescription || "",
    );

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

  const ALL_AI_FIELDS = productAiConfig.fields.map((f) => f.key);

  const handleApplyAIField = (
    field: keyof AiSeoContent,
    value: AiSeoContent[keyof AiSeoContent],
  ) => {
    updateFormData((prev: any) => {
      if (field === "tags" && Array.isArray(value)) {
        const merged = Array.from(new Set([...(prev.tags || []), ...value]));
        return { ...prev, tags: merged };
      }
      return { ...prev, [field]: value };
    });
    setAppliedFields((prev) => new Set([...prev, field as string]));
  };

  const handleApplyAllFromVersion = (version: AIGenerationVersion) => {
    const body: any =
      version.result.suggestedUpdateBody || version.result.content;
    updateFormData((prev: any) => ({
      ...prev,
      description: body.description ?? prev.description,
      shortDescription: body.shortDescription ?? prev.shortDescription,
      focusKeyphrase: body.focusKeyphrase ?? prev.focusKeyphrase,
      seoTitle: body.seoTitle ?? prev.seoTitle,
      seoDescription: body.seoDescription ?? prev.seoDescription,
      tags: body.tags ?? prev.tags,
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
        updateFormData({ ...formData, discount: parsed });
      }
    } else if (field === "name") {
      if (value.trim())
        updateFormData({
          ...formData,
          name: value.trim(),
        } as IProductUpdateData);
    } else if (field === "slug") {
      const cleaned = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (cleaned) {
        setSlugManuallyEdited(true); // keep the applied slug on name changes
        updateFormData({ ...formData, slug: cleaned });
      }
    } else if (field === "tags") {
      const suggested = value
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      if (suggested.length) {
        updateFormData({
          ...formData,
          tags: Array.from(new Set([...(formData.tags || []), ...suggested])),
        } as IProductUpdateData);
      }
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

  // Handle variation field updates (name, color, size - NOT quantity)
  const updateVariationData = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!!formData && index < formData?.variation.length) {
      const { name, value } = e.target;
      formData.variation[index] = {
        ...formData?.variation[index],
        [name]: value,
      };
      updateFormData({ ...formData });
    }
  };

  // Handle variation deletion
  const deleteVariation = (index: number) => {
    if (!!formData && formData.variation) {
      const updatedVariations = formData.variation.filter(
        (_, i) => i !== index,
      );
      updateFormData({
        ...formData,
        variation: updatedVariations,
      });
    }
  };

  // Handle SKU change to update all variation SKUs
  const onSkuChange = (value: string) => {
    if (!!formData.variation && formData.variation.length > 0) {
      updateFormData({
        ...formData,
        sku: value,
        variation: formData.variation.map(
          (variation: IVariation, index: number) => {
            return { ...variation, sku: `${value}-${variation.id || index}` };
          },
        ),
      });
    }
  };

  // Handle unit price change to update all variations
  const onUnitPriceChange = (value: number) => {
    if (!!formData.variation && formData.variation.length > 0) {
      updateFormData({
        ...formData,
        unitPrice: value,
        variation: formData.variation.map((variation: IVariation) => {
          return { ...variation, unitPrice: value };
        }),
      });
    } else {
      updateFormData({
        ...formData,
        unitPrice: value,
      });
    }
  };

  // Add new variation
  const addNewVariation = () => {
    const arr: IVariation[] = formData.variation ? [...formData.variation] : [];
    const newId = crypto.randomUUID();
    arr.push({
      ...defaultVariation,
      id: newId,
      sku: `${formData.sku}-${newId.slice(0, 8)}`,
      unitPrice: isSameUnitPrice ? formData?.unitPrice : 0,
    });

    updateFormData({
      ...formData,
      variation: arr,
    });
  };

  const handleSameUnitPrice = (value: boolean) => {
    setSameunitPrice(value);
    if (value && formData?.unitPrice) {
      onUnitPriceChange(formData.unitPrice);
    }
  };

  const handleVariantImagesChange = (
    variantId: string,
    images: (File | string)[],
  ) => {
    setVariantImages((prev) => ({
      ...prev,
      [variantId]: images,
    }));
  };

  // V1 Variation View - Advanced Mode
  const renderV1VariationView = () => {
    return (
      <V1VariationManager
        variations={formData.variation || []}
        variantImages={variantImages}
        // NOTE: readonly={true} only locks the quantity field — the image uploader
        // remains editable, as variant images must be changeable on edit.
        readonly={true}
        showPrice={false}
        showVariantName={false}
        isSameUnitPrice={isSameUnitPrice}
        gridColumns={{ sm: "2", lg: "3" }}
        onUpdateVariation={updateVariationData}
        onDeleteVariation={deleteVariation}
        onVariantImagesChange={handleVariantImagesChange}
        productImages={formData.images || []}
        imageGroups={imageGroups}
      />
    );
  };

  // V2 Variation View - Simple Mode
  const discardDialog = () => {
    return (
      <CustomAlertDialog
        title='Are You Sure?'
        description='This will discard all the changes'
        onSubmit={() => {
          updateFormData(productData);
        }}>
        <button className='hidden' ref={dialogBtn}>
          show dialog
        </button>
      </CustomAlertDialog>
    );
  };

  const updateDiscardDialog = () => {
    return (
      <CustomAlertDialog
        title='Are You Sure?'
        description='You want to save the changes?'
        onSubmit={() => {
          updateProductAndExit();
        }}>
        <button className='hidden' ref={updateDialogBtn}>
          show dialog
        </button>
      </CustomAlertDialog>
    );
  };

  const updateProductAndExit = async () => {
    // Validate category selection
    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      alert("Please select at least one category");
      return;
    }

    // Ensure categoryId matches categoryIds[0] for consistency
    if (
      formData.categoryId &&
      formData.categoryIds?.length > 0 &&
      !formData.categoryIds.includes(formData.categoryId)
    ) {
      console.error("Category inconsistency detected:", {
        categoryId: formData.categoryId,
        categoryIds: formData.categoryIds,
        categoryIds0: formData.categoryIds[0],
      });
      alert(
        "Primary category must match the first selected category. Please reselect your categories.",
      );
      return;
    }

    // Validate imageGroups before submission - check for incomplete groups
    if (imageGroups.length > 0) {
      const { validGroups, invalidCount } = filterImageGroups(imageGroups);
      if (invalidCount > 0) {
        const incompleteGroups = imageGroups.filter(
          (g) => !validateImageGroup(g),
        );
        const groupList = incompleteGroups
          .map(
            (g) =>
              `• ${g.displayLabel || g.id} (${g.attribute || "no attribute"} - ${g.value || "no value"})`,
          )
          .join("\n");

        alert(
          `You have ${invalidCount} incomplete image group(s) that will not be saved:\n\n${groupList}\n\n` +
            `Please edit each group and set both the "attribute" and "value" fields before saving.\n\n` +
            `Incomplete groups are marked with an amber border and "Incomplete" badge.`,
        );
        return;
      }
    }

    // Prepare variant images for upload
    const allVariantImages = Object.values(variantImages).flat();
    const variantImageFileList = allVariantImages.filter(
      (img) => img instanceof File,
    ) as File[];

    // Build variant image mappings for new uploads (one mapping per image)
    const variantImageMappings: IVariantImageMapping[] = [];
    let imageIndex = 0;

    for (const variant of formData.variation) {
      const images = variantImages[variant.id] || [];
      const newImages = images.filter((img) => img instanceof File);

      // Create a mapping for each new image
      for (let i = 0; i < newImages.length; i++) {
        variantImageMappings.push({
          variantId: variant.id,
          imageIndex: imageIndex++,
        });
      }
    }

    // Sync variation with the final images from uploader state (replace semantics)
    const variationWithFinalImages = formData.variation.map((v) => ({
      ...v,
      images: (variantImages[v.id] || []).filter((img) => typeof img === "string"),
    }));

    // Prepare image group images for upload
    const imageGroupImageList: File[] = [];
    const imageGroupImageMappings: any[] = [];
    let groupImageIndex = 0;

    // Filter out incomplete imageGroups before processing
    console.log("imageGroups before filtering:", imageGroups);

    const { validGroups: validImageGroups, invalidCount } =
      filterImageGroups(imageGroups);

    console.log("imageGroups after filtering:", {
      validGroups: validImageGroups,
      invalidCount,
      totalOriginal: imageGroups.length,
    });

    // Log warning if incomplete groups were found
    if (invalidCount > 0) {
      console.warn(
        `Filtered out ${invalidCount} incomplete imageGroup(s) missing attribute or value`,
      );
    }

    for (const group of validImageGroups) {
      const groupImages = group.images.filter(
        (img: any) => img instanceof File,
      ) as File[];

      groupImages.forEach(() => {
        imageGroupImageMappings.push({
          groupId: group.id,
          imageIndex: groupImageIndex++,
        });
      });

      imageGroupImageList.push(...groupImages);
    }

    const productData = {
      ...formData,
      variation: variationWithFinalImages,
      variantImages: variantImageFileList,
      variantImageMappings,
      imageGroups: validImageGroups.length > 0 ? validImageGroups : undefined,
      imageGroupImages:
        imageGroupImageList.length > 0 ? imageGroupImageList : undefined,
      imageGroupImageMappings:
        imageGroupImageMappings.length > 0
          ? imageGroupImageMappings
          : undefined,
    };

    // Log final data being sent to API for debugging
    console.log("editProduct - Sending data to API:", {
      imageGroupsCount: productData.imageGroups?.length || 0,
      imageGroupImagesCount: productData.imageGroupImages?.length || 0,
      imageGroupImageMappingsCount:
        productData.imageGroupImageMappings?.length || 0,
      imageGroups: productData.imageGroups,
    });

    const response = await updateProduct(productData);
    if (!!response) {
      // Note: The parent component (editProductIndex) updates productData prop after successful update
      // The useEffect hook (lines 105-154) will automatically re-run and refresh variantImages state
      // from the updated productData prop, ensuring UI matches the backend state
    }
  };

  return (
    <div className='min-h-screen bg-slate-50/60'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        {/* Header Section */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200'>
              <Package className='h-5 w-5 text-white' />
            </div>
            <div>
              <h1 className='text-xl font-semibold text-slate-900 leading-tight'>
                Edit Product
              </h1>
              <p className='text-sm text-slate-500 mt-0.5'>
                Update product information and settings
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <AIGenerateButton onClick={() => setIsAISheetOpen(true)} />
            <div className='hidden sm:flex items-center gap-2'>
              <button
                onClick={() => {
                  if (dialogBtn?.current) {
                    //@ts-ignore
                    dialogBtn.current.click();
                  }
                }}
                className='inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 shadow-sm'>
                <XIcon className='h-4 w-4' />
                <span>Discard</span>
              </button>
              <button
                onClick={() => {
                  if (updateDialogBtn?.current) {
                    //@ts-ignore
                    updateDialogBtn.current.click();
                  }
                }}
                className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 shadow-sm shadow-indigo-200'>
                <Save className='h-4 w-4' />
                Update Product
              </button>
            </div>
          </div>
        </div>

        {/* Preview Strip */}
        <div className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
          <div className='h-10 w-10 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden'>
            {formData.thumbnail ? (
              <img
                src={
                  typeof formData.thumbnail === "string"
                    ? formData.thumbnail
                    : URL.createObjectURL(formData.thumbnail)
                }
                alt=''
                className='h-full w-full object-cover'
              />
            ) : (
              <Package className='w-5 h-5 text-slate-400' />
            )}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-1.5'>
              <span className='truncate text-[13px] font-semibold text-slate-900'>
                {formData.name || "Product"}
              </span>
            </div>
            <div className='truncate text-[11px] text-slate-400 mt-0.5 font-mono'>
              {formData.sku || "No SKU"} · {formData.categoryIds?.length || 0}{" "}
              categories
            </div>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            <span
              className={`text-xs font-medium ${formData.active ? "text-emerald-600" : "text-slate-400"}`}>
              {formData.active ? "Active" : "Inactive"}
            </span>
            <Switch
              checked={formData.active}
              onCheckedChange={(checked) =>
                updateFormData({ ...formData, active: checked })
              }
              className='data-[state=checked]:bg-emerald-500'
            />
          </div>
        </div>

        {/* Tabs */}
        <div className='bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'>
            <div className='border-b border-slate-100'>
              <TabsList className='h-auto bg-transparent p-0 gap-0 rounded-none flex justify-start overflow-x-auto scrollbar-hide'>
                {[
                  { value: "basic", icon: FileText, label: "Basic Info" },
                  { value: "details", icon: Package, label: "Details" },
                  { value: "pricing", icon: DollarSign, label: "Pricing" },
                  { value: "variations", icon: Layers, label: "Variations" },
                  { value: "images", icon: Image, label: "Images" },
                  { value: "seo", icon: Search, label: "SEO" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none flex-shrink-0'>
                    <tab.icon className='h-4 w-4' />
                    <span className='hidden sm:inline'>{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab: Basic Info */}
            <TabsContent
              value='basic'
              className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
              <div className='grid gap-6 '>
                <div className='space-y-4'>
                  <div className='space-y-1'>
                    <h3 className='text-sm font-medium text-slate-900'>
                      Basic Information
                    </h3>
                    <p className='text-xs text-slate-500'>
                      Core product details
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='name'
                      className='text-sm font-medium text-slate-700'>
                      Product Name <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='name'
                      name='name'
                      type='text'
                      value={formData?.name || ""}
                      onChange={handleChange}
                      placeholder='Enter product name'
                      className='h-10'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='description'
                      className='text-sm font-medium text-slate-700'>
                      Description
                    </Label>
                    <TiptapEditor
                      content={formData?.description || ""}
                      onChange={handleDescriptionChange}
                      placeholder='Describe your product features, benefits, and specifications...'
                    />
                  </div>
                </div>
                <div></div>
              </div>
            </TabsContent>

            {/* Tab: Details */}
            <TabsContent
              value='details'
              className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
              <div className='grid gap-6 sm:grid-cols-2'>
                <div className='space-y-4'>
                  <div className='space-y-1'>
                    <h3 className='text-sm font-medium text-slate-900'>
                      Category & Identification
                    </h3>
                    <p className='text-xs text-slate-500'>
                      Organize and identify your product
                    </p>
                  </div>
                  <MultiCategorySelect
                    categories={categories}
                    selectedCategoryIds={formData?.categoryIds || []}
                    primaryCategoryId={formData?.categoryId || ""}
                    setSelectedCategoryIds={(ids: string[]) => {
                      updateFormData({
                        ...formData,
                        categoryIds: ids,
                      });
                    }}
                    setPrimaryCategoryId={(id: string) => {
                      updateFormData({
                        ...formData,
                        categoryId: id,
                      });
                    }}
                  />
                  <div className='space-y-2'>
                    <Label
                      htmlFor='product-sku'
                      className='text-sm font-medium text-slate-700'>
                      Product SKU <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='product-sku'
                      name='sku'
                      type='text'
                      value={formData?.sku || ""}
                      onChange={handleChange}
                      placeholder='Enter unique SKU'
                      className='h-10 font-mono'
                      required
                    />
                    <p className='text-xs text-slate-500'>
                      Stock Keeping Unit - unique identifier
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='brand'
                      className='text-sm font-medium text-slate-700'>
                      Brand
                    </Label>
                    <Input
                      id='brand'
                      name='brand'
                      type='text'
                      value={formData?.brand || ""}
                      onChange={handleChange}
                      placeholder='e.g. Samsung'
                      className='h-10'
                    />
                    <p className='text-xs text-slate-500'>
                      Used for SEO content and AI generation
                    </p>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='space-y-1'>
                    <h3 className='text-sm font-medium text-slate-900'>
                      Pricing & Inventory
                    </h3>
                    <p className='text-xs text-slate-500'>
                      Set price and stock quantity
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='product-unit-price'
                      className='text-sm font-medium text-slate-700'>
                      Unit Price <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='product-unit-price'
                      name='unitPrice'
                      type='text'
                      value={formData?.unitPrice || ""}
                      onChange={handleChange}
                      placeholder='0.00'
                      className='h-10'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='quantity'
                      className='text-sm font-medium text-slate-700'>
                      Total Quantity
                    </Label>
                    <Input
                      id='quantity'
                      name='quantity'
                      type='number'
                      value={formData?.quantity || 0}
                      onChange={handleChange}
                      placeholder='0'
                      className={`h-10 ${
                        formData?.variation && formData.variation.length > 0
                          ? "bg-slate-50 text-slate-500 cursor-not-allowed"
                          : ""
                      }`}
                      min='0'
                      disabled={
                        formData?.variation && formData.variation.length > 0
                      }
                    />
                    {formData?.variation && formData.variation.length > 0 && (
                      <p className='text-xs text-amber-600 font-medium'>
                        Auto-calculated from variations
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Pricing */}
            <TabsContent
              value='pricing'
              className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
              <div className='grid gap-6 sm:grid-cols-2'>
                <div className='space-y-4'>
                  <div className='space-y-1'>
                    <h3 className='text-sm font-medium text-slate-900'>
                      Discount
                    </h3>
                    <p className='text-xs text-slate-500'>
                      Set product discount rules
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='discount-type'
                      className='text-sm font-medium text-slate-700'>
                      Discount Type
                    </Label>
                    <Select
                      value={formData?.discountType || ""}
                      onValueChange={(value) => {
                        updateFormData({
                          ...formData,
                          discountType: value,
                        });
                      }}>
                      <SelectTrigger id='discount-type' className='h-10'>
                        <SelectValue placeholder='Select discount type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='%'>Percentage (%)</SelectItem>
                        <SelectItem value='-'>Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='discount'
                      className='text-sm font-medium text-slate-700'>
                      Discount Value
                    </Label>
                    <Input
                      id='discount'
                      name='discount'
                      type='number'
                      value={formData?.discount || 0}
                      onChange={(e) =>
                        updateFormData({
                          ...formData,
                          discount: Number(e.target?.value),
                        })
                      }
                      placeholder='0'
                      className='h-10'
                      min='0'
                      step={formData?.discountType === "%" ? "1" : "0.01"}
                    />
                    {formData?.discountType && (
                      <p className='text-xs text-slate-500'>
                        {formData?.discountType === "%"
                          ? "Enter percentage (0-100)"
                          : "Enter fixed amount to deduct"}
                      </p>
                    )}
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='space-y-1'>
                    <h3 className='text-sm font-medium text-slate-900'>
                      Commission Settings
                    </h3>
                    <p className='text-xs text-slate-500'>
                      Set seller commission rules
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='edit-commission-type'
                      className='text-sm font-medium text-slate-700'>
                      Commission Type
                    </Label>
                    <Select
                      value={formData?.commissionType || "none"}
                      onValueChange={(value) => {
                        updateFormData({
                          ...formData,
                          commissionType: value as
                            | "percentage"
                            | "fixed"
                            | "none",
                          commissionRate:
                            value === "none" ? 0 : formData.commissionRate,
                        });
                      }}>
                      <SelectTrigger id='edit-commission-type' className='h-10'>
                        <SelectValue placeholder='Select commission type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='none'>No Commission</SelectItem>
                        <SelectItem value='percentage'>
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value='fixed'>Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(formData?.commissionType === "percentage" ||
                    formData?.commissionType === "fixed") && (
                    <div className='space-y-2'>
                      <Label
                        htmlFor='edit-commission-rate'
                        className='text-sm font-medium text-slate-700'>
                        {formData?.commissionType === "percentage"
                          ? "Commission Rate (%)"
                          : "Commission Amount"}
                      </Label>
                      <Input
                        id='edit-commission-rate'
                        type='number'
                        value={formData?.commissionRate || 0}
                        onChange={(e) =>
                          updateFormData({
                            ...formData,
                            commissionRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        min='0'
                        max={
                          formData?.commissionType === "percentage"
                            ? 100
                            : undefined
                        }
                        step='0.01'
                        placeholder={
                          formData?.commissionType === "percentage"
                            ? "Enter percentage (e.g., 5 for 5%)"
                            : "Enter fixed amount"
                        }
                        className='h-10'
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab: Variations */}
            <TabsContent
              value='variations'
              className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <h3 className='text-sm font-medium text-slate-900'>
                      Product Variations
                    </h3>
                    <p className='text-xs text-slate-500'>
                      Manage product variants and options
                    </p>
                  </div>
                  {hasVariation && (
                    <span className='text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700'>
                      {formData?.variation?.length || 0} variation
                      {(formData?.variation?.length || 0) !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className='space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                      <Label
                        htmlFor='variation-toggle'
                        className='text-sm font-medium text-slate-700'>
                        Enable Variations
                      </Label>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`text-sm ${
                            !hasVariation
                              ? "font-semibold text-slate-900"
                              : "text-slate-500"
                          }`}>
                          No
                        </span>
                        <Switch
                          id='variation-toggle'
                          checked={hasVariation}
                          onCheckedChange={(value) => {
                            setHasVariation(value);
                            if (!value) {
                              updateFormData({ ...formData, variation: [] });
                            }
                          }}
                        />
                        <span
                          className={`text-sm ${
                            hasVariation
                              ? "font-semibold text-slate-900"
                              : "text-slate-500"
                          }`}>
                          Yes
                        </span>
                      </div>
                    </div>
                    {hasVariation && (
                      <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                        <Label
                          htmlFor='same-price-toggle'
                          className='text-sm font-medium text-slate-700'>
                          Same Unit Price for All
                        </Label>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`text-sm ${
                              !isSameUnitPrice
                                ? "font-semibold text-slate-900"
                                : "text-slate-500"
                            }`}>
                            No
                          </span>
                          <Switch
                            id='same-price-toggle'
                            checked={isSameUnitPrice}
                            onCheckedChange={handleSameUnitPrice}
                          />
                          <span
                            className={`text-sm ${
                              isSameUnitPrice
                                ? "font-semibold text-slate-900"
                                : "text-slate-500"
                            }`}>
                            Yes
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {hasVariation && (
                  <Tabs
                    value={variationTab}
                    onValueChange={setVariationTab}
                    className='w-full'>
                    <TabsList className='grid w-full grid-cols-2 h-10 bg-slate-100 rounded-lg'>
                      <TabsTrigger
                        value='v1'
                        className='flex items-center gap-2 text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm'>
                        <span>Advanced</span>
                        <span className='text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-300'>
                          V1
                        </span>
                      </TabsTrigger>
                      <TabsTrigger
                        value='v2'
                        className='flex items-center gap-2 text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm'>
                        <span>Simple</span>
                        <span className='text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-300'>
                          V2
                        </span>
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value='v1' className='mt-4'>
                      {renderV1VariationView()}
                    </TabsContent>
                    <TabsContent value='v2' className='mt-4'>
                      <V2SimpleVariationManager
                        formData={formData}
                        updateFormData={updateFormData}
                        isSameUnitPrice={isSameUnitPrice}
                        mode='edit'
                      />
                      <p className='text-xs text-muted-foreground mt-4 text-center'>
                        Variant images are managed on the Advanced tab.
                      </p>
                    </TabsContent>
                  </Tabs>
                )}

                {!hasVariation && (
                  <div className='text-center py-8 text-slate-500'>
                    <Layers className='w-8 h-8 mx-auto mb-2 opacity-50' />
                    <p className='text-sm'>
                      Enable variations to add different sizes, colors, or other
                      variants.
                    </p>
                  </div>
                )}

                {hasVariation && variationTab === "v1" && (
                  <button
                    onClick={addNewVariation}
                    className='w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-all duration-150'>
                    <PlusCircle className='h-4 w-4' />
                    Add New Variation
                  </button>
                )}
              </div>
            </TabsContent>

            {/* Tab: Images */}
            <TabsContent
              value='images'
              className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
              <div className='grid gap-6 sm:grid-cols-2'>
                <div className='space-y-4'>
                  <div className='space-y-1'>
                    <h3 className='text-sm font-medium text-slate-900'>
                      Product Images
                    </h3>
                    <p className='text-xs text-slate-500'>
                      Upload thumbnail and additional images
                    </p>
                  </div>
                  <Input
                    id='picture-thumbnail'
                    type='file'
                    className='hidden'
                    ref={fileRef}
                    name='thumbnail'
                    accept='.png, .jpg, .jpeg'
                    onChange={(e) => {
                      //@ts-ignore
                      const file = e.target.files[0];
                      updateFormData({
                        ...formData,
                        thumbnail: file,
                      });
                    }}
                  />
                  <div className='relative'>
                    <img
                      alt='Product_thumbnail'
                      className='aspect-square w-full rounded-xl object-cover border border-slate-200'
                      src={
                        !!formData?.thumbnail
                          ? typeof formData?.thumbnail === "string"
                            ? formData?.thumbnail
                            : URL.createObjectURL(formData?.thumbnail)
                          : PlaceHolderImage
                      }
                    />
                    <button
                      onClick={() => {
                        if (!!fileRef) {
                          //@ts-ignore
                          fileRef.current.click();
                        }
                      }}
                      className='absolute bottom-2 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg hover:bg-white shadow-sm'>
                      <Upload className='h-3.5 w-3.5' />
                      Change
                    </button>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-slate-700'>
                      Additional Images ({formData?.images?.length || 0}/6)
                    </Label>
                    <div className='grid grid-cols-3 gap-2'>
                      {formData?.images?.map((imgData, index) => (
                        <div
                          key={index}
                          className='group relative aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-300 transition-all'>
                          <img
                            alt={`Product_image_${index + 1}`}
                            className='w-full h-full object-cover'
                            src={
                              !!imgData
                                ? typeof imgData === "string"
                                  ? imgData
                                  : URL.createObjectURL(imgData)
                                : PlaceHolderImage
                            }
                          />
                          <button
                            onClick={() => {
                              const images = formData.images.filter(
                                (_, i) => i !== index,
                              );
                              if (typeof imgData === "string") {
                                updateFormData({
                                  ...formData,
                                  images: [...images],
                                  removeImageIndexes: [
                                    ...(formData?.removeImageIndexes ?? []),
                                    imgData,
                                  ],
                                });
                              } else {
                                updateFormData({
                                  ...formData,
                                  images: [...images],
                                });
                              }
                            }}
                            className='absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10'>
                            <X className='w-3 h-3' />
                          </button>
                        </div>
                      ))}
                      <Input
                        id='picture-additional'
                        type='file'
                        className='hidden'
                        ref={fileRef2}
                        name='images'
                        accept='.png, .jpg, .jpeg'
                        multiple
                        onChange={(e) => {
                          //@ts-ignore
                          const files = Array.from(e.target.files);
                          if (!formData?.images) formData.images = [];
                          const remainingSlots = 6 - formData.images.length;
                          const filesToAdd = files.slice(0, remainingSlots);
                          updateFormData({
                            ...formData,
                            //@ts-ignore
                            images: [...formData.images, ...filesToAdd],
                          });
                          e.target.value = "";
                        }}
                      />
                      {(!formData?.images || formData?.images?.length < 6) && (
                        <button
                          className='flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all'
                          onClick={() => {
                            if (!!fileRef2) {
                              //@ts-ignore
                              fileRef2.current.click();
                            }
                          }}>
                          <Upload className='h-5 w-5 text-slate-400' />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {hasVariation && (
                  <div className='space-y-4'>
                    <div className='space-y-1'>
                      <h3 className='text-sm font-medium text-slate-900'>
                        Image Groups
                      </h3>
                      <p className='text-xs text-slate-500'>
                        Organize images by color/attribute (optional)
                      </p>
                    </div>
                    <ImageGroupManager
                      imageGroups={imageGroups}
                      variations={formData.variation || []}
                      onImageGroupsChange={setImageGroups}
                      mode='edit'
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab: SEO */}
            <TabsContent
              value='seo'
              className='p-4 sm:p-6 mt-0 focus-visible:outline-none'>
              <div className='space-y-1 mb-4'>
                <h3 className='text-sm font-medium text-slate-900'>
                  SEO Settings
                </h3>
                <p className='text-xs text-slate-500'>
                  Optimize your product for search engines
                </p>
              </div>
              <ProductSeoCard
                value={{
                  slug: formData?.slug || "",
                  shortDescription: formData?.shortDescription || "",
                  focusKeyphrase: formData?.focusKeyphrase || "",
                  seoTitle: formData?.seoTitle || "",
                  seoDescription: formData?.seoDescription || "",
                  tags: formData?.tags || [],
                }}
                onChange={handleSeoChange}
                onResetSlug={handleResetSlug}
                slugManuallyEdited={slugManuallyEdited}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile Bottom Action Bar */}
        <div className='fixed inset-x-0 bottom-0 z-50 sm:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+12px)]'>
          <div className='flex gap-3'>
            <button
              className='flex-1 h-11 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg'
              onClick={() => {
                if (dialogBtn?.current) {
                  //@ts-ignore
                  dialogBtn.current.click();
                }
              }}>
              <XIcon className='w-4 h-4' />
              Discard
            </button>
            <button
              className='flex-1 h-11 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg'
              onClick={() => {
                if (updateDialogBtn?.current) {
                  //@ts-ignore
                  updateDialogBtn.current.click();
                }
              }}>
              <Save className='w-4 h-4' />
              Update
            </button>
          </div>
        </div>

        {/* AI Versions Sheet */}
        <AIVersionsSheet
          open={isAISheetOpen}
          onOpenChange={setIsAISheetOpen}
          entity={productAiConfig}
          mode='edit'
          entityId={productData?.id}
          entityName={formData?.name || productData?.name || "Product"}
          versions={aiVersions}
          activeIndex={activeVersionIndex}
          onSelectVersion={setActiveVersionIndex}
          onVersionGenerated={handleVersionGenerated}
          onApplyField={handleApplyAIField}
          onApplyAll={handleApplyAllFromVersion}
          onApplySuggestion={handleApplySuggestion}
          onClear={handleClearVersions}
          appliedFields={appliedFields}
        />
      </div>
      {discardDialog()}
      {updateDiscardDialog()}
    </div>
  );
};

export default EditProduct;
