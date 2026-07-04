import { useState, useEffect, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Checkbox } from "../../components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import {
  RefreshCw,
  Activity,
  Shield,
  Package,
  PlayCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Database,
  Trash2,
  Flame,
  ChevronRight,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "../../api/axios";

interface JobStatus {
  isRunning: boolean;
  lastRun: string | null;
  nextRun: string;
}

interface FraudStats {
  total: number;
  analyzed: number;
  riskDistribution: {
    green: number;
    yellow: number;
    red: number;
  };
  highRisk: number;
}

interface SalesStatsResult {
  productsUpdated: number;
  duration: string;
}

interface CacheWarmupResult {
  totalSuccess: number;
  totalFailed: number;
  details: {
    [key: string]: {
      success: number;
      failed: number;
    };
  };
}

interface CacheWarmupStatus {
  isRunning: boolean;
  description: string;
}

interface CacheStats {
  connected: boolean;
  info: string;
}

const CACHE_TARGETS = [
  { value: "productListings", label: "Product Listings" },
  { value: "categories", label: "Categories" },
  { value: "featuredProducts", label: "Featured Products" },
  { value: "campaign", label: "Campaign" },
  { value: "searchResults", label: "Search Results" },
  { value: "filterData", label: "Filter Data" },
];

const COLORS = [
  "bg-red-50 text-red-700",
  "bg-orange-50 text-orange-700",
  "bg-yellow-50 text-yellow-700",
  "bg-green-50 text-green-700",
  "bg-blue-50 text-blue-700",
  "bg-indigo-50 text-indigo-700",
  "bg-purple-50 text-purple-700",
  "bg-pink-50 text-pink-700",
];

// ---- Small presentational helpers (styling only, no logic) ----

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className='text-[11px] font-semibold uppercase tracking-widest text-slate-400'>
    {children}
  </p>
);

