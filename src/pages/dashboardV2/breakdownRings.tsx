import { pillClass } from "./dashboardTheme";

export interface BreakdownRingItem {
  label: string;
  value: number;
  prefix?: string;
}

interface BreakdownRingsProps {
  title: string;
  items: BreakdownRingItem[];
}

const RING_COLORS = ["#F7D9D2", "#F2A992", "#E1573F", "#111111"];

/**
 * Concentric nested-rings chart (reference: the "annual profits" onion chart
 * in src/assets/fgfg.webp). Pure SVG — ring radius scales with value.
 */
const BreakdownRings: React.FC<BreakdownRingsProps> = ({ title, items }) => {
  const visible = items.filter((i) => i.value > 0);
  const max = Math.max(...visible.map((i) => i.value), 1);

  // Rings nest outward from smallest (solid accent) to largest (lightest tint).
  const rings = [...visible].reverse().map((item, idx) => ({
    ...item,
    color: RING_COLORS[idx % RING_COLORS.length],
    radius: 30 + (item.value / max) * 70,
  }));

  return (
    <div className='bg-[#EFEDEB] rounded-3xl p-4 sm:p-5 flex flex-col gap-3 h-full'>
      <div className='flex items-center justify-between'>
        <p className='text-sm font-semibold text-[#1A1A1A]'>{title}</p>
        <span
          className={`${pillClass} inline-flex items-center px-3 h-7 text-xs font-medium text-[#9A9A98]`}>
          This period
        </span>
      </div>

      <div className='flex-1 flex items-center justify-center min-h-[220px]'>
        <svg viewBox='0 0 220 220' className='w-full max-w-[240px] h-full'>
          {rings.map((ring) => (
            <g key={ring.label}>
              <circle
                cx='110'
                cy='110'
                r={ring.radius}
                fill={ring.color}
                stroke='#F5F4F2'
                strokeWidth={4}
              />
              <text
                x='110'
                y={110 - ring.radius + 18}
                textAnchor='middle'
                className='fill-[#1A1A1A]'
                fontSize='13'
                fontWeight='600'>
                {ring.prefix}
                {formatCompact(ring.value)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className='flex flex-wrap items-center justify-center gap-2'>
        {visible.map((item, idx) => (
          <span
            key={item.label}
            className={`${pillClass} inline-flex items-center gap-1.5 px-3 h-7 text-xs font-medium text-[#1A1A1A]`}>
            <span
              className='h-2 w-2 rounded-full'
              style={{
                backgroundColor:
                  RING_COLORS[
                    ([...visible].reverse().findIndex((i) => i.label === item.label) %
                      RING_COLORS.length)
                  ],
              }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const formatCompact = (value: number): string => {
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
};

export default BreakdownRings;
