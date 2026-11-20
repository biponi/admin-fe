import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getCurrentWeather } from "../api/weather";
import {
  getWeatherCondition,
  getWeatherPeriod,
  WEATHER_THEME_KEYS,
  type WeatherCondition,
  type WeatherPeriod,
  type WeatherThemeKey,
} from "../config/weather-theme";

// Default location when geolocation is unavailable/denied: Dhaka, Bangladesh
const DHAKA_LAT = 23.75;
const DHAKA_LON = 90.38;

// Weather refresh interval (minutes) — VITE_WEATHER_REFRESH_MINUTES
const WEATHER_REFRESH_MS =
  (Number(import.meta.env.VITE_WEATHER_REFRESH_MINUTES) || 3) * 60 * 1000;

// localStorage keys — kept identical to the pre-context header pill so
// existing caches keep working on first paint
const readCachedNumber = (key: string): number | null => {
  try {
    const cached = localStorage.getItem(key);
    return cached !== null ? Number(cached) : null;
  } catch {
    return null;
  }
};

const readCachedBool = (key: string): boolean | null => {
  try {
    const cached = localStorage.getItem(key);
    return cached !== null ? cached === "1" : null;
  } catch {
    return null;
  }
};

// Dev helper: force a themeKey without touching real weather data.
// localStorage.setItem("dev_weather_theme_override", "storm-evening")
const readThemeOverride = (): WeatherThemeKey | null => {
  try {
    const raw = localStorage.getItem("dev_weather_theme_override");
    return raw && (WEATHER_THEME_KEYS as string[]).includes(raw)
      ? (raw as WeatherThemeKey)
      : null;
  } catch {
    return null;
  }
};

// Dev helpers: force the raw WMO code / wind speed so scene variants the
// real weather never reports (drizzle, heavy rain, gale) can be previewed.
// The code override also drives `condition`, so one key reaches everything.
// localStorage.setItem("dev_weather_code_override", "53")
// localStorage.setItem("dev_weather_wind_override", "45")
const readDevNumber = (key: string): number | null => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw.trim() === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
};

interface WeatherContextType {
  temperature: number | null;
  weatherCode: number | null;
  isDay: boolean | null;
  windSpeed: number | null;
  rainProbability: number | null;
  nextHourRainProbability: number | null;
  /** Incremented on each rainWarning false -> true transition */
  rainWarningEvent: number;
  /** Local browser hour, re-ticked every 30s so the period stays current */
  hour: number;
  condition: WeatherCondition | null;
  period: WeatherPeriod;
  /** null = no theme (data not loaded yet / unknown code) */
  themeKey: WeatherThemeKey | null;
}

