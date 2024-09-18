import React from "react";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

interface TrendCardProps {
  title: string;
  dataKey: string;
  //@ts-ignore
  trendData: { date: string; count: number }[];
  currentMetric: number;
  previousMetric: number;
}

const TrendCard: React.FC<TrendCardProps> = ({
  title,
  dataKey,
  trendData,
  currentMetric,
  previousMetric,
}) => {
  const formattedData = trendData.map((d) => ({
    ...d,
    date: format(new Date(d.date), "MMM dd"), // Format date to MM/DD/YYYY for display
  }));
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{currentMetric}</p>
        <p className="text-sm">
          Compared to last month:{" "}
          {currentMetric - previousMetric >= 0 ? "+" : "-"}
          {Math.abs(currentMetric - previousMetric)}
        </p>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <AreaChart
              width={500}
              height={300}
              data={formattedData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis type="number" domain={["auto", "auto"]} scale="log" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="#8884d8"
                fillOpacity={0.3}
                fill="#8884d8"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendCard;
