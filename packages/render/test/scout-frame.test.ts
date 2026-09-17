import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  enterScoutPhase,
  type ScoutPhase,
  type ScoutState,
  scoutCurrent,
  scoutOpenRound,
  scoutRound,
  startWave,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { showsScoutArena, showsScoutNose } from "../src/view-role.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  stripsDrawn,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE SCOUT over the whole stage, every state of it set rather than waited
 * for: a headless run cannot fly the little ship home, so the phases, the
 * mouth, the burn, the carried motes and the catch are written onto the round
 * and the frames are read for what each seat was shown.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

function opened(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("scout");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return world;
}

function round(world: World): ScoutState {
  const r = scoutRound(world);
  if (r === null) throw new Error("THE SCOUT is not on the world");
  return r;
}

/** The ship out in the middle of the arena, burning, a mote aboard, the mouth open. */
function flying(world: World, phase: ScoutPhase = "play"): ScoutState {
  const r = round(world);
  enterScoutPhase(r, phase, world.beat);
  r.arenaBeat = world.beat;
  r.colMilli = 3_200;
  r.rowMilli = 4_700;
  r.headingMilli = 37_000;
  r.turn = 1;
  r.burning = true;
  r.carrying = [0];
  r.mawTick = world.tick;
  return r;
}

function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
  stepping = true,
  controls?: ControlSet,
) {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    controls,
    onCanvas: (c) => {
      c.log = log;
    },
    // A stepped round would fly the ship off the place it was set on; a still
    // one holds every state written onto it for the whole run.
    onTick: stepping ? undefined : () => {},
  });
  return { calls: ctx.calls, text: log.join("|") };
}

describe("THE SCOUT draws on all three screens", () => {
  it.each(ROLES)("draws the lead, the flight, the verdict and spent on %s", (role) => {
    for (const phase of ["lead", "play", "verdict", "spent"] as const) {
      const world = opened();
      const r = flying(world, phase);
      if (phase !== "play") r.caughtTick = world.tick;
      const frame = drawn(world, role, 2 * TPB, false);
      expect(frame.calls, `${role} ${phase}`).toBeGreaterThan(500);
      // The band's own sockets under the arena, and the hull's violet in it.
      expect(frame.text).toContain(PALETTE.hull);
    }
  });

  it("stands the round on its second arena and draws that one too", () => {
    const world = opened();
    scoutOpenRound(world, round(world), 1);
    flying(world);
    expect(drawn(world, "test", TPB, false).calls).toBeGreaterThan(500);
  });

  it("really runs the lead into play, so the stepped picture is the game's", () => {
    const world = opened();
    const frame = drawn(world, "p1", (CFG.scoutLeadBeats + 2) * TPB);
    expect(round(world).phase).toBe("play");
    expect(frame.calls).toBeGreaterThan(500);
  });

  it("shows the navigator the motes and hazards, and not the pilot", () => {
    expect(showsScoutArena("p1")).toBe(false);
    expect(showsScoutArena("p2")).toBe(true);
    expect(showsScoutArena("test")).toBe(true);
    // Neither piece has a colour of its own on this screen — a pod's core is
    // the maw button's too — so each is proved by what taking it off the
    // round costs the frame on each seat: nothing on the pilot's.
    const calls = (role: ViewRole, without: "motes" | "hazards" | null): number => {
      const world = opened();
      const r = flying(world);
      if (without === "hazards") r.hazards = [];
      if (without === "motes") r.banked = scoutCurrent(r).motes.map((_, i) => i);
      return drawn(world, role, 1, false).calls;
    };
    for (const piece of ["motes", "hazards"] as const) {
      expect(calls("p2", null), piece).toBeGreaterThan(calls("p2", piece));
      expect(calls("p1", null), piece).toBe(calls("p1", piece));
    }
  });

  it("shows the pilot the nose and what rides behind it, and not the navigator", () => {
    expect(showsScoutNose("p1")).toBe(true);
    expect(showsScoutNose("p2")).toBe(false);
    expect(showsScoutNose("test")).toBe(true);
    // The context's own `moveTo` is not in the log, so the nose is proved by
    // what is drawn on the same half of the split: a carried mote is one
    // amber disc on the ship's rim, and a screen that shows the nose shows
    // one more of them for one more mote aboard.
    const discs = (role: ViewRole, carrying: number[]): number => {
      const world = opened();
      flying(world).carrying = carrying;
      return count(drawn(world, role, 1, false).text, `${PALETTE.pod}|beginPath|arc(`);
    };
    expect(discs("p1", [0, 1]) - discs("p1", [])).toBe(2);
    expect(discs("p2", [0, 1]) - discs("p2", [])).toBe(0);
  });

  it("draws the panel it was handed, not the one the wave index names", () => {
    // THE SCOUT's own panel is four lobes and no strip at all; a screen that
    // draws the cannon's channel is drawing the set it was given.
    const handed = stripsDrawn(() =>
      drawn(flyingWorld(), "test", TPB, false, controlSet("default")),
    );
    const own = stripsDrawn(() => drawn(flyingWorld(), "test", TPB, false));
    expect(handed).toContain("cannon");
    expect(own).toEqual([]);
  });
});

function count(text: string, tell: string): number {
  return text.split(tell).length - 1;
}

function flyingWorld(): World {
  const world = opened();
  flying(world);
  return world;
}
