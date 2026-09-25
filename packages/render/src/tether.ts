import {
  type Creature,
  type SimConfig,
  type WardenState,
  type World,
  wardenColor,
  wardenCycle,
  wardenHandleMilli,
  wardenPullMilli,
} from "@neon-spore/sim";
import { fieldPoint, handleRadius } from "./handle-draw.js";
import { drawHandleHint, HINT_LOUD } from "./handle-word.js";
import type { Circle, Layout } from "./layout.js";
import { tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob, PULL_GRAB } from "./pull-knob.js";
import { drawPullTrack } from "./pull-track.js";
import { TETHER_LOOK } from "./tether-looks.js";
import { wardenRopeTrack } from "./tether-track.js";
import { wardenRopeAnchor } from "./warden.js";

/**
 * THE WARDEN's rope, and the handle on it: the one thing on this field either
 * player can put a hand on.
 *
 * It is the game's first **open** contour — a line with two ends rather than a
 * closed loop with lobes — and it is drawn by an open spline for that reason.
 *
 * **Four things have to be legible here, in order, with nobody told anything**
 * (the owner asked for them by name, which is what exempts this file from *a
 * look is offered, never replaced*):
 *
 * 1. the handle reads as something to take hold of, and which way — a big
 *    circle to start at the rope's end, a thin channel the whole of its
 *    travel, and a word while nobody has it (`pull-knob.ts`, `pull-track.ts`,
 *    the owner, 25 September 2026);
 * 2. the moment it is held is visible — the channel lights and the word goes;
 * 3. pulling builds tension and more pulling builds more, **continuously**: the
 *    rope goes taut, thin and bright, and the channel fills green behind it;
 * 4. the hatch opens in proportion, which is `warden.ts` next door and is the
 *    same number this file draws.
 *
 * Everything here is derived from the world every frame. Only the snap-back
 * after a hit outlives one, and that lives in `Effects` (`warden-fx.ts`).
 */

/**
 * Where the handle rests, with no hand on it.
 *
 * **The one place it is written down.** `handles.ts` answers a press exactly
 * here and this file draws exactly here — a button drawn in one place and
 * answered in another is a button that works until somebody moves one of them,
 * and that is precisely what had happened: the press was answered in the ring's
 * fixed middle column while the ball was drawn in the pupil's, which walks.
 *
 * **The pupil's column, because that is where the rule hangs it**
 * (`ropeRest`, `sim/warden-rope.ts`). It reads the layout, the config and that
 * column, and nothing about the pull: a press is tested against the resting
 * circle whatever the rope is doing. The handle swings while it is dragged and
 * that costs nothing, because by then the pointer is captured and nothing is
 * hit-tested again.
 */
export function tetherHandleCircle(l: Layout, cfg: SimConfig, pupilCol: number): Circle {
  return {
    x: tileCX(l, pupilCol),
    y: tileCY(l, cfg.wardenRow + cfg.wardenHangRows),
    r: handleRadius(l, cfg),
  };
}

/**
 * **The rope was the hardest control in the game to pick up, and twice over.**
 * Its resting column is the *pupil's*, which walks a column or two a beat
 * (`sim/warden-rope.ts`'s `ropeRest`), and the press was answered at the ring's
 * fixed middle instead — so the ball a player could see was outside its own
 * button for most of every cycle. That is fixed above, by both sides asking for
 * the same column. The other half is size: the owner asked twice for the area
 * to be bigger than the circle drawn, the second time for every pull handle
 * (`PULL_GRAB`, `pull-knob.ts`). It costs nothing to be generous here: the wave
 * THE WARDEN owns has no entries at all (`content/waves/act-2.ts`), so the rope
 * is the only thing on the field a press could have meant.
 */
/** The circle a press is answered in — the resting one, widened by `PULL_GRAB`. */
export function tetherGrabCircle(l: Layout, cfg: SimConfig, pupilCol: number): Circle {
  const rest = tetherHandleCircle(l, cfg, pupilCol);
  return { x: rest.x, y: rest.y, r: rest.r * PULL_GRAB };
}

export function drawTether(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  b: WardenState,
  body: Creature,
  openness: number,
  time: number,
): void {
  const cfg: SimConfig = world.cfg;
  const hex = wardenColor(wardenCycle(cfg, world.waveBeat)) === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = hex === PALETTE.red ? PALETTE.redRim : PALETTE.cyanRim;

  const rest = tetherHandleCircle(l, cfg, b.pupilCol);
  // Tied to the eye itself, and travelling with it: the thing the rope holds
  // open is the thing the rope comes out of (`warden.ts`).
  const anchor = wardenRopeAnchor(l, body, b, openness);
  // One to one with the hand, in both axes: the handle stands exactly where the
  // finger carried it, so the distance on the screen *is* the distance being
  // asked for. The simulation has already kept it on the field, so nothing here
  // has to bound it a second time (`sim/handle-pull.ts`).
  // Where the handle is, straight from the rule: the anchor the hand took it
  // from plus how far the hand carried it, so it stays under the finger while
  // the pupil drifts out from under it (`sim/warden.ts`).
  const head = fieldPoint(l, wardenHandleMilli(world, b));
  const pull = wardenPullMilli(world, b) / 1000;
  const held = b.pulling;

  // The rope changes with `pull` alone, whatever `TETHER_LOOK` draws it from
  // (`tether-look.ts`); the channel under it says how far there is to go.
  const d = { ctx, anchor, head, held, pull, time, tile: l.tile, hex, rim };
  // The way the pull goes, drawn along the whole of it and filling green
  // behind the hand (`pull-track.ts`), under the rope so the line lies in its
  // channel; then the circle to start, at the rope's end, where the thumb has
  // it (`pull-knob.ts`).
  const track = wardenRopeTrack(l, cfg, b, head, rest);
  drawPullTrack(ctx, track, { hex, rim, held, origin: 0, at: pull, time });
  TETHER_LOOK.rope(d);
  TETHER_LOOK.root(d);
  drawPullKnob(ctx, head, rest.r, { hex, rim, held, time });
  if (!held) drawHandleHint(ctx, l, l.role, head.x, head.y + l.tile * 0.75, HINT_LOUD);
}
