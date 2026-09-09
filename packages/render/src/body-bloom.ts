import { facet, type Pin, pin, surfaceDim } from "@neon-spore/content";
import type { Interior } from "./body-interior.js";
import { mixHex } from "./hex.js";

/**
 * THE SLICK's interior — a nucleus that sends something out along its veins.
 *
 * It was `creature:slick` / `bloom` on the ALTERNATIVES page, offered against
 * two dots, and the owner took it into the game on 9 September 2026. Four other
 * answers stood beside it — sediment, roe, a gut and a lattice — and every one
 * of them is on the SHAPES tab's FILLING axis now, which is where a way of
 * filling a body is browsed rather than voted on.
 *
 * Those four were all *structure*: what the body is made of and how it is put
 * together. This one is about **state**, which is why it is the one on the
 * field. Nine veins
 * run out from a core in each sac, and a bright travels along them, out from
 * the middle and away, over and over. A slick on the field stops being an
 * object and starts being a thing that is doing something.
 *
 * **The travelling light is a share of the vein's own length**, so it
 * foreshortens with the vein: a vein pointing away is short, and the bright on
 * it moves a short distance. That is what keeps it from reading as a marquee.
 *
 * **The pulse is on the contour clock**, which is deterministic per body id, so
 * two devices flash the same creature at the same moment. A wall clock here
 * would be a body that pulsed differently on the two phones, which is exactly
 * the class of thing the pair would talk about and be wrong about.
 *
 * **What to watch for, because the candidate's own card named it.** A creature
 * that pulses is a creature that looks shootable at a particular moment.
 * Everything else that flashes in this game is a cue — a charge landing, a
 * guard lapsing, a tap counting — and a body flickering for no reason at all is
 * a pair waiting for a window that does not exist. That is a rule question
 * rather than a taste one, and it is the reason to watch this on a wave.
 *
 * ## Thirty-eight ops became eight, and that is why it could ship
 *
 * As a candidate this drew each of its eighteen veins and eighteen beads with
 * its own `strokeStyle` and its own `stroke`, which is fine in a tool showing
 * one body and is not fine on a wave. `frame-budget.test.ts` said so
 * immediately: the busy scene's stroke count went up by forty on the seat that
 * draws slicks.
 *
 * The fix is `eye-iris.ts`'s, which makes the same argument about an aperture
 * ring and six spokes: **one path and one stroke, not nine.** The only thing
 * that differs between two veins is how much light theirs takes, so the light
 * is quantised into `LEVELS` steps and every vein at a step goes into one
 * subpath stroked once. Beads the same. Two cores are one path with two arcs.
 * A step is coarse enough to batch and fine enough that nobody can see the
 * banding at the size a slick is drawn — and `mixHex` is now called four times
 * a body instead of thirty-six.
 */

const SACS = [-0.42, 0.42];
const VEINS = 9;

/**
 * How many brightness steps the veins and beads are batched into.
 *
 * The one number this optimisation costs. Four is where the banding stops being
 * visible on a body twenty-six pixels wide: the range being divided is
 * `surfaceDim(DIM, lit)`, which spans 0.24 to 1, so a step is about a fifth of
 * the way from the dimmest vein to the brightest.
 */
const LEVELS = 4;
/** How long the travelling bright is, as a share of a vein, and how fast it goes. */
const BEAD = 0.3;
const RATE = 1.1;
const SPIN = 0.35;
const DIM = 0.24;
const REACH = 0.56;
/** How thick a vein is against the reach, and how much brighter the bead is. */
const VEIN = 0.1;
const BEAD_LIFT = 0.9;

const PINS: Pin[] = [];
for (let i = 0; i < VEINS; i++) {
  const lon = i * 2.39;
  const lat = ((i / (VEINS - 1)) * 2 - 1) * 0.75;
  PINS.push(pin(lon, lat, 1));
}

/** One straight mark, in the body's own frame. Held rather than drawn so every
 * mark at one brightness can go into one subpath. */
type Bar = readonly [x1: number, y1: number, x2: number, y2: number];

/** The bars at each brightness step, reused every frame — an array of arrays
 * allocated per body per frame is the other way this gets expensive. */
const veinBars: Bar[][] = Array.from({ length: LEVELS }, () => []);
const beadBars: Bar[][] = Array.from({ length: LEVELS }, () => []);

/** Which step a brightness falls in, and what brightness that step stands for. */
function step(lit: number): number {
  return Math.min(LEVELS - 1, Math.max(0, Math.round(lit * (LEVELS - 1))));
}

/** Every bar at one step, as one subpath stroked once. */
function strokeStep(ctx: CanvasRenderingContext2D, bars: readonly Bar[], colour: string): void {
  if (bars.length === 0) return;
  ctx.strokeStyle = colour;
  ctx.beginPath();
  for (const [x1, y1, x2, y2] of bars) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.stroke();
}

export function bloom(ctx: CanvasRenderingContext2D, p: Interior): void {
  const theta = p.t * SPIN;
  const reach = p.ry * REACH;
  const vein = mixHex(p.hex, p.rim, 0.35);

  for (const bars of veinBars) bars.length = 0;
  for (const bars of beadBars) bars.length = 0;

  // Where every mark goes, sorted into brightness steps as it is worked out.
  // Nothing is drawn in this loop: two veins at the same step are one stroke,
  // and finding that out costs a `push`.
  for (const side of SACS) {
    const cx = p.rx * side;
    for (const [i, q] of PINS.entries()) {
      const f = facet(q, theta + side);
      if (!f.near) continue;
      const tipX = cx + f.x * reach;
      const tipY = f.y * reach;
      const k = step(surfaceDim(DIM, f.lit));
      veinBars[k]?.push([cx, 0, tipX, tipY]);

      // Where the bright is on this vein right now. Each vein is offset so the
      // body flickers rather than beating as one, which is what makes it read
      // as alive rather than as a light being switched.
      const s = (p.t * RATE + i * 0.19) % 1;
      const a = Math.max(0, s - BEAD);
      beadBars[k]?.push([cx + (tipX - cx) * a, tipY * a, cx + (tipX - cx) * s, tipY * s]);
    }
  }

  ctx.save();
  ctx.rotate(-p.rot);
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(0.5, reach * VEIN);
  for (let k = 0; k < LEVELS; k++) {
    const lit = k / (LEVELS - 1);
    strokeStep(ctx, veinBars[k] ?? [], mixHex(p.hex, vein, lit));
  }
  for (let k = 0; k < LEVELS; k++) {
    const lit = k / (LEVELS - 1);
    strokeStep(ctx, beadBars[k] ?? [], mixHex(vein, p.rim, BEAD_LIFT * lit));
  }

  // Both cores in one path: they are the same colour and the same size, and a
  // fill apiece was one op spent on saying so twice.
  ctx.fillStyle = p.rim;
  ctx.beginPath();
  for (const side of SACS) {
    const cx = p.rx * side;
    ctx.moveTo(cx + Math.max(0.5, reach * 0.16), 0);
    ctx.arc(cx, 0, Math.max(0.5, reach * 0.16), 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.restore();
}
