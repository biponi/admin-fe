# Task: Animated weather background for the sidebar (shadcn sidebar-07)

Our app already shows the current time and weather in the **topbar**. Add the same weather, time of day, emoji and animation to the **sidebar** (installed with `npx shadcn@latest add sidebar-07`), as a quiet ambient background. The topbar stays as it is. The sidebar must stay readable and usable first. The weather effect is decoration behind it.

A working prototype of the visual is included at the end of this prompt as **reference code**. It is plain HTML, Tailwind v3 CDN and vanilla JS. Do not paste it in. Port the idea into our React, TypeScript and shadcn codebase, following our conventions.

## 1. Explore first (do this before writing code)

Read the codebase and answer these for yourself. State your findings and assumptions in your first message, then continue without waiting for approval unless something is truly ambiguous.

1. Where is the topbar weather and time implemented? Find the component, the data source (we use WeatherAPI) and how the data is fetched and cached (hook, React Query/SWR, server action, context). **Reuse that data. Do not add a second fetch or a second API key usage.** If the data is only available inside the topbar component, extract it into a shared hook or context that both the topbar and the sidebar use, with no behavior change to the topbar.
2. Does the topbar already map WeatherAPI condition codes to emoji? If so, reuse that mapping as the single source of truth and extend it only where needed.
3. Which Tailwind version is installed (v3 with `tailwind.config`, or v4 with `@theme` in CSS)? Add keyframes and animations in the way that version expects. See section 5.
4. Find `app-sidebar.tsx` (or equivalent), the layout that wraps it in `SidebarProvider` and `SidebarInset`, and our theme setup (light and dark, CSS variables such as `--sidebar`, `--sidebar-foreground`).
5. Check whether the framework is Next.js App Router. If so, components that use state, effects or `useSidebar` need `"use client"`, and the scene must not cause hydration mismatches (see section 5).

## 2. What to build

### Behavior

- The sidebar background shows an animated scene driven by two inputs from the existing weather data:
  - **Time of day**: `morning`, `day`, `evening` or `night`, computed from the **location's local time** (`location.localtime` from WeatherAPI), not the viewer's browser clock. If the topbar data includes sunrise and sunset (astronomy), use them. Otherwise use these hours: 05:00 to 10:59 morning, 11:00 to 16:59 day, 17:00 to 18:59 evening, otherwise night. Use the same logic the topbar uses for its own time display so the two never disagree.
  - **Weather**: `clear`, `cloudy`, `rain` or `storm`, mapped from `current.condition.code`. Mapping:
    - storm: 1087, 1273, 1276, 1279, 1282
    - rain: 1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246
    - cloudy: 1003, 1006, 1009, 1030, 1135, 1147
    - everything else (including snow codes) falls back to `cloudy`, unless the topbar already has a better mapping. Snow effects are out of scope.
- Effects per state (see the reference code for exact values):
  - **Morning**: warm blue to peach sky, sun low on the left.
  - **Day**: blue sky, sun high.
  - **Evening**: purple to orange sky, sun low on the right.
  - **Night**: dark blue sky, 🌙 and a few twinkling stars. Stars fade out in storms and dim in rain.
  - **Rain**: grey tint over the sky, sun or moon dimmed, falling rain streaks, darker clouds.
  - **Storm**: darker tint, sun or moon hidden, slanted heavy rain, occasional lightning flash plus a ⚡.
  - **Cloudy**: slow drifting clouds, softer sun.
- Emoji: the sun or moon emoji lives inside the scene. A weather emoji (🌅 ☀️ 🌇 🌙 🌧️ ⛈️ ☁️) is shown next to the temperature in a small info block. Use the same emoji set as the topbar where one exists.
- Changing the data (for example the 15 minute refresh) must cross-fade smoothly. Sky layers fade by opacity. Never remount the whole scene on a data change.

### Minimal intensity (important)

The topbar carries other information. The sidebar scene must be calmer than the prototype:

