import { afterEach, describe, expect, it } from "bun:test";
import { type LinkStatus, SOLO_STATUS } from "@neon-spore/net";
import { InputBuffer } from "../src/input-buffer.js";
import { bindRoomStep } from "../src/join-room-step.js";
import { askForMotion, bindShake } from "../src/shake.js";

/**
 * **iOS's motion permission, asked from the READY press and never at load.**
 * iOS 13 and later deliver no `devicemotion` until
 * `DeviceMotionEvent.requestPermission()` has been called from a gesture, and
 * nothing in the app called it, so on an iPhone THE CHOIR could only be played
 * with the arrows (`shake.ts`). The page here is three stubs: a
 * `DeviceMotionEvent` that counts the asks, a `window` that takes listeners,
 * and the two READY circles `bindRoomStep` finds by id. The screen rides on
 * the same lift, for the same reason: a touch's `pointerdown` carries no
 * activation, so a `requestFullscreen` made there is refused (`fullscreen.ts`).
 */

type Listener = (e?: { preventDefault: () => void }) => void;
// Every global the stubs below replace, put back after each case: `bun test`
// shares one process across files.
const g = globalThis as Record<string, unknown>;
const had = {
  window: g.window,
  document: g.document,
  DeviceMotionEvent: g.DeviceMotionEvent,
  requestAnimationFrame: g.requestAnimationFrame,
};

afterEach(() => {
  for (const [k, v] of Object.entries(had)) g[k] = v;
});

/** A `DeviceMotionEvent` that answers as `answer` does, and counts. */
function motion(answer: () => Promise<string>): { asks: number } {
  const seen = { asks: 0 };
  g.DeviceMotionEvent = {
    requestPermission: () => {
      seen.asks++;
      return answer();
    },
  };
  g.window = { DeviceMotionEvent: g.DeviceMotionEvent, addEventListener: () => {} };
  return seen;
}

/** A READY circle: the listeners it was given, and nothing drawn in it. */
function circle() {
  const on = new Map<string, Listener[]>();
  return {
    fire: (type: string): void => {
      for (const fn of on.get(type) ?? []) fn({ preventDefault: () => {} });
    },
    addEventListener: (type: string, fn: Listener): void => {
      on.set(type, [...(on.get(type) ?? []), fn]);
    },
    classList: { toggle: (): void => {} },
    querySelector: (): null => null,
  };
}

/** How many times the page's root was asked for the screen, since the last `roomAs`. */
const screen = { asks: 0 };

/**
 * The room step bound on a page with only its two circles, painted as
 * `player` — alone, or `ready` with a partner, when the own circle can be
 * held — and that seat's circle handed back.
 */
function roomAs(player: 1 | 2, paired = false): ReturnType<typeof circle> {
  const circles = { joinReady1: circle(), joinReady2: circle() };
  screen.asks = 0;
  g.document = {
    getElementById: (id: string) => circles[id as keyof typeof circles] ?? null,
    fullscreenElement: null,
    documentElement: {
      requestFullscreen: () => {
        screen.asks++;
        return Promise.reject(new Error("not in a test"));
      },
    },
  };
  g.requestAnimationFrame = () => 0;
  const step = bindRoomStep({
    ready: () => {},
    pickSeat: () => {},
    setLevel: () => {},
    level: () => "medium",
  });
  const room = paired ? { state: "ready", peers: 2 } : {};
  step.paint({ ...SOLO_STATUS, player, ...room } as LinkStatus);
  return player === 1 ? circles.joinReady1 : circles.joinReady2;
}

describe("the motion permission", () => {
  it("is not asked for when the game binds the shake at load", () => {
    const seen = motion(async () => "granted");
    bindShake(new InputBuffer());
    expect(seen.asks).toBe(0);
  });

  it("is not asked for when the room step is bound, and is when the pilot's thumb lifts", () => {
    const seen = motion(async () => "granted");
    const ready = roomAs(1);
    expect(seen.asks).toBe(0);
    ready.fire("pointerdown");
    expect(seen.asks).toBe(0);
    ready.fire("pointerup");
    expect(seen.asks).toBe(1);
  });

  it("is never asked for on the gunner's phone, which has no shake to send", () => {
    const seen = motion(async () => "granted");
    roomAs(2).fire("pointerup");
    expect(seen.asks).toBe(0);
  });

  it("says nothing when it is refused, either way a refusal arrives", async () => {
    motion(() => Promise.reject(new Error("denied")));
    expect(() => askForMotion()).not.toThrow();
    motion(() => {
      throw new Error("not a gesture");
    });
    expect(() => askForMotion()).not.toThrow();
    await Promise.resolve();
  });

  it("does nothing on a browser that never asks", () => {
    g.DeviceMotionEvent = function DeviceMotionEvent() {};
    expect(() => askForMotion()).not.toThrow();
    g.DeviceMotionEvent = undefined;
    expect(() => askForMotion()).not.toThrow();
  });
});

describe("the screen", () => {
  it("is asked for as the thumb lifts off the own circle, never as it goes down", () => {
    motion(async () => "granted");
    const ready = roomAs(2, true);
    ready.fire("pointerdown");
    expect(screen.asks).toBe(0);
    ready.fire("pointerup");
    expect(screen.asks).toBe(1);
  });

  it("is not asked for by a lift that no holdable press went down before", () => {
    motion(async () => "granted");
    const alone = roomAs(2);
    alone.fire("pointerdown");
    alone.fire("pointerup");
    expect(screen.asks).toBe(0);
  });
});
