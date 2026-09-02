import { gyreSucked, type World } from "@neon-spore/sim";
import { gyreCenter, gyreRadiusPx, gyres } from "./gyre.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The wind between a wheel and the ship: THE GYRE's coupling, drawn.
 *
 * **It is an indication of wind and not a line of sight.** The maw pulls on
 * the air in front of the ship, not up a column — `gyreSucked` asks nothing
 * about where the cannon is standing — so the stream is drawn from the wheel
 * to wherever player 1 happens to be, at whatever angle that turns out to be,
 * and it leans further the further apart the two are. Anything that only
 * appeared when the cannon lined up would be teaching the pair a rule the
 * simulation does not have, and they would spend the wave sliding into a
 * column that buys them nothing.
 *
 * **Two streams, not one.** The long one falls from the wheel toward the ship,
 * which is the wheel being pulled apart; the short one rises off the muzzle,
 * which is the ship pulling. One alone reads as an effect happening to
 * something. Two reaching for each other is a connection, and the connection
 * is the mechanic — the same argument `claspResonance` makes for lighting both
 * ends of the ward.
 *
 * **It is drawn whenever a wheel is up, faintly, and not only while the maw is
 * open.** The pull is the one answer this creature has, and a pair who have
 * never seen the wind will never think to reach for it; a stream that only
 * existed after the button was pressed would be feedback for a decision
 * already taken. So the idle state is a thin drift that says *there is
 * something here to pull on*, and the press turns it into weather.
 */

/** Motes in the long stream. Enough to read as a current, few enough to stay
 * out of the way of the six bodies that are the thing to look at. */
const MOTES = 14;

/** Motes in the short one off the ship. Fewer on purpose: the ship's half of
 * the pull is the smaller half, and it is drawn as one. */
const RISERS = 5;

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
  // Wherever player 1 is holding the cannon, and nowhere else. The maw is on
  // the front of the ship, so the stream ends at the mouth rather than at the
  // middle of the hull — but it starts at whichever wheel is up, in whatever
  // column that is, which is the point.
  const shipX = tileCX(l, world.cannonCol);
  const shipY = l.hullY;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = pull > 0 ? PALETTE.shieldRim : PALETTE.shield;

  for (const c of live) {
    const { x, y } = gyreCenter(l, c, beatPhase);
    // From the bottom of the rim rather than from the hub: what the ship is
    // dragging at is the wheel's own edge, and a stream leaving the middle
    // would cross the two mounts standing below it on its way out.
    const fromY = y + gyreRadiusPx(l);
    for (let k = 0; k < MOTES; k++) {
      // Each mote is the same journey at a different point along it. The phase
      // is the mote's index and the wall clock and nothing else — no state, so
      // a restart cannot carry a stream into the next run (`Effects.reset`).
      const t = (((time / seconds + k / MOTES) % 1) + 1) % 1;
      const px = fromY + (shipY - fromY) * t;
      // Sideways it eases rather than running straight, so the current bends
      // toward the mouth instead of pointing at it. `t * t` is the whole of
      // that: it leaves the wheel going down and arrives going across.
      const py = x + (shipX - x) * t * t;
      // A mote fades in as it leaves and out as it lands, so neither end of
      // the stream has a hard edge where things appear from nothing.
      ctx.globalAlpha = (pull > 0 ? 0.5 : 0.28) * Math.sin(t * Math.PI);
      const r = l.tile * (pull > 0 ? 0.045 : 0.038) * (0.6 + t * 0.8);
      ctx.beginPath();
      ctx.arc(py, px, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // The ship's own half, and it goes the other way: off the mouth, upward,
  // and it does not reach anything. It is a hand on a rope rather than a
  // second current — short, because the ship is not travelling and nothing it
  // does travels either (CLAUDE.md).
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
