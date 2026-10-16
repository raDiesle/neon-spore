import type { SwindleState, World } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { podCenter } from "./pods.js";
import { splinePath } from "./spline.js";
import { drawSwindleFace, swindleGaze } from "./swindle-face.js";
import type { SwindleFx } from "./swindle-fx.js";
import {
  crossingDepth,
  type DealerBox,
  hoodLift,
  swindleBodyAt,
  swindleCrossing,
  swindleHolding,
} from "./swindle-place.js";
import {
  swindleHood,
  swindleHoodCrown,
  swindleHoodGloss,
  swindleOutline,
  swindleStrandRoot,
} from "./swindle-shape.js";
import { drawSwindleArms } from "./swindle-strand.js";
import { SWINDLE_CORE, SWINDLE_FLESH, SWINDLE_RIM } from "./swindle-tint.js";

/**
 * THE SWINDLE, drawn: a green slime with a dealer's face hung over the field,
 * a hood over every pod she holds on an arm of her, and nothing else — the
 * pods are the field's own (`pods.ts`), drawn under their hoods.
 *
 * **The hoods are the shell game.** Each rides on its pod, lifting off it
 * while the pod glides through a swap, and is flung up into her when she lets
 * the pod go (`swindle-fx.ts`). **Two pods crossing pass one in front of the
 * other** — the hood going right swells and dips toward the player, the other
 * shrinks and rises behind — so the pilot can follow them by eye
 * (`swindleCrossing`). **A hood is the same over a real pod and a fake one**,
 * on every screen: the only thing in the game that tells them apart is the
 * navigator's frame (`husk-mark.ts`), drawn over all of this.
 *
 * **She moves as a whole.** She breathes on the beat, sways with a shuffle,
 * leans after the pod she lets go and rights herself, and her eyes follow the
 * play (`swindle-face.ts`); between hands she rears back, taller and
 * narrower; she shrinks with every real pod swallowed. She fades in as she
 * settles over the field; beaten, she greys, shuts her eyes, sags and goes.
 */

/** How much a crossing hood swells or shrinks, and how far it dips or rises, in tiles. */
const DEPTH_SCALE = 0.24;
const DEPTH_DROP_TILES = 0.5;
/** Her sway through a shuffle, in radians. */
const SHUFFLE_SWAY = 0.07;

/** Her breath, 0 at the beat and back to it, peaking halfway. */
function breathOf(beatPhase: number): number {
  return 0.5 - 0.5 * Math.cos(beatPhase * Math.PI * 2);
}

interface HeldHood {
  hood: Path2D;
  depth: number;
  x: number;
  y: number;
  r: number;
}

export function drawSwindle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: SwindleState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: SwindleFx,
): void {
  const crossing = swindleCrossing(world, s);
  const sway = crossing === null ? 0 : Math.sin(crossing.progress * Math.PI * 2) * SHUFFLE_SWAY;
  const box = swindleBodyAt(l, world.cfg, s, beat, beatPhase, fx.lean() + sway);
  const spent = s.phase === "spent";
  const breath = spent ? 0 : breathOf(beatPhase);
  const b = { ...box, rx: box.rx * (1 + 0.012 * breath), ry: box.ry * (1 + 0.04 * breath) };
  const body = splinePath(swindleOutline(b, time), true);
  const held: HeldHood[] = swindleHolding(world, s).map(({ i, pod, lift }) => {
    const at = podCenter(l, pod);
    const depth = crossingDepth(crossing, pod.id);
    const r = at.r * (1 + DEPTH_SCALE * depth);
    const y = at.y - hoodLift(l, lift) + depth * DEPTH_DROP_TILES * l.tile;
    return { hood: splinePath(swindleHood(at.x, y, r, time, i * 1.7), true), depth, x: at.x, y, r };
  });
  const behind = held.filter((h) => h.depth <= 0);
  const before = held.filter((h) => h.depth > 0);

  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  ctx.globalAlpha = b.alpha;
  drawSwindleArms(
    ctx,
    held.map((h) => ({
      root: swindleStrandRoot(b, h.x),
      crown: { x: h.x, y: swindleHoodCrown(h.y, h.r) },
    })),
    l.tile,
    beatPhase,
    time,
  );
  paintFlesh(ctx, [...behind.map((h) => h.hood), body], b, l.tile, spent);
  paintFlesh(
    ctx,
    before.map((h) => h.hood),
    b,
    l.tile,
    spent,
  );
  if (!spent) for (const h of held) hoodGloss(ctx, h, l.tile);
  bodyDepth(ctx, body, b, l.tile, spent, time);
  drawSwindleFace(ctx, l, b, swindleGaze(l, world, s), fx.hurt.value, spent, time);
  drawHurt(ctx, body, fx.hurt.value);
  ctx.restore();
  fx.draw(ctx, l, time);
}

