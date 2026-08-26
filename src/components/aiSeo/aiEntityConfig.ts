// Per-entity configuration for the shared AI SEO components (modal, versions
// panel). Only labels, applicable suggestion fields, copy, and endpoint
// paths differ between category and product — everything else is identical.
import config from "../../utils/config";
import { AiSeoSuggestion } from "../../api/aiSeo";

export interface AiEntityField {
  key: string;
  label: string;
  clip?: boolean;
}

export interface AiEntityConfig {
  key: "category" | "product";
  fields: AiEntityField[]; // ordered; description first (streaming order)
  suggestionLabels: Record<string, string>;
  applicableSuggestions: AiSeoSuggestion["field"][];
  copy: {
    modalHintEdit: string;
    modalHintCreate: string;
    notesPlaceholder: string;
  };
  suggestPath: () => string;
  generatePath: (id: string) => string;
}

export const categoryAiConfig: AiEntityConfig = {
  key: "category",
  fields: [
    { key: "description", label: "Description", clip: true },
    { key: "shortDescription", label: "Short Description", clip: true },
    { key: "focusKeyphrase", label: "Focus Keyphrase" },
    { key: "seoTitle", label: "SEO Title" },
    { key: "metaDescription", label: "Meta Description", clip: true },
    { key: "tags", label: "Tags" },
    { key: "google_category_type", label: "Google Category" },
  ],
  suggestionLabels: {
    discount: "Discount",
    discountType: "Discount Type",
    name: "Category Name",
    slug: "Suggested Slug",
    img: "Image",
    internalLinks: "Internal Links",
    general: "General",
  },
  applicableSuggestions: ["discount", "discountType", "name", "slug"],
  copy: {
    modalHintEdit:
      "SEO content will be generated using this category's real products and hierarchy.",
    modalHintCreate:
      "Add optional hints to guide the generation, then start.",
    notesPlaceholder:
      "Optional hints — e.g. '20000mAh power banks, popular with commuters' (sent to the AI)",
  },
  suggestPath: config.category.aiSeoSuggest,
  generatePath: config.category.aiSeoGenerate,
};

export const productAiConfig: AiEntityConfig = {
  key: "product",
  fields: [
    { key: "description", label: "Description", clip: true },
    { key: "shortDescription", label: "Short Description", clip: true },
    { key: "focusKeyphrase", label: "Focus Keyphrase" },
    { key: "seoTitle", label: "SEO Title" },
    { key: "seoDescription", label: "Meta Description", clip: true },
    { key: "tags", label: "Tags" },
  ],
  suggestionLabels: {
    discount: "Discount",
    discountType: "Discount Type",
    name: "Product Name",
    slug: "Suggested Slug",
    tags: "Tags",
    img: "Image",
    internalLinks: "Internal Links",
    general: "General",
  },
  applicableSuggestions: ["discount", "discountType", "name", "slug", "tags"],
  copy: {
    modalHintEdit:
      "SEO content will be generated from this product's name, brand, category, price, and variant attributes.",
    modalHintCreate:
      "Add optional hints to guide the generation (brand, key specs), then start.",
    notesPlaceholder:
      "Optional hints — e.g. '20000mAh fast-charging power bank, dual USB-C' (sent to the AI)",
  },
  suggestPath: config.product.aiSeoSuggest,
  generatePath: config.product.aiSeoGenerate,
};
