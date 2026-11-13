import { Sparkles } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import { DateCell, RelativeTimeCell, ProductNameCell } from "../reportScaffold/reportCells";
import { RecentlyAddedProduct } from "../../../../../api/inventoryReport";

interface RecentlyAddedTableProps {
  data: RecentlyAddedProduct[];
}

const columns: ReportColumn<RecentlyAddedProduct>[] = [
  {
    key: "name",
    header: "Product",
    widthClass: "min-w-[220px]",
    mobileSlot: "title",
    render: (p) => <ProductNameCell name={p.name} />,
  },
  {
    key: "created",
    header: "Created",
    align: "right",
    mobileSlot: "trailing",
    render: (p) => <DateCell value={p.createdDate} />,
  },
  {
    key: "ago",
    header: "Added",
    mobileSlot: "meta",
    render: (p) => <RelativeTimeCell value={p.createdDate} />,
  },
];

/**
 * Recently Added Table — newest products in the catalog.
 */
export const RecentlyAddedTable = ({ data }: RecentlyAddedTableProps) => (
  <ReportTable
    columns={columns}
    rows={Array.isArray(data) ? data : []}
    rowKey={(_, i) => i}
    empty={{
      icon: <Sparkles className='h-5 w-5' />,
      title: "No Recent Additions",
      description: "No products have been added recently",
    }}
    summary={[{ label: "Products", value: data?.length ?? 0 }]}
  />
);

export default RecentlyAddedTable;
