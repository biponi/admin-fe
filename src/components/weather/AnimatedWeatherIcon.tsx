import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
import type { WeatherPeriod } from "../../config/weather-theme";

interface AnimatedWeatherIconProps {
  /** WMO weather code from the API (null = no data yet, shows clear-sky) */
  code: number | null;
  period: WeatherPeriod;
  className?: string;
}

/**
 * Period-aware animated weather icon for the header pill. Keeps WMO
 * granularity (drizzle vs rain vs showers vs partly cloudy) while upgrading
 * the clear-sky bucket to morning/day/evening/night icons. Every icon is
 * disabled under prefers-reduced-motion.
 */
export function AnimatedWeatherIcon({
  code,
  period,
  className = "h-3.5 w-3.5 shrink-0",
}: AnimatedWeatherIconProps) {
  const motionSafe = "motion-reduce:animate-none";

  // Thunderstorm: 95-99 (check before the generic rain bucket)
  if (code !== null && code >= 95 && code <= 99) {
    return (
      <CloudLightning
        className={`${className} text-amber-500 animate-weather-pulse-soft ${motionSafe}`}
      />
    );
  }

  // Snow: 71-77
  if (code !== null && code >= 71 && code <= 77) {
    return (
      <CloudSnow
        className={`${className} text-sky-500 animate-weather-float ${motionSafe}`}
      />
    );
  }

  // Fog: 45, 48 (before the generic 3..50 overcast bucket)
  if (code === 45 || code === 48) {
    return (
      <CloudFog
        className={`${className} text-slate-400 dark:text-slate-500 animate-weather-pulse-soft ${motionSafe}`}
      />
    );
  }

  // Drizzle: 51-57
  if (code !== null && code >= 51 && code <= 57) {
    return (
      <CloudDrizzle
        className={`${className} text-blue-400 animate-weather-float ${motionSafe}`}
      />
    );
  }

  // Rain / showers: 61-67 = Rain, 80-82 = Showers
  if (code !== null && ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))) {
    return (
      <CloudRain
        className={`${className} text-blue-500 animate-weather-float ${motionSafe}`}
      />
    );
  }

  // Partly cloudy / mainly clear (codes 1, 2)
  if (code === 1 || code === 2) {
    return period === "evening" || period === "night" ? (
      <CloudMoon
        className={`${className} text-indigo-300 animate-weather-float ${motionSafe}`}
      />
    ) : (
      <CloudSun
        className={`${className} text-amber-500 animate-weather-float ${motionSafe}`}
      />
    );
  }

  // Clear sky (code 0) or default fallback — period-aware
  switch (period) {
    case "morning":
      return (
        <Sunrise
          className={`${className} text-amber-500 animate-weather-float ${motionSafe}`}
        />
      );
    case "evening":
      return (
        <Sunset
          className={`${className} text-orange-500 animate-weather-float ${motionSafe}`}
        />
      );
    case "night":
      return (
        <Moon
          className={`${className} text-indigo-400 animate-weather-pulse-soft ${motionSafe}`}
        />
      );
    default:
      return (
        <Sun
          className={`${className} text-amber-500 animate-spin-slow ${motionSafe}`}
        />
      );
  }
}
