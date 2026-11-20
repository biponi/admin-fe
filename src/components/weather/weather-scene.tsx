import { useMemo } from "react";
import { cn } from "../../lib/utils";
import {
  SCENE_ORB_EMOJI,
  mulberry32,
  type RainIntensity,
  type SceneTimeOfDay,
  type SceneWeather,
  type WindLevel,
} from "../../lib/weather-scene";

// Minimal-intensity particle counts (spec: stars 10; rain counts per preset)
const STAR_COUNT = 10;

/**
 * Rain look per intensity variant. Counts/sizes are deliberately small — the
 * scene lives in a ~260px sidebar, and every drop is an animated node. One
 * fixed seed per variant keeps drop positions stable across re-renders.
 */
const RAIN_PRESETS: Record<
  RainIntensity,
  {
    count: number;
    seed: number;
    hMin: number;
    hMax: number;
    width: string;
    dMin: number;
    dMax: number;
    delaySpread: number;
  }
> = {
  drizzle: {
    count: 26,
    seed: 11,
    hMin: 4,
    hMax: 8,
    width: "1px",
    dMin: 1.6,
    dMax: 2.4,
    delaySpread: 3,
  },
  rain: {
    count: 16,
    seed: 42,
    hMin: 8,
    hMax: 20,
    width: "1.5px",
    dMin: 0.9,
    dMax: 1.4,
    delaySpread: 1.5,
  },
  heavy: {
    count: 34,
    seed: 91,
    hMin: 18,
    hMax: 34,
    width: "2px",
    dMin: 0.45,
    dMax: 0.75,
    delaySpread: 0.8,
  },
};

// Storm drops keep their own preset (thicker/faster than plain heavy rain)
const STORM_PRESET = {
  count: 40,
  seed: 77,
  hMin: 20,
  hMax: 40,
  width: "2px",
  dMin: 0.4,
  dMax: 0.6,
  delaySpread: 0.6,
} as const;

const SPLASH_COUNT = { heavy: 8, storm: 10 } as const;

interface WeatherSceneProps {
  timeOfDay: SceneTimeOfDay;
  weather: SceneWeather;
  /** Rain intensity variant (drizzle/rain/heavy); storm renders its own look */
  rainIntensity?: RainIntensity;
  /** Bucketed wind level 0-3 — drives slant, cloud bob and gust streaks */
  windLevel?: WindLevel;
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
  width: string;
  duration: string;
  delay: string;
}

interface Splash {
  left: string;
  duration: string;
  delay: string;
}

interface Gust {
  top: string;
  width: string;
  duration: string;
  delay: string;
}

/**
 * Ambient animated weather backdrop for the sidebar: layered skies cross-faded
 * by opacity, a sun/moon orb, drifting clouds, stars, wind gusts, mist, rain
 * streaks (drizzle/rain/heavy variants), ground splashes and storm lightning —
 * all CSS animation (transform/opacity only), driven by the data-tod /
 * data-weather / data-rain / data-wind attributes styled in index.scss.
 * Presentational only: callers pass the derived timeOfDay/weather plus the
 * rain-intensity and wind level and handle missing data.
 */
