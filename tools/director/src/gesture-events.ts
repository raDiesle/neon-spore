/**
 * The raw events a phone browser hands a page — the vocabulary every card on
 * CONTROLS › GESTURES draws its timeline in. `used` names the file that
 * listens, and `test/gestures.test.ts` checks that it does; an event with no
 * `used` is one the game has never listened to. The platform column is §4.1
 * of `docs/spec/transfers-touch.md`, as of September 2026.
 */

export type EventFamily = "pointer" | "touch" | "safari" | "sensor" | "page";

export interface BrowserEvent {
  name: string;
  family: EventFamily;
  fires: string;
  iphone: string;
  android: string;
  /** The file in the tree that listens for it, when one does. */
  used?: string;
}

export const FAMILY_TITLES: Record<EventFamily, string> = {
  pointer: "POINTER — one per finger, the game's only touch input",
  touch: "TOUCH — the older list of fingers, never listened to",
  safari: "SAFARI GESTURE — two-finger scale and rotate, WebKit only",
  sensor: "SENSORS — the phone itself moving",
  page: "PAGE — what the browser does round the game",
};

export const BROWSER_EVENTS: readonly BrowserEvent[] = [
  {
    name: "pointerdown",
    family: "pointer",
    fires: "a finger lands",
    iphone: "yes",
    android: "yes",
    used: "apps/game/src/input.ts",
  },
  {
    name: "pointermove",
    family: "pointer",
    fires: "a finger moves — about one per frame",
    iphone: "yes",
    android: "yes",
    used: "apps/game/src/input.ts",
  },
  {
    name: "coalesced",
    family: "pointer",
    fires: "not an event: getCoalescedEvents(), the samples between two moves",
    iphone: "Safari 18.2+",
    android: "yes",
    used: "apps/game/src/coalesced.ts",
  },
  {
    name: "pointerup",
    family: "pointer",
    fires: "a finger lifts",
    iphone: "yes",
    android: "yes",
    used: "apps/game/src/input.ts",
  },
  {
    name: "pointercancel",
    family: "pointer",
    fires: "the OS took the touch — an edge swipe, a callout, a call",
    iphone: "yes",
    android: "yes",
    used: "apps/game/src/input.ts",
  },
  {
    name: "pointerleave",
    family: "pointer",
    fires: "a finger slides off the element",
    iphone: "yes",
    android: "yes",
    used: "apps/game/src/input.ts",
  },
  {
    name: "touchstart",
    family: "touch",
    fires: "a finger lands; carries every finger on the glass",
    iphone: "yes",
    android: "yes",
  },
  {
    name: "touchmove",
    family: "touch",
    fires: "a finger moves; carries force and contact radius",
    iphone: "force is 0",
    android: "uneven",
  },
  { name: "touchend", family: "touch", fires: "a finger lifts", iphone: "yes", android: "yes" },
  {
    name: "gesturechange",
    family: "safari",
    fires: "two fingers pinch or twist: scale and rotation",
    iphone: "yes",
    android: "no",
  },
  {
    name: "devicemotion",
    family: "sensor",
    fires: "acceleration, ~60 a second",
    iphone: "after a permission asked from a tap",
    android: "yes",
    used: "apps/game/src/shake.ts",
  },
  {
    name: "deviceorientation",
    family: "sensor",
    fires: "tilt: alpha, beta, gamma in degrees",
    iphone: "same permission",
    android: "yes",
  },
  {
    name: "orientationchange",
    family: "sensor",
    fires: "portrait became landscape, or back",
    iphone: "yes",
    android: "yes",
    used: "apps/game/src/viewport.ts",
  },
  {
    name: "contextmenu",
    family: "page",
    fires: "a long press asks for the browser's menu",
    iphone: "no — a callout instead",
    android: "yes",
    used: "apps/game/src/input.ts",
  },
  {
    name: "selectstart",
    family: "page",
    fires: "a long press starts selecting text",
    iphone: "yes",
    android: "yes",
  },
  {
    name: "visibilitychange",
    family: "page",
    fires: "the tab is hidden or shown — a call, the home screen",
    iphone: "yes",
    android: "yes",
    used: "apps/game/src/hidden-hold.ts",
  },
  {
    name: "blur",
    family: "page",
    fires: "the window loses focus; every hold is let go",
    iphone: "yes",
    android: "yes",
    used: "apps/game/src/input.ts",
  },
  {
    name: "keydown",
    family: "page",
    fires: "a key — the desk only, never a phone",
    iphone: "with a keyboard",
    android: "with a keyboard",
    used: "apps/game/src/field-input.ts",
  },
];
