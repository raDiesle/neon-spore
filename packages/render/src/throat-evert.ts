import type { Point } from "@neon-spore/content";
import { type SimConfig, type ThroatState, throatEvertBeatsLeft } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";
import { paintTurned } from "./throat-flesh-lip.js";
import { mouthX, mouthY } from "./throat-shape.js";

/**
 * **The eversion**: with every ring slack the tube can no longer hold its own
 * shape, and it pulls itself through its own mouth.
 *
 * The design calls this "the whole reason to build it"
 * (`docs/spec/bosses-choreographed.md` §1 step 14), and what it asks for is
 * precise: the tube turns inside out from the top down, ring by ring, each one
 * appearing on the outside of the last — and **what was the inside of the boss
 * is drawn for the first time as it goes**.
 *
 * So the root descends through the mouth and comes out under it. The gullet
 * above shortens from the top as it feeds through (`throat-draw.ts` draws the
 * rings that are left), and each ring that has come through blooms outward
 * below the mouth's row, the newest one widest, so the thing growing on the
 * field is visibly the boss turned inside out rather than a boss falling apart.
 *
 * **The inside is `venom`**, and it needs no new hue because the lip has been
 * saying so the whole fight: the lip is the *edge* of this surface
 * (`throat-mouth.ts`), the one part of the inside a pair could ever see, and
 * the first thing the eversion does is prove that the green they have been
 * aiming at goes all the way in. Nothing about the tube's grey outside is drawn
 * on an everted ring — that is the point of the picture.
 *
 * The sim keeps the boss installed for the whole of `throatEvertBeats` with a
 * slow window over it rather than nulling it at the last choke, precisely so
 * this has beats to run in (`sim/throat-step.ts`).
 */

/** How far below the mouth's row the first ring through comes to rest, in tiles. */
const DROP = 0.5;

/** How much wider than the one before it each ring through stands. */
const SPREAD = 0.34;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * How far through the eversion is, 0..1.
 *
 * Off the beats the simulation says are left rather than off a remembered
 * start, so the picture cannot outlive the boss: the frame `throatEvertBeatsLeft`
 * reaches zero is the frame `stepThroat` nulls the boss, and there is nothing
 * to draw after it.
 */
export function evertShare(
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
): number {
  if (cfg.throatEvertBeats <= 0) return 1;
  const left = throatEvertBeatsLeft(cfg, b, beat) - beatPhase;
  return clamp01((cfg.throatEvertBeats - left) / cfg.throatEvertBeats);
}

/** How many rings have come through, as a fraction — the whole one and the one on its way. */
export function evertedRings(
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
): number {
  return evertShare(cfg, b, beat, beatPhase) * cfg.throatRings;
}

/**
 * Every ring that has come through the mouth, innermost first.
 *
 * Drawn before the tube that is left, so a ring still feeding through is seen
 * to be passing *behind* the lip rather than in front of it.
 */
export function drawEversion(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: ThroatState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const through = evertedRings(cfg, b, beat, beatPhase);
  if (through <= 0) return;
  const x = mouthX(l, cfg, b, beat, beatPhase);
  const y = mouthY(l, cfg);
  for (let i = 0; i < cfg.throatRings; i++) {
    // How much of this ring is out: 1 when it is through, a fraction while it
    // is coming, 0 before its turn.
    const out = clamp01(through - i);
    if (out <= 0) break;
    drawTurned(ctx, l, x, y, i, out, time);
  }
  halo(ctx, x, y + l.tile * DROP, l.tile * (1.2 + SPREAD * through), PALETTE.venom, 0.22);
}

/**
 * One ring on the outside, and it grows *as it comes* rather than appearing at
 * its size.
 *
 * A ring that snapped into place would read as one more hoop being added to a
 * stack; one that widens out of the lip as it clears it reads as a surface
 * being pushed through a hole, which is the only sentence this picture has to
 * say.
 */
function drawTurned(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  index: number,
  out: number,
  time: number,
): void {
  const rx = l.tile * (0.4 + SPREAD * index) * out;
  const ry = rx * 0.5;
  const cy = y + l.tile * DROP * out + l.tile * SPREAD * 0.4 * index * out;
  const hoop = splinePath(insidePoints(x, cy, rx, ry, time, index), true);
  // Filled, and dark enough to hold a silhouette against the background the
  // way `docs/alive.md` asks — but the *inside's* dark, never the tube's grey,
  // and wet (`throat-flesh-lip.ts`).
  paintTurned(ctx, hoop, x, cy, rx, l.tile, out, time);
}

/** A turned ring's outline: wetter and less regular than the hoops it used to be. */
function insidePoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  time: number,
  seed: number,
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < 30; i++) {
    const a = (i / 30) * Math.PI * 2;
    const m = 1 + 0.09 * Math.sin(a * 3 + seed * 1.7) + 0.06 * Math.sin(time * 2.1 + a * 5 + seed);
    pts.push({ x: cx + Math.cos(a) * rx * m, y: cy + Math.sin(a) * ry * m });
  }
  return pts;
}
