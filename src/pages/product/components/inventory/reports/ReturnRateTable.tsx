import { CheckCircle2, AlertTriangle } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import { ReportStatTiles } from "../reportScaffold/ReportStatTiles";
import {
  MonoCell,
  NumberCell,
  PercentCell,
  ProductNameCell,
  ToneBadge,
} from "../reportScaffold/reportCells";
import { formatNumber, formatPercentage } from "../../../../../utils/inventoryReportUtils";
import { ReturnRateProduct } from "../../../../../api/inventoryReport";

interface ReturnRateTableProps {
  data: ReturnRateProduct[];
  summary?: Record<string, any>;
}

/** Severity tone by return rate (reserved status colors, icon + label). */
const severity = (rate: number) => {
  if (rate <= 5) return { tone: "good" as const, label: "Good" };
  if (rate <= 10) return { tone: "warn" as const, label: "Moderate" };
  if (rate <= 15) return { tone: "warn" as const, label: "High" };
  return { tone: "bad" as const, label: "Critical" };
};

/**
 * Return Rate Table — products with the highest return rates.
 */
export const ReturnRateTable = ({ data, summary }: ReturnRateTableProps) => {
  const rows = Array.isArray(data) ? data : [];
  const totalReturns = rows.reduce((sum, p) => sum + p.totalReturned, 0);
  // Server-side aggregate rate (units returned / units sold over the whole
  // dataset) — a page-local mean of row rates is statistically wrong
  const avgReturnRate = summary?.averageReturnRate ?? 0;
  const highReturnCount = rows.filter((p) => p.returnRate > 15).length;

  const columns: ReportColumn<ReturnRateProduct>[] = [
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
      header: "Units Sold",
      align: "right",
      render: (p) => <NumberCell value={p.totalSold} />,
    },
    {
      key: "returned",
      header: "Returned",
      align: "right",
      mobileSlot: "meta",
      render: (p) => <NumberCell value={p.totalReturned} />,
    },
    {
      key: "rate",
      header: "Return Rate",
      align: "right",
      mobileSlot: "trailing",
      render: (p) => <PercentCell value={p.returnRate} />,
    },
    {
      key: "severity",
      header: "Severity",
      align: "center",
      mobileSlot: "meta",
      render: (p) => {
        const s = severity(p.returnRate);
        return <ToneBadge tone={s.tone}>{s.label}</ToneBadge>;
      },
    },
  ];

  return (
    <div className='space-y-3'>
      {highReturnCount > 0 && (
        <div className='flex items-center gap-3 rounded-lg border border-[#F2D2DC] bg-[#FBEFF3] p-3.5'>
          <AlertTriangle className='h-5 w-5 shrink-0 text-[#B3365B]' />
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-[#141413]'>
              {highReturnCount} product{highReturnCount > 1 ? "s have" : " has"}{" "}
              critically high return rates
            </p>
            <p className='text-xs text-[#57554D] mt-0.5'>
              Products with return rates above 15% require immediate attention
            </p>
          </div>
        </div>
      )}
      <ReportStatTiles
        tiles={[
          {
            label: "Highest return rate",
            value: formatPercentage(rows[0]?.returnRate ?? 0),
            tone: rows.length && rows[0].returnRate > 15 ? "bad" : "neutral",
          },
          { label: "Total returns", value: formatNumber(totalReturns) },
          {
            label: "Avg return rate",
            value: formatPercentage(avgReturnRate),
            sub: "whole dataset",
          },
        ]}
      />
      <ReportTable
        columns={columns}
        rows={rows}
        rowKey={(_, i) => i}
        empty={{
          icon: <CheckCircle2 className='h-5 w-5 text-[#1A7F37]' />,
          title: "No Returns",
          description: "No product returns recorded",
        }}
        summary={[{ label: "Products", value: rows.length }]}
      />
    </div>
  );
};

export default ReturnRateTable;
