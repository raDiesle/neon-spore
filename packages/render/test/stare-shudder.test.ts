import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, type StareState, stareBoss, startWave } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { STARE_EYE } from "../src/stare-eye-look.js";
import { stareEye, stareFace } from "../src/stare-shape.js";
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
 * **The rising eye shudders** — `docs/spec/bosses.md` says so, and the globe
 * taken from VERSUS on 1 October 2026 had stopped: it read `face` and `open`
 * and dropped `lean`, which carried the shudder as well as the sliver's
 * shear. Now the ball turns by `lean` while it is square, so a level won
 * rattles it in its socket — a hit did, until the eye stopped taking hits on
 * 2 October 2026. The eye is painted straight through its record, with the
 * wall clock and the beat clock held still, so the only thing that can move
 * the picture between two beats of the rise is the shudder.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");
const INK = { hex: PALETTE.red, rim: PALETTE.redRim };

function eye(phase: StareState["phase"]): StareState {
  const world = createWorld(CFG, 3);
  const index = waveWith("stare");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const s = stareBoss(world);
  if (s === null) throw new Error("the stare wave hung no eye");
  s.phase = phase;
  s.phaseBeat = 0;
  s.open = false;
  return s;
}

/** The eye's paint log `beat + phase` beats after `s.phaseBeat`, every other clock held. */
function painted(s: StareState, beat: number, phase: number): string {
  const { ctx } = stubCanvas();
  const log: string[] = [];
  ctx.log = log;
  const look = stareFace(s, CFG, beat, phase);
  const e = stareEye(L, CFG);
  STARE_EYE.paint(ctx as unknown as CanvasRenderingContext2D, {
    e,
    ...look,
    ink: INK,
    time: 1,
    beats: 0,
  });
  ctx.log = undefined;
  return log.join("|");
}

describe("THE STARE's rising eye", () => {
  it("rattles across the beats after a level is won", () => {
    const s = eye("rise");
    const frames = [0.1, 0.3, 0.5, 0.7].map((t) => painted(s, 0, t));
    expect(new Set(frames).size).toBe(frames.length);
  });

  it("stands still on a quiet beat", () => {
    const s = eye("live");
    expect(painted(s, 3, 0.2)).toBe(painted(s, 3, 0.7));
  });
});
