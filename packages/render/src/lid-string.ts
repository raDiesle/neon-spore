import { openSmoothPath } from "@neon-spore/content";
import {
  type Creature,
  lidIsHeld,
  lidOpenMilli,
  lidPull,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { strokeGlow } from "./glow.js";
import {
  drawHandleHint,
  drawHandleRest,
  drawHandleRing,
  HINT_SOFT,
  handleRadius,
  handleSag,
} from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE LID's cord, and the handle on the end of it.
 *
 * It is THE WARDEN's rope one creature along, and it is drawn to say the same
 * four things in the same order, because they are the four things a handle on
 * this field has to say with nobody told anything (`tether.ts` names them):
 * the handle reads as something to take hold of, the moment it is held is
 * visible, pulling builds tension and more pulling builds more, and the plates
 * part in proportion — which is `render/lid.ts` next door and is the same
 * number this file draws.
 *
 * **Flat, outside the perspective transform, and that is the whole reason it
 * is its own pass.** A handle is hit-tested against the circle it is drawn at
 * (`lidCordCircle`, which `handles.ts` calls and this file draws), and a circle
 * scaled by the row it is on would be a control that changes size under the
 * thumb. The body it hangs off is drawn with depth; the thing a finger has to
 * find is not.
 *
 * **One difference from the rope, and it is the creature.** A warden's line is
 * lowered into a column and hangs there; a lid's cord comes down with the body,
 * so it is drawn from wherever the body has glided to this frame — `beatPhase`
 * rather than the row it left.
 */

/**
 * Where this lid's handle rests, with no hand on it.
 *
 * **The one place it is written down.** `handles.ts` answers a press exactly
 * here and this file draws exactly here — a button drawn in one place and
 * answered in another is a button that works until somebody moves one of them.
 *
 * It reads nothing about the pull: a press is tested against the resting circle
 * whatever the cord is doing. The handle swings while it is dragged and that
 * costs nothing, because by then the pointer is captured and nothing is
 * hit-tested again.
 */
export function lidCordCircle(l: Layout, cfg: SimConfig, c: Creature, beatPhase: number): Circle {
  const { x, y } = creatureCenter(l, c, beatPhase);
  // How far under the body it hangs is the simulation's number too, not this
  // file's: the clamp that keeps a pulled handle on the field is written
  // against exactly this hang (`sim/handle-pull.ts`).
  return { x, y: y + (l.tile * cfg.lidCordMilli) / 1000, r: handleRadius(l, cfg) };
}

/**
 * Every cord on the field, drawn flat. Called from `drawCreatures` after the
 * bodies, so a cord is never behind the body it hangs off.
 */
export function drawLidCords(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  for (const c of world.creatures) {
    if (c.kind !== "lid") continue;
    drawOne(ctx, l, world.cfg, c, beatPhase, time);
  }
}

function drawOne(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  beatPhase: number,
  time: number,
): void {
  const hex = c.color === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = c.color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  const rest = lidCordCircle(l, cfg, c, beatPhase);
  const top = creatureCenter(l, c, beatPhase);
  // One to one with the hand, in both axes: the handle stands exactly where the
  // finger carried it, so the distance on the screen *is* the distance being
  // asked for. The pull is thousandths of a tile, which is what `l.tile` turns
  // back into pixels — and the simulation has already kept it on the field, so
  // nothing here has to bound it a second time (`sim/handle-pull.ts`).
  const carried = lidPull(c);
  const held = lidIsHeld(c);
  const pull = lidOpenMilli(cfg, c) / 1000;
  const head = {
    x: rest.x + (carried.x * l.tile) / 1000,
    y: rest.y + (carried.y * l.tile) / 1000,
  };

  // Under tension the cord goes thin and bright: it is its own gauge, and
  // there is no widget anywhere saying how far the pull has got.
  const sag = handleSag({
    anchor: { x: rest.x, y: top.y },
    head,
    held,
    pull,
    time,
    segments: 10,
    waveHeld: 1.1,
    waveSlack: 2.4,
  });
  const cord = new Path2D(openSmoothPath(sag));
  strokeGlow(ctx, cord, held ? rim : hex, STROKE.outline * (1 - pull * 0.35), 0.4 + pull * 1.4);

  if (held) drawHandleRest(ctx, rest, hex);
  drawHandleRing(ctx, { x: head.x, y: head.y, r: rest.r, hex, rim, held, pull, time });
  if (!held) drawHandleHint(ctx, l, l.role, head.x, head.y + l.tile * 0.62, HINT_SOFT);
}
