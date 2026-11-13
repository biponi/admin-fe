// Weather → animated scene mapping. Pure module, no React.
//
// The backend /api/v1/weather/current returns a WMO weather code; the mapped
// `condition` (clear/cloud/rain/storm/snow/fog) and `period`
// (morning/day/evening/night) come from WeatherContext / weather-theme.ts.
// This module translates those into the four scene states the CSS reacts to:
// SceneWeather (clear/cloudy/rain/storm) × SceneTimeOfDay.

import type { WeatherCondition, WeatherPeriod } from "../config/weather-theme";

/** The four scene states the animated weather scene can render. */
export type SceneWeather = "clear" | "cloudy" | "rain" | "storm";

/** Time of day for the scene — same buckets the topbar/theme already use. */
export type SceneTimeOfDay = WeatherPeriod;

/**
 * Theme condition → scene weather. snow/fog fall back to cloudy (the scene
 * has no dedicated snow/fog effects); null (no data) stays null so callers
 * can fall back to the plain sidebar look.
 */
export function mapSceneWeather(
  condition: WeatherCondition | null
): SceneWeather | null {
  if (condition === null) return null;
  switch (condition) {
    case "clear":
      return "clear";
    case "rain":
      return "rain";
    case "storm":
      return "storm";
    default:
      // cloud, snow, fog → cloudy
      return "cloudy";
  }
}

/**
 * Weather emoji shown in the scene info block (and next to the temperature).
 * Clear uses the time-of-day emoji; other states use one emoji each.
 */
export const SCENE_EMOJI: Record<SceneWeather, Record<SceneTimeOfDay, string>> = {
  clear: { morning: "🌅", day: "☀️", evening: "🌇", night: "🌙" },
  cloudy: { morning: "☁️", day: "☁️", evening: "☁️", night: "☁️" },
  rain: { morning: "🌧️", day: "🌧️", evening: "🌧️", night: "🌧️" },
  storm: { morning: "⛈️", day: "⛈️", evening: "⛈️", night: "⛈️" },
};

/** The ☀️ / 🌙 body rendered inside the scene. */
export const SCENE_ORB_EMOJI: Record<SceneTimeOfDay, string> = {
  morning: "☀️",
  day: "☀️",
  evening: "☀️",
  night: "🌙",
};

/**
 * WMO code → short condition text for the sidebar info block. Extracted from
 * HeaderDateTimeWeather's local getWeatherDescription so the topbar and the
 * sidebar info block share one source of truth.
 */
export function getWeatherDescription(
  weatherCode: number | null,
  period: WeatherPeriod | null
): string {
  if (weatherCode !== null && weatherCode >= 95 && weatherCode <= 99) {
    return "Thunderstorm";
  }
  if (weatherCode !== null && weatherCode >= 71 && weatherCode <= 77) {
    return "Snow";
  }
  if (weatherCode === 45 || weatherCode === 48) {
    return "Fog";
  }
  if (weatherCode !== null && weatherCode >= 51 && weatherCode <= 57) {
    return "Drizzle";
  }
  if (weatherCode !== null && weatherCode >= 61 && weatherCode <= 82) {
    return "Rain / Showers";
  }
  if (weatherCode !== null && weatherCode >= 3 && weatherCode < 51) {
    return "Overcast / Cloudy";
  }
  if (weatherCode === 1 || weatherCode === 2) {
    return period === "night" || period === "evening"
      ? "Partly cloudy (Night)"
      : "Partly cloudy (Day)";
  }
  if (weatherCode === 0) {
    return period === "night" || period === "evening"
      ? "Clear sky (Night)"
      : "Sunny / Clear sky (Day)";
  }
  return period === "night" ? "Night" : "Day";
}

/**
 * Small seeded PRNG (mulberry32) so particle layouts are deterministic —
 * no Math.random() during render (SSR-safe, no visual jumps on re-render).
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
