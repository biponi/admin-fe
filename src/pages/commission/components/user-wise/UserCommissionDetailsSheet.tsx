import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../../components/ui/sheet";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import {
  Package,
  ShoppingCart,
  Calendar,
  Copy,
  ExternalLink,
  X,
  Users,
} from "lucide-react";
import { UserCommissionHistory } from "../../../../api/commission";
import { CommissionTimelineChart } from "./CommissionTimelineChart";
import { PerformanceMetricsCard } from "./PerformanceMetricsCard";
import { StatusTrendsCard } from "./StatusTrendsCard";
import { TopPerformersCard } from "./TopPerformersCard";
import {
  formatCurrency,
  formatDate,
} from "../../../../utils/inventoryReportUtils";
import { cn } from "../../../../lib/utils";

interface UserCommissionDetailsSheetProps {
  userDetails: UserCommissionHistory | null;
  open: boolean;
  onClose: () => void;
}

export const UserCommissionDetailsSheet: React.FC<
  UserCommissionDetailsSheetProps
> = ({ userDetails, open, onClose }) => {
  if (!userDetails) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        className={cn(
          "w-full sm:max-w-md md:max-w-3xl lg:max-w-4xl",
          "flex flex-col p-0 gap-0",
        )}>
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <SheetTitle className="text-lg font-medium">
                {userDetails.userName}
              </SheetTitle>
              <Badge
                variant="outline"
                className="font-mono text-xs gap-1 cursor-pointer hover:bg-muted rounded-full"
                onClick={() => copyToClipboard(userDetails.userId)}>
                <Copy className="h-3 w-3" />
                {userDetails.userId.slice(0, 8)}…
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 mt-0.5"
              onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-6">
            {/* Summary stat row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-lg px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Package className="h-3 w-3" /> Products
                </p>
                <p className="text-xl font-medium">
                  {userDetails.summary.totalProducts}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" /> Orders
                </p>
                <p className="text-xl font-medium">
                  {userDetails.summary.totalOrders}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/40 rounded-lg px-4 py-3">
                <p className="text-xs text-green-700 dark:text-green-400 mb-1">
                  Total commission
                </p>
                <p className="text-xl font-medium text-green-700 dark:text-green-400">
                  {formatCurrency(userDetails.summary.totalCommissionAmount)}
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Performance Metrics
              </h3>
              <PerformanceMetricsCard
                performance={userDetails.performance}
                statusTrends={userDetails.statusTrends}
              />
            </section>

            {/* Status Trends */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Commission Status Trends
              </h3>
              <StatusTrendsCard trends={userDetails.statusTrends} />
            </section>

            {/* Timeline Chart */}
            {userDetails.timeline.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Commission Timeline
                </h3>
                <CommissionTimelineChart timeline={userDetails.timeline} />
              </section>
            )}

            <Separator />

            {/* Top Products */}
            {userDetails.topProducts.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Top Performing Products
                </h3>
                <TopPerformersCard topProducts={userDetails.topProducts} />
              </section>
            )}

            <Separator />

            {/* Summary Stats */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Commission Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-lg px-4 py-3">
                  <p className="text-xs text-muted-foreground">Total Commission</p>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(userDetails.summary.totalCommissionAmount)}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/40 rounded-lg px-4 py-3">
                  <p className="text-xs text-green-700 dark:text-green-400">Paid Amount</p>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                    {formatCurrency(userDetails.summary.paidAmount)}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/40 rounded-lg px-4 py-3">
                  <p className="text-xs text-blue-700 dark:text-blue-400">Unpaid Amount</p>
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                    {formatCurrency(userDetails.summary.unpaidAmount)}
                  </p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-950/40 rounded-lg px-4 py-3">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">Pending Amount</p>
                  <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
                    {formatCurrency(userDetails.summary.pendingAmount)}
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Date Range */}
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Commission Period
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">First Commission</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(userDetails.summary.firstCommissionDate)}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last Commission</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(userDetails.summary.lastCommissionDate)}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{userDetails.userName}</span>
            <span>•</span>
            <span>{userDetails.summary.totalProducts} products</span>
            <span>•</span>
            <span>{userDetails.summary.totalOrders} orders</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
