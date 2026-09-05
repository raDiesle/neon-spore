import type { World } from "@neon-spore/sim";
import { drawBoss } from "./boss-draw.js";
import { drawBullets } from "./bullets.js";
import { drawCreatures } from "./creatures.js";
import { drawDartGuides } from "./dart-path.js";
import { drawDartQueries } from "./dart-query.js";
import type { Effects } from "./effects.js";
import { drawBackground, drawGrid, drawRadar } from "./field.js";
import { drawGhostRows } from "./ghost-row.js";
import { drawGhostTrails } from "./ghost-trail.js";
import { drawGrips } from "./grip.js";
import { drawGyres } from "./gyre.js";
import { drawGyreWind } from "./gyre-wind.js";
import { drawLanceMark } from "./lance.js";
import type { Layout } from "./layout.js";
import { drawLockMarks } from "./lock-mark.js";
import { drawLureAlarms } from "./lure-alarm.js";
import { drawPods } from "./pods.js";
import type { ViewState } from "./renderer.js";
import { seatSkin } from "./seat-skin.js";
import { drawShellArmour } from "./shell-draw.js";
import { drawShipAir } from "./ship-air.js";
import { drawStrands } from "./strand.js";
import { drawStrandArmour } from "./strand-armour.js";
import { drawVeerMarks } from "./veer-marks.js";
import { drawVeilMarks } from "./veil-marks.js";

/**
 * **The two passes that are about the field**: the empty board, and the bodies
 * standing on it.
 *
 * Cut out of `frame-passes.ts` when that file reached the 250-line ceiling —
 * THE LOCK's dotted line cost one parameter and four lines of comment, and
 * paying for them took two rounds of shaving sentences out of a comment
 * belonging to something else. The seam is the one the four passes already
 * read on: two of them draw the field and two draw the ship, and they share
 * nothing but their arguments. `frame-passes.ts` stays the barrel, so nothing
 * reaching for a pass through it had to move.
 */

/**
 * The empty field: fill, backdrop, radar and the grid the columns sit on.
 *
 * `grid` is `Effects.coordGrid.shown` — how far up the lettered lattice is.
 * It is threaded through rather than read here, because it is a fade and this
 * file draws, it does not remember (`coord-grid.ts`).
 */
export function drawFieldBack(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  flash: number,
  grid: number,
): void {
  // No flat fill here: drawBackground's radial gradient is opaque over the
  // same rect, so a fill under it never reaches the screen (canvas2d.ts's
  // own viewport fill covers the letterbox this pass does not reach).
  drawBackground(ctx, l, world.wave, view.time);
  // The seat's own colour in the water the ship sits in — over the backdrop
  // and under everything a player has to read (`ship-air.ts`).
  drawShipAir(ctx, l, view.time, seatSkin(view.role));
  drawRadar(ctx, l, world, view.time);
  drawGrid(ctx, l, world.cannonCol, flash, view.beatPhase, grid);
}

