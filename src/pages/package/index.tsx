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
import { Loader2, Package, Clock, CheckCircle } from "lucide-react";

export function PackageDashboardPage() {
  const navigate = useNavigate();
  const { dashboardStats, loading, loadDashboard } = usePackageStore();

  useEffect(() => {
    loadDashboard();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
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

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold'>Package Dashboard</h1>
          <p className='text-gray-500 mt-1'>
            Manage packaging and shipping operations
          </p>
        </div>
        <Button onClick={() => navigate("/packages/scan")}>
          <Package className='mr-2 h-4 w-4' />
          Scan Barcode
        </Button>
      </div>

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
