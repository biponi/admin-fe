import {
  PlusCircle,
  Upload,
  X,
  Save,
  Package,
  XIcon as XCircle,
  DollarSign,
  FileText,
  Layers,
  Image,
  Search,
  Table2,
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
import { useEffect, useRef, useState } from "react";
import TiptapEditor from "../../../components/ui/tiptap";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
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
  IProductCreateData,
  IVariation,
  IVariantImageMapping,
  IImageGroup,
} from "../interface";
import { useNavigate } from "react-router-dom";
import { filterImageGroups } from "../../../utils/functions";
import MultiCategorySelect from "../../../components/customComponent/MultiCategorySelect";
import { VariantImageUploader } from "../../../components/product/VariantImageUploader";
import { ImageGroupManager } from "../../../components/product/ImageGroupManager";
import V2SimpleVariationManager from "../../../components/product/V2SimpleVariationManager";
import V1VariationManager from "../../../components/product/V1VariationManager";
import MetaEntriesEditor from "../../../components/product/MetaEntriesEditor";
import { MobilePage } from "../../../components/mobile";
import { PageHeader } from "../../../components/PageHeader";
import { BRAND_CONFIG } from "../../../config/brand";

// Cap on stored AI generation versions (newest kept)
const MAX_VERSIONS = 5;

const defaultValue = {
  name: "",
  active: true,
  quantity: 0,
  unitPrice: 0,
  manufactureId: "",
  discount: 0,
  discountType: "%",
  description: "",
  thumbnail: null,
  sizeGuideImage: null,
  variation: [],
  sku: "",
  categoryId: "",
  categoryIds: [] as string[],
  images: [],
  commissionType: "none" as "percentage" | "fixed" | "none",
  commissionRate: 0,
  // ── Content & SEO
  slug: "",
  shortDescription: "",
  focusKeyphrase: "",
  seoTitle: "",
  seoDescription: "",
  tags: [] as string[],
  brand: BRAND_CONFIG.shortName,
  meta: [],
};

const defaultVariation = {
  id: 0,
  size: "",
  color: "",
  name: "",
  title: "",
  sku: "",
  quantity: 0,
  unitPrice: 0,
};

interface Props {
  createProduct: (productData: IProductCreateData) => Promise<boolean>;
  categories: ICategory[];
}

