import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className = "",
}) => {
  return (
    <Card className={className}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        {Icon && <Icon className='h-4 w-4 text-muted-foreground' />}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}>
            {trend.isPositive ? (
              <TrendingUp className='h-3 w-3' />
            ) : (
              <TrendingDown className='h-3 w-3' />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
        {description && (
          <p className='text-xs text-muted-foreground mt-1'>{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
