import { cn } from "../../lib/utils";
import { BLOCKED_THEME, expiryLabel } from "./fraudTheme";

interface BlockedBadgeProps {
  /** ISO expiry from the manual fraud group entry (null = permanent) */
  expiresAt?: string | null;
  className?: string;
}

/** Solid chip marking a customer as manually blocked from ordering */
const BlockedBadge = ({ expiresAt, className }: BlockedBadgeProps) => {
  const Icon = BLOCKED_THEME.icon;

  return (
    <span
      title={expiryLabel(expiresAt)}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap",
        BLOCKED_THEME.badge,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      Blocked
    </span>
  );
};

export default BlockedBadge;