const AddProduct: React.FC<Props> = ({ createProduct, categories }) => {
  const [formData, updateFormData] = useState<IProductCreateData>(defaultValue);
  const [hasVariation, setHasVariation] = useState(false);
  const [isSameUnitPrice, setSameunitPrice] = useState(true);
  const [variationTab, setVariationTab] = useState("v1");
  const [variantImages, setVariantImages] = useState<
    Record<string, (File | string)[]>
  >({});
  const [imageGroups, setImageGroups] = useState<IImageGroup[]>([]);
  // ── AI SEO generation state
  const [activeTab, setActiveTab] = useState("basic");
  const [isAISheetOpen, setIsAISheetOpen] = useState(false);
  const [aiVersions, setAiVersions] = useState<AIGenerationVersion[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const navigate = useNavigate();

  const fileRef = useRef(null);
  const fileRef2 = useRef(null);
  const sizeGuideFileRef = useRef(null);
  const dialogBtn = useRef(null);

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
    if (name === "unitPrice" && isSameUnitPrice) {
      onUnitPriceChange(value);
    } else {
      updateFormData({
        ...formData,
        [name]: value,
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

  const handleSeoChange = (patch: Partial<IProductCreateData>) => {
    if (patch.slug !== undefined && patch.slug !== formData?.slug) {
      setSlugManuallyEdited(true);
    }
    updateFormData({ ...formData, ...patch } as IProductCreateData);
  };

  // ── Admin meta data (key-value pairs used for admin search) ──
  const handleMetaChange = (meta: IProductCreateData["meta"]) => {
    updateFormData({ ...formData, meta } as IProductCreateData);
  };

  const handleVariantMetaChange = (
    index: number,
    variantMeta: IVariation["meta"],
  ) => {
    if (!formData?.variation || index >= formData.variation.length) return;
    const variation = [...formData.variation];
    variation[index] = { ...variation[index], meta: variantMeta };
    updateFormData({ ...formData, variation });
  };

  // Bulk meta panel result — fan out already computed by the panel helper
  const handleBulkVariantMetaApply = (updated: IVariation[]) => {
    updateFormData({ ...formData, variation: updated } as IProductCreateData);
  };

  const handleResetSlug = () => {
    setSlugManuallyEdited(false);
    updateFormData({
      ...formData,
      slug: slugifyText(formData?.name || ""),
    } as IProductCreateData);
  };

  // Versions keyed by the yet-unsaved product name (create mode)
  const versionsStorageKey = `ai-seo-versions:product:new:${formData.name}`;

  // Restore persisted versions once per draft
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
  }, []);

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
        } as IProductCreateData);
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
        } as IProductCreateData);
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

  const onSkuChange = (value: string) => {
    if (!!formData.variation && formData.variation.length > 0) {
      updateFormData({
        ...formData,
        sku: value,
        variation: formData.variation.map((variation: IVariation) => {
          return { ...variation, sku: `${value}-${variation.id}` };
        }),
      });
    }
  };

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

  const addNewVariation = () => {
    let arr = [];
    if (formData.variation.length > 0) {
      arr = [...formData.variation];
      //@ts-ignore
      let id = formData.variation[formData.variation.length - 1].id + 1;
      arr.push({
        ...defaultVariation,
        id,
        sku: `${formData.sku}-${id}`,
        unitPrice: isSameUnitPrice ? formData?.unitPrice : 0,
      });
    } else {
      arr.push({
        ...defaultVariation,
        sku: `${formData.sku}-${0}`,
        unitPrice: isSameUnitPrice ? formData?.unitPrice : 0,
      });
    }

    updateFormData({
      ...formData,
      //@ts-ignore
      variation: arr,
    });
  };

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

    if (formData.variation && formData?.variation.length > 0) {
      const totalQuantity = formData?.variation.reduce(
        (sum, variant) =>
          Number(sum) +
          (isNaN(Number(variant?.quantity)) ? 0 : Number(variant?.quantity)),
        0,
      );
      updateFormData({
        ...formData,
        //@ts-ignore
        quantity: totalQuantity,
      });
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

  const handleSameUnitPrice = (value: boolean) => {
    setSameunitPrice(value);

    onUnitPriceChange(value ? formData.unitPrice : 0.0);
  };

  const renderV1VariationView = () => {
    return (
      <V1VariationManager
        variations={formData.variation || []}
        variantImages={variantImages}
        readonly={false}
        showPrice={true}
        showVariantName={false}
        isSameUnitPrice={isSameUnitPrice}
        gridColumns={{ sm: "2", lg: "2" }}
        onUpdateVariation={updateVariationData}
        onDeleteVariation={(index) => {
          updateFormData((prev) => {
            return {
              ...prev,
              variation: prev?.variation.filter((__, i) => i !== index),
              quantity:
                prev?.quantity - (prev.variation?.[index]?.quantity || 0),
            };
          });
        }}
        onVariantImagesChange={handleVariantImagesChange}
        showMeta={true}
        onVariantMetaChange={handleVariantMetaChange}
        onBulkMetaApply={handleBulkVariantMetaApply}
      />
    );
  };

  const discardDialog = () => {
    return (
      <CustomAlertDialog
        title='Are You Sure?'
        description='This will discard all the changes'
        onSubmit={() => {
          updateFormData(defaultValue);
        }}>
        <button className='hidden' ref={dialogBtn}>
          show dialog
        </button>
      </CustomAlertDialog>
    );
  };

  const createProductAndExit = async () => {
    // Validate category selection
    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      alert("Please select at least one category");
      return;
    }

    // Auto-populate categoryId from categoryIds if empty and categories exist
    if (
      (!formData.categoryId || formData.categoryId === "") &&
      formData.categoryIds?.length > 0
    ) {
      console.log(
        "Auto-populating categoryId from categoryIds[0]:",
        formData.categoryIds[0],
      );
      updateFormData({
        ...formData,
        categoryId: formData.categoryIds[0],
      });
      formData.categoryId = formData.categoryIds[0];
    }

    // Ensure categoryId matches categoryIds[0] for consistency
    if (
      formData.categoryId &&
      formData.categoryIds?.length > 0 &&
      formData.categoryId !== formData.categoryIds[0]
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

    // Build variant image mappings (one mapping per image)
    const variantImageMappings: IVariantImageMapping[] = [];
    let imageIndex = 0;

    for (const variant of formData.variation) {
      const images = variantImages[variant.id] || [];
      const fileImages = images.filter((img) => img instanceof File);

      // Create a mapping for each image
      for (let i = 0; i < fileImages.length; i++) {
        variantImageMappings.push({
          variantId: variant.id,
          imageIndex: imageIndex++,
        });
      }
    }

    // Prepare image group images for upload
    const imageGroupImageList: File[] = [];
    const imageGroupImageMappings: any[] = [];
    let groupImageIndex = 0;

    // Filter out incomplete imageGroups before processing
    console.log("addProduct - imageGroups before filtering:", imageGroups);

    const { validGroups: validImageGroups, invalidCount } =
      filterImageGroups(imageGroups);

    console.log("addProduct - imageGroups after filtering:", {
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
        (img) => img instanceof File,
      ) as File[];
      const startIndex = groupImageIndex;

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
    console.log("addProduct - Sending data to API:", {
      imageGroupsCount: productData.imageGroups?.length || 0,
      imageGroupImagesCount: productData.imageGroupImages?.length || 0,
      imageGroupImageMappingsCount:
        productData.imageGroupImageMappings?.length || 0,
      imageGroups: productData.imageGroups,
    });

    const response = await createProduct(productData);
    if (!!response) {
      navigate("/products");
    }
  };

  const createProductAndContinue = async () => {
    // Validate category selection
    if (!formData.categoryIds || formData.categoryIds.length === 0) {
      alert("Please select at least one category");
      return;
    }

    // Auto-populate categoryId from categoryIds if empty and categories exist
    if (
      (!formData.categoryId || formData.categoryId === "") &&
      formData.categoryIds?.length > 0
    ) {
      console.log(
        "Auto-populating categoryId from categoryIds[0]:",
        formData.categoryIds[0],
      );
      updateFormData({
        ...formData,
        categoryId: formData.categoryIds[0],
      });
      formData.categoryId = formData.categoryIds[0];
    }

    // Ensure categoryId matches categoryIds[0] for consistency
    if (
      formData.categoryId &&
      formData.categoryIds?.length > 0 &&
      formData.categoryId !== formData.categoryIds[0]
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

    // Build variant image mappings (one mapping per image)
    const variantImageMappings: IVariantImageMapping[] = [];
    let imageIndex = 0;

    for (const variant of formData.variation) {
      const images = variantImages[variant.id] || [];
      const fileImages = images.filter((img) => img instanceof File);

      // Create a mapping for each image
      for (let i = 0; i < fileImages.length; i++) {
        variantImageMappings.push({
          variantId: variant.id,
          imageIndex: imageIndex++,
        });
      }
    }

    // Prepare image group images for upload
    const imageGroupImageList: File[] = [];
    const imageGroupImageMappings: any[] = [];
    let groupImageIndex = 0;

    // Filter out incomplete imageGroups before processing
    console.log("addProduct - imageGroups before filtering:", imageGroups);

    const { validGroups: validImageGroups, invalidCount } =
      filterImageGroups(imageGroups);

    console.log("addProduct - imageGroups after filtering:", {
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
        (img) => img instanceof File,
      ) as File[];
      const startIndex = groupImageIndex;

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
    console.log("addProductAndContinue - Sending data to API:", {
      imageGroupsCount: productData.imageGroups?.length || 0,
      imageGroupImagesCount: productData.imageGroupImages?.length || 0,
      imageGroupImageMappingsCount:
        productData.imageGroupImageMappings?.length || 0,
      imageGroups: productData.imageGroups,
    });

    const response = await createProduct(productData);
    if (!!response) {
      // updateFormData({ ...defaultValue });
    }
  };

  return (
    <MobilePage
      title='Add Product'
      icon={<Package className='h-5 w-5 text-primary' />}
      subtitle='Create a new product with detailed information'>
      <div className='min-h-screen bg-slate-50/60'>
        <div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 space-y-6 mobile:pb-[calc(9.5rem+env(safe-area-inset-bottom))]'>
          {/* Header Section */}
          <PageHeader
            className='hidden md:flex md:flex-row items-center md:justify-between md:gap-4'
            icon={<Package className='h-5 w-5' />}
            title='Add Product'
            subtitle='Create a new product with detailed information'
            actions={
              <div className='flex flex-1 items-center gap-2 justify-end float-right w-full'>
                <AIGenerateButton
                  onClick={() => setIsAISheetOpen(true)}
                  disabled={!formData.name}
                />
                <div className='hidden md:flex items-center gap-2'>
                  <button
                    onClick={() => {
                      if (dialogBtn?.current) {
                        //@ts-ignore
                        dialogBtn.current.click();
                      }
                    }}
                    className='inline-flex items-center text-[12px] gap-1.5 px-3 h-8 text-sm font-normal text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 shadow-sm'>
                    <XCircle className='h-4 w-4' />
                    <span>Discard</span>
                  </button>
                  <button
                    onClick={() => createProductAndContinue()}
                    className='inline-flex items-center text-[12px] gap-1.5 px-3 h-8 text-sm font-normal text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 shadow-sm'>
                    <Save className='h-4 w-4' />
                    Save & Continue
                  </button>
                  <button
                    onClick={() => createProductAndExit()}
                    className='inline-flex items-center text-[12px] gap-1.5 px-4 h-8 text-sm font-normal text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150 shadow-sm shadow-indigo-200'>
                    <Save className='h-4 w-4' />
                    Save Product
                  </button>
                </div>
              </div>
            }
          />

          {/* Preview Strip */}
          <div className='flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 shadow-sm'>
            <div className='h-10 w-10 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden'>
              {formData.thumbnail ? (
                <img
                  src={URL.createObjectURL(formData.thumbnail)}
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
                  {formData.name || "New product"}
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

          {/* Tabbed Layout */}
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
                    { value: "meta", icon: Table2, label: "Meta Data" },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className='relative flex items-center gap-2 px-4 py-4 text-sm font-medium rounded-none border-b-2 border-transparent text-slate-500 hover:text-slate-700 data-[state=active]:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent transition-all duration-150 focus-visible:outline-none flex-shrink-0'>
                      <tab.icon className='h-4 w-4' />
                      <span className='whitespace-nowrap'>{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* ── Basic Info Tab ── */}
              <TabsContent
                value='basic'
                className='p-4 md:p-6 mt-0 focus-visible:outline-none'>
                <div className='grid gap-6'>
                  <div className='space-y-4'>
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
                        value={formData?.name}
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
                </div>
              </TabsContent>

              {/* ── Details Tab ── */}
              <TabsContent
                value='details'
                className='p-4 md:p-6 mt-0 focus-visible:outline-none'>
                <div className='grid gap-6 md:grid-cols-2'>
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
                        value={formData?.sku}
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
                        type='number'
                        value={formData?.unitPrice}
                        onChange={handleChange}
                        placeholder='0.00'
                        className='h-10'
                        min='0'
                        step='0.01'
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
                        value={formData?.quantity}
                        onChange={handleChange}
                        placeholder='0'
                        className={`h-10 ${hasVariation ? "bg-slate-50 text-slate-500 cursor-not-allowed" : ""}`}
                        min='0'
                        disabled={hasVariation}
                      />
                      {hasVariation && (
                        <p className='text-xs text-amber-600 font-medium'>
                          Auto-calculated from variations
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ── Pricing Tab ── */}
              <TabsContent
                value='pricing'
                className='p-4 md:p-6 mt-0 focus-visible:outline-none'>
                <div className='grid gap-6 md:grid-cols-2'>
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
                        value={formData?.discountType}
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
                        value={formData?.discount}
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
                        Commission
                      </h3>
                      <p className='text-xs text-slate-500'>
                        Set seller commission rules
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='commission-type'
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
                        <SelectTrigger id='commission-type' className='h-10'>
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
                          htmlFor='commission-rate'
                          className='text-sm font-medium text-slate-700'>
                          {formData?.commissionType === "percentage"
                            ? "Commission Rate (%)"
                            : "Commission Amount"}
                        </Label>
                        <Input
                          id='commission-rate'
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
                        <p className='text-xs text-slate-500'>
                          {formData?.commissionType === "percentage"
                            ? "This percentage of the product price will be paid as commission"
                            : "This fixed amount will be paid as commission per item"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* ── Variations Tab ── */}
              <TabsContent
                value='variations'
                className='p-4 md:p-6 mt-0 focus-visible:outline-none'>
                <div className='space-y-4'>
                  <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
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
                          }`}
                          aria-hidden='true'>
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
                          aria-describedby='variation-help'
                        />
                        <span
                          className={`text-sm ${
                            hasVariation
                              ? "font-semibold text-slate-900"
                              : "text-slate-500"
                          }`}
                          aria-hidden='true'>
                          Yes
                        </span>
                      </div>
                    </div>

                    {hasVariation && (
                      <div className='flex flex-col md:flex-row md:items-center gap-4'>
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
                            }`}
                            aria-hidden='true'>
                            No
                          </span>
                          <Switch
                            id='same-price-toggle'
                            checked={isSameUnitPrice}
                            onCheckedChange={handleSameUnitPrice}
                            aria-describedby='same-price-help'
                          />
                          <span
                            className={`text-sm ${
                              isSameUnitPrice
                                ? "font-semibold text-slate-900"
                                : "text-slate-500"
                            }`}
                            aria-hidden='true'>
                            Yes
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='space-y-1 text-xs text-slate-500'>
                    <p id='variation-help'>
                      Enable variations to create different versions of your
                      product with unique combinations of attributes.
                    </p>
                    {hasVariation && (
                      <p id='same-price-help'>
                        When enabled, all variations will inherit the main
                        product's unit price.
                      </p>
                    )}
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
                        </TabsTrigger>
                        <TabsTrigger
                          value='v2'
                          className='flex items-center gap-2 text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm'>
                          <span>Simple</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value='v1' className='mt-4'>
                        <div className='space-y-4'>
                          <div className='text-sm text-slate-600 bg-indigo-50 p-3 rounded-lg border border-indigo-100'>
                            <strong>Advanced Mode:</strong> Manually configure
                            each variation with full control over all
                            properties.
                          </div>
                          {renderV1VariationView()}
                        </div>
                      </TabsContent>

                      <TabsContent value='v2' className='mt-4'>
                        <div className='space-y-4'>
                          <div className='text-sm text-slate-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100'>
                            <strong>Simple Mode:</strong> Quick setup for size
                            and color combinations. Variations are
                            auto-generated.
                          </div>
                          <V2SimpleVariationManager
                            formData={formData}
                            updateFormData={updateFormData}
                            isSameUnitPrice={isSameUnitPrice}
                            mode='create'
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  )}

                  {!hasVariation && (
                    <div className='text-center py-12 text-slate-500'>
                      <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4'>
                        <Layers className='w-8 h-8 text-slate-400' />
                      </div>
                      <p className='mb-1 font-medium text-slate-700'>
                        No variations configured
                      </p>
                      <p className='text-sm'>
                        Enable variations above to add different sizes, colors,
                        or other variants.
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

              {/* ── Images Tab ── */}
              <TabsContent
                value='images'
                className='p-4 md:p-6 mt-0 focus-visible:outline-none'>
                <div className='grid items-start gap-6 lg:grid-cols-2'>
                  {/* ── Product Images panel ── */}
                  <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
                    <div className='flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3.5 md:px-5'>
                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600'>
                        <Image className='h-4 w-4' />
                      </div>
                      <div className='min-w-0'>
                        <h3 className='text-[15px] font-semibold text-slate-900'>
                          Product Images
                        </h3>
                        <p className='truncate text-[13px] text-slate-500'>
                          Thumbnail, size guide, and gallery images
                        </p>
                      </div>
                    </div>

                    <div className='space-y-6 p-4 md:p-5'>
                      {/* Main thumbnail */}
                      <section className='space-y-3'>
                        <div>
                          <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                            Main Thumbnail
                          </p>
                          <p className='text-[13px] text-slate-500'>
                            Primary image shown in listings, search, and cart
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
                        <div className='flex flex-col gap-3 sm:flex-row sm:items-start'>
                          <div className='relative w-full shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:w-40'>
                            <img
                              alt='Product_thumbnail'
                              className='aspect-square w-full object-cover'
                              src={
                                !!formData?.thumbnail
                                  ? URL.createObjectURL(formData.thumbnail)
                                  : PlaceHolderImage
                              }
                            />
                            {!formData?.thumbnail && (
                              <div className='absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 text-center'>
                                <Image className='h-5 w-5 text-slate-300' />
                                <p className='text-xs text-slate-400'>
                                  No thumbnail yet
                                </p>
                              </div>
                            )}
                          </div>
                          <div className='flex flex-1 flex-col gap-2'>
                            <button
                              onClick={() => {
                                if (!!fileRef) {
                                  //@ts-ignore
                                  fileRef.current.click();
                                }
                              }}
                              className='inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 text-[13px] font-medium text-indigo-600 transition-all duration-150 hover:border-indigo-300 hover:bg-indigo-100 sm:w-auto'>
                              <Upload className='h-4 w-4' />
                              {!!formData?.thumbnail
                                ? "Change Thumbnail"
                                : "Upload Thumbnail"}
                            </button>
                            <p className='text-xs text-slate-400'>
                              PNG or JPG · square image recommended
                            </p>
                          </div>
                        </div>
                      </section>

                      <div className='border-t border-slate-100' />

                      {/* Size guide / extra info chart (optional single image) */}
                      <section className='space-y-3'>
                        <div>
                          <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                            Size Guide / Extra Info Chart
                            <span className='ml-1.5 normal-case tracking-normal text-slate-300'>
                              Optional
                            </span>
                          </p>
                          <p className='text-[13px] text-slate-500'>
                            e.g. a measurement chart shown to customers on the
                            product page
                          </p>
                        </div>
                        <Input
                          id='picture-size-guide'
                          type='file'
                          className='hidden'
                          ref={sizeGuideFileRef}
                          name='sizeGuideImage'
                          accept='.png, .jpg, .jpeg'
                          onChange={(e) => {
                            //@ts-ignore
                            const file = e.target.files[0];
                            if (!file) return;
                            updateFormData({
                              ...formData,
                              sizeGuideImage: file,
                            });
                          }}
                        />
                        <div className='flex flex-col gap-3 sm:flex-row sm:items-start'>
                          <div className='relative w-full shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:w-52'>
                            <img
                              alt='Product_size_guide'
                              className='aspect-[4/3] w-full object-contain'
                              src={
                                !!formData?.sizeGuideImage
                                  ? URL.createObjectURL(formData.sizeGuideImage)
                                  : PlaceHolderImage
                              }
                            />
                            {!formData?.sizeGuideImage && (
                              <div className='absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 text-center'>
                                <Image className='h-5 w-5 text-slate-300' />
                                <p className='text-xs text-slate-400'>
                                  No size guide yet
                                </p>
                              </div>
                            )}
                            {!!formData?.sizeGuideImage && (
                              <button
                                onClick={() =>
                                  updateFormData({
                                    ...formData,
                                    sizeGuideImage: null,
                                  })
                                }
                                className='absolute right-1.5 top-1.5 z-10 rounded-full bg-white/90 p-1.5 text-slate-500 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:bg-red-50 hover:text-red-500 mobile:opacity-100'>
                                <X className='h-3.5 w-3.5' />
                              </button>
                            )}
                          </div>
                          <div className='flex flex-1 flex-col gap-2'>
                            <button
                              onClick={() => {
                                if (!!sizeGuideFileRef) {
                                  //@ts-ignore
                                  sizeGuideFileRef.current.click();
                                }
                              }}
                              className='inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 sm:w-auto'>
                              <Upload className='h-4 w-4' />
                              {!!formData?.sizeGuideImage
                                ? "Change Size Guide"
                                : "Upload Size Guide"}
                            </button>
                            <p className='text-xs text-slate-400'>
                              Optional · PNG or JPG
                            </p>
                          </div>
                        </div>
                      </section>

                      <div className='border-t border-slate-100' />

                      {/* Additional gallery images */}
                      <section className='space-y-3'>
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                              Additional Images
                            </p>
                            <p className='text-[13px] text-slate-500'>
                              Extra gallery photos shown on the product page
                            </p>
                          </div>
                          <span className='shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold tabular-nums text-slate-600'>
                            {formData?.images?.length || 0} / 6
                          </span>
                        </div>
                        <div className='grid grid-cols-3 gap-2 sm:gap-3'>
                          {formData?.images?.map((imgData, index) => (
                            <div
                              key={index}
                              className='group relative aspect-square overflow-hidden rounded-lg border border-slate-200 transition-all hover:border-indigo-300'>
                              <img
                                alt={`Product_image_${index + 1}`}
                                className='h-full w-full object-cover'
                                src={URL.createObjectURL(imgData)}
                              />

                              <button
                                onClick={() => {
                                  const newImages = formData.images.filter(
                                    (_, i) => i !== index,
                                  );
                                  updateFormData({
                                    ...formData,
                                    images: newImages,
                                  });
                                }}
                                className='absolute right-1 top-1 z-10 rounded-full bg-red-500/90 p-1 text-white shadow-md transition-all duration-200 hover:scale-110 hover:bg-red-600 opacity-100 sm:right-2 sm:top-2 sm:p-1.5 sm:opacity-0 sm:group-hover:opacity-100'>
                                <X className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
                              </button>

                              <div className='absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm sm:bottom-2 sm:left-2 sm:px-2 sm:py-1 sm:text-xs'>
                                {index + 1}
                              </div>
                            </div>
                          ))}

                          <Input
                            id='picture-additional'
                            type='file'
                            className='hidden'
                            ref={fileRef2}
                            name='images'
                            accept='.png, .jpg, .jpeg'
                            onChange={(e) => {
                              //@ts-ignore
                              const file = e.target.files?.[0];
                              if (file) {
                                updateFormData({
                                  ...formData,
                                  images: [...formData?.images, file],
                                });
                              }
                            }}
                          />

                          {(!formData?.images ||
                            formData?.images?.length < 6) && (
                            <button
                              className='group flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 transition-all hover:border-indigo-400 hover:bg-indigo-50'
                              onClick={() => {
                                if (!!fileRef2) {
                                  //@ts-ignore
                                  fileRef2.current.click();
                                }
                              }}>
                              <div className='flex flex-col items-center gap-1 sm:gap-2'>
                                <PlusCircle className='h-5 w-5 text-slate-400 transition-colors group-hover:text-indigo-500 sm:h-6 sm:w-6' />
                                <span className='text-[10px] font-medium text-slate-500 sm:text-xs'>
                                  Add
                                </span>
                              </div>
                            </button>
                          )}
                        </div>

                        {formData?.images && formData.images.length >= 6 && (
                          <p className='text-xs font-medium text-amber-600'>
                            Maximum 6 additional images reached
                          </p>
                        )}
                      </section>
                    </div>
                  </div>

                  {/* ── Image Groups panel ── */}
                  <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
                    <div className='flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3.5 md:px-5'>
                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600'>
                        <Layers className='h-4 w-4' />
                      </div>
                      <div className='min-w-0'>
                        <h3 className='text-[15px] font-semibold text-slate-900'>
                          Image Groups
                        </h3>
                        <p className='text-[13px] text-slate-500'>
                          Organize images by color/attribute (optional, requires
                          variations)
                        </p>
                      </div>
                    </div>
                    <div className='p-4 md:p-5'>
                      <ImageGroupManager
                        imageGroups={imageGroups}
                        variations={formData.variation || []}
                        onImageGroupsChange={setImageGroups}
                        mode='create'
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ── SEO Tab ── */}
              <TabsContent
                value='seo'
                className='p-4 md:p-6 mt-0 focus-visible:outline-none'>
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

              {/* ── Meta Data Tab ── */}
              <TabsContent
                value='meta'
                className='p-4 md:p-6 mt-0 focus-visible:outline-none'>
                <div className='space-y-1 mb-4'>
                  <h3 className='text-sm font-medium text-slate-900'>
                    Meta Data
                  </h3>
                  <p className='text-xs text-slate-500'>
                    Custom key-value data for admin-panel product search (e.g.
                    age, material). Not shown on the storefront.
                  </p>
                </div>
                <MetaEntriesEditor
                  value={formData?.meta || []}
                  onChange={handleMetaChange}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Mobile Bottom Action Bar — floats above the global bottom tab bar */}
          <div className='mobile:block hidden fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3'>
            <div className='flex gap-3'>
              <button
                variant='outline'
                className='m3-ripple flex-1 h-11 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full'
                onClick={() => dialogBtn?.current?.click()}>
                <XCircle className='w-4 h-4' />
                Discard
              </button>
              <button
                className='m3-ripple flex-1 h-11 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full'
                onClick={createProductAndExit}>
                <Save className='w-4 h-4' />
                Save
              </button>
            </div>
          </div>

          {/* AI Versions Sheet */}
          <AIVersionsSheet
            open={isAISheetOpen}
            onOpenChange={setIsAISheetOpen}
            entity={productAiConfig}
            mode='create'
            entityName={formData.name || "New Product"}
            extraPayload={{
              categoryId: formData.categoryId || null,
              brand: formData.brand || undefined,
              price: formData.unitPrice || undefined,
            }}
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

          {discardDialog()}
        </div>
      </div>
    </MobilePage>
  );
};

export default AddProduct;
