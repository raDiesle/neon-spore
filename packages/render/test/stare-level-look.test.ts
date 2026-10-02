import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type StareState,
  stareBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { drawStare } from "../src/stare-draw.js";
import { StareFx } from "../src/stare-fx.js";
import { browPoint, stareAnger, stareLevelInk } from "../src/stare-level-look.js";
import { stareEye } from "../src/stare-shape.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE STARE's levels, as the picture tells them (2 October 2026): a colour a
 * level, a brow lower each level, the turns left written under the eye, and
 * the shell a bolt rings off. The eye is drawn on its own through
 * `drawStare`, so a colour found in the log is the eye's and no other
 * thing's on the field.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const L = computeLayout(VIEWPORT, CFG, "test");

function hung(): { world: World; s: StareState } {
  const world = createWorld(CFG, 3);
  const index = waveWith("stare");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = stareBoss(world);
  if (s === null) throw new Error("the stare wave hung no eye");
  return { world, s };
}

/** The eye open on a live beat at `level`, with `turn` turns survived, drawn once. */
function paint(level: number, turn = 0, fx = new StareFx()) {
  const { world, s } = hung();
  s.phase = "live";
  s.phaseBeat = world.beat - 1;
  s.open = true;
  s.level = level;
  s.turn = turn;
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  ctx.texts = [];
  drawStare(ctx as unknown as CanvasRenderingContext2D, L, world, s, world.beat, 0.3, 1, fx);
  return { text: log.join("|"), words: ctx.texts.map((t) => t.text) };
}

describe("THE STARE's levels", () => {
  it("opens each level in its own colour, yellow first", () => {
    const { s } = hung();
    const inks = [0, 1, 2, 3].map((level) => stareLevelInk({ ...s, level }).hex);
    expect(inks[0]).toBe(PALETTE.pod);
    expect(new Set(inks).size).toBe(4);
    expect(paint(0).text).toContain(PALETTE.pod);
    expect(paint(3).text).not.toContain(PALETTE.pod);
  });

  it("draws no eye fluid's green: the wash is the level's", () => {
    for (const level of [0, 3]) expect(paint(level).text).not.toContain(PALETTE.eyeFluid);
  });

  it("brings the brow's point lower every level", () => {
    const { s } = hung();
    const e = stareEye(L, CFG);
    const points = [0, 1, 2, 3].map((level) => browPoint(e, stareAnger({ ...s, level }), 0.5).y);
    for (let i = 1; i < points.length; i++) {
      expect(points[i] as number).toBeGreaterThan(points[i - 1] as number);
    }
    // And never into the opening: the point stays over the eye's middle.
    expect(points[3] as number).toBeLessThan(e.cy);
  });

  it("writes the turns left under the eye, and says one in the singular", () => {
    const fresh = paint(0, 0).words;
    expect(fresh).toContain(String(CFG.stareTurns));
    expect(fresh).toContain("TURNS LEFT");
    const last = paint(0, CFG.stareTurns - 1).words;
    expect(last).toContain("1");
    expect(last).toContain("TURN LEFT");
  });

  it("rings the shell when a bolt glances off it, and lets it fall", () => {
    const fx = new StareFx();
    const quiet = paint(0, 0, fx).text;
    fx.ingest([{ type: "stareDeflect", col: 3 }], L, CFG, () => {});
    expect(fx.ping).toBe(1);
    expect(paint(0, 0, fx).text).not.toBe(quiet);
    for (let i = 0; i < 60; i++) fx.update(1 / 30);
    expect(fx.ping).toBe(0);
    fx.ingest([{ type: "stareDeflect", col: 3 }], L, CFG, () => {});
    fx.clear();
    expect(fx.ping).toBe(0);
  });
});
