// Weather → theme mapping. Pure module, no React.
//
// The backend /api/v1/weather/current proxies WeatherAPI.com and returns a
// WMO weather code (0, 1-3, 45/48, 51-82, 95-99) — not WeatherAPI condition
// codes. The payload has no location.localtime, so the morning/day/evening
// split uses the browser's local hour (getWeatherPeriod).

import clearMorning from "../assets/theme-images/clear-morning.jpeg";
import clearDay from "../assets/theme-images/clear-day.jpg";
import clearEvening from "../assets/theme-images/clear-evening.jpg";
import clearNight from "../assets/theme-images/clear-night.jpeg";
import rainyMorning from "../assets/theme-images/rainy-morning.jpeg";
import rainyDay from "../assets/theme-images/rainy-day.jpg";
import rainyEvening from "../assets/theme-images/rainy-evening.jpeg";
import rainyNight from "../assets/theme-images/rainy-night.jpeg";

export type WeatherCondition =
  | "clear"
  | "cloud"
  | "rain"
  | "storm"
  | "snow"
  | "fog";

export type WeatherPeriod = "morning" | "day" | "evening" | "night";

export type WeatherThemeKey = `${WeatherCondition}-${WeatherPeriod}`;

// All 24 combos — used to validate the dev override key.
export const WEATHER_THEME_KEYS: WeatherThemeKey[] = (
  ["clear", "cloud", "rain", "storm", "snow", "fog"] as WeatherCondition[]
).flatMap((condition) =>
  (["morning", "day", "evening", "night"] as WeatherPeriod[]).map(
    (period) => `${condition}-${period}` as WeatherThemeKey,
  ),
);

/**
 * WMO code → theme condition. Returns null for unknown/null codes so
 * consumers can fall back to the existing non-themed look.
 */
export function getWeatherCondition(
  code: number | null,
): WeatherCondition | null {
  if (code === null) return null;
  if (code >= 95 && code <= 99) return "storm";
  if (code >= 71 && code <= 77) return "snow";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  // 0 = clear sky, 1 = mainly clear, 2 = partly cloudy — all render the
  // clear theme (the header icon shows Sun/Moon for these too)
  if (code >= 0 && code <= 2) return "clear";
  // 3 = overcast, 4-50 = remaining opaque buckets (excluding fog above)
  if (code >= 3 && code < 51) return "cloud";
  return null;
}

/**
 * Local hour → period. The viewer's clock is the source of truth so the
 * themes follow it immediately — the API's isDay flag only refreshes every
 * few minutes and previously pinned the period to night, swallowing manual
 * clock changes. Buckets: 5-10 morning, 11-16 day, 17-18 evening, else night.
 */
export function getWeatherPeriod(hour: number): WeatherPeriod {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "evening";
  return "night";
}

export interface WeatherTheme {
  /** Statically imported image URL for the sidebar backdrop */
  image: string;
  /** Optional readability overlay classes ("" = none — the image shows raw) */
  overlayClass: string;
  /** Animated rain streaks on the sidebar (rain/storm only) */
  rainOverlay: boolean;
  /** Low-opacity gradient tint for the top bar background */
  topBarClass: string;
  /** Which animation the top bar background layer runs */
  topBarAnim: "drift" | "rain" | "pulse" | "float" | "none";
  /** True when the image is dark enough that sidebar text must flip to white.
   * Measured from the actual art (average luminance); drives the
   * data-light-text attribute the sidebar text-color rules key on. */
  darkText: boolean;
}

// Morning/day backdrops get a light wash so the black sidebar options stay
// readable over the art; evening/night keep the image raw with white text
// (scene-driven --sidebar-foreground rules in index.scss).
const LIGHT_BACKDROP = "bg-gray-900/60 ";
const CLEAR_OVERLAY = "";
const RAIN_OVERLAY = "";

// Top bar tints — subtle warm/cool washes that complement the sidebar image.
const TINT_MORNING =
  "bg-gradient-to-br from-amber-300/25 via-orange-200/10 to-transparent";
const TINT_DAY =
  "bg-gradient-to-br from-amber-200/25 via-yellow-100/10 to-transparent";
const TINT_EVENING =
  "bg-gradient-to-br from-orange-300/25 via-rose-300/10 to-transparent";
const TINT_NIGHT =
  "bg-gradient-to-br from-indigo-400/20 via-slate-500/10 to-transparent";
const TINT_RAIN =
  "bg-gradient-to-br from-sky-400/20 via-slate-400/10 to-transparent";

// Only clear-* and rainy-* art exists so far; cloud/storm/snow/fog alias to
// the rainy images. When new art lands, change just the entry below.
const rainyImageFor = (period: WeatherPeriod): string =>
  ({
    morning: rainyMorning,
    day: rainyDay,
    evening: rainyEvening,
    night: rainyNight,
  })[period];

const clearImageFor = (period: WeatherPeriod): string =>
  ({
    morning: clearMorning,
    day: clearDay,
    evening: clearEvening,
    night: clearNight,
  })[period];

function buildTheme(
  condition: WeatherCondition,
  period: WeatherPeriod,
): WeatherTheme {
  const isClear = condition === "clear";
  const image = isClear ? clearImageFor(period) : rainyImageFor(period);
  const rainOverlay = condition === "rain" || condition === "storm";

  let topBarAnim: WeatherTheme["topBarAnim"] = "none";
  if (isClear) {
    topBarAnim = period === "day" || period === "night" ? "pulse" : "float"; // morning/evening
  } else if (rainOverlay) {
    topBarAnim = "rain";
  } else {
    topBarAnim = "drift"; // cloud / fog / snow
  }

  // Morning/day sidebar options render black on a light backdrop wash;
  // evening/night keep the raw dark art with white text.
  const isLightPeriod = period === "morning" || period === "day";

  return {
    image,
    overlayClass: isLightPeriod
      ? LIGHT_BACKDROP
      : isClear
        ? CLEAR_OVERLAY
        : RAIN_OVERLAY,
    rainOverlay,
    topBarClass:
      period === "night"
        ? TINT_NIGHT
        : isClear
          ? period === "morning"
            ? TINT_MORNING
            : period === "evening"
              ? TINT_EVENING
              : TINT_DAY
          : TINT_RAIN,
    topBarAnim,
    // True = dark art → sidebar text flips to white. Morning/day now sit on
    // the light backdrop wash, so their options are black in every condition.
    darkText: !isLightPeriod,
  };
}

export const WEATHER_THEMES = Object.fromEntries(
  WEATHER_THEME_KEYS.map((key) => {
    const [condition, period] = key.split("-") as [
      WeatherCondition,
      WeatherPeriod,
    ];
    return [key, buildTheme(condition, period)];
  }),
) as Record<WeatherThemeKey, WeatherTheme>;
