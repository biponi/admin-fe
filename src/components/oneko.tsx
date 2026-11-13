import { useEffect } from "react";
import { toast as sonnerToast } from "sonner";
import hotToast from "react-hot-toast";
import onekoSprite from "../assets/oneko.gif";
import tuxedoSprite from "../assets/oneko-tuxedo.png";
import bunnySprite from "../assets/oneko-bunny.png";
import foxSprite from "../assets/oneko-fox.png";

/**
 * Oneko — the classic cursor-chasing cat (sprite port of
 * https://github.com/adryd325/oneko.js, MIT).
 *
 * Rendered as `null`; when `active` it appends a fixed-position critter to
 * document.body that chases the mouse, idles / sleeps / scratches when the
 * cursor stops. With `friend` on, a second critter (a different skin) joins
 * the chase. Toggling `active` off removes them and stops the loop.
 *
 * Sprite sheet sources (all 256x128, 8x4 grid of 32px frames):
 *  - oneko.gif       — adryd325/oneko.js (MIT)
 *  - oneko-tuxedo    — 0xdhrv/oneko shadcn registry component (MIT)
 *  - oneko-bunny/fox — onekocord/onekocord community skins
 */

const SIZE = 32; // sprite frame size

// ─── Critter varieties ───────────────────────────────────────────────────────
// Each entry is either a distinct sprite sheet or a CSS filter recolor of the
// base white-cat sheet (filters behave predictably on pixel art). The same
// definitions drive the roaming critters, the top-bar button face, and the
// settings-panel previews.

export interface OnekoCritter {
  value: string;
  label: string;
  sprite: string;
  filter?: string;
}

const BASE_SHEET = onekoSprite;

export const ONEKO_CRITTERS: OnekoCritter[] = [
  { value: "classic", label: "Classic", sprite: BASE_SHEET },
  { value: "tuxedo", label: "Tuxedo", sprite: tuxedoSprite },
  { value: "bunny", label: "Bunny", sprite: bunnySprite },
  { value: "fox", label: "Fox", sprite: foxSprite },
  { value: "shadow", label: "Shadow", sprite: BASE_SHEET, filter: "brightness(0.15)" },
  { value: "smokey", label: "Smokey", sprite: BASE_SHEET, filter: "grayscale(1) brightness(0.55)" },
  {
    value: "marmalade",
    label: "Marmalade",
    sprite: BASE_SHEET,
    filter: "sepia(1) saturate(2.4) hue-rotate(-15deg) brightness(0.95)",
  },
  {
    value: "sakura",
    label: "Sakura",
    sprite: BASE_SHEET,
    filter: "sepia(1) saturate(2.2) hue-rotate(-55deg) brightness(1.05)",
  },
  {
    value: "neon",
    label: "Neon",
    sprite: BASE_SHEET,
    filter: "sepia(1) saturate(8) hue-rotate(115deg) drop-shadow(0 0 3px #22ff55)",
  },
  { value: "ghost", label: "Ghost", sprite: BASE_SHEET, filter: "brightness(1.2) opacity(0.55)" },
];

export const getOnekoCritter = (value: string): OnekoCritter =>
  ONEKO_CRITTERS.find((c) => c.value === value) ?? ONEKO_CRITTERS[0];

// The friend always brings a different skin than the main critter
export const getFriendFor = (catValue: string): string =>
  catValue === "bunny" ? "fox" : "bunny";

// ─── Speed presets (px moved per 100ms tick) ─────────────────────────────────

export interface OnekoSpeed {
  value: "slow" | "normal" | "fast";
  label: string;
  speed: number;
  description: string;
}

export const ONEKO_SPEEDS: OnekoSpeed[] = [
  {
    value: "slow",
    label: "Chill",
    speed: 6,
    description: "Casual stroll · takes her time",
  },
  {
    value: "normal",
    label: "Normal",
    speed: 10,
    description: "The classic pace · as nature intended",
  },
  {
    value: "fast",
    label: "Zoomies",
    speed: 18,
    description: "3 A.M. energy · good luck catching her",
  },
];

export const getOnekoSpeed = (
  value: string,
): OnekoSpeed => (ONEKO_SPEEDS.find((s) => s.value === value) ?? ONEKO_SPEEDS[1]);

const spriteSets: Record<string, [number, number][]> = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [
    [-5, 0],
    [-6, 0],
    [-7, 0],
  ],
  scratchWallN: [
    [0, 0],
    [0, -1],
  ],
  scratchWallS: [
    [-7, -1],
    [-6, -2],
  ],
  scratchWallE: [
    [-2, -2],
    [-2, -3],
  ],
  scratchWallW: [
    [-4, 0],
    [-4, -1],
  ],
  tired: [[-3, -2]],
  sleeping: [
    [-2, 0],
    [-2, -1],
  ],
  N: [
    [-1, -2],
    [-1, -3],
  ],
  NE: [
    [0, -2],
    [0, -3],
  ],
  E: [
    [-3, 0],
    [-3, -1],
  ],
  SE: [
    [-5, -1],
    [-5, -2],
  ],
  S: [
    [-6, -3],
    [-7, -2],
  ],
  SW: [
    [-5, -3],
    [-6, -1],
  ],
  W: [
    [-4, -2],
    [-4, -3],
  ],
  NW: [
    [-1, 0],
    [-1, -1],
  ],
};

