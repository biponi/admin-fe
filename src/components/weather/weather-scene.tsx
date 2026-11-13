import { useMemo } from "react";
import { cn } from "../../lib/utils";
import {
  SCENE_ORB_EMOJI,
  mulberry32,
  type SceneTimeOfDay,
  type SceneWeather,
} from "../../lib/weather-scene";

// Minimal-intensity particle counts (spec: rain 14, storm 24, stars 10)
const STAR_COUNT = 10;
const RAIN_COUNT = 14;
const STORM_RAIN_COUNT = 24;

interface WeatherSceneProps {
  timeOfDay: SceneTimeOfDay;
  weather: SceneWeather;
  className?: string;
}

interface Star {
  left: string;
  top: string;
  size: string;
  duration: string;
  delay: string;
}

interface Drop {
  left: string;
  height: string;
  duration: string;
  delay: string;
}

/**
 * Ambient animated weather backdrop for the sidebar: layered skies cross-faded
 * by opacity, a sun/moon orb, drifting clouds, stars, rain streaks and storm
 * lightning — all CSS animation (transform/opacity only), driven by the
 * data-tod / data-weather attributes styled in index.scss. Presentational
 * only: callers pass the derived timeOfDay/weather and handle missing data.
 */
export function WeatherScene({ timeOfDay, weather, className }: WeatherSceneProps) {
  // Deterministic star layout — a fixed seed keeps positions stable across
  // renders so temperature/time changes never make the sky jump.
  const stars = useMemo<Star[]>(() => {
    const rand = mulberry32(20261110);
    return Array.from({ length: STAR_COUNT }, () => ({
      left: `${(rand() * 100).toFixed(1)}%`,
      top: `${(rand() * 52).toFixed(1)}%`,
      size: `${(1 + rand() * 2).toFixed(1)}px`,
      duration: `${(2.5 + rand() * 1.5).toFixed(2)}s`,
      delay: `-${(rand() * 3).toFixed(2)}s`,
    }));
  }, []);

  // Rain layout keyed on weather kind only — drops keep their positions while
  // temperature or time-of-day changes; rebuilt when rain/storm switches.
  const drops = useMemo<Drop[]>(() => {
    if (weather !== "rain" && weather !== "storm") return [];
    const storm = weather === "storm";
    const rand = mulberry32(storm ? 77 : 42);
    return Array.from({ length: storm ? STORM_RAIN_COUNT : RAIN_COUNT }, () => ({
      left: `${(rand() * 100).toFixed(1)}%`,
      height: `${Math.round(8 + rand() * (storm ? 16 : 12))}px`,
      duration: `${(storm ? 0.5 + rand() * 0.3 : 0.9 + rand() * 0.5).toFixed(2)}s`,
      delay: `-${(rand() * 1.5).toFixed(2)}s`,
    }));
  }, [weather]);

  // Two drifting clouds, a third joins when the weather is not clear
  const clouds = useMemo(() => {
    const third = weather !== "clear";
    return [
      { top: "9%", size: "3rem", duration: "46s", delay: "-9s" },
      { top: "28%", size: "2.4rem", duration: "58s", delay: "-31s" },
      ...(third
        ? [{ top: "18%", size: "3.4rem", duration: "52s", delay: "-20s" }]
        : []),
    ];
  }, [weather]);

  // The scene always ends dark: every sky is darkened per the readability
  // spec and a vertical black scrim sits on top of the whole composite, so
  // sidebar text is always white. Same attribute the image backdrop emits,
  // so index.scss has one rule for both.
  return (
    <div
      aria-hidden='true'
      data-tod={timeOfDay}
      data-weather={weather}
      data-light-text='true'
      className={cn("weather-scene", className)}>
      {/* One sky per time of day, cross-faded by opacity */}
      <div className='ws-sky ws-sky-morning' />
      <div className='ws-sky ws-sky-day' />
      <div className='ws-sky ws-sky-evening' />
      <div className='ws-sky ws-sky-night' />

      {/* Low silhouette hills — morning/evening orbs sit behind these */}
      <div className='ws-hills' />

      <div className='ws-stars'>
        {stars.map((star, i) => (
          <i
            key={i}
            className='animate-weather-scene-twinkle'
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDuration: star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {/* ☀️ by day, 🌙 at night */}
      <span className='ws-orb animate-weather-scene-orb-float'>
        {SCENE_ORB_EMOJI[timeOfDay]}
      </span>

      {clouds.map((cloud, i) => (
        <span
          key={i}
          className={cn("ws-cloud animate-weather-scene-cloud", i === 2 && "ws-cloud-c3")}
          style={{
            top: cloud.top,
            fontSize: cloud.size,
            animationDuration: cloud.duration,
            animationDelay: cloud.delay,
          }}>
          ☁️
        </span>
      ))}

      {/* Dims the sky in rain, darker in storm */}
      <div className='ws-tint' />

      <div className='ws-rain'>
        {drops.map((drop, i) => (
          <i
            key={i}
            className='animate-weather-scene-fall'
            style={{
              left: drop.left,
              height: drop.height,
              animationDuration: drop.duration,
              animationDelay: drop.delay,
            }}
          />
        ))}
      </div>

      {/* Storm: one soft flash roughly every 8s + ⚡ */}
      <div className='ws-flash animate-weather-scene-flash' />
      <span className='ws-bolt animate-weather-scene-flash'>⚡</span>

      {/* Vertical readability scrim — topmost layer of the scene, so nav
          text always composites over a darkened sky (WCAG AA) */}
      <div className='ws-scrim' />
    </div>
  );
}
