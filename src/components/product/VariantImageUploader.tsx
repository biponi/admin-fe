import React, { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { ImageViewerDialog } from "./ImageViewerDialog";

interface VariantImageUploaderProps {
  variantId: string;
  variantName: string;
  images: (File | string)[];
  maxImages?: number;
  onImagesChange: (variantId: string, images: (File | string)[]) => void;
  disabled?: boolean;
}

export const VariantImageUploader: React.FC<VariantImageUploaderProps> = ({
  variantId,
  variantName,
  images,
  maxImages = 2,
  onImagesChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const lastTapRef = useRef<number>(0);

  // Sync preview URLs with images prop
  React.useEffect(() => {
    const newPreviews = images.map((image) => {
      if (typeof image === "string") {
        return image;
      } else {
        return URL.createObjectURL(image);
      }
    });

    setPreviewUrls(newPreviews);

    return () => {
      newPreviews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images, variantId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed per variant`);
      return;
    }

    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/"),
    );
    if (invalidFiles.length > 0) {
      toast.error("Only image files are allowed");
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    const newImages = [...images, ...files];
    onImagesChange(variantId, newImages);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.success(`${files.length} image(s) added successfully`);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(variantId, newImages);
    toast.success("Image removed");
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const getImageType = (image: File | string): "existing" | "new" => {
    return typeof image === "string" ? "existing" : "new";
  };

  const handleImageDoubleClick = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const handleImageTouchEnd = (index: number) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      setViewerIndex(index);
      setViewerOpen(true);
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const allImageUrls = previewUrls.filter((url) => url);

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <Label className='text-sm font-medium'>
          Variant Images
          <Badge variant='secondary' className='ml-2'>
            {images.length}/{maxImages}
          </Badge>
        </Label>

        {!disabled && images.length < maxImages && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleUploadButtonClick}
            disabled={disabled}>
            <Upload className='h-4 w-4 mr-2' />
            Add Images
          </Button>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type='file'
        accept='image/png, image/jpeg, image/jpg, image/webp'
        multiple
        onChange={handleImageUpload}
        disabled={disabled || images.length >= maxImages}
        className='hidden'
      />

      {previewUrls.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-8 px-4'>
            <ImageIcon className='h-12 w-12 text-muted-foreground mb-3' />
            <p className='text-sm text-muted-foreground text-center'>
              No images uploaded for this variant
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              Upload up to {maxImages} images
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
          {previewUrls.map((previewUrl, index) => (
            <div
              key={index}
              className='group relative aspect-square rounded-md border border-border h-24 sm:h-32'>
              <img
                src={previewUrl}
                alt={`${variantName} ${index + 1}`}
                className='w-full h-24 sm:h-32 object-cover cursor-pointer hover:scale-105 transition-transform'
                onDoubleClick={() => handleImageDoubleClick(index)}
                onTouchEnd={() => handleImageTouchEnd(index)}
                title='Double-click to view full size'
              />

              {/* Image number badge - top left */}
              <Badge
                variant='secondary'
                className='absolute top-1 left-1 text-xs shadow-sm z-10'>
                {index + 1}
              </Badge>

              {/* Image type badge - bottom left */}
              {getImageType(images[index]) === "new" && (
                <Badge
                  variant='default'
                  className='absolute bottom-1 left-1 text-xs shadow-sm z-10'>
                  New
                </Badge>
              )}

              {/* Remove button - top right, always visible */}
              {!disabled && (
                <Button
                  type='button'
                  variant='destructive'
                  size='icon'
                  className='absolute top-1 right-1 z-20 h-6 w-6 bg-black/60 hover:bg-red-600 text-white border border-white/20 backdrop-blur-sm shadow-sm'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(index);
                  }}
                  title='Remove image'>
                  <X className='h-3.5 w-3.5' />
                </Button>
              )}

              {/* Hover overlay */}
              <div className='absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md pointer-events-none' />
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      <p className='text-xs text-muted-foreground'>
        Accepted formats: PNG, JPG, JPEG, WebP. Max size: 10MB per file.
      </p>

      {/* Image viewer dialog/drawer */}
      <ImageViewerDialog
        images={allImageUrls}
        initialIndex={viewerIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        alt={variantName}
      />
    </div>
  );
};