// ─── Alert speech bubble ─────────────────────────────────────────────────────

const ALERT_MESSAGES = [
  "{name} noticed you! 🐾",
  "{name} is on high alert… 👀",
  "Mew! {name} spotted the cursor",
  "{name} perks up — something moved",
  "Careful, {name} is watching you",
];

const pickAlertMessage = (name: string) =>
  ALERT_MESSAGES[Math.floor(Math.random() * ALERT_MESSAGES.length)].replace(
    "{name}",
    name,
  );

// ─── App event mirroring ─────────────────────────────────────────────────────
// While the critters are out, app toasts (order created, action updates, …)
// are mirrored onto the main critter's speech bubble. Both toast libs the app
// uses expose their methods as properties of the exported `toast` object, so
// a temporary method patch catches every `toast.success("Order created")` /
// `toast.error(...)` call site without touching them.

const TOAST_METHOD_KEYS = [
  "success",
  "error",
  "message",
  "loading",
  "info",
  "warning",
];

function interceptToasts(show: (msg: string) => void): () => void {
  const restores: (() => void)[] = [];

  [sonnerToast as unknown as Record<string, unknown>, hotToast as unknown as Record<string, unknown>].forEach(
    (lib) => {
      TOAST_METHOD_KEYS.forEach((key) => {
        const original = lib[key];
        if (typeof original !== "function") return;
        const patched = (...args: unknown[]) => {
          const first = args[0];
          if (typeof first === "string" && first.trim()) {
            show(first.trim());
          }
          return (original as (...a: unknown[]) => unknown).apply(lib, args);
        };
        lib[key] = patched;
        restores.push(() => {
          lib[key] = original;
        });
      });
    },
  );

  return () => restores.forEach((restore) => restore());
}

interface OnekoState {
  nekoPosX: number;
  nekoPosY: number;
  mousePosX: number;
  mousePosY: number;
  frameCount: number;
  idleTime: number;
  idleAnimation: string | null;
  idleAnimationFrame: number;
}

interface SpawnedCritter {
  cleanup: () => void;
  /** Show an arbitrary message in this critter's speech bubble. */
  showToast: (msg: string) => void;
}

