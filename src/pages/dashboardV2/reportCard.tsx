import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";

// Function to calculate growth percentage
const calculateGrowthPercentage = (
  previousValue: number,
  currentValue: number
) => {
  if (previousValue === 0) {
    if (currentValue > 0) {
      return 100;
    } else {
      return 0;
    }
  } else {
    const growth = ((currentValue - previousValue) / previousValue) * 100;
    return growth;
  }
};

type ColorVariant = "blue" | "purple" | "green" | "orange" | "pink" | "cyan";

// Props for the DynamicCard component
interface DynamicCardProps {
  title: string;
  subtitle: string;
  previousValue: number;
  currentValue: number;
  icon?: any;
  colorVariant?: ColorVariant;
  prefix?: string;
  suffix?: string;
}

const colorStyles: Record<
  ColorVariant,
  {
    cardBg: string;
    iconBg: string;
    iconColor: string;
    accentGlow: string;
    orbGradient: string;
    textColor: string;
    subtitleColor: string;
  }
> = {
  blue: {
    cardBg: "bg-gradient-to-br from-[#654321] to-[#2d3436]",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-950",
    accentGlow: "shadow-blue-400/50",
    orbGradient: "from-blue-400/30 via-blue-300/15 to-transparent",
    textColor: "text-white",
    subtitleColor: "text-amber-100",
  },
  purple: {
    cardBg: "bg-gradient-to-br from-[#4D301B] to-[#654321]",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    accentGlow: "shadow-purple-400/50",
    orbGradient: "from-purple-400/30 via-purple-300/15 to-transparent",
    textColor: "text-white",
    subtitleColor: "text-amber-100",
  },
  green: {
    cardBg: "bg-gradient-to-br from-[#4D301B] to-[#654321]",
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    accentGlow: "shadow-green-400/50",
    orbGradient: "from-green-400/30 via-green-300/15 to-transparent",
    textColor: "text-white",
    subtitleColor: "text-amber-100",
  },
  orange: {
    cardBg: "bg-gradient-to-br from-[#4D301B] to-[#654321]",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    accentGlow: "shadow-orange-400/50",
    orbGradient: "from-orange-400/30 via-orange-300/15 to-transparent",
    textColor: "text-white",
    subtitleColor: "text-amber-100",
  },
  pink: {
    cardBg: "bg-gradient-to-br from-[#4D301B] to-[#654321]",
    iconBg: "bg-pink-50",
    iconColor: "text-pink-500",
    accentGlow: "shadow-pink-400/50",
    orbGradient: "from-pink-400/30 via-pink-300/15 to-transparent",
    textColor: "text-white",
    subtitleColor: "text-amber-100",
  },
  cyan: {
    cardBg: "bg-gradient-to-br from-[#4D301B] to-[#654321]",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-500",
    accentGlow: "shadow-cyan-400/50",
    orbGradient: "from-cyan-400/30 via-cyan-300/15 to-transparent",
    textColor: "text-white",
    subtitleColor: "text-amber-100",
  },
};

const DynamicCard: React.FC<DynamicCardProps> = ({
  title,
  subtitle,
  previousValue,
  currentValue,
  icon: Icon = Activity,
  colorVariant = "blue",
  prefix = "",
  suffix = "",
}) => {
  const growthPercentage = calculateGrowthPercentage(
    previousValue,
    currentValue
  );
  const styles = colorStyles[colorVariant];

  return (
    <Card
      className={`group relative overflow-hidden border-0 ${styles.cardBg} hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02]`}>
      {/* Animated gradient orb */}
      <div
        className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${styles.orbGradient} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700`}></div>

      {/* Glass morphism overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

      <CardHeader className='pb-2 relative z-10'>
        <div className='flex items-start justify-between'>
          <div className='flex-1 space-y-1'>
            <CardDescription
              className={`text-xs font-medium ${styles.subtitleColor}`}>
              {subtitle}
            </CardDescription>
            <CardTitle className={`text-sm font-semibold ${styles.textColor}`}>
              {title}
            </CardTitle>
          </div>
          <div
            className={`${styles.iconBg} ${styles.iconColor} p-2.5 rounded-xl  group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
            <Icon className='h-5 w-5' strokeWidth={2.5} />
          </div>
        </div>
      </CardHeader>

      <CardContent className='relative z-10 space-y-3'>
        <div
          className={`text-3xl font-bold ${styles.textColor} tracking-tight`}>
          {prefix}
          {currentValue.toLocaleString()}
          {suffix}
        </div>

        <div className='flex items-center justify-between'>
          <div className={`text-xs ${styles.subtitleColor}`}>
            vs {prefix}
            {previousValue.toLocaleString()}
            {suffix}
          </div>

          <div
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm ${
              growthPercentage > 0
                ? "bg-white/20 text-white"
                : growthPercentage < 0
                ? "bg-white/20 text-white"
                : "bg-white/20 text-white"
            }`}>
            {growthPercentage > 0 ? (
              <TrendingUp className='h-3.5 w-3.5' strokeWidth={2.5} />
            ) : growthPercentage < 0 ? (
              <TrendingDown className='h-3.5 w-3.5' strokeWidth={2.5} />
            ) : (
              <span>—</span>
            )}
            <span>{Math.abs(growthPercentage).toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicCard;
