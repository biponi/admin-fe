import {
  PlusCircle,
  Trash,
  Upload,
  X,
  Plus,
  Save,
  ShoppingBag,
  Package,
  Tag,
  Palette,
  Ruler,
  Hash,
  Box,
  BarChart3,
  XIcon as XCircle,
  DollarSign,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
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
import { Badge } from "../../../components/ui/badge";
import AIGenerateButton from "../../../components/aiSeo/AIGenerateButton";
import StreamingAIModal from "../../../components/aiSeo/StreamingAIModal";
import AIVersionsPanel from "../../../components/aiSeo/AIVersionsPanel";
import { productAiConfig } from "../../../components/aiSeo/aiEntityConfig";
import ProductSeoCard from "./components/ProductSeoCard";
import { slugifyText } from "../../../utils/functions";
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
  // ── AI SEO generation state (mirrors CategoryForm) ──
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiVersions, setAiVersions] = useState<AIGenerationVersion[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [appliedFields, setAppliedFields] = useState<Set<string>>(new Set());
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const navigate = useNavigate();

  const fileRef = useRef(null);
  const fileRef2 = useRef(null);
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
    const body: any = version.result.suggestedUpdateBody || version.result.content;
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
        updateFormData({ ...formData, name: value.trim() } as IProductCreateData);
    } else if (field === "slug") {
      const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
      if (cleaned) {
        setSlugManuallyEdited(true);          // keep the applied slug on name changes
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
              variation: prev?.variation.filter(
                (__, i) => i !== index,
              ),
              quantity: prev?.quantity - (prev.variation?.[index]?.quantity || 0),
            };
          });
        }}
        onVariantImagesChange={handleVariantImagesChange}
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
        <Button className='hidden' ref={dialogBtn}>
          show dialog
        </Button>
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
    if ((!formData.categoryId || formData.categoryId === "") && formData.categoryIds?.length > 0) {
      console.log("Auto-populating categoryId from categoryIds[0]:", formData.categoryIds[0]);
      updateFormData({
        ...formData,
        categoryId: formData.categoryIds[0],
      });
      formData.categoryId = formData.categoryIds[0];
    }

    // Ensure categoryId matches categoryIds[0] for consistency
    if (formData.categoryId && formData.categoryIds?.length > 0 && formData.categoryId !== formData.categoryIds[0]) {
      console.error("Category inconsistency detected:", {
        categoryId: formData.categoryId,
        categoryIds: formData.categoryIds,
        categoryIds0: formData.categoryIds[0]
      });
      alert("Primary category must match the first selected category. Please reselect your categories.");
      return;
    }

    // Validate imageGroups before submission - check for incomplete groups
    if (imageGroups.length > 0) {
      const { validGroups, invalidCount } = filterImageGroups(imageGroups);
      if (invalidCount > 0) {
        const incompleteGroups = imageGroups.filter(g => !validateImageGroup(g));
        const groupList = incompleteGroups.map(g =>
          `• ${g.displayLabel || g.id} (${g.attribute || 'no attribute'} - ${g.value || 'no value'})`
        ).join('\n');

        alert(
          `You have ${invalidCount} incomplete image group(s) that will not be saved:\n\n${groupList}\n\n` +
          `Please edit each group and set both the "attribute" and "value" fields before saving.\n\n` +
          `Incomplete groups are marked with an amber border and "Incomplete" badge.`
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

    const { validGroups: validImageGroups, invalidCount } = filterImageGroups(imageGroups);

    console.log("addProduct - imageGroups after filtering:", {
      validGroups: validImageGroups,
      invalidCount,
      totalOriginal: imageGroups.length
    });

    // Log warning if incomplete groups were found
    if (invalidCount > 0) {
      console.warn(`Filtered out ${invalidCount} incomplete imageGroup(s) missing attribute or value`);
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
      imageGroupImageMappingsCount: productData.imageGroupImageMappings?.length || 0,
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
    if ((!formData.categoryId || formData.categoryId === "") && formData.categoryIds?.length > 0) {
      console.log("Auto-populating categoryId from categoryIds[0]:", formData.categoryIds[0]);
      updateFormData({
        ...formData,
        categoryId: formData.categoryIds[0],
      });
      formData.categoryId = formData.categoryIds[0];
    }

    // Ensure categoryId matches categoryIds[0] for consistency
    if (formData.categoryId && formData.categoryIds?.length > 0 && formData.categoryId !== formData.categoryIds[0]) {
      console.error("Category inconsistency detected:", {
        categoryId: formData.categoryId,
        categoryIds: formData.categoryIds,
        categoryIds0: formData.categoryIds[0]
      });
      alert("Primary category must match the first selected category. Please reselect your categories.");
      return;
    }

    // Validate imageGroups before submission - check for incomplete groups
    if (imageGroups.length > 0) {
      const { validGroups, invalidCount } = filterImageGroups(imageGroups);
      if (invalidCount > 0) {
        const incompleteGroups = imageGroups.filter(g => !validateImageGroup(g));
        const groupList = incompleteGroups.map(g =>
          `• ${g.displayLabel || g.id} (${g.attribute || 'no attribute'} - ${g.value || 'no value'})`
        ).join('\n');

        alert(
          `You have ${invalidCount} incomplete image group(s) that will not be saved:\n\n${groupList}\n\n` +
          `Please edit each group and set both the "attribute" and "value" fields before saving.\n\n` +
          `Incomplete groups are marked with an amber border and "Incomplete" badge.`
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

    const { validGroups: validImageGroups, invalidCount } = filterImageGroups(imageGroups);

    console.log("addProduct - imageGroups after filtering:", {
      validGroups: validImageGroups,
      invalidCount,
      totalOriginal: imageGroups.length
    });

    // Log warning if incomplete groups were found
    if (invalidCount > 0) {
      console.warn(`Filtered out ${invalidCount} incomplete imageGroup(s) missing attribute or value`);
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
      imageGroupImageMappingsCount: productData.imageGroupImageMappings?.length || 0,
      imageGroups: productData.imageGroups,
    });

    const response = await createProduct(productData);
    if (!!response) {
      // updateFormData({ ...defaultValue });
    }
  };

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12'>
        {/* Header Section */}
        <div className='mb-6 sm:mb-8'>
          <div className='flex flex-col gap-3 sm:gap-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div className='flex items-start gap-3 sm:gap-4'>
                <div className='hidden sm:flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30'>
                  <PlusCircle className='w-6 h-6 lg:w-7 lg:h-7 text-white' />
                </div>
                <div className='flex-1'>
                  <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent'>
                    Add New Product
                  </h1>
                  <p className='text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2'>
                    Create a new product with detailed information and
                    variations
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <AIGenerateButton
                  onClick={() => setIsAIModalOpen(true)}
                  disabled={!formData.name}
                />
                <Button
                  variant='outline'
                  onClick={() => {
                    if (dialogBtn?.current) {
                      //@ts-ignore
                      dialogBtn.current.click();
                    }
                  }}
                  className='min-w-[100px] hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950'>
                  <XCircle className='w-4 h-4 mr-2' />
                  Discard
                </Button>
                <Button
                  onClick={() => createProductAndExit()}
                  className='min-w-[120px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'>
                  <Save className='w-4 h-4 mr-2' />
                  Save Product
                </Button>
                <Button
                  onClick={() => createProductAndContinue()}
                  variant='secondary'
                  className='min-w-[160px] hidden sm:inline-flex bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 hover:from-blue-200 hover:to-indigo-200'>
                  <Save className='w-4 h-4 mr-2' />
                  Save & Continue
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* AI SEO Generation */}
        <StreamingAIModal
          open={isAIModalOpen}
          onOpenChange={setIsAIModalOpen}
          entity={productAiConfig}
          mode='create'
          entityName={formData.name || "New Product"}
          extraPayload={{
            categoryId: formData.categoryId || null,
            brand: formData.brand || undefined,
            price: formData.unitPrice || undefined,
          }}
          onVersionGenerated={handleVersionGenerated}
          onApplySuggestion={handleApplySuggestion}
          appliedFields={appliedFields}
        />

        {aiVersions.length > 0 && (
          <div className='mb-6 sm:mb-8'>
            <AIVersionsPanel
              entity={productAiConfig}
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

        {/* Stats Overview Cards */}
        <div className='hidden grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8'>
          {/* Total Stock Card */}
          <Card className='border-none shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative'>
            <div className='absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12' />
            <CardContent className='p-4 sm:p-6 relative z-10'>
              <div className='flex items-center justify-between mb-2 sm:mb-3'>
                <div className='p-2 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm'>
                  <Package className='w-5 h-5 sm:w-6 sm:h-6' />
                </div>
                <BarChart3 className='w-5 h-5 sm:w-6 sm:h-6 opacity-50' />
              </div>
              <p className='text-xs sm:text-sm font-medium opacity-90 mb-1'>
                Total Stock
              </p>
              <p className='text-2xl sm:text-3xl lg:text-4xl font-bold'>
                {totalQuantity}
              </p>
            </CardContent>
          </Card>

          {/* Total Variations Card */}
          <Card className='border-none shadow-lg bg-gradient-to-br from-blue-500 to-cyan-600 text-white overflow-hidden relative'>
            <div className='absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12' />
            <CardContent className='p-4 sm:p-6 relative z-10'>
              <div className='flex items-center justify-between mb-2 sm:mb-3'>
                <div className='p-2 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm'>
                  <Box className='w-5 h-5 sm:w-6 sm:h-6' />
                </div>
                <Tag className='w-5 h-5 sm:w-6 sm:h-6 opacity-50' />
              </div>
              <p className='text-xs sm:text-sm font-medium opacity-90 mb-1'>
                Total Variants
              </p>
              <p className='text-2xl sm:text-3xl lg:text-4xl font-bold'>
                {formData?.variation?.length || 0}
              </p>
            </CardContent>
          </Card>

          {/* Colors Card */}
          <Card className='border-none shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white overflow-hidden relative'>
            <div className='absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12' />
            <CardContent className='p-4 sm:p-6 relative z-10'>
              <div className='flex items-center justify-between mb-2 sm:mb-3'>
                <div className='p-2 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm'>
                  <Palette className='w-5 h-5 sm:w-6 sm:h-6' />
                </div>
                <Palette className='w-5 h-5 sm:w-6 sm:h-6 opacity-50' />
              </div>
              <p className='text-xs sm:text-sm font-medium opacity-90 mb-1'>
                Unique Colors
              </p>
              <p className='text-2xl sm:text-3xl lg:text-4xl font-bold'>
                {uniqueColors.length}
              </p>
            </CardContent>
          </Card>

          {/* Sizes Card */}
          <Card className='border-none shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden relative'>
            <div className='absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12' />
            <CardContent className='p-4 sm:p-6 relative z-10'>
              <div className='flex items-center justify-between mb-2 sm:mb-3'>
                <div className='p-2 sm:p-2.5 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm'>
                  <Ruler className='w-5 h-5 sm:w-6 sm:h-6' />
                </div>
                <Ruler className='w-5 h-5 sm:w-6 sm:h-6 opacity-50' />
              </div>
              <p className='text-xs sm:text-sm font-medium opacity-90 mb-1'>
                Unique Sizes
              </p>
              <p className='text-2xl sm:text-3xl lg:text-4xl font-bold'>
                {uniqueSizes.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className='grid gap-6 lg:gap-8 lg:grid-cols-[2fr_1fr]'>
          {/* Left Column - Editable Fields */}
          <div className='space-y-6'>
            {/* Basic Information Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='text-xl flex items-center gap-2'>
                  <div className='p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg'>
                    <ShoppingBag className='w-5 h-5 text-white' />
                  </div>
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Provide the essential details about your product
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6 pt-6'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='name'
                    className='text-sm font-semibold flex items-center gap-2'>
                    <Tag className='w-4 h-4 text-blue-500' />
                    Product Name *
                  </Label>
                  <Input
                    id='name'
                    name='name'
                    type='text'
                    value={formData?.name}
                    onChange={handleChange}
                    placeholder='Enter product name'
                    className='h-11 border-2 focus:border-blue-500 transition-colors'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='description'
                    className='text-sm font-semibold'>
                    Description
                  </Label>
                  <TiptapEditor
                    content={formData?.description || ""}
                    onChange={handleDescriptionChange}
                    placeholder='Describe your product features, benefits, and specifications...'
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='text-xl flex items-center gap-2'>
                  <div className='p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg'>
                    <BarChart3 className='w-5 h-5 text-white' />
                  </div>
                  SEO Settings
                </CardTitle>
                <CardDescription>
                  Slug, meta data, and tags for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-6'>
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
              </CardContent>
            </Card>

            {/* Product Details Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='text-xl flex items-center gap-2'>
                  <div className='p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg'>
                    <Package className='w-5 h-5 text-white' />
                  </div>
                  Product Details
                </CardTitle>
                <CardDescription>
                  Set category, SKU, pricing, and inventory information
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6 pt-6'>
                <div className='grid gap-6 sm:grid-cols-2'>
                  <div className='space-y-4'>
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
                        className='text-sm font-semibold flex items-center gap-2'>
                        <Hash className='w-4 h-4 text-slate-500' />
                        Product SKU *
                      </Label>
                      <Input
                        id='product-sku'
                        name='sku'
                        type='text'
                        value={formData?.sku}
                        onChange={handleChange}
                        placeholder='Enter unique SKU'
                        className='h-11 font-mono border-2 focus:border-indigo-500 transition-colors'
                        required
                      />
                      <p className='text-xs text-slate-600 dark:text-slate-400'>
                        Stock Keeping Unit - unique identifier
                      </p>
                    </div>

                    <div className='space-y-2'>
                      <Label
                        htmlFor='brand'
                        className='text-sm font-semibold flex items-center gap-2'>
                        <Tag className='w-4 h-4 text-slate-500' />
                        Brand
                      </Label>
                      <Input
                        id='brand'
                        name='brand'
                        type='text'
                        value={formData?.brand || ""}
                        onChange={handleChange}
                        placeholder='e.g. Samsung'
                        className='h-11 border-2 focus:border-indigo-500 transition-colors'
                      />
                      <p className='text-xs text-slate-600 dark:text-slate-400'>
                        Used for SEO content and AI generation grounding
                      </p>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='product-unit-price'
                        className='text-sm font-semibold flex items-center gap-2'>
                        <Tag className='w-4 h-4 text-green-500' />
                        Unit Price *
                      </Label>
                      <Input
                        id='product-unit-price'
                        name='unitPrice'
                        type='number'
                        value={formData?.unitPrice}
                        onChange={handleChange}
                        placeholder='0.00'
                        className='h-11 border-2 focus:border-green-500 transition-colors'
                        min='0'
                        step='0.01'
                        required
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label
                        htmlFor='quantity'
                        className='text-sm font-semibold flex items-center gap-2'>
                        <Package className='w-4 h-4 text-emerald-500' />
                        Total Quantity
                      </Label>
                      <Input
                        id='quantity'
                        name='quantity'
                        type='number'
                        value={formData?.quantity}
                        onChange={handleChange}
                        placeholder='0'
                        className={`h-11 border-2 transition-colors ${
                          hasVariation
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed"
                            : "focus:border-emerald-500"
                        }`}
                        min='0'
                        disabled={hasVariation}
                      />
                      {hasVariation && (
                        <p className='text-xs text-amber-600 dark:text-amber-400 font-medium'>
                          ⚠️ Auto-calculated from variations
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Discounts Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='text-xl flex items-center gap-2'>
                  <div className='p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg'>
                    <Tag className='w-5 h-5 text-white' />
                  </div>
                  Pricing & Discounts
                </CardTitle>
                <CardDescription>
                  Configure discount options and promotional pricing
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6 pt-6'>
                <div className='grid gap-6 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='discount-type'
                      className='text-sm font-semibold'>
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
                      <SelectTrigger
                        id='discount-type'
                        className='h-11 border-2'>
                        <SelectValue placeholder='Select discount type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='%'>Percentage (%)</SelectItem>
                        <SelectItem value='-'>Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='discount' className='text-sm font-semibold'>
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
                      className='h-11 border-2 focus:border-green-500 transition-colors'
                      min='0'
                      step={formData?.discountType === "%" ? "1" : "0.01"}
                    />
                    {formData?.discountType && (
                      <p className='text-xs text-slate-600 dark:text-slate-400'>
                        {formData?.discountType === "%"
                          ? "Enter percentage (0-100)"
                          : "Enter fixed amount to deduct"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Settings Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='text-xl flex items-center gap-2'>
                  <div className='p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg'>
                    <DollarSign className='w-5 h-5 text-white' />
                  </div>
                  Commission Settings
                </CardTitle>
                <CardDescription>
                  Configure commission for this product (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6 pt-6'>
                <div className='grid gap-6 sm:grid-cols-2'>
                  {/* Commission Type */}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='commission-type'
                      className='text-sm font-semibold'>
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
                      <SelectTrigger
                        id='commission-type'
                        className='h-11 border-2'>
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

                  {/* Commission Rate */}
                  {(formData?.commissionType === "percentage" ||
                    formData?.commissionType === "fixed") && (
                    <div className='space-y-2'>
                      <Label
                        htmlFor='commission-rate'
                        className='text-sm font-semibold'>
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
                        className='h-11 border-2 focus:border-purple-500 transition-colors'
                      />
                      <p className='text-xs text-slate-600 dark:text-slate-400'>
                        {formData?.commissionType === "percentage"
                          ? "This percentage of the product price will be paid as commission"
                          : "This fixed amount will be paid as commission per item"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Variations Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <div className='p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg'>
                      <Box className='w-5 h-5 text-white' />
                    </div>
                    <span>Product Variations</span>
                  </div>
                  {hasVariation && (
                    <Badge
                      variant='secondary'
                      className='w-fit bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 border-0'>
                      {formData.variation.length} variation
                      {formData.variation.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure product variations with different sizes, colors, and
                  pricing options.
                </CardDescription>
              </CardHeader>

              <CardContent className='space-y-6 pt-6'>
                {/* Variation Toggle */}
                <div className='space-y-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border-2 border-slate-200 dark:border-slate-600'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                      <Label
                        htmlFor='variation-toggle'
                        className='text-base font-medium'>
                        Enable Variations
                      </Label>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`text-sm ${
                            !hasVariation
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground"
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
                              setV2Colors([]);
                              setV2Sizes([]);
                            }
                          }}
                          aria-describedby='variation-help'
                        />
                        <span
                          className={`text-sm ${
                            hasVariation
                              ? "font-semibold text-foreground"
                              : "text-muted-foreground"
                          }`}
                          aria-hidden='true'>
                          Yes
                        </span>
                      </div>
                    </div>

                    {hasVariation && (
                      <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
                        <Label
                          htmlFor='same-price-toggle'
                          className='text-sm font-medium'>
                          Same Unit Price for All
                        </Label>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`text-sm ${
                              !isSameUnitPrice
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground"
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
                                ? "font-semibold text-foreground"
                                : "text-muted-foreground"
                            }`}
                            aria-hidden='true'>
                            Yes
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='space-y-1 text-xs text-slate-700 dark:text-slate-300'>
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
                </div>

                {hasVariation && (
                  <Tabs
                    value={variationTab}
                    onValueChange={setVariationTab}
                    className='w-full'>
                    <TabsList className='grid w-full grid-cols-2'>
                      <TabsTrigger
                        value='v1'
                        className='flex items-center gap-2'>
                        <span>Advanced</span>
                        <Badge variant='outline' className='text-xs'>
                          V1
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value='v2'
                        className='flex items-center gap-2'>
                        <span>Simple</span>
                        <Badge variant='outline' className='text-xs'>
                          V2
                        </Badge>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value='v1' className='mt-6'>
                      <div className='space-y-4'>
                        <div className='text-sm text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border'>
                          <strong>Advanced Mode:</strong> Manually configure
                          each variation with full control over all properties.
                        </div>
                        {renderV1VariationView()}
                      </div>
                    </TabsContent>

                    <TabsContent value='v2' className='mt-6'>
                      <div className='space-y-4'>
                        <div className='text-sm text-slate-700 dark:text-slate-300 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border'>
                          <strong>Simple Mode:</strong> Quick setup for size and
                          color combinations. Variations are auto-generated.
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
                  <div className='text-center py-12 text-slate-600 dark:text-slate-400'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 mb-4'>
                      <Box className='w-8 h-8 text-slate-400' />
                    </div>
                    <p className='mb-2 font-medium'>No variations configured</p>
                    <p className='text-sm'>
                      Enable variations above to add different sizes, colors, or
                      other variants.
                    </p>
                  </div>
                )}
              </CardContent>

              {hasVariation && variationTab === "v1" && (
                <CardFooter className='border-t bg-slate-50 dark:bg-slate-800/50'>
                  <Button
                    onClick={addNewVariation}
                    variant='outline'
                    className='w-full hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950'>
                    <PlusCircle className='h-4 w-4 mr-2' />
                    Add New Variation
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Right Column - Status & Images */}
          <div className='space-y-6'>
            {/* Product Status Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <CardTitle className='text-lg'>Product Status</CardTitle>
                <CardDescription>
                  Set the product visibility and availability
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='space-y-3'>
                  <Label className='text-sm font-semibold'>Status</Label>
                  <Select
                    value={formData?.active ? "active" : "inactive"}
                    onValueChange={(value) => {
                      updateFormData({
                        ...formData,
                        active: value === "active",
                      });
                    }}>
                    <SelectTrigger id='status' className='h-11 border-2'>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 rounded-full bg-green-500'></div>
                          <span className='font-medium'>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value='inactive'>
                        <div className='flex items-center gap-2'>
                          <div className='w-2 h-2 rounded-full bg-red-500'></div>
                          <span className='font-medium'>Inactive</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className='text-xs text-slate-600 dark:text-slate-400'>
                    {formData?.active
                      ? "✓ Product will be visible to customers"
                      : "✗ Product will be hidden from customers"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Product Images Card */}
            <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden'>
              <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                <div className='flex justify-between items-center'>
                  <div>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Upload className='w-5 h-5 text-blue-500' />
                      Product Images
                    </CardTitle>
                    <CardDescription className='mt-1'>
                      Main thumbnail and up to 6 additional images
                    </CardDescription>
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
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      if (!!fileRef) {
                        //@ts-ignore
                        fileRef.current.click();
                      }
                    }}
                    className='hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950'>
                    <Upload className='h-4 w-4 mr-2' />
                    Upload
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='space-y-4'>
                  {/* Main Thumbnail */}
                  <div className='relative group'>
                    <div className='absolute -top-2 -left-2 z-10 px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-md shadow-lg'>
                      Main Thumbnail
                    </div>
                    <img
                      alt='Product_thumbnail'
                      className='aspect-square w-full rounded-xl object-cover shadow-lg border-2 border-blue-200 dark:border-blue-800'
                      src={
                        !!formData?.thumbnail
                          ? URL.createObjectURL(formData.thumbnail)
                          : PlaceHolderImage
                      }
                    />
                    {!formData?.thumbnail && (
                      <div className='absolute inset-0 flex flex-col items-center justify-center text-slate-400'>
                        <Upload className='h-8 w-8 mb-2' />
                        <p className='text-sm text-center px-2'>
                          Click "Upload" to add thumbnail
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Additional Images */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-semibold text-slate-700 dark:text-slate-300'>
                      Additional Images ({formData?.images?.length || 0}/6)
                    </Label>
                    <div className='grid grid-cols-3 gap-2 sm:gap-3'>
                      {formData?.images?.map((imgData, index) => (
                        <div
                          key={index}
                          className='group relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all'>
                          <img
                            alt={`Product_image_${index + 1}`}
                            className='w-full h-full object-cover'
                            src={URL.createObjectURL(imgData)}
                          />

                          {/* Remove button - appears on hover */}
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
                            className='absolute top-1 right-1 sm:top-2 sm:right-2 p-1 sm:p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110 z-10'>
                            <X className='w-3 h-3 sm:w-4 sm:h-4' />
                          </button>

                          {/* Image number badge */}
                          <div className='absolute bottom-1 left-1 sm:bottom-2 sm:left-2 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-black/60 text-white text-[10px] sm:text-xs font-medium rounded backdrop-blur-sm'>
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

                      {/* Upload button - show if less than 6 images */}
                      {(!formData?.images || formData?.images?.length < 6) && (
                        <button
                          className='flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all group'
                          onClick={() => {
                            if (!!fileRef2) {
                              //@ts-ignore
                              fileRef2.current.click();
                            }
                          }}>
                          <div className='flex flex-col items-center gap-1 sm:gap-2'>
                            <Upload className='h-5 w-5 sm:h-6 sm:w-6 text-slate-400 group-hover:text-blue-500 transition-colors' />
                            <span className='text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium'>
                              Add
                            </span>
                          </div>
                        </button>
                      )}
                    </div>

                    {formData?.images && formData.images.length >= 6 && (
                      <p className='text-xs text-amber-600 dark:text-amber-400 font-medium'>
                        ⚠️ Maximum 6 additional images reached
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Image Groups Card - NEW */}
            {hasVariation && (
              <Card className='border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden'>
                <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <Palette className='w-5 h-5 text-purple-500' />
                        Image Groups
                      </CardTitle>
                      <CardDescription className='mt-1'>
                        Organize images by color/attribute (optional)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-6'>
                  <ImageGroupManager
                    imageGroups={imageGroups}
                    variations={formData.variation || []}
                    onImageGroupsChange={setImageGroups}
                    mode='create'
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className='flex flex-col gap-3 mt-6 sm:mt-8 lg:hidden'>
          <Button
            variant='outline'
            onClick={() => {
              if (dialogBtn?.current) {
                //@ts-ignore
                dialogBtn.current.click();
              }
            }}
            className='w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300'>
            <XCircle className='w-4 h-4 mr-2' />
            Discard Changes
          </Button>
          <div className='grid grid-cols-2 gap-3'>
            <Button
              onClick={() => createProductAndExit()}
              className='w-full bg-gradient-to-r from-green-600 to-emerald-600'>
              <Save className='w-4 h-4 mr-2' />
              Save
            </Button>
            <Button
              onClick={() => createProductAndContinue()}
              variant='secondary'
              className='w-full'>
              <Save className='w-4 h-4 mr-2' />
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
      {discardDialog()}
    </div>
  );
};

export default AddProduct;
