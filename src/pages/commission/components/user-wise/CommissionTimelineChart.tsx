import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { UserCommissionHistory } from "../../../../api/commission";
import { formatCurrency } from "../../../../utils/inventoryReportUtils";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

interface CommissionTimelineChartProps {
  timeline: UserCommissionHistory["timeline"];
  interval?: "daily" | "weekly" | "monthly";
}

export const CommissionTimelineChart: React.FC<CommissionTimelineChartProps> = ({
  timeline,
  interval = "daily",
}) => {
  // Format data for chart
  const chartData = timeline.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-US", {
      month: "short",
      day: interval === "monthly" ? undefined : "numeric",
    }),
    Total: entry.totalAmount,
    Paid: entry.paidAmount,
    Unpaid: entry.unpaidAmount,
    Pending: entry.pendingAmount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Commission Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: "currentColor" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fill: "currentColor" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Total"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Paid"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Unpaid"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
