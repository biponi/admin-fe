import { PackageOpen, CheckCircle2 } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import { ReportStatTiles } from "../reportScaffold/ReportStatTiles";
import {
  CurrencyCell,
  MonoCell,
  ProductNameCell,
  StockBadgeCell,
} from "../reportScaffold/reportCells";
import { formatCurrency, formatNumber } from "../../../../../utils/inventoryReportUtils";
import { LowStockProduct } from "../../../../../api/inventoryReport";

interface LowStockTableProps {
  data: LowStockProduct[];
}

const columns: ReportColumn<LowStockProduct>[] = [
  {
    key: "name",
    header: "Product",
    widthClass: "min-w-[200px]",
    mobileSlot: "title",
    render: (p) => <ProductNameCell name={p.name} hasVariation={p.hasVariation} />,
  },
  {
    key: "sku",
    header: "SKU",
    mobileSlot: "meta",
    render: (p) => <MonoCell value={p.sku} />,
  },
  {
    key: "category",
    header: "Category",
    mobileSlot: "meta",
    render: (p) => <span className='text-[#57554D]'>{p.categoryId}</span>,
  },
  {
    key: "stock",
    header: "Stock Level",
    align: "center",
    mobileSlot: "trailing",
    render: (p) => <StockBadgeCell stock={p.totalStock} />,
  },
  {
    key: "unitPrice",
    header: "Unit Price",
    align: "right",
    mobileSlot: "hidden",
    render: (p) => <CurrencyCell value={p.unitPrice} />,
  },
  {
    key: "value",
    header: "Inventory Value",
    align: "right",
    mobileSlot: "meta",
    render: (p) => <CurrencyCell value={p.inventoryValue} />,
  },
];

/**
 * Low Stock Table — products below the stock threshold with urgency badges.
 */
export const LowStockTable = ({ data }: LowStockTableProps) => {
  const rows = Array.isArray(data) ? data : [];
  const totalValue = rows.reduce((sum, p) => sum + p.inventoryValue, 0);

  return (
    <div className='space-y-3'>
      <ReportStatTiles
        tiles={[
          {
            label: "Low stock items",
            value: formatNumber(rows.length),
            tone: "warn",
            icon: <PackageOpen className='h-3.5 w-3.5' />,
          },
          {
            label: "Total value",
            value: formatCurrency(totalValue),
            sub: "combined inventory value",
          },
        ]}
      />
      <ReportTable
        columns={columns}
        rows={rows}
        rowKey={(_, i) => i}
        empty={{
          icon: <CheckCircle2 className='h-5 w-5 text-[#1A7F37]' />,
          title: "No Low Stock Products",
          description: "All products are adequately stocked",
        }}
        summary={[
          { label: "Total Products", value: formatNumber(rows.length) },
          { label: "Total Value", value: formatCurrency(totalValue) },
        ]}
      />
    </div>
  );
};

export default LowStockTable;
