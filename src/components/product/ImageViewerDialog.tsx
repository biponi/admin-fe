import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "../ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { useIsMobile } from "../../hooks/use-mobile";

interface ImageViewerDialogProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  alt?: string;
}

export const ImageViewerDialog: React.FC<ImageViewerDialogProps> = ({
  images,
  initialIndex = 0,
  open,
  onClose,
  alt = "Image",
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const isMobile = useIsMobile();

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  const scrollPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const scrollNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") scrollPrev();
      if (e.key === "ArrowRight") scrollNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, scrollPrev, scrollNext]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || images.length === 0) return null;

  const imageContent = (
    <div className="relative flex flex-col items-center justify-center bg-black">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 border border-white/20"
        aria-label="Close">
        <X className="h-4 w-4" />
      </button>

      {/* Counter */}
      <span className="absolute top-2 left-2 z-30 text-xs font-medium text-white/90 bg-black/60 rounded-full px-2.5 py-1 backdrop-blur-sm">
        {currentIndex + 1} / {images.length}
      </span>

      {/* Main image */}
      <div className="relative flex items-center justify-center w-full h-full min-h-[50vh] max-h-[80vh] p-4">
        {images.length > 1 && currentIndex > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 z-20 h-9 w-9 rounded-full bg-black/60 text-white hover:bg-black/80 border border-white/20"
            onClick={scrollPrev}
            aria-label="Previous image">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        <img
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className="max-h-[70vh] max-w-full object-contain rounded-md"
          draggable={false}
        />

        {images.length > 1 && currentIndex < images.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 z-20 h-9 w-9 rounded-full bg-black/60 text-white hover:bg-black/80 border border-white/20"
            onClick={scrollNext}
            aria-label="Next image">
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 px-4 py-3 bg-black/50 backdrop-blur-sm w-full">
          {images.map((src, i) => (
            <button
              key={`thumb-${i}`}
              onClick={() => setCurrentIndex(i)}
              className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                i === currentIndex
                  ? "border-white scale-105"
                  : "border-transparent opacity-50 hover:opacity-80"
              }`}>
              <img
                src={src}
                alt={`Thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DrawerContent className="h-[85vh]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{alt}</DrawerTitle>
          </DrawerHeader>
          {imageContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 overflow-hidden border-0 bg-black">
        {imageContent}
      </DialogContent>
    </Dialog>
  );
};
