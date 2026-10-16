import type { SwindleState, World } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { podCenter } from "./pods.js";
import { splinePath } from "./spline.js";
import type { SwindleFx } from "./swindle-fx.js";
import { type DealerBox, hoodLift, swindleBodyAt, swindleHolding } from "./swindle-place.js";
import {
  swindleHood,
  swindleHoodCrown,
  swindleOutline,
  swindleStrandRoot,
} from "./swindle-shape.js";
import { SWINDLE_CORE, SWINDLE_FLESH, SWINDLE_RIM } from "./swindle-tint.js";

/**
 * THE SWINDLE, drawn: a green slime hung over the field, a hood over every
 * pod she holds on a strand of her, and nothing else — the pods are the
 * field's own (`pods.ts`), drawn under their hoods.
 *
 * **The hoods are the shell game.** Each rides on its pod, lifting a little
 * off it while the pod glides through a swap, and is flung up into her when
 * she lets the pod go (`swindle-fx.ts`). **A hood is the same over a real
 * pod and a fake one**, on every screen: the only thing in the game that
 * tells them apart is the navigator's frame (`husk-mark.ts`), drawn over all
 * of this.
 *
 * **She moves as a whole.** She breathes on the beat, leans after the pod she
 * lets go and rights herself; between hands she rears back, taller and
 * narrower; she shrinks a little with every real pod swallowed. She fades in
 * as she settles over the field; beaten, she greys, sags and goes.
 */

/** Her breath, 0 at the beat and back to it, peaking halfway. */
function breathOf(beatPhase: number): number {
  return 0.5 - 0.5 * Math.cos(beatPhase * Math.PI * 2);
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
  const box = swindleBodyAt(l, world.cfg, s, beat, beatPhase, fx.lean());
  const spent = s.phase === "spent";
  const breath = spent ? 0 : breathOf(beatPhase);
  const b = { ...box, rx: box.rx * (1 + 0.012 * breath), ry: box.ry * (1 + 0.04 * breath) };
  const body = splinePath(swindleOutline(b, time), true);
  const held = swindleHolding(world, s).map(({ i, pod, lift }) => {
    const { x, y, r } = podCenter(l, pod);
    const up = hoodLift(l, lift);
    return {
      hood: splinePath(swindleHood(x, y - up, r, time, i * 1.7), true),
      root: swindleStrandRoot(b, x),
      crown: { x, y: swindleHoodCrown(y - up, r) },
    };
  });

  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  ctx.globalAlpha = b.alpha;
  drawStrands(ctx, held, l.tile, spent, time);
  paintFlesh(ctx, [...held.map((h) => h.hood), body], b, l.tile, spent);
  drawHurt(ctx, body, fx.hurt.value);
  ctx.restore();
  fx.draw(ctx, l, time);
}

/** A thin strand of her down to each hood's crown, swaying a little. */
function drawStrands(
  ctx: CanvasRenderingContext2D,
  held: readonly { root: { x: number; y: number }; crown: { x: number; y: number } }[],
  tile: number,
  spent: boolean,
  time: number,
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1.5, tile * 0.07);
  ctx.strokeStyle = spent ? rgba(PALETTE.dim, 0.7) : rgba(SWINDLE_FLESH, 0.75);
  held.forEach(({ root, crown }, k) => {
    const sway = Math.sin(time * 1.9 + k * 2.1) * tile * 0.12;
    ctx.beginPath();
    ctx.moveTo(root.x, root.y);
    ctx.quadraticCurveTo((root.x + crown.x) / 2 + sway, (root.y + crown.y) / 2, crown.x, crown.y);
    ctx.stroke();
  });
  ctx.restore();
}

/**
 * Translucent green slime, lit from above, darker toward the belly. Every
 * piece is rimmed first and filled over after, THE MATRON's way
 * (`matron-draw.ts`), so a hood and her body are one flesh.
 */
function paintFlesh(
  ctx: CanvasRenderingContext2D,
  pieces: readonly Path2D[],
  b: DealerBox,
  tile: number,
  spent: boolean,
): void {
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
  if (!spent) halo(ctx, b.x - b.rx * 0.25, b.y - b.ry * 0.4, tile * 1.0, SWINDLE_RIM, 0.28);
}
