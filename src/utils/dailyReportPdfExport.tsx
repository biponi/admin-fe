/**
 * Daily Report PDF Export Utility
 * Main entry point for client-side PDF generation
 */

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { DailyReportPdfDocument } from "./dailyReportPdfDocument";
import { DailyReportData } from "../api/dailyReport";
import { processReportsForPDF, validateReportData } from "./dailyReportPdfData";
import { BRAND_CONFIG } from "../config/brand";

/**
 * Progress callback type
 */
export type ProgressCallback = (progress: number, message?: string) => void;

/**
 * Export result type
 */
export interface ExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

/**
 * Fetch logo as base64 for PDF
 */
const fetchLogoAsBase64 = async (): Promise<string | undefined> => {
  try {
    if (!BRAND_CONFIG.logo) return undefined;

    const response = await fetch(BRAND_CONFIG.logo);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading logo:", error);
    return undefined;
  }
};

/**
 * Update progress callback
 */
const updateProgress = (
  progress: number,
  message: string,
  callback?: ProgressCallback
) => {
  if (callback) {
    callback(Math.min(Math.round(progress), 100), message);
  }
};

/**
 * Generate and download daily report PDF
 */
export const generateDailyReportPDF = async (
  reports: DailyReportData[],
  onProgress?: ProgressCallback
): Promise<ExportResult> => {
  try {
    console.log(`Starting PDF generation for ${reports.length} reports`);

    // Step 1: Validate reports
    updateProgress(0, "Validating report data...", onProgress);

    const validReports = reports.filter(validateReportData);

    if (validReports.length === 0) {
      return {
        success: false,
        error: "No valid report data available",
      };
    }

    console.log(`Validated ${validReports.length} reports`);

    // Step 2: Process reports
    updateProgress(10, "Processing report data...", onProgress);

    const processedData = processReportsForPDF(validReports);

    console.log("Processed report data");

    // Step 3: Load logo
    updateProgress(20, "Loading logo...", onProgress);

    const logoImage = await fetchLogoAsBase64();

    console.log("Logo loaded:", logoImage ? "Yes" : "No");

    // Step 4: Generate PDF
    updateProgress(40, "Generating PDF document...", onProgress);

    const doc = <DailyReportPdfDocument reports={processedData.reports} logoImage={logoImage} />;

    updateProgress(60, "Rendering PDF...", onProgress);

    const asPdf = pdf(doc);
    const blob = await asPdf.toBlob();

    console.log("PDF blob created:", blob.size, "bytes");

    // Step 5: Download
    updateProgress(90, "Preparing download...", onProgress);

    const dateRange =
      validReports.length === 1
        ? validReports[0].date
        : `${validReports[0].date}_to_${validReports[validReports.length - 1].date}`;

    const filename = `daily_report_${dateRange}.pdf`;

    saveAs(blob, filename);

    updateProgress(100, "Complete!", onProgress);

    return {
      success: true,
      filename,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate PDF",
    };
  }
};

/**
 * Generate single daily report PDF
 */
export const generateSingleReportPDF = async (
  report: DailyReportData,
  onProgress?: ProgressCallback
): Promise<ExportResult> => {
  return generateDailyReportPDF([report], onProgress);
};

/**
 * Generate date range PDF report
 */
export const generateDateRangePDF = async (
  reports: DailyReportData[],
  startDate: string,
  endDate: string,
  onProgress?: ProgressCallback
): Promise<ExportResult> => {
  try {
    // Filter reports by date range
    const filteredReports = reports.filter((report) => {
      const reportDate = new Date(report.date);
      const start = new Date(startDate);
      const end = new Date(endDate);

      return reportDate >= start && reportDate <= end;
    });

    if (filteredReports.length === 0) {
      return {
        success: false,
        error: "No reports found in the specified date range",
      };
    }

    return generateDailyReportPDF(filteredReports, onProgress);
  } catch (error) {
    console.error("Error generating date range PDF:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate PDF",
    };
  }
};

/**
 * Quick PDF generation without progress tracking
 */
export const quickGeneratePDF = async (
  reports: DailyReportData[]
): Promise<ExportResult> => {
  return generateDailyReportPDF(reports);
};
