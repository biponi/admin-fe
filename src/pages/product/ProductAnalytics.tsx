import { useEffect, useState } from "react";
import {
  Package,
  Archive,
  Activity,
  TrendingUp,
  Download,
  FileText,
  FileType,
  BarChartHorizontalBig,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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

/**
 * Product Analytics Page
 * Displays comprehensive product inventory analytics with export functionality
 */
const ProductAnalytics = () => {
  const { hasRequiredPermission } = useRoleCheck();

  // State
  const [summary, setSummary] = useState<StockSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  // Fetch product summary
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
    } catch (error) {
      errorToast("Failed to load analytics data", "top-center");
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Format number for display
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return "0";
    return Number(num) % 1 < 1
      ? Math.floor(num).toLocaleString()
      : num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  // Report download handlers
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
    handleReportDownload(
      () => downloadPdfFlat(null, false),
      "PDF Report (Flat)",
    );

  const handleDownloadPdfGrouped = () =>
    handleReportDownload(
      () => downloadPdfGrouped(null, false),
      "PDF Report (Grouped)",
    );

  const handleDownloadPdfSplit = () =>
    handleReportDownload(
      () => downloadPdfSplit(null, false),
      "PDF Report (Split)",
    );

  const handleDownloadCsvFlat = () =>
    handleReportDownload(
      () => downloadCsvFlat(null, false),
      "CSV Report (Flat)",
    );

  const handleDownloadCsvGrouped = () =>
    handleReportDownload(
      () => downloadCsvGrouped(null, false),
      "CSV Report (Grouped)",
    );

  const handleDownloadCsvSplit = () =>
    handleReportDownload(
      () => downloadCsvSplit(null, false),
      "CSV Report (Split)",
    );

  // Card data configuration
  const cardData = [
    {
      title: "Active Products",
      total: summary?.totalActiveProductType,
      key: "totalActiveProducts",
      description: "Products currently available for sale",
      icon: <Package className='h-8 w-8' />,
      gradient: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
    },
    {
      title: "Total Stock",
      total: summary?.totalActiveProducts,
      key: "totalStock",
      description: "Total quantity across all products",
      icon: <Archive className='h-8 w-8' />,
      gradient: "from-green-50 to-green-100",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      textColor: "text-green-700",
    },
    {
      title: "Product Variations",
      total: summary?.totalActiveProductVariations,
      key: "totalVariants",
      description: "Different variants available",
      icon: <Activity className='h-8 w-8' />,
      gradient: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
    },
    {
      title: "Total Value",
      total: summary?.totalActiveProductPrice,
      key: "totalPrice",
      description: "Combined inventory valuation",
      icon: <TrendingUp className='h-8 w-8' />,
      gradient: "from-amber-50 to-amber-100",
      borderColor: "border-amber-200",
      iconColor: "text-amber-600",
      textColor: "text-amber-700",
    },
  ];

  // Render detailed category breakdown in a sheet
  const renderCategoryBreakdown = () => {
    return (
      <>
        {/* Category Breakdown Button */}
        {summary?.categories && summary.categories.length > 0 && (
          <div className='flex justify-center lg:justify-start'>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='outline' className='w-full lg:w-auto'>
                  <BarChartHorizontalBig className='h-4 w-4 mr-2' />
                  View Category Breakdown
                  <ChevronRight className='h-4 w-4 ml-2' />
                </Button>
              </SheetTrigger>
              <SheetContent className='w-full sm:max-w-2xl'>
                <SheetHeader>
                  <SheetTitle className='flex items-center space-x-2'>
                    <BarChartHorizontalBig className='h-5 w-5 text-gray-600' />
                    <span>Category Breakdown</span>
                  </SheetTitle>
                  <SheetDescription>
                    Distribution of products across different categories
                  </SheetDescription>
                </SheetHeader>
                <div className='mt-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto'>
                  <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    {cardData.map(({ title, total, key }, cardIndex) => (
                      <div key={cardIndex} className='space-y-4'>
                        <h4 className='text-lg font-semibold text-gray-700 border-b pb-2 uppercase'>
                          {title}
                        </h4>
                        <div className='space-y-3'>
                          {!summary || !summary.categories ? (
                            <div className='flex justify-center items-center p-6 text-gray-500'>
                              No category data available
                            </div>
                          ) : (
                            summary.categories.map(
                              (res: CategoryStockSummary, index: number) => (
                                <div
                                  key={index}
                                  className='space-y-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
                                  <div className='flex items-center justify-between'>
                                    <span className='text-sm font-medium text-gray-700 truncate uppercase'>
                                      {res.categoryName}
                                    </span>
                                    <span className='text-sm font-bold text-gray-900'>
                                      {formatNumber(
                                        res[
                                          key as keyof CategoryStockSummary
                                        ] as number,
                                      )}
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      ((res[
                                        key as keyof CategoryStockSummary
                                      ] as number) /
                                        (total ?? 1)) *
                                      100
                                    }
                                    className='h-2'
                                  />
                                  <div className='text-xs text-gray-500'>
                                    {(
                                      ((res[
                                        key as keyof CategoryStockSummary
                                      ] as number) /
                                        (total ?? 1)) *
                                      100
                                    ).toFixed(1)}
                                    % of total
                                  </div>
                                </div>
                              ),
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </>
    );
  };

  // Render summary cards with enhanced UX
  const renderSummaryCards = () => {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
        {cardData.map((card) => (
          <Card
            key={card.key}
            className='group relative overflow-hidden border border-gray-200 bg-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer'>
            {/* Subtle gradient overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
            />

            <CardHeader className='pb-4 relative z-10'>
              <div className='flex items-start justify-between gap-3'>
                {/* Icon container with modern styling */}
                <div
                  className={`flex-shrink-0 flex justify-center items-center p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
                  <div className={`${card.iconColor} w-8 h-8`}>{card.icon}</div>
                </div>

                {/* Count badge with better positioning */}
                <div className='flex flex-col items-end'>
                  <span
                    className={`text-2xl font-bold ${card.textColor} tabular-nums`}>
                    {formatNumber(card.total)}
                  </span>
                  <div
                    className={`h-1 w-12 rounded-full bg-gradient-to-r ${card.gradient} mt-1 group-hover:w-16 transition-all duration-300`}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className='relative z-10 pt-0'>
              <CardTitle className='text-base font-semibold text-gray-900 mb-1.5 group-hover:text-gray-950 transition-colors'>
                {card.title}
              </CardTitle>
              <CardDescription className='text-sm text-gray-600 leading-relaxed'>
                {card.description}
              </CardDescription>
            </CardContent>

            {/* Decorative corner accent */}
            <div
              className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
            />
          </Card>
        ))}
      </div>
    );
  };
  useEffect(() => {
    getProductSummaryDetails();
  }, []);

  if (!hasRequiredPermission("product", "summary")) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Access Denied
          </h2>
          <p className='text-gray-600'>
            You don't have permission to view product analytics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Product Analytics
          </h1>
          <p className='text-gray-600 mt-1'>
            Comprehensive overview of your inventory and performance metrics
          </p>
        </div>

        {/* Export Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='lg'
              disabled={isDownloadingReport}
              className='flex items-center space-x-2'>
              <Download className='h-4 w-4' />
              <span>Export Report</span>
              {isDownloadingReport && (
                <span className='ml-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>Product Reports</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* PDF Reports */}
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              PDF Format
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={handleDownloadPdfFlat}>
              <FileText className='mr-2 h-4 w-4' />
              <span>Flat Version</span>
              <span className='ml-auto text-xs text-muted-foreground'>
                All items
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadPdfGrouped}>
              <FileText className='mr-2 h-4 w-4' />
              <span>Grouped Version</span>
              <span className='ml-auto text-xs text-muted-foreground'>
                Organized
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadPdfSplit}>
              <FileText className='mr-2 h-4 w-4' />
              <span>Split Version</span>
              <span className='ml-auto text-xs text-muted-foreground'>
                Sections
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* CSV Reports */}
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              CSV Format
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={handleDownloadCsvFlat}>
              <FileType className='mr-2 h-4 w-4' />
              <span>Flat Version</span>
              <span className='ml-auto text-xs text-muted-foreground'>
                All items
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadCsvGrouped}>
              <FileType className='mr-2 h-4 w-4' />
              <span>Grouped Version</span>
              <span className='ml-auto text-xs text-muted-foreground'>
                Organized
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadCsvSplit}>
              <FileType className='mr-2 h-4 w-4' />
              <span>Split Version</span>
              <span className='ml-auto text-xs text-muted-foreground'>
                Sections
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <CardContent className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4' />
              <p className='text-gray-600'>Loading analytics...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          {renderSummaryCards()}

          {/* Category Breakdown Section */}
          <Card>
            <CardHeader>
              <CardTitle className='text-xl font-bold text-gray-900'>
                Category Breakdown
              </CardTitle>
              <CardDescription>
                Inventory distribution across product categories
              </CardDescription>
            </CardHeader>
            <CardContent>{renderCategoryBreakdown()}</CardContent>
          </Card>

          {/* Advanced Inventory Reports Section */}
          <InventoryReportsSection />
        </>
      )}
    </div>
  );
};

export default ProductAnalytics;
