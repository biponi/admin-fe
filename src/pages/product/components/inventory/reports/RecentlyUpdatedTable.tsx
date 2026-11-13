import { RefreshCw } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import { DateCell, RelativeTimeCell, ProductNameCell } from "../reportScaffold/reportCells";
import { RecentlyUpdatedProduct } from "../../../../../api/inventoryReport";

interface RecentlyUpdatedTableProps {
  data: RecentlyUpdatedProduct[];
}

const columns: ReportColumn<RecentlyUpdatedProduct>[] = [
  {
    key: "name",
    header: "Product",
    widthClass: "min-w-[220px]",
    mobileSlot: "title",
    render: (p) => <ProductNameCell name={p.name} />,
  },
  {
    key: "updated",
    header: "Last Updated",
    align: "right",
    mobileSlot: "trailing",
    render: (p) => <DateCell value={p.lastUpdatedDate} />,
  },
  {
    key: "ago",
    header: "Modified",
    mobileSlot: "meta",
    render: (p) => <RelativeTimeCell value={p.lastUpdatedDate} />,
  },
];

/**
 * Recently Updated Table — most recently modified products.
 */
export const RecentlyUpdatedTable = ({ data }: RecentlyUpdatedTableProps) => (
  <ReportTable
    columns={columns}
    rows={Array.isArray(data) ? data : []}
    rowKey={(_, i) => i}
    empty={{
      icon: <RefreshCw className='h-5 w-5' />,
      title: "No Recent Updates",
      description: "No products have been updated recently",
    }}
    summary={[{ label: "Products", value: data?.length ?? 0 }]}
  />
);

export default RecentlyUpdatedTable;
