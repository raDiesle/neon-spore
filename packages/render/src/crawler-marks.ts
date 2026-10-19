import { type Creature, linkIsSucked, linkOrder, type World } from "@neon-spore/sim";
import { emblem } from "./action-face.js";
import { emberHues, paintEmberIn } from "./aim-ember.js";
import { linkCenter, linkScale } from "./crawler-place.js";
import { cueBreath } from "./cue-helper.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **What each ring of THE CRAWLER is owed, said round the ring itself.**
 *
 * The worm is the one body in the game whose answer changes link by link
 * along a single creature, and the pair has to agree an *order of work* on it
 * out loud while it walks (`sim/crawler.ts`). So every ring wears **EMBER**,
 * the crosshair a shot's target wears on a boss and the SHIELD and SUCK
 * buttons wear when they are wanted (`aim-ember.ts`), in the colour of the
 * control that takes it: red or cyan for a colour ring, the shield's for a
 * shield ring, the maw's amber for a suck ring.
 *
 * The owner, 19 October 2026: *draw the crosshair we use for bosses and
 * cannon around it, with related colour. remove the icons above. the
 * crosshairs are enough in the related colour.* The small dome and mouth that
 * stood over a ring are gone. Inside the crosshair of a ring the ship answers
 * is that button's own face instead — the shield's swelling or the maw's dent
 * with motes going in (`action-face.ts`) — as a boss's SHIELD step wears it.
 * It is drawn here, over every ring, and not on the ring: the ring in front
 * covers the middle of the one behind it.
 */

/** The target's radius EMBER is drawn round, as a share of a tile — about a
 * ring's height, so the circle stands just outside the body it marks. */
const TARGET = 0.28;
/** The button face inside the crosshair, in the same radius: as big as fits
 * inside the circle, which stands at 1.32 of it (`aim-ember.ts`). */
const FACE = 1.25;

/** The hues of the control that takes this ring. */
function ringHues(c: Creature): { hex: string; rim: string } {
  if (c.color !== null) return emberHues(c.color);
  if (linkIsSucked(c)) return { hex: PALETTE.pod, rim: PALETTE.podRim };
  return { hex: PALETTE.shield, rim: PALETTE.shieldRim };
}

/** One ring's crosshair, at the point and size the ring itself was drawn at. */
export function drawLinkMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  c: Creature,
  time: number,
  beatPhase: number,
  surfaceY?: SurfaceY,
): void {
  if (l.tile <= 0) return;
  // The same point the ring itself was drawn on, off the same sampler: a mark
  // placed on the flat hull line would stay put while the ring under it rode
  // over the cannon (`crawler-place.ts`).
  const { x, y } = linkCenter(l, c, beatPhase, surfaceY);
  const k = linkScale(world, l);
  // Each ring a little out of step with the next, so a worm's marks do not
  // wobble as one sheet.
  const t = time + linkOrder(c) * 0.37;
  const r = l.tile * TARGET * k;
  const hues = ringHues(c);
  paintEmberIn(ctx, x, y, r, cueBreath(t), t, hues);
  if (c.color !== null) return;
  emblem(ctx, x, y, r * FACE, hues.hex, linkIsSucked(c) ? "intake" : "guard");
}
