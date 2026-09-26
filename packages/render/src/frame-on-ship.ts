import type { World } from "@neon-spore/sim";
import { drawChokeCoils } from "./choke-hull.js";
import { drawStuckClingers } from "./cling.js";
import { drawHarpoonMarks } from "./harpoon-mark.js";
import { heldHarpoons } from "./harpoon-place.js";
import type { HullFrame, LobePositions, SurfaceY } from "./hull-frame.js";
import { type Layout, tileCX } from "./layout.js";
import { drawLedgerRoot } from "./ledger-root.js";
import type { RenderState } from "./render-state.js";
import type { ViewState } from "./renderer.js";
import { drawUndertowHull } from "./undertow-draw.js";
import { drawUndertowGrips } from "./undertow-grip.js";

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
   * The renderer's own kept state, whole — `RenderState` itself rather than a
   * literal of the fields this pass reads, which grew a field with every hit
   * look that arrived. `Readonly`, so the pass still cannot swap one out.
   */
  held: Readonly<RenderState>,
  hull: HullFrame,
  at: LobePositions,
  surfaceY: SurfaceY,
): void {
  // The shield's line burnt out where a wall earthed through the dome, and
  // the hull still conducting from it. Both sit *on* the rim `drawHull` has
  // just lit, so neither can go down with the field pass (`fence-strike.ts`).
  held.fenceStrike.draw(ctx, l, at, surfaceY, view.time);
  // And THE SINEW's snap-back running down the same plating: the mass is
  // whipped and the ship feels it, for a beat (`sinew-fx.ts`).
  held.effects.boss.sinew.drawShock(ctx, l, surfaceY, view.time);
  // And THE LEDGER's, on the same plating and for the design's own reason: the
  // presentation of that fight is the hull reacting rather than the frame
  // moving, on the beat the cord roots in the ship and on every return the
  // pair did not answer (`ledger-fx.ts`).
  held.effects.boss.ledger.drawShock(ctx, l, surfaceY, view.time);
  // And THE HASP's, for its design's: an opened hasp is one shudder through
  // the plating rather than a camera moving (`hasp-fx.ts`, §20).
  held.effects.boss.hasp.drawShock(ctx, l, surfaceY, view.time);
  // And THE RATCHET's: every clean tooth is one shudder through the plating
  // and a burnt one none (`ratchet-fx.ts`, §22).
  held.effects.boss.ratchet.drawShock(ctx, l, surfaceY, view.time);
  // And THE MANTLE's: each shearing pair is one shudder through the plating,
  // and the core going out one more (`mantle-fx.ts`, §23).
  held.effects.boss.mantle.drawShock(ctx, l, surfaceY, view.time);
  // And a gum splashing across the ship, on the same membrane and over the
  // same finished hull: the smear where it landed and the ripples running
  // out from it (`gum-splash.ts`).
  held.gumSplash.draw(ctx, l, surfaceY, view.time);
  // And a body bursting on the plating it reached: the ring where its skin let
  // go and the water thrown out of it, in the colour it was wearing
  // (`body-burst.ts`). Over the hull for the splash's reason, and over the
  // splash because the drops are in front of the ship rather than on it.
  held.bodyBurst.draw(ctx, l, surfaceY);
  // And the third answer to the same event, over both of them: the hit that
  // lost the wave, seen happening at the column it came in at. The shipped
  // look draws nothing and this call is the seam a candidate reaches through
  // (`breach-look.ts`); it is grouped with the other two rather than put at
  // the end because all three are one event, and what goes at the end of this
  // pass is a body stuck to the ship.
  held.breachStrike.draw(ctx, l, surfaceY);
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
  // And THE LEDGER's other half: the grommet the cord is rooted in and the
  // white lock around that column, which is the navigator's whole job and was
  // painted over while it was drawn with the body (`ledger-root.ts`).
  drawLedgerRoot(ctx, l, world, view.beatPhase, view.time, surfaceY);
  // And THE UNDERTOW's plating: the plate bowing, the seams lit, the breach
  // parted round its lobe and the whole edge rising — the hull's own skin
  // doing something, over the rim the ship pass just lit (`undertow-draw.ts`).
  drawUndertowHull(ctx, l, world, view.role, view.beatPhase, view.time, surfaceY, hull.cannonX);
  // And its one transient, on the same plating: the plate closing under a
  // cannon slid off in time, which the world has already forgotten
  // (`undertow-fx.ts`).
  held.effects.boss.undertow.drawClose(ctx, l, surfaceY, view.time);
  // And the two rings that plating is taken hold of by: the navigator's thumb
  // on a standing lobe and her haul on the column the floor has the pilot
  // stuck in. Last of all, over every seam and flap, because a ring is a thing
  // to reach for and not a part of the ship (`undertow-grip.ts`).
  drawUndertowGrips(ctx, l, world, view.beatPhase, view.time);
}