const IconAvatar = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${className}`}>
    {children}
  </div>
);

const StatBlock = ({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  tone?: "default" | "danger" | "success";
}) => {
  const toneClasses =
    tone === "danger"
      ? "bg-red-50 text-red-700"
      : tone === "success"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-slate-50 text-slate-700";
  return (
    <div className={`rounded-xl p-3 ${toneClasses}`}>
      <div className='text-[10px] font-semibold uppercase tracking-widest opacity-70'>
        {label}
      </div>
      <div className='mt-0.5 text-xl font-bold'>{value}</div>
    </div>
  );
};

const JobsManagement = () => {
  const [loading, setLoading] = useState({
    salesStats: false,
    initStats: false,
    fraudDetection: false,
    allJobs: false,
    status: false,
    cacheWarmup: false,
    flushCache: false,
    cacheStats: false,
  });

  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [fraudStats, setFraudStats] = useState<FraudStats | null>(null);
  const [salesStatsResult, setSalesStatsResult] =
    useState<SalesStatsResult | null>(null);
  const [cacheWarmupResult, setCacheWarmupResult] =
    useState<CacheWarmupResult | null>(null);
  const [cacheWarmupStatus, setCacheWarmupStatus] =
    useState<CacheWarmupStatus | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);

  // Cache warmup options
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [flushBefore, setFlushBefore] = useState(false);

  useEffect(() => {
    checkFraudJobStatus();
    checkCacheWarmupStatus();
    getCacheStats();
  }, []);

  const checkFraudJobStatus = async () => {
    try {
      setLoading((prev) => ({ ...prev, status: true }));
      const response = await axiosInstance.get(
        "/api/v1/jobs/fraud-detection-status",
      );

      if (response.data.success) {
        setJobStatus(response.data.data);
      }
    } catch (error) {
      console.error("Failed to check job status:", error);
    } finally {
      setLoading((prev) => ({ ...prev, status: false }));
    }
  };

  const checkCacheWarmupStatus = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/v1/jobs/cache-warmup-status",
      );

      if (response.data.success) {
        setCacheWarmupStatus(response.data.data);
      }
    } catch (error) {
      console.error("Failed to check cache warmup status:", error);
    }
  };

  const getCacheStats = async () => {
    try {
      setLoading((prev) => ({ ...prev, cacheStats: true }));
      const response = await axiosInstance.get("/api/v1/jobs/cache-stats");

      if (response.data.success) {
        setCacheStats(response.data.data);
      }
    } catch (error) {
      console.error("Failed to get cache stats:", error);
    } finally {
      setLoading((prev) => ({ ...prev, cacheStats: false }));
    }
  };

  const updateSalesStats = async () => {
    try {
      setLoading((prev) => ({ ...prev, salesStats: true }));
      const response = await axiosInstance.post(
        "/api/v1/jobs/trigger-sales-stats",
      );

      if (response.data.success) {
        setSalesStatsResult(response.data.data);
        toast.success(
          `Updated ${response.data.data.productsUpdated} products in ${response.data.data.duration}`,
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to update sales statistics",
      );
    } finally {
      setLoading((prev) => ({ ...prev, salesStats: false }));
    }
  };

  const initializeSalesStats = async () => {
    const confirmed = window.confirm(
      "This will initialize sales statistics for all products. This may take a while. Continue?",
    );

    if (!confirmed) return;

    try {
      setLoading((prev) => ({ ...prev, initStats: true }));
      const response = await axiosInstance.post(
        "/api/v1/jobs/initialize-sales-stats",
      );

      if (response.data.success) {
        toast.success(
          `Initialized ${response.data.data.productsUpdated} products in ${response.data.data.duration}`,
        );
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to initialize");
    } finally {
      setLoading((prev) => ({ ...prev, initStats: false }));
    }
  };

  const triggerFraudDetection = async () => {
    try {
      setLoading((prev) => ({ ...prev, fraudDetection: true }));

      const response = await axiosInstance.post(
        "/api/v1/jobs/trigger-fraud-detection",
      );

      if (response.status === 409) {
        toast.warning("Fraud detection is already running. Please wait.");
        return;
      }

      if (response.data.success) {
        const { results, highRiskCustomersDetected, duration } =
          response.data.data;

        toast.success(
          `Analysis completed in ${duration}. Found ${highRiskCustomersDetected} high-risk customers.`,
        );

        setFraudStats({
          total: results.total,
          analyzed: results.analyzed,
          riskDistribution: results.riskDistribution,
          highRisk: highRiskCustomersDetected,
        });

        await checkFraudJobStatus();
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.warning("Fraud detection is already running. Please wait.");
      } else {
        toast.error(
          error?.response?.data?.error || "Failed to run fraud detection",
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, fraudDetection: false }));
    }
  };

  const triggerCacheWarmup = async () => {
    try {
      setLoading((prev) => ({ ...prev, cacheWarmup: true }));

      const options: any = {};
      if (flushBefore) options.flushBefore = true;
      if (selectedTargets.length > 0) options.targets = selectedTargets;

      const response = await axiosInstance.post(
        "/api/v1/jobs/trigger-cache-warmup",
        options,
      );

      if (response.status === 409) {
        toast.warning("Cache warmup is already running. Please wait.");
        return;
      }

      if (response.data.success) {
        const { totalSuccess, totalFailed } = response.data.data.results;

        setCacheWarmupResult(response.data.data.results);

        toast.success(
          `Cache warmup completed! ${totalSuccess} items cached in ${response.data.data.duration}`,
        );

        if (totalFailed > 0) {
          toast.warning(
            `${totalFailed} items failed. Check console for details.`,
          );
          console.warn("Errors:", response.data.data.errors);
        }

        await checkCacheWarmupStatus();
      }
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.warning("Cache warmup is already running. Please wait.");
      } else {
        toast.error(error?.response?.data?.error || "Failed to warm up cache");
      }
    } finally {
      setLoading((prev) => ({ ...prev, cacheWarmup: false }));
    }
  };

  const flushCache = async () => {
    const confirmed = window.confirm(
      "⚠️ WARNING: This will clear ALL cached data. Are you sure?",
    );

    if (!confirmed) return;

    try {
      setLoading((prev) => ({ ...prev, flushCache: true }));

      const response = await axiosInstance.post("/api/v1/jobs/flush-cache");

      if (response.data.success) {
        toast.success("Cache flushed successfully");
        setCacheWarmupResult(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to flush cache");
    } finally {
      setLoading((prev) => ({ ...prev, flushCache: false }));
    }
  };

  const triggerAllJobs = async () => {
    const confirmed = window.confirm(
      "This will trigger all background jobs. This may take several minutes. Continue?",
    );

    if (!confirmed) return;

    try {
      setLoading((prev) => ({ ...prev, allJobs: true }));

      const response = await axiosInstance.post("/api/v1/jobs/trigger-all");

      if (response.data.success) {
        toast.success("All jobs completed successfully!");

        // Update individual results
        if (response.data.data.salesStats) {
          setSalesStatsResult({
            productsUpdated: response.data.data.salesStats.productsUpdated,
            duration: `${response.data.data.salesStats.duration}ms`,
          });
        }

        if (response.data.data.fraudDetection?.results) {
          const fd = response.data.data.fraudDetection;
          setFraudStats({
            total: fd.results.total,
            analyzed: fd.results.analyzed,
            riskDistribution: fd.results.riskDistribution,
            highRisk: fd.highRiskCustomersDetected,
          });
        }

        await checkFraudJobStatus();
      } else {
        toast.warning("Some jobs failed or were skipped. Check the results.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to trigger jobs");
    } finally {
      setLoading((prev) => ({ ...prev, allJobs: false }));
    }
  };

  const toggleTarget = (target: string) => {
    setSelectedTargets((prev) =>
      prev.includes(target)
        ? prev.filter((t) => t !== target)
        : [...prev, target],
    );
  };

  const AlertDialogDemo = ({ children }: { children: ReactNode }) => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        <AlertDialogContent className='rounded-2xl'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-red-600'>
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className='text-slate-600 font-medium'>
              This action cannot be undone. It will run multiple maintenance
              tasks at once, which may take a while to finish. During this time,
              the server might respond slower than usual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='rounded-lg'>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='rounded-lg bg-red-600 text-white hover:bg-red-700'
              onClick={() => triggerAllJobs()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <div className='min-h-screen bg-slate-50 pb-10'>
      {/* Sticky mobile-style header */}
      <div className='sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur-md'>
        <div className='mx-auto max-w-6xl px-4 py-4 sm:px-6'>
          <div className='flex items-center gap-3'>
            <IconAvatar className='h-11 w-11 bg-indigo-600 text-white shadow-sm shadow-indigo-200'>
              <Activity className='h-5 w-5' />
            </IconAvatar>
            <div className='min-w-0'>
              <h1 className='truncate text-lg font-bold text-slate-900 sm:text-2xl'>
                System Jobs & Cache
              </h1>
              <p className='truncate text-xs text-slate-500 sm:text-sm'>
                Background jobs, cache warmup & maintenance
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6'>
        {/* Status Bar */}
        <div className='grid gap-3 sm:grid-cols-2'>
          {/* Job Status */}
          {jobStatus && (
            <div className='flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm'>
              <IconAvatar
                className={
                  jobStatus.isRunning
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-emerald-50 text-emerald-600"
                }>
                <Activity className='h-4.5 w-4.5' />
              </IconAvatar>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-sm font-semibold text-slate-800'>
                    Background Jobs
                  </span>
                  <Badge
                    variant={jobStatus.isRunning ? "default" : "secondary"}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      jobStatus.isRunning
                        ? "bg-indigo-600 hover:bg-indigo-600"
                        : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                    }`}>
                    {jobStatus.isRunning ? (
                      <>
                        <RefreshCw className='mr-1 h-3 w-3 animate-spin' />
                        Running
                      </>
                    ) : (
                      <>
                        <CheckCircle className='mr-1 h-3 w-3' />
                        Idle
                      </>
                    )}
                  </Badge>
                </div>
                <div className='mt-1 flex items-center gap-1 text-xs text-slate-500'>
                  <Clock className='h-3 w-3' />
                  Next scheduled: {jobStatus.nextRun}
                </div>
              </div>
            </div>
          )}

          {/* Cache Status */}
          {cacheStats && (
            <div className='flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm'>
              <IconAvatar
                className={
                  cacheStats.connected
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-red-50 text-red-600"
                }>
                <Database className='h-4.5 w-4.5' />
              </IconAvatar>
              <div className='min-w-0 flex-1'>
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-sm font-semibold text-slate-800'>
                    Redis Cache
                  </span>
                  <Badge
                    variant={cacheStats.connected ? "default" : "destructive"}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      cacheStats.connected
                        ? "bg-indigo-600 hover:bg-indigo-600"
                        : ""
                    }`}>
                    {cacheStats.connected ? (
                      <>
                        <CheckCircle className='mr-1 h-3 w-3' />
                        Connected
                      </>
                    ) : (
                      <>
                        <AlertCircle className='mr-1 h-3 w-3' />
                        Disconnected
                      </>
                    )}
                  </Badge>
                </div>
                <div className='mt-1 text-xs text-slate-500'>
                  {cacheWarmupStatus?.isRunning ? (
                    <span className='inline-flex items-center gap-1 font-medium text-indigo-600'>
                      <RefreshCw className='h-3 w-3 animate-spin' />
                      Warmup running
                    </span>
                  ) : (
                    "No warmup in progress"
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trigger All Jobs */}
        <Card className='overflow-hidden rounded-2xl border-slate-100 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200/50'>
          <CardContent className='p-4 sm:p-5'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-3'>
                <IconAvatar className='h-11 w-11 bg-white/15 text-white'>
                  <PlayCircle className='h-5 w-5' />
                </IconAvatar>
                <div>
                  <p className='text-sm font-semibold'>Run All Jobs</p>
                  <p className='text-xs text-indigo-100'>
                    Trigger every background job for full system maintenance
                  </p>
                </div>
              </div>
              <AlertDialogDemo>
                <Button
                  disabled={loading.allJobs || jobStatus?.isRunning}
                  size='lg'
                  className='w-full rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 sm:w-auto'>
                  {loading.allJobs ? (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                      Running...
                    </>
                  ) : (
                    <>
                      <PlayCircle className='mr-2 h-4 w-4' />
                      Trigger All Jobs
                    </>
                  )}
                </Button>
              </AlertDialogDemo>
            </div>
          </CardContent>
        </Card>

        {/* Individual Jobs Grid */}
        <div className='grid gap-4 md:grid-cols-2'>
          {/* Sales Statistics */}
          <Card className='rounded-2xl border-slate-100 shadow-sm'>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-3'>
                <IconAvatar className='bg-blue-50 text-blue-600'>
                  <Package className='h-4.5 w-4.5' />
                </IconAvatar>
                <div className='min-w-0'>
                  <CardTitle className='text-sm font-semibold sm:text-base'>
                    Product Sales Statistics
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Update totalSold and totalReturned for all products
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex gap-2'>
                <Button
                  onClick={updateSalesStats}
                  disabled={loading.salesStats}
                  className='h-9 flex-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700'>
                  {loading.salesStats ? (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4' />
                      Update Stats
                    </>
                  )}
                </Button>
                <Button
                  onClick={initializeSalesStats}
                  disabled={loading.initStats}
                  variant='outline'
                  className='h-9 rounded-lg border-slate-200'>
                  {loading.initStats ? (
                    <RefreshCw className='h-4 w-4 animate-spin' />
                  ) : (
                    "Initialize"
                  )}
                </Button>
              </div>

              {salesStatsResult && (
                <div className='rounded-xl border border-slate-100 bg-slate-50 p-3'>
                  <SectionLabel>Last Update</SectionLabel>
                  <div className='mt-2 grid grid-cols-2 gap-2'>
                    <StatBlock
                      label='Updated'
                      value={salesStatsResult.productsUpdated.toLocaleString()}
                    />
                    <StatBlock
                      label='Duration'
                      value={salesStatsResult.duration}
                    />
                  </div>
                </div>
              )}

              <div className='flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500'>
                <Info className='mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400' />
                <p>Runs automatically every 10 minutes</p>
              </div>
            </CardContent>
          </Card>

          {/* Fraud Detection */}
          <Card className='rounded-2xl border-slate-100 shadow-sm'>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-3'>
                <IconAvatar className='bg-red-50 text-red-600'>
                  <Shield className='h-4.5 w-4.5' />
                </IconAvatar>
                <div className='min-w-0'>
                  <CardTitle className='text-sm font-semibold sm:text-base'>
                    Fraud Detection Analysis
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Analyze all customers for fraud risk & suspicious patterns
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Button
                onClick={triggerFraudDetection}
                disabled={loading.fraudDetection || jobStatus?.isRunning}
                className='h-9 w-full rounded-lg bg-red-600 text-white hover:bg-red-700'>
                {loading.fraudDetection ? (
                  <>
                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className='mr-2 h-4 w-4' />
                    Run Fraud Detection
                  </>
                )}
              </Button>

              {fraudStats && (
                <div className='rounded-xl border border-slate-100 bg-slate-50 p-3'>
                  <SectionLabel>Latest Analysis Results</SectionLabel>
                  <div className='mt-2 grid grid-cols-2 gap-2'>
                    <StatBlock
                      label='Total Analyzed'
                      value={fraudStats.analyzed.toLocaleString()}
                    />
                    <StatBlock
                      label='High Risk'
                      value={fraudStats.highRisk}
                      tone='danger'
                    />
                  </div>

                  <div className='mt-2 flex flex-wrap gap-1.5 text-[11px]'>
                    <Badge
                      variant='outline'
                      className='rounded-full border-green-200 bg-green-50 text-green-700'>
                      Low: {fraudStats.riskDistribution.green}
                    </Badge>
                    <Badge
                      variant='outline'
                      className='rounded-full border-yellow-200 bg-yellow-50 text-yellow-700'>
                      Medium: {fraudStats.riskDistribution.yellow}
                    </Badge>
                    <Badge
                      variant='outline'
                      className='rounded-full border-red-200 bg-red-50 text-red-700'>
                      High: {fraudStats.riskDistribution.red}
                    </Badge>
                  </div>
                </div>
              )}

              <div className='flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500'>
                <Info className='mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400' />
                <p>Runs automatically daily at 12:00 AM</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cache Management Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2 px-1'>
            <Zap className='h-4.5 w-4.5 text-indigo-600' />
            <h2 className='text-base font-bold text-slate-900 sm:text-lg'>
              Cache Management
            </h2>
          </div>

          <Card className='rounded-2xl border-slate-100 shadow-sm'>
            <CardHeader className='pb-3'>
              <div className='flex items-center gap-3'>
                <IconAvatar className='bg-orange-50 text-orange-600'>
                  <Flame className='h-4.5 w-4.5' />
                </IconAvatar>
                <div className='min-w-0'>
                  <CardTitle className='text-sm font-semibold sm:text-base'>
                    Cache Warmup
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Pre-populate Redis with frequently accessed data
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Options */}
              <div className='space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-3'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='flush-before'
                    checked={flushBefore}
                    onCheckedChange={(checked) =>
                      setFlushBefore(checked as boolean)
                    }
                    disabled={
                      loading.cacheWarmup ||
                      cacheWarmupStatus?.isRunning ||
                      !cacheStats?.connected
                    }
                    className='data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600'
                  />
                  <label
                    htmlFor='flush-before'
                    className='text-sm font-medium leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                    Flush cache before warming up
                    <span className='ml-2 text-xs text-slate-400'>
                      (clears existing cache first)
                    </span>
                  </label>
                </div>

                <div className='space-y-2'>
                  <SectionLabel>
                    Select targets (leave empty for all)
                  </SectionLabel>
                  <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
                    {CACHE_TARGETS.map((target) => (
                      <div
                        key={target.value}
                        className='flex items-center space-x-2 rounded-lg bg-white px-2 py-1.5 shadow-sm'>
                        <Checkbox
                          id={target.value}
                          checked={selectedTargets.includes(target.value)}
                          onCheckedChange={() => toggleTarget(target.value)}
                          disabled={
                            loading.cacheWarmup ||
                            cacheWarmupStatus?.isRunning ||
                            !cacheStats?.connected
                          }
                          className='data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600'
                        />
                        <label
                          htmlFor={target.value}
                          className='truncate text-xs font-medium leading-none text-slate-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                          {target.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='grid grid-cols-1 gap-2 sm:flex'>
                <Button
                  onClick={triggerCacheWarmup}
                  disabled={
                    loading.cacheWarmup ||
                    cacheWarmupStatus?.isRunning ||
                    !cacheStats?.connected
                  }
                  className='h-9 flex-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700'>
                  {loading.cacheWarmup ? (
                    <>
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                      Warming Up...
                    </>
                  ) : (
                    <>
                      <Flame className='mr-2 h-4 w-4' />
                      Warm Up Cache
                    </>
                  )}
                </Button>
                <Button
                  onClick={flushCache}
                  disabled={
                    loading.flushCache ||
                    cacheWarmupStatus?.isRunning ||
                    !cacheStats?.connected
                  }
                  variant='destructive'
                  className='h-9 rounded-lg'>
                  {loading.flushCache ? (
                    <RefreshCw className='h-4 w-4 animate-spin' />
                  ) : (
                    <>
                      <Trash2 className='mr-2 h-4 w-4' />
                      Flush Cache
                    </>
                  )}
                </Button>
              </div>

              {/* Results */}
              {cacheWarmupResult && (
                <div className='rounded-xl border border-slate-100 bg-slate-50 p-3'>
                  <SectionLabel>Cache Warmup Results</SectionLabel>
                  <div className='mt-2 grid grid-cols-2 gap-2'>
                    <StatBlock
                      label='Successfully Cached'
                      value={cacheWarmupResult.totalSuccess}
                      tone='success'
                    />
                    <StatBlock
                      label='Failed'
                      value={cacheWarmupResult.totalFailed}
                      tone={
                        cacheWarmupResult.totalFailed > 0 ? "danger" : "default"
                      }
                    />
                  </div>
                  <div className='mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3'>
                    {Object.entries(cacheWarmupResult.details).map(
                      ([key, value], index: number) => (
                        <div
                          key={key}
                          className={`flex items-center justify-between rounded-lg p-2 text-[11px] ${
                            COLORS[index % COLORS.length]
                          }`}>
                          <span className='truncate uppercase tracking-wide'>
                            {key}
                          </span>
                          {!!value && (
                            <span className='ml-1 shrink-0 rounded-md bg-white px-1.5 py-0.5 font-semibold'>
                              {value?.success}
                            </span>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className='rounded-xl border border-indigo-100 bg-indigo-50 p-3'>
                <div className='flex items-center gap-2 text-indigo-900'>
                  <AlertCircle className='h-4 w-4 text-indigo-600' />
                  <span className='text-xs font-semibold'>
                    When to use Cache Warmup?
                  </span>
                </div>
                <ul className='mt-2 space-y-1 text-xs text-indigo-800'>
                  {[
                    "Before campaign launches or sales events",
                    "After server deployment or restart",
                    "Before flash sales or peak traffic periods",
                    "When experiencing performance issues",
                  ].map((item) => (
                    <li key={item} className='flex items-start gap-1.5'>
                      <ChevronRight className='mt-0.5 h-3 w-3 shrink-0 text-indigo-400' />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Panel */}
        <div className='rounded-2xl border border-slate-100 bg-white p-4 shadow-sm'>
          <div className='flex items-center gap-2'>
            <AlertCircle className='h-4 w-4 text-slate-400' />
            <span className='text-sm font-semibold text-slate-800'>
              Important Notes
            </span>
          </div>
          <ul className='mt-2 space-y-1.5 text-xs text-slate-500'>
            {[
              "Jobs may take several minutes to complete",
              "Avoid triggering the same job multiple times simultaneously",
              "Monitor the system status indicators for job progress",
              "Cache warmup typically takes 10-30 seconds",
              "All jobs run automatically on schedule - manual triggers are for immediate needs",
            ].map((note) => (
              <li key={note} className='flex items-start gap-1.5'>
                <ChevronRight className='mt-0.5 h-3 w-3 shrink-0 text-slate-300' />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JobsManagement;