- Sky gradients at about 35 to 45 percent opacity over `bg-sidebar`, plus a scrim so text from our theme tokens (`text-sidebar-foreground`, `text-sidebar-accent-foreground`) stays readable. Do not make nav text white. Keep using the theme tokens.
- Consider a vertical `mask-image` so the scene is strongest near the weather info block at the bottom and fades toward the nav at the top.
- Particle counts: rain 14, storm 24, stars 10. Clouds: at most 2 (3 only in rain or storm). No hills layer.
- Lightning: one soft flash roughly every 8 seconds, low peak opacity. No full-white flashes.
- Pure CSS animation using `transform` and `opacity` only. No new dependencies (no framer-motion). All scene layers are `pointer-events-none` and `aria-hidden="true"`.
- Respect `prefers-reduced-motion: reduce`: show the static sky, sun or moon and emoji with no drifting, falling, twinkling or flashing.

### Where it goes in the sidebar

- Render `<WeatherScene />` as the **first child inside `<Sidebar>`**, as an absolutely positioned layer (`absolute inset-0 overflow-hidden`), so it sits behind `SidebarHeader`, `SidebarContent`, `SidebarFooter` and `SidebarRail`. Give those `relative z-10` where needed. Check that the sidebar's inner container is a positioned ancestor. If not, add `relative` through the supported `className` path and do not fork the shadcn primitive unless unavoidable.
- It must also appear in the **mobile sheet** version of the sidebar. Verify it renders there.
- Add a compact weather info block in `SidebarFooter` (or the top of `SidebarHeader` if that fits our layout better): weather emoji, temperature, short condition text, and city. Keep it to two lines.
- **Collapsed (icon) mode**: use `useSidebar()` (`state === "collapsed"`) or the `group-data-[collapsible=icon]:` variants. In collapsed mode hide the text block, show only the weather emoji, and keep a tooltip with temperature and condition. The scene may stay visible in the narrow rail, but it must not overflow, clip badly or cover icons.
- Loading, error and missing data: show a neutral static sky (no animation) and no info block. Never throw because weather is missing. Match whatever fallback the topbar uses.

## 3. Suggested structure (adapt to our folder conventions)

- `lib/weather-scene.ts`: pure, framework-free helpers and types: `TimeOfDay`, `SceneWeather`, `mapCondition(code)`, `getTimeOfDay(localtime, astronomy?)`, `SCENE_EMOJI` tables. Unit test these if we have a test setup.
- `components/weather/weather-scene.tsx`: presentational background layers. Props: `timeOfDay`, `weather`, optional `className`. No data fetching inside.
- `components/weather/sidebar-weather.tsx`: the small info block (emoji, temperature, condition, city), collapse-aware.
- `app-sidebar.tsx`: wire the two pieces in. The data comes from the shared hook.
- Animations (keyframes and `animation-*`) go in the Tailwind config or `@theme`, with names prefixed `weather-` so they cannot collide with existing ones.

## 4. Implementation notes and pitfalls

- **Hydration**: do not use `Math.random()` while rendering rain or stars. It causes SSR mismatches and visual jumps on re-render. Use a small seeded PRNG inside `useMemo`, keyed on weather type only, so particles keep their positions when only the temperature or time changes.
- **Scene sizing**: the prototype animates rain over a fixed pixel distance. In the real sidebar, make the scene wrapper a size container (`[container-type:size]`) and animate with `cqh` and `cqw` units (for example `translateY(110cqh)`), so it works at any sidebar height and in the mobile sheet. Fall back to `vh` if container units are a problem for our browser targets.
- **Dark mode**: design both themes. In dark mode the day and morning skies must not become glaring. Lower their opacity further, or darken the scrim. Check contrast of nav labels, the active item and the info block (target WCAG AA) in light and dark, for all four times of day and all weather states.
- **Performance**: no layout-affecting animation, no `will-change` on more than the particle container, and no timers that re-render React on every frame. The only React state is the derived `timeOfDay` and `weather`, plus a re-check of time of day when the weather data refreshes.
- **Styling**: use our existing tokens and `cn()`. Scene colors (sky gradients) may be literal because they are illustration colors. Everything that holds text uses theme tokens.
- Do not change the topbar's appearance or behavior, and do not edit `components/ui/sidebar.tsx` beyond the smallest supported change, if any.

## 5. Tailwind version notes

- **v3**: add the keyframes and animation entries under `theme.extend` in `tailwind.config`, as in the reference.
- **v4**: put the keyframes in the global CSS and register the animations in `@theme inline`, for example:

