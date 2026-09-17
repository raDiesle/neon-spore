import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { sinHash } from "../../../../../packages/render/src/hash.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import type { LostPaint } from "../../../../../packages/render/src/lost-look.js";
import { plates, wordsAt } from "../../../../../packages/render/src/lost-shutters.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * The ship bleeding out of the hole, in every direction, in red.
 *
 * The shipped fluid falls: thirteen violet rivulets from the top edge to the
 * foot, the same picture whatever happened and wherever it happened
 * (`lost-blood.ts`). This runs the other way round. There is one source — the
 * hole — and everything on the screen comes *out of* it, so the picture says
 * where the wave was lost before a word of type has landed.
 */

/** How many arms leave the wound. */
const ARMS = 17;
/** Seconds the slowest arm takes to run out. */
const RUN = 2.6;
/** The widest an arm is, at the wound, as a share of a tile. */
const THICK = 0.62;
/** How far an arm curls off its own bearing by the time it is spent, radians. */
const CURL = 0.7;
/**
 * How far an arm sags under its own weight by its far end, in tiles.
 *
 * Large on purpose, and it is the whole difference between a liquid and a
 * light. The first cut of this drew thirteen straight cones out of one bright
 * point and read as a firework — which is the way this candidate's own file
 * says it can lose, and it lost that way at the first look. Thrown fluid
 * leaves fast, goes over and comes down; a ray does not.
 */
const SAG = 5;
/** How far an arm wanders across its own bearing on the way out, in tiles. */
const WOBBLE = 1.4;
/** How much of the diagonal the longest arm covers. A star that reaches every
 * corner is a shape with a centre; one that stops is a spray. */
const REACH = 0.52;
/** The pulse: how many times a second the pressure comes round again. */
const BEATS = 1.4;

const HUE = PALETTE.red;
const RIM = PALETTE.redRim;
/** What an arm itself is: the hue lifted toward its rim so it stands off the
 * wash of the same colour behind it. */
const WET = mixHex(PALETTE.red, PALETTE.redRim, 0.34);
/** The wound's own light, one radius for all of it, so one sprite is baked. */
const CORE = 34;

/** Where it is coming out of — the hole, or the middle of the hull when a
 * wall earthed through the dome and left no mark (`breachUnscarred`). */
function source(p: LostPaint): { x: number; y: number } {
  const x = p.breachX ?? p.l.width / 2;
  return { x, y: p.surfaceY(x) };
}

/** One arm's bearing and reach at `age`, from its index alone — no state, so
 * the screen drawn twice on one tick is the same screen (`restart.test.ts`). */
function arm(i: number, age: number, far: number) {
  const bearing = (i / ARMS) * Math.PI * 2 + sinHash(i, 1) * 0.42;
  const speed = 0.55 + sinHash(i, 2) * 0.9;
  const reach =
    far * REACH * (0.45 + sinHash(i, 3) * 0.75) * smoothstep(Math.min(1, (age * speed) / RUN));
  const width = THICK * (0.45 + sinHash(i, 4) * 0.75);
  return { bearing, reach, width };
}

/**
 * A point along one arm, `t` of the way out.
 *
 * Three things happen to it on the way: it curls off its bearing, it wobbles
 * across itself, and it falls. The fall is squared in `t`, so the arm leaves
 * the hull on the line it was thrown along and is coming down by the end of
 * itself — the arc `shatter-fall.ts` gives a piece of a body, in closed form
 * and for the same reason.
 */
function along(i: number, t: number, bearing: number, reach: number, tile: number) {
  const ang = bearing + Math.sin(t * 2.4 + i * 1.7) * CURL * t;
  const off = Math.sin(t * 6.3 + i * 2.9) * WOBBLE * tile * t;
  return {
    x: Math.cos(ang) * reach * t - Math.sin(ang) * off,
    y: Math.sin(ang) * reach * t + Math.cos(ang) * off + t * t * SAG * tile,
    ang,
  };
}

/**
 * How thick an arm is at `t`, half-width in pixels.
 *
 * Squared rather than linear, so it is a gash at the hull and a thread for
 * most of its length — a cone that narrows evenly is a beam of light, which is
 * what the first cut of this drew. The ripple on top of it is what stops the
 * edges being two clean curves.
 */
function gauge(i: number, t: number, width: number, tile: number): number {
  const taper = (1 - t) ** 1.5;
  return width * tile * taper * (0.75 + Math.sin(t * 9.1 + i * 3.3) * 0.25);
}

