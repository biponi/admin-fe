import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { TextShimmer } from "@/components/loading-ui/text-shimmer";
import { Ring } from "@/components/loading-ui/ring";
import { DotsRing } from "@/components/loading-ui/dots-ring";
import { Bars } from "@/components/loading-ui/bars";
import { ConveyorLoop } from "@/components/loading-ui/conveyor-loop";
import { Wave } from "@/components/loading-ui/wave";
import { Dots } from "@/components/loading-ui/dots";
import { OrbitRing } from "@/components/loading-ui/orbit-ring";
import { SquareGrid } from "@/components/loading-ui/square-grid";
import { Terminal } from "@/components/loading-ui/terminal";

// Re-export primitives for icon-only spots (inputs, table-row buttons).
export { TextShimmer } from "@/components/loading-ui/text-shimmer";
export { Ring } from "@/components/loading-ui/ring";
export { DotsRing } from "@/components/loading-ui/dots-ring";
export { Bars } from "@/components/loading-ui/bars";
export { ConveyorLoop } from "@/components/loading-ui/conveyor-loop";
export { Wave } from "@/components/loading-ui/wave";
export { Dots } from "@/components/loading-ui/dots";
export { OrbitRing } from "@/components/loading-ui/orbit-ring";
export { SquareGrid } from "@/components/loading-ui/square-grid";
export { Terminal } from "@/components/loading-ui/terminal";

export type LoaderDomain =
  | "generic"
  | "analytics"
  | "orders"
  | "products"
  | "users"
  | "chat"
  | "delivery"
  | "settings"
  | "system";

type DomainLoader = {
  Graphic: ComponentType<{ className?: string }>;
  text: string;
};

/**
 * Domain → loading-ui animation mapping.
 * Each domain gets a contextually-related animation from loading-ui.com.
 */
export const DOMAIN_LOADERS: Record<LoaderDomain, DomainLoader> = {
  generic: { Graphic: Ring, text: "Loading…" },
  analytics: { Graphic: Bars, text: "Loading Analytics" },
  orders: { Graphic: ConveyorLoop, text: "Loading Orders" },
  products: { Graphic: Wave, text: "Loading Products" },
  users: { Graphic: DotsRing, text: "Loading Users" },
  chat: { Graphic: Dots, text: "Loading Chat" },
  delivery: { Graphic: OrbitRing, text: "Loading Deliveries" },
  settings: { Graphic: SquareGrid, text: "Loading Settings" },
  system: { Graphic: Terminal, text: "Fetching Logs" },
};

type LoaderProps = {
  domain?: LoaderDomain;
  /** Overrides the domain's default text. */
  text?: string;
  className?: string;
  /** Classes for the graphic, e.g. "h-10 w-10" (page) or "h-4 w-4" (inline). */
  graphicClassName?: string;
  textClassName?: string;
};

/** Full-height centered loader — page-level / panel-level loading states. */
export const PageLoader = ({
  domain = "generic",
  text,
  className,
  graphicClassName = "h-10 w-10 text-primary",
  textClassName,
}: LoaderProps) => {
  const { Graphic, text: defaultText } = DOMAIN_LOADERS[domain];
  return (
    <div
      className={cn(
        "flex min-h-[200px] w-full flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <Graphic className={graphicClassName} />
      <TextShimmer as='p' duration={2} className={cn("text-sm text-muted-foreground", textClassName)}>
        {text ?? defaultText}
      </TextShimmer>
    </div>
  );
};

/** Compact loader — table sections, list bodies, search inputs. */
export const InlineLoader = ({
  domain = "generic",
  text,
  className,
  graphicClassName = "h-5 w-5 text-muted-foreground",
  textClassName,
}: LoaderProps) => {
  const { Graphic, text: defaultText } = DOMAIN_LOADERS[domain];
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-3 py-6",
        className,
      )}
    >
      <Graphic className={graphicClassName} />
      <TextShimmer as='span' duration={2} className={cn("text-sm text-muted-foreground", textClassName)}>
        {text ?? defaultText}
      </TextShimmer>
    </div>
  );
};

/** Animated submit-button label — replaces the Loader2 + text idiom. */
export const ButtonLoadingText = ({ text }: { text: string }) => (
  <TextShimmer as='span' duration={1} className='text-[inherit]'>
    {text}
  </TextShimmer>
);
