import { ShieldAlert, Shield, Sparkles, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { cn } from "../../lib/utils";
import type { FraudCustomer } from "../../api/fraud";
import {
  EYEBROW_CLASS,
  formatFraudDate,
  getRiskTheme,
} from "../../components/fraud/fraudTheme";
import RiskBadge from "../../components/fraud/RiskBadge";
import BlockedBadge from "../../components/fraud/BlockedBadge";

interface CustomerTableProps {
  customers: FraudCustomer[];
  loading: boolean;
  onView: (customer: FraudCustomer) => void;
  emptyMessage?: string;
}

/** Table of risk-profile customers shared by the Customers tab lists */
const CustomerTable = ({
  customers,
  loading,
  onView,
  emptyMessage = "No customers found",
}: CustomerTableProps) => {
  if (loading) {
    return (
      <div className='space-y-2 px-3 py-3'>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className='h-11 w-full rounded-md' />
        ))}
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center px-4 py-10 text-center'>
        <div className='flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 mb-3'>
          <Sparkles className='w-5 h-5 text-slate-400' />
        </div>
        <div className='text-sm font-semibold text-slate-700 dark:text-slate-200'>
          {emptyMessage}
        </div>
        <p className='mt-1 text-[11px] text-slate-500 dark:text-slate-400'>
          Risk profiles are built from order history — run an analysis to
          populate.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className='hover:bg-transparent'>
          <TableHead className='h-9 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
            Customer
          </TableHead>
          <TableHead className='h-9 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
            Risk
          </TableHead>
          <TableHead className='h-9 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
            Score
          </TableHead>
          <TableHead className='h-9 px-3 hidden md:table-cell text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
            Orders
          </TableHead>
          <TableHead className='h-9 px-3 hidden lg:table-cell text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
            Top flag
          </TableHead>
          <TableHead className='h-9 px-3 hidden lg:table-cell text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
            Last analyzed
          </TableHead>
          <TableHead className='h-9 px-3' />
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => {
          const theme = getRiskTheme(customer.riskLevel);
          const isBlocked =
            customer.manualFraud?.flagged &&
            (!customer.manualFraud.expiresAt ||
              new Date(customer.manualFraud.expiresAt) > new Date());
          const topFlag = customer.fraudFlags?.[0];

          return (
            <TableRow key={customer.phoneNumber} className='border-slate-100 dark:border-slate-700'>
              <TableCell className='px-3 py-2.5'>
                <div className='text-[12px] font-medium text-slate-900 dark:text-slate-100 truncate max-w-[160px]'>
                  {customer.customerName || "Unknown"}
                </div>
                <div className='text-[11px] text-slate-500 dark:text-slate-400 tabular-nums'>
                  {customer.phoneNumber}
                </div>
              </TableCell>
              <TableCell className='px-3 py-2.5'>
                <div className='flex items-center gap-1.5'>
                  <RiskBadge level={customer.riskLevel} compact />
                  {isBlocked ? (
                    <BlockedBadge expiresAt={customer.manualFraud?.expiresAt} />
                  ) : null}
                </div>
              </TableCell>
              <TableCell className='px-3 py-2.5'>
                <div className='flex items-center gap-2'>
                  <div className='h-1.5 w-14 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden'>
                    <div
                      className={cn("h-full rounded-full", theme.barFill)}
                      style={{ width: `${Math.min(100, customer.riskScore)}%` }}
                    />
                  </div>
                  <span className='text-[11px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums'>
                    {customer.riskScore}
                  </span>
                </div>
              </TableCell>
              <TableCell className='px-3 py-2.5 hidden md:table-cell'>
                <div className='text-[11px] text-slate-600 dark:text-slate-300 tabular-nums'>
                  {customer.totalOrders}
                  <span className='text-slate-400'>
                    {" "}
                    ({customer.cancelledOrders} cancel)
                  </span>
                </div>
              </TableCell>
              <TableCell className='px-3 py-2.5 hidden lg:table-cell'>
                {topFlag ? (
                  <span className='inline-flex items-center rounded-full border border-rose-200 bg-rose-50/60 px-2 py-0.5 text-[10px] text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 truncate max-w-[180px]'>
                    {topFlag}
                  </span>
                ) : (
                  <span className='text-[11px] text-slate-400'>—</span>
                )}
              </TableCell>
              <TableCell className='px-3 py-2.5 hidden lg:table-cell'>
                <span className='text-[11px] text-slate-500 dark:text-slate-400'>
                  {formatFraudDate(customer.lastAnalyzedAt)}
                </span>
              </TableCell>
              <TableCell className='px-3 py-2.5 text-right'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onView(customer)}
                  className='h-7 px-2.5 text-[11px] rounded-md gap-1.5 border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300'
                >
                  {customer.riskLevel === "red" ? (
                    <ShieldAlert className='w-3 h-3' />
                  ) : customer.riskLevel === "yellow" ? (
                    <Shield className='w-3 h-3' />
                  ) : (
                    <Clock className='w-3 h-3' />
                  )}
                  View
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

/** Shared pagination footer */
export const TablePagination = ({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) => (
  <div className='flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800'>
    <span className={EYEBROW_CLASS}>
      Page {page + 1} of {Math.max(1, totalPages)}
    </span>
    <div className='flex items-center gap-1.5'>
      <Button
        variant='outline'
        size='sm'
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
        className='h-7 px-2.5 text-[11px] rounded-md border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
      >
        Previous
      </Button>
      <Button
        variant='outline'
        size='sm'
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        className='h-7 px-2.5 text-[11px] rounded-md border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
      >
        Next
      </Button>
    </div>
  </div>
);

export default CustomerTable;
