import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../components/ui/card"; // Assuming you're using Shadcn UI for Card
import { TrendingDown, TrendingUp } from "lucide-react";

// Function to calculate growth percentage
const calculateGrowthPercentage = (
  previousValue: number,
  currentValue: number
) => {
  if (previousValue === 0) {
    if (currentValue > 0) {
      return 100; // If current value is greater than 0, assume 100% growth from zero
    } else {
      return 0; // If both values are 0, no growth
    }
  } else {
    const growth = ((currentValue - previousValue) / previousValue) * 100;
    return growth;
  }
};

// Props for the DynamicCard component
interface DynamicCardProps {
  title: string;
  subtitle: string;
  previousValue: number;
  currentValue: number;
}

const DynamicCard: React.FC<DynamicCardProps> = ({
  title,
  subtitle,
  previousValue,
  currentValue,
}) => {
  const growthPercentage = calculateGrowthPercentage(
    previousValue,
    currentValue
  );

  // Determine the color based on growth percentage
  const growthColor =
    growthPercentage > 0
      ? "text-green-500"
      : growthPercentage < 0
      ? "text-red-500"
      : "text-neutral-500";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between'>
          <div>
            <div className='text-xl font-semibold'>
              {currentValue.toLocaleString()}{" "}
              <span className='text-xs font-medium'> From {previousValue}</span>
            </div>
            <div
              className={` flex justify-start items-center gap-1 text-sm ${growthColor}`}>
              {growthPercentage > 0 ? (
                <TrendingUp className='h-4 w-4' />
              ) : (
                <TrendingDown className='h-4 w-4' />
              )}{" "}
              {growthPercentage.toFixed(2)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicCard;