```css
@theme inline {
  --animate-weather-fall: weather-fall 0.9s linear infinite;
  --animate-weather-drift: weather-drift 40s linear infinite;
  --animate-weather-twinkle: weather-twinkle 3s ease-in-out infinite;
  --animate-weather-flash: weather-flash 8s linear infinite;
  --animate-weather-float: weather-float 5s ease-in-out infinite;
}
@keyframes weather-fall {
  0% {
    transform: translateY(-10cqh);
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  100% {
    transform: translateY(110cqh);
    opacity: 1;
  }
}
@keyframes weather-drift {
  0% {
    transform: translateX(-30cqw);
  }
  100% {
    transform: translateX(130cqw);
  }
}
@keyframes weather-twinkle {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
}
@keyframes weather-flash {
  0%,
  90%,
  100% {
    opacity: 0;
  }
  92% {
    opacity: 0.45;
  }
  94% {
    opacity: 0.1;
  }
  96% {
    opacity: 0.35;
  }
  98% {
    opacity: 0;
  }
}
@keyframes weather-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
```

## 6. Verification (required before you finish)

1. Add a **temporary, dev-only** override (for example `?weather=storm&tod=night` read in development only, or a small dev panel) so every combination of 4 times of day and 4 weather states can be checked. Remove it before finishing, or make sure it is stripped from production builds.
2. Check these cases visually, using Playwright screenshots if available: expanded, collapsed (icon), and mobile sheet; light and dark; at least `morning/clear`, `day/cloudy`, `evening/rain`, `night/storm`.
3. Check `prefers-reduced-motion` (emulate it) and that the sidebar stays fully usable: hover, focus rings, active state, tooltips in collapsed mode and the `SidebarRail` still work.
4. Run the project's typecheck, lint and build. Fix anything you introduced.
5. Finish with a short summary: files added or changed, any assumption you made (data source, tailwind version, where the info block went), and anything you chose not to do.

---

# Reference code (prototype, do not copy verbatim)

This is the working prototype, with the whole sidebar as the scene. It is brighter and busier than we want. Use it for structure, colors, positions and the animation ideas, then apply the **Minimal intensity** rules above.

## Tailwind v3 config used in the prototype

```html
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        keyframes: {
          fall: {
            "0%": { transform: "translateY(-40px)", opacity: "0" },
            "12%": { opacity: "1" },
            "100%": { transform: "translateY(900px)", opacity: "1" },
          },
          drift: {
            "0%": { transform: "translateX(-140px)" },
            "100%": { transform: "translateX(520px)" },
          },
          twinkle: { "0%,100%": { opacity: ".2" }, "50%": { opacity: "1" } },
          flash: {
            "0%,90%,100%": { opacity: "0" },
            "92%": { opacity: ".9" },
            "94%": { opacity: ".15" },
            "96%": { opacity: ".7" },
            "98%": { opacity: "0" },
          },
          float: {
            "0%,100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-6px)" },
          },
        },
        animation: {
          fall: "fall .8s linear infinite",
          drift: "drift 40s linear infinite",
          twinkle: "twinkle 3s ease-in-out infinite",
          flash: "flash 7s linear infinite",
          float: "float 5s ease-in-out infinite",
        },
      },
    },
  };
</script>
```

## Markup: the scene is a set of absolute layers behind the content

