import { describe, expect, it } from "bun:test";
import type { LatchGrip, TimedCommand } from "../src/index.js";
import { latchBowPoint, latchBowShare } from "../src/latch-bow.js";
import { PULL_STRAY_MILLI } from "../src/pull-path.js";
import {
  CFG,
  hashWorld,
  hold,
  install,
  latch,
  lift,
  playerOn,
  REACH,
  tick,
  toLevel,
} from "./latch-rig.js";

/**
 * **THE LATCH's grips bow** (`latch-bow.ts`): each stroke is a half-wave out
 * away from the tendril, the depth is still the straight distance down that
 * hauls it, and a thumb a tile across from the bow drops the grip until it
 * lifts.
 */

/** `player`'s thumb on `grip`, `x` across and `y` down from where it took hold. */
function at(player: 1 | 2, grip: LatchGrip, x: number, y: number): TimedCommand {
  const c = hold(player, grip, 0);
  if (c.command.kind !== "drag") throw new Error("not a drag");
  return { ...c, command: { ...c.command, fromMilli: x, fromYMilli: y } };
}

describe("the bow", () => {
  it("splays the two grips off the tendril, widest halfway, and comes back under the rest", () => {
    expect(latchBowPoint(CFG, 0, REACH / 2).x).toBe(-CFG.latchBowMilli);
    expect(latchBowPoint(CFG, 1, REACH / 2).x).toBe(CFG.latchBowMilli);
    expect(latchBowPoint(CFG, 1, REACH)).toEqual({ x: 0, y: REACH });
    expect(CFG.latchBowMilli).toBeGreaterThan(PULL_STRAY_MILLI);
  });

  it("fills its channel by the bow's own length", () => {
    expect(latchBowShare(CFG, 0, 0)).toBe(0);
    expect(latchBowShare(CFG, 0, REACH)).toBeCloseTo(1, 2);
  });
});

describe("a thumb on a grip", () => {
  it("down its bow hauls the tendril by its depth, as before", () => {
    const world = install();
    toLevel(world);
    const s = latch(world);
    const holder: LatchGrip = s.turn === 0 ? 1 : 0;
    tick(world, [hold(playerOn(world, holder), holder)]);
    tick(world, [hold(playerOn(world, s.turn), s.turn)]);
    const before = s.hauledMilli;
    tick(world, [hold(playerOn(world, s.turn), s.turn, 1000)]);
    expect(s.hauledMilli - before).toBe(1000);
  });

  it("straight down instead strays: said, let go without a short pull, and deaf until it lifts", () => {
    const world = install();
    toLevel(world);
    const s = latch(world);
    const puller = s.turn;
    const holder: LatchGrip = puller === 0 ? 1 : 0;
    const p = playerOn(world, puller);
    tick(world, [hold(playerOn(world, holder), holder)]);
    tick(world, [hold(p, puller)]);
    const said = tick(world, [at(p, puller, 0, REACH / 2)]);
    expect(said).toContain("pullStray");
    expect(said).not.toContain("pullShort");
    expect(s.down[puller]).toBe(false);
    // Back on the bow without lifting takes nothing; a lift and a press does.
    tick(world, [hold(p, puller, 200)]);
    expect(s.down[puller]).toBe(false);
    tick(world, [lift(p, puller)]);
    tick(world, [hold(p, puller)]);
    expect(s.down[puller]).toBe(true);
  });

  it("goes into the fingerprint when it has strayed", () => {
    const a = install();
    const b = install();
    for (const w of [a, b]) {
      toLevel(w);
      tick(w, [hold(1, 0)]);
    }
    tick(a, [at(1, 0, 0, REACH / 2)]);
    tick(b, [lift(1, 0)]);
    expect(latch(a).down).toEqual(latch(b).down);
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
