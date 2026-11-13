import { useEffect, useRef, useState } from "react";
import { useWeatherContext } from "../../contexts/WeatherContext";
import {
  WEATHER_THEMES,
  type WeatherThemeKey,
  type WeatherCondition,
} from "../../config/weather-theme";
import { mapSceneWeather } from "../../lib/weather-scene";

// How long the outgoing image stays mounted during a crossfade. Should be
// >= the weather-fade-in duration (0.8s) so the two overlap.
const CROSSFADE_MS = 900;

// 8px pattern period — the weather-rain keyframe shifts background-position
// by 128px (= 16 periods) so the loop is seamless
const RAIN_STREAK_BG =
  "repeating-linear-gradient(175deg, transparent 0 7px, rgba(255,255,255,0.05) 7px 8px)";

/**
 * Weather-themed backdrop for the sidebar: crossfading background image,
 * a dark readability overlay and (for rain/storm) animated streaks.
 * Renders null when there is no weather data yet, so the existing plain
 * bg-sidebar look stays as the fallback. Placed inside <Sidebar>'s children,
 * it works for both the desktop fixed panel and the mobile Sheet variant.
 */
export function SidebarWeatherBackdrop() {
  const { themeKey } = useWeatherContext();

  // Keep the previous image mounted briefly so a theme change crossfades
  // instead of popping.
  const [prevKey, setPrevKey] = useState<WeatherThemeKey | null>(null);
  const currKeyRef = useRef<WeatherThemeKey | null>(themeKey);
  const fadeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (themeKey === currKeyRef.current) return;
    setPrevKey(currKeyRef.current);
    currKeyRef.current = themeKey;
    if (fadeTimerRef.current !== null) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = window.setTimeout(
      () => setPrevKey(null),
      CROSSFADE_MS,
    );
    return () => {
      if (fadeTimerRef.current !== null) clearTimeout(fadeTimerRef.current);
    };
  }, [themeKey]);

  if (!themeKey) return null;

  const theme = WEATHER_THEMES[themeKey];
  const prevTheme = prevKey ? WEATHER_THEMES[prevKey] : null;

  // data-light-text lets index.scss flip the sidebar text colour to white
  // whenever the art is dark (measured per image in weather-theme.ts) — the
  // animated scene emits the same attribute from its sky/tint brightness.
  const [condition, period] = themeKey.split("-") as [WeatherCondition, string];

  return (
    <div
      aria-hidden='true'
      data-tod={period}
      data-weather={mapSceneWeather(condition)}
      data-light-text={theme.darkText ? "true" : "false"}
      className='weather-backdrop  pointer-events-none absolute inset-0 z-0 overflow-hidden'>
      {/* Outgoing image during a crossfade */}
      {prevTheme && (
        <div
          className='absolute inset-0 bg-cover bg-center'
          style={{ backgroundImage: `url(${prevTheme.image})` }}
        />
      )}
      {/* Incoming image — key forces the fade-in to replay on every change */}
      <div
        key={themeKey}
        className='absolute inset-0 bg-cover bg-center animate-weather-fade-in motion-reduce:animate-none'
        style={{ backgroundImage: `url(${theme.image})` }}
      />

      {/* Optional readability overlay — currently empty so the image shows raw */}
      {theme.overlayClass && (
        <div className={`absolute inset-0 ${theme.overlayClass}`} />
      )}

      {/* Animated rain streaks (rain/storm only) */}
      {theme.rainOverlay && (
        <div
          className='absolute inset-0 animate-weather-rain motion-reduce:hidden'
          style={{
            backgroundImage: RAIN_STREAK_BG,
            backgroundSize: "128px 128px",
          }}
        />
      )}
    </div>
  );
}
