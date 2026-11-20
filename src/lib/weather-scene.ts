// Weather → animated scene mapping. Pure module, no React.
//
// The backend /api/v1/weather/current returns a WMO weather code; the mapped
// `condition` (clear/cloud/rain/storm/snow/fog) and `period`
// (morning/day/evening/night) come from WeatherContext / weather-theme.ts.
// This module translates those into the four scene states the CSS reacts to:
// SceneWeather (clear/cloudy/rain/storm) × SceneTimeOfDay.

import { getWeatherCondition, type WeatherCondition, type WeatherPeriod } from "../config/weather-theme";

/** The four scene states the animated weather scene can render. */
export type SceneWeather = "clear" | "cloudy" | "rain" | "storm";

/** Rain intensity variant — orthogonal to SceneWeather, styled via data-rain. */
export type RainIntensity = "drizzle" | "rain" | "heavy";

/** Bucketed wind strength — calm / light / moderate / strong, styled via data-wind. */
export type WindLevel = 0 | 1 | 2 | 3;

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
 * WMO code + effective condition → rain intensity variant. Only consults the
 * code when it agrees with the effective condition (the dev theme override can
 * force "rain" while the real code says clear — fall back to the medium look
 * rather than rendering drizzle under a forced rain theme).
 */
export function mapRainIntensity(
  weatherCode: number | null,
  condition: WeatherCondition | null
): RainIntensity {
  if (condition === "storm") return "heavy";
  if (condition === "rain") {
    const codeMatches = getWeatherCondition(weatherCode) === condition;
    if (codeMatches && weatherCode !== null) {
      // 51/53/55 + freezing 56/57 → drizzle; 65/66/82 → heavy downpour
      if (weatherCode >= 51 && weatherCode <= 57) return "drizzle";
      if (weatherCode === 65 || weatherCode === 66 || weatherCode === 82)
        return "heavy";
    }
    return "rain";
  }
  return "rain"; // unused — callers only pass it for rain/storm scenes
}

/**
 * Real wind speed (km/h) → bucketed wind level, with per-condition defaults
 * when the API reports no wind. Storms default to strong so the scene still
 * slants and gusts when wind data is missing.
 */
export function mapWindLevel(
  windSpeed: number | null,
  weather: SceneWeather | null
): WindLevel {
  const fallback: Record<SceneWeather, WindLevel> = {
    clear: 1,
    cloudy: 1,
    rain: 2,
    storm: 3,
  };
  if (windSpeed === null || weather === null) return fallback[weather ?? "clear"];
  if (windSpeed < 6) return 0; // calm
  if (windSpeed < 20) return 1; // light breeze
  if (windSpeed < 39) return 2; // moderate
  return 3; // strong / gale
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
