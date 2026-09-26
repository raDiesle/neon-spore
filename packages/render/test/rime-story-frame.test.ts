import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type RimeState,
  type RimeStep,
  rimeBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE RIME's two story steps, drawn (`render/src/rime-story.ts`): the
 * whiteout's fog rolled over the pane with both halves lit, and the icicle
 * hanging over its column with the sight down to the hull — on all three
 * screens, set rather than played to (`sim/test/rime-story.test.ts` proves
 * the rules), and each the same picture twice.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) drawn(stood(), role, 3);
});

const TPB = ticksPerBeat(CFG);
const FILM = CFG.rimeFilmMilli;

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("rime");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The lens lit on `lit`, a beat in, each half's frost `frost`, the core bared or not. */
function posed(
  world: World,
  lit: RimeStep | null,
  frost: [number, number],
  bared: boolean,
): RimeState {
  const s = rimeBoss(world);
  if (s === null) throw new Error("the rime wave stood no lens");
  s.phase = lit === null ? "rest" : "lit";
  s.phaseBeat = world.beat - 1;
  s.rimeMilli = frost;
  s.hits = 0;
  s.bared = bared;
  s.cursor = 0;
  if (lit !== null) s.steps[0] = lit;
  return s;
}

function drawn(world: World, role: ViewRole, ticks: number): string {
  const log: string[] = [];
  runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = stood();
  arrange(world);
  return drawn(world, role, 9);
}

function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  const rgb = `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`;
  return text.split(hex).length - 1 + text.split(rgb).length - 1;
}

const BOTH: RimeStep = { ask: "both", color: "either", beats: 5 };
const ICICLE: RimeStep = { ask: "icicle", color: "either", beats: 4, offset: -2 };
const SHIELD: RimeStep = { ask: "shield", color: "either", beats: 4 };

const bareRest = (w: World) => posed(w, null, [0, 0], true);
const whiteout = (w: World) => posed(w, BOTH, [FILM, FILM], false);
const icicle = (w: World) => posed(w, ICICLE, [0, 0], true);
const shieldStep = (w: World) => posed(w, SHIELD, [0, 0], true);

describe("THE RIME's whiteout", () => {
  it.each(ROLES)("rolls a fog over the pane that the bare lens does not have, on %s", (role) => {
    const fogged = frame(role, whiteout);
    const bare = frame(role, bareRest);
    expect(fogged).not.toBe(bare);
    expect(tinted(fogged, PALETTE.hullRim)).toBeGreaterThan(tinted(bare, PALETTE.hullRim));
  });

  it.each(ROLES)("is gone once both halves are clear, on %s", (role) => {
    const clear = frame(role, (w) => posed(w, BOTH, [0, 0], false));
    expect(clear).not.toBe(frame(role, whiteout));
  });

  it.each(ROLES)("is the same picture twice, on %s", (role) => {
    expect(frame(role, whiteout)).toBe(frame(role, whiteout));
  });
});

describe("THE RIME's icicle", () => {
  it.each(ROLES)("hangs a frost shard and a sight over its column, on %s", (role) => {
    const hanging = frame(role, icicle);
    const shield = frame(role, shieldStep);
    expect(hanging).not.toBe(shield);
    expect(tinted(hanging, PALETTE.rimeFrost)).toBeGreaterThan(tinted(shield, PALETTE.rimeFrost));
  });

  it.each(ROLES)("is the same picture twice, on %s", (role) => {
    expect(frame(role, icicle)).toBe(frame(role, icicle));
  });

  it("sinks toward the hull as its step runs", () => {
    const early = frame("p1", icicle);
    const late = frame("p1", (w) => {
      posed(w, ICICLE, [0, 0], true).phaseBeat = w.beat - 3;
    });
    expect(late).not.toBe(early);
  });
});
