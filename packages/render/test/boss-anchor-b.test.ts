import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet, SCOUT_ARENAS } from "@neon-spore/content";
import {
  antiphonBoss,
  type BossEntry,
  createWorld,
  DEFAULT_CONFIG,
  enterScoutPhase,
  leadBoss,
  scoutRound,
  scuttleBoss,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { antiphonBox, antiphonCentre } from "../src/antiphon-shape.js";
import { anchorPoint } from "../src/caption-anchor.js";
import { computeLayout } from "../src/layout.js";
import { leadFoot } from "../src/lead-shape.js";
import { scoutAt } from "../src/scout-draw.js";
import { scuttleBox, scuttleSocket } from "../src/scuttle-shape.js";
import { FRAME_TIMEOUT_MS, installCanvasGlobals } from "./canvas-stub.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * WHERE A CAPTION ABOUT A BOSS'S OWN FIXTURE POINTS — the five films of the
 * second half (`caption-anchor-boss-b.ts`): THE LEAD's stalk, THE SCUTTLE's
 * frame and live part, THE ANTIPHON's body, organ and rail, THE ORRERY's
 * orbits, ring and core, THE SCOUT's ship and hazards. Each is proved to
 * land where the boss's shape file puts the thing, and each part one seat
 * is not shown to be no ring on that seat's screen (`boss-anchor.test.ts`).
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

describe("a caption pointed at THE LEAD", () => {
  it("rings the stalk from its foot on this screen, on both", () => {
    const world = withBoss({ kind: "lead" });
    const s = leadBoss(world);
    if (s === null) throw new Error("no lead");
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      const foot = leadFoot(l, CFG, s);
      expect(at).not.toBeNull();
      // Above the foot, since the stalk stands up out of the ridge.
      expect(at?.y ?? 0).toBeLessThan(foot.y);
      expect(Math.abs((at?.x ?? 0) - foot.x)).toBeLessThan(l.tile);
    }
  });
});

describe("a caption pointed at THE SCUTTLE", () => {
  it("rings the frame of sockets when no part is named", () => {
    const world = withBoss({ kind: "scuttle" });
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      const b = scuttleBox(l, CFG);
      expect(at?.x).toBeCloseTo((b.left + b.right) * 0.5);
      expect(at?.rx ?? 0).toBeGreaterThan(l.tile * 2);
    }
  });

  it("rings the live part under its socket on the navigator's screen, and nothing on the pilot's", () => {
    // Socket 9 come loose this beat and live, set rather than waited for
    // (`scuttle-frame.test.ts`).
    const world = withBoss({ kind: "scuttle" });
    const s = scuttleBoss(world);
    if (s === null) throw new Error("no scuttle");
    s.loose = [9];
    s.live = 9;
    s.cycleBeat = world.beat;
    const at = anchorPoint(NAVIGATOR, world, SET, { at: "boss", part: "live" }, 0);
    const socket = scuttleSocket(NAVIGATOR, CFG, 9);
    expect(at?.x).toBeCloseTo(socket.x);
    expect(at?.y ?? 0).toBeGreaterThanOrEqual(socket.y - NAVIGATOR.tile);
    expect(anchorPoint(PILOT, world, SET, { at: "boss", part: "live" }, 0)).toBeNull();
  });
});

describe("a caption pointed at THE ANTIPHON", () => {
  it("rings the body when no part is named", () => {
    const world = withBoss({ kind: "antiphon" });
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      const c = antiphonCentre(l, CFG);
      expect(at?.x).toBeCloseTo(c.x);
      expect(at?.y).toBeCloseTo(c.y);
    }
  });

  it("rings the organ under the middle on the pilot's screen, and nothing on the navigator's", () => {
    const world = withBoss({ kind: "antiphon" });
    if (antiphonBoss(world) === null) throw new Error("no antiphon");
    const at = anchorPoint(PILOT, world, SET, { at: "boss", part: "organ" }, 0);
    const c = antiphonCentre(PILOT, CFG);
    expect(at?.x).toBeCloseTo(c.x);
    expect(at?.y ?? 0).toBeGreaterThan(antiphonBox(PILOT, CFG).bottom - PILOT.tile);
    expect(anchorPoint(NAVIGATOR, world, SET, { at: "boss", part: "organ" }, 0)).toBeNull();
  });

  it("rings the rail along the underside on the navigator's screen, and nothing on the pilot's", () => {
    const world = withBoss({ kind: "antiphon" });
    const at = anchorPoint(NAVIGATOR, world, SET, { at: "boss", part: "rail" }, 0);
    expect(at).not.toBeNull();
    expect(at?.y ?? 0).toBeGreaterThan(antiphonBox(NAVIGATOR, CFG).bottom - NAVIGATOR.tile);
    expect(anchorPoint(PILOT, world, SET, { at: "boss", part: "rail" }, 0)).toBeNull();
  });
});

describe("a caption pointed at THE SCOUT", () => {
  /** The ship out in the arena, set rather than flown there (`scout-frame.test.ts`). */
  function out(): World {
    const world = withBoss({ kind: "scout", arenas: SCOUT_ARENAS }, 1);
    const r = scoutRound(world);
    if (r === null) throw new Error("no scout");
    enterScoutPhase(r, "play", world.beat);
    r.arenaBeat = world.beat;
    r.colMilli = 3_200;
    r.rowMilli = 4_700;
    return world;
  }

  it("rings the mouth while the lead holds the ship, and the ship once it is out", () => {
    const held = withBoss({ kind: "scout", arenas: SCOUT_ARENAS }, 1);
    const mouth = anchorPoint(PILOT, held, SET, { at: "boss" }, 0);
    expect(mouth?.y ?? 0).toBeGreaterThan(PILOT.hullY - PILOT.tile);
    const world = out();
    const s = scoutRound(world);
    if (s === null) throw new Error("no scout");
    for (const l of BOTH) {
      const at = anchorPoint(l, world, SET, { at: "boss" }, 0);
      const ship = scoutAt(l, s);
      expect(at?.x).toBeCloseTo(ship.x);
      expect(at?.y).toBeCloseTo(ship.y);
    }
  });

  it("rings the hazards on the navigator's screen, and nothing on the pilot's", () => {
    const world = out();
    const s = scoutRound(world);
    if (s === null || s.hazards.length === 0) throw new Error("no hazards to ring");
    const at = anchorPoint(NAVIGATOR, world, SET, { at: "boss", part: "hazard" }, 0);
    expect(at).not.toBeNull();
    expect(anchorPoint(PILOT, world, SET, { at: "boss", part: "hazard" }, 0)).toBeNull();
  });
});
