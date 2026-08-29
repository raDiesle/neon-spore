import { catmullRomToBezierPath, type Point } from "../../../../../packages/content/src/shapes.js";
import * as maw from "../../../../../packages/render/src/cannon-maw.js";
import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import * as muzzle from "../../../../../packages/render/src/muzzle.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { patch, type Variant } from "../../../variant.js";
import { eggBeats } from "./curve.js";

/**
 * `cannon:mouth` / `egg` — the round hole on top of the cannon goes, and the
 * ship grows a cloaca that presses the shot out.
 *
 * The owner asked for this in an animal: a hen laying. Two halves, and the
 * second is the one that matters. **The shape**: the circle sitting on the
 * upper surface is a port, and a port is a hole cut in a body; what replaces
 * it is a swelling *of* the body, on the side that faces the ship, so it is
 * asymmetric and it has a direction. **The timing**: the shot is pressed, not
 * spawned — the body strains while nothing leaves, the egg comes through
 * stretching the contour around itself, and then it clears and the body goes
 * slack. `curve.ts` is that timing, on its own, and is the actual candidate;
 * everything in this file is how it is shown.
 *
 * **Direction, in the numbers rather than in the prose.** `drop` goes 0.12 →
 * 0.26, so the mouth's own centre moves a further seventh of a tile *towards*
 * the ship before anything is drawn at all; `PEAR` then makes the contour
 * fatter downward and narrower at the vent. Nothing about it is symmetric, and
 * both halves point the same way.
 *
 * **What it does not say.** The colour. `cannon-maw.ts` is emphatic that the
 * wind-up carries *when* and never *which ammunition*, because the colour is
 * player 2's half of the split and a mouth that leaked it would hand player 1
 * the one thing he has to be told. So the egg is the hull's own light, exactly
 * like the bolt it replaces, and it is a candidate for the mouth and not for
 * the shot: `pip` and `streak` argue about how a bolt travels, and nothing
 * here touches `SHOT_LOOK`.
 *
 * **How it can lose, and it is worth saying plainly.** The whole thing happens
 * inside a half beat — 316 ms at worst, 158 ms on average — plus 375 ms of
 * follow-through. That is genuinely enough to watch a shape change, and it may
 * still not be enough to read as *effort* on a phone at arm's length, in which
 * case the answer is that the shot has to leave later and that is a balance
 * decision nobody has made. This candidate deliberately does not make it: it
 * is drawn over the timing the game already has, and if it reads as a fast
 * shot with a slow decoration on it, that is the measurement.
 */

/** How much fatter the contour is towards the ship than at the vent. */
const PEAR = 0.34;
/** Half width and half height at rest, in tiles. */
const REST_RX = 0.27;
const REST_RY = 0.23;
/** Points round the contour. Enough that a lobe is a lobe and not a corner. */
const STEPS = 34;

/** The cloaca's outline for one frame, as a closed path. */
function contour(
  cx: number,
  cy: number,
  tile: number,
  t: number,
  b: ReturnType<typeof eggBeats>,
): Path2D {
  const rx = tile * REST_RX;
  const ry = tile * REST_RY;
  const pts: Point[] = [];
  for (let i = 0; i < STEPS; i++) {
    const a = (i / STEPS) * Math.PI * 2;
    // `sin(a)` is positive downward on a canvas, which is towards the ship.
    const down = Math.sin(a);
    // The vent is straight up: how far this angle is from it, wrapped.
    const off = Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2));
    // The contour stretched *around* the egg rather than merely opened for it
    // — a bump on the upward flank, widest while the egg is in the vent.
    const neck = b.vent * 0.34 * Math.exp(-((off / 0.6) ** 2));
    const mul =
      1 +
      PEAR * down +
      b.bulge * 0.44 * (0.58 + 0.42 * down) +
      neck +
      b.tremor * 0.05 * Math.sin(a * 3) +
      0.03 * Math.sin(a * 3 + t * 1.1);
    pts.push({ x: cx + Math.cos(a) * rx * mul, y: cy + down * ry * mul });
  }
  return new Path2D(catmullRomToBezierPath(pts));
}

