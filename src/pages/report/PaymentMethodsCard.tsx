// ============================================
// FILE: components/reports/PaymentMethodsCard.tsx
// ============================================
import React from "react";
import { Download, CreditCard } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import useRoleCheck from "../auth/hooks/useRoleCheck";

interface PaymentMethodsCardProps {
  data: any;
  onDownload: () => void;
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const PaymentMethodsCard: React.FC<PaymentMethodsCardProps> = ({
  data,
  onDownload,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const chartData =
    data.breakdown?.map((item: any) => ({
      name: item.paymentType.toUpperCase(),
      value: item.totalAmount,
      count: item.transactionCount,
    })) || [];

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Payment Methods
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Payment method breakdown and analytics
            </p>
          </div>
          {useRoleCheck().hasRequiredPermission("Report", "download") && (
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6">
        {/* Summary */}
        <div className="grid gap-3 grid-cols-2">
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <CreditCard className="h-4 w-4" />
              <p className="text-sm font-medium">Total Transactions</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {data.summary?.totalTransactions || 0}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="text-sm font-medium text-emerald-600 mb-2">
              Total Amount
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(data.summary?.totalAmount || 0)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-900 mb-1">
            Payment Distribution
          </h4>
          <p className="text-xs text-slate-500 mb-4">
            Amount distribution by payment method
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent ?? 0 * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value">
                {chartData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any, props: any) => [
                  `${formatCurrency(value)} (${
                    props.payload.count
                  } transactions)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown List */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">
            Method Breakdown
          </h4>
          <div className="space-y-2">
            {data.breakdown?.map((method: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      {method.paymentType.toUpperCase()}
                    </p>
                    <p className="text-sm text-slate-500">
                      {method.transactionCount} transactions
                    </p>
                  </div>
                </div>
                <p className="font-bold text-slate-900">
                  {formatCurrency(method.totalAmount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodsCard;
