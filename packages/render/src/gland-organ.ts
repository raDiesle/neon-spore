import { blobPath, type Point } from "@neon-spore/content";
import { hash01 } from "./backdrop.js";
import { bakedCache } from "./baked.js";
import { beadedCords } from "./gland-cord.js";
import { curve, tubeInto } from "./gland-tube.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import type { LobeDraw } from "./lobe-look.js";
import type { NerveDraw } from "./ship-nerves.js";

/**
 * A BUTTON GROWN AS AN ORGAN — the flesh it swells out of, the veins that feed
 * it, and the plasma that leaks from it.
 *
 * The owner, 11 September 2026, on the `ship:body` cards: *the buttons don't
 * look embedded so much. I prefer if they look like they are grown together
 * with the body, like a heart or organ with veins and plasma coming out of the
 * body a little bit.* So a button here has no socket and no plate. Under its
 * face is a **swelling** of the panel's own flesh, larger than the button and
 * off-centre downward the way a weight hangs, with a dark crease where the
 * button sinks into it and a wet highlight on its shoulder. Out of the
 * swelling run **veins** — tapered tubes, each with one branch, dark
 * underneath and lit on top — and they are drawn under the face, so the
 * button is on top of the flesh it grew from and never looks laid over it.
 *
 * What moves is in `organLife`, which runs in the nerves pass because that is
 * the one pass under the buttons that is handed the clock: the swelling
 * **breathes** with a light inside it, **droplets** of plasma well out of its
 * underside and sink away, and a **beaded cord** — PLASM's strings, which he
 * liked — runs up from each button to the knob on its rail and from the knob
 * on up to the organ on the hull, with bright bodies walking it, quicker while
 * the organ's window is open.
 */

export interface OrganLook {
  /** Veins out of the swelling. */
  readonly veins: number;
  /** How far they reach, in button radii. */
  readonly reach: number;
  /** How far the swelling stands out past the button, in radii. */
  readonly swell: number;
  /** The swelling's own contour: how many lobes, and how deep — two deep
   * lobes is a heart, five shallow ones a sac. */
  readonly lobes: number;
  readonly depth: number;
}

/** A branch off a vein: a short tube curving away from the fork. */
function twig(into: Path2D, fork: Point, heading: number, len: number, r: number): void {
  const tip = { x: fork.x + Math.cos(heading) * len, y: fork.y + Math.sin(heading) * len };
  const c = {
    x: fork.x + Math.cos(heading - 0.5) * len * 0.5,
    y: fork.y + Math.sin(heading - 0.5) * len * 0.5,
  };
  tubeInto(into, curve(fork, tip, c, tip, 6), (p) => r * (0.05 - 0.042 * p));
}

/** One vein: a thick tube leaving the swelling, winding as it thins, and
 * forking twice on the way — a vessel, not a spine. */
function vein(
  into: Path2D,
  x: number,
  y: number,
  r: number,
  angle: number,
  len: number,
  seed: number,
): void {
  const a = { x: x + Math.cos(angle) * r * 0.9, y: y + Math.sin(angle) * r * 0.9 };
  const bend = (hash01(seed) - 0.5) * 2.6;
  const end = angle + bend * 0.5;
  const b = { x: x + Math.cos(end) * len, y: y + Math.sin(end) * len };
  const c1 = {
    x: x + Math.cos(angle - bend * 0.3) * r * 1.9,
    y: y + Math.sin(angle - bend * 0.3) * r * 1.9,
  };
  const c2 = {
    x: x + Math.cos(angle + bend * 0.8) * len * 0.7,
    y: y + Math.sin(angle + bend * 0.8) * len * 0.7,
  };
  const main = curve(a, b, c1, c2, 12);
  tubeInto(into, main, (p) => r * (0.17 - 0.14 * p ** 0.8));
  const swing = hash01(seed + 1) > 0.5 ? 1 : -1;
  const first = main[4] as Point;
  const second = main[8] as Point;
  twig(into, first, end + swing * 1.1, len * 0.32, r);
  twig(into, second, end - swing * 0.9, len * 0.24, r * 0.8);
}

/**
 * The three contours a button's bed is made of, held per button. They depend
 * on where the button is and how big it is and on nothing else, and building
 * them every frame was twelve `new Path2D` a seat on the frame that should
 * have been all cache hits (`docs/queue.md`, 11 September 2026). Keyed on
 * position, radius and the look, so a resize bakes new ones; cleared past a
 * handful of entries the way `band-ground.ts` clears its sheets, because a
 * window being dragged walks through every size on the way.
 */
interface Bed {
  readonly veins: Path2D;
  readonly swell: Path2D;
  readonly shoulder: Path2D;
  readonly gloss: Path2D;
}
const beds = bakedCache<string, Bed>();

function bedFor(x: number, y: number, r: number, o: OrganLook): Bed {
  const key = `${x}|${y}|${r}|${o.veins}|${o.reach}|${o.swell}|${o.lobes}|${o.depth}`;
  const held = beds.get(key);
  if (held) return held;
  if (beds.size > 8) beds.clear();
  const R = r * (1 + o.swell);
  const veins = new Path2D();
  for (let i = 0; i < o.veins; i++) {
    const angle = ((i + 0.5) / o.veins) * Math.PI * 2 + (hash01(i * 13 + 1) - 0.5) * 0.6;
    vein(veins, x, y, r, angle, r * o.reach * (0.75 + hash01(i * 5 + 2) * 0.5), i * 7 + 3);
  }
  const shoulder = new Path2D();
  shoulder.ellipse(x, y + r * 0.1, R * 0.86, R * 0.8, 0, Math.PI * 1.08, Math.PI * 1.55);
  const gloss = new Path2D();
  gloss.ellipse(x, y, r * 0.84, r * 0.84, 0, Math.PI * 1.12, Math.PI * 1.48);
  const bed: Bed = {
    veins,
    swell: new Path2D(blobPath(x, y + r * 0.12, R, R * 0.92, o.lobes, o.depth, 0.04, 0, 11, 44)),
    shoulder,
    gloss,
  };
  beds.set(key, bed);
  return bed;
}

