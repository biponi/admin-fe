import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  Clock,
  Droplets,
  TriangleAlert,
  Wind,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useWeatherContext } from "../contexts/WeatherContext";
import { TextShimmer } from "./loading-ui/text-shimmer";
import {
  SCENE_EMOJI,
  getWeatherDescription,
  mapSceneWeather,
} from "../lib/weather-scene";

// Rain warning banner auto-dismiss duration (seconds) — VITE_RAIN_WARNING_DURATION_SECONDS
const RAIN_WARNING_DURATION_SECONDS =
  Number(import.meta.env.VITE_RAIN_WARNING_DURATION_SECONDS) || 60;

export function HeaderDateTimeWeather() {
  const {
    temperature,
    weatherCode,
    windSpeed,
    rainProbability,
    nextHourRainProbability,
    rainWarningEvent,
    period,
    condition,
  } = useWeatherContext();

  // Weather emoji for the pill — same emoji set the animated sidebar uses
  const sceneWeather = mapSceneWeather(condition);
  const weatherEmoji = sceneWeather ? SCENE_EMOJI[sceneWeather][period] : "🌡️";
  const conditionText = getWeatherDescription(weatherCode, period);

  const [now, setNow] = useState<Date>(new Date());

  const [rainWarningActive, setRainWarningActive] = useState<boolean>(false);
  const [rainWarningPercent, setRainWarningPercent] = useState<number | null>(
    null,
  );
  const [rainWarningCountdown, setRainWarningCountdown] = useState<number>(
    RAIN_WARNING_DURATION_SECONDS,
  );

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Open the rain warning banner whenever the context reports a new
  // rainWarning false -> true transition (not on every refresh while the
  // warning persists). Re-arms once the warning clears.
  useEffect(() => {
    if (rainWarningEvent > 0) {
      setRainWarningPercent(nextHourRainProbability);
      setRainWarningActive(true);
    }
  }, [rainWarningEvent, nextHourRainProbability]);

  // Rain warning banner countdown — closes automatically at 0
  useEffect(() => {
    if (!rainWarningActive) return;
    setRainWarningCountdown(RAIN_WARNING_DURATION_SECONDS);
    const timer = setInterval(() => {
      setRainWarningCountdown((s) => {
        if (s <= 1) {
          clearInterval(timer);
          setRainWarningActive(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [rainWarningActive]);

  // While the banner is visible, push the whole layout down instead of
  // hovering over it: body padding shifts the in-flow content (topbar, page),
  // and the CSS rule keyed on body[data-rain-banner] offsets the fixed
  // sidebar by the same height. Banner is portaled to document.body so it
  // renders above sidebar + topbar at the very top of the viewport.
  const bannerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!rainWarningActive) return;
    const height = bannerRef.current?.offsetHeight || 36;
    document.body.style.paddingTop = `${height}px`;
    document.body.style.setProperty("--rain-banner-h", `${height}px`);
    document.body.dataset.rainBanner = "true";
    return () => {
      document.body.style.paddingTop = "";
      document.body.style.removeProperty("--rain-banner-h");
      delete document.body.dataset.rainBanner;
    };
  }, [rainWarningActive]);

  // Format date: e.g. "09 Nov 2026"
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(now);

  // Format time: e.g. "01:40 AM"
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(now);

  return (
    <>
      {/* Rain warning banner — rendered at the very top of the full layout
          (above sidebar + topbar) for the configured duration when the
          next-hour rain chance crosses the backend threshold */}
      {rainWarningActive &&
        createPortal(
          <div
            ref={bannerRef}
            className='fixed top-0 inset-x-0 z-[60] flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/95 dark:bg-amber-600/95 text-white text-sm shadow-lg'>
            <TriangleAlert className='h-4 w-4 shrink-0' />
            <span className='font-medium'>
              High chance of rain in the next hour
              {rainWarningPercent !== null ? ` (~${rainWarningPercent}%)` : ""}
            </span>
            <span className='text-xs opacity-90 tabular-nums'>
              Auto-dismiss in {rainWarningCountdown}s
            </span>
            <button
              onClick={() => setRainWarningActive(false)}
              className='ml-1 rounded p-0.5 hover:bg-white/20 transition-colors'
              aria-label='Dismiss rain warning'>
              <X className='h-4 w-4' />
            </button>
          </div>,
          document.body,
        )}

      <TooltipProvider delayDuration={150}>
        {/* Glass segmented card — emoji weather · time · date · rain · wind */}
        <div
          className=' hidden xl:flex items-stretch h-9 mr-1 rounded-2xl  dark:border-white/10
                      dark:bg-zinc-900/55  overflow-hidden text-xs'>
          {/* Weather segment: emoji + temperature + short condition */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-2 px-3 cursor-default '>
                <span
                  className='text-xl leading-none animate-weather-float'
                  aria-label={conditionText}>
                  {weatherEmoji}
                </span>
                <div className='flex flex-col justify-center leading-none'>
                  <span className='text-[13px] font-bold text-gray-900/80 tabular-nums tracking-tight'>
                    {temperature !== null ? `${temperature}°C` : "--°C"}
                  </span>
                  <span className='text-[10px]  text-primary mt-1 max-w-[110px] truncate'>
                    {conditionText}
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side='bottom'>
              <p className='font-semibold'>
                {weatherEmoji} {conditionText}
              </p>
              <p className='text-[11px] opacity-80'>
                {temperature !== null ? (
                  `${temperature}°C (Air 2m)`
                ) : (
                  <TextShimmer duration={2}>Loading temperature…</TextShimmer>
                )}
              </p>
              <p className='text-[10px] opacity-60 border-t border-primary-foreground/20 pt-1 mt-1'>
                Source: WeatherAPI.com (WMO Weather)
              </p>
            </TooltipContent>
          </Tooltip>

          <div className='w-px my-2 bg-gray-400 dark:bg-white/10' />

          {/* Time segment */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-1.5 px-3 font-mono tabular-nums cursor-default'>
                <Clock className='h-3.5 w-3.5  text-gray-900/80 shrink-0' />
                <span className='text-[13px] font-semibold text-gray-900/80 tracking-tight'>
                  {formattedTime}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side='bottom'>
              <p className='font-semibold'>Local Time</p>
              <p className='text-[11px] opacity-80'>{formattedTime}</p>
              <p className='text-[10px] opacity-60 border-t border-primary-foreground/20 pt-1 mt-1'>
                Source: Local System Clock
              </p>
            </TooltipContent>
          </Tooltip>

          <div className='w-px my-2 bg-gray-400 dark:bg-white/10' />

          {/* Date segment */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-1.5 px-3 cursor-default'>
                <Calendar className='h-3.5 w-3.5 text-gray-600  shrink-0' />
                <span className='font-semibold text-gray-900/80 tracking-tight'>
                  {formattedDate}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side='bottom'>
              <p className='font-semibold'>Today&apos;s Date</p>
              <p className='text-[11px] opacity-80'>{formattedDate}</p>
              <p className='text-[10px] opacity-60 border-t border-primary-foreground/20 pt-1 mt-1'>
                Source: Local System Clock
              </p>
            </TooltipContent>
          </Tooltip>

          <div className='w-px my-2 bg-gray-400 dark:bg-white/10' />

          {/* Rain possibility segment */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-1.5 px-3 text-muted-foreground hover:text-foreground transition-colors tabular-nums cursor-default'>
                <Droplets className='h-3.5 w-3.5 text-sky-500 shrink-0' />
                <span className='font-semibold text-gray-900/80'>
                  {rainProbability !== null ? `${rainProbability}%` : "--%"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side='bottom'>
              <p className='font-semibold'>Precipitation Probability</p>
              <p className='text-[11px] opacity-80'>
                {rainProbability !== null ? (
                  `${rainProbability}% chance of rain`
                ) : (
                  <TextShimmer duration={2}>
                    Loading rain possibility…
                  </TextShimmer>
                )}
              </p>
              <p className='text-[10px] opacity-60 border-t border-primary-foreground/20 pt-1 mt-1'>
                Source: WeatherAPI.com
              </p>
            </TooltipContent>
          </Tooltip>

          <div className='w-px my-2 bg-gray-400 dark:bg-white/10' />

          {/* Wind speed segment */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-1.5 px-3 pr-3.5 text-muted-foreground hover:text-foreground transition-colors tabular-nums cursor-default'>
                <Wind className='h-3.5 w-3.5 text-teal-500 shrink-0' />
                <span className='font-semibold text-gray-900/80'>
                  {windSpeed !== null ? `${windSpeed} km/h` : "-- km/h"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side='bottom'>
              <p className='font-semibold'>Wind Speed</p>
              <p className='text-[11px] opacity-80'>
                {windSpeed !== null ? (
                  `${windSpeed} km/h (Surface 10m)`
                ) : (
                  <TextShimmer duration={2}>Loading wind speed…</TextShimmer>
                )}
              </p>
              <p className='text-[10px] opacity-60 border-t border-primary-foreground/20 pt-1 mt-1'>
                Source: WeatherAPI.com
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </>
  );
}