/** Everything that lives on the field between the two hulls. */
export function drawBodies(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  effects: Effects,
  /** Where the cannon lobe is *drawn*, in fractional columns — the eased one.
   * Only THE LOCK's line back to the muzzle wants it, and `lockLink` says why
   * it may not be `world.cannonCol`, which is the default here for a caller
   * with no pose to ease (`lock-mark.ts`). */
  cannonCol = world.cannonCol,
): void {
  // Under the creatures: the mark is on the column, not on anything in it.
  drawLanceMark(ctx, l, world);
  // The wind between every wheel and the mouth, under everything: it is the
  // one picture in the pass that must never cross in front of a colour, and
  // it reaches from the middle of the field down to the hull (`gyre-wind.ts`).
  drawGyreWind(ctx, l, world, view.beatPhase, view.time);
  // Then the wheels themselves, in one pass and behind their own bodies —
  // an armature five rows tall cannot take its turn inside a loop that
  // sorts body by body (`gyre.ts`).
  drawGyres(ctx, l, world, view.beatPhase, view.time);
  // And every thread, before the bodies for the same reason a wheel is: a
  // strand spans up to five columns and `byDepth` sorts body by body, so a
  // line taking its turn in that order would be over some of the beads it
  // joins and under the others (`strand.ts`). The mark on the bead that has to
  // be shot next rides with it, on player 2's screen only.
  drawStrands(ctx, l, world, view.beatPhase, view.time);
  // Where a ghost has just been, under every body on the field: a stamp drawn
  // over the slick in the next column would read as a body in front of it.
  drawGhostTrails(ctx, l, world, effects.ghostTrail, view.beatPhase, view.time);
  drawCreatures(ctx, l, world, view.beatPhase, view.time, effects.blocked);
  // Over the same bodies drawCreatures just drew, and nowhere else: the
  // plating recomputes fresh from world.creatures every frame (see
  // shell-draw.ts), so it belongs beside the pass that owns bodies, not
  // inside Effects with the transients.
  drawShellArmour(ctx, l, world, view.beatPhase, view.time);
  // And THE STRAND's, on the same terms and in the same place in the pass: a
  // second, harder border just outside the contour of every bead a shot cannot
  // answer this instant. Over the bodies rather than under them, because it is
  // an outline laid on the body's own and one drawn underneath comes back out
  // through the glow passes as a smudge (`strand-armour.ts`).
  drawStrandArmour(ctx, l, world, view.beatPhase, view.time);
  // Player 2's alarm, over the body it is about and on that device only. It is
  // the single difference between the two screens in this whole pass, and it
  // is drawn after the bodies rather than as part of them so that nothing in
  // `drawCreatures` ever has to know which seat it is running on.
  drawLureAlarms(ctx, l, world, view.beatPhase, view.time, view.bare);
  // Player 2's other half-picture, on the same terms and for the same reason:
  // the arrow, the dotted legs and the placeholder say where a dart is going
  // and where it goes after that, and player 1 — who holds the cannon that has
  // to be standing there — is shown none of it.
  drawDartGuides(ctx, l, world, view.beatPhase, view.time);
  // And the other half of that same creature, on the other device: two arrows
  // a target lock around the body, which is the pilot being told that this
  // column is not one they can read — only one they can be told.
  drawDartQueries(ctx, l, world, view.beatPhase, view.time);
  // THE VEER's, which is the same pair of half-pictures with the seats the
  // other way round: the arrow on the pilot's screen, the two dim ones and the
  // lock on the navigator's. One call rather than two, because a rock has one
  // fact to hide and it is a side (`veer-marks.ts`).
  drawVeerMarks(ctx, l, world, view.beatPhase, view.time);
  // The third half-picture, and the first that is *both* screens carrying one
  // each rather than one screen carrying something the other has not got: a
  // draining clock over every cloud on player 1's, a target lock on player
  // 2's. `veil-marks.ts` owns which is which, so nothing in `drawCreatures`
  // has to know what seat it is running on.
  drawVeilMarks(ctx, l, world, view.beatPhase, view.time);
  // And the fourth, which is the only one that stands in for a body rather
  // than describing one: a band across the row a ghost is in, on the screen
  // that is not drawn the ghost. Under everything the ship does and over the
  // grid, so the pilot reads it as a row of the field.
  drawGhostRows(ctx, l, world, view.beatPhase, view.time);
  // Over the creatures, under everything the ship does: a hand on something
  // is not an effect this file owns — it is world state, read fresh.
  drawGrips(ctx, l, world, view.beatPhase, view.time);
  // And, over the hand, the frame that says the cannon has this one. After the
  // grips rather than inside them: a body can be held without being locked —
  // a rock is, and that is what the grip was built for — so the ring and the
  // frame are two statements and only one of them is about a shot
  // (`lock-mark.ts`).
  drawLockMarks(ctx, l, world, cannonCol, view.beatPhase, view.time);
  drawBoss(ctx, l, view, effects);
  drawPods(ctx, l, world.pods, view.time);
  drawBullets(ctx, l, world.bullets);
  // Last of the pass, and over every body in it. The world goes in for the
  // ward's bolts and the shell they take off a clasp: both are drawn around a
  // creature the world still holds, from the same `creatureCenter` the body
  // was — not from where the event happened to fire.
  effects.draw(ctx, l, world, view.beatPhase);
}