/**
 * Translucent green slime, lit from above, darker toward the belly. Every
 * piece is rimmed first and filled over after, THE MATRON's way
 * (`matron-draw.ts`), so the pieces of one pass are one flesh.
 */
function paintFlesh(
  ctx: CanvasRenderingContext2D,
  pieces: readonly Path2D[],
  b: DealerBox,
  tile: number,
  spent: boolean,
): void {
  if (pieces.length === 0) return;
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(3, tile * 0.12);
  for (const p of pieces) {
    // Set per piece, so a frame says how many hoods she has out.
    ctx.strokeStyle = spent ? rgba(PALETTE.dim, 0.8) : rgba(SWINDLE_RIM, 0.85);
    ctx.stroke(p);
  }
  const core = spent ? PALETTE.rockDark : SWINDLE_CORE;
  const light = spent ? PALETTE.sparkDim : SWINDLE_FLESH;
  const g = ctx.createRadialGradient(
    b.x - b.rx * 0.2,
    b.y - b.ry * 0.5,
    tile * 0.3,
    b.x,
    b.y + b.ry * 2,
    b.rx * 1.2,
  );
  g.addColorStop(0, rgba(light, 0.9));
  g.addColorStop(0.5, rgba(core, 0.9));
  g.addColorStop(1, rgba(core, 0.96));
  ctx.fillStyle = g;
  for (const p of pieces) ctx.fill(p);
  ctx.restore();
}

/** A wet line of light along the top of a hood. */
function hoodGloss(ctx: CanvasRenderingContext2D, h: HeldHood, tile: number): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba("#FFFFFF", 0.4 + 0.2 * Math.max(0, h.depth));
  ctx.lineWidth = Math.max(1.5, tile * 0.05);
  ctx.beginPath();
  ctx.arc(h.x, h.y, swindleHoodGloss(h.r), -Math.PI / 2 - 1.0, -Math.PI / 2 + 0.15);
  ctx.stroke();
  ctx.restore();
}

/**
 * Her volume: a shadow pooled in her belly, bubbles rising slowly through
 * her, and a long gloss along her crown — a body, not a leaf.
 */
function bodyDepth(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  b: DealerBox,
  tile: number,
  spent: boolean,
  time: number,
): void {
  ctx.save();
  ctx.clip(body);
  const belly = ctx.createLinearGradient(0, b.y - b.ry * 0.1, 0, b.y + b.ry);
  belly.addColorStop(0, rgba(PALETTE.background, 0));
  belly.addColorStop(1, rgba(PALETTE.background, 0.5));
  ctx.fillStyle = belly;
  ctx.fillRect(b.x - b.rx * 1.3, b.y - b.ry * 1.3, b.rx * 2.6, b.ry * 2.6);
  if (!spent) {
    ctx.strokeStyle = rgba(SWINDLE_RIM, 0.35);
    ctx.lineWidth = Math.max(1, tile * 0.03);
    for (let k = 0; k < 6; k++) {
      const u = (((k * 0.618) % 1) * 2 - 1) * 0.75;
      const t = (time * 0.18 + k * 0.29) % 1;
      ctx.beginPath();
      ctx.arc(
        b.x + u * b.rx,
        b.y + b.ry * (0.8 - 1.6 * t),
        tile * (0.05 + 0.03 * (k % 3)),
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }
  ctx.restore();
  if (spent) return;
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.lean);
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba("#FFFFFF", 0.32);
  ctx.lineWidth = Math.max(2, tile * 0.11);
  ctx.beginPath();
  ctx.ellipse(
    -b.rx * 0.08,
    b.ry * 0.05,
    b.rx * 0.78,
    b.ry * 0.78,
    0,
    Math.PI * 1.12,
    Math.PI * 1.55,
  );
  ctx.stroke();
  ctx.restore();
  halo(ctx, b.x - b.rx * 0.25, b.y - b.ry * 0.4, tile * 1.0, SWINDLE_RIM, 0.28);
}