// Spawn one critter and run its chase loop. Returns its cleanup plus a handle
// for speaking on its behalf.
function spawnCritter(
  critter: OnekoCritter,
  index: number,
  nekoSpeed: number,
): SpawnedCritter {
  const el = document.createElement("div");
  el.id = index === 0 ? "oneko" : `oneko-friend`;
  el.setAttribute("aria-hidden", "true");
  el.style.width = `${SIZE}px`;
  el.style.height = `${SIZE}px`;
  el.style.position = "fixed";
  el.style.pointerEvents = "none";
  el.style.imageRendering = "pixelated";
  el.style.zIndex = "2147483647";
  el.style.backgroundImage = `url(${critter.sprite})`;
  el.style.filter = critter.filter ?? "none";

  // Start near the top bar so the critter appears to hop out of it —
  // the friend enters from the other side of the screen
  const state: OnekoState = {
    nekoPosX: index === 0 ? window.innerWidth - 120 : 120,
    nekoPosY: 64,
    mousePosX: window.innerWidth / 2,
    mousePosY: window.innerHeight / 2,
    frameCount: 0,
    idleTime: 0,
    idleAnimation: null,
    idleAnimationFrame: 0,
  };

  const setSprite = (name: string, frame: number) => {
    const frames = spriteSets[name];
    const sprite = frames[frame % frames.length];
    el.style.backgroundPosition = `${sprite[0] * SIZE}px ${sprite[1] * SIZE}px`;
  };

  // Speech bubble shown above the critter when it snaps out of a long idle
  let bubbleTimeout: number | undefined;
  const bubble = document.createElement("div");
  bubble.style.cssText =
    "display:none; position:fixed; transform:translate(-50%,-100%);" +
    "padding:4px 9px; background:#fffdf5; color:#141413; border:2px solid #141413;" +
    "border-radius:8px; font:bold 11px/1.4 ui-sans-serif, system-ui, sans-serif;" +
    "max-width:240px; white-space:normal; text-align:center; pointer-events:none;" +
    "z-index:2147483647; box-shadow:2px 2px 0 rgba(0,0,0,0.25);";

  const hideBubble = () => {
    window.clearTimeout(bubbleTimeout);
    bubble.style.display = "none";
  };

  // Keep the bubble anchored above the critter while it walks
  const positionBubble = () => {
    if (bubble.style.display === "none") return;
    const left = Math.min(
      Math.max(state.nekoPosX, 90),
      window.innerWidth - 90,
    );
    bubble.style.left = `${left}px`;
    bubble.style.top = `${state.nekoPosY - SIZE - 6}px`;
  };

  const showBubble = (message: string, duration = 2500) => {
    bubble.textContent = message;
    positionBubble();
    bubble.style.display = "block";
    window.clearTimeout(bubbleTimeout);
    bubbleTimeout = window.setTimeout(hideBubble, duration);
  };

  // Cute line when the critter wakes up and notices you
  const showAlertBubble = () => showBubble(pickAlertMessage(critter.label));

  // App events (order created, action updates, …) get a slightly longer dwell
  const showToast = (msg: string) =>
    showBubble(msg, Math.min(2000 + msg.length * 40, 5000));

  const resetIdleAnimation = () => {
    state.idleAnimation = null;
    state.idleAnimationFrame = 0;
  };

  const idle = () => {
    state.idleTime += 1;

    // every ~ 20 seconds
    if (
      state.idleTime > 10 &&
      Math.floor(Math.random() * 200) === 0 &&
      state.idleAnimation == null
    ) {
      const availableIdleAnimations = ["sleeping", "scratchSelf"];
      if (state.nekoPosX < 32) {
        availableIdleAnimations.push("scratchWallW");
      }
      if (state.nekoPosY < 32) {
        availableIdleAnimations.push("scratchWallN");
      }
      if (state.nekoPosX > window.innerWidth - 32) {
        availableIdleAnimations.push("scratchWallE");
      }
      if (state.nekoPosY > window.innerHeight - 32) {
        availableIdleAnimations.push("scratchWallS");
      }
      state.idleAnimation =
        availableIdleAnimations[
          Math.floor(Math.random() * availableIdleAnimations.length)
        ];
    }

    switch (state.idleAnimation) {
      case "sleeping":
        if (state.idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(state.idleAnimationFrame / 4));
        if (state.idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(state.idleAnimation, state.idleAnimationFrame);
        if (state.idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    state.idleAnimationFrame += 1;
  };

  const frame = () => {
    state.frameCount += 1;
    const diffX = state.nekoPosX - state.mousePosX;
    const diffY = state.nekoPosY - state.mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      idle();
      return;
    }

    state.idleAnimation = null;
    state.idleAnimationFrame = 0;

    if (state.idleTime > 1) {
      // first tick of the alert episode — the critter just noticed movement.
      // Only speak up after a real nap (2s+ idle), not every mouse pause.
      if (state.idleTime > 20) {
        showAlertBubble();
      }
      setSprite("alert", 0);
      // count down after being alerted before moving
      state.idleTime = Math.min(state.idleTime, 7);
      state.idleTime -= 1;
      return;
    }

    let direction = "";
    direction += diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, state.frameCount);

    state.nekoPosX -= (diffX / distance) * nekoSpeed;
    state.nekoPosY -= (diffY / distance) * nekoSpeed;

    state.nekoPosX = Math.min(
      Math.max(16, state.nekoPosX),
      window.innerWidth - 16,
    );
    state.nekoPosY = Math.min(
      Math.max(16, state.nekoPosY),
      window.innerHeight - 16,
    );

    el.style.left = `${state.nekoPosX - SIZE / 2}px`;
    el.style.top = `${state.nekoPosY - SIZE / 2}px`;

    // bubble rides along until its own timer expires
    positionBubble();
  };

  setSprite("idle", 0);
  el.style.left = `${state.nekoPosX - SIZE / 2}px`;
  el.style.top = `${state.nekoPosY - SIZE / 2}px`;
  document.body.appendChild(el);
  document.body.appendChild(bubble);

  const onMouseMove = (event: MouseEvent) => {
    state.mousePosX = event.clientX;
    state.mousePosY = event.clientY;
  };
  document.addEventListener("mousemove", onMouseMove);

  const interval = setInterval(frame, 100);

  const cleanup = () => {
    clearInterval(interval);
    document.removeEventListener("mousemove", onMouseMove);
    el.remove();
    bubble.remove();
    window.clearTimeout(bubbleTimeout);
  };

  return { cleanup, showToast };
}

export function Oneko({
  active,
  cat = "classic",
  speed = "normal",
  friend = false,
}: {
  active: boolean;
  cat?: string;
  speed?: string;
  friend?: boolean;
}) {
  useEffect(() => {
    if (!active) return;

    const nekoSpeed = getOnekoSpeed(speed).speed;
    const friendValue = friend ? getFriendFor(cat) : null;
    const critterValues = friendValue ? [cat, friendValue] : [cat];

    const spawned = critterValues.map((value, index) =>
      spawnCritter(getOnekoCritter(value), index, nekoSpeed),
    );

    // App toasts (order created, action updates, …) are announced by the
    // main critter while it's out and about
    const unpatchToasts = interceptToasts(spawned[0].showToast);

    return () => {
      unpatchToasts();
      spawned.forEach((critter) => critter.cleanup());
    };
  }, [active, cat, speed, friend]);

  return null;
}

export default Oneko;
