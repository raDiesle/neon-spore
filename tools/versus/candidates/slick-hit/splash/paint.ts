import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import type { Strike } from "../../../../../packages/render/src/body-hit.js";
import { mixHex } from "../../../../../packages/render/src/hex.js";

/**
 * SPLASH — the sac was full of liquid, and the shot lets it out.
 *
 * A slick is the wettest word in the game and its kill has never been wet.
 * This is the shot going into a bag of fluid from below: on the beat the
 * contour blows out into a **crown** — a ring of the body's red rising and
 * widening, its rim broken into a dozen droplets that leave the ring upward
 * and outward and then fall, each one an elongated drop in the body's colour
 * with a bright point on its top where the key catches it. What is left is
 * the fluid itself: every drop that lands on the ship's skin joins a puddle
 * there, a wet ellipse in the body's red that spreads as the drops arrive and
 * then dries away, so for a moment the hull under the column is wet with what
 * the slick was.
 *
 * The crown and the drops and the puddle are one colour, the body's, which
 * is the shot's. Its highlight is the rim colour and nothing whiter.
 *
 * **How it can lose.** *A crown is a second body.* For the first quarter of
 * the strike the ring is the size of the slick and roughly where it was, and
 * if the pair reads it as the slick still standing there, the shot has not
 * visibly landed. The ring has to be *open* — a hoop, not a fill — and it
 * has to be gone by the time the drops are falling. Judge it at 26 px on
 * whether the lane reads as cleared on the beat.
 */

const DROPS = 12;
/** How high the crown rises before it lets go, as a share of the body. */
const RISE = 1.1;
/** The crown is gone by this share of the strike. */
const CROWN_UNTIL = 0.3;
/** Drops fall under this many tiles per second per second — heavier than the
 * pieces (`BREAK_LOOK.gravityTiles`), because fluid falls faster than skin
 * and the puddle has to be there before the strike is over. */
const GRAVITY = 26;
/** How fast a drop leaves, sideways and up, in tiles per second. */
const THROW = 2.6;
const LOFT = 2.2;

export function splash(ctx: CanvasRenderingContext2D, s: Strike): void {
  const k = Math.min(1, s.age / s.life);
  const r = Math.max(s.rx, s.ry);

  // The crown: a hoop of fluid, rising and widening, then letting go.
  if (k < CROWN_UNTIL) {
    const c = k / CROWN_UNTIL;
    const up = -r * RISE * c;
    const wide = s.rx * (1 + 1.2 * c);
    const thick = Math.max(1, r * 0.34 * (1 - c));
    ctx.globalAlpha = 1 - c * c;
    ctx.lineWidth = thick;
    ctx.strokeStyle = s.hex;
    ctx.beginPath();
    ctx.ellipse(0, up * 0.5, wide, Math.max(1, s.ry * 0.5 * (1 - 0.5 * c)), 0, 0, Math.PI * 2);
    ctx.stroke();
    // The rim of the crown, brighter, where the drops are about to leave.
    ctx.lineWidth = Math.max(0.5, thick * 0.4);
    ctx.strokeStyle = s.rim;
    ctx.beginPath();
    ctx.ellipse(0, up, wide * 0.9, Math.max(1, s.ry * 0.35), 0, Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  // The drops: thrown up and out off the crown's rim, then falling to the
  // ship. Each is its own parabola, seeded so both phones throw the same.
  const t = s.age;
  let landed = 0;
  ctx.fillStyle = s.hex;
  for (let i = 0; i < DROPS; i++) {
    const side = ((i % 2) * 2 - 1) * (0.3 + hash01(s.seed + i) * 0.7);
    const vx = side * THROW * s.tile;
    const vy = -(0.4 + hash01(s.seed + 40 + i) * 1) * LOFT * s.tile;
    const g = GRAVITY * s.tile;
    // Off the crown's rim, not the centre.
    const x = side * s.rx * 0.8 + vx * t;
    const y = -s.ry * 0.6 + vy * t + 0.5 * g * t * t;
    if (y >= s.floor) {
      landed++;
      continue;
    }
    // An elongated drop, pointing the way it is going.
    const vyNow = vy + g * t;
    const ang = Math.atan2(vyNow, vx);
    const size = Math.max(1, r * (0.16 + hash01(s.seed + 80 + i) * 0.12));
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.globalAlpha = 1;
    ctx.fillStyle = s.hex;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.8, size, 0, 0, Math.PI * 2);
    ctx.fill();
    // The point of light on top of each drop.
    ctx.fillStyle = s.rim;
    ctx.beginPath();
    ctx.arc(-size * 0.4, -size * 0.35, Math.max(0.5, size * 0.35), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // The puddle: what has landed, spreading on the skin line and drying away.
  const wet = landed / DROPS;
  if (wet > 0) {
    const dry = 1 - Math.max(0, (k - 0.55) / 0.45);
    // Sitting on the skin rather than centred on it: the hull is drawn over
    // this, so a puddle centred on the line would show only its top edge.
    const py = s.floor - s.ry * 0.2;
    ctx.globalAlpha = 0.8 * dry;
    ctx.fillStyle = mixHex(s.hex, s.dark, 0.25);
    ctx.beginPath();
    ctx.ellipse(0, py, s.rx * (0.6 + 1.8 * wet), Math.max(1, s.ry * 0.38), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.5 * dry;
    ctx.fillStyle = s.rim;
    ctx.beginPath();
    ctx.ellipse(
      -s.rx * 0.3,
      py - s.ry * 0.15,
      s.rx * 0.4 * wet,
      Math.max(0.5, s.ry * 0.08),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
