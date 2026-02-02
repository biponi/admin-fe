/**
 * PackingSlipPreviewModal Component
 * Unified preview for multiple packing slips with navigation and print capabilities
 */

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { PDFDocument } from "pdf-lib";

interface PackingSlipPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfUrls: { url: string; orderNumber: number; blob: Blob }[];
  onPrintAll: () => void;
  onPrintCurrent: () => void;
  onDownloadAll: () => void;
}

export const PackingSlipPreviewModal: React.FC<PackingSlipPreviewModalProps> = ({
  open,
  onOpenChange,
  pdfUrls,
  onPrintAll,
  onPrintCurrent,
  onDownloadAll,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setIsLoading(true);
    }
  }, [open]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setIsLoading(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(pdfUrls.length - 1, prev + 1));
    setIsLoading(true);
  };

  const handlePrintCurrent = () => {
    const iframe = document.getElementById(
      "packing-slip-preview-iframe"
    ) as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
    }
    onPrintCurrent();
  };

  const handlePrintAll = async () => {
    try {
      setIsLoading(true);

      // Create a new PDF document to merge all packing slips
      const mergedPdf = await PDFDocument.create();

      // Merge all PDF blobs into one
      for (const pdfData of pdfUrls) {
        const arrayBuffer = await pdfData.blob.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // Save the merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      const mergedBlob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const mergedUrl = URL.createObjectURL(mergedBlob);

      // Open merged PDF in new window for printing
      const printWindow = window.open(mergedUrl, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }

      // Clean up after 10 seconds
      setTimeout(() => URL.revokeObjectURL(mergedUrl), 10000);

      onPrintAll();
    } catch (error) {
      console.error("Error merging PDFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  if (pdfUrls.length === 0) return null;

  const currentPdf = pdfUrls[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[95vw] w-[95vw] h-[95vh] p-0 gap-0'>
        {/* Compact Header */}
        <div className='h-[5vh] flex items-center justify-between px-3 py-2 border-b bg-white shadow-sm'>
          <div className='flex items-center gap-2'>
            <Package className="h-4 w-4 text-orange-600" />
            <Badge
              variant='secondary'
              className='bg-orange-100 text-orange-700 text-xs'>
              {currentIndex + 1}/{pdfUrls.length}
            </Badge>
            <span className='text-sm font-medium text-gray-700'>
              Order #{currentPdf?.orderNumber}
            </span>
            <span className='text-xs text-gray-500'>
              Packing Slip
            </span>
          </div>

          <div className='flex items-center gap-1.5'>
            {/* Compact Navigation */}
            {pdfUrls.length > 1 && (
              <>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className='h-7 w-7 p-0'
                  title='Previous packing slip'>
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleNext}
                  disabled={currentIndex === pdfUrls.length - 1}
                  className='h-7 w-7 p-0'
                  title='Next packing slip'>
                  <ChevronRight className='h-4 w-4' />
                </Button>
                <div className='w-px h-5 bg-gray-300 mx-1' />
              </>
            )}

            {/* Compact Actions */}
            <Button
              variant='ghost'
              size='sm'
              onClick={handlePrintCurrent}
              className='h-7 px-2 text-xs'
              title='Print current packing slip'>
              <Printer className='h-3.5 w-3.5 mr-1.5' />
              Print
            </Button>

            {pdfUrls.length > 1 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handlePrintAll}
                className='h-7 px-2 text-xs'
                title={`Print all ${pdfUrls.length} packing slips`}>
                <Printer className='h-3.5 w-3.5 mr-1.5' />
                All ({pdfUrls.length})
              </Button>
            )}

            <Button
              variant='ghost'
              size='sm'
              onClick={onDownloadAll}
              className='h-7 px-2 text-xs'
              title='Download as ZIP'>
              <Download className='h-3.5 w-3.5 mr-1.5' />
              ZIP
            </Button>

            <div className='w-px h-5 bg-gray-300 mx-1' />

            <Button
              variant='ghost'
              size='sm'
              onClick={() => onOpenChange(false)}
              className='h-7 w-7 p-0'
              title='Close'>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Preview Area - Maximum space */}
        <div className='h-[85vh] flex-1 relative bg-gray-100 overflow-hidden'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className='h-full'>
              {isLoading && (
                <div className='absolute inset-0 flex items-center justify-center bg-white/90 z-10'>
                  <div className='flex flex-col items-center gap-2'>
                    <Loader2 className='h-6 w-6 animate-spin text-orange-600' />
                    <p className='text-xs text-gray-600'>Loading...</p>
                  </div>
                </div>
              )}
              <iframe
                id='packing-slip-preview-iframe'
                src={currentPdf?.url}
                className='w-full h-full border-0'
                title={`Packing Slip ${currentPdf?.orderNumber}`}
                onLoad={handleIframeLoad}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Minimal Footer Navigation - Only show if multiple packing slips */}
        {pdfUrls.length > 1 && (
          <div className='px-3 py-2 border-t bg-white'>
            <div className='flex items-center justify-center gap-1.5 overflow-x-auto scrollbar-thin'>
              {pdfUrls.map((pdf, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsLoading(true);
                  }}
                  className={cn(
                    "flex-shrink-0 px-2.5 py-1 rounded text-xs font-medium transition-all",
                    currentIndex === index
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                  title={`Order #${pdf.orderNumber}`}>
                  #{pdf.orderNumber}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
