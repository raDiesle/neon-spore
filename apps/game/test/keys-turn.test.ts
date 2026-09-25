import { afterEach, describe, expect, it } from "bun:test";
import { type ControlSetId, controlSet, controlTurns, deskKeys } from "@neon-spore/content";
import {
  BEARING_TURN,
  type Command,
  DEFAULT_CONFIG,
  gimbalTurnPerTickMilli,
  NO_BEARING,
  windPerTickMilli,
} from "@neon-spore/sim";
import { desk } from "./desk-keys.js";

/**
 * **The keys that turn something**, typed on for real.
 *
 * A key cannot go round a circle, and each of these controls answers nothing but
 * a bearing (`sim/bearing.ts`) — so what the rig has to get right is a stream:
 * a grab that carries no bearing at all, a bearing a tick after it, and a hand
 * that comes off. Every one of those three has a way of being silently wrong
 * that reads perfectly in the source. A grab that reported a bearing turns the
 * thing by however far round the finger "landed"; a tick that ran with no key
 * down turns it forever; a release never sent leaves a thumb on the ring with
 * nobody's hand on it.
 *
 * The rate is asserted against the simulation's own function rather than a
 * number typed here, which is the same bargain the rigs themselves make
 * (`packages/sim/test/copies-table.ts` has the row).
 */

const CFG = DEFAULT_CONFIG;

const real = (globalThis as { window?: unknown }).window;
afterEach(() => {
  (globalThis as { window?: unknown }).window = real;
});

/** Every bearing sent at one target, in order, grabs and releases included. */
function bearings(sent: { command: Command }[], target: string): number[] {
  return sent
    .filter((c) => c.command.kind === "drag" && c.command.target === target)
    .map((c) => (c.command as { fromMilli: number }).fromMilli);
}

/** And whether the hand is reported on or off, in the same order. */
function holds(sent: { command: Command }[], target: string): boolean[] {
  return sent
    .filter((c) => c.command.kind === "drag" && c.command.target === target)
    .map((c) => (c.command as { on: boolean }).on);
}

describe("THE GIMBAL's outer ring, turned at a desk", () => {
  it("grabs with no bearing, then one bearing a tick, at the rules' rate", () => {
    const d = desk(false);
    const step = gimbalTurnPerTickMilli(CFG);
    d.down("KeyT");
    d.tick();
    d.tick();
    d.tick();
    // The grab first and it says NO_BEARING: the reference is the last bearing
    // *this* hand gave, and a grab claiming to be at the bottom of the circle
    // would turn the ring by up to half a lap no finger ever made
    // (`sim/bearing.ts`).
    expect(bearings(d.sent, "gimbalOuter")).toEqual([NO_BEARING, 0, step, step * 2]);
    expect(holds(d.sent, "gimbalOuter")).toEqual([true, true, true, true]);
  });

  it("turns the other way with a shift held, and never into a negative bearing", () => {
    const d = desk(false);
    const step = gimbalTurnPerTickMilli(CFG);
    d.down("KeyT", true);
    d.tick();
    d.tick();
    // A bearing is where on the circle the hand *is*, so an anticlockwise one
    // counts down through the modulus rather than below nought — the step
    // between two of them is what the simulation reads.
    expect(bearings(d.sent, "gimbalOuter")).toEqual([NO_BEARING, 0, BEARING_TURN - step]);
  });

  it("lets go, and says nothing more until it is pressed again", () => {
    const d = desk(false);
    d.down("KeyT");
    d.tick();
    d.up("KeyT");
    const after = d.sent.length;
    d.tick();
    d.tick();
    expect(holds(d.sent, "gimbalOuter").at(-1)).toBe(false);
    expect(bearings(d.sent, "gimbalOuter").at(-1)).toBe(NO_BEARING);
    expect(d.sent.length).toBe(after);
  });

  it("sends nothing before it is pressed at all", () => {
    const d = desk(false);
    d.tick();
    d.tick();
    expect(bearings(d.sent, "gimbalOuter")).toEqual([]);
  });

  it("is the pilot's, on every panel, because no panel carries it", () => {
    // The ring is a handle on the field, so it has no slot on any panel and a
    // `drag` is one of the kinds no panel may refuse
    // (`content/src/control-sets-keys.ts`). On a field with no gimbal the
    // simulation does nothing with one, which is THE CHOIR's shake's bargain.
    for (const panel of ["default", "claw"] as const) {
      const d = desk(false, panel);
      d.down("KeyT");
      d.tick();
      const ring = d.sent.filter(
        (c) => c.command.kind === "drag" && c.command.target === "gimbalOuter",
      );
      expect(ring.length).toBe(2);
      expect(ring.every((c) => c.player === 1)).toBe(true);
    }
  });
});

describe("THE CLAW's crank, in the same rig", () => {
  /** The crank's key on a panel, which is the panel's answer rather than this
   * file's: a key belongs to a slot (`content/src/keys-desk.ts`). */
  const crankKey = (panel: ControlSetId): string | undefined =>
    deskKeys(controlSet(panel)).find((k) => controlTurns(k.control))?.code;

  it("still turns at the arm's own return speed, on the panel that has one", () => {
    const key = crankKey("claw");
    expect(key).toBeDefined();
    const d = desk(false, "claw");
    d.down(key as string);
    d.tick();
    d.tick();
    expect(bearings(d.sent, "crank")).toEqual([NO_BEARING, 0, windPerTickMilli(CFG)]);
  });

  it("is not answered on a panel with no crank on it", () => {
    // The two rigs are one binding now, and this is the half that would break
    // if either forgot the other: the standard panel has no crank, so none of
    // its keys may send a bearing at one.
    expect(crankKey("default")).toBeUndefined();
    const d = desk(false);
    for (const code of ["KeyA", "KeyD", "KeyI", "KeyS", "KeyQ", "KeyE"]) d.down(code);
    d.tick();
    expect(bearings(d.sent, "crank")).toEqual([]);
  });
});