export const MOUTH_EGG: Variant = {
  slot: "cannon:mouth",
  name: "egg",
  sentence:
    "no hole on top at all — a cloaca bulging towards the ship that strains, presses the shot out and then goes slack",
  dir: "tools/versus/candidates/cannon-shot/egg",
  patches: [
    patch({
      target: muzzle.MOUTH_LOOK,
      // No accessor: `drawMuzzle` reads the export itself. The module
      // namespace is the whole route there is.
      reached: () => muzzle.MOUTH_LOOK,
      where: {
        file: "packages/render/src/muzzle.ts",
        symbol: "MOUTH_LOOK",
        type: "MouthLook",
      },
      fields: {
        // Further below the tip: the mouth belongs to the ship's side of the
        // lobe now, not to its peak.
        drop: 0.26,
        draw(ctx, m, skin) {
          // At rest there is no opening to draw, which is the request: the
          // round circle is gone and the body itself is the feature. The
          // throat stays, because a pod still has to go in through this hole
          // and a candidate for the *shot* has no business breaking the
          // swallow — `maw.ts` and `swallow-bounds.test.ts` both still hold.
          if (m.intake <= 0.01) return;
          const rx = m.l.tile * (0.13 + (0.94 - 0.13) * m.intake);
          ctx.fillStyle = skin.muzzle;
          ctx.beginPath();
          ctx.ellipse(m.x, m.y, rx, m.l.tile * 0.13, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = m.intake > 0.5 ? PALETTE.podRim : skin.edge;
          ctx.lineWidth = 1.6;
          ctx.stroke();
        },
      },
    }),
    patch({
      target: maw.LAY_LOOK,
      reached: () => maw.LAY_LOOK,
      where: {
        file: "packages/render/src/cannon-maw.ts",
        symbol: "LAY_LOOK",
        type: "LayLook",
      },
      fields: {
        draw(ctx, m, s) {
          // Unlike the shipped mouth this draws at rest as well: the cloaca is
          // a body part and a body part does not appear when it is used. What
          // it does not do is draw while the maw is a throat — one hole, one
          // thing at a time.
          if (m.intake > 0.4) return;
          const { tile } = m.l;
          const b = eggBeats(s.phase, s.time);
          const cy = m.y;

          // Light gathering behind it, and only while something is actually
          // being pressed — the slack half of the follow-through is dark,
          // because nothing is in there any more.
          if (b.strain > 0 && b.relief === 0) {
            halo(
              ctx,
              m.x,
              cy,
              tile * (0.16 + 0.34 * b.strain),
              PALETTE.hullRim,
              0.15 + 0.5 * b.strain,
            );
          }

          const path = contour(m.x, cy, tile, s.time, b);
          ctx.save();
          ctx.fillStyle = "rgba(28,10,52,0.85)";
          ctx.fill(path);
          // The rim tightens and brightens under load and slackens after: the
          // line weight is doing as much of the reading as the shape is.
          const load = Math.max(0, b.bulge);
          strokeGlow(ctx, path, PALETTE.hullRim, 1.3 + 2.2 * load, 0.45 + 0.55 * load);
          ctx.restore();

          // The vent, at the top of the contour, open only while something is
          // coming through it.
          if (b.vent > 0.01) {
            ctx.save();
            ctx.globalAlpha = Math.min(1, 0.35 + 0.65 * b.vent);
            ctx.fillStyle = PALETTE.hullRim;
            ctx.beginPath();
            ctx.ellipse(
              m.x,
              cy - tile * REST_RY * (1 + b.bulge * 0.3),
              tile * 0.13 * b.vent,
              tile * 0.05 * b.vent,
              0,
              0,
              Math.PI * 2,
            );
            ctx.fill();
            ctx.restore();
          }

          // The shot itself, on its way through. It rides up out of the body
          // and is handed over to `drawBullets` at the tick it becomes live,
          // so this is only ever the part of its travel that is still inside
          // the ship.
          if (b.crown > 0 && b.relief === 0) {
            const ey = cy + tile * 0.06 - b.crown * tile * 0.44;
            const er = tile * 0.12 * (0.45 + 0.55 * b.crown);
            halo(ctx, m.x, ey, er * 2.4, PALETTE.hullRim, 0.35 + 0.5 * b.crown);
            ctx.fillStyle = PALETTE.hullRim;
            ctx.beginPath();
            ctx.arc(m.x, ey, er, 0, Math.PI * 2);
            ctx.fill();
          }
        },
      },
    }),
  ],
};
