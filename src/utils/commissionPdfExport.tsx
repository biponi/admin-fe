/**
 * Commission PDF Export Utility
 * Main entry point for client-side PDF generation
 */

import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import {
  fetchAllOrderDetails,
  aggregateUserWiseData,
  preloadUserAvatars,
  fetchImageAsBase64,
} from "./commissionPdfData";
import { CommissionPdfDocument } from "./commissionPdfDocument";
import {
  PdfGenerationOptions,
  ProgressCallback,
  PdfGenerationResult,
} from "./commissionPdfTypes";
import { BRAND_CONFIG } from "../config/brand";

/**
 * Update progress callback
 */
const updateProgress = (
  progress: number,
  message?: string,
  callback?: ProgressCallback
) => {
  if (callback) {
    callback(Math.round(progress), message);
  }
};

/**
 * Download commission PDF (client-side generation)
 */
export const downloadCommissionPdfClientSide = async (
  options: PdfGenerationOptions,
  onProgress?: ProgressCallback
): Promise<PdfGenerationResult> => {
  try {
    const { mode, startDate, endDate, status } = options;

    console.log(`Starting PDF generation: mode=${mode}`);

    // Initialize
    updateProgress(0, "Initializing...", onProgress);

    let orders: any[] = [];
    let userWiseData: any[] = [];

    // Step 1: Fetch data based on mode
    if (mode === "order-wise" || mode === "combined") {
      updateProgress(5, "Fetching order commissions...", onProgress);
      orders = await fetchAllOrderDetails(
        { startDate, endDate, status },
        (progress) => {
          // Scale progress from 5-60%
          const scaledProgress = 5 + progress * 0.55;
          updateProgress(scaledProgress, "Fetching orders...", onProgress);
        }
      );
      console.log(`Fetched ${orders.length} orders`);
    }

    // Step 2: Aggregate user data if needed
    if (mode === "user-wise" || mode === "combined") {
      updateProgress(60, "Aggregating user-wise data...", onProgress);

      // Reuse orders if already fetched, otherwise fetch
      if (orders.length === 0) {
        updateProgress(60, "Fetching orders for user aggregation...", onProgress);
        orders = await fetchAllOrderDetails(
          { startDate, endDate, status },
          (progress) => {
            const scaledProgress = 60 + progress * 0.1;
            updateProgress(
              scaledProgress,
              "Fetching orders for user data...",
              onProgress
            );
          }
        );
      }

      userWiseData = aggregateUserWiseData(orders);
      console.log(`Aggregated data for ${userWiseData.length} users`);

      updateProgress(70, "Preloading user avatars...", onProgress);

      // Preload user avatars
      userWiseData = await preloadUserAvatars(userWiseData, (progress) => {
        const scaledProgress = 70 + progress * 0.1;
        updateProgress(scaledProgress, "Loading avatars...", onProgress);
      });
    }

    // Step 3: Prepare logo image
    updateProgress(80, "Loading logo...", onProgress);
    let logoImage = "";
    try {
      logoImage = await fetchImageAsBase64(BRAND_CONFIG.invoiceLogoUrl);
    } catch (error) {
      console.warn("Could not load logo image, will use URL directly");
    }

    // Step 4: Generate PDF
    updateProgress(85, "Generating PDF...", onProgress);

    const reportDateRange =
      startDate || endDate
        ? `${startDate ? new Date(startDate).toLocaleDateString() : "Start"} to ${
            endDate ? new Date(endDate).toLocaleDateString() : "Present"
          }`
        : "All time";

    const blob = await pdf(
      <CommissionPdfDocument
        mode={mode}
        orders={orders}
        userWiseData={userWiseData}
        logoImage={logoImage}
        reportDateRange={reportDateRange}
        reportGeneratedAt={new Date().toISOString()}
      />
    ).toBlob();

    updateProgress(95, "Preparing download...", onProgress);

    // Step 5: Download
    const filename = `commission-${mode}-${new Date().toISOString().split("T")[0]}.pdf`;
    saveAs(blob, filename);

    updateProgress(100, "Complete!", onProgress);

    console.log(`PDF downloaded: ${filename}`);

    return { success: true, filename };
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate PDF",
    };
  }
};

/**
 * Quick export: Order-wise only
 */
export const exportOrderWise = async (
  startDate?: string,
  endDate?: string,
  status?: string,
  onProgress?: ProgressCallback
): Promise<PdfGenerationResult> => {
  return downloadCommissionPdfClientSide(
    { mode: "order-wise", startDate, endDate, status },
    onProgress
  );
};

/**
 * Quick export: User-wise only
 */
export const exportUserWise = async (
  startDate?: string,
  endDate?: string,
  status?: string,
  onProgress?: ProgressCallback
): Promise<PdfGenerationResult> => {
  return downloadCommissionPdfClientSide(
    { mode: "user-wise", startDate, endDate, status },
    onProgress
  );
};

/**
 * Quick export: Combined
 */
export const exportCombined = async (
  startDate?: string,
  endDate?: string,
  status?: string,
  onProgress?: ProgressCallback
): Promise<PdfGenerationResult> => {
  return downloadCommissionPdfClientSide(
    { mode: "combined", startDate, endDate, status },
    onProgress
  );
};
