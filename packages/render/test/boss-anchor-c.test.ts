import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  type BossEntry,
  batonBoss,
  candleBoss,
  createWorld,
  DEFAULT_CONFIG,
  diastoleChamberCol,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { socketPoint } from "../src/baton-socket-draw.js";
import { candleFlameY } from "../src/candle-glow.js";
import { anchorPoint } from "../src/caption-anchor.js";
import { diastoleY } from "../src/diastole-draw.js";
import { computeLayout, tileCX } from "../src/layout.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHERE A CAPTION ABOUT A BOSS'S OWN FIXTURE POINTS — the three films of the
 * third file (`caption-anchor-boss-c.ts`): THE CANDLE's flame and face, THE
 * BATON's arm, THE DIASTOLE's chambers. Each is proved to land where the
 * boss's own draw file puts the thing, and the one part a seat is not shown
 * is proved to be no ring on that seat's screen (`boss-anchor.test.ts`).
 */

const CFG = DEFAULT_CONFIG;
const PILOT = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const NAVIGATOR = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p2");
const SET = controlSet("default");
const BOTH = [PILOT, NAVIGATOR];

beforeAll(installCanvasGlobals);

/** A world with the boss installed, `ticks` in. */
function withBoss(boss: BossEntry, ticks = 60): World {
  const world = createWorld(CFG, 12, []);
  startWave(world, 9, [], [], boss);
  for (let t = 0; t < ticks; t++) step(world, []);
  if (world.boss === null) throw new Error(`no ${boss.kind} was installed`);
  return world;
}

describe("a caption pointed at THE CANDLE", () => {
  it("rings the flame where the glow hangs it, on both screens", () => {
    const world = withBoss({ kind: "candle" });
    const c = candleBoss(world);
    if (c === null) throw new Error("no candle");
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      expect(at?.x).toBeCloseTo(tileCX(l, c.col));
      expect(at?.y).toBeCloseTo(candleFlameY(l, c));
    }
  });

  it("rings the face at the top of the faced column, and nothing on the navigator's", () => {
    const world = withBoss({ kind: "candle" });
    const c = candleBoss(world);
    if (c === null) throw new Error("no candle");
    c.faceCol = 1;
    const at = anchorPoint(PILOT, world, SET, { at: "boss", part: "face" }, 0);
    expect(at?.x).toBeCloseTo(tileCX(PILOT, 1));
    // At the top of the grid, which is where the cone's mouth is drawn.
    expect(at?.y ?? 0).toBeLessThan(PILOT.gridTop + PILOT.tile);
    expect(anchorPoint(NAVIGATOR, world, SET, { at: "boss", part: "face" }, 0)).toBeNull();
  });
});

describe("a caption pointed at THE BATON", () => {
  it("rings the whole arm, from the base socket to the last, on both screens", () => {
    const world = withBoss({ kind: "baton" });
    const b = batonBoss(world);
    if (b === null) throw new Error("no baton");
    expect(b.sockets.length).toBeGreaterThan(1);
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      const first = socketPoint(l, CFG, b, 0);
      const last = socketPoint(l, CFG, b, b.sockets.length - 1);
      expect(at).not.toBeNull();
      expect(at?.y).toBeCloseTo((first.y + last.y) * 0.5);
      // Tall enough to hold every socket on the thread, which is what makes
      // it the arm rather than one bead of it.
      expect(at?.r ?? 0).toBeGreaterThan(Math.abs(last.y - first.y) * 0.5);
    }
  });
});

describe("a caption pointed at THE DIASTOLE", () => {
  it("rings both chambers on their shelf when no part is named", () => {
    const world = withBoss({ kind: "diastole" });
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      const left = tileCX(l, diastoleChamberCol(CFG, -1));
      const right = tileCX(l, diastoleChamberCol(CFG, 1));
      expect(at?.x).toBeCloseTo((left + right) * 0.5);
      expect(at?.y).toBeCloseTo(diastoleY(l));
      expect(at?.rx ?? 0).toBeGreaterThan(Math.abs(right - left) * 0.5);
    }
  });

  it("rings the left chamber alone for `left`, on both screens", () => {
    const world = withBoss({ kind: "diastole" });
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss", part: "left" }, 0);
      const left = tileCX(l, diastoleChamberCol(CFG, -1));
      expect(at?.x).toBeCloseTo(left);
      // Narrower than the pair: one chamber, not the shelf.
      const both = anchorPoint(l, world, SET, { at: "boss" }, 0);
      expect(at?.rx ?? 0).toBeLessThan(both?.rx ?? 0);
    }
  });
});
