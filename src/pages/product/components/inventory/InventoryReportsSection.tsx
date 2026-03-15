import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Filter,
  RefreshCw,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../components/ui/collapsible";
import {
  REPORT_TYPES,
  REPORT_CATEGORIES,
} from "../../../../utils/inventoryReportUtils";
import { ReportType } from "../../../../api/inventoryReport";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import {
  useInventoryReport,
  invalidateInventoryReportCache,
} from "../../../../hooks/useInventoryReport";
import { InventorySummaryCards } from "./reports/InventorySummaryCards";
import { LowStockTable } from "./reports/LowStockTable";
import { OutOfStockTable } from "./reports/OutOfStockTable";
import { InventoryDistributionChart } from "./reports/InventoryDistributionChart";
import { TopSellingTable } from "./reports/TopSellingTable";
import { SalesActivityTable } from "./reports/SalesActivityTable";
import { ReturnRateTable } from "./reports/ReturnRateTable";
import { DeadStockTable } from "./reports/DeadStockTable";
import { TopRatedTable } from "./reports/TopRatedTable";
import { RatingDistributionChart } from "./reports/RatingDistributionChart";
import { DiscountedProductsTable } from "./reports/DiscountedProductsTable";
import { HighestDiscountTable } from "./reports/HighestDiscountTable";
import { PriceDistributionChart } from "./reports/PriceDistributionChart";
import { CategoryPerformanceTable } from "./reports/CategoryPerformanceTable";
import { ManufacturerReportTable } from "./reports/ManufacturerReportTable";
import { RecentlyAddedTable } from "./reports/RecentlyAddedTable";
import { RecentlyUpdatedTable } from "./reports/RecentlyUpdatedTable";
import {
  InventorySummary,
  LowStockProduct,
  OutOfStockProduct,
  InventoryDistribution,
  TopSellingProduct,
  SalesActivityProduct,
  ReturnRateProduct,
  DeadStockProduct,
  TopRatedProduct,
  RatingDistribution,
  DiscountedProduct,
  HighestDiscountProduct,
  PriceDistribution,
  CategoryPerformance,
  ManufacturerReport,
  RecentlyAddedProduct,
  RecentlyUpdatedProduct,
} from "../../../../api/inventoryReport";

/**
 * Inventory Reports Section
 * Split layout: Report types on left (scrollable), Report display on right
 */