const WeatherContext = createContext<WeatherContextType | undefined>(
  undefined
);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [temperature, setTemperature] = useState<number | null>(() =>
    readCachedNumber("header_weather_temp")
  );
  const [weatherCode, setWeatherCode] = useState<number | null>(() =>
    readCachedNumber("header_weather_code")
  );
  const [isDay, setIsDay] = useState<boolean | null>(() =>
    readCachedBool("header_weather_is_day")
  );
  const [windSpeed, setWindSpeed] = useState<number | null>(() =>
    readCachedNumber("header_weather_wind")
  );
  const [rainProbability, setRainProbability] = useState<number | null>(() =>
    readCachedNumber("header_weather_rain")
  );
  const [nextHourRainProbability, setNextHourRainProbability] = useState<
    number | null
  >(null);
  const [rainWarningEvent, setRainWarningEvent] = useState(0);
  const [hour, setHour] = useState(() => new Date().getHours());
  const [themeOverride, setThemeOverride] =
    useState<WeatherThemeKey | null>(readThemeOverride);
  const [devCodeOverride, setDevCodeOverride] = useState<number | null>(() =>
    readDevNumber("dev_weather_code_override")
  );
  const [devWindOverride, setDevWindOverride] = useState<number | null>(() =>
    readDevNumber("dev_weather_wind_override")
  );

  // Rain-warning edge trigger — only a false -> true transition counts
  const prevRainWarningRef = useRef(false);
  // Last known coords — the refresh interval re-fetches whatever geolocation
  // actually resolved instead of always falling back to Dhaka
  const lastCoordsRef = useRef<{ lat: number; lon: number }>({
    lat: DHAKA_LAT,
    lon: DHAKA_LON,
  });

  // Period granularity is an hour; no need to tick per second here
  // (the header pill keeps its own 1s clock for display)
  useEffect(() => {
    const timer = setInterval(() => setHour(new Date().getHours()), 30_000);
    return () => clearInterval(timer);
  }, []);

  // Listen for dev override changes made in other tabs / devtools
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "dev_weather_theme_override") {
        setThemeOverride(readThemeOverride());
      }
      if (e.key === "dev_weather_code_override") {
        setDevCodeOverride(readDevNumber("dev_weather_code_override"));
      }
      if (e.key === "dev_weather_wind_override") {
        setDevWindOverride(readDevNumber("dev_weather_wind_override"));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Fetch current weather, temperature, wind and rain probability
  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const result = await getCurrentWeather(lat, lon);
        if (isMounted && result.success && result.data) {
          const d = result.data;
          const temp = Math.round(d.temperature);
          const code = d.weatherCode;
          const dayStatus = d.isDay === 1;
          const wind = Math.round(d.windSpeed ?? 0);
          const rain = Math.round(d.rainProbability ?? 0);

          setTemperature(temp);
          setWeatherCode(code);
          setIsDay(dayStatus);
          setWindSpeed(wind);
          setRainProbability(rain);
          setNextHourRainProbability(
            d.nextHourRainProbability != null
              ? Math.round(d.nextHourRainProbability)
              : null
          );

          // Count only a new warning transition, not every refresh while
          // the warning persists. Re-arms once the warning clears.
          const warning = d.rainWarning === true;
          if (warning && !prevRainWarningRef.current) {
            setRainWarningEvent((n) => n + 1);
          }
          prevRainWarningRef.current = warning;

          try {
            localStorage.setItem("header_weather_temp", String(temp));
            localStorage.setItem("header_weather_code", String(code));
            localStorage.setItem(
              "header_weather_is_day",
              dayStatus ? "1" : "0"
            );
            localStorage.setItem("header_weather_wind", String(wind));
            localStorage.setItem("header_weather_rain", String(rain));
          } catch {
            // ignore localStorage quota errors
          }
        }
      } catch {
        // Fallback or offline, keep cached/null
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          lastCoordsRef.current = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          };
          fetchWeather(lastCoordsRef.current.lat, lastCoordsRef.current.lon);
        },
        () => {
          // Default: Dhaka, Bangladesh coordinates
          fetchWeather(lastCoordsRef.current.lat, lastCoordsRef.current.lon);
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(lastCoordsRef.current.lat, lastCoordsRef.current.lon);
    }

    // Refresh weather on the configured interval, at the resolved location
    const weatherInterval = setInterval(() => {
      fetchWeather(lastCoordsRef.current.lat, lastCoordsRef.current.lon);
    }, WEATHER_REFRESH_MS);

    return () => {
      isMounted = false;
      clearInterval(weatherInterval);
    };
  }, []);

  // Dev code override replaces the reported WMO code end-to-end (condition,
  // scene variants, icons); the wind override replaces the reported km/h.
  const effectiveCode = devCodeOverride ?? weatherCode;
  const effectiveWind = devWindOverride ?? windSpeed;

  const condition = useMemo(() => getWeatherCondition(effectiveCode), [
    effectiveCode,
  ]);
  const period = useMemo(() => getWeatherPeriod(hour), [hour]);

  // The dev override (dev_weather_theme_override, e.g. "storm-night") forces
  // the whole theme state — not just themeKey — so the animated scene
  // (condition/period) and the image theme (themeKey) stay in sync.
  const overridden = useMemo(() => {
    if (!themeOverride) return null;
    const [c, p] = themeOverride.split("-") as [
      WeatherCondition | null,
      WeatherPeriod | null,
    ];
    return { condition: c ?? null, period: p ?? null };
  }, [themeOverride]);

  const effectiveCondition = overridden ? overridden.condition : condition;
  const effectivePeriod = overridden ? overridden.period ?? period : period;

  const themeKey = useMemo<WeatherThemeKey | null>(() => {
    if (themeOverride) return themeOverride;
    return effectiveCondition
      ? `${effectiveCondition}-${effectivePeriod}`
      : null;
  }, [themeOverride, effectiveCondition, effectivePeriod]);

  return (
    <WeatherContext.Provider
      value={{
        temperature,
        weatherCode: effectiveCode,
        isDay,
        windSpeed: effectiveWind,
        rainProbability,
        nextHourRainProbability,
        rainWarningEvent,
        hour,
        condition: effectiveCondition,
        period: effectivePeriod,
        themeKey,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeatherContext(): WeatherContextType {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error(
      "useWeatherContext must be used within a WeatherProvider"
    );
  }
  return ctx;
}
