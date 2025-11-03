import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { FunnelStep } from "../../../api/analytics";
import { TrendingDown } from "lucide-react";

interface FunnelChartProps {
  data: FunnelStep[];
  conversionRate: number;
  cancellationRate?: number;
  dropOffRate?: number;
  title?: string;
  description?: string;
}

const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  conversionRate,
  cancellationRate = 0,
  dropOffRate = 0,
  title = "E-commerce Conversion Funnel",
  description,
}) => {
  const displayRate = cancellationRate || dropOffRate;
  // Calculate max width for first step
  const maxCount = data[0]?.count || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {data.map((step, index) => {
            const widthPercentage = (step.count / maxCount) * 100;
            const isFirst = index === 0;
            const isLast = index === data.length - 1;

            return (
              <div key={index} className='relative'>
                <div
                  className={`
                    h-16 flex items-center justify-between px-4 rounded-lg
                    transition-all duration-300 hover:shadow-md
                    ${
                      isLast
                        ? "bg-green-500 text-white"
                        : isFirst
                        ? "bg-blue-500 text-white"
                        : "bg-muted"
                    }
                  `}
                  style={{
                    width: `${widthPercentage}%`,
                    minWidth: "200px",
                  }}>
                  <div>
                    <p className='font-medium'>{step.step}</p>
                    <p
                      className={`text-xs ${
                        isLast || isFirst
                          ? "text-white/80"
                          : "text-muted-foreground"
                      }`}>
                      {step.count.toLocaleString()} orders
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-lg font-bold'>{step.rate.toFixed(1)}%</p>
                  </div>
                </div>

                {index < data.length - 1 && (
                  <div className='flex items-center gap-2 ml-4 my-1 text-xs text-muted-foreground'>
                    <TrendingDown className='h-3 w-3' />
                    <span>
                      {(
                        data[index].count - data[index + 1].count
                      ).toLocaleString()}{" "}
                      drop-off (
                      {(
                        ((data[index].count - data[index + 1].count) /
                          data[index].count) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className='grid grid-cols-2 gap-4 mt-6 pt-4 border-t'>
          <div className='text-center'>
            <p className='text-xs text-muted-foreground'>Conversion Rate</p>
            <p className='text-2xl font-bold text-green-600'>
              {conversionRate.toFixed(2)}%
            </p>
          </div>
          <div className='text-center'>
            <p className='text-xs text-muted-foreground'>
              {cancellationRate ? "Cancellation Rate" : "Drop-off Rate"}
            </p>
            <p className='text-2xl font-bold text-red-600'>
              {displayRate.toFixed(2)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FunnelChart;
