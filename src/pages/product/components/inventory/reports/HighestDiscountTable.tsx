import { Award, TrendingDown } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import { ReportStatTiles } from "../reportScaffold/ReportStatTiles";
import {
  CurrencyCell,
  MonoCell,
  PercentCell,
  ProductNameCell,
  ActiveBadgeCell,
  ToneBadge,
} from "../reportScaffold/reportCells";

import { HighestDiscountProduct } from "../../../../../api/inventoryReport";

interface HighestDiscountTableProps {
  data: HighestDiscountProduct[];
  summary?: Record<string, any>;
}

/** Discount depth label + tone (reserved status colors). */
const discountLevel = (discount: number) => {
  if (discount >= 50) return { tone: "bad" as const, label: "Massive" };
  if (discount >= 30) return { tone: "warn" as const, label: "Huge" };
  if (discount >= 20) return { tone: "warn" as const, label: "Great" };
  if (discount >= 10) return { tone: "good" as const, label: "Good" };
  return { tone: "neutral" as const, label: "Moderate" };
};

/**
 * Highest Discount Table — products with the biggest discounts.
 */
export const HighestDiscountTable = ({
  data,
}: HighestDiscountTableProps) => {
  // API may send numerics as strings — coerce before any math
  const rows = (Array.isArray(data) ? data : []).map((p) => ({
    ...p,
    unitPrice: Number(p.unitPrice) || 0,
    discount: Number(p.discount) || 0,
    discountPercent:
      p.discountPercent === undefined ? undefined : Number(p.discountPercent) || 0,
    effectiveDiscountAmount:
      p.effectiveDiscountAmount === undefined
        ? undefined
        : Number(p.effectiveDiscountAmount) || 0,
  }));
  const avgDiscount = rows.length
    ? rows.reduce((sum, p) => sum + p.discount, 0) / rows.length
    : 0;
  const maxDiscount = Math.max(...rows.map((p) => p.discount), 0);
  const activeProducts = rows.filter((p) => p.active).length;

  const columns: ReportColumn<HighestDiscountProduct>[] = [
    {
      key: "rank",
      header: "Rank",
      align: "center",
      mobileSlot: "hidden",
      render: (_, i) => (
        <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F1EA] text-[#57554D] text-xs font-semibold'>
          {i + 1}
        </span>
      ),
    },
    {
      key: "name",
      header: "Product",
      widthClass: "min-w-[200px]",
      mobileSlot: "title",
      render: (p) => <ProductNameCell name={p.name} />,
    },
    {
      key: "sku",
      header: "SKU",
      mobileSlot: "meta",
      render: (p) => <MonoCell value={p.sku} />,
    },
    {
      key: "price",
      header: "Unit Price",
      align: "right",
      render: (p) => <CurrencyCell value={p.unitPrice} />,
    },
    {
      key: "discount",
      header: "Discount",
      align: "right",
      mobileSlot: "trailing",
      render: (p) => <PercentCell value={p.discountPercent ?? p.discount} />,
    },
    {
      key: "level",
      header: "Depth",
      align: "center",
      mobileSlot: "meta",
      render: (p) => {
        const lvl = discountLevel(p.discount);
        return <ToneBadge tone={lvl.tone}>{lvl.label}</ToneBadge>;
      },
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      mobileSlot: "hidden",
      render: (p) => <ActiveBadgeCell active={p.active} />,
    },
  ];

  return (
    <div className='space-y-3'>
      <ReportStatTiles
        tiles={[
          {
            label: "Highest discount",
            value: `${maxDiscount}%`,
            tone: "bad",
            icon: <TrendingDown className='h-3.5 w-3.5' />,
          },
          { label: "Average discount", value: `${avgDiscount.toFixed(1)}%` },
          { label: "Active products", value: activeProducts },
          { label: "Products listed", value: rows.length },
        ]}
      />
      <ReportTable
        columns={columns}
        rows={rows}
        rowKey={(_, i) => i}
        empty={{
          icon: <Award className='h-5 w-5' />,
          title: "No Discount Data",
          description: "No products with discount information available",
        }}
        summary={[{ label: "Products", value: rows.length }]}
      />
    </div>
  );
};

export default HighestDiscountTable;
