import { bakedCache } from "../../../../../packages/render/src/baked.js";
import {
  type CairnUnit,
  cairnUnits,
  pilePath,
} from "../../../../../packages/render/src/cairn-units.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { drawRockBody } from "../../../../../packages/render/src/meteor.js";
import { meteorLookFor } from "../../../../../packages/render/src/meteor-looks.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { CairnState } from "../../../../../packages/sim/src/cairn.js";
import type { Creature } from "../../../../../packages/sim/src/creature-types.js";

/**
 * STILL — the shipped pile, photographed once and blitted after that.
 *
 * Same seven fires, same look for all of them, same clip and the same seams:
 * `livePile` at one instant, painted into an offscreen canvas the first time a
 * stack of this many stones is asked for and drawn as one image on every frame
 * after. The fire does not flicker, the stones do not turn and the settle does
 * not drift — a pile that has been standing since the wave opened, holding one
 * moment of heat. One `drawImage` a frame where the game draws seven whole
 * rocks and clips most of them away.
 *
 * The picture is keyed on what it was painted from and nothing that moves:
 * the count, the radius, the body's id (which places the stones and picks the
 * look) and the device's pixel ratio. A stone pulled off is a new count and a
 * new picture; the seven a whole wave can need are held together.
 */

/** The instant the fire is caught at. Any instant does; this one has the
 * BLAZE tongues up rather than flat, which is the fire at its most fire. */
const MOMENT = 0.8;

/** A seam stroke is drawn inside the clip, so the polygon is the whole bound;
 * one pixel of room keeps its anti-aliased edge off the canvas edge. */
const PAD = 1;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const stills = bakedCache<string, HTMLCanvasElement>();

/** How many pictures to hold before starting again — a wave needs seven. */
const CEILING = 16;

function boxOf(stack: readonly CairnUnit[]): Box {
  let x0 = Number.POSITIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;
  for (const u of stack) {
    x0 = Math.min(x0, u.x - u.r);
    y0 = Math.min(y0, u.y - u.r);
    x1 = Math.max(x1, u.x + u.r);
    y1 = Math.max(y1, u.y + u.r);
  }
  return {
    x: Math.floor(x0) - PAD,
    y: Math.floor(y0) - PAD,
    w: Math.ceil(x1 - x0) + 2 * PAD,
    h: Math.ceil(y1 - y0) + 2 * PAD,
  };
}

/** The shipped picture at `MOMENT`, into a canvas the size of the pile. */
function bake(l: Layout, body: Creature, stack: readonly CairnUnit[], box: Box): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.ceil(box.w * l.dpr);
  c.height = Math.ceil(box.h * l.dpr);
  const g = c.getContext("2d");
  if (!g) return c;
  g.scale(l.dpr, l.dpr);
  g.translate(-box.x, -box.y);
  const look = meteorLookFor(body.id);
  const path = pilePath(stack);
  g.save();
  g.clip(path);
  for (const u of stack) {
    drawRockBody(g, u.x, u.y, u.r, MOMENT, body.id * 31 + u.slot, 0, look);
  }
  g.strokeStyle = PALETTE.rockDark;
  g.lineWidth = Math.max(1, l.tile * 0.05);
  g.stroke(path);
  g.restore();
  return c;
}

export function stillPile(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  body: Creature,
  boss: CairnState,
  _time: number,
): void {
  // The geometry at the frozen instant — where the picture was taken from, so
  // the blit lands where the stones were painted. Arithmetic only; no canvas.
  const stack = cairnUnits(l, body, boss.units, MOMENT);
  if (stack.length === 0) return;
  const r = stack[0]?.r ?? 0;
  const box = boxOf(stack);
  const key = `${stack.length}|${r.toFixed(2)}|${body.id}|${l.dpr}`;
  let still = stills.get(key);
  if (!still) {
    if (stills.size >= CEILING) stills.clear();
    still = bake(l, body, stack, box);
    stills.set(key, still);
  }
  ctx.drawImage(still, box.x, box.y, box.w, box.h);
}
