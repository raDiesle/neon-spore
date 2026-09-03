import { gyreSucked, type World } from "@neon-spore/sim";
import { gyreRadiusPx, gyres } from "./gyre.js";
import { gyreCenter } from "./gyre-place.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The wind between a wheel and the ship: THE GYRE's coupling, drawn.
 *
 * **It is an indication of wind and not a line of sight.** The maw pulls on the
 * air in front of the ship, not up a column — `gyreSucked` asks nothing about
 * where the cannon is standing — so the stream is drawn from the wheel to
 * wherever player 1 happens to be, at whatever angle that turns out to be, and
 * it leans further the further apart the two are. Anything that only appeared
 * when the cannon lined up would be teaching the pair a rule the simulation does
 * not have, and they would spend the wave sliding into a column that buys them
 * nothing.
 *
 * **It comes round both flanks, and that is what says it is pulling on the whole
 * wheel.** A single stream falling out of the bottom of a wheel is a leak: it
 * says something is coming *off* the thing, at one point, and the pair reads it
 * as a body about to drop. Two streams that start above the wheel, wrap it down
 * either side and only then run to the mouth are a grip — the maw has hold of
 * the whole object and is dragging it round, which is exactly what the pull does
 * to the turn (`gyreSuckSpinMilli`) and nothing like what a leak does. They
 * spiral inward as they go, so the wrap tightens rather than orbiting.
 *
 * **And the ship's own half rises to meet them.** One current alone reads as an
 * effect happening to something. Two reaching for each other is a connection,
 * and the connection is the mechanic — the same argument `claspResonance` makes
 * for lighting both ends of the ward.
 *
 * **It is drawn whenever a wheel is up, faintly, and not only while the maw is
 * open.** The pull is the one answer this creature has, and a pair who have
 * never seen the wind will never think to reach for it; a stream that only
 * existed after the button was pressed would be feedback for a decision already
 * taken. So the idle state is a thin drift that says *there is something here to
 * pull on*, and the press turns it into weather.
 */

/** Motes down each flank. Enough to read as a current, few enough to stay out of
 * the way of the six bodies that are the thing to look at. */
const FLANK = 11;

/** Motes in the short one off the ship. Fewer on purpose: the ship's half of the
 * pull is the smaller half, and it is drawn as one. */
const RISERS = 5;

/** The share of a mote's journey spent wrapping the wheel, before it lets go of
 * the rim and runs for the mouth. Most of it: the wrap is the picture. */
const WRAP = 0.62;

/** Where a mote enters, as a share of the reach, and how far in the wrap has
 * drawn it by the time it reaches the foot of the wheel. */
const ENTRY = 1.14;
const DRAWN_IN = 0.2;

/** Seconds one mote takes to cross, at rest and under a pull. Faster is the
 * whole visible difference — a stream that only brightened would say the pull
 * was stronger, and what it actually does is move the air. */
const DRIFT_SECONDS = 2.6;
const PULL_SECONDS = 0.75;

/**
 * The wind for every wheel on the field. Drawn under the bodies, in the pass
 * that owns them, so a mote never crosses in front of a colour the pair is
 * reading off a rim.
 */
export function drawGyreWind(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  const live = gyres(world);
  if (live.length === 0) return;
  const pull = gyreSucked(world) ? 1 : 0;
  const seconds = pull > 0 ? PULL_SECONDS : DRIFT_SECONDS;
  // Wherever player 1 is holding the cannon, and nowhere else. The maw is on the
  // front of the ship, so the stream ends at the mouth rather than at the middle
  // of the hull — but it starts at whichever wheel is up, in whatever column
  // that is, which is the point.
  const shipX = tileCX(l, world.cannonCol);
  const shipY = l.hullY;
  const reach = gyreRadiusPx(l);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = pull > 0 ? PALETTE.shieldRim : PALETTE.shield;

  for (const c of live) {
    const { x, y } = gyreCenter(l, c, beatPhase);
    for (const side of [-1, 1]) {
      for (let k = 0; k < FLANK; k++) {
        // Each mote is the same journey at a different point along it. The phase
        // is the mote's index and the wall clock and nothing else — no state, so
        // a restart cannot carry a stream into the next run (`Effects.reset`).
        // Half a step out of phase on the far side, so the two flanks read as
        // one wrap rather than as a mirror.
        const t = (((time / seconds + (k + (side > 0 ? 0.5 : 0)) / FLANK) % 1) + 1) % 1;
        const at = wrapPoint(x, y, reach, side, t, shipX, shipY);
        // A mote fades in as it enters and out as it lands, so neither end of
        // the stream has a hard edge where things appear from nothing.
        ctx.globalAlpha = (pull > 0 ? 0.5 : 0.26) * Math.sin(t * Math.PI);
        const r = l.tile * (pull > 0 ? 0.045 : 0.038) * (0.6 + t * 0.8);
        ctx.beginPath();
        ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // The ship's own half, and it goes the other way: off the mouth, upward, and
  // it does not reach anything. It is a hand on a rope rather than a second
  // current — short, because the ship is not travelling and nothing it does
  // travels either (CLAUDE.md).
  for (let k = 0; k < RISERS; k++) {
    const t = (((time / seconds + k / RISERS) % 1) + 1) % 1;
    ctx.globalAlpha = (pull > 0 ? 0.42 : 0.22) * Math.sin(t * Math.PI);
    const r = l.tile * 0.035 * (1 - t * 0.5);
    ctx.beginPath();
    ctx.arc(shipX, shipY - l.tile * (0.2 + t * 1.1), r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Where one mote is: round the flank while it is wrapping, and out to the mouth
 * once it has let go. Two halves of one path rather than two effects, so the
 * hand-off is a mote carrying on rather than one vanishing and another starting.
 */
function wrapPoint(
  x: number,
  y: number,
  reach: number,
  side: number,
  t: number,
  shipX: number,
  shipY: number,
): { x: number; y: number } {
  // The foot of the wrap, where the flank lets go and the run begins. Computed
  // for both halves so the second starts exactly where the first ends.
  const footR = reach * (ENTRY - DRAWN_IN);
  const foot = { x, y: y + footR };
  if (t < WRAP) {
    const u = t / WRAP;
    // From the top of the wheel, down the near side, to the foot — a half turn,
    // tightening as it goes.
    const a = -Math.PI / 2 + side * Math.PI * u;
    const r = reach * (ENTRY - DRAWN_IN * u);
    return { x: x + Math.cos(a) * r, y: y + Math.sin(a) * r };
  }
  const v = (t - WRAP) / (1 - WRAP);
  // Sideways it eases rather than running straight, so the current bends toward
  // the mouth instead of pointing at it. `v * v` is the whole of that: it leaves
  // the wheel going down and arrives going across.
  return { x: foot.x + (shipX - foot.x) * v * v, y: foot.y + (shipY - foot.y) * v };
}