```html
<aside
  id="scene"
  class="scene relative flex min-h-[34rem] flex-col overflow-hidden rounded-2xl
              md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:w-80"
  data-tod="evening"
  data-weather="rain"
>
  <!-- one sky per time of day, cross-faded with opacity -->
  <div class="sky sky-morning absolute inset-0"></div>
  <div class="sky sky-day absolute inset-0"></div>
  <div class="sky sky-evening absolute inset-0"></div>
  <div class="sky sky-night absolute inset-0"></div>

  <div id="stars" class="stars absolute inset-0"></div>
  <!-- ~28 <i> dots, twinkle -->
  <span id="orb" class="orb absolute animate-float">☀️</span>
  <!-- ☀️ or 🌙 -->

  <span
    class="cloud c1 absolute animate-drift"
    style="top:9%;font-size:4.5rem;animation-duration:38s;animation-delay:-9s"
    >☁️</span
  >
  <span
    class="cloud c2 absolute animate-drift"
    style="top:30%;font-size:3.4rem;animation-duration:54s;animation-delay:-31s"
    >☁️</span
  >
  <span
    class="cloud c3 absolute animate-drift"
    style="top:17%;font-size:5.2rem;animation-duration:46s;animation-delay:-20s"
    >☁️</span
  >

  <div class="tint absolute inset-0"></div>
  <!-- dims sky in rain and storm -->
  <div id="rain" class="rain absolute"></div>
  <!-- 34 or 64 <i> streaks -->
  <div class="flash absolute inset-0 animate-flash bg-white"></div>
  <span
    class="bolt absolute animate-flash"
    style="left:56%;top:24%;font-size:3.2rem;line-height:1"
    >⚡</span
  >

  <svg
    class="absolute bottom-0 left-0 w-full"
    viewBox="0 0 320 90"
    preserveAspectRatio="none"
    height="90"
  >
    <path
      class="hill"
      style="opacity:.55"
      d="M0 40 C60 8 110 20 170 42 S270 50 320 22 L320 90 L0 90Z"
    />
    <path
      class="hill"
      d="M0 58 C50 30 92 36 142 54 S242 74 320 44 L320 90 L0 90Z"
    />
  </svg>

  <!-- real sidebar content on top -->
  <div
    class="relative z-10 flex flex-1 flex-col justify-between p-4 pb-24 text-white"
  >
    <nav>...</nav>
    <div>
      <p id="city">Lisbon</p>
      <p id="temp">15°</p>
      <p id="label">Evening · Moderate rain</p>
      <span id="icon" class="animate-float text-5xl">🌧️</span>
      <span id="wind">Wind 19 km/h</span> <span id="hum">Humidity 84%</span>
    </div>
  </div>
</aside>
```

## CSS: JS only sets `data-tod` and `data-weather`; CSS does the rest

```css
.scene {
  isolation: isolate;
  color: #fff;
  --hill: #2f7a4f;
}
.scene[data-tod="morning"] {
  --hill: #3d6b58;
}
.scene[data-tod="evening"] {
  --hill: #2b1b47;
}
.scene[data-tod="night"] {
  --hill: #0a1022;
}

.sky {
  opacity: 0;
  transition: opacity 0.8s;
}
.sky-morning {
  background: linear-gradient(180deg, #78b4e6 0%, #ffcf9a 62%, #ffa86e 100%);
}
.sky-day {
  background: linear-gradient(180deg, #3a8fe0 0%, #8cc7f2 60%, #d3ecff 100%);
}
.sky-evening {
  background: linear-gradient(180deg, #38296e 0%, #c1477b 58%, #ff9a52 100%);
}
.sky-night {
  background: linear-gradient(180deg, #050a1c 0%, #111a3b 60%, #27325f 100%);
}
.scene[data-tod="morning"] .sky-morning,
.scene[data-tod="day"] .sky-day,
.scene[data-tod="evening"] .sky-evening,
.scene[data-tod="night"] .sky-night {
  opacity: 1;
}

/* stars: only at night, hidden in storms, dim in rain */
.stars {
  opacity: 0;
  transition: opacity 0.8s;
}
.stars i {
  position: absolute;
  background: #fff;
  border-radius: 50%;
}
.scene[data-tod="night"] .stars {
  opacity: 1;
}
.scene[data-tod="night"][data-weather="rain"] .stars {
  opacity: 0.3;
}
.scene[data-tod="night"][data-weather="storm"] .stars {
  opacity: 0;
}

/* sun / moon position per time of day; dimmed in rain, hidden in storm */
.orb {
  font-size: 3.4rem;
  line-height: 1;
  transition:
    left 0.8s,
    top 0.8s,
    opacity 0.8s;
}
.scene[data-tod="morning"] .orb {
  left: 14%;
  top: 44%;
}
.scene[data-tod="day"] .orb {
  left: 60%;
  top: 10%;
}
.scene[data-tod="evening"] .orb {
  left: 64%;
  top: 46%;
  filter: saturate(1.3) hue-rotate(-12deg);
}
.scene[data-tod="night"] .orb {
  left: 62%;
  top: 12%;
}
.scene[data-weather="rain"] .orb {
  opacity: 0.35;
}
.scene[data-weather="storm"] .orb {
  opacity: 0;
}

/* clouds: third cloud only when not clear; greyed in bad weather; tinted by time of day */
.cloud {
  left: 0;
  line-height: 1;
  transition:
    opacity 0.6s,
    filter 0.6s;
}
.c3 {
  opacity: 0;
}
.scene:not([data-weather="clear"]) .c3 {
  opacity: 1;
}
.scene[data-tod="evening"] .cloud {
  filter: sepia(0.5) saturate(2.2) hue-rotate(-25deg);
}
.scene[data-tod="night"] .cloud {
  filter: brightness(0.55);
}
.scene:not([data-weather="clear"]) .cloud {
  filter: grayscale(1) brightness(0.72);
}
.scene[data-tod="night"]:not([data-weather="clear"]) .cloud {
  filter: grayscale(1) brightness(0.4);
}

/* weather tint, rain streaks, storm slant and lightning */
.tint {
  background: #1a2332;
  opacity: 0;
  transition: opacity 0.7s;
}
.scene[data-weather="rain"] .tint {
  opacity: 0.42;
}
.scene[data-weather="storm"] .tint {
  opacity: 0.62;
}
.rain {
  inset: -15%;
  transition: transform 0.6s;
}
.rain i {
  position: absolute;
  top: 0;
  width: 1.5px;
  background: linear-gradient(
    to bottom,
    rgba(200, 225, 255, 0),
    rgba(200, 225, 255, 0.9)
  );
}
.scene[data-weather="storm"] .rain {
  transform: rotate(12deg) scale(1.15);
}
.flash,
.bolt {
  display: none;
}
.scene[data-weather="storm"] .flash,
.scene[data-weather="storm"] .bolt {
  display: block;
}

.hill {
  fill: var(--hill);
  transition: fill 0.8s;
}
.scene-text {
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.35);
}

@media (prefers-reduced-motion: reduce) {
  .scene *,
  .scene {
    animation: none !important;
    transition: none !important;
  }
}
```

