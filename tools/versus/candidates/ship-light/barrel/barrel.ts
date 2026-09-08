import { surfaceDim, surfaceLit } from "../../../../../packages/content/src/surface.js";
import type { HullLit } from "../../../../../packages/render/src/hull-light.js";

/**
 * The ship lit by its own normal instead of by a straight ramp across its box.
 *
 * `litBox` walks the key ramp along a line from one corner of the hull's
 * rectangle to the other. That is the right light for a flat panel, and the
 * hull is a membrane bulging toward the viewer, so what the shipped pass gives
 * it is a wash with a direction rather than a surface with a shape. This is the
 * other answer: the falloff across the field is `surfaceLit` read at the
 * longitude the membrane is actually pointing in, which is a cosine with a
 * terminator in it, and the crown of every lobe takes more light than the
 * troughs beside it because it is higher.
 *
 * **It costs one stroke more than the shipped pass and no arithmetic per
 * frame.** Both gradients are built from layout numbers alone and held in a
 * slot keyed on them, the way `key-light.ts`'s `litSpan` holds its own — so a
 * hull that breathes by a pixel keeps hitting the same two objects, and the
 * per-frame work is two fills and a stroke.
 *
 * How it can lose. **The right-hand columns go quiet.** A cosine that reaches
 * its terminator inside the field is exactly what makes a barrel read as a
 * barrel, and the field is also where eleven columns of ammunition have to be
 * told apart by colour at 26 px. `FLOOR` is the whole of the defence and it is
 * one number; if the pair finds themselves reading the right-hand columns more
 * slowly than the left, that is this candidate and no tuning of it will make
 * the asymmetry go away, because the asymmetry *is* the claim.
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

interface Slot {
  key: string;
  ctx: CanvasRenderingContext2D;
  shade: CanvasGradient;
  lift: CanvasGradient;
  crown: CanvasGradient;
}
let slot: Slot | null = null;

/** The lambert along the barrel at `u`, 0 at the left edge and 1 at the right,
 * floored so the far columns keep a membrane under them. */
function alongArc(u: number): number {
  const lon = -ARC + 2 * ARC * u;
  return surfaceDim(FLOOR, surfaceLit(1, 0, Math.sin(lon), Math.cos(lon)));
}

function build(ctx: CanvasRenderingContext2D, s: HullLit): Slot {
  const shade = ctx.createLinearGradient(s.x, 0, s.x + s.w, 0);
  const lift = ctx.createLinearGradient(s.x, 0, s.x + s.w, 0);
  for (let i = 0; i < STOPS; i++) {
    const u = i / (STOPS - 1);
    const k = alongArc(u);
    shade.addColorStop(u, `rgba(11,16,36,${((1 - k) * SHADE).toFixed(3)})`);
    // Hue only where the hull is allowed it; the value half brightens nothing.
    const warm = s.half === "value+hue" ? k * k * LIFT : 0;
    lift.addColorStop(u, `rgba(255,246,228,${warm.toFixed(3)})`);
  }
  // The crown runs down the screen, and is stroked along the contour — so its
  // colour is read at whatever height the membrane has reached, and a lobe
  // rising into the top stop is a lobe catching the light.
  const crown = ctx.createLinearGradient(0, s.y, 0, s.y + s.h * 0.55);
  crown.addColorStop(0, `rgba(255,246,228,${CROWN.toFixed(3)})`);
  crown.addColorStop(0.35, `rgba(255,246,228,${(CROWN * 0.35).toFixed(3)})`);
  crown.addColorStop(1, "rgba(255,246,228,0)");
  return { key: "", ctx, shade, lift, crown };
}

/** The whole pass. The shape of it — a `source-over` fill of black and a
 * `lighter` fill of light — is `litBox`'s, because a canvas gradient carries
 * one ramp and the two halves cannot share one. */
export function barrel(ctx: CanvasRenderingContext2D, s: HullLit): void {
  // Quantised to eight pixels for `litBox`'s reason: a value that moves every
  // frame builds a gradient every frame.
  const q = 8;
  const key = `${s.half}|${Math.round(s.x / q)}|${Math.round(s.y / q)}|${Math.round(s.w / q)}|${Math.round(s.h / q)}`;
  if (!slot || slot.key !== key || slot.ctx !== ctx) {
    slot = build(ctx, s);
    slot.key = key;
  }
  const prev = ctx.globalCompositeOperation;
  ctx.save();
  ctx.fillStyle = slot.shade;
  ctx.fill(s.region);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = slot.lift;
  ctx.fill(s.region);
  // The crown is clipped to the body so the half of a wide stroke that would
  // spill into space is cut away by the membrane rather than by a straight
  // line — `innerLight`'s rule, and the same reason.
  ctx.clip(s.region);
  ctx.strokeStyle = slot.crown;
  ctx.lineWidth = CROWN_WIDTH;
  ctx.lineCap = "round";
  ctx.stroke(s.body);
  ctx.restore();
  ctx.globalCompositeOperation = prev;
}
