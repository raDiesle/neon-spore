import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  type BossEntry,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  type ThroatState,
  type UndertowState,
  undertowBoss,
  type World,
} from "@neon-spore/sim";
import { anchorPoint } from "../src/caption-anchor.js";
import { computeLayout, tileCX } from "../src/layout.js";
import { throatLockPoint } from "../src/throat-lock.js";
import { mouthX, mouthY, rings } from "../src/throat-shape.js";
import { breachHalf } from "../src/undertow-shape.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHERE A CAPTION ABOUT A BOSS'S OWN FIXTURE POINTS — the two films whose
 * pages the fifth file took off the hull last (`caption-anchor-boss-e.ts`):
 * THE UNDERTOW's breaches, plates and lobes, THE THROAT's gullet, mouth,
 * rings and count.
 *
 * These two are the pair the hull was nearly right for, so the thing each
 * test proves is the *nearly*: the ring is on the column the breach is in and
 * not in the middle of the plating, and it follows the mouth when the mouth
 * slides off the middle. The seat a part is not drawn on gets no ring at all
 * (`boss-anchor.test.ts`).
 */

const CFG = DEFAULT_CONFIG;
const PILOT = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const NAVIGATOR = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p2");
const SET = controlSet("default");
const BOTH = [PILOT, NAVIGATOR];

beforeAll(installCanvasGlobals);

/** A world with the boss installed, `ticks` in. */
function withBoss(boss: BossEntry, ticks = 120): World {
  const world = createWorld(CFG, 12, []);
  startWave(world, 9, [], [], boss);
  for (let t = 0; t < ticks; t++) step(world, []);
  if (world.boss === null) throw new Error(`no ${boss.kind} was installed`);
  return world;
}

/** The boss with at least one breach up, stepped until the first push lands. */
function pushing(): { world: World; u: UndertowState } {
  const world = withBoss({ kind: "undertow" }, 0);
  for (let t = 0; t < 2000; t++) {
    step(world, []);
    const u = undertowBoss(world);
    if (u !== null && u.breaches.length > 0) return { world, u };
  }
  throw new Error("the undertow never pushed");
}

describe("a caption pointed at THE UNDERTOW", () => {
  it("rings the column the breach is in, not the middle of the plating", () => {
    const { world, u } = pushing();
    const b = u.breaches[0];
    if (b === undefined) throw new Error("no breach");
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      expect(at?.x).toBeCloseTo(tileCX(l, b.col));
      expect(at?.rx ?? 0).toBeGreaterThanOrEqual(breachHalf(b) * l.tile);
    }
    // The point of the lane: a breach in column 0 is nowhere near the middle
    // of the plating, which is the only place the hull anchor ever is.
    b.col = 0;
    const hull = anchorPoint(PILOT, world, SET, { at: "hull" }, 0);
    const boss = anchorPoint(PILOT, world, SET, { at: "boss" }, 0);
    expect(boss?.x).toBeCloseTo(tileCX(PILOT, 0));
    expect(Math.abs((hull?.x ?? 0) - (boss?.x ?? 0))).toBeGreaterThan(PILOT.tile);
  });

  it("rings a standing lobe above the skin, and a bowing plate on it", () => {
    const { world, u } = pushing();
    const b = u.breaches[0];
    if (b === undefined) throw new Error("no breach");
    b.stage = "bowing";
    const flat = anchorPoint(PILOT, world, SET, { at: "boss", part: "plate" }, 0);
    expect(flat?.y).toBeCloseTo(PILOT.hullY);
    b.stage = "standing";
    b.stageBeat = world.beat - 2;
    const up = anchorPoint(PILOT, world, SET, { at: "boss", part: "lobe" }, 0);
    // A lobe stands a whole tile out of the hull, so the ring has to rise to
    // meet it rather than sit flat on the line.
    expect(up?.y ?? 0).toBeLessThan(PILOT.hullY - PILOT.tile * 0.3);
  });

  it("falls back to the whole edge for a plate the navigator is not shown", () => {
    const { world, u } = pushing();
    const b = u.breaches[0];
    if (b === undefined) throw new Error("no breach");
    b.stage = "bowing";
    const whole = anchorPoint(NAVIGATOR, world, SET, { at: "boss" }, 0);
    const plate = anchorPoint(NAVIGATOR, world, SET, { at: "boss", part: "plate" }, 0);
    // She is shown no bow (`showsUndertowBow`), and a page about the column it
    // is bowing in is still a page about that column.
    expect(plate?.x).toBeCloseTo(whole?.x ?? -1);
  });
});

/**
 * THE THROAT with its mouth standing in column 0 rather than in the middle.
 *
 * Put there rather than waited for: the mouth is still while the gullet is
 * whole (`throatStride`), and the phase and the column it started the phase
 * in are the only two things its position is a function of.
 */
function sliding(): { world: World; b: ThroatState } {
  const world = withBoss({ kind: "throat" });
  const b = world.boss;
  if (b?.kind !== "throat") throw new Error("no throat");
  b.phase = "slide";
  b.mouthFrom = 0;
  b.phaseBeat = world.beat;
  return { world, b };
}

describe("a caption pointed at THE THROAT", () => {
  it("rings the mouth where the gullet hangs it, on both screens", () => {
    const { world, b } = sliding();
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss", part: "mouths" }, 0);
      expect(at?.x).toBeCloseTo(mouthX(l, CFG, b, world.beat, 0));
      expect(at?.y).toBeCloseTo(mouthY(l, CFG));
      // And it has left the middle of the plating, which is where the page was.
      expect(Math.abs((at?.x ?? 0) - l.width / 2)).toBeGreaterThan(l.tile);
    }
  });

  it("rings the whole gullet, root to mouth, when no part is named", () => {
    const { world, b } = sliding();
    const all = rings(PILOT, CFG, b, world.beat, 0);
    const top = Math.min(...all.map((r) => r.y));
    const at = anchorPoint(PILOT, world, SET, { at: "boss" }, 0);
    expect(at).not.toBeNull();
    // Tall enough to hold the root and the mouth both, which is what makes it
    // the tube rather than one muscle of it.
    expect((at?.y ?? 0) - (at?.r ?? 0)).toBeLessThanOrEqual(top);
    expect((at?.y ?? 0) + (at?.r ?? 0)).toBeGreaterThanOrEqual(mouthY(PILOT, CFG));
  });

  it("rings NEXT INHALE on the navigator's screen and nothing on the pilot's", () => {
    const { world, b } = sliding();
    const at = anchorPoint(NAVIGATOR, world, SET, { at: "boss", part: "tally" }, 0);
    const lock = throatLockPoint(NAVIGATOR, CFG, b, world.beat);
    expect(at?.x).toBeCloseTo(lock.x);
    expect(at?.y).toBeCloseTo(lock.y);
    expect(anchorPoint(PILOT, world, SET, { at: "boss", part: "tally" }, 0)).toBeNull();
  });

  it("rings the lowest ring still holding for `ring`, narrower than the tube", () => {
    const { world, b } = sliding();
    b.slack = 1;
    const one = anchorPoint(PILOT, world, SET, { at: "boss", part: "ring" }, 0);
    const whole = anchorPoint(PILOT, world, SET, { at: "boss" }, 0);
    expect(one).not.toBeNull();
    expect(one?.r ?? 0).toBeLessThan(whole?.r ?? 0);
    const held = rings(PILOT, CFG, b, world.beat, 0).filter((r) => r.slack < 1);
    const last = held[held.length - 1];
    if (last === undefined) throw new Error("every ring is slack");
    expect(one?.y).toBeCloseTo(last.y);
  });
});
