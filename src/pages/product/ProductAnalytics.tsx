import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  FileType,
  BarChartHorizontalBig,
  ChevronRight,
  Package,
  Layers,
  GitBranch,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Progress } from "../../components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import useRoleCheck from "../auth/hooks/useRoleCheck";
import { getProductSummary } from "../../api/product";
import { errorToast, successToast } from "../../utils/toast";
import {
  downloadPdfFlat,
  downloadPdfGrouped,
  downloadPdfSplit,
  downloadCsvFlat,
  downloadCsvGrouped,
  downloadCsvSplit,
} from "../../utils/productReportExport";
import { CategoryStockSummary, StockSummaryResponse } from "./interface";
import { InventoryReportsSection } from "./components/inventory/InventoryReportsSection";
import MainView from "../../coreComponents/mainView";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatConfig {
  label: string;
  value: number | undefined;
  key: keyof CategoryStockSummary;
  icon: React.ReactNode;
  colorClasses: {
    bg: string;
    icon: string;
    value: string;
    barBg: string;
    bar: string;
  };
}

interface HealthMetric {
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  iconColor: string;
  badge: {
    text: string;
    bg: string;
    text_color: string;
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const LoadingSpinner = () => (
  <div className='bg-white rounded-2xl border border-slate-100 shadow-sm'>
    <div className='flex items-center justify-center py-16'>
      <div className='text-center'>
        <div className='relative mx-auto mb-5 w-12 h-12'>
          <div className='absolute inset-0 rounded-full border-2 border-slate-100' />
          <div className='absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin' />
        </div>
        <p className='text-sm text-slate-500'>Loading analytics…</p>
      </div>
    </div>
  </div>
);

const AccessDenied = () => (
  <div className='flex items-center justify-center h-screen bg-slate-50'>
    <div className='text-center p-8 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-sm'>
      <div className='w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4'>
        <XCircle className='h-6 w-6 text-red-500' />
      </div>
      <h2 className='text-lg font-semibold text-slate-900 mb-1'>
        Access denied
      </h2>
      <p className='text-sm text-slate-500'>
        You don't have permission to view product analytics.
      </p>
    </div>
  </div>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return "0";
  return Number(num) % 1 < 1
    ? Math.floor(num).toLocaleString()
    : num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProductAnalytics = () => {
  const { hasRequiredPermission } = useRoleCheck();
  const [summary, setSummary] = useState<StockSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const getProductSummaryDetails = async () => {
    setIsLoading(true);
    try {
      const response = await getProductSummary();
      if (response?.success) {
        setSummary(response?.data);
      } else {
        errorToast(
          response?.error ?? "Something went wrong. Please try again",
          "top-center",
        );
        setSummary(null);
      }
    } catch {
      errorToast("Failed to load analytics data", "top-center");
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProductSummaryDetails();
  }, []);

  // ── Download handlers ──────────────────────────────────────────────────────

  const handleReportDownload = async (
    downloadFunction: () => Promise<any>,
    reportName: string,
  ) => {
    setIsDownloadingReport(true);
    try {
      const result = await downloadFunction();
      if (result.success) {
        successToast(`${reportName} downloaded successfully`, "top-center");
      } else {
        errorToast(
          result.error || "Failed to download report. Please try again.",
          "top-center",
        );
      }
    } catch (error: any) {
      errorToast(error.message || "An unexpected error occurred", "top-center");
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleDownloadPdfFlat = () =>
    handleReportDownload(() => downloadPdfFlat(null, false), "PDF (Flat)");
  const handleDownloadPdfGrouped = () =>
    handleReportDownload(
      () => downloadPdfGrouped(null, false),
      "PDF (Grouped)",
    );
  const handleDownloadPdfSplit = () =>
    handleReportDownload(() => downloadPdfSplit(null, false), "PDF (Split)");
  const handleDownloadCsvFlat = () =>
    handleReportDownload(() => downloadCsvFlat(null, false), "CSV (Flat)");
  const handleDownloadCsvGrouped = () =>
    handleReportDownload(
      () => downloadCsvGrouped(null, false),
      "CSV (Grouped)",
    );
  const handleDownloadCsvSplit = () =>
    handleReportDownload(() => downloadCsvSplit(null, false), "CSV (Split)");

  // ── Config ─────────────────────────────────────────────────────────────────

  const statsData: StatConfig[] = [
    {
      label: "Active products",
      value: summary?.totalActiveProductType,
      key: "totalActiveProducts",
      icon: <Package className='h-4 w-4' />,
      colorClasses: {
        bg: "bg-blue-50",
        icon: "text-blue-600",
        value: "text-blue-700",
        barBg: "bg-blue-100",
        bar: "bg-blue-500",
      },
    },
    {
      label: "Total stock",
      value: summary?.totalActiveProducts,
      key: "totalStock",
      icon: <Layers className='h-4 w-4' />,
      colorClasses: {
        bg: "bg-emerald-50",
        icon: "text-emerald-600",
        value: "text-emerald-700",
        barBg: "bg-emerald-100",
        bar: "bg-emerald-500",
      },
    },
    {
      label: "Variations",
      value: summary?.totalActiveProductVariations,
      key: "totalVariants",
      icon: <GitBranch className='h-4 w-4' />,
      colorClasses: {
        bg: "bg-violet-50",
        icon: "text-violet-600",
        value: "text-violet-700",
        barBg: "bg-violet-100",
        bar: "bg-violet-500",
      },
    },
    {
      label: "Total value",
      value: summary?.totalActiveProductPrice,
      key: "totalPrice",
      icon: <DollarSign className='h-4 w-4' />,
      colorClasses: {
        bg: "bg-amber-50",
        icon: "text-amber-600",
        value: "text-amber-700",
        barBg: "bg-amber-100",
        bar: "bg-amber-500",
      },
    },
  ];

  const healthMetrics: HealthMetric[] = [
    {
      label: "Healthy stock",
      value: 1104,
      unit: "products",
      icon: <CheckCircle2 className='h-5 w-5' />,
      iconColor: "text-emerald-500",
      badge: {
        text: "86% of total",
        bg: "bg-emerald-50",
        text_color: "text-emerald-700",
      },
    },
    {
      label: "Low stock",
      value: 147,
      unit: "products",
      icon: <AlertTriangle className='h-5 w-5' />,
      iconColor: "text-amber-500",
      badge: {
        text: "Needs reorder",
        bg: "bg-amber-50",
        text_color: "text-amber-700",
      },
    },
    {
      label: "Out of stock",
      value: 33,
      unit: "products",
      icon: <XCircle className='h-5 w-5' />,
      iconColor: "text-red-500",
      badge: { text: "Urgent", bg: "bg-red-50", text_color: "text-red-700" },
    },
    {
      label: "Pending restock",
      value: 58,
      unit: "items",
      icon: <RefreshCw className='h-5 w-5' />,
      iconColor: "text-blue-500",
      badge: {
        text: "In transit",
        bg: "bg-blue-50",
        text_color: "text-blue-700",
      },
    },
    {
      label: "Fast movers",
      value: 219,
      unit: "products",
      icon: <TrendingUp className='h-5 w-5' />,
      iconColor: "text-violet-500",
      badge: {
        text: "Top sellers",
        bg: "bg-violet-50",
        text_color: "text-violet-700",
      },
    },
    {
      label: "Slow movers",
      value: 91,
      unit: "products",
      icon: <Clock className='h-5 w-5' />,
      iconColor: "text-slate-400",
      badge: {
        text: "Review needed",
        bg: "bg-slate-100",
        text_color: "text-slate-600",
      },
    },
  ];

  // ── Renders ────────────────────────────────────────────────────────────────

  const renderStatCards = () => (
    <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
      {statsData.map((stat) => (
        <div
          key={stat.key}
          className='bg-white rounded-2xl border border-slate-100 px-4 py-4 flex items-center gap-3 hover:border-slate-200 transition-colors'>
          <div
            className={`w-9 h-9 rounded-xl ${stat.colorClasses.bg} flex items-center justify-center flex-shrink-0`}>
            <span className={stat.colorClasses.icon}>{stat.icon}</span>
          </div>
          <div className='min-w-0'>
            <p
              className={`text-xl font-semibold ${stat.colorClasses.value} leading-none tabular-nums`}>
              {formatNumber(stat.value)}
            </p>
            <p className='text-xs text-slate-400 mt-1 truncate'>{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCategoryRows = () => {
    if (!summary?.categories || summary.categories.length === 0) {
      return (
        <p className='text-sm text-slate-400 py-6 text-center'>
          No category data available
        </p>
      );
    }

    const barColors = [
      "bg-blue-500",
      "bg-violet-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-teal-500",
    ];

    return (
      <div className='space-y-4'>
        {summary.categories.map((cat: CategoryStockSummary, i: number) => {
          const value = cat.totalStock as number;
          const total = summary.totalActiveProducts ?? 1;
          const pct = ((value / total) * 100).toFixed(1);
          return (
            <div key={i} className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-slate-700 uppercase tracking-wide'>
                  {cat.categoryName}
                </span>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-slate-400'>{pct}%</span>
                  <span className='text-sm font-semibold text-slate-900 tabular-nums'>
                    {formatNumber(value)}
                  </span>
                </div>
              </div>
              <div className='h-1.5 bg-slate-100 rounded-full overflow-hidden'>
                <div
                  className={`h-full rounded-full ${barColors[i % barColors.length]} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCategoryBreakdown = () => {
    if (!summary?.categories || summary.categories.length === 0) return null;

    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant='outline'
            className='w-full sm:w-auto rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm'>
            <BarChartHorizontalBig className='h-4 w-4 mr-2 text-slate-400' />
            Full category breakdown
            <ChevronRight className='h-4 w-4 ml-1 text-slate-400' />
          </Button>
        </SheetTrigger>
        <SheetContent className='w-full sm:max-w-2xl'>
          <SheetHeader className='mb-6'>
            <SheetTitle className='flex items-center gap-2 text-slate-900'>
              <BarChartHorizontalBig className='h-5 w-5 text-indigo-500' />
              Category breakdown
            </SheetTitle>
            <SheetDescription className='text-slate-500'>
              Distribution of products across all categories
            </SheetDescription>
          </SheetHeader>

          <div className='space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto pr-1'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {statsData.map(({ label, value, key }, statIdx) => (
                <div key={statIdx}>
                  <h4 className='text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4'>
                    {label}
                  </h4>
                  <div className='space-y-4'>
                    {summary?.categories?.map(
                      (cat: CategoryStockSummary, i: number) => {
                        const catVal = cat[key] as number;
                        const pct = (
                          ((catVal ?? 0) / (value ?? 1)) *
                          100
                        ).toFixed(1);
                        return (
                          <div key={i} className='space-y-1.5'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm font-medium text-slate-700 uppercase tracking-wide'>
                                {cat.categoryName}
                              </span>
                              <div className='flex items-center gap-2'>
                                <span className='text-xs text-slate-400'>
                                  {pct}%
                                </span>
                                <span className='text-sm font-semibold text-slate-900 tabular-nums'>
                                  {formatNumber(catVal)}
                                </span>
                              </div>
                            </div>
                            <Progress
                              value={parseFloat(pct)}
                              className='h-1.5'
                            />
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  };

  const renderHealthGrid = () => (
    <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
      {healthMetrics.map((metric, i) => (
        <div
          key={i}
          className='bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors'>
          <span className={`${metric.iconColor} block mb-3`}>
            {metric.icon}
          </span>
          <p className='text-xs text-slate-500 mb-1'>{metric.label}</p>
          <p className='text-xl font-semibold text-slate-900 tabular-nums leading-none'>
            {metric.value.toLocaleString()}
            <span className='text-sm font-normal text-slate-400 ml-1'>
              {metric.unit}
            </span>
          </p>
          <span
            className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${metric.badge.bg} ${metric.badge.text_color}`}>
            {metric.badge.text}
          </span>
        </div>
      ))}
    </div>
  );

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!hasRequiredPermission("product", "summary")) {
    return <AccessDenied />;
  }

  // ── Page ───────────────────────────────────────────────────────────────────

  return (
    <MainView title='Product Analytics'>
      <div className='min-h-screen bg-slate-50/70'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5'>
          {/* Header */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div className='flex items-center gap-3.5'>
              <div className='w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-indigo-200'>
                <BarChartHorizontalBig className='h-5 w-5 text-white' />
              </div>
              <div>
                <h1 className='text-lg font-semibold text-slate-900 leading-tight'>
                  Product analytics
                </h1>
                <p className='text-sm text-slate-400 mt-0.5'>
                  Inventory and performance overview
                </p>
              </div>
            </div>

            {/* Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={isDownloadingReport}
                  className='inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 shadow-sm'>
                  {isDownloadingReport ? (
                    <span className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent' />
                  ) : (
                    <Download className='h-3.5 w-3.5' />
                  )}
                  Export report
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-52 rounded-xl shadow-lg border-slate-100'>
                <DropdownMenuLabel className='text-xs text-slate-400 font-medium'>
                  Product reports
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuLabel className='text-xs text-slate-400'>
                  PDF format
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={handleDownloadPdfFlat}
                  className='rounded-lg'>
                  <FileText className='mr-2 h-4 w-4 text-slate-400' />
                  Flat
                  <span className='ml-auto text-xs text-slate-400'>
                    All items
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDownloadPdfGrouped}
                  className='rounded-lg'>
                  <FileText className='mr-2 h-4 w-4 text-slate-400' />
                  Grouped
                  <span className='ml-auto text-xs text-slate-400'>
                    Organised
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDownloadPdfSplit}
                  className='rounded-lg'>
                  <FileText className='mr-2 h-4 w-4 text-slate-400' />
                  Split
                  <span className='ml-auto text-xs text-slate-400'>
                    Sections
                  </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className='text-xs text-slate-400'>
                  CSV format
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={handleDownloadCsvFlat}
                  className='rounded-lg'>
                  <FileType className='mr-2 h-4 w-4 text-slate-400' />
                  Flat
                  <span className='ml-auto text-xs text-slate-400'>
                    All items
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDownloadCsvGrouped}
                  className='rounded-lg'>
                  <FileType className='mr-2 h-4 w-4 text-slate-400' />
                  Grouped
                  <span className='ml-auto text-xs text-slate-400'>
                    Organised
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDownloadCsvSplit}
                  className='rounded-lg'>
                  <FileType className='mr-2 h-4 w-4 text-slate-400' />
                  Split
                  <span className='ml-auto text-xs text-slate-400'>
                    Sections
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Body */}
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Stats strip */}
              {renderStatCards()}

              {/* Category card */}
              <div className='bg-white rounded-2xl border border-slate-100 p-5'>
                <div className='flex items-start justify-between gap-4 mb-5'>
                  <div>
                    <h2 className='text-sm font-semibold text-slate-900'>
                      Category breakdown
                    </h2>
                    <p className='text-xs text-slate-400 mt-0.5'>
                      Inventory distributed across product categories
                    </p>
                  </div>
                  {renderCategoryBreakdown()}
                </div>
              </div>

              {/* Inventory health */}
              <div className='bg-white rounded-2xl border border-slate-100 p-5'>
                <div className='mb-5'>
                  <h2 className='text-sm font-semibold text-slate-900'>
                    Inventory health
                  </h2>
                  <p className='text-xs text-slate-400 mt-0.5'>
                    Real-time stock status across all product lines
                  </p>
                </div>
                {renderHealthGrid()}
              </div>

              {/* Advanced reports */}
              <div className='bg-white rounded-2xl border border-slate-100 p-5'>
                <div className='mb-5'>
                  <h2 className='text-sm font-semibold text-slate-900'>
                    Inventory reports
                  </h2>
                  <p className='text-xs text-slate-400 mt-0.5'>
                    Detailed reports and advanced analytics
                  </p>
                </div>
                <InventoryReportsSection />
              </div>
            </>
          )}
        </div>
      </div>
    </MainView>
  );
};

export default ProductAnalytics;