/** Under the face: the swelling of flesh the button grew out of, and its veins. */
export function organBed(d: LobeDraw, o: OrganLook): void {
  const { ctx, x, y, r, skin } = d;
  const R = r * (1 + o.swell);
  const { veins: veinPath, swell } = bedFor(x, y, r, o);
  // The veins first, so the swelling covers their roots.
  ctx.save();
  ctx.translate(r * 0.03, r * 0.05);
  ctx.fillStyle = rgba(skin.ground[3], 0.55);
  ctx.fill(veinPath);
  ctx.restore();
  ctx.fillStyle = rgba(skin.flesh[1], 0.62);
  ctx.fill(veinPath);
  // Lit along the top edge only: the vessel is round and the light is above.
  ctx.save();
  ctx.translate(-r * 0.02, -r * 0.03);
  ctx.strokeStyle = rgba(skin.rim, 0.2);
  ctx.lineWidth = Math.max(0.5, r * 0.02);
  ctx.stroke(veinPath);
  ctx.restore();

  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.15, x, y + r * 0.1, R);
  g.addColorStop(0, rgba(skin.flesh[0], 0.7));
  g.addColorStop(0.55, rgba(skin.flesh[1], 0.6));
  g.addColorStop(1, rgba(skin.flesh[2], 0.4));
  ctx.fillStyle = g;
  ctx.fill(swell);
  ctx.strokeStyle = rgba(skin.rim, 0.14);
  ctx.lineWidth = Math.max(0.8, r * 0.04);
  ctx.stroke(swell);
  // A shadow under its belly, so it has weight.
  const under = ctx.createLinearGradient(0, y, 0, y + R);
  under.addColorStop(0, rgba(skin.ground[3], 0));
  under.addColorStop(1, rgba(skin.ground[3], 0.5));
  ctx.fillStyle = under;
  ctx.fill(swell);
  // The wet shoulder.
  ctx.strokeStyle = rgba(skin.hull.edge, 0.3);
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.lineCap = "round";
  ctx.stroke(bedFor(x, y, r, o).shoulder);
  // The crease where the button sinks into the flesh.
  const crease = ctx.createRadialGradient(x, y, r * 0.92, x, y, r * 1.28);
  crease.addColorStop(0, rgba(skin.ground[3], 0.7));
  crease.addColorStop(0.5, rgba(skin.ground[3], 0.3));
  crease.addColorStop(1, rgba(skin.ground[3], 0));
  ctx.fillStyle = crease;
  ctx.fillRect(x - r * 1.4, y - r * 1.4, r * 2.8, r * 2.8);
}

/** Over the face: one wet arc up and to the side, and the fine lit lip where
 * flesh meets button. The arc is the bed's, so it is held with the bed. */
export function organGloss(d: LobeDraw, o: OrganLook): void {
  const { ctx, x, y, r, skin } = d;
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.rim, 0.36);
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.stroke(bedFor(x, y, r, o).gloss);
  ctx.strokeStyle = rgba(skin.flesh[0], 0.3);
  ctx.lineWidth = Math.max(0.6, r * 0.03);
  ctx.beginPath();
  ctx.arc(x, y, r * 1.02, 0, Math.PI * 2);
  ctx.stroke();
}

export interface OrganLife {
  /** Breaths a second. */
  readonly beat: number;
  /** Droplets welling out of each swelling. */
  readonly drops: number;
  /** How many bodies walk each cord. */
  readonly beads: number;
}

/** The living half: the breath in every swelling, the droplets leaving it,
 * and the beaded cords running up (`cord.ts`). */
export function organLife(d: NerveDraw, o: OrganLife): void {
  const { ctx, time, skin } = d;
  for (const [i, lobe] of d.lobes.entries()) {
    const { x, y, r } = lobe.circle;
    const breath = Math.max(0, Math.sin(time * Math.PI * 2 * o.beat + i * 1.7)) ** 3;
    halo(ctx, x, y + r * 0.2, Math.round((r * 2.6) / 4) * 4, skin.tint, 0.05 + 0.12 * breath);
    for (let k = 0; k < o.drops; k++) {
      const ph = (time * 0.3 + k / o.drops + hash01(i * 7 + k)) % 1;
      const dx = x + (hash01(i * 3 + k * 5) - 0.5) * r * 1.5;
      const dy = y + r * 1.25 + ph * r * 1.7;
      const rr = r * 0.09 * (1 - ph * 0.5);
      halo(ctx, dx, dy, Math.round((rr * 4) / 2) * 2, skin.tint, (1 - ph) * 0.35);
      ctx.fillStyle = rgba(skin.rim, (1 - ph) * 0.75);
      ctx.beginPath();
      ctx.ellipse(dx, dy, rr, rr * 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  beadedCords(d, o.beads);
}
