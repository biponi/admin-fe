import React, { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { X, Upload, Image as ImageIcon, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface ImageGroupUploaderProps {
  groupId: string;
  groupName: string;
  images: (File | string)[];
  maxImages?: number;
  onImagesChange: (groupId: string, images: (File | string)[]) => void;
  onReorder?: (groupId: string, fromIndex: number, toIndex: number) => void;
  disabled?: boolean;
}

export const ImageGroupUploader: React.FC<ImageGroupUploaderProps> = ({
  groupId,
  groupName,
  images,
  maxImages = 10,
  onImagesChange,
  onReorder,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Sync preview URLs with images prop
  React.useEffect(() => {
    // Generate new preview URLs
    const newPreviews = images.map((image) => {
      if (typeof image === "string") {
        return image;
      } else {
        return URL.createObjectURL(image);
      }
    });

    setPreviewUrls(newPreviews);

    // Cleanup function - revoke URLs when effect runs again or unmounts
    return () => {
      newPreviews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [images, groupId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file count
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed per group`);
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/"),
    );
    if (invalidFiles.length > 0) {
      toast.error("Only image files are allowed");
      return;
    }

    // Validate file sizes (10MB max)
    const oversizedFiles = files.filter((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    // Create new images array
    const newImages = [...images, ...files];

    // Update parent state (previewUrls will sync via useEffect)
    onImagesChange(groupId, newImages);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.success(`${files.length} image(s) added successfully`);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(groupId, newImages);
    toast.success("Image removed");
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === toIndex) return;

    const newImages = [...images];
    const [removed] = newImages.splice(draggedIndex, 1);
    newImages.splice(toIndex, 0, removed);

    onImagesChange(groupId, newImages);
    setDraggedIndex(null);
    toast.success("Image order updated");
  };

  const getImageType = (image: File | string): "existing" | "new" => {
    return typeof image === "string" ? "existing" : "new";
  };

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <Label className='text-sm font-medium'>
          Group Images
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
              No images uploaded for this group
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
              draggable={!disabled && onReorder}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className='group relative aspect-square rounded-md border border-border h-24 sm:h-32 cursor-move'>
              <img
                src={previewUrl}
                alt={`${groupName} ${index + 1}`}
                className='w-full h-24 sm:h-32 object-cover cursor-pointer hover:scale-105 transition-transform'
                onClick={() => window.open(previewUrl, '_blank')}
                title='Click to view full size'
              />

              {/* Drag handle */}
              {!disabled && onReorder && (
                <div className='absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <GripVertical className='h-4 w-4 text-white drop-shadow-md' />
                </div>
              )}

              {/* Image type badge */}
              {getImageType(images[index]) === "new" && (
                <Badge
                  variant='default'
                  className='absolute -top-2 -left-2 text-xs shadow-sm'>
                  New
                </Badge>
              )}

              {/* Image number badge */}
              <Badge
                variant='secondary'
                className='absolute -top-2 -right-2 text-xs shadow-sm'>
                {index + 1}
              </Badge>

              {/* Remove button - show on hover */}
              {!disabled && (
                <Button
                  type='button'
                  variant='destructive'
                  size='icon'
                  className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:scale-110'
                  onClick={() => handleRemoveImage(index)}
                  title='Remove image'>
                  <X className='h-4 w-4' />
                </Button>
              )}

              {/* Hover overlay */}
              <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md' />
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      <p className='text-xs text-muted-foreground'>
        Accepted formats: PNG, JPG, JPEG, WebP. Max size: 10MB per file.
        {onReorder && !disabled && " Drag images to reorder."}
      </p>
    </div>
  );
};
