import { facet, LAT_LIMIT, pin, surfaceDim, surfaceLit } from "@neon-spore/content";
import type { ChoirDraw } from "./choir-look.js";
import { choirVoiceAt, VOICES } from "./choir-shape.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **The light THE CHOIR throws and the film it wears** — the surface half of
 * this creature, with nothing in it about the rule.
 *
 * Cut out of `choir.ts` the day the body got a record a candidate could patch,
 * along the seam that file already had: next door is *what the pair is doing*
 * — how far the gesture has got, which colour is arriving, how much of it has
 * — and this is *what that looks like*. `choir-shape.ts` is the third of the
 * three and holds where the two bodies stand.
 *
 * Nothing here knows what a world or a creature is. It takes a place, a
 * clock, how lit the pair is and the colour it is going, and it draws.
 */

/** Seconds for one turn of a voice about its own vertical axis.
 *
 * Six, which is a third of the way between the drift's five and the pair's own
 * twenty-three (`choir-shape.ts`) and prime against neither on purpose: it is
 * **this paint's number**, not a second copy of either of theirs. A voice
 * has to come all the way round inside the eight or nine seconds a membrane
 * spends falling, or the reveal is a claim nobody on the page ever sees. */
const SPIN_SECONDS = 6;

/** How many cells a voice's surface wears, and how far out of its centre they
 * sit. Six, and small: a membrane is one tile wide and each voice inside it is
 * under a fifth of one, so these are marks at two or three pixels and any more
 * of them is a texture rather than a surface. */
const CELLS = 6;
const REACH = 0.66;

/** What is left of a cell where the surface has turned away from the light.
 * Higher than a body's, because these are added light on a transparent film
 * rather than shading on a solid: a cell that vanished entirely would leave the
 * far half of a bubble with nothing on it at all. */
const CELL_FLOOR = 0.35;

/** How much of the rim's light survives on the shadow side. A soap film's rim
 * is bright the whole way round — that is what makes it read as a closed
 * surface — so this floor is high and the terminator is a lean rather than a
 * cut. */
const RIM_FLOOR = 0.45;

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const PINS = Array.from({ length: CELLS }, (_, i) =>
  pin(i * GOLDEN, Math.sin(i * 2.1) * LAT_LIMIT * 0.65, REACH),
);

/** How many stops the rim is walked in. Nine, for `docs/style-guide.md`'s
 * reason: three make a ramp and a ramp reads as a gradient. */
const STOPS = 9;

/**
 * One voice as a bubble: a rim that is bright where its surface faces the light
 * and dim where it turns away, a specular that stays put, and six cells riding
 * round on the inside of the film.
 */
function bubble(
  ctx: CanvasRenderingContext2D,
  v: { x: number; y: number; r: number },
  theta: number,
  tint: string,
  lit: number,
): void {
  // The rim, stop by stop rather than as one stroke. Each short arc takes the
  // lambert of the surface that is edge-on to us there, which is `surfaceLit`
  // read at that bearing — so the film is a closed surface with a lit side and
  // not a circle drawn in one colour.
  ctx.lineWidth = Math.max(0.8, v.r * 0.18);
  ctx.lineCap = "round";
  for (let i = 0; i < STOPS; i++) {
    const a0 = (i / STOPS) * Math.PI * 2;
    const a1 = ((i + 1) / STOPS) * Math.PI * 2;
    const mid = (a0 + a1) / 2;
    // At the limb the surface normal points straight out of the disc, so its
    // longitude is the bearing itself and its latitude is nought.
    const k = surfaceDim(RIM_FLOOR, surfaceLit(1, 0, Math.sin(mid), Math.cos(mid)));
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.r, a0, a1 + 0.02);
    ctx.strokeStyle = rgba(tint, 0.35 + 0.5 * k);
    ctx.stroke();
  }

  // The cells, placed and carried round. A cell going away narrows to nothing
  // at the limb instead of being clipped by it, which is the whole difference
  // between a surface and a sticker — and the far ones coming into view are the
  // reveal a pose cannot produce at any setting (`docs/dimensional.md`).
  for (const p of PINS) {
    const f = facet(p, theta);
    if (!f.near) continue;
    ctx.save();
    ctx.translate(v.x + f.x * v.r, v.y + f.y * v.r);
    ctx.scale(f.sx, f.sy);
    ctx.beginPath();
    ctx.arc(0, 0, v.r * 0.19, 0, Math.PI * 2);
    ctx.fillStyle = rgba(tint, (0.3 + lit * 0.3) * surfaceDim(CELL_FLOOR, f.lit));
    ctx.fill();
    ctx.restore();
  }

  // And the specular, upper left and stationary. It is the half of the pair
  // that no amount of turning can supply and the half without which all that
  // turning is a coin: `KEY` is a constant and never a parameter.
  ctx.beginPath();
  ctx.ellipse(v.x - v.r * 0.36, v.y - v.r * 0.36, v.r * 0.24, v.r * 0.17, -0.79, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.text, 0.42);
  ctx.fill();
}

/**
 * The whole pass: the two halos the film throws, two bubbles under them, and
 * the membrane's own rim over the top with no wash inside it.
 *
 * The skin was one translucent wash with a solid rim and nothing inside it, so
 * the two voices were implied by the waist in the outline and never drawn. The
 * owner took ORBS out of VERSUS on 9 September 2026 and this is it.
 *
 * **Every mark here is additive or a stroke, and nothing is a fill.** The
 * owner's instruction about this creature is that it hides nothing behind it —
 * the grid, the beat flash and anything falling read straight through — so a
 * shading pass that darkened the inside of a voice would be answering the wrong
 * question however round it made the body. Light is added where the surface
 * faces the light and simply not added where it does not, which is how a soap
 * bubble is lit, and is why this hides *less* than the wash it replaced.
 */
export function film(d: ChoirDraw): void {
  const { ctx, l, x, y, time, close, lit, tint, path } = d;
  const theta = (time / SPIN_SECONDS) * Math.PI * 2;

  for (let i = 0; i < VOICES; i++) {
    const v = choirVoiceAt(l, x, y, i, time, close);
    const beat = lit === 0 ? 0 : 0.85 + 0.15 * Math.sin(time * 7);
    halo(ctx, v.x, v.y, v.r * (1.9 + lit * 1.5), tint, (0.18 + lit * 0.5) * (beat || 1));
  }

  ctx.save();
  // Additive throughout, which is what keeps the promise: light is put on where
  // the surface takes it and nowhere else, so nothing behind a voice is ever
  // covered by one.
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < VOICES; i++) {
    bubble(ctx, choirVoiceAt(l, x, y, i, time, close), theta, tint, lit);
  }
  ctx.restore();

  // The membrane itself: the rim and nothing else. The wash is gone on purpose
  // — the two bubbles are what says there is something in there now, and a
  // translucent fill over them would be a second skin between the pair and the
  // thing this candidate exists to show.
  ctx.save();
  ctx.strokeStyle = tint;
  ctx.lineWidth = Math.max(1.4, l.tile * 0.055);
  ctx.stroke(path);
  ctx.restore();
}
