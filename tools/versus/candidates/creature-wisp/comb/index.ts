import { facet, pin, surfaceDim } from "../../../../../packages/content/src/surface.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { WispFringe } from "../../../../../packages/render/src/wisp-look.js";
import * as wispLook from "../../../../../packages/render/src/wisp-look.js";
import { strandWave } from "../../../../../packages/render/src/wisp-tentacles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `creature:wisp` / `comb` — eight comb rows under the hem, each a run of
 * paddles beating one after the next, and the beat runs the spectrum down the
 * row.
 *
 * **What the shipped side is.** Eight threads that sway. A thread's whole
 * vocabulary is its curve, and a curve on a seven-second clock is a slow
 * thing: the fringe reads as hanging, which is right, and as *passive*, which
 * is the part this argues with.
 *
 * **What this argues.** That the one creature drawn as a received signal, and
 * filled through both ammunition colours at once, should hang the thing off its
 * hem that a comb jelly hangs off its body: rows of paddles whose beat runs the
 * length of the row and throws colour as it goes. The part is on the shapes
 * page — `comb-row`: *seven paddles in a line, beating one after the next
 * rather than together* — and the reason it belongs here and on no other body
 * is the bell above it. `spectrum` already runs cyan through violet to red
 * across the dome; a comb row's iridescence is the same three colours in the
 * same order, travelling *down* instead of across, so the fringe is the bell's
 * own light going somewhere rather than a second palette under it.
 *
 * Each row is pinned by longitude round the hem and turns on the shipped
 * seven-second clock, so the rows go round the back and come forward as the
 * threads did. What is new is what a row *is*: five paddles, each a lozenge
 * drawn about its own origin and foreshortened by the tangent plane's `sx` —
 * so a row at the limb is a stack of slivers and a row facing us is a stack
 * of blades — with a wave running down them a paddle at a time. A paddle at
 * the crest of its beat is bright and takes the colour the wave has reached;
 * a paddle at the trough is a dim mark on a dim stalk. A row behind is drawn
 * first, at half strength, through the bell.
 *
 * The jump does to a row what it did to a thread — gathered, drawn out, thrown
 * wide — through the same four numbers `drawTentacles` reads.
 *
 * **How it can lose.** *It reads as a machine.* Five things in a line moving in
 * order is a metronome as easily as it is a comb, and this creature already
 * has one: the beat the whole field is counting. The wave here runs on the
 * contour clock rather than the beat, and each row carries its own phase, so
 * the rows never pulse together — but if eight rows of paddles still tick
 * rather than ripple at 26 px, the fringe is arguing with the count and the
 * threads were right.
 */

/** Eight rows, so the count is the shipped fringe's count. */
const ROWS = 8;
/** A hair below the equator, so a row roots on the hem and not the crown. */
const HEM_LAT = -0.22;
/** How many paddles down a row. */
const PADDLES = 5;
/** The shipped turn, `wisp-tentacles.ts`'s seven seconds. */
const SPIN_SECONDS = 7;
/** How fast the beat runs down a row, and how far behind each paddle is the
 * one above it. A little under a whole wave per row, so no two paddles in one
 * row are ever at the crest together. */
const BEAT_SPEED = 3.4;
const LAG = 0.95;
/** What a row keeps of its light turned away from the key. */
const DIM = 0.4;
/** How narrow a paddle is at the limb, as a share of its width facing us. */
const EDGE_WEIGHT = 0.15;

const PINS = Array.from({ length: ROWS }, (_, i) => pin((i / ROWS) * Math.PI * 2, HEM_LAT, 1));

/** The spectrum the bell already wears, read at a phase: cyan through the
 * wisp's violet to red and back, so the colour a paddle flashes is the one the
 * wave has carried to it. */
function iridescence(k: number): string {
  const u = (Math.sin(k) + 1) * 0.5;
  return u < 0.5
    ? mixHex(PALETTE.cyan, PALETTE.wisp, u * 2)
    : mixHex(PALETTE.wisp, PALETTE.red, (u - 0.5) * 2);
}

