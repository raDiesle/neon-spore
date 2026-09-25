import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet, MAZE_ROUNDS, PINBALL_ROUNDS } from "@neon-spore/content";
import {
  type BossEntry,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { anchorPoint } from "../src/caption-anchor.js";
import { gaugeDial } from "../src/gauge-round.js";
import { computeLayout } from "../src/layout.js";
import { mazeDrum } from "../src/maze-walls.js";
import { repriseTearBox } from "../src/reprise-draw.js";
import { FRAME_TIMEOUT_MS } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHERE A CAPTION ABOUT A ROUND'S OWN FIXTURE POINTS — the three of the sixth
 * file (`caption-anchor-boss-f.ts`): THE GAUGE's dial, THE MAZE's drum, THE
 * REPRISE's sac. None of them takes a `part`, because each round draws one
 * thing its film has a page about.
 *
 * All three pages said what they say over the middle of the player's own
 * hull, so the thing every case here proves is that the ring left it: a hull
 * anchor is `l.hullY` at the bottom of the field, and each of these is a
 * clear distance above it.
 */

const CFG = DEFAULT_CONFIG;
const PILOT = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const SET = controlSet("default");

/** A world with the round installed, `ticks` in. */
function withBoss(boss: BossEntry, ticks = 60): World {
  const world = createWorld(CFG, 12, []);
  startWave(world, 9, [], [], boss);
  for (let t = 0; t < ticks; t++) step(world, []);
  if (world.boss === null) throw new Error(`no ${boss.kind} was installed`);
  return world;
}

/** How near a ring may sit to the hull line before it is a hull page again. */
const OFF_THE_HULL = PILOT.tile;

describe("where a page about one of the three rounds points", () => {
  it("rings THE GAUGE's dial, half as tall as it is wide", () => {
    const world = withBoss({ kind: "gauge" });
    const at = anchorPoint(PILOT, world, SET, { at: "boss" }, 0);
    const dial = gaugeDial(PILOT);
    expect(at).not.toBeNull();
    if (at === null) return;
    expect(at.x).toBeCloseTo(dial.cx, 3);
    expect(at.y).toBeCloseTo(dial.cy - dial.r * 0.5, 3);
    expect(at.rx ?? at.r).toBeGreaterThan(at.r);
    expect(PILOT.hullY - at.y).toBeGreaterThan(OFF_THE_HULL);
  });

  it("rings THE MAZE's drum where the walls and the string are drawn", () => {
    const world = withBoss({ kind: "maze", rounds: MAZE_ROUNDS });
    const at = anchorPoint(PILOT, world, SET, { at: "boss" }, 0);
    const drum = mazeDrum(PILOT, CFG);
    expect(at).not.toBeNull();
    if (at === null) return;
    expect(at.x).toBeCloseTo(drum.cx, 3);
    expect(at.y).toBeCloseTo(drum.cy, 3);
    expect(PILOT.hullY - at.y).toBeGreaterThan(OFF_THE_HULL);
  });

  it("rings THE REPRISE's sac across the top of the field", () => {
    const world = withBoss({ kind: "reprise", beat: 12 });
    const at = anchorPoint(PILOT, world, SET, { at: "boss" }, 0);
    const tear = repriseTearBox(PILOT, CFG);
    expect(at).not.toBeNull();
    if (at === null) return;
    expect(at.x).toBeCloseTo(tear.x, 3);
    expect(at.y).toBeCloseTo(tear.y, 3);
    // The sac and its torn edge are wider than they are tall.
    expect(at.rx ?? at.r).toBeGreaterThan(at.r);
    expect(PILOT.hullY - at.y).toBeGreaterThan(OFF_THE_HULL);
  });

  // The fourth film of the queue entry this file closes. PINBALL's one page
  // is about the cannon, which has an anchor of its own, so the round itself
  // is deliberately not a case in `bossAnchorF` — and a page that asked for
  // it would get no ring rather than a wrong one.
  it("gives PINBALL no fixture of its own", () => {
    const world = withBoss({ kind: "pinball", rounds: PINBALL_ROUNDS }, 6);
    expect(anchorPoint(PILOT, world, SET, { at: "boss" }, 0)).toBeNull();
  });
});
