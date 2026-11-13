import { Tag } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import { ReportStatTiles } from "../reportScaffold/ReportStatTiles";
import {
  CurrencyCell,
  PercentCell,
  ProductNameCell,
  ToneBadge,
} from "../reportScaffold/reportCells";
import { formatCurrency } from "../../../../../utils/inventoryReportUtils";
import { DiscountedProduct } from "../../../../../api/inventoryReport";

interface DiscountedProductsTableProps {
  data: DiscountedProduct[];
  summary?: Record<string, any>;
}

/**
 * Discounted Products Table — products currently on discount with savings.
 */
export const DiscountedProductsTable = ({
  data,
  summary,
}: DiscountedProductsTableProps) => {
  // API may send numerics as strings — coerce before any math
  const rows = (Array.isArray(data) ? data : []).map((p) => ({
    ...p,
    originalPrice: Number(p.originalPrice) || 0,
    finalPrice: Number(p.finalPrice) || 0,
    discount: Number(p.discount) || 0,
    discountPercent:
      p.discountPercent === undefined ? undefined : Number(p.discountPercent) || 0,
  }));
  // Server-computed average over the whole dataset (unit-aware), falling
  // back to the page's percent values
  const avgDiscount =
    (summary?.averageDiscountPercent !== undefined
      ? Number(summary.averageDiscountPercent) || 0
      : undefined) ??
    (rows.length > 0
      ? rows.reduce((sum, p) => sum + (p.discountPercent ?? 0), 0) / rows.length
      : 0);
  const totalOriginalValue = rows.reduce((sum, p) => sum + p.originalPrice, 0);
  const totalFinalValue = rows.reduce((sum, p) => sum + p.finalPrice, 0);
  const totalSavings = totalOriginalValue - totalFinalValue;

  const columns: ReportColumn<DiscountedProduct>[] = [
    {
      key: "name",
      header: "Product",
      widthClass: "min-w-[200px]",
      mobileSlot: "title",
      render: (p) => <ProductNameCell name={p.name} />,
    },
    {
      key: "original",
      header: "Original Price",
      align: "right",
      render: (p) => <CurrencyCell value={p.originalPrice} />,
    },
    {
      key: "discount",
      header: "Discount",
      align: "center",
      mobileSlot: "trailing",
      render: (p) =>
        p.discountType === "%" || p.discountType.toLowerCase() === "percentage" ? (
          <ToneBadge tone='warn'>{p.discount}% off</ToneBadge>
        ) : (
          <ToneBadge tone='neutral'>{formatCurrency(p.discount)} off</ToneBadge>
        ),
    },
    {
      key: "effective",
      header: "Effective %",
      align: "right",
      render: (p) => <PercentCell value={p.discountPercent} />,
    },
    {
      key: "final",
      header: "Final Price",
      align: "right",
      mobileSlot: "meta",
      render: (p) => <CurrencyCell value={p.finalPrice} />,
    },
  ];

  return (
    <div className='space-y-3'>
      <ReportStatTiles
        tiles={[
          {
            label: "Total savings",
            value: formatCurrency(totalSavings),
            tone: "good",
          },
          { label: "Avg discount", value: `${avgDiscount.toFixed(1)}%` },
          { label: "Products on sale", value: rows.length },
          {
            label: "Discounted value",
            value: formatCurrency(totalFinalValue),
          },
        ]}
      />
      <ReportTable
        columns={columns}
        rows={rows}
        rowKey={(_, i) => i}
        empty={{
          icon: <Tag className='h-5 w-5' />,
          title: "No Discounts Available",
          description: "No products currently have active discounts",
        }}
        summary={[
          { label: "Products", value: rows.length },
          { label: "Total Savings", value: formatCurrency(totalSavings) },
        ]}
      />
    </div>
  );
};

export default DiscountedProductsTable;
