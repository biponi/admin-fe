import { ShoppingCart } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import { ReportStatTiles } from "../reportScaffold/ReportStatTiles";
import {
  MonoCell,
  NumberCell,
  ProductNameCell,
  ActiveBadgeCell,
  DateCell,
} from "../reportScaffold/reportCells";
import { SalesActivityProduct } from "../../../../../api/inventoryReport";

interface SalesActivityTableProps {
  data: SalesActivityProduct[];
}

const columns: ReportColumn<SalesActivityProduct>[] = [
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
    key: "sold",
    header: "Total Sold",
    align: "right",
    mobileSlot: "trailing",
    render: (p) => <NumberCell value={p.totalSold} unit='units' />,
  },
  {
    key: "lastSale",
    header: "Last Sale",
    mobileSlot: "meta",
    render: (p) => <DateCell value={p.lastSaleAt} />,
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    mobileSlot: "hidden",
    render: (p) => <ActiveBadgeCell active={p.active} />,
  },
];

/**
 * Sales Activity Table — recently sold products.
 */
export const SalesActivityTable = ({ data }: SalesActivityTableProps) => {
  const rows = Array.isArray(data) ? data : [];
  const totalSales = rows.reduce((sum, p) => sum + p.totalSold, 0);
  const activeProducts = rows.filter((p) => p.active).length;

  return (
    <div className='space-y-3'>
      <ReportStatTiles
        tiles={[
          { label: "Products sold", value: rows.length },
          {
            label: "Total units sold",
            value: totalSales.toLocaleString(),
            tone: "good",
          },
          { label: "Active products", value: activeProducts },
        ]}
      />
      <ReportTable
        columns={columns}
        rows={rows}
        rowKey={(_, i) => i}
        empty={{
          icon: <ShoppingCart className='h-5 w-5' />,
          title: "No Recent Sales",
          description: "No sales activity recorded yet",
        }}
        summary={[{ label: "Products", value: rows.length }]}
      />
    </div>
  );
};

export default SalesActivityTable;
