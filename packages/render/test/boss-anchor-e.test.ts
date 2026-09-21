import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  type BossEntry,
  createWorld,
  DEFAULT_CONFIG,
  ledgerBoss,
  spliceRound,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { anchorPoint } from "../src/caption-anchor.js";
import { computeLayout } from "../src/layout.js";
import { ledgerBodyBox, ledgerRootPoint, ledgerSocketPoint } from "../src/ledger-shape.js";
import { spliceCurve, spliceMouthY, spliceTopY } from "../src/splice-straws.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHERE A CAPTION ABOUT A BOSS'S OWN FIXTURE POINTS — the two films of the
 * fifth file (`caption-anchor-boss-e.ts`): THE LEDGER's body, cord and lock,
 * THE SPLICE's tangle and mouths. Each is proved to land where the boss's own
 * shape file puts the thing, and the two parts a seat is not shown are proved
 * to be no ring on that seat's screen (`boss-anchor.test.ts`).
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

describe("a caption pointed at THE LEDGER", () => {
  it("rings the body on the seam when no part is named, on both screens", () => {
    const world = withBoss({ kind: "ledger" });
    const t = ledgerBoss(world);
    if (t === null) throw new Error("no ledger");
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      const body = ledgerBodyBox(l, CFG, t);
      expect(at?.x).toBeCloseTo(body.x);
      expect(at?.y).toBeCloseTo(body.y);
      // Over the field rather than on the plating the page used to sit on.
      expect(at?.y ?? 0).toBeLessThan(l.hullY - l.tile);
    }
  });

  it("rings the cord between its two ends, on both screens", () => {
    const world = withBoss({ kind: "ledger" });
    const t = ledgerBoss(world);
    if (t === null) throw new Error("no ledger");
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss", part: "cord" }, 0);
      const root = ledgerRootPoint(l, CFG, t);
      const socket = ledgerSocketPoint(l, t);
      expect(at?.y).toBeCloseTo((root.y + socket.y) * 0.5);
      // Long enough to hold both ends: the cord, not one end of it.
      expect(at?.r ?? 0).toBeGreaterThan(Math.abs(socket.y - root.y) * 0.5);
    }
  });

  it("rings the lock on the socket for the navigator, and nothing for the pilot", () => {
    const world = withBoss({ kind: "ledger" });
    const t = ledgerBoss(world);
    if (t === null) throw new Error("no ledger");
    const at = anchorPoint(NAVIGATOR, world, SET, { at: "boss", part: "lock" }, 0);
    const socket = ledgerSocketPoint(NAVIGATOR, t);
    expect(at?.x).toBeCloseTo(socket.x);
    expect(at?.y).toBeCloseTo(socket.y);
    expect(anchorPoint(PILOT, world, SET, { at: "boss", part: "lock" }, 0)).toBeNull();
  });
});

describe("a caption pointed at THE SPLICE", () => {
  it("rings the whole tangle for the navigator, and nothing for the pilot", () => {
    const world = withBoss({ kind: "splice", rounds: [{ beats: 16 }, { beats: 24 }] });
    const s = spliceRound(world);
    if (s === null) throw new Error("no splice");
    expect(s.entranceCols.length).toBeGreaterThan(1);
    const at = anchorPoint(NAVIGATOR, world, SET, { at: "boss" }, 0);
    // Both rows inside it: the top ends and the mouths are what is traced.
    const top = spliceTopY(NAVIGATOR, CFG);
    const mouth = spliceMouthY(NAVIGATOR, CFG);
    expect(at?.y).toBeCloseTo((top + mouth) * 0.5);
    expect(at?.r ?? 0).toBeGreaterThan(Math.abs(mouth - top) * 0.5);
    expect(anchorPoint(PILOT, world, SET, { at: "boss" }, 0)).toBeNull();
  });

  it("rings the row of mouths for `mouths`, on both screens", () => {
    const world = withBoss({ kind: "splice", rounds: [{ beats: 16 }, { beats: 24 }] });
    const s = spliceRound(world);
    if (s === null) throw new Error("no splice");
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss", part: "mouths" }, 0);
      expect(at?.y).toBeCloseTo(spliceMouthY(l, CFG));
      const ends = s.entranceCols.map((_, i) => spliceCurve(l, CFG, s, i).x1);
      expect(at?.x).toBeCloseTo((Math.min(...ends) + Math.max(...ends)) * 0.5);
    }
  });
});
