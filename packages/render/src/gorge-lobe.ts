import { blobPoints, circleSubpath } from "@neon-spore/content";
import { type GorgeIntake, gorgeSated } from "@neon-spore/sim";
import { paintDrop } from "./baton-drop.js";
import { halo } from "./glow.js";
import type { LobeDepth } from "./gorge-depth.js";
import { paintPucker } from "./gorge-flesh-torn.js";
import { paintLobeRim, paintLobeSkin } from "./gorge-lobe-skin.js";
import { paintLobeWant } from "./gorge-want.js";
import { PALETTE } from "./palette.js";
import { drawContact } from "./solid-haze.js";
import { splinePath } from "./spline.js";

/**
 * One bubble of THE GORGE: the intake puckered under it and the shots it has
 * swallowed hanging in it, as beads (`gorge-draw.ts` places them, in a row or
 * round a ring, `gorge-place.ts`).
 *
 * **The beads are what it holds**, the Bulb Queen's bargain again
 * (`docs/spec/bosses.md` §11.0), each in the colour it went in: a bubble with
 * two red beads and a cyan has had three shots. **What it wants is the floor's
 * colour, and only on the screen shown it** — `want` is `null` on the pilot's,
 * who is shown the count instead (`gorge-draw.ts`). It is poured into the
 * lobe, and a bubble that wants both is two-tone at its share (`gorge-want.ts`).
 *
 * **A sated bubble goes transparent** and swells a little, its beads risen to
 * the top: the one state change a seat two rows down reads at a glance, and a
 * shot up its column flies past it now (`sim/gorge-step.ts`).
 *
 * What the skin and the beads are made of is `gorge-flesh.ts`.
 */

/** A lobe's radii, as a share of a tile — wide enough to hold four beads. */
const RX = 0.4;
const RY = 0.5;
/** A bead's radius. */
const BEAD = 0.09;
/** How far round its lobe a bead swims, in bead radii, and how fast, in radians a second. */
const ORBIT = 0.55;
const ORBIT_SPEED = 1.1;
/** How much a bead swells coming round the near side, and what is left of it behind the skin. */
const ORBIT_LENS = 0.12;
const VEILED = 0.75;

/** What a bubble wants, as one colour to light it in: `both` when it is mixed. */
export type GorgeWant = "red" | "cyan" | "both";

export function gorgeWant(k: GorgeIntake): GorgeWant {
  if (k.needRed > 0 && k.needCyan > 0) return "both";
  return k.needRed > 0 ? "red" : "cyan";
}

export function lobeHex(want: GorgeWant | null): { hex: string; rim: string } {
  if (want === "cyan") return { hex: PALETTE.cyan, rim: PALETTE.cyanRim };
  if (want === "red") return { hex: PALETTE.red, rim: PALETTE.redRim };
  if (want === "both") return { hex: PALETTE.text, rim: PALETTE.text };
  return { hex: PALETTE.dim, rim: PALETTE.text };
}

/**
 * The lobe at `(x, y)`, `y` the intake's own height: the lobe stands above
 * it and its beads stack up from it. `breath` is the sack's, 0 to 1 over the
 * beat; `want` the colour this screen is shown it wants, or `null`.
 */
export function drawLobe(
  ctx: CanvasRenderingContext2D,
  tile: number,
  k: GorgeIntake,
  x: number,
  y: number,
  breath: number,
  want: GorgeWant | null,
  time: number,
  seed: number,
  /** Where it stands in the sack's bow this frame (`gorge-depth.ts`). */
  depth: LobeDepth,
): void {
  const full = gorgeSated(k);
  const swell = (full ? 1.18 : 1) * depth.s;
  const rx = tile * RX * swell;
  const ry = tile * RY * swell * (1 + 0.12 * breath);
  const cy = y - ry;

  const body = splinePath(blobPoints(x, cy, rx, ry, 3, 0.1, 0.04, time * 0.5, seed, 24), true);
  const { hex, rim } = lobeHex(want);
  // A sated lobe has no wash of skin at all — that is what *transparent*
  // means here. The colour it wanted is lit in the floor instead; a mixed
  // one's floor is its bottom colour, red, where the beads start.
  const floor = want === null ? PALETTE.dim : want === "both" ? PALETTE.red : hex;
  // The beads swim round inside: the ones behind go first, under the skin, so
  // the membrane veils them, and the ones in front come after it.
  drawBeads(ctx, tile, k, x, y, ry, full, time, false);
  paintLobeSkin(ctx, body, {
    x,
    cy,
    rx,
    ry,
    tile,
    floor,
    floorAlpha: full ? 0.9 : want === null ? 0.3 : 0.6,
    wall: full ? rim : null,
    wallAlpha: 0.3 + 0.2 * breath,
    full,
    turn: depth.turn,
    time,
    seed,
  });
  if (want !== null && !full) paintLobeWant(ctx, body, k, x, cy, rx, ry, tile);
  // Where it hangs from the sack, dark under its crown, so it is hung and not pasted.
  drawContact(ctx, body, x, cy - ry, rx * 1.1, 0.55);
  paintLobeRim(ctx, body, x, rx, tile, depth.turn, 1 - depth.back * 2);
  drawBeads(ctx, tile, k, x, y, ry, full, time, true);
  hazeLobe(ctx, body, depth.back);
  // The pucker: the intake itself, a small dark mouth under the lobe that a
  // shot goes into. It is what makes the swallow a picture the rule teaches.
  paintPucker(ctx, x, y, tile, floor, time, seed);
}

/**
 * The beads, stacked up the lobe from the intake — the red ones first, then
 * the cyan — each drifting a little against its neighbours so the body reads
 * as fluid. A sated lobe's stack has risen to the top of it.
 */
function drawBeads(
  ctx: CanvasRenderingContext2D,
  tile: number,
  k: GorgeIntake,
  x: number,
  y: number,
  ry: number,
  risen: boolean,
  time: number,
  /** The beads on the near side of the lobe, or the far. */
  front: boolean,
): void {
  const beads = k.gotRed + k.gotCyan;
  if (beads <= 0) return;
  const r0 = tile * BEAD;
  const lift = risen ? 1 : 0;
  const room = ry * 2 - r0 * 3;
  const step = Math.min(r0 * 2.2, room / Math.max(1, beads));
  for (let i = 0; i < beads; i++) {
    const a = time * ORBIT_SPEED + i * 1.9;
    const z = Math.sin(a);
    if (z >= 0 !== front) continue;
    const { hex, rim } = lobeHex(i < k.gotRed ? "red" : "cyan");
    const r = r0 * (1 + ORBIT_LENS * z);
    const bx = x + Math.cos(a) * r0 * ORBIT;
    const by = y - r0 * 1.6 - i * step - lift * (room - (beads - 1) * step);
    const lit = (0.6 + 0.4 * lift) * (front ? 1 : VEILED);
    halo(ctx, bx, by, r * 3, hex, (0.35 + 0.4 * lift) * (front ? 1 : VEILED));
    const bead = new Path2D(circleSubpath(bx, by, r));
    paintDrop(ctx, bead, bx, by, r, hex, rim, tile, lit);
  }
}

/** A lobe further round the bow than its neighbours, gone a step toward the field. */
function hazeLobe(ctx: CanvasRenderingContext2D, body: Path2D, back: number): void {
  if (back <= 0) return;
  ctx.save();
  ctx.globalAlpha = back;
  ctx.fillStyle = PALETTE.background;
  ctx.fill(body);
  ctx.restore();
}
