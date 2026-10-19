import { swapChangedAgo, swapWarning, type World } from "@neon-spore/sim";
import { bandControlSet } from "./band.js";
import { bandLobes } from "./band-lobes.js";
import { drawPlate } from "./handover-look.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Circle, Layout } from "./layout.js";
import type { ViewState } from "./renderer.js";
import { showsCannon, showsShield, type ViewRole } from "./view-role.js";

/**
 * **THE SWAP on the screen: the countdown to each change, and the change.**
 *
 * The fault trades the two panels every twelve beats (`sim/swap.ts`), so the
 * thing a pair needs from the picture is the thing THE HANDOVER's plate gives
 * once a wave — *when* — given again and again, close to their thumbs. The
 * owner, 19 October 2026: the warning belongs *in the area of the controls
 * and the ship's hull, not the top of the screen*, about three seconds ahead
 * and with a siren, and the change itself should be *a living mutation from
 * one form into the other* while the controls keep answering.
 *
 * **What ships is THE HANDOVER's plate, counting THE SWAP.** The pictures the
 * owner asked for are offered in VERSUS (`tools/versus/candidates/swap-notice`)
 * through `SWAP_LOOK`, and the game draws what the handover draws until one is
 * taken. The band under the plate has already changed hands at the change —
 * the hit test reads the same beat (`handover.ts`) — so a mutation is a
 * picture of the old panel going, laid over a panel that already answers.
 */

/** What the look is drawn from besides the world. */
export interface SwapView {
  beatPhase: number;
  time: number;
  /** The hull's membrane, or null where no ship pass ran. */
  surfaceY: SurfaceY | null;
  /** Draws the band again, as the given seat sees it — the panel this screen
   * held before the change, for a look that turns one form into the other. */
  bandAs: (role: ViewRole) => void;
  /** The round controls on this screen's band, where its thumbs are. */
  lobes: readonly Circle[];
}

/**
 * How far through the warning the frame is: 0 on its first beat's edge, 1 on
 * the change — or null outside it. Smooth across the beat, so a look can grow
 * with it rather than step.
 */
export function swapWarnProgress(world: World, beatPhase: number): number | null {
  const count = swapWarning(world);
  if (count <= 0) return null;
  const beats = Math.max(1, Math.round(world.cfg.swapWarnBeats));
  return Math.min(1, Math.max(0, (beats - count + beatPhase) / beats));
}

/**
 * How far through the first `beats` beats after a change the frame is, 0..1,
 * or null once they are over or before any change.
 */
export function swapChangeProgress(world: World, beatPhase: number, beats: number): number | null {
  const ago = swapChangedAgo(world);
  if (ago < 0) return null;
  const t = (ago + beatPhase) / beats;
  return t < 1 ? t : null;
}

/** The seat this screen held before the last change: the other one. The rig
 * never trades, so it has no other form to come from. */
export function seatBefore(role: ViewRole): ViewRole | null {
  if (role === "p1") return "p2";
  return role === "p2" ? "p1" : null;
}

/** What the shipped plate says, or null. */
export function swapWords(world: World): string | null {
  const count = swapWarning(world);
  return count > 0 ? `PANELS SWAP IN ${count}` : null;
}

/** THE HANDOVER's plate on the band's lip, counting THE SWAP down. */
function swapPlate(ctx: CanvasRenderingContext2D, l: Layout, world: World, view: SwapView): void {
  const text = swapWords(world);
  if (text !== null) drawPlate(ctx, l, text, view.beatPhase, false);
}

/**
 * **The look the frame draws, as a record a candidate can patch** —
 * `HANDOVER_LOOK`'s arrangement (`docs/versus.md`).
 */
export const SWAP_LOOK: {
  announce: (ctx: CanvasRenderingContext2D, l: Layout, world: World, view: SwapView) => void;
} = { announce: swapPlate };

/**
 * The look, called by the overlay pass with what only it holds: the frame and
 * a way to draw the band again as either seat. The lobes are this screen's
 * own — the seat a half belongs to is drawn only where that half is shown.
 */
export function announceSwap(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ViewState,
  surfaceY: SurfaceY | null,
  bandAs: (role: ViewRole) => void,
): void {
  const set = bandControlSet(view.controls, world);
  const lobes = [
    ...(showsCannon(l.role) ? bandLobes(l, set, 1) : []),
    ...(showsShield(l.role) ? bandLobes(l, set, 2) : []),
  ].map((b) => b.circle);
  SWAP_LOOK.announce(ctx, l, world, {
    beatPhase: view.beatPhase,
    time: view.time,
    surfaceY,
    bandAs,
    lobes,
  });
}