/**
 * The stain, the arms and the wound, over whatever was drawn before them.
 *
 * **The whole screen goes red, and the hole stays the brightest thing on it.**
 * `lost-look.ts`'s one rule is that the pair can still see where it got
 * through, and a treatment that radiates *from* that place obeys the rule by
 * construction — the arms are arrows back to the hull, and the further from
 * the breach a pixel is the less of this there is on it.
 */
export function bleedoutVeil(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  plates(ctx, p);

  const { x: sx, y: sy } = source(p);
  const far = Math.hypot(p.l.width, p.l.height);
  // The pressure behind it, and the one clock everything here shares: the arms
  // do not each pulse on their own, because thirteen hearts is a shimmer and
  // one is a body.
  const pump = 0.72 + 0.28 * Math.sin(p.age * BEATS * Math.PI * 2);
  const spread = smoothstep(Math.min(1, p.age / RUN));

  // The stain first: everything the arms have soaked into, as one wash that
  // grows out of the wound rather than as a fill over the whole screen. One
  // gradient a frame and no sprite, because its radius changes every frame and
  // a baked one would be a new sprite each time (`glow.ts`).
  const stain = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(1, far * spread));
  stain.addColorStop(0, rgba(HUE, 0.44));
  stain.addColorStop(0.22, rgba(HUE, 0.2));
  stain.addColorStop(0.6, rgba(HUE, 0.07));
  stain.addColorStop(1, rgba(HUE, 0));
  ctx.fillStyle = stain;
  ctx.fillRect(0, 0, p.l.width, p.l.height);

  ctx.save();
  ctx.translate(sx, sy);
  for (let i = 0; i < ARMS; i++) {
    const a = arm(i, p.age, far);
    if (a.reach <= p.l.tile * 0.2) continue;
    // A walked ribbon rather than a stroked line, so it can be a gash where it
    // leaves the hull and a thread where it is still going.
    ctx.beginPath();
    const steps = 10;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const q = along(i, t, a.bearing, a.reach, p.l.tile);
      const half = gauge(i, t, a.width, p.l.tile);
      ctx.lineTo(q.x - Math.sin(q.ang) * half, q.y + Math.cos(q.ang) * half);
    }
    for (let s = steps; s >= 0; s--) {
      const t = s / steps;
      const q = along(i, t, a.bearing, a.reach, p.l.tile);
      const half = gauge(i, t, a.width, p.l.tile);
      ctx.lineTo(q.x + Math.sin(q.ang) * half, q.y - Math.cos(q.ang) * half);
    }
    ctx.closePath();
    // Mixed toward the rim rather than the flat hue: an arm has to be read
    // *against* the wash it is soaking into, and the two the same colour is
    // one colour with a shape somewhere in it.
    ctx.fillStyle = rgba(WET, 0.6 * pump);
    ctx.fill();

    // The head: the bead at the front of what is still coming out, and the
    // only part of an arm with a lit edge on it — the tell that reads as
    // liquid rather than as a beam (`lost-blood.ts` does the same).
    const head = along(i, 1, a.bearing, a.reach, p.l.tile);
    const bead = Math.max(1.5, a.width * p.l.tile * 0.62);
    ctx.beginPath();
    ctx.ellipse(head.x, head.y, bead, bead * 1.25, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(HUE, 0.66 * pump);
    ctx.fill();
    ctx.strokeStyle = rgba(RIM, 0.5 * pump);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.restore();

  // The wound itself, last and brightest, so the eye lands on the hull.
  halo(ctx, sx, sy, CORE, RIM, 0.5 * pump);
  halo(ctx, sx, sy, CORE, HUE, 0.7);

  sign(ctx, p);
}

/**
 * A dark band under the sign, across the top of the screen.
 *
 * `lost-blood.ts` argues against red in its own header, and the argument is a
 * good one: *red is what the bodies are and what WAVE LOST is already written
 * in, so a red running down behind red type is a screen with one colour on
 * it.* The owner asked for red anyway on 17 September 2026, so this is the
 * part of that objection that still has to be answered — the stamped words get
 * their plate back, dark, and read as type on metal rather than as type in a
 * wash. Below it the screen is as red as it likes.
 */
function sign(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  const foot = p.l.playHeight * 0.44;
  const g = ctx.createLinearGradient(0, 0, 0, foot);
  g.addColorStop(0, rgba(PALETTE.redDark, 0.88));
  g.addColorStop(0.7, rgba(PALETTE.redDark, 0.7));
  g.addColorStop(1, rgba(PALETTE.redDark, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, p.l.width, foot);
}

/** Lower down the plate, as the owner asked. Nothing else about them changes. */
export function bleedoutWords(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  wordsAt(ctx, p, 0.26);
}
