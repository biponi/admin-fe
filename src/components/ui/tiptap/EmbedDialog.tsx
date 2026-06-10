/**
 * Embed Dialog Component
 * Provides a UI for inserting social media embeds and video files
 */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  detectPlatform,
} from "./extensions/SocialMediaEmbed";

interface EmbedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (url: string, platform?: string) => void;
  mode: "social" | "video";
  initialUrl?: string;
}

const SUPPORTED_PLATFORMS = {
  youtube: { name: "YouTube", icon: "📺", color: "text-red-600" },
  facebook: { name: "Facebook", icon: "👤", color: "text-blue-600" },
  instagram: { name: "Instagram", icon: "📸", color: "text-pink-600" },
  tiktok: { name: "TikTok", icon: "🎵", color: "text-gray-900" },
  linkedin: { name: "LinkedIn", icon: "💼", color: "text-blue-700" },
  pinterest: { name: "Pinterest", icon: "📌", color: "text-red-700" },
  x: { name: "X (Twitter)", icon: "✖️", color: "text-gray-900" },
};

export const EmbedDialog: React.FC<EmbedDialogProps> = ({
  open,
  onOpenChange,
  onInsert,
  mode,
  initialUrl = "",
}) => {
  const [url, setUrl] = useState("");
  const [width, setWidth] = useState(500);
  const [platform, setPlatform] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Reset state when dialog opens and set initial URL
  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setPlatform(null);
      setError(null);
      setIsValid(false);
      setWidth(500);
    }
  }, [open, initialUrl]);

  // Detect platform when URL changes
  useEffect(() => {
    if (!url) {
      setPlatform(null);
      setIsValid(false);
      setError(null);
      return;
    }

    if (mode === "video") {
      // Validate video file URL
      const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".wmv"];
      const isVideoFile =
        videoExtensions.some((ext) => url.toLowerCase().endsWith(ext)) ||
        url.includes("video/") ||
        url.startsWith("blob:");

      if (isVideoFile) {
        setPlatform("video");
        setIsValid(true);
        setError(null);
      } else {
        setPlatform(null);
        setIsValid(false);
        setError("Please enter a valid video file URL (MP4, WebM, etc.)");
      }
      return;
    }

    // Social media platform detection
    const detected = detectPlatform(url);
    setPlatform(detected);

    if (detected) {
      setIsValid(true);
      setError(null);
      setIsPreviewLoading(true);
      // Simulate preview loading (in real app, you might fetch oEmbed data)
      setTimeout(() => setIsPreviewLoading(false), 500);
    } else {
      setIsValid(false);
      if (url.length > 5) {
        setError(
          "Unsupported platform. Please use a URL from YouTube, Facebook, Instagram, TikTok, LinkedIn, Pinterest, or X.",
        );
      } else {
        setError(null);
      }
    }
  }, [url, mode]);

  const handleInsert = () => {
    if (isValid && url) {
      onInsert(url, platform || undefined);
      onOpenChange(false);
    }
  };

  const getPreviewComponent = () => {
    if (!platform || !isValid || platform === "video") {
      return null;
    }

    const platformInfo =
      SUPPORTED_PLATFORMS[platform as keyof typeof SUPPORTED_PLATFORMS];
    if (!platformInfo) return null;

    return (
      <div className='flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'>
        <span className='text-2xl'>{platformInfo.icon}</span>
        <div>
          <p className='font-medium text-sm'>{platformInfo.name}</p>
          <p className='text-xs text-gray-500'>Embed preview ready</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === "video"
              ? "Insert Video File"
              : "Insert Social Media Embed"}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* URL Input */}
          <div className='space-y-2'>
            <Label htmlFor='url'>URL</Label>
            <Input
              id='url'
              placeholder={
                mode === "video"
                  ? "https://example.com/video.mp4"
                  : "https://www.youtube.com/watch?v=..."
              }
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <Alert variant='destructive' className='py-2'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription className='text-xs'>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Platform Detection */}
          {platform && isValid && (
            <div className='flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800'>
              <CheckCircle2 className='h-5 w-5 text-green-600' />
              <div className='flex-1'>
                <p className='text-sm font-medium text-green-900 dark:text-green-100'>
                  {mode === "video"
                    ? "Valid video file detected"
                    : "Platform detected"}
                </p>
                {mode === "social" && (
                  <p className='text-xs text-green-700 dark:text-green-300'>
                    {
                      SUPPORTED_PLATFORMS[
                        platform as keyof typeof SUPPORTED_PLATFORMS
                      ]?.name
                    }
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          {isPreviewLoading && isValid && platform !== "video" && (
            <div className='flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border'>
              <Loader2 className='h-6 w-6 animate-spin text-gray-400' />
            </div>
          )}

          {!isPreviewLoading && getPreviewComponent()}

          {/* Width Slider */}
          {mode === "social" && isValid && platform && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='width'>Embed Width</Label>
                <span className='text-sm text-gray-500'>{width}px</span>
              </div>
              <Slider
                id='width'
                min={300}
                max={800}
                step={50}
                value={[width]}
                onValueChange={(value) => setWidth(value[0])}
                className='cursor-pointer'
              />
              <div className='flex justify-between text-xs text-gray-500'>
                <span>300px</span>
                <span>800px</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!isValid || !url}>
            Insert Embed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedDialog;
