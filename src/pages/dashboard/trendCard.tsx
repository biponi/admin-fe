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
    date: format(new Date(d.date), "MMM dd"), // Format date for display
  }));
  
  // Calculate percentage change
  const percentChange = previousMetric !== 0 
    ? ((currentMetric - previousMetric) / previousMetric * 100).toFixed(1)
    : 0;
  return (
    <Card className='h-full'>
      <CardHeader className='pb-2 sm:pb-4'>
        <h3 className="text-sm sm:text-lg font-medium text-gray-700">{title}</h3>
      </CardHeader>
      <CardContent className='space-y-3 sm:space-y-4'>
        <div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{currentMetric.toLocaleString()}</p>
          <p className="text-xs sm:text-sm text-gray-600">
            vs last month:{" "}
            <span className={`font-medium ${
              currentMetric - previousMetric >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {currentMetric - previousMetric >= 0 ? "+" : ""}
              {(currentMetric - previousMetric).toLocaleString()}
            </span>
          </p>
        </div>
        <div className="w-full h-32 sm:h-48 lg:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                fontSize={10}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                type="number" 
                domain={["auto", "auto"]} 
                fontSize={10}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={0.1}
                fill="#3b82f6"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendCard;
