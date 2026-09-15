import type { World } from "@neon-spore/sim";
import { drawChokeCoils } from "./choke-hull.js";
import { drawStuckClingers } from "./cling.js";
import type { Effects } from "./effects.js";
import type { FenceStrike } from "./fence-strike.js";
import type { GumSplash } from "./gum-splash.js";
import { drawHarpoonMarks } from "./harpoon-mark.js";
import { heldHarpoons } from "./harpoon-place.js";
import type { HullFrame, LobePositions, SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import type { ViewState } from "./renderer.js";

/**
 * **The fifth pass: what is stuck to the finished ship.** Drawn after
 * `drawShip` and before `drawOverlays`, on the same membrane the ship pass
 * just drew and over the rim it just lit — which is why none of these can go
 * down with the field, and why none of them is the ship's own business.
 *
 * Every call here is one `Canvas2DRenderer.draw` used to make directly, and
 * each was one landing: THE FENCE's strike, THE GUM's splash, THE CHOKE, THE
 * LIMPET and THE LEECH, four calls in a row that had taken that file to its
 * limit. The order is the picture — a gum's splash runs over the fence's
 * burn, a coil sits over both — so a body that sticks to the ship next is
 * added at the end, not slipped in between.
 *
 * The split moves lines, not behaviour: the stub canvas's ordered call log
 * over every wave that reaches one of these was byte-identical before and
 * after, and `packages/render/test/frame.test.ts` draws them all again.
 */
export function drawOnShip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  /**
   * The renderer's own kept state, whole.
   *
   * It was two of its fields — the fence's strike and the gum's splash — and
   * became three when the harpoon's line arrived, which is the point at which
   * a list of fields is worse than the object holding them: `canvas2d.ts` is
   * at its length limit and every pass added here would cost it a line.
   */
  held: { fenceStrike: FenceStrike; gumSplash: GumSplash; effects: Effects },
  hull: HullFrame,
  at: LobePositions,
  surfaceY: SurfaceY,
): void {
  // The shield's line burnt out where a wall earthed through the dome, and
  // the hull still conducting from it. Both sit *on* the rim `drawHull` has
  // just lit, so neither can go down with the field pass (`fence-strike.ts`).
  held.fenceStrike.draw(ctx, l, at, surfaceY, view.time);
  // And a gum splashing across the ship, on the same membrane and over the
  // same finished hull: the smear where it landed and the ripples running
  // out from it (`gum-splash.ts`).
  held.gumSplash.draw(ctx, l, surfaceY, view.time);
  // And THE CHOKE's grip on the cannon, on the eased cannon the ship pass
  // drew, while the steer fault has it (`choke-hull.ts`).
  drawChokeCoils(ctx, l, world, hull.cannonX, surfaceY, view.time);
  // And THE LIMPET on the plate and THE LEECH on the cannon (`cling.ts`).
  const shieldX = tileCX(l, at.shield[0]?.col ?? world.shieldCol);
  drawStuckClingers(ctx, l, world, hull.cannonX, shieldX, surfaceY, view.beatPhase, view.time);
  // And, for the two of those a *fault* put there, what the lantern at the top
  // of the field has attached to them: the line it fired them down and reels
  // them back up, then the square, the code, the timer and the word.
  //
  // **Here and not in the field pass**, which is where both of them started.
  // Everything attached to a body on a control has to be placed where that
  // body is *drawn*, and the eased lobes that say so are this pass's
  // (`harpoon-place.ts`). The line crossing in front of the bodies is the
  // price and it is the right one: it is a taut cable to the ship, and a cable
  // that went behind a rock falling past it would read as painted on the sky.
  const harpooned = heldHarpoons(l, world, hull.cannonX, shieldX, surfaceY, view.beatPhase);
  held.effects.harpoonLine.draw(ctx, l, harpooned, view.time);
  drawHarpoonMarks(ctx, world, harpooned, view.time);
}
