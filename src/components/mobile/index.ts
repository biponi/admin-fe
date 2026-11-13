/**
 * Mobile kit — Material/Android-style components for <768px.
 * Every component is desktop-safe (hidden or no-op above the breakpoint);
 * pages use them inside `useIsMobile()` branches or `mobile:` gating.
 */
export { MobilePage } from "./MobilePage";
export { MobileCollapsingHeader } from "./MobileCollapsingHeader";
export {
  PageHeader,
  MobilePageHeader,
} from "../PageHeader";
export { MobileBottomTabs } from "./MobileBottomTabs";
export { MobileFab } from "./MobileFab";
export { MobileListCard } from "./MobileListCard";
export { MobileStaggeredList } from "./MobileStaggeredList";
export { MobileStatTile, MobileStatRow } from "./MobileStatTile";
export {
  MobileFilterSheet,
  MobileFilterTrigger,
} from "./MobileFilterSheet";
export { MobileActionSheet } from "./MobileActionSheet";
export type { MobileSheetAction } from "./MobileActionSheet";
export { MobileDetailSheet } from "./MobileDetailSheet";
export { MobileEmptyState } from "./MobileEmptyState";
export { MobileSkeletonCard, MobileSkeletonList } from "./MobileSkeleton";
export { MobilePagination } from "./MobilePagination";
export { MobileStickyActions } from "./MobileStickyActions";
export { useRipple, rippleProps } from "./use-ripple";
export * from "./animations";