export function WeatherScene({
  timeOfDay,
  weather,
  rainIntensity = "rain",
  windLevel = 1,
  className,
}: WeatherSceneProps) {
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

  // Rain layout keyed on weather kind + intensity — drops keep their positions
  // while temperature or time-of-day changes; rebuilt on variant switches.
  const drops = useMemo<Drop[]>(() => {
    if (weather !== "rain" && weather !== "storm") return [];
    const storm = weather === "storm";
    const preset = storm ? STORM_PRESET : RAIN_PRESETS[rainIntensity];
    const rand = mulberry32(preset.seed);
    return Array.from({ length: preset.count }, () => ({
      left: `${(rand() * 100).toFixed(1)}%`,
      height: `${Math.round(
        preset.hMin + rand() * (preset.hMax - preset.hMin)
      )}px`,
      width: preset.width,
      duration: `${(
        preset.dMin + rand() * (preset.dMax - preset.dMin)
      ).toFixed(2)}s`,
      delay: `-${(rand() * preset.delaySpread).toFixed(2)}s`,
    }));
  }, [weather, rainIntensity]);

  // Ground splash rings — heavy rain and storm only
  const splashes = useMemo<Splash[]>(() => {
    if (weather !== "storm" && rainIntensity !== "heavy") return [];
    const count =
      weather === "storm" ? SPLASH_COUNT.storm : SPLASH_COUNT.heavy;
    const rand = mulberry32(5);
    return Array.from({ length: count }, () => ({
      left: `${(rand() * 100).toFixed(1)}%`,
      duration: `${(0.8 + rand() * 0.5).toFixed(2)}s`,
      delay: `-${(rand() * 1.2).toFixed(2)}s`,
    }));
  }, [weather, rainIntensity]);

  // Wind gust streaks — count and visibility scale with the wind level
  const gusts = useMemo<Gust[]>(() => {
    if (windLevel < 1) return [];
    const rand = mulberry32(23);
    return Array.from({ length: 2 + windLevel }, () => ({
      top: `${(15 + rand() * 55).toFixed(1)}%`,
      width: `${(12 + rand() * 10).toFixed(1)}%`,
      duration: `${(3.5 + rand() * 2.5).toFixed(2)}s`,
      delay: `-${(rand() * 4).toFixed(2)}s`,
    }));
  }, [windLevel]);

  // Two drifting clouds, a third joins when the weather is not clear; drift
  // speeds up with the wind so a storm visibly hurries them along. The sway
  // and bob periods differ per cloud so the wind motion never syncs up into
  // a visible shared rhythm.
  const clouds = useMemo(() => {
    const third = weather !== "clear";
    const speedUp = 1 + windLevel * 0.22;
    return [
      { top: "9%", size: "3rem", duration: 46, delay: "-9s", sway: 9, bob: 5.5 },
      { top: "28%", size: "2.4rem", duration: 58, delay: "-31s", sway: 11, bob: 6.5 },
      ...(third
        ? [
            {
              top: "18%",
              size: "3.4rem",
              duration: 52,
              delay: "-20s",
              sway: 10,
              bob: 6,
            },
          ]
        : []),
    ].map((cloud) => ({
      ...cloud,
      duration: `${Math.round(cloud.duration / speedUp)}s`,
      sway: `${cloud.sway}s`,
      bob: `${cloud.bob}s`,
    }));
  }, [weather, windLevel]);

  // The scene always ends dark: every sky is darkened per the readability
  // spec and a vertical black scrim sits on top of the whole composite, so
  // sidebar text is always white. Same attribute the image backdrop emits,
  // so index.scss has one rule for both.
  return (
    <div
      aria-hidden='true'
      data-tod={timeOfDay}
      data-weather={weather}
      data-rain={rainIntensity}
      data-wind={windLevel}
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
          {/* Two nested motions so the wind wander composes with the outer
              drift instead of fighting it for the same transform */}
          <i
            className='ws-cloud-sway animate-weather-scene-sway'
            style={{ animationDuration: cloud.sway }}>
            <i
              className='ws-cloud-bob animate-weather-scene-bob'
              style={{ animationDuration: cloud.bob }}>
              ☁️
            </i>
          </i>
        </span>
      ))}

      {/* Wind gust streaks sweeping across the sky */}
      <div className='ws-gusts'>
        {gusts.map((gust, i) => (
          <i
            key={i}
            className='animate-weather-scene-gust'
            style={{
              top: gust.top,
              width: gust.width,
              animationDuration: gust.duration,
              animationDelay: gust.delay,
            }}
          />
        ))}
      </div>

      {/* Low mist bands — drizzle only */}
      <div className='ws-mist'>
        <i className='animate-weather-scene-mist' style={{ top: "28%", animationDuration: "18s" }} />
        <i
          className='animate-weather-scene-mist'
          style={{ top: "52%", animationDuration: "26s", animationDirection: "reverse" }}
        />
      </div>

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
              width: drop.width,
              animationDuration: drop.duration,
              animationDelay: drop.delay,
            }}
          />
        ))}
      </div>

      {/* Splash ripples where heavy drops hit the ground */}
      <div className='ws-splash'>
        {splashes.map((splash, i) => (
          <i
            key={i}
            className='animate-weather-scene-splash'
            style={{
              left: splash.left,
              animationDuration: splash.duration,
              animationDelay: splash.delay,
            }}
          />
        ))}
      </div>

      {/* Storm: two staggered double-strike flashes + flickering ⚡ */}
      <div className='ws-flash animate-weather-scene-flash-double' />
      <div
        className='ws-flash ws-flash-alt animate-weather-scene-flash-double'
        style={{ animationDelay: "-4s" }}
      />
      <span className='ws-bolt animate-weather-scene-bolt'>⚡</span>

      {/* Vertical readability scrim — topmost layer of the scene, so nav
          text always composites over a darkened sky (WCAG AA) */}
      <div className='ws-scrim' />
    </div>
  );
}
