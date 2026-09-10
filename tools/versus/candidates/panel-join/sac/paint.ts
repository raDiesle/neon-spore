import { blobPath, openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import type { BandAttach } from "../../../../../packages/render/src/band-join.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { Circle, Layout } from "../../../../../packages/render/src/layout.js";
import { bell, belly, sameLight, sky } from "../fused/tissue.js";

/**
 * The paint SAC is made of.
 *
 * Every control is inside a **vacuole** — a fluid-filled bladder of the ship's
 * own skin, slung from the membrane on a short thick umbilical and guyed to its
 * neighbours by threads. The button is not the end of something the ship grew;
 * it is an organ the ship is *carrying*, the way a body carries an eye or an
 * egg, and what it is carried in is visible.
 *
 * This is the card that argues the panel should have **depth** rather than
 * structure. FUSED and VESSEL both put things between the ship and the button
 * and differ over what those things are; CAUL puts one thing there and says it
 * has no parts. SAC says the interesting question is not what connects the
 * button to the ship but *what the button is suspended in* — and answers it
 * with something transparent, so the tissue behind each control is still there
 * to be seen through.
 */

/** The bladder around a control, in radii — wider than tall is wrong for
 * something hanging, so it is the other way round by a little. */
const SAC_X = 1.82;
const SAC_Y = 1.98;

/** The umbilical, in radii: where it leaves the roof, its waist, and where it
 * meets the bladder. */
const CROWN = 1.4;
const THROAT = 0.42;
const MOUTH = 0.95;

/** How the bladder breathes — a share of its own size, and how slowly. */
const SWELL = 0.05;
const SWELL_RATE = 0.62;

/** Samples down one side of an umbilical. */
const STEPS = 16;

/** The umbilical, as a closed path from above the membrane into the bladder. */
function cord(c: Circle, top: number, bottom: number, sway: number): string {
  const drop = Math.max(1, bottom - top);
  const down: Point[] = [];
  const back: Point[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const p = i / STEPS;
    const y = top + drop * p;
    const w =
      c.r *
      (CROWN * bell(p, 0, 0.26) + THROAT + MOUTH * bell(p, 1, 0.3)) *
      Math.min(1, (1 - p) / 0.05 + 0.001);
    const lean = sway * Math.sin(p * Math.PI);
    down.push({ x: c.x + lean - w, y });
    back.push({ x: c.x + lean + w, y });
  }
  back.reverse();
  return `${openSmoothPath([...down, ...back])} Z`;
}

/** The threads that hold one bladder steady: out to its neighbours and out to
 * the walls of the chamber. A thing hanging in fluid needs guying or it reads
 * as a thing resting on the bottom of the picture. */
function guys(l: Layout, lobes: readonly Circle[], time: number): string {
  let d = "";
  const sorted = [...lobes].sort((a, b) => a.x - b.x);
  for (const [i, c] of sorted.entries()) {
    const r = c.r;
    const next = sorted[i + 1];
    const ends: Point[] = [];
    if (next) ends.push({ x: next.x - next.r * SAC_X, y: next.y });
    if (i === 0) ends.push({ x: -r, y: c.y - r * 1.4 });
    if (i === sorted.length - 1) ends.push({ x: l.width + r, y: c.y - r * 1.4 });
    for (const [j, end] of ends.entries()) {
      const from = { x: c.x + (end.x > c.x ? r * SAC_X : -r * SAC_X), y: c.y };
      const dip = r * (0.5 + hash01(i * 29 + j * 7) * 0.7);
      const drift = Math.sin(time * 0.4 + i * 1.7 + j) * r * 0.1;
      const pts: Point[] = [];
      for (let s = 0; s <= 8; s++) {
        const p = s / 8;
        pts.push({
          x: from.x + (end.x - from.x) * p,
          y: from.y + (end.y - from.y) * p + (dip + drift) * Math.sin(p * Math.PI),
        });
      }
      d += openSmoothPath(pts);
    }
  }
  return d;
}

/**
 * SAC: every control hangs inside a bladder of the ship's own skin.
 *
 * The bladders are drawn one at a time rather than in one path, and that is the
 * one place on this panel where it is worth it: each one carries a radial
 * gradient of its own, keyed to where it is, and a shared fill would make them
 * all the same bubble lit from the same place — which is exactly what says
 * *drawn* rather than *grown*. Everything else here is one path.
 */
export function slung(d: BandAttach): void {
  const { ctx, l, lobes, time, skin } = d;
  if (lobes.length === 0) {
    sameLight(d);
    return;
  }

  const top = sky(l);
  let cords = "";
  for (const [i, c] of lobes.entries()) {
    const sway = Math.sin(time * 0.45 + i * 2.3) * c.r * 0.1;
    cords += cord(c, top, c.y - c.r * SAC_Y * 0.72, sway);
  }

  // The guys first, under everything: a thread crossing a bladder it is holding
  // would read as passing in front of it.
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.flesh[1], 0.26);
  ctx.lineWidth = Math.max(0.8, l.tile * 0.032);
  ctx.stroke(new Path2D(guys(l, lobes, time)));

  const deepest = Math.max(...lobes.map((c) => c.y + c.r * SAC_Y));
  const grad = ctx.createLinearGradient(0, top, 0, deepest);
  grad.addColorStop(0, rgba(belly(skin), 0.5));
  grad.addColorStop(0.5, rgba(skin.flesh[1], 0.4));
  grad.addColorStop(1, rgba(skin.tint, 0.3));
  const cordPath = new Path2D(cords);
  ctx.fillStyle = grad;
  ctx.fill(cordPath);
  ctx.strokeStyle = rgba(skin.rim, 0.13);
  ctx.lineWidth = Math.max(0.6, l.tile * 0.024);
  ctx.stroke(cordPath);

  for (const [i, c] of lobes.entries()) {
    const breathe = 1 + Math.sin(time * SWELL_RATE + i * 1.6) * SWELL;
    const rx = c.r * SAC_X * breathe;
    const ry = c.r * SAC_Y * (2 - breathe);
    const skinPath = new Path2D(
      blobPath(c.x, c.y, rx, ry, 5, 0.07, 0.04, time * 0.35, i * 17 + 5, 28),
    );
    // Transparent through the middle and thickening toward the wall, which is
    // what a fluid-filled bag does and what a disc of one colour does not: the
    // tissue behind a control stays visible through the bladder holding it.
    const wall = ctx.createRadialGradient(c.x, c.y - ry * 0.2, rx * 0.25, c.x, c.y, rx * 1.05);
    wall.addColorStop(0, rgba(skin.flesh[2], 0.03));
    wall.addColorStop(0.62, rgba(skin.flesh[0], 0.16));
    wall.addColorStop(1, rgba(belly(skin), 0.5));
    // **Added, not laid over.** A wet wall is where more light gets through,
    // not less: painting it as an ordinary fill made four dark blisters that
    // took the tissue behind them *away*, which is the opposite of the claim.
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = wall;
    ctx.fill(skinPath);
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = rgba(skin.tint, 0.4);
    ctx.lineWidth = Math.max(0.9, l.tile * 0.034);
    ctx.stroke(skinPath);

    // The one bright mark on a wet thing: a short arc of the light from the
    // membrane, up and to the side, never a ring all the way round.
    const glint = new Path2D();
    glint.ellipse(c.x, c.y, rx * 0.86, ry * 0.86, 0, Math.PI * 1.12, Math.PI * 1.52);
    ctx.strokeStyle = rgba(skin.rim, 0.34);
    ctx.lineWidth = Math.max(1.2, l.tile * 0.045);
    ctx.stroke(glint);
  }

  sameLight(d);
}
