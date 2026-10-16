import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  GEODE_SPAN,
  type GeodeState,
  geodeBoss,
  midCol,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { drawGeode } from "../src/geode-draw.js";
import { GeodeFx } from "../src/geode-fx.js";
import { geodePieces, geodePose } from "../src/geode-place.js";
import { mixHex, rgba } from "../src/hex.js";
import { computeLayout, tileCX, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { stubCanvas } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GEODE, drawn (`render/src/geode-draw.ts`): the stone on all three
 * screens; the crossing proved both ways — the crack's line on the
 * navigator's screen and not the pilot's, the crystal's colour on the
 * pilot's and not the navigator's; a cut piece's halves in the beam's colour
 * on both; the level's pieces sharing the field's width; the stone landing on
 * the hull; the heart flown off once shattered; and a bolt stopped on it in
 * every column it covers — set rather than played to. `sim/test/geode.test.ts`
 * proves the rules.
 */

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");
const RIM = rgba(mixHex(PALETTE.rock, PALETTE.background, 0.75), 0.95);

/** The wave's own stone, in and its first level lit. */
function lit(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("geode");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.geodeEnterBeats + 1); i++) step(world, []);
  return world;
}

function geode(world: World): GeodeState {
  const s = geodeBoss(world);
  if (s === null || s.phase !== "crack") throw new Error("the geode wave lit no crack");
  return s;
}

/** The frames of a pose, joined, the world held where it was posed. */
function frame(role: ViewRole, arrange: (world: World, s: GeodeState) => void = () => {}): string {
  const world = lit();
  arrange(world, geode(world));
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 1,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

/** One crack on the first level, at `at` from the middle in `color`. */
const crack = (at: number, color: "red" | "cyan") => (_: World, s: GeodeState) => {
  const first = s.steps[0];
  if (first !== undefined) first.cracks = [{ at, color }];
  s.cutTick = [-1];
};

const count = (text: string, colour: string): number => text.split(colour).length - 1;

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role);
});

describe("THE GEODE's stone", () => {
  it.each(ROLES)("hangs over the field on %s", (role) => {
    expect(count(frame(role), RIM)).toBeGreaterThan(0);
  });

  it("shows where the crack runs to the navigator, and never to the pilot", () => {
    expect(frame("p1", crack(2, "red"))).toBe(frame("p1", crack(-2, "red")));
    expect(frame("p2", crack(2, "red"))).not.toBe(frame("p2", crack(-2, "red")));
    expect(frame("test", crack(2, "red"))).not.toBe(frame("test", crack(-2, "red")));
  });

  it("shows the crystal's colour to the pilot, and never to the navigator", () => {
    const red = (role: ViewRole) => count(frame(role, crack(2, "red")), PALETTE.red);
    const cyan = (role: ViewRole) => count(frame(role, crack(2, "cyan")), PALETTE.red);
    expect(red("p1")).toBeGreaterThan(cyan("p1"));
    expect(red("test")).toBeGreaterThan(cyan("test"));
    expect(frame("p2", crack(2, "red"))).toBe(frame("p2", crack(2, "cyan")));
  });

  it.each(ROLES)("breaks a cut piece in two, its cut faces in the beam's colour, on %s", (role) => {
    const whole = frame(role, crack(2, "red"));
    const cut = frame(role, (w, s) => {
      crack(2, "red")(w, s);
      s.cutTick = [w.tick - TPB];
    });
    expect(cut).not.toBe(whole);
    // The navigator was shown no colour on the whole piece; its cut says it.
    if (role === "p2") expect(count(cut, PALETTE.red)).toBeGreaterThan(count(whole, PALETTE.red));
    else expect(count(cut, PALETTE.red)).toBeGreaterThan(0);
  });

  it("shares the field's width between a level's pieces, stacked ones one over the other", () => {
    const world = lit();
    const s = geode(world);
    for (let level = 0; level < s.steps.length; level++) {
      const p = geodePose(L, world, s, level, world.beat, 0);
      const pieces = geodePieces(L, world, s, level, p, []);
      expect(pieces.length).toBe(s.steps[level]?.cracks.length ?? -1);
      for (const b of pieces) {
        expect(b.crackX).toBeGreaterThanOrEqual(b.x0);
        expect(b.crackX).toBeLessThanOrEqual(b.x1);
        expect(b.y1).toBeGreaterThan(b.y0);
      }
      if (level === s.steps.length - 1) continue;
      for (let d = -GEODE_SPAN; d <= GEODE_SPAN; d++) {
        const x = tileCX(L, midCol(CFG) + d);
        const over = pieces.filter((b) => x >= b.x0 && x <= b.x1);
        expect(over.length, `level ${level}, column ${d}`).toBeGreaterThan(0);
      }
    }
  });

  it("lands on the hull when a level's time runs out", () => {
    const world = lit();
    const s = geode(world);
    s.phase = "struck";
    s.phaseBeat = world.beat;
    const p = geodePose(L, world, s, s.cursor, world.beat + 1, 0);
    expect(Math.abs(p.c.y + p.half - L.hullY)).toBeLessThan(1);
  });

  it.each(ROLES)("is gone once the heart's halves have flown, on %s", (role) => {
    const spent = frame(role, (w, s) => {
      s.phase = "spent";
      s.cursor = s.steps.length;
      s.phaseBeat = w.beat - 4;
      s.cutTick = (s.steps[s.steps.length - 1]?.cracks ?? []).map(() => w.tick - 5 * TPB);
    });
    expect(count(spent, RIM)).toBe(0);
  });

  it.each(ROLES)("stops a bolt on its foot in every column it covers, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const world = lit();
    const s = geode(world);
    const stops = new BoltStops();
    const paper = stubCanvas().ctx as unknown as CanvasRenderingContext2D;
    drawGeode(paper, l, world, s, world.beat, 0, 0, new GeodeFx(), stops);
    for (let d = -GEODE_SPAN; d <= GEODE_SPAN; d++) {
      const col = midCol(CFG) + d;
      const met = stops.meets(col, tileCX(l, col), "red");
      expect(met?.hit, `column ${d}`).toBe("body");
      expect(met?.y ?? 0).toBeLessThan(l.hullY);
    }
  });
});
