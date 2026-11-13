import { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
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
import { StockSummaryResponse } from "./interface";
import {
  getInventoryHealth,
  type InventoryHealthResponse,
} from "../../api/inventoryReport";
import MainView from "../../coreComponents/mainView";
import { MobilePage } from "../../components/mobile";
import { useIsMobile } from "../../hooks/use-mobile";
import { claude } from "../../lib/claude";
import { cn } from "../../lib/utils";
import { MobileProductAnalytics } from "./components/analytics/mobile/MobileProductAnalytics";
import { DesktopProductAnalytics } from "./components/analytics/DesktopProductAnalytics";
import type { ExportOption } from "./components/analytics/ExportMenu";

// ─── Main Component ───────────────────────────────────────────────────────────

const ProductAnalytics = () => {
  const { hasRequiredPermission } = useRoleCheck();
  const isMobile = useIsMobile();
  const [summary, setSummary] = useState<StockSummaryResponse | null>(null);
  const [health, setHealth] = useState<InventoryHealthResponse | null>(null);
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

  const getInventoryHealthDetails = async () => {
    try {
      const response = await getInventoryHealth();
      if (response?.success) {
        setHealth(response?.data);
      } else {
        setHealth(null);
      }
    } catch {
      setHealth(null);
    }
  };

  useEffect(() => {
    getProductSummaryDetails();
    getInventoryHealthDetails();
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

  const exportOptions: ExportOption[] = [
    { name: "PDF (Flat)", format: "PDF", variant: "Flat", download: () => downloadPdfFlat(null, false) },
    { name: "PDF (Grouped)", format: "PDF", variant: "Grouped", download: () => downloadPdfGrouped(null, false) },
    { name: "PDF (Split)", format: "PDF", variant: "Split", download: () => downloadPdfSplit(null, false) },
    { name: "CSV (Flat)", format: "CSV", variant: "Flat", download: () => downloadCsvFlat(null, false) },
    { name: "CSV (Grouped)", format: "CSV", variant: "Grouped", download: () => downloadCsvGrouped(null, false) },
    { name: "CSV (Split)", format: "CSV", variant: "Split", download: () => downloadCsvSplit(null, false) },
  ];

  // ── Guard ──────────────────────────────────────────────────────────────────

  if (!hasRequiredPermission("product", "summary")) {
    const denied = (
      <div className='flex flex-col items-center justify-center py-16 text-center px-6'>
        <div className='w-10 h-10 rounded-xl bg-[#FBEFF3] flex items-center justify-center mb-3'>
          <XCircle className='h-5 w-5 text-[#B3365B]' />
        </div>
        <h3 className={cn(claude.title, "mb-1")}>Access denied</h3>
        <p className='text-xs text-[#8A877D]'>
          You don't have permission to view product analytics.
        </p>
      </div>
    );
    return isMobile ? (
      <MobilePage title='Product Analytics'>{denied}</MobilePage>
    ) : (
      <div
        className={cn(
          claude.page,
          "min-h-screen flex items-center justify-center",
        )}>
        <div className={cn(claude.card, "p-8 max-w-sm")}>{denied}</div>
      </div>
    );
  }

  // ── Page (dual tree: Material mobile / claude desktop) ────────────────────

  if (isMobile) {
    return (
      <MobileProductAnalytics
        summary={summary}
        health={health}
        isLoading={isLoading}
        isDownloadingReport={isDownloadingReport}
        exportActions={exportOptions.map((o) => ({
          name: o.variant,
          format: o.format,
          download: () => handleReportDownload(o.download, o.name),
        }))}
      />
    );
  }

  return (
    <MainView title='Product Analytics'>
      <DesktopProductAnalytics
        summary={summary}
        health={health}
        isLoading={isLoading}
        isDownloadingReport={isDownloadingReport}
        exportOptions={exportOptions.map((o) => ({
          ...o,
          download: () => handleReportDownload(o.download, o.name),
        }))}
      />
    </MainView>
  );
};

export default ProductAnalytics;
