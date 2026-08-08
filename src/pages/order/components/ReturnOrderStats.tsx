import { Card, CardContent } from "../../../components/ui/card";
import { IReturnOrderStats } from "../interface";
import { PackageX, DollarSign, TrendingDown, AlertTriangle } from "lucide-react";

interface ReturnOrderStatsProps {
  stats: IReturnOrderStats | null;
}

export function ReturnOrderStats({ stats }: ReturnOrderStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: "Total Returns",
      value: stats?.totalReturns || 0,
      icon: <PackageX className="w-8 h-8 text-orange-200" />,
      gradient: "from-orange-500 to-orange-600",
      titleColor: "text-orange-100",
    },
    {
      title: "Total Refund",
      value: formatCurrency(stats?.totalRefundAmount || 0),
      icon: <DollarSign className="w-8 h-8 text-red-200" />,
      gradient: "from-red-500 to-red-600",
      titleColor: "text-red-100",
    },
    {
      title: "Avg Refund",
      value: formatCurrency(stats?.averageRefundAmount || 0),
      icon: <TrendingDown className="w-8 h-8 text-amber-200" />,
      gradient: "from-amber-500 to-amber-600",
      titleColor: "text-amber-100",
    },
    {
      title: "Pending Returns",
      value:
        stats?.statusBreakdown?.filter(
          (s) => s === "return" || s === "processing",
        ).length || 0,
      icon: <AlertTriangle className="w-8 h-8 text-yellow-200" />,
      gradient: "from-yellow-500 to-yellow-600",
      titleColor: "text-yellow-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card
          key={index}
          className={`bg-gradient-to-r ${stat.gradient} text-white border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${stat.titleColor}`}>
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              {stat.icon}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
