import { crystalPath, LIGHT_HALF, METEOR } from "@neon-spore/content";
import type { Creature } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { rockRadius } from "./torch.js";

/**
 * The rock. Angular facets rather than a contour, because it does not live —
 * that is the fiction the indestructibility rests on (docs/spec/graphics.md). Craters from
 * shots are placed from the creature id, so both screens agree without the
 * simulation having to store an angle per hole.
 */
export function drawMeteor(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
): void {
  const r = rockRadius(l, c.kind);
  const spin = (c.id % 13) * 0.48;
  const wobble = Math.sin(time * 1.1 + spin) * l.tile * 0.06;
  const d = crystalPath(
    0,
    0,
    r,
    r,
    METEOR.sides,
    METEOR.depth,
    METEOR.wobble,
    time * 0.15,
    METEOR.seed,
  );
  const path = new Path2D(d);

  const turn = spin + time * 0.12;
  ctx.save();
  ctx.translate(x + wobble, y);
  ctx.rotate(turn);

  // The rock's volume used to come from a linear gradient built in this
  // rotated frame, which meant its light turned with the rock: a stone whose
  // bright side is glued to the stone is a painted stone. The value range is
  // the same range; what changed is that it now comes from the key light and
  // `turn` is handed back to it, so the light stays where it is while the rock
  // rolls under it. The base is the unlit mid-tone between `PALETTE.rock` and
  // `rockDark` — the light supplies the ends, so nothing paints a second set.
  ctx.fillStyle = "#8A8F9C";
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  ctx.restore();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(path);

  for (let k = 0; k < c.holes; k++) {
    const a = ((k * 2.399) % (Math.PI * 2)) + (c.id % 5) * 0.4;
    const dist = 0.3 + ((k * 7 + c.id) % 10) / 28;
    const hx = Math.cos(a) * r * dist;
    const hy = Math.sin(a) * r * dist;
    ctx.fillStyle = "#17181D";
    ctx.beginPath();
    ctx.arc(hx, hy, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(199,203,214,.5)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();
  halo(ctx, x + wobble, y, r * 1.6, PALETTE.rock, 0.1);
}
