"use client";
import { Pie, PieChart } from "recharts";
import { ChartConfig, ChartContainer } from "../../components/ui/chart";
import { DASHBOARD_THEME, labelClass, pillClass } from "./dashboardTheme";

const chartConfig = {
  completed: {
    label: "Completed",
    color: DASHBOARD_THEME.accent,
  },
  remaining: {
    label: "Remaining",
    color: DASHBOARD_THEME.accentTint2,
  },
} satisfies ChartConfig;

interface DonutGaugeCardProps {
  /** 0–100 completion percentage. */
  percent: number;
  /** Center caption under the percentage (e.g. "Completion rate"). */
  centerLabel: string;
  /** Sub-metric chips rendered as white pills under the gauge. */
  chips?: { label: string; value: number | string }[];
}

/**
 * Donut gauge in the reference design language: accent arc on a tint track,
 * bold percentage in the center, white pill chips underneath.
 */
const DonutGaugeCard: React.FC<DonutGaugeCardProps> = ({
  percent,
  centerLabel,
  chips = [],
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const data = [
    { name: "completed", value: clamped, fill: DASHBOARD_THEME.accent },
    { name: "remaining", value: 100 - clamped, fill: DASHBOARD_THEME.accentTint2 },
  ];

  return (
    <div className='bg-[#EFEDEB] rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between gap-3'>
      <div className='relative w-full max-w-[220px] aspect-square'>
        <ChartContainer
          config={chartConfig}
          className='absolute inset-0 aspect-square'>
          <PieChart>
            <Pie
              data={data}
              dataKey='value'
              nameKey='name'
              innerRadius='72%'
              outerRadius='100%'
              startAngle={90}
              endAngle={90 - 360}
              cornerRadius={999}
              paddingAngle={clamped > 0 && clamped < 100 ? 2 : 0}
              stroke='none'
              strokeWidth={0}
            />
          </PieChart>
        </ChartContainer>
        <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
          <span className='text-3xl font-bold text-[#1A1A1A] tracking-tight'>
            {clamped}%
          </span>
          <span className='text-[11px] text-[#9A9A98] mt-0.5'>{centerLabel}</span>
        </div>
      </div>

      {chips.length > 0 && (
        <div className='flex flex-wrap items-center justify-center gap-2 w-full'>
          {chips.map((chip) => (
            <span
              key={chip.label}
              className={`${pillClass} inline-flex items-center gap-1.5 px-3 h-7 text-xs font-medium text-[#1A1A1A]`}>
              <span className='h-2 w-2 rounded-full bg-[#E1573F]' />
              {chip.label} {chip.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonutGaugeCard;
