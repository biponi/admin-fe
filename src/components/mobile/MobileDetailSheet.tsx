import { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Button } from "../ui/button";

interface MobileDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Optional footer action (e.g. primary call-to-action) */
  actionLabel?: string;
  onAction?: () => void;
  /** Optional secondary footer action */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/**
 * General-purpose content bottom sheet — the mobile replacement for detail
 * Dialogs. Body scrolls; footer actions sit above the safe area.
 */
export function MobileDetailSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: MobileDetailSheetProps) {
  const hasFooter = !!actionLabel || !!secondaryLabel;
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='rounded-t-[28px] max-h-[90vh] pb-[calc(0.75rem+env(safe-area-inset-bottom))]'>
        <DrawerHeader className='text-center sm:text-center pb-1'>
          <DrawerTitle className='text-base font-semibold'>{title}</DrawerTitle>
          {description && (
            <p className='text-[13px] text-muted-foreground'>{description}</p>
          )}
        </DrawerHeader>
        <div className='m3-sheet-body flex-1 overflow-y-auto px-4 py-2'>
          {children}
        </div>
        {hasFooter && (
          <DrawerFooter className='flex-row gap-2 pt-2'>
            {secondaryLabel && (
              <Button
                variant='outline'
                className='flex-1 rounded-full'
                onClick={onSecondary}>
                {secondaryLabel}
              </Button>
            )}
            {actionLabel && (
              <Button className='flex-1 rounded-full' onClick={onAction}>
                {actionLabel}
              </Button>
            )}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
