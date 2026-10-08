import { describe, expect, it } from "bun:test";
import { fire } from "../src/bullets.js";
import { trapezeHeading, trapezeInward, trapezeLocked, trapezeSeat } from "../src/trapeze.js";
import { trapezeAim, trapezeAlong, trapezeStruck } from "../src/trapeze-shot.js";
import { MILLI } from "../src/world.js";
import { bolt, CFG, install, runUntil, tapAlien, toLevel, trapeze } from "./trapeze-rig.js";

/**
 * THE TRAPEZE's shots (§39): from below a bolt pushes the swing when it comes
 * back toward the middle and slows it going out; from the side, steered by
 * the pilot's lock, it pushes the alien away from the cannon.
 */

const SHOOT = [{ ask: "shoot", gongSide: 1, gongMilli: 16000, beats: 48 }] as const;
const LOCK = [{ ask: "lock", gongSide: -1, gongMilli: 18000, beats: 48 }] as const;

describe("a bolt from below", () => {
  it("meets the alien where it sits, and only in a shooting level", () => {
    const world = install(SHOOT);
    const s = trapeze(world);
    const seat = trapezeSeat(CFG, s);
    const col = Math.round(seat.xMilli / MILLI);
    expect(trapezeAlong(world, bolt(col), seat.yMilli + 900, seat.yMilli + 500)).toBe(-1);
    toLevel(world);
    const now = trapezeSeat(CFG, trapeze(world));
    const at = Math.round(now.xMilli / MILLI);
    const drift = now.xMilli - at * MILLI;
    const met = trapezeAlong(world, bolt(at, 0, drift), now.yMilli + 700, now.yMilli + 500);
    expect(met).toBeGreaterThan(-1);
    expect(trapezeAlong(world, bolt(at + 3), now.yMilli + 700, now.yMilli + 500)).toBe(-1);
  });

  it("pushes the swing while it comes back, and slows it going out", () => {
    const world = install(SHOOT);
    toLevel(world);
    runUntil(world, (w) => trapezeInward(w.cfg, trapeze(w)));
    const before = trapeze(world).ampMilli;
    trapezeStruck(world, bolt(5));
    expect(trapeze(world).ampMilli).toBe(before + CFG.trapezePushMilli);
    runUntil(world, (w) => !trapezeInward(w.cfg, trapeze(w)));
    const high = trapeze(world).ampMilli;
    trapezeStruck(world, bolt(5));
    expect(trapeze(world).ampMilli).toBe(high - CFG.trapezeBrakeMilli);
  });
});

describe("the lock", () => {
  it("is the pilot's tap on the alien, never the navigator's", () => {
    const world = install(LOCK);
    toLevel(world);
    tapAlien(world, 2);
    expect(trapezeLocked(trapeze(world))).toBe(false);
    expect(tapAlien(world, 1)).toContain("trapezeLock");
    expect(trapezeLocked(trapeze(world))).toBe(true);
    expect(trapezeAim(world)).not.toBeNull();
  });

  it("runs out on its own", () => {
    const world = install(LOCK);
    toLevel(world);
    tapAlien(world, 1);
    const seen = runUntil(world, (w) => !trapezeLocked(trapeze(w)), CFG.trapezeLockBeats + 2);
    expect(seen.has("trapezeUnlock")).toBe(true);
  });

  it("lets only a bolt from the side meet the alien", () => {
    const world = install(LOCK);
    toLevel(world);
    const seat = trapezeSeat(CFG, trapeze(world));
    const at = Math.round(seat.xMilli / MILLI);
    const drift = seat.xMilli - at * MILLI;
    expect(trapezeAlong(world, bolt(at, 0, drift), seat.yMilli, seat.yMilli)).toBe(-1);
    expect(trapezeAlong(world, bolt(at, 160, drift), seat.yMilli, seat.yMilli)).toBe(seat.yMilli);
  });

  it("pushes the alien away from the cannon: higher with its swing, slower against it", () => {
    const world = install(LOCK);
    toLevel(world);
    const way = trapezeHeading(CFG, trapeze(world));
    const before = trapeze(world).ampMilli;
    trapezeStruck(world, bolt(5, 160 * way));
    expect(trapeze(world).ampMilli).toBe(before + CFG.trapezePushMilli);
    trapezeStruck(world, bolt(5, -160 * way));
    expect(trapeze(world).ampMilli).toBe(before + CFG.trapezePushMilli - CFG.trapezeBrakeMilli);
  });

  it("steers a real bolt into the alien from the side", () => {
    const world = install(LOCK);
    toLevel(world);
    world.cannonCol = 0;
    tapAlien(world, 1);
    fire(world, "cyan");
    const seen = runUntil(world, (w) => w.bullets.length === 0, 4);
    expect(seen.has("trapezeShot")).toBe(true);
  });
});
