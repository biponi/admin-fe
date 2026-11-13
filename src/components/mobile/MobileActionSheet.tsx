import { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { rippleProps } from "./use-ripple";
import { cn } from "../../lib/utils";

export interface MobileSheetAction {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface MobileActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  actions: MobileSheetAction[];
}

/**
 * Material bottom sheet listing row actions (edit, duplicate, delete…).
 * Replaces dropdown menus / inline button clusters on mobile.
 */
export function MobileActionSheet({
  open,
  onOpenChange,
  title,
  description,
  actions,
}: MobileActionSheetProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='rounded-t-[28px] pb-[calc(0.75rem+env(safe-area-inset-bottom))]'>
        {(title || description) && (
          <DrawerHeader className='text-center sm:text-center pb-1'>
            {title && (
              <DrawerTitle className='text-base font-semibold'>
                {title}
              </DrawerTitle>
            )}
            {description && (
              <p className='text-[13px] text-muted-foreground'>{description}</p>
            )}
          </DrawerHeader>
        )}
        <div className='flex flex-col px-2'>
          {actions.map((action) => (
            <button
              key={action.label}
              disabled={action.disabled}
              onClick={() => {
                onOpenChange(false);
                action.onClick();
              }}
              className={cn(
                "m3-ripple flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-left disabled:opacity-50",
                action.destructive
                  ? "text-destructive"
                  : "text-foreground",
              )}
              {...rippleProps()}>
              {action.icon && <span className='shrink-0'>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
