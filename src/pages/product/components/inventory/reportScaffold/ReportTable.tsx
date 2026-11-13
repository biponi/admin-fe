/**
 * Generic report table scaffold.
 *
 * Desktop (md+): claude-themed shadcn Table in a single scroll container —
 * horizontal scroll happens inside the card, never on the page.
 * Mobile (<md): cards derived from each column's `mobileSlot`, so wide
 * tables never clip or overlap on phones.
 *
 * Every report table is a column config + this component.
 */
import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";
import { claude } from "../../../../../lib/claude";import { cn } from "../../../../../lib/utils";
import { ReportEmptyState, ReportSkeletonRows } from "./ReportStates";

export interface ReportColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  /** min-width hint only (e.g. "min-w-[140px]") — never percentage widths */
  widthClass?: string;
  /** where this column lands on the derived mobile card */
  mobileSlot?: "title" | "meta" | "trailing" | "hidden";
  render: (row: T, index: number) => ReactNode;
}

export interface ReportSummaryItem {
  label: string;
  value: ReactNode;
}

export interface ReportEmptyConfig {
  icon?: ReactNode;
  title: string;
  description: string;
}

interface ReportTableProps<T> {
  columns: ReportColumn<T>[];
  rows: T[] | undefined;
  rowKey: (row: T, index: number) => string | number;
  loading?: boolean;
  empty?: ReportEmptyConfig;
  /** footer chips row, e.g. server-computed totals */
  summary?: ReportSummaryItem[];
  /** override the derived mobile card for a row */
  renderMobileCard?: (row: T, index: number) => ReactNode;
  /** vertical cap for the desktop scroll region */
  bodyMaxClass?: string;
  className?: string;
}

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

export function ReportTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  empty,
  summary,
  renderMobileCard,
  bodyMaxClass = "max-h-[60vh]",
  className,
}: ReportTableProps<T>) {
  // Defensive: tolerate a non-array payload (e.g. `{}` from the API)
  const data = Array.isArray(rows) ? rows : [];

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={className}>
        <ReportSkeletonRows rows={6} />
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <div className={className}>
        <ReportEmptyState
          icon={empty?.icon}
          title={empty?.title ?? "No data available"}
          description={
            empty?.description ?? "There is nothing to show for this report yet."
          }
        />
      </div>
    );
  }

  const titleCol = columns.find((c) => c.mobileSlot === "title");
  const trailingCol = columns.find((c) => c.mobileSlot === "trailing");
  const metaCols = columns.filter((c) => c.mobileSlot === "meta" || !c.mobileSlot);

  return (
    <div className={cn("space-y-0", className)}>
      {/* ── Desktop table ──────────────────────────────────────────────────── */}
      <div className={cn("hidden md:block rounded-lg border border-[#E8E4DC] overflow-hidden bg-white")}>
        <div className={cn("overflow-auto", bodyMaxClass)}>
          <Table>
            <TableHeader>
              <TableRow className='bg-[#FAF9F6] hover:bg-[#FAF9F6] border-b border-[#E8E4DC]'>
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      claude.microLabel,
                      "px-3 py-2.5 whitespace-nowrap",
                      alignClass[col.align ?? "left"],
                      col.widthClass,
                    )}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow
                  key={rowKey(row, i)}
                  className='border-b border-[#E8E4DC] last:border-0 hover:bg-[#F5F1EA] transition-colors'>
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "px-3 py-2.5 text-[13px] whitespace-nowrap",
                        alignClass[col.align ?? "left"],
                      )}>
                      {col.render(row, i)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {summary && summary.length > 0 && (
          <div className='border-t border-[#E8E4DC] bg-[#FAF9F6] px-4 py-2.5'>
            <div className='flex flex-wrap gap-x-6 gap-y-1'>
              {summary.map((item) => (
                <span key={item.label} className='text-xs text-[#57554D]'>
                  {item.label}:{" "}
                  <span className='font-semibold text-[#141413] tabular-nums'>
                    {item.value}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile cards ───────────────────────────────────────────────────── */}
      <div className='md:hidden space-y-2'>
        {data.map((row, i) =>
          renderMobileCard ? (
            <div key={rowKey(row, i)}>{renderMobileCard(row, i)}</div>
          ) : (
            <div
              key={rowKey(row, i)}
              className={cn(claude.card, "px-4 py-3 space-y-2")}>
              <div className='flex items-start justify-between gap-3'>
                <span className='text-sm font-medium text-[#141413] leading-snug break-words min-w-0'>
                  {titleCol ? titleCol.render(row, i) : null}
                </span>
                {trailingCol && (
                  <span className='shrink-0 text-sm tabular-nums'>
                    {trailingCol.render(row, i)}
                  </span>
                )}
              </div>
              <div className='grid grid-cols-2 gap-x-4 gap-y-1.5'>
                {metaCols
                  .filter((c) => c !== titleCol && c !== trailingCol)
                  .map((c) => (
                    <div key={c.key} className='min-w-0'>
                      <p className='text-[10px] font-semibold uppercase tracking-wider text-[#8A877D]'>
                        {c.header}
                      </p>
                      <div className='text-[13px] text-[#141413] break-words'>
                        {c.render(row, i)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ),
        )}

        {summary && summary.length > 0 && (
          <div className={cn(claude.panel, "px-4 py-2.5")}>
            <div className='flex flex-wrap gap-x-5 gap-y-1'>
              {summary.map((item) => (
                <span key={item.label} className='text-xs text-[#57554D]'>
                  {item.label}:{" "}
                  <span className='font-semibold text-[#141413] tabular-nums'>
                    {item.value}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Standalone summary footer (used by non-table reports). */
export const ReportSummaryFooter = ({ items }: { items: ReportSummaryItem[] }) => (
  <div className={cn(claude.panel, "px-4 py-2.5")}>
    <div className='flex flex-wrap gap-x-5 gap-y-1'>
      {items.map((item) => (
        <span key={item.label} className='text-xs text-[#57554D]'>
          {item.label}:{" "}
          <span className='font-semibold text-[#141413] tabular-nums'>
            {item.value}
          </span>
        </span>
      ))}
    </div>
  </div>
);

export default ReportTable;
