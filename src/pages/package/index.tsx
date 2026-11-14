import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePackageStore } from "../../store/packageStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Package, Clock, CheckCircle, Barcode } from "lucide-react";
import { PageLoader } from "@/components/loaders";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  MobilePage,
  MobileListCard,
  MobileStatTile,
  MobileStatRow,
  MobileSkeletonList,
  rippleProps,
} from "@/components/mobile";
import { PageHeader } from "@/components/PageHeader";

export function PackageDashboardPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { dashboardStats, loading, loadDashboard } = usePackageStore();

  useEffect(() => {
    loadDashboard();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    if (isMobile) {
      return (
        <MobilePage title="Packages">
          <div className="p-3">
            <MobileSkeletonList count={5} />
          </div>
        </MobilePage>
      );
    }
    return <PageLoader domain='analytics' text='Loading Dashboard' />;
  }

  if (!dashboardStats) {
    return <div>Failed to load dashboard</div>;
  }

  const stats = [
    {
      label: "Total Packages",
      value: dashboardStats.total,
      icon: Package,
      color: "text-blue-600",
    },
    {
      label: "Packing",
      value: dashboardStats.packing,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Packed",
      value: dashboardStats.packed,
      icon: Package,
      color: "text-purple-600",
    },
    {
      label: "Completed",
      value: dashboardStats.completed,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ];

  if (isMobile) {
    return (
      <MobilePage
        title="Packages"
        icon={<Package className="h-5 w-5 text-primary" />}
        subtitle={`${dashboardStats.total ?? 0} total`}
        actions={
          <button
            aria-label="Scan Barcode"
            onClick={() => navigate("/packages/scan")}
            className="m3-ripple grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm active:scale-95 transition-transform"
            {...rippleProps()}
          >
            <Barcode className="h-5 w-5" />
          </button>
        }>
        <div className="space-y-3 p-3">
          {/* Stats row */}
          <MobileStatRow>
            {stats.map((stat) => (
              <MobileStatTile
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={<stat.icon className="h-4 w-4" />}
              />
            ))}
          </MobileStatRow>

          {/* Status Breakdown */}
          <div className="rounded-2xl border bg-card p-1.5">
            <p className="px-3 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Package Status Breakdown
            </p>
            {Object.entries(dashboardStats).map(([status, count]) => {
              // Skip total and ensure count is a number
              if (status === "total" || typeof count !== "number") return null;
              return (
                <MobileListCard
                  static
                  key={status}
                  className="border-0"
                  title={
                    <span className="capitalize">
                      {status.replace(/_/g, " ")}
                    </span>
                  }
                  trailing={
                    <span className="text-[15px] font-semibold">{count}</span>
                  }
                />
              );
            })}
          </div>
        </div>
      </MobilePage>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <PageHeader
        icon={<Package className='h-5 w-5 text-white' />}
        title='Packages'
        subtitle='Manage packaging and shipping operations'
        count={
          <span className='rounded-md px-2.5 py-1 text-base font-semibold text-muted-foreground tabular-nums'>
            {dashboardStats.total} total
          </span>
        }
        actions={
          <Button onClick={() => navigate("/packages/scan")}>
            <Barcode className='mr-2 h-4 w-4' />
            Scan Barcode
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Package Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {Object.entries(dashboardStats).map(([status, count]) => {
              // Skip total and ensure count is a number
              if (status === "total" || typeof count !== "number") return null;
              return (
                <div key={status} className='flex items-center justify-between'>
                  <span className='capitalize'>
                    {status.replace(/_/g, " ")}
                  </span>
                  <span className='font-semibold'>{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
