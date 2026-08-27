import { openSmoothPath, type Point } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * Laying the shot: `maw.ts` run backwards.
 *
 * Swallowing a pod is three movements — the inhale, the skin coming apart, the
 * flash. Laying is the last two of those with the direction reversed, and that
 * is deliberate rather than convenient: the ship has exactly one opening, and a
 * second visual vocabulary for it would teach the pair that the same hole means
 * two unrelated things. So the muzzle dilates, the membrane beside it parts
 * with the gaps travelling *outward* instead of inward, and something bright
 * grows behind the opening until it goes. A hen laying an egg, only alien.
 *
 * **It is a tell, and it belongs to the other player.** Player 1 has no fire
 * buttons; until now a press by player 2 reached him only as a bolt already
 * halfway up the field. This is the cannon visibly working before the shot
 * exists, in the one place he is already watching.
 *
 * **It says the moment and not the colour.** The colour is player 2's half of
 * the split (docs/spec/systems.md 5.1), and a wind-up that leaked it would
 * hand player 1 the one thing he is supposed to have to be told. So everything
 * here is drawn in the hull's own light: what it carries is *when*, which both
 * of them need, and nothing else.
 *
 * Nothing in this file outlives a frame — the whole picture is a function of
 * `chargeMilli`, which is the world's, to the tick, on both devices. There is
 * accordingly nothing for `Effects.reset()` to clear, the same way there is
 * nothing in `lance.ts` for it to clear.
 */

/** How far either side of the muzzle the skin parts, in tiles. A fifth of the
 * chew's reach: this is one bolt leaving, not a whole pod going through. */
const PART_TILES = 0.5;
/** Pieces the parted stretch is drawn in. Fewer reads as a dashed border. */
const PART_STEPS = 10;
/** Where the opening sits relative to the lobe's tip — `drawMuzzle`'s offset. */
const MOUTH_DROP = 0.12;

/**
 * @param lay 0..1, how close the shot is to leaving. `chargeMilli / 1000`.
 */
export function drawLay(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  lay: number,
  time: number,
  cannonX: number,
  tipY: number,
  surface: (x: number) => Point,
): void {
  if (lay <= 0.02) return;
  const mouthY = tipY + l.tile * MOUTH_DROP;

  // Behind the opening first, so the parting skin and the rim draw over it: a
  // bolt gathering *inside* the ship, not a light stuck on the outside of it.
  halo(ctx, cannonX, mouthY, l.tile * (0.12 + 0.3 * lay), PALETTE.hullRim, 0.2 + 0.6 * lay);

  partSkin(ctx, l, lay, time, cannonX, surface);

  // The opening itself, dilating. `drawMuzzle` has already filled it dark and
  // run the ship's own edge round it; this is that edge tightening and
  // brightening as the moment arrives, and it is the part that reads at arm's
  // length on a phone.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cannonX, mouthY, l.tile * (0.15 + 0.16 * lay), 0, Math.PI * 2);
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = 1.2 + 1.6 * lay;
  ctx.globalAlpha = 0.3 + 0.7 * lay;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
}

/**
 * The membrane on either side of the muzzle coming apart — `drawChew`'s
 * technique with two things changed. The gaps travel away from the mouth
 * rather than towards it (the sign on `i` in the phase), because something is
 * being pushed out and not drawn in; and it is the hull's own light rather
 * than the pod's amber, because nothing foreign is passing through.
 */
function partSkin(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  lay: number,
  time: number,
  cannonX: number,
  surface: (x: number) => Point,
): void {
  const half = l.tile * PART_TILES;
  const from = cannonX - half;
  const to = cannonX + half;

  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < PART_STEPS; i++) {
    if (Math.sin(time * 11 - i * 1.7) < -0.2) continue;
    const a = from + ((to - from) * i) / PART_STEPS;
    const b = from + ((to - from) * (i + 0.7)) / PART_STEPS;
    const pts: Point[] = [surface(a), surface((a + b) / 2), surface(b)];
    // Nearest the mouth is brightest, and the whole thing brightens as the
    // shot comes due — the seam opens rather than simply being open.
    const near = Math.max(0, 1 - Math.abs((a + b) / 2 - cannonX) / half);
    const heat = near * lay;
    ctx.globalAlpha = 0.2 + 0.8 * heat;
    strokeGlow(ctx, new Path2D(openSmoothPath(pts)), PALETTE.hullRim, 1.2 + 2.6 * heat, 0.8);
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