## JS: mapping, time of day and particles

```js
// WeatherAPI condition codes: https://www.weatherapi.com/docs/weather_conditions.json
const STORM = new Set([1087, 1273, 1276, 1279, 1282]);
const WET = new Set([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189,
                     1192, 1195, 1198, 1201, 1240, 1243, 1246]);
const mapCondition = (code) => STORM.has(code) ? 'storm' : WET.has(code) ? 'rain' : 'clear';

// localtime looks like "2026-11-10 17:46"
function timeOfDay(localtime) {
  const h = Number(localtime.slice(11, 13));
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 19) return 'evening';
  return 'night';
}

const ICONS = {
  clear: { morning: '🌅', day: '☀️', evening: '🌇', night: '🌙' },
  rain:  { morning: '🌧️', day: '🌧️', evening: '🌧️', night: '🌧️' },
  storm: { morning: '⛈️', day: '⛈️', evening: '⛈️', night: '⛈️' }
};

function applyWeather(data) {            // data = WeatherAPI current.json response
  const kind = mapCondition(data.current.condition.code);
  const tod = timeOfDay(data.location.localtime);
  scene.dataset.weather = kind;
  scene.dataset.tod = tod;
  orb.textContent = tod === 'night' ? '🌙' : '☀️';
  icon.textContent = ICONS[kind][tod];
  temp.textContent = Math.round(data.current.temp_c) + '°';
  label.textContent = data.current.condition.text;
  if (/* weather kind changed */) buildRain(kind);
}

// rain: prototype uses 34 streaks (rain) or 64 (storm). The app should use 14 and 24, seeded.
function buildRain(kind) {
  const n = kind === 'storm' ? 64 : kind === 'rain' ? 34 : 0;
  for (let i = 0; i < n; i++) {
    const d = document.createElement('i');
    const len = 10 + Math.random() * (kind === 'storm' ? 18 : 12);
    const dur = kind === 'storm' ? 0.45 + Math.random() * 0.3 : 0.8 + Math.random() * 0.6;
    d.className = 'animate-fall';
    d.style.cssText = `left:${Math.random() * 100}%;height:${len}px;` +
                      `animation-duration:${dur}s;animation-delay:-${Math.random() * 1.5}s`;
    rain.appendChild(d);
  }
}
// stars: 28 <i> dots, random left 0-100%, top 0-52%, size 1-3px, twinkle delay and duration randomised.
```
