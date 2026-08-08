import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import useEmblaCarousel from "embla-carousel-react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  alt?: string;
}

export function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onClose,
  alt = "Product image",
}: ImageLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const thumbScrollRef = useRef<HTMLDivElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    slidesToScroll: 1,
  });

  const [thumbEmblaRef, thumbEmblaApi] = useEmblaCarousel({
    align: "center",
    containScroll: "keepSnaps",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const idx = emblaApi.selectedScrollSnap();
    setSelectedIndex(idx);
    thumbEmblaApi?.scrollTo(idx);
  }, [emblaApi, thumbEmblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Sync main carousel when initialIndex changes
  useEffect(() => {
    if (emblaApi && open) {
      emblaApi.scrollTo(initialIndex, true);
      setSelectedIndex(initialIndex);
    }
  }, [emblaApi, initialIndex, open]);

  // Keyboard navigation
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

  // Prevent body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || images.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col bg-black/95">
      {/* Close button */}
      <div className="absolute top-0 right-0 z-30 p-3 pt-[calc(env(safe-area-inset-top)+12px)] md:p-4">
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 border border-white/20"
          aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Counter */}
      <div className="absolute top-0 left-0 z-30 p-3 pt-[calc(env(safe-area-inset-top)+12px)] md:p-4">
        <span className="text-sm font-medium text-white/90 bg-black/60 rounded-full px-3 py-1 backdrop-blur-sm">
          {selectedIndex + 1} / {images.length}
        </span>
      </div>

      {/* Main image carousel */}
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {/* Prev button */}
        {images.length > 1 && (
          <button
            onClick={scrollPrev}
            className="absolute left-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 border border-white/20 md:left-4"
            aria-label="Previous image">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <div ref={emblaRef} className="h-full w-full overflow-hidden">
          <div className="flex h-full">
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative h-full w-full shrink-0 grow-0 basis-full">
                <img
                  src={src}
                  alt={`${alt} ${i + 1}`}
                  className="h-full w-full object-contain px-4 md:px-16"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={scrollNext}
            className="absolute right-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 border border-white/20 md:right-4"
            aria-label="Next image">
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="relative z-20 shrink-0 border-t border-white/10 bg-black/50 backdrop-blur-sm">
          <div
            ref={thumbScrollRef}
            className="mx-auto max-w-2xl overflow-hidden py-3">
            <div ref={thumbEmblaRef} className="overflow-hidden">
              <div className="flex justify-center gap-2 px-4">
                {images.map((src, i) => (
                  <button
                    key={`thumb-${src}-${i}`}
                    onClick={() => scrollTo(i)}
                    className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      i === selectedIndex
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
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
