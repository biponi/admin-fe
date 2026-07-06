import React from "react";
import { Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface IStageTrackerStage {
  key: string;
  label: string;
  icon?: any;
}

// Same palette convention as the main delivery components, so this card
// visually matches whichever courier's tracking view it's dropped into.
const getProviderTheme = (provider?: string) => {
  const p = provider?.toLowerCase() || "";
  switch (p) {
    case "steadfast":
      return {
        gradient: "from-blue-600 via-blue-600 to-sky-500",
        accentText: "text-blue-600",
      };
    case "pathao":
      return {
        gradient: "from-rose-600 via-rose-600 to-pink-500",
        accentText: "text-rose-600",
      };
    case "carrybee":
      return {
        gradient: "from-amber-500 via-amber-600 to-orange-500",
        accentText: "text-amber-600",
      };
    default:
      return {
        gradient: "from-indigo-600 via-blue-600 to-cyan-500",
        accentText: "text-indigo-600",
      };
  }
};

interface DeliveryStageTrackerProps {
  stages: IStageTrackerStage[];
  stageIndex: number;
  stageProgressPct: number;
  isNegativeTerminal?: boolean;
  truckIsMoving?: boolean;
  provider?: string;
}

/**
 * Self-contained horizontal delivery progress tracker with a traveling
 * truck icon. Carries its own gradient background + text colors, so it
 * can be dropped into a card/section with a plain white background
 * without depending on a parent's dark header for contrast. Pass
 * `provider` (e.g. "steadfast" | "pathao" | "carrybee") to tint the
 * gradient and truck icon to match that courier's brand.
 */
export const DeliveryStageTracker: React.FC<DeliveryStageTrackerProps> = ({
  stages,
  stageIndex,
  stageProgressPct,
  isNegativeTerminal = false,
  truckIsMoving = false,
  provider,
}) => {
  const providerTheme = getProviderTheme(provider);

  return (
    <Card className='border-0 shadow-lg overflow-hidden py-0'>
      <CardContent
        className={`relative p-5 bg-gradient-to-br ${providerTheme.gradient} overflow-hidden`}>
        <style>{`
          @keyframes truckBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          .truck-bounce {
            animation: truckBounce 0.9s ease-in-out infinite;
          }
          .stage-progress-fill {
            transition: width 0.8s cubic-bezier(0.65, 0, 0.35, 1);
          }
          .stage-truck-pos {
            transition: left 0.8s cubic-bezier(0.65, 0, 0.35, 1);
          }
        `}</style>

        {/* Decorative depth, kept subtle so the track stays the focus */}
        <div className='absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10' />
        <div className='absolute -left-6 -bottom-8 w-24 h-24 rounded-full bg-white/10' />

        {/* Horizontal step tracker with a traveling truck, Pathao-style */}
        <div className='relative mb-1 pt-2 pb-1 px-2'>
          <div className='relative h-1 rounded-full bg-white/20'>
            <div
              className='stage-progress-fill absolute left-0 top-0 h-1 rounded-full bg-white'
              style={{ width: `${stageProgressPct}%` }}
            />
            <div
              className='stage-truck-pos absolute -top-[11px]'
              style={{ left: `calc(${stageProgressPct}% - 12px)` }}>
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center ${
                  truckIsMoving ? "truck-bounce" : ""
                }`}>
                <Truck className={`w-3.5 h-3.5 ${providerTheme.accentText}`} />
              </div>
            </div>
          </div>
          <div className='flex justify-between mt-3'>
            {stages.map((stage, i) => {
              const reached = i <= stageIndex;
              const isLastStage = i === stages.length - 1;
              return (
                <div
                  key={stage.key}
                  className='flex flex-col items-center gap-1'
                  style={{ width: `${100 / stages.length}%` }}>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      reached
                        ? isLastStage && isNegativeTerminal
                          ? "bg-red-300"
                          : "bg-white"
                        : "bg-white/25"
                    }`}
                  />
                  <span
                    className={`text-[9.5px] text-center leading-tight ${
                      reached ? "text-white/90 font-medium" : "text-white/45"
                    }`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryStageTracker;
