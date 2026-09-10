import { surfaceDim, surfaceLit } from "@neon-spore/content";
import { gradientSlot, slotGradient } from "./gradient-slot.js";
import type { HullLit } from "./hull-light.js";

/**
 * THE SHIP LIT BY ITS OWN NORMAL, instead of by a straight ramp across its box.
 *
 * `litBox` walks the key ramp along a line from one corner of the hull's
 * rectangle to the other. That is the right light for a flat panel, and the
 * hull is a membrane bulging toward the viewer, so what that pass gave it was a
 * wash with a direction rather than a surface with a shape. The owner took
 * BARREL out of VERSUS on 9 September 2026, beside the ridged hull it answers:
 * the falloff across the field is `surfaceLit` read at the longitude the
 * membrane is actually pointing in, which is a cosine with a terminator in it,
 * and the crown of every lobe takes more light than the troughs beside it
 * because it is higher.
 *
 * **It costs one stroke more than the pass it replaced and no arithmetic per
 * frame.** All three gradients are built from layout numbers alone and held in
 * slots keyed on them, the way `key-light.ts`'s `litSpan` holds its own — so a
 * hull that breathes by a pixel keeps hitting the same three objects, and the
 * per-frame work is two fills and a stroke.
 *
 * **What to watch for, because it is the risk this look was adopted knowing.**
 * A cosine that reaches its terminator inside the field is exactly what makes a
 * barrel read as a barrel, and the field is also where eleven columns of
 * ammunition have to be told apart by colour at 26 px. `FLOOR` is the whole of
 * the defence and it is one number: if the right-hand columns ever read more
 * slowly than the left, that number is where to look, not the arc.
 */

/**
 * How far round the barrel the field reaches, each way from the middle.
 *
 * 1.15 rad is 66°, which puts the terminator at about three quarters of the way
 * across and leaves the last columns in the turn rather than past it. Wider and
 * the right edge is behind the limb, which on a ship the pair reads columns
 * against is not a look but a defect.
 */
const ARC = 1.15;

/**
 * What is left of the light where the surface has turned fully away. The hull
 * is a translucent membrane over a lit interior, not a rock, so it never
 * reaches nothing — and `innerLight` and `bloom` are painting under this.
 */
const FLOOR = 0.28;

/** How many stops the arc is sampled at. Nine, for `docs/style-guide.md`'s
 * reason: three make a ramp and a ramp reads as a gradient. */
const STOPS = 9;

/** How much black the darkest end takes, and how much light the brightest. */
const SHADE = 0.42;
const LIFT = 0.2;

/** The crown: how much brighter the membrane is where it rises toward the
 * light, and how wide the stroke that carries it is. A stroke of the contour
 * rather than a band across the box, so a lobe's own top is what brightens —
 * the mistake `sheen.ts`'s header describes is a straight lower edge. */
const CROWN = 0.26;
const CROWN_WIDTH = 30;

/** One slot per gradient. Three call sites, three slots: sharing one between
 * two different gradients thrashes it every frame, which is worse than never
 * caching at all (`gradient-slot.ts`). */
const SHADE_SLOT = gradientSlot<CanvasGradient>();
const LIFT_SLOT = gradientSlot<CanvasGradient>();
const CROWN_SLOT = gradientSlot<CanvasGradient>();

/** The lambert along the barrel at `u`, 0 at the left edge and 1 at the right,
 * floored so the far columns keep a membrane under them. */
function alongArc(u: number): number {
  const lon = -ARC + 2 * ARC * u;
  return surfaceDim(FLOOR, surfaceLit(1, 0, Math.sin(lon), Math.cos(lon)));
}

/**
 * The light **across** the ship, without the crown: the two horizontal passes
 * alone, over any region that is under the same light as the hull and is not
 * the hull.
 *
 * Split out of `barrel` on 10 September 2026 for the control panel. The owner
 * could still see where the ship ended and the panel began after every stroke
 * along the join had been removed and the two had been given the same colour,
 * and a column of pixels said why: the hull's belly reads `rgb(98,81,148)` at
 * the left of the screen and `rgb(40,24,70)` at the right — this pass — while
 * the chamber under it was one colour from edge to edge. Two surfaces lit by
 * different lights are two objects however well their edges meet. So the
 * chamber asks for the same light by calling this, with the same box, and the
 * two cannot disagree: same arc, same floor, same slots, one cache hit.
 *
 * The crown stays with `barrel`. It is stroked along the ship's own contour,
 * and a caller lighting the *inside* of the ship has no contour to crown and
 * must not be handed a bright line to draw along its roof.
 */
export function barrelAcross(
  ctx: CanvasRenderingContext2D,
  region: Path2D,
  x: number,
  w: number,
  half: HullLit["half"],
): void {
  // Quantised to eight pixels for `litBox`'s reason: a value that moves every
  // frame builds a gradient every frame.
  const q = 8;
  const box = `${Math.round(x / q)}|${Math.round(w / q)}`;
  const shade = slotGradient(ctx, SHADE_SLOT, box, () => {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    for (let i = 0; i < STOPS; i++) {
      const u = i / (STOPS - 1);
      g.addColorStop(u, `rgba(11,16,36,${((1 - alongArc(u)) * SHADE).toFixed(3)})`);
    }
    return g;
  });
  const lift = slotGradient(ctx, LIFT_SLOT, `${half}|${box}`, () => {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    for (let i = 0; i < STOPS; i++) {
      const u = i / (STOPS - 1);
      const k = alongArc(u);
      // Hue only where the hull is allowed it; the value half brightens
      // nothing (`LIGHT_HALF`).
      const warm = half === "value+hue" ? k * k * LIFT : 0;
      g.addColorStop(u, `rgba(255,246,228,${warm.toFixed(3)})`);
    }
    return g;
  });
  const prev = ctx.globalCompositeOperation;
  ctx.fillStyle = shade;
  ctx.fill(region);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = lift;
  ctx.fill(region);
  ctx.globalCompositeOperation = prev;
}

/**
 * The whole pass. The shape of it — a `source-over` fill of black and a
 * `lighter` fill of light — is `litBox`'s, because a canvas gradient carries
 * one ramp and the two halves cannot share one.
 */
export function barrel(ctx: CanvasRenderingContext2D, s: HullLit): void {
  barrelAcross(ctx, s.region, s.x, s.w, s.half);
  const q = 8;
  // The crown runs down the screen, and is stroked along the contour — so its
  // colour is read at whatever height the membrane has reached, and a lobe
  // rising into the top stop is a lobe catching the light.
  const crown = slotGradient(
    ctx,
    CROWN_SLOT,
    `${Math.round(s.y / q)}|${Math.round(s.h / q)}`,
    () => {
      const g = ctx.createLinearGradient(0, s.y, 0, s.y + s.h * 0.55);
      g.addColorStop(0, `rgba(255,246,228,${CROWN.toFixed(3)})`);
      g.addColorStop(0.35, `rgba(255,246,228,${(CROWN * 0.35).toFixed(3)})`);
      g.addColorStop(1, "rgba(255,246,228,0)");
      return g;
    },
  );

  const prev = ctx.globalCompositeOperation;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // The crown is clipped to the body so the half of a wide stroke that would
  // spill into space is cut away by the membrane rather than by a straight
  // line — `innerLight`'s rule, and the same reason.
  ctx.clip(s.region);
  ctx.strokeStyle = crown;
  ctx.lineWidth = CROWN_WIDTH;
  ctx.lineCap = "round";
  ctx.stroke(s.body);
  ctx.restore();
  ctx.globalCompositeOperation = prev;
}
