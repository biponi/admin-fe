import { useSidebar } from "../ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useWeatherContext } from "../../contexts/WeatherContext";
import {
  SCENE_EMOJI,
  getWeatherDescription,
  mapSceneWeather,
} from "../../lib/weather-scene";
import { cn } from "../../lib/utils";

/**
 * Compact weather info block for the sidebar footer (animated scene mode
 * only): weather emoji, temperature, condition text and wind. Collapse-aware
 * — icon mode shows just the emoji with a tooltip. Renders nothing while
 * weather data is missing, mirroring the topbar's loading fallback.
 */
export function SidebarWeatherInfo({ className }: { className?: string }) {
  const { state } = useSidebar();
  const { temperature, weatherCode, windSpeed, period, condition } =
    useWeatherContext();

  const sceneWeather = mapSceneWeather(condition);
  if (temperature === null || sceneWeather === null) return null;

  const emoji = SCENE_EMOJI[sceneWeather][period];
  const description = getWeatherDescription(weatherCode, period);
  const collapsed = state === "collapsed";

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          // black-alpha background — sidebar token alpha modifiers don't work
          // (no <alpha-value> in the tailwind config), same as the backdrop
          "flex items-center gap-2 rounded-xl bg-black/10 border border-white/10 px-2.5 py-2",
          collapsed && "justify-center px-0",
          className,
        )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              className={cn(
                "text-xl leading-none shrink-0",
                !collapsed && "animate-weather-float",
              )}
              aria-label={`${description}, ${temperature} degrees`}>
              {emoji}
            </span>
          </TooltipTrigger>
          <TooltipContent side='right' className={collapsed ? "" : "hidden"}>
            <p className='font-semibold'>
              {emoji} {temperature}°C
            </p>
            <p className='text-[11px] opacity-80'>{description}</p>
          </TooltipContent>
        </Tooltip>

        {!collapsed && (
          <div className='min-w-0 flex-1 leading-tight'>
            <p className='text-xs font-semibold text-sidebar-foreground tabular-nums'>
              {temperature}°C
              {windSpeed !== null && (
                <span className='ml-1.5 font-normal text-sidebar-foreground/90 text-[10px]'>
                  {windSpeed} km/h
                </span>
              )}
            </p>
            <p className='text-[10px] text-sidebar-foreground/90 truncate'>
              {description}
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
