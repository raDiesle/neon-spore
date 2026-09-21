import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import {
  type BossEntry,
  createWorld,
  DEFAULT_CONFIG,
  gorgeBoss,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { anchorPoint } from "../src/caption-anchor.js";
import { gorgeSackBox, gorgeTallyY } from "../src/gorge-draw.js";
import { computeLayout, tileCX } from "../src/layout.js";
import { mirrorHullY } from "../src/mirror.js";
import { stareEye } from "../src/stare-shape.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHERE A CAPTION ABOUT A BOSS'S OWN FIXTURE POINTS — the four films of the
 * fourth file (`caption-anchor-boss-d.ts`): THE GORGE's sack and the pilot's
 * counts under it, THE FLEET's chart, THE MIRROR's copy of the ship, THE
 * STARE's eye. Each is proved to land where the boss's own draw file puts the
 * thing, and the one part a seat is not shown is proved to be no ring on that
 * seat's screen (`boss-anchor.test.ts`).
 *
 * All four used to say what they say over the middle of the player's own
 * hull, so every case here is also a proof that the ring left it: the y of a
 * hull page is `l.hullY`, and none of these is anywhere near it.
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

describe("a caption pointed at THE GORGE", () => {
  it("rings the sack where the skin hangs, on both screens", () => {
    const world = withBoss({ kind: "gorge" });
    const g = gorgeBoss(world);
    if (g === null) throw new Error("no gorge");
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      const sack = gorgeSackBox(l, CFG, g);
      expect(at?.x).toBeCloseTo(sack.x);
      expect(at?.y).toBeCloseTo(sack.y);
      // Above the field, which is where the whole boss hangs — and so
      // nowhere near the hull the page used to sit on.
      expect(at?.y ?? 0).toBeLessThan(l.gridTop);
      expect(at?.y ?? 0).toBeLessThan(l.hullY);
    }
  });

  it("rings the row of counts for `tally`, and nothing on the navigator's", () => {
    const world = withBoss({ kind: "gorge" });
    const g = gorgeBoss(world);
    if (g === null) throw new Error("no gorge");
    const at = anchorPoint(PILOT, world, SET, { at: "boss", part: "tally" }, 0);
    expect(at?.y).toBeCloseTo(gorgeTallyY(PILOT, CFG, g));
    expect(at?.x).toBeCloseTo(
      (tileCX(PILOT, g.col) + tileCX(PILOT, g.col + g.intakes.length - 1)) * 0.5,
    );
    expect(anchorPoint(NAVIGATOR, world, SET, { at: "boss", part: "tally" }, 0)).toBeNull();
  });
});

describe("a caption pointed at THE FLEET", () => {
  it("rings the whole chart, the same ring on both screens", () => {
    const world = withBoss({
      kind: "fleet",
      ships: [
        { col: 1, row: 2, len: 4, dir: "h" },
        { col: 7, row: 5, len: 3, dir: "v" },
      ],
    });
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      expect(at?.x).toBeCloseTo(l.gridLeft + l.gridWidth / 2);
      // Wide enough to be the board rather than a square of it.
      expect(at?.rx ?? 0).toBeGreaterThan(l.gridWidth / 2);
    }
    const pilot = anchorPoint(PILOT, world, SET, { at: "boss" }, 0);
    const navigator = anchorPoint(NAVIGATOR, world, SET, { at: "boss" }, 0);
    expect(navigator?.x).toBeCloseTo(pilot?.x ?? 0);
    expect(navigator?.y).toBeCloseTo(pilot?.y ?? 0);
  });
});

describe("a caption pointed at THE MIRROR", () => {
  it("rings the copy at the top of the field, not the ship at the bottom", () => {
    const world = withBoss({ kind: "mirror", rounds: [["fireRed", "guard"], ["cannonLeft"]] });
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      expect(at?.y).toBeCloseTo(mirrorHullY(l, CFG));
      expect(at?.y ?? 0).toBeLessThan(l.hullY - l.tile);
    }
  });
});

describe("a caption pointed at THE STARE", () => {
  it("rings the eye in its socket, on both screens", () => {
    const world = withBoss({ kind: "stare" });
    for (const l of BOTH) {
      const eye = stareEye(l, CFG);
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      expect(at?.x).toBeCloseTo(eye.cx);
      expect(at?.y).toBeCloseTo(eye.cy);
      // The socket sits above row 0, where the cowl is drawn.
      expect(at?.y ?? 0).toBeLessThan(l.gridTop);
    }
  });
});