export const InventoryReportsSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReport, setSelectedReport] =
    useState<ReportType>("inventory-summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["INVENTORY_HEALTH"]),
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousReportType, setPreviousReportType] =
    useState<ReportType>("inventory-summary");

  // Memoize params to prevent unnecessary re-renders
  const reportParams = useMemo(
    () => ({
      type: selectedReport,
      page: 1,
      limit: 20,
    }),
    [selectedReport],
  );

  // Fetch report data using custom hook
  const { data, loading, error, refetch } = useInventoryReport(reportParams, {
    enabled: isOpen, // Only fetch when section is open
  });

  // Refetch data when report type changes
  useEffect(() => {
    if (isOpen && selectedReport !== previousReportType) {
      setIsTransitioning(true);

      // Invalidate cache for both old and new report types
      invalidateInventoryReportCache(selectedReport);
      invalidateInventoryReportCache(previousReportType);

      // Fetch new data
      refetch().finally(() => {
        setPreviousReportType(selectedReport);
        setIsTransitioning(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport, isOpen]);

  // Toggle category expansion
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  // Filter report types by search
  const filteredReportTypes = Object.entries(REPORT_TYPES).filter(
    ([_, report]) => {
      if (!searchQuery) return true;
      return (
        report.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
  );

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Render appropriate report component based on selected report type
  const renderReportContent = () => {
    // Loading state (including transition state)
    if (loading || isTransitioning) {
      return (
        <div className='flex flex-col items-center justify-center h-full py-16'>
          <Loader2 className='h-12 w-12 text-indigo-600 animate-spin mb-4' />
          <p className='text-gray-600 font-medium'>Loading report data...</p>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className='flex flex-col items-center justify-center h-full py-16 text-center'>
          <div className='p-4 rounded-full bg-red-50 mb-4'>
            <AlertCircle className='h-12 w-12 text-red-600' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            Error Loading Report
          </h3>
          <p className='text-sm text-gray-600 mb-4'>{error}</p>
          <Button variant='outline' onClick={handleRefresh} className='gap-2'>
            <RefreshCw className='h-4 w-4' />
            Try Again
          </Button>
        </div>
      );
    }

    // No data state
    if (!data || !data.data) {
      return (
        <div className='flex flex-col items-center justify-center h-full py-16 text-center'>
          <div className='p-4 rounded-full bg-gray-50 mb-4'>
            <Filter className='h-12 w-12 text-gray-400' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 mb-2'>
            No Data Available
          </h3>
          <p className='text-sm text-gray-600'>
            Unable to load report data. Please try again.
          </p>
        </div>
      );
    }

    const reportData = data.data;

    // Render report based on type
    switch (previousReportType) {
      case "inventory-summary":
        return (
          <InventorySummaryCards
            data={reportData?.summary as unknown as InventorySummary}
          />
        );

      case "low-stock":
        return (
          <LowStockTable
            data={reportData?.data as unknown as LowStockProduct[]}
          />
        );

      case "out-of-stock":
        return (
          <OutOfStockTable
            data={reportData?.data as unknown as OutOfStockProduct[]}
          />
        );

      case "inventory-distribution":
        return (
          <InventoryDistributionChart
            data={reportData?.data as unknown as InventoryDistribution[]}
          />
        );

      case "top-selling":
        return (
          <TopSellingTable
            data={reportData?.data as unknown as TopSellingProduct[]}
          />
        );

      case "sales-activity":
        return (
          <SalesActivityTable
            data={reportData?.data as unknown as SalesActivityProduct[]}
          />
        );

      case "return-rate":
        return (
          <ReturnRateTable
            data={reportData?.data as unknown as ReturnRateProduct[]}
          />
        );

      case "dead-stock":
        return (
          <DeadStockTable
            data={reportData?.data as unknown as DeadStockProduct[]}
          />
        );

      case "top-rated":
        return (
          <TopRatedTable
            data={reportData?.data as unknown as TopRatedProduct[]}
          />
        );

      case "rating-distribution":
        return (
          <RatingDistributionChart
            data={reportData?.data as unknown as RatingDistribution[]}
          />
        );

      case "discounted-products":
        return (
          <DiscountedProductsTable
            data={reportData?.data as unknown as DiscountedProduct[]}
          />
        );

      case "highest-discount":
        return (
          <HighestDiscountTable
            data={reportData?.data as unknown as HighestDiscountProduct[]}
          />
        );

      case "price-distribution":
        return (
          <PriceDistributionChart
            data={reportData?.data as unknown as PriceDistribution[]}
          />
        );

      case "category-performance":
        return (
          <CategoryPerformanceTable
            data={reportData?.data as unknown as CategoryPerformance[]}
          />
        );

      case "manufacturer-report":
        return (
          <ManufacturerReportTable
            data={reportData?.data as unknown as ManufacturerReport[]}
          />
        );

      case "recently-added":
        return (
          <RecentlyAddedTable
            data={reportData?.data as unknown as RecentlyAddedProduct[]}
          />
        );

      case "recently-updated":
        return (
          <RecentlyUpdatedTable
            data={reportData?.data as unknown as RecentlyUpdatedProduct[]}
          />
        );

      default:
        return (
          <div className='flex flex-col items-center justify-center h-full py-16 text-center'>
            <div className='relative mx-auto w-fit mb-6'>
              <div className='p-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 animate-pulse'>
                <Filter className='h-12 w-12 text-indigo-600' />
              </div>
              <div className='absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 opacity-10 animate-ping' />
            </div>
            <div className='space-y-3'>
              <h3 className='text-2xl font-bold text-gray-900'>Coming Soon</h3>
              <p className='text-gray-600 leading-relaxed max-w-md mx-auto'>
                The{" "}
                <strong className='text-indigo-600'>
                  {(REPORT_TYPES as any)[selectedReport]?.label}
                </strong>{" "}
                report is currently being implemented with beautiful
                visualizations and powerful filtering capabilities.
              </p>
              <div className='pt-4'>
                <Badge
                  variant='outline'
                  className='bg-indigo-50 text-indigo-700 border-indigo-200 text-sm py-1 px-3'>
                  Report Type: {selectedReport}
                </Badge>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className='space-y-4 '>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Card
            className='border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50
                          hover:from-indigo-100 hover:via-purple-100 hover:to-pink-100
                          transition-all duration-300 cursor-pointer group'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div
                    className='p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600
                                  text-white shadow-lg group-hover:shadow-xl transition-shadow'>
                    <Filter className='h-6 w-6' />
                  </div>
                  <div className='text-left'>
                    <CardTitle className='text-xl font-bold text-gray-900'>
                      Advanced Inventory Reports
                    </CardTitle>
                    <CardDescription className='text-sm'>
                      17 comprehensive report types with powerful filtering
                    </CardDescription>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary' className='bg-white/80'>
                    {REPORT_TYPES[selectedReport]?.label}
                  </Badge>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>

        <CollapsibleContent className='mt-4'>
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 h-[800px] lg:h-[700px]'>
            {/* LEFT SIDE - Report Types List */}
            <div className='lg:col-span-4 flex flex-col h-full'>
              <Card className='flex-1 flex flex-col border border-gray-200 bg-white'>
                <CardHeader className='pb-4'>
                  <div className='space-y-3'>
                    <CardTitle className='text-lg font-semibold'>
                      Report Types
                    </CardTitle>

                    {/* Search Input */}
                    <div className='relative'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <Input
                        type='text'
                        placeholder='Search reports...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='pl-9 h-9'
                      />
                    </div>

                    {/* Expand/Collapse All Button */}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        const totalCategories =
                          Object.keys(REPORT_CATEGORIES).length;
                        if (expandedCategories.size === totalCategories) {
                          setExpandedCategories(new Set());
                        } else {
                          setExpandedCategories(
                            new Set(Object.keys(REPORT_CATEGORIES)),
                          );
                        }
                      }}
                      className='w-full text-xs'>
                      {expandedCategories.size ===
                      Object.keys(REPORT_CATEGORIES).length
                        ? "Collapse All"
                        : "Expand All"}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className='flex-1 overflow-hidden p-0'>
                  <ScrollArea className='h-full px-4 max-h-[55vh] overflow-y-auto'>
                    <div className='space-y-3 pb-4'>
                      {Object.entries(REPORT_CATEGORIES).map(
                        ([catKey, category]) => {
                          const categoryReports = filteredReportTypes.filter(
                            ([_, report]) => report.category === catKey,
                          );

                          if (categoryReports.length === 0) return null;

                          const isExpanded = expandedCategories.has(catKey);

                          return (
                            <div key={catKey} className='space-y-2'>
                              {/* Category Header */}
                              <button
                                onClick={() => toggleCategory(catKey)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-lg
                                transition-all duration-200 ${
                                  isExpanded
                                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 shadow-sm"
                                    : "bg-gray-50 hover:bg-gray-100"
                                }`}>
                                <div className='flex items-center gap-2'>
                                  <span className='text-lg'>
                                    {category.icon}
                                  </span>
                                  <span className='text-sm font-semibold text-gray-900'>
                                    {category.label}
                                  </span>
                                  <Badge
                                    variant='outline'
                                    className='text-xs ml-1'>
                                    {categoryReports.length}
                                  </Badge>
                                </div>
                                <ChevronDown
                                  className={`h-4 w-4 text-gray-600 transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {/* Report Types List */}
                              {isExpanded && (
                                <div className='ml-2 space-y-1 border-l-2 border-indigo-100 pl-3'>
                                  {categoryReports.map(
                                    ([reportKey, report]) => (
                                      <button
                                        key={reportKey}
                                        onClick={() =>
                                          setSelectedReport(
                                            reportKey as ReportType,
                                          )
                                        }
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm
                                      transition-all duration-200 ${
                                        selectedReport === reportKey
                                          ? "bg-indigo-600 text-white shadow-md scale-[1.02]"
                                          : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
                                      }`}>
                                        <div
                                          className={`font-medium ${
                                            selectedReport === reportKey
                                              ? "text-white"
                                              : "text-gray-900"
                                          }`}>
                                          {report.label}
                                        </div>
                                        <div
                                          className={`text-xs mt-0.5 ${
                                            selectedReport === reportKey
                                              ? "text-indigo-100"
                                              : "text-gray-500"
                                          }`}>
                                          {report.description}
                                        </div>
                                      </button>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        },
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT SIDE - Report Display */}
            <div className='lg:col-span-8 h-full'>
              <Card className='h-full border border-gray-200 bg-white flex flex-col'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100'>
                          <Filter className='h-5 w-5 text-indigo-600' />
                        </div>
                        <div>
                          <CardTitle className='text-xl font-bold'>
                            {REPORT_TYPES[selectedReport]?.label}
                          </CardTitle>
                          <CardDescription className='text-sm'>
                            {REPORT_TYPES[selectedReport]?.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleRefresh}
                      disabled={loading}
                      className='gap-2 shrink-0'>
                      <RefreshCw
                        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                      />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className='flex-1 overflow-auto'>
                  <div key={selectedReport}>{renderReportContent()}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default InventoryReportsSection;
