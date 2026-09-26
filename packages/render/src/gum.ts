import { GUM, livingPath } from "@neon-spore/content";
import { gumIsFlung, rockHeading, type SimConfig } from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { contourClock, livingScale } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";

/**
 * THE GUM, drawn in its two states: a heavy drop coming down a lane, and the
 * same drop flying out of the field sideways once a hand has swiped it.
 *
 * **Nothing here is a new shape.** Both states are THE WEIGHT's sac off the
 * shape sheet (`content/silhouettes-gum.ts`), the body of a drop that has not
 * yet landed on the thing it would stick to. Flung, the same contour is
 * stretched the way it is going and leaves its drops *behind* it rather than
 * above it, because a thing thrown sideways trails sideways.
 *
 * **Its own material, on both screens.** Every colour here is the palette's
 * `venom` — a yellow-green that is nobody's ammunition and no seat's hull,
 * the way THE BALLOON's film is nobody's colour — so a gum is the same gum on
 * player 1's violet ship and player 2's amber one, and neither seat can read a
 * colour off it that says "load this".
 *
 * **What the picture has to say**, in order of how far away it reads:
 * 1. it is falling, and where: the drop is the lane it is coming down;
 * 2. it has been swiped, and which way: the body leans into its flight and
 *    the trail runs out behind it, so the seat that did not swipe sees the
 *    other hand arrive (`sim/gum.ts`);
 * 3. what it does to the ship is not here: a gum that lands is a `breach`,
 *    and the splash is `gum-splash.ts`, drawn over the finished hull.
 *
 * It used to be drawn a third way — as a smear stuck across the plating —
 * and that went with the sticking on 14 September 2026 (`sim/gum.ts`).
 */

/** The falling drop's footprint, as a share of a tile — a slick's, near enough. */
const DROP_R = 0.5;
/** How far a flung drop stretches along its flight, and flattens across it. */
const FLUNG_STRETCH = 1.35;
const FLUNG_SQUASH = 0.8;
/** How far the trail behind a flung drop reaches, in tiles. */
const TRAIL = 1.1;

export function drawGumBody(b: Body): void {
  const { ctx, l, world, c, x, y, time, near } = b;
  const tile = l.tile;
  const s = livingScale(GUM, tile * DROP_R);
  const path = new Path2D(livingPath(GUM, contourClock(c.id, time)));
  const venom = hazed(world.cfg, PALETTE.venom, near);
  halo(ctx, x, y + tile * 0.1, tile * 0.9, venom, 0.3);
  ctx.save();
  ctx.fillStyle = venom;
  if (gumIsFlung(c)) {
    // The trail: drops shed behind it along the row, each falling back from
    // where the body was — the same three drops the fall sheds, laid the
    // other way. `rockHeading` is where the flight is written down.
    const back = -rockHeading(c);
    for (let k = 0; k < 3; k++) {
      const ph = (time * 1.6 + k * 0.37 + c.id * 0.13) % 1;
      const dy = Math.sin(k * 2.1 + c.id) * tile * 0.1 + ph * tile * 0.15;
      ctx.globalAlpha = 0.75 * (1 - ph);
      ctx.beginPath();
      ctx.arc(
        x + back * tile * (0.4 + ph * TRAIL),
        y + dy,
        tile * 0.07 * (1 - ph) + 0.8,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
    paintSac(
      ctx,
      path,
      x,
      y,
      s * FLUNG_STRETCH,
      s * FLUNG_SQUASH,
      back * 0.35,
      world.cfg,
      near,
      time,
    );
    return;
  }
  // Small drops left behind it up the lane, each falling back from where the
  // body was: the trail of something too heavy to hold together.
  for (let k = 0; k < 3; k++) {
    const ph = (time * 1.1 + k * 0.37 + c.id * 0.13) % 1;
    const dx = Math.sin(k * 2.1 + c.id) * tile * 0.12;
    ctx.globalAlpha = 0.75 * (1 - ph);
    ctx.beginPath();
    ctx.arc(x + dx, y - tile * (0.5 + ph * 0.9), tile * 0.07 * (1 - ph) + 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  paintSac(ctx, path, x, y, s, s, 0, world.cfg, near, time);
}

/** How far the sac's own gradient axis and gloss spot drift as they wobble,
 * and how fast. The sac's silhouette already breathes on its own
 * (`contourClock` feeding `blobRadiusMul`'s wobble terms), but the gradient
 * that reads it as round, and the gloss that reads it as wet, sat at a fixed
 * spot no matter how the body moved under them — beautifully lit and still a
 * still life (`docs/style-guide.md`'s "Depth on a body that already ships").
 * On its own rate, distinct from the trail's (1.6, 1.1) and the blob's own
 * wobble terms (0.9, 0.53, 0.31, 0.6), so neither comes back into step with
 * any of the sac's other motion. */
const SAC_LIT_WOBBLE = 0.06;
const SAC_LIT_WOBBLE_RATE = 0.24;

/** One sac, filled from rim-light at the top to its deep green at the bottom,
 * with its border on. `shear` leans it: a flung drop leans into its flight. */
function paintSac(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  x: number,
  y: number,
  sx: number,
  sy: number,
  shear: number,
  cfg: SimConfig,
  near: number,
  time: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(1, 0, shear, 1, 0, 0);
  ctx.scale(sx, sy);
  const wobble = SAC_LIT_WOBBLE * Math.sin(time * SAC_LIT_WOBBLE_RATE);
  const g = ctx.createLinearGradient(GUM.rx * wobble, -GUM.ry, -GUM.rx * wobble, GUM.ry);
  g.addColorStop(0, hazed(cfg, PALETTE.venomRim, near));
  g.addColorStop(0.4, hazed(cfg, PALETTE.venom, near));
  g.addColorStop(1, hazed(cfg, PALETTE.venomDeep, near));
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.strokeStyle = hazed(cfg, PALETTE.venomRim, near);
  ctx.lineWidth = 1.4 / Math.max(sx, sy);
  ctx.stroke(path);
  // A gloss high on the left, the wet light every slime in this game wears.
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = PALETTE.venomRim;
  ctx.beginPath();
  ctx.ellipse(
    -GUM.rx * (0.3 + wobble * 0.7),
    -GUM.ry * (0.45 + wobble * 0.5),
    GUM.rx * 0.22,
    GUM.ry * 0.1,
    -0.5,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}
