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
 * and the two READY circles `bindRoomStep` finds by id.
 */

type Listener = () => void;
// Every global the stubs below replace, put back after each case: `bun test`
// shares one process across files.
const g = globalThis as Record<string, unknown>;
const had = { window: g.window, document: g.document, DeviceMotionEvent: g.DeviceMotionEvent };

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
      for (const fn of on.get(type) ?? []) fn();
    },
    addEventListener: (type: string, fn: Listener): void => {
      on.set(type, [...(on.get(type) ?? []), fn]);
    },
    classList: { toggle: (): void => {} },
    querySelector: (): null => null,
  };
}

/** The room step bound on a page with only its two circles, painted as `player`. */
function roomAs(player: 1 | 2): ReturnType<typeof circle> {
  const circles = { joinReady1: circle(), joinReady2: circle() };
  g.document = { getElementById: (id: string) => circles[id as keyof typeof circles] ?? null };
  const step = bindRoomStep({
    ready: () => {},
    pickSeat: () => {},
    setLevel: () => {},
    level: () => "medium",
  });
  step.paint({ ...SOLO_STATUS, player } as LinkStatus);
  return circles.joinReady1;
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
