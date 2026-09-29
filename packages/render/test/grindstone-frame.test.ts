import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GrindstoneState,
  type GrindstoneStep,
  grindstoneBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { grindstoneShut } from "../src/grindstone-pose.js";
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
 * THE GRINDSTONE, drawn (`render/src/grindstone-draw.ts`): the wheel with a
 * flat lit and a patch of it ground clean, cut deeper for a pass, the caliper
 * swinging in as a clamp is held and its pads lit, the axle lit in a shot's
 * colour, the spent axle's grind dying out, white to grey, and the wheel
 * spinning free — on all three screens, set rather than
 * played to; `sim/test/grindstone*.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

const TPB = ticksPerBeat(CFG);
const LEFT: GrindstoneStep = { ask: "left", color: "either", beats: 4 };
const CLAMP: GrindstoneStep = { ask: "clamp", color: "either", beats: 2 };
const FIRE: GrindstoneStep = { ask: "fire", color: "cyan", beats: 4 };

function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("grindstone");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The wheel standing, `lit` under the cursor `beats` beats in, nothing ground and the caliper slack. */
function posed(world: World, lit: GrindstoneStep | null, beats = 1): GrindstoneState {
  const s = grindstoneBoss(world);
  if (s === null) throw new Error("the grindstone wave stood no wheel");
  s.phase = lit === null ? "rest" : "lit";
  s.phaseBeat = world.beat - beats;
  s.cursor = 0;
  s.passes = [0, 0];
  s.gritMilli = [1000, 1000];
  s.locked = false;
  s.hits = 0;
  s.padsDown = [0, 0];
  s.heldBeats = 0;
  if (lit !== null) s.steps[0] = lit;
  return s;
}

function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** A colour as a glow lays it (the palette's hex) and as a fill or a faint stroke does (`rgba`). */
function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  return count(text, hex) + count(text, `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`);
}

/** Fills and strokes in a hot white — `grindstoneHeat` and the first of its mix down to grey. */
function hotWhite(text: string): number {
  return text.match(/rgba\(2[3-5]\d,2[3-5]\d,2[2-5]\d,/g)?.length ?? 0;
}

describe("THE GRINDSTONE's flats", () => {
  it.each(ROLES)("lights the asked flat and wears a patch of its grit clean, on %s", (role) => {
    const resting = frame(role, (w) => posed(w, null));
    const asked = frame(role, (w) => posed(w, LEFT));
    expect(asked).not.toBe(resting);
    expect(count(resting, PALETTE.grindstoneFlat)).toBe(0);
    const worn = frame(role, (w) => {
      posed(w, LEFT).gritMilli = [400, 1000];
    });
    expect(count(worn, PALETTE.grindstoneFlat)).toBeGreaterThan(0);
  });

  it.each(ROLES)("cuts a flat deeper for every pass it has taken, on %s", (role) => {
    const fresh = frame(role, (w) => posed(w, null));
    const ground = frame(role, (w) => {
      posed(w, null).passes = [1, 0];
    });
    expect(ground).not.toBe(fresh);
  });
});

describe("THE GRINDSTONE's caliper", () => {
  it.each(ROLES)(
    "lights both jaws' pads on a clamp and draws a held pad pressed, on %s",
    (role) => {
      const asked = frame(role, (w) => posed(w, CLAMP));
      expect(count(asked, PALETTE.hullRim)).toBeGreaterThan(
        count(
          frame(role, (w) => posed(w, null)),
          PALETTE.hullRim,
        ),
      );
      const pressed = frame(role, (w) => {
        posed(w, CLAMP).padsDown = [1, 0];
      });
      expect(pressed).not.toBe(asked);
    },
  );

  it("swings shut as the clamp is held, and creeps loose when bitten and let go", () => {
    const world = stood();
    const s = posed(world, CLAMP, 0);
    expect(grindstoneShut(world, s, world.beat, 0)).toBe(0);
    s.padsDown = [3, 3];
    s.heldBeats = 1;
    expect(grindstoneShut(world, s, world.beat, 0.5)).toBeCloseTo(0.75, 5);
    s.locked = true;
    s.padsDown = [0, 0];
    s.heldBeats = 0;
    s.phaseBeat = world.beat - 3;
    expect(grindstoneShut(world, s, world.beat, 0)).toBeLessThan(1);
    posed(world, null).locked = true;
    expect(grindstoneShut(world, s, world.beat, 0)).toBe(1);
  });
});

describe("THE GRINDSTONE's axle and its fall", () => {
  it.each(ROLES)(
    "lights the axle in the shot's colour once the caliper has bitten, on %s",
    (role) => {
      const dark = frame(role, (w) => posed(w, FIRE));
      const lit = frame(role, (w) => {
        posed(w, FIRE).locked = true;
      });
      expect(count(lit, PALETTE.cyan)).toBeGreaterThan(count(dark, PALETTE.cyan));
      const hit = frame(role, (w) => {
        const s = posed(w, FIRE);
        s.locked = true;
        s.hits = 2;
      });
      expect(hit).not.toBe(lit);
    },
  );

  it.each(ROLES)(
    "flings the caliper off and turns the wheel edge-on as it falls, on %s",
    (role) => {
      const held = frame(role, (w) => {
        posed(w, null).locked = true;
      });
      const falling = frame(role, (w) => {
        const s = posed(w, null, 1);
        s.phase = "free";
      });
      expect(falling).not.toBe(held);
    },
  );

  it.each(ROLES)("lets the spent axle's grind die out, white to grey, on %s", (role) => {
    const fading = (into: number, pads: [number, number] = [0, 0]) =>
      frame(role, (w) => {
        const s = posed(w, null, into);
        s.phase = "fade";
        s.locked = true;
        s.hits = 3;
        s.passes = [2, 2];
        s.gritMilli = [0, 0];
        s.padsDown = pads;
      });
    const spent = frame(role, (w) => {
      const s = posed(w, null);
      s.locked = true;
      s.hits = 3;
      s.passes = [2, 2];
      s.gritMilli = [0, 0];
    });
    const opening = fading(0);
    const late = fading(2);
    expect(hotWhite(opening)).toBeGreaterThan(hotWhite(spent));
    expect(hotWhite(late)).toBeLessThan(hotWhite(opening));
    // No cannon colour is added: the heat takes the place of the bitten axle's rim.
    for (const cannon of [PALETTE.red, PALETTE.cyan, PALETTE.hullRim]) {
      expect(tinted(opening, cannon)).toBeLessThanOrEqual(tinted(spent, cannon));
    }
    // A pad down on one jaw jars it back off the stone.
    expect(fading(2, [1, 0])).not.toBe(late);
  });

  it("draws the same wheel the same way twice", () => {
    expect(frame("p1", (w) => posed(w, LEFT))).toBe(frame("p1", (w) => posed(w, LEFT)));
  });
});
