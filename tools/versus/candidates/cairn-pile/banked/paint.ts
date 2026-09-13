import { bakedCache } from "../../../../../packages/render/src/baked.js";
import {
  type CairnUnit,
  cairnUnits,
  pilePath,
} from "../../../../../packages/render/src/cairn-units.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { drawRockBody } from "../../../../../packages/render/src/meteor.js";
import { STONE_LOOK } from "../../../../../packages/render/src/meteor-look.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { CairnState } from "../../../../../packages/sim/src/cairn.js";
import type { Creature } from "../../../../../packages/sim/src/creature-types.js";

/**
 * BANKED — a fire that has been left standing: grey stone, with the heat gone
 * down into the seams.
 *
 * The stones are the game's old grey rock (`STONE_LOOK`, the one THE VOLLEY's
 * ball still wears), painted once into a canvas the size of the stack and
 * blitted after — cold, still, and not pretending to be seven falling rocks.
 * What is live is the heat *between* them: one ember glow from the middle of
 * the pile, clipped to its outline, and the seams themselves stroked in the
 * ember's own colour and breathing slowly. A banked fire looks like this —
 * grey outside, and the glow is in the cracks — and it is the one look of the
 * three that says *this has been standing here a while*.
 *
 * Every rock the pair pulls off becomes a live burning one on the way down,
 * so the pile going from grey to fire is the pull itself made visible.
 */

/** The instant the stones are caught at — a turn each, off `time`. */
const MOMENT = 0.8;
const PAD = 1;
const CEILING = 16;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const stones = bakedCache<string, HTMLCanvasElement>();

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

/** Grey stone under the clip, and the dark seams — nothing that burns. */
function bake(l: Layout, body: Creature, stack: readonly CairnUnit[], box: Box): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.ceil(box.w * l.dpr);
  c.height = Math.ceil(box.h * l.dpr);
  const g = c.getContext("2d");
  if (!g) return c;
  g.scale(l.dpr, l.dpr);
  g.translate(-box.x, -box.y);
  const path = pilePath(stack);
  g.save();
  g.clip(path);
  for (const u of stack) {
    drawRockBody(g, u.x, u.y, u.r, MOMENT, body.id * 31 + u.slot, 0, STONE_LOOK);
  }
  g.strokeStyle = PALETTE.rockDark;
  g.lineWidth = Math.max(1, l.tile * 0.05);
  g.stroke(path);
  g.restore();
  return c;
}

export function bankedPile(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  body: Creature,
  boss: CairnState,
  time: number,
): void {
  const stack = cairnUnits(l, body, boss.units, MOMENT);
  if (stack.length === 0) return;
  const r = stack[0]?.r ?? 0;
  const box = boxOf(stack);
  const key = `${stack.length}|${r.toFixed(2)}|${body.id}|${l.dpr}`;
  let sprite = stones.get(key);
  if (!sprite) {
    if (stones.size >= CEILING) stones.clear();
    sprite = bake(l, body, stack, box);
    stones.set(key, sprite);
  }
  ctx.drawImage(sprite, box.x, box.y, box.w, box.h);

  // The heat, live: a slow breath rather than a flicker — a banked fire does
  // not dance, it glows. Inside the outline, so the light is in the pile and
  // not around it; the seams take the ember's colour because that is where a
  // banked fire shows, in the cracks between what covers it.
  const breath = 0.5 + 0.5 * Math.sin(time * 1.6);
  const path = pilePath(stack);
  ctx.save();
  ctx.clip(path);
  // Faint on purpose: `halo` adds light, and a glow that read the stones as
  // white was the first draft. The seams carry the heat; this is its spill.
  halo(ctx, box.x + box.w / 2, box.y + box.h * 0.62, r * 1.5, PALETTE.ember, 0.1 + 0.06 * breath);
  ctx.strokeStyle = rgba(PALETTE.ember, 0.55 + 0.35 * breath);
  ctx.lineWidth = Math.max(1, l.tile * 0.04);
  ctx.stroke(path);
  ctx.restore();
}