function comb(f: WispFringe): void {
  const { ctx, rx, ry, t, j, dive, air, heading, noise, haze } = f;
  const len = ry * (1.5 - j.crouch * 0.85 - j.land * 0.88 + dive * 0.6);
  const splay = 1 + j.land * 2.2 + air * 0.25;
  const drag = -heading * rx * 0.55 * (dive * 0.7 + air * 0.35);
  const theta = (t / SPIN_SECONDS) * Math.PI * 2;

  const stalkNear = haze(PALETTE.wispRim);
  const stalkFar = haze(PALETTE.wisp);

  ctx.save();
  ctx.lineCap = "round";
  for (const want of [false, true]) {
    for (let i = 0; i < ROWS; i++) {
      const p = PINS[i];
      if (!p) continue;
      const fc = facet(p, theta);
      if (fc.near !== want) continue;
      const face = Math.abs(fc.sx);
      const lit = surfaceDim(DIM, fc.lit);
      // The row's own share of the signal — the shipped reading, called.
      const hold =
        0.3 + 0.7 * Math.max(0, Math.min(1, 0.62 + strandWave(t, i) * 0.5 - noise * 0.5));

      const bx = fc.x * rx * 1.02;
      const by = ry * (0.34 + p.cy * 0.1);
      const sway = Math.sin(t * 1.7 + i * 1.15) * rx * 0.16 * (1 - j.land);
      const tipX = bx * splay + drag + sway;
      const tipY = by + len * (1 - j.land * 0.55);

      // The stalk the paddles stand on: the shipped thread, thinner, so the
      // row is seen to hang from somewhere.
      ctx.strokeStyle = want ? stalkNear : stalkFar;
      ctx.lineWidth = Math.max(0.6, ry * 0.035 * (EDGE_WEIGHT + (1 - EDGE_WEIGHT) * face));
      ctx.globalAlpha = (want ? 0.5 : 0.3) * hold * lit;
      ctx.beginPath();
      ctx.moveTo(bx, by * 0.4);
      ctx.bezierCurveTo(
        bx + sway * 0.8,
        by + len * 0.34,
        tipX - sway * 0.6,
        by + len * 0.7,
        tipX,
        tipY,
      );
      ctx.stroke();

      // The paddles, one after the next down the stalk. Each is drawn about its
      // own origin and foreshortened by the row's `sx`, which is the tangent
      // plane's own map: a blade facing us, a sliver at the limb.
      for (let k = 0; k < PADDLES; k++) {
        const u = (k + 0.5) / PADDLES;
        const v = 1 - u;
        const x =
          v * v * v * bx +
          3 * v * v * u * (bx + sway * 0.8) +
          3 * v * u * u * (tipX - sway * 0.6) +
          u * u * u * tipX;
        const y =
          v * v * v * by * 0.4 +
          3 * v * v * u * (by + len * 0.34) +
          3 * v * u * u * (by + len * 0.7) +
          u * u * u * tipY;
        // The wave: later paddles lag earlier ones, each row on its own phase,
        // on the contour clock and never the beat.
        const phase = t * BEAT_SPEED - k * LAG + i * 0.8;
        const crest = Math.max(0, Math.sin(phase));
        const hex = haze(iridescence(phase * 0.5));
        // A paddle at the crest stands out from the stalk; at the trough it
        // lies along it. Smaller toward the tip, as a comb row's are.
        const size = ry * (0.27 - u * 0.09);
        const tilt = (0.35 + 0.55 * crest) * (fc.sx >= 0 ? 1 : -1);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tilt);
        ctx.scale(Math.max(0.1, EDGE_WEIGHT + (1 - EDGE_WEIGHT) * face), 1);
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = (want ? 1 : 0.55) * (0.5 + 0.5 * crest) * hold * (0.6 + 0.4 * lit);
        ctx.fillStyle = rgba(hex, 1);
        ctx.beginPath();
        ctx.ellipse(0, 0, size, size * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        // The flash itself: a paler core on the paddle at the crest, which is
        // the light off a comb row's edge as it comes round.
        if (crest > 0.6 && want) {
          ctx.fillStyle = rgba(haze(PALETTE.text), (crest - 0.6) * 1.6);
          ctx.beginPath();
          ctx.ellipse(0, 0, size * 0.5, size * 0.18, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
  }
  ctx.restore();
}

export const WISP_COMB: Variant = {
  slot: "creature:wisp",
  name: "comb",
  sentence:
    "eight comb rows under the hem, five paddles each, a beat running down every row a paddle at a time and carrying the bell's own cyan-violet-red with it — the fringe of a comb jelly, going round the back as slivers",
  dir: "tools/versus/candidates/creature-wisp/comb",
  patches: [
    patch({
      target: wispLook.WISP_LOOK,
      // No accessor: `wisp-body.ts` reads the export itself, once per wisp per
      // frame. The module namespace is the whole route there is.
      reached: () => wispLook.WISP_LOOK,
      where: {
        file: "packages/render/src/wisp-look.ts",
        symbol: "WISP_LOOK",
        type: "WispLook",
      },
      fields: { fringe: comb },
    }),
  ],
};
