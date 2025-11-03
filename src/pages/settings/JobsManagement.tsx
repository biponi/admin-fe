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
        "/api/v1/jobs/fraud-detection-status"
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
        "/api/v1/jobs/cache-warmup-status"
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
        "/api/v1/jobs/trigger-sales-stats"
      );

      if (response.data.success) {
        setSalesStatsResult(response.data.data);
        toast.success(
          `Updated ${response.data.data.productsUpdated} products in ${response.data.data.duration}`
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to update sales statistics"
      );
    } finally {
      setLoading((prev) => ({ ...prev, salesStats: false }));
    }
  };

  const initializeSalesStats = async () => {
    const confirmed = window.confirm(
      "This will initialize sales statistics for all products. This may take a while. Continue?"
    );

    if (!confirmed) return;

    try {
      setLoading((prev) => ({ ...prev, initStats: true }));
      const response = await axiosInstance.post(
        "/api/v1/jobs/initialize-sales-stats"
      );

      if (response.data.success) {
        toast.success(
          `Initialized ${response.data.data.productsUpdated} products in ${response.data.data.duration}`
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
        "/api/v1/jobs/trigger-fraud-detection"
      );

      if (response.status === 409) {
        toast.warning("Fraud detection is already running. Please wait.");
        return;
      }

      if (response.data.success) {
        const { results, highRiskCustomersDetected, duration } =
          response.data.data;

        toast.success(
          `Analysis completed in ${duration}. Found ${highRiskCustomersDetected} high-risk customers.`
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
          error?.response?.data?.error || "Failed to run fraud detection"
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
        options
      );

      if (response.status === 409) {
        toast.warning("Cache warmup is already running. Please wait.");
        return;
      }

      if (response.data.success) {
        const { totalSuccess, totalFailed } = response.data.data.results;

        setCacheWarmupResult(response.data.data.results);

        toast.success(
          `Cache warmup completed! ${totalSuccess} items cached in ${response.data.data.duration}`
        );

        if (totalFailed > 0) {
          toast.warning(
            `${totalFailed} items failed. Check console for details.`
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
      "⚠️ WARNING: This will clear ALL cached data. Are you sure?"
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
      "This will trigger all background jobs. This may take several minutes. Continue?"
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
        : [...prev, target]
    );
  };

  const AlertDialogDemo = ({ children }: { children: ReactNode }) => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-red-600'>
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className='text-[#3d3d3d] font-semibold'>
              This action cannot be undone. It will run multiple maintenance
              tasks at once, which may take a while to finish. During this time,
              the server might respond slower than usual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-red-700 text-white'
              onClick={() => triggerAllJobs()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <div className='container mx-auto p-6 space-y-6 max-w-6xl'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold'>System Jobs & Cache Management</h1>
        <p className='text-muted-foreground mt-2'>
          Manage background jobs, cache warmup, and system maintenance tasks
        </p>
      </div>

      {/* Status Bar */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* Job Status */}
        {jobStatus && (
          <Alert>
            <Activity className='h-4 w-4' />
            <AlertTitle className='flex items-center gap-2'>
              Background Jobs
              <Badge
                variant={jobStatus.isRunning ? "default" : "secondary"}
                className='ml-2'>
                {jobStatus.isRunning ? (
                  <>
                    <RefreshCw className='h-3 w-3 mr-1 animate-spin' />
                    Running
                  </>
                ) : (
                  <>
                    <CheckCircle className='h-3 w-3 mr-1' />
                    Idle
                  </>
                )}
              </Badge>
            </AlertTitle>
            <AlertDescription className='flex items-center gap-2 mt-2'>
              <Clock className='h-3 w-3' />
              <span className='text-sm'>
                Next scheduled: {jobStatus.nextRun}
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Cache Status */}
        {cacheStats && (
          <Alert>
            <Database className='h-4 w-4' />
            <AlertTitle className='flex items-center gap-2'>
              Redis Cache
              <Badge
                variant={cacheStats.connected ? "default" : "destructive"}
                className='ml-2'>
                {cacheStats.connected ? (
                  <>
                    <CheckCircle className='h-3 w-3 mr-1' />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className='h-3 w-3 mr-1' />
                    Disconnected
                  </>
                )}
              </Badge>
            </AlertTitle>
            <AlertDescription className='flex items-center gap-2 mt-2'>
              {cacheWarmupStatus?.isRunning && (
                <Badge variant='secondary'>
                  <RefreshCw className='h-3 w-3 mr-1 animate-spin' />
                  Warmup Running
                </Badge>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Trigger All Jobs */}
      <Card className='border-primary/20 bg-primary/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <PlayCircle className='h-5 w-5' />
            Run All Jobs
          </CardTitle>
          <CardDescription>
            Trigger all background jobs at once for comprehensive system
            maintenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialogDemo>
            <Button
              disabled={loading.allJobs || jobStatus?.isRunning}
              size='lg'
              className='w-full'>
              {loading.allJobs ? (
                <>
                  <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                  Running All Jobs...
                </>
              ) : (
                <>
                  <PlayCircle className='h-4 w-4 mr-2' />
                  Trigger All Jobs
                </>
              )}
            </Button>
          </AlertDialogDemo>
        </CardContent>
      </Card>

      {/* Individual Jobs Grid */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Sales Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Package className='h-5 w-5 text-blue-500' />
              Product Sales Statistics
            </CardTitle>
            <CardDescription>
              Update totalSold and totalReturned for all products
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex gap-2'>
              <Button
                onClick={updateSalesStats}
                disabled={loading.salesStats}
                variant='secondary'
                className='flex-1'>
                {loading.salesStats ? (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Update Stats
                  </>
                )}
              </Button>
              <Button
                onClick={initializeSalesStats}
                disabled={loading.initStats}
                variant='outline'>
                {loading.initStats ? (
                  <>
                    <RefreshCw className='h-4 w-4 animate-spin' />
                  </>
                ) : (
                  "Initialize"
                )}
              </Button>
            </div>

            {salesStatsResult && (
              <Alert>
                <CheckCircle className='h-4 w-4' />
                <AlertTitle>Last Update</AlertTitle>
                <AlertDescription className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span>Products Updated:</span>
                    <span className='font-medium'>
                      {salesStatsResult.productsUpdated.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Duration:</span>
                    <span className='font-medium'>
                      {salesStatsResult.duration}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className='text-xs text-muted-foreground bg-muted p-3 rounded-md'>
              <p className='font-medium mb-1'>ℹ️ About this job:</p>
              <p>Runs automatically every 10 minutes</p>
            </div>
          </CardContent>
        </Card>

        {/* Fraud Detection */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='h-5 w-5 text-red-500' />
              Fraud Detection Analysis
            </CardTitle>
            <CardDescription>
              Analyze all customers for fraud risk and suspicious patterns
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Button
              onClick={triggerFraudDetection}
              disabled={loading.fraudDetection || jobStatus?.isRunning}
              variant='destructive'
              className='w-full'>
              {loading.fraudDetection ? (
                <>
                  <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                  Analyzing...
                </>
              ) : (
                <>
                  <Shield className='h-4 w-4 mr-2' />
                  Run Fraud Detection
                </>
              )}
            </Button>

            {fraudStats && (
              <Alert>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Latest Analysis Results</AlertTitle>
                <AlertDescription className='space-y-2 mt-2'>
                  <div className='grid grid-cols-2 gap-2'>
                    <div className='bg-muted p-2 rounded'>
                      <div className='text-xs text-muted-foreground'>
                        Total Analyzed
                      </div>
                      <div className='text-lg font-bold'>
                        {fraudStats.analyzed.toLocaleString()}
                      </div>
                    </div>
                    <div className='bg-red-50 dark:bg-red-950 p-2 rounded'>
                      <div className='text-xs text-red-600 dark:text-red-400'>
                        High Risk
                      </div>
                      <div className='text-lg font-bold text-red-600 dark:text-red-400'>
                        {fraudStats.highRisk}
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-2 text-xs'>
                    <Badge
                      variant='outline'
                      className='bg-green-50 text-green-700 border-green-200'>
                      Low: {fraudStats.riskDistribution.green}
                    </Badge>
                    <Badge
                      variant='outline'
                      className='bg-yellow-50 text-yellow-700 border-yellow-200'>
                      Medium: {fraudStats.riskDistribution.yellow}
                    </Badge>
                    <Badge
                      variant='outline'
                      className='bg-red-50 text-red-700 border-red-200'>
                      High: {fraudStats.riskDistribution.red}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className='text-xs text-muted-foreground bg-muted p-3 rounded-md'>
              <p className='font-medium mb-1'>ℹ️ About this job:</p>
              <p>Runs automatically daily at 12:00 AM</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cache Management Section */}
      <div className='space-y-4'>
        <h2 className='text-2xl font-bold flex items-center gap-2'>
          <Zap className='h-6 w-6' />
          Cache Management
        </h2>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Flame className='h-5 w-5 text-orange-500' />
              Cache Warmup
            </CardTitle>
            <CardDescription>
              Pre-populate Redis cache with frequently accessed data for optimal
              performance
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Options */}
            <div className='space-y-3'>
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
                />
                <label
                  htmlFor='flush-before'
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                  Flush cache before warming up
                  <span className='ml-2 text-xs text-muted-foreground'>
                    (clears all existing cache first)
                  </span>
                </label>
              </div>

              <div className='space-y-2'>
                <p className='text-sm font-medium'>
                  Select targets (leave empty for all):
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  {CACHE_TARGETS.map((target) => (
                    <div
                      key={target.value}
                      className='flex items-center space-x-2'>
                      <Checkbox
                        id={target.value}
                        checked={selectedTargets.includes(target.value)}
                        onCheckedChange={() => toggleTarget(target.value)}
                        disabled={
                          loading.cacheWarmup ||
                          cacheWarmupStatus?.isRunning ||
                          !cacheStats?.connected
                        }
                      />
                      <label
                        htmlFor={target.value}
                        className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        {target.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-2'>
              <Button
                onClick={triggerCacheWarmup}
                disabled={
                  loading.cacheWarmup ||
                  cacheWarmupStatus?.isRunning ||
                  !cacheStats?.connected
                }
                className='flex-1'>
                {loading.cacheWarmup ? (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                    Warming Up...
                  </>
                ) : (
                  <>
                    <Flame className='h-4 w-4 mr-2' />
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
                variant='destructive'>
                {loading.flushCache ? (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                  </>
                ) : (
                  <>
                    <Trash2 className='h-4 w-4 mr-2' />
                    Flush Cache
                  </>
                )}
              </Button>
            </div>

            {/* Results */}
            {cacheWarmupResult && (
              <Alert>
                <CheckCircle className='h-4 w-4' />
                <AlertTitle>Cache Warmup Results</AlertTitle>
                <AlertDescription className='space-y-2 mt-2'>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>
                        Successfully Cached:
                      </span>
                      <span className='ml-2 font-bold text-green-600'>
                        {cacheWarmupResult.totalSuccess}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>Failed:</span>
                      <span className='ml-2 font-bold text-red-600'>
                        {cacheWarmupResult.totalFailed}
                      </span>
                    </div>
                  </div>
                  <div className='grid grid-cols-3 gap-2 text-xs'>
                    {Object.entries(cacheWarmupResult.details).map(
                      ([key, value], index: number) => (
                        <div
                          key={key}
                          className={`flex justify-between rounded-md p-2 ${
                            COLORS[index % COLORS.length]
                          }`}>
                          <span className=' mr-2 uppercase'>{key}:</span>
                          {!!value && (
                            <span className='font-medium px-2 bg-white rounded-md'>
                              {value?.success}
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Info */}
            <Alert className='bg-blue-50 dark:bg-blue-950 border-blue-200'>
              <AlertCircle className='h-4 w-4 text-blue-600' />
              <AlertTitle className='text-blue-900 dark:text-blue-100'>
                When to use Cache Warmup?
              </AlertTitle>
              <AlertDescription className='text-blue-800 dark:text-blue-200'>
                <ul className='list-disc list-inside space-y-1 text-xs mt-2'>
                  <li>Before campaign launches or sales events</li>
                  <li>After server deployment or restart</li>
                  <li>Before flash sales or peak traffic periods</li>
                  <li>When experiencing performance issues</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Information Panel */}
      <Alert>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Important Notes</AlertTitle>
        <AlertDescription className='space-y-2 mt-2'>
          <ul className='list-disc list-inside space-y-1 text-sm'>
            <li>Jobs may take several minutes to complete</li>
            <li>Avoid triggering the same job multiple times simultaneously</li>
            <li>Monitor the system status indicators for job progress</li>
            <li>Cache warmup typically takes 10-30 seconds</li>
            <li>
              All jobs run automatically on schedule - manual triggers are for
              immediate needs
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default JobsManagement;
