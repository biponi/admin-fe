import {
  Shield,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  Clock,
  Flag,
  XCircle,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../../components/ui/drawer";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";
import { FraudDetection } from "../interface";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface FraudDetectionDrawerProps {
  fraudDetection?: FraudDetection;
  customerName: string;
  phoneNumber: string;
  trigger?: React.ReactNode;
}

const FraudDetectionDrawer: React.FC<FraudDetectionDrawerProps> = ({
  fraudDetection,
  customerName,
  phoneNumber,
  trigger,
}) => {
  if (!fraudDetection) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          {trigger || (
            <Button variant='ghost' size='sm'>
              <Shield className='h-4 w-4 text-muted-foreground' />
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Fraud Detection
            </DrawerTitle>
            <DrawerDescription>
              No fraud detection data available for this order
            </DrawerDescription>
          </DrawerHeader>
          <div className='p-4 text-center text-muted-foreground'>
            <AlertCircle className='h-12 w-12 mx-auto mb-2 opacity-50' />
            <p>This order has not been analyzed for fraud risk yet.</p>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant='outline'>Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  const getRiskConfig = (riskLevel: string) => {
    switch (riskLevel) {
      case "red":
        return {
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-950",
          borderColor: "border-red-200 dark:border-red-800",
          icon: AlertTriangle,
          label: "High Risk",
          description: "This customer shows high-risk patterns",
        };
      case "yellow":
        return {
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-50 dark:bg-yellow-950",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          icon: AlertCircle,
          label: "Medium Risk",
          description: "This customer shows moderate risk indicators",
        };
      case "green":
      default:
        return {
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-950",
          borderColor: "border-green-200 dark:border-green-800",
          icon: CheckCircle,
          label: "Low Risk",
          description: "This customer appears safe",
        };
    }
  };

  const riskConfig = getRiskConfig(fraudDetection.riskLevel);
  const RiskIcon = riskConfig.icon;

  const getMetricColor = (value: number, isInverted = false) => {
    if (isInverted) {
      // For completion rate (higher is better)
      if (value >= 70) return "text-green-600";
      if (value >= 40) return "text-yellow-600";
      return "text-red-600";
    } else {
      // For cancellation/return rate (lower is better)
      if (value <= 10) return "text-green-600";
      if (value <= 30) return "text-yellow-600";
      return "text-red-600";
    }
  };

  const MainView = () => {
    return (
      <div className='px-4 pb-4 md:px-0 md:pb-0 md:pt-2 overflow-y-auto space-y-4'>
        {/* Risk Level Card */}
        <Card className={`${riskConfig.borderColor} border-2`}>
          <CardContent className='p-4'>
            <div className='flex items-start justify-between'>
              <div className='flex items-start gap-3'>
                <div className={`${riskConfig.bgColor} p-3 rounded-full`}>
                  <RiskIcon className={`h-6 w-6 ${riskConfig.color}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${riskConfig.color}`}>
                    {riskConfig.label}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {riskConfig.description}
                  </p>
                </div>
              </div>
              <Badge variant='outline' className={riskConfig.bgColor}>
                Score: {fraudDetection.riskScore}
              </Badge>
            </div>

            <Separator className='my-3' />

            <div className='grid grid-cols-2 gap-3'>
              <div className={`${riskConfig.bgColor} p-3 rounded-lg`}>
                <p className='text-xs text-muted-foreground mb-1'>Risk Score</p>
                <p className={`text-2xl font-bold ${riskConfig.color}`}>
                  {fraudDetection.riskScore}
                  <span className='text-sm'>/100</span>
                </p>
              </div>
              <div className={`${riskConfig.bgColor} p-3 rounded-lg`}>
                <p className='text-xs text-muted-foreground mb-1'>
                  Fraud Probability
                </p>
                <p className={`text-2xl font-bold ${riskConfig.color}`}>
                  {fraudDetection.fraudProbability}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Counts */}
        {fraudDetection.metrics &&
          (fraudDetection.metrics.cancelledOrderCount !== undefined ||
            fraudDetection.metrics.returnOrderCount !== undefined) && (
            <Card>
              <CardContent className='p-4'>
                <h4 className='font-semibold mb-3 flex items-center gap-2'>
                  <ShoppingCart className='h-4 w-4' />
                  Order History
                </h4>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                  {fraudDetection.metrics.totalOrderCount !== undefined && (
                    <div className='bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-center'>
                      <p className='text-xs text-muted-foreground mb-1'>
                        Total Orders
                      </p>
                      <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                        {fraudDetection.metrics.totalOrderCount}
                      </p>
                    </div>
                  )}
                  {fraudDetection.metrics.cancelledOrderCount !== undefined && (
                    <div className='bg-red-50 dark:bg-red-950 p-3 rounded-lg text-center'>
                      <div className='flex items-center justify-center gap-1 mb-1'>
                        <XCircle className='h-3 w-3 text-red-600 dark:text-red-400' />
                        <p className='text-xs text-muted-foreground'>
                          Cancelled
                        </p>
                      </div>
                      <p className='text-2xl font-bold text-red-600 dark:text-red-400'>
                        {fraudDetection.metrics.cancelledOrderCount}
                      </p>
                    </div>
                  )}

                  {fraudDetection.metrics.returnOrderCount !== undefined && (
                    <div className='bg-orange-50 dark:bg-orange-950 p-3 rounded-lg text-center'>
                      <div className='flex items-center justify-center gap-1 mb-1'>
                        <RotateCcw className='h-3 w-3 text-orange-600 dark:text-orange-400' />
                        <p className='text-xs text-muted-foreground'>
                          Returned
                        </p>
                      </div>
                      <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                        {fraudDetection.metrics.returnOrderCount}
                      </p>
                    </div>
                  )}
                  {fraudDetection.metrics.lastCancellationDate !==
                    undefined && (
                    <div className='col-span-2 md:col-span-1 bg-red-50 dark:bg-red-950 p-3 rounded-lg text-center'>
                      <div className='flex items-center justify-center gap-1 mb-1'>
                        <XCircle className='h-3 w-3 text-pink-600 dark:text-red-400' />
                        <p className='text-xs text-muted-foreground'>
                          Last Cancelled At:
                        </p>
                      </div>
                      <p className='text-base md:text-lg font-bold text-pink-600 dark:text-red-400'>
                        {fraudDetection.metrics.lastCancellationDate
                          ? dayjs(
                              fraudDetection.metrics.lastCancellationDate
                            ).format("MMM D, YYYY")
                          : "N/A"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Customer Metrics */}
        {fraudDetection.metrics && (
          <Card>
            <CardContent className='p-4'>
              <h4 className='font-semibold mb-3 flex items-center gap-2'>
                <TrendingDown className='h-4 w-4' />
                Customer Behavior Metrics
              </h4>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Cancellation Rate
                  </span>
                  <div className='flex items-center gap-2'>
                    <div className='w-24 bg-muted rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${
                          fraudDetection.metrics.cancellationRate <= 10
                            ? "bg-green-500"
                            : fraudDetection.metrics.cancellationRate <= 30
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            fraudDetection.metrics.cancellationRate,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold ${getMetricColor(
                        fraudDetection.metrics.cancellationRate
                      )}`}>
                      {fraudDetection.metrics.cancellationRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Return Rate
                  </span>
                  <div className='flex items-center gap-2'>
                    <div className='w-24 bg-muted rounded-full h-2'>
                      <div
                        className={`h-2 rounded-full ${
                          fraudDetection.metrics.returnRate <= 10
                            ? "bg-green-500"
                            : fraudDetection.metrics.returnRate <= 30
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            fraudDetection.metrics.returnRate,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold ${getMetricColor(
                        fraudDetection.metrics.returnRate
                      )}`}>
                      {fraudDetection.metrics.returnRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Completion Rate
                  </span>
                  <div className='flex items-center gap-2'>
                    <div className='w-24 bg-muted rounded-full h-2'>
                      <div
                        className='h-2 rounded-full bg-green-500'
                        style={{
                          width: `${fraudDetection.metrics.completionRate}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold ${getMetricColor(
                        fraudDetection.metrics.completionRate,
                        true
                      )}`}>
                      {fraudDetection.metrics.completionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fraud Flags */}
        {fraudDetection.fraudFlags && fraudDetection.fraudFlags.length > 0 && (
          <Card className='border-red-200 dark:border-red-800'>
            <CardContent className='p-4'>
              <h4 className='font-semibold mb-3 flex items-center gap-2 text-red-600 dark:text-red-400'>
                <Flag className='h-4 w-4' />
                Fraud Indicators ({fraudDetection.fraudFlags.length})
              </h4>
              <div className='space-y-2'>
                {fraudDetection.fraudFlags.map((flag, index) => (
                  <div
                    key={index}
                    className='flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950 rounded-md'>
                    <AlertTriangle className='h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0' />
                    <span className='text-sm text-red-900 dark:text-red-100'>
                      {flag
                        .split("_")
                        .join(" ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Analyzed */}
        <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
          <Clock className='h-3 w-3' />
          <span>
            Last analyzed {dayjs(fraudDetection.lastAnalyzedAt).fromNow()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <Drawer>
        <DrawerTrigger asChild className='md:hidden'>
          {trigger || (
            <Button variant='ghost' size='sm'>
              <Shield className={`h-4 w-4 ${riskConfig.color}`} />
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className='max-h-[90vh]'>
          <DrawerHeader>
            <DrawerTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Fraud Risk Analysis
            </DrawerTitle>
            <DrawerDescription>
              Customer: {customerName} • {phoneNumber}
            </DrawerDescription>
          </DrawerHeader>
          <MainView />
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant='outline'>Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      <Sheet>
        <SheetTrigger
          asChild
          className={`hidden md:flex justify-center items-center border rounded-md ${riskConfig.borderColor} ${riskConfig.bgColor} shadow-sm`}>
          {trigger || (
            <Button
              variant='ghost'
              size='sm'
              className='flex justify-center items-center'>
              <Shield className={`h-5 w-5 ${riskConfig.color}`} />
            </Button>
          )}
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5' />
              Fraud Risk Analysis
            </SheetTitle>
            <SheetDescription>
              Customer: {customerName} • {phoneNumber}
            </SheetDescription>
          </SheetHeader>
          <MainView />
          <SheetFooter>
            <SheetClose asChild>
              <Button variant='outline'>Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FraudDetectionDrawer;
