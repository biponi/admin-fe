import { useWeatherContext } from "../../contexts/WeatherContext";
import { WEATHER_THEMES } from "../../config/weather-theme";

// 8px pattern period — matches the weather-rain keyframe (128px = 16 periods)
const RAIN_STREAK_BG =
  "repeating-linear-gradient(175deg, transparent 0 7px, rgba(255,255,255,0.06) 7px 8px)";

// Wide soft cloud band for the drift animation — a ~50%-width radial blob
// whose background-position loops horizontally
const CLOUD_DRIFT_BG =
  "radial-gradient(ellipse 60% 100% at 50% 50%, rgba(255,255,255,0.35), transparent 70%), radial-gradient(ellipse 60% 100% at 100% 50%, rgba(255,255,255,0.35), transparent 70%)";

/**
 * Animated themed background for the top bars: a low-opacity gradient tint
 * plus a condition-specific animation (rain streaks / drifting clouds / glow
 * pulse). Renders null when there is no weather data yet so the headers
 * keep their current bg-background look. Place as the first child of the
 * <header>; headers are sticky (= positioned) so this anchors to them.
 */
export function TopBarWeatherOverlay() {
  const { themeKey, period } = useWeatherContext();
  if (!themeKey) return null;

  const theme = WEATHER_THEMES[themeKey];
  const motionSafe = "motion-reduce:animate-none";

  return (
    <div
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
      {/* Themed gradient tint */}
      <div className={`absolute inset-0 ${theme.topBarClass}`} />

      {/* Condition-specific animation layer */}
      {theme.topBarAnim === "rain" && (
        <div
          className={`absolute inset-0 opacity-25 animate-weather-rain ${motionSafe}`}
          style={{
            backgroundImage: RAIN_STREAK_BG,
            backgroundSize: "128px 128px",
          }}
        />
      )}

      {theme.topBarAnim === "drift" && (
        <div
          className={`absolute inset-0 opacity-20 animate-weather-drift ${motionSafe}`}
          style={{
            backgroundImage: CLOUD_DRIFT_BG,
            backgroundSize: "200% 100%",
          }}
        />
      )}

      {theme.topBarAnim === "pulse" && (
        <div
          className={`absolute -top-10 right-10 size-40 rounded-full blur-3xl animate-weather-pulse-soft ${motionSafe} ${
            period === "night"
              ? "bg-indigo-300/30 dark:bg-indigo-400/25"
              : "bg-amber-300/35 dark:bg-amber-400/20"
          }`}
        />
      )}

      {theme.topBarAnim === "float" && (
        <div
          className={`absolute -top-8 left-1/3 size-32 rounded-full blur-3xl animate-weather-float ${motionSafe} ${
            period === "morning"
              ? "bg-amber-300/30"
              : "bg-orange-300/30 dark:bg-orange-400/20"
          }`}
        />
      )}
    </div>
  );
}
