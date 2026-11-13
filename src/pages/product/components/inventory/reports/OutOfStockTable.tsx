import { CheckCircle2, AlertTriangle } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import {
  CurrencyCell,
  MonoCell,
  ProductNameCell,
} from "../reportScaffold/reportCells";
import { OutOfStockProduct } from "../../../../../api/inventoryReport";

interface OutOfStockTableProps {
  data: OutOfStockProduct[];
}

const columns: ReportColumn<OutOfStockProduct>[] = [
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
    key: "status",
    header: "Status",
    align: "center",
    render: () => (
      <span className='text-[11px] font-medium text-[#B3365B] bg-[#FBEFF3] border border-[#F2D2DC] rounded-full px-2 py-0.5 whitespace-nowrap'>
        Out of stock
      </span>
    ),
  },
  {
    key: "unitPrice",
    header: "Unit Price",
    align: "right",
    mobileSlot: "trailing",
    render: (p) => <CurrencyCell value={p.unitPrice} />,
  },
];

/**
 * Out of Stock Table — products with zero inventory.
 */
export const OutOfStockTable = ({ data }: OutOfStockTableProps) => {
  const rows = Array.isArray(data) ? data : [];
  const count = rows.length;

  return (
    <div className='space-y-3'>
      {count > 0 && (
        <div className='flex items-center gap-3 rounded-lg border border-[#F2D2DC] bg-[#FBEFF3] p-3.5'>
          <AlertTriangle className='h-5 w-5 shrink-0 text-[#B3365B]' />
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-[#141413]'>
              {count} product{count > 1 ? "s are" : " is"} currently out of stock
            </p>
            <p className='text-xs text-[#57554D] mt-0.5'>
              Immediate restocking recommended
            </p>
          </div>
        </div>
      )}
      <ReportTable
        columns={columns}
        rows={rows}
        rowKey={(_, i) => i}
        empty={{
          icon: <CheckCircle2 className='h-5 w-5 text-[#1A7F37]' />,
          title: "No Out of Stock Products",
          description: "All products have available inventory",
        }}
        summary={[{ label: "Products Listed", value: count }]}
      />
    </div>
  );
};

export default OutOfStockTable;
