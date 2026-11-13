import { ReactNode } from "react";
import { cn } from "../lib/utils";
import { useSettings } from "../contexts/SettingsContext";

/**
 * Page header — the canonical pattern from ListPurchaseOrderList:
 * icon chip + title + subtitle on the left, count + action buttons on the
 * right. Used on desktop inline; mobile pages use `MobilePageHeader`.
 * A soft backdrop (radial glow + SVG pattern tile + emoji scatter) is drawn
 * behind the content, tinted with the selected app theme's --primary hue so
 * it always matches the active theme like other components.
 */
export interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  /** Right-side meta, e.g. total record count ("142 total") */
  count?: ReactNode;
  /** Action buttons (create, export, refresh…). Must be wired by the page. */
  actions?: ReactNode;
  className?: string;
  /** Stack the title block above the actions on small screens (until lg). */
  stackOnMobile?: boolean;
}

/* ── Theme accent hue (mirrors the --primary values in index.scss) ──── */

const THEME_HUES: Record<string, number> = {
  default: 222, // --primary: 222.2 47.4% 11.2%
  blue: 221, // --primary: 221.2 83.2% 53.3%
  green: 142, // --primary: 142.1 76.2% 36.3%
  purple: 262, // --primary: 262.1 83.3% 57.8%
  orange: 25, // --primary: 24.6 95% 53.1%
  dark: 240, // --primary: 240 5.9% 10%
};

export type PatternKind =
  | "dots"
  | "stripes"
  | "plus"
  | "grid"
  | "waves"
  | "diagonal"
  | "zigzag";

const TILE = 26; // px — seamless SVG tile size

/** Seamless SVG pattern tile in the given hue as a data URI (no extra files). */
export function patternUrl(kind: PatternKind, hue: number): string {
  const stroke = `hsl(${hue} 70% 55%)`;
  const fill = `hsl(${hue} 70% 55%)`;
  const bodies: Record<PatternKind, string> = {
    dots: `<circle cx="5" cy="5" r="2.2" fill="${fill}" fill-opacity=".35"/><circle cx="18" cy="18" r="2.2" fill="${fill}" fill-opacity=".35"/>`,
    stripes: `<path d="M6.5 0v26M19.5 0v26" stroke="${stroke}" stroke-opacity=".35" stroke-width="2.5"/>`,
    plus: `<path d="M13 8v10M8 13h10" stroke="${stroke}" stroke-opacity=".35" stroke-width="2.5" stroke-linecap="round"/>`,
    grid: `<path d="M0 13h26M13 0v26" stroke="${stroke}" stroke-opacity=".3" stroke-width="1.5"/>`,
    waves: `<path d="M0 13 Q6.5 4 13 13 T26 13" fill="none" stroke="${stroke}" stroke-opacity=".35" stroke-width="2"/>`,
    diagonal: `<path d="M-6.5 32.5 L32.5 -6.5 M-6.5 6.5 L6.5 -6.5 M19.5 32.5 L32.5 19.5" stroke="${stroke}" stroke-opacity=".35" stroke-width="3"/>`,
    zigzag: `<path d="M0 19 L6.5 7 L13 19 L19.5 7 L26 19" fill="none" stroke="${stroke}" stroke-opacity=".35" stroke-width="2"/>`,
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}">${bodies[kind]}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export type Scatter = readonly [string, string, string];

interface HeaderBackdropProps {
  hue: number;
  pattern?: PatternKind;
  scatter?: Scatter;
}

/**
 * Backdrop layers (bottom→top): radial glow strongest at the top right,
 * then the pattern tile + emoji scatter faded toward the left behind the
 * title via a CSS mask. Purely decorative.
 */
function HeaderBackdrop({
  hue,
  pattern = "dots",
  scatter,
}: HeaderBackdropProps) {
  const rotations = [-12, 8, -5];
  return (
    <>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0'
        style={{
          background: `radial-gradient(520px circle at 88% -30%, hsl(${hue} 90% 92%) 0%, transparent 62%)`,
        }}
      />
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0'
        style={{
          backgroundImage: patternUrl(pattern, hue),
          backgroundSize: `${TILE}px ${TILE}px`,
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 55%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 55%)",
        }}>
        {scatter && (
          <div className='absolute right-6 top-1/2 hidden -translate-y-1/2 sm:flex items-center gap-4 opacity-60'>
            {scatter.map((emoji, i) => (
              <span
                key={i}
                className='text-2xl select-none'
                style={{ transform: `rotate(${rotations[i]}deg)` }}>
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function PageHeader({
  icon,
  title,
  subtitle,
  count,
  actions,
  className,
  stackOnMobile,
}: PageHeaderProps) {
  const { theme } = useSettings();
  const hue = THEME_HUES[theme] ?? THEME_HUES.default;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white text-black w-full",
        "dark:bg-white dark:text-black",
        "border border-slate-200/70 shadow-sm",
        "px-5 py-4 sm:px-6 sm:py-5",
        className,
      )}>
      <HeaderBackdrop hue={hue} />
      <div
        className={cn(
          "relative z-10 flex items-center justify-between gap-4",
          stackOnMobile &&
            "flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between",
        )}>
        <div className='flex items-center gap-3 min-w-0'>
          <div className='flex items-center justify-center h-10 w-10 shrink-0 rounded-lg bg-primary text-primary-foreground shadow-sm'>
            {icon}
          </div>
          <div className='min-w-0'>
            <h1 className='text-[18px] font-semibold text-foreground tracking-tight leading-tight truncate'>
              {title}
            </h1>
            {subtitle && (
              <p className='text-[13px] text-muted-foreground mt-0.5 truncate'>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {(count || actions) && (
          <div
            className={cn(
              "flex items-center gap-3 shrink-0",
              stackOnMobile && "w-full flex-wrap gap-2 sm:gap-3 lg:w-auto",
            )}>
            {count}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

interface MobilePageHeaderProps extends PageHeaderProps {
  /** Pattern + emojis for the backdrop, same options as PageHeader. */
  pattern?: PatternKind;
  scatter?: Scatter;
}

/** Compact mobile variant of PageHeader (icon chip + title + subtitle + count). */
export function MobilePageHeader({
  icon,
  title,
  subtitle,
  count,
  actions,
  pattern,
  scatter,
  className,
}: MobilePageHeaderProps) {
  const { theme } = useSettings();
  const hue = THEME_HUES[theme] ?? THEME_HUES.default;
  return (
    <div
      className={cn(
        "mobile:flex hidden relative overflow-hidden rounded-2xl bg-white text-black",
        "dark:bg-white dark:text-black",
        "border border-slate-200/70 shadow-sm",
        "px-3.5 py-3",
        className,
      )}>
      <HeaderBackdrop hue={hue} pattern={pattern} scatter={scatter} />
      <div className='relative z-10 flex items-center justify-between gap-3 w-full'>
        <div className='flex items-center gap-3 min-w-0'>
          <div className='h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center'>
            {icon}
          </div>
          <div className='min-w-0'>
            <h3 className='font-semibold text-foreground truncate leading-tight'>
              {title}
            </h3>
            {subtitle && (
              <p className='text-xs text-muted-foreground truncate mt-0.5'>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {count != null && (
          <div className='shrink-0 rounded-lg px-3 py-1.5 bg-card border text-[13px] font-semibold tabular-nums'>
            {count}
          </div>
        )}
        {actions && (
          <div className='flex items-center gap-1.5 shrink-0'>{actions}</div>
        )}
      </div>
    </div>
  );
}
