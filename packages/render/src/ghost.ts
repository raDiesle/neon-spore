import { GHOST, ghostPath } from "@neon-spore/content";
import {
  type Color,
  type Creature,
  ghostIsCharging,
  ghostRage,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { contourClock } from "./creature-place.js";
import { hazed } from "./depth.js";
import { drawGhostEyes } from "./ghost-eyes.js";
import { slabs } from "./ghost-glitch.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE GHOST, drawn — a dome with a hem of tails, wearing a camouflage that is
 * coming apart in horizontal bands.
 *
 * **It is not a blob and it is not drawn by `drawLiving`.** `ghostOutline` in
 * content is a dome over a hanging hem, which no radial contour can describe
 * (`ghost-shape.ts` says why at length), so this file is routed to from
 * `drawCreatures` the way `meteor.ts` and `torch.ts` are — a body with its own
 * draw path, `null` in `living-look.ts`, and a card of its own on the sheet.
 *
 * **On player 1's screen it is not drawn at all.** Not dimmed, not ghosted,
 * not a hint: a halo, a glow pass and a rim all reach outside the contour they
 * belong to, so anything drawn here at any opacity is the column, given away
 * in light. `showsGhostBody` is the one gate, and it is the same sentence
 * `showsVeilCore` makes for the opposite seat. What player 1 gets instead is a
 * band across the row, drawn by `ghost-row.ts`, which carries no column at all.
 *
 * **The one exception is the charge**, and it is a rule rather than a mercy: a
 * crossing ghost that has spent its temper stops prowling and comes down at
 * the hull head first, and from that beat it is drawn on both screens. A hull
 * hit nobody could see coming is a hull hit the pair cannot learn from.
 */

/**
 * Whether this screen draws this body at all.
 *
 * The mirror image of `showsVeilCore`, deliberately and to the letter: that
 * one is `role !== "p2"`, this one is `role !== "p1"`, and `test` sees
 * everything because it is both halves at once on one screen and a rig that
 * hid half the picture would be no rig. The charge is the third clause and
 * belongs to the creature rather than to the seat — see the file's own note.
 */
export function showsGhostBody(l: Layout, cfg: SimConfig, c: Creature): boolean {
  return l.role !== "p1" || ghostIsCharging(cfg, c);
}

/** Every ghost on the field. Exported so the body pass and the row band ask
 * the same question once. */
export function ghosts(world: World): Creature[] {
  return world.creatures.filter((c) => c.kind === "ghost");
}

/** How far the body reaches from its own centre, in pixels — the same
 * `tile * 0.4` every living body is drawn at. */
export function ghostRadius(l: Layout): number {
  return l.tile * 0.4;
}

/** The colour it carries, as a fill and a rim. A ghost with no colour cannot
 * be authored, and is drawn cyan for the same reason `veilBecomes` falls back
 * to a slick: the picture must not depend on a case nothing can produce.
 *
 * Exported because the trail draws the same body in the same colour
 * (`ghost-trail.ts`), and an echo in a colour of its own would be a second
 * creature standing in the column this one just left. */
export function ghostPalette(color: Color | null): { hex: string; rim: string; dark: string } {
  if (color === "red") return { hex: PALETTE.red, rim: PALETTE.redRim, dark: PALETTE.redDark };
  return { hex: PALETTE.cyan, rim: PALETTE.cyanRim, dark: PALETTE.cyanDark };
}

/**
 * The body. `ctx` is expected to be inside the perspective transform
 * `drawCreatures` puts every body in, so nothing here scales for distance —
 * only the colour is hazed, which is where distance is spent everywhere else.
 */
export function drawGhost(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  x: number,
  y: number,
  time: number,
  near: number,
): void {
  const rage = ghostRage(cfg, c);
  const r = ghostRadius(l);
  const scale = r / Math.max(GHOST.rx, GHOST.ry);
  const halfW = GHOST.rx * scale;
  const t = contourClock(c.id, time);
  const { hex, rim, dark } = ghostPalette(c.color);
  const haze = (h: string): string => hazed(cfg, h, near);

  const d = ghostPath(
    0,
    0,
    GHOST.rx,
    GHOST.ry,
    GHOST.tails,
    GHOST.skirt,
    GHOST.wobble,
    t,
    GHOST.seed,
  );
  const body = new Path2D(d);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // The interior: near-black at the rim and the colour welling up out of the
  // middle, which is the reference the owner sent — a dark body with a nebula
  // inside it rather than a flat fill.
  const glow = ctx.createRadialGradient(0, GHOST.ry * 0.1, 0, 0, 0, GHOST.ry * 1.1);
  glow.addColorStop(0, haze(hex));
  glow.addColorStop(0.55, haze(dark));
  glow.addColorStop(1, haze(PALETTE.background));
  ctx.fillStyle = glow;
  ctx.fill(body);

  drawTears(ctx, body, c.id, time, rage, haze(rim));

  // The outline, solid — the same contour every other body in the game is
  // drawn with. It was dashed once, on the argument that a broken line reads
  // as a body the screen cannot hold on to; what it actually read as at 26 px
  // was a shape coming apart into dots, and the tears inside the body and the
  // shards thrown clear of it already say the camouflage is failing. A whole
  // outline is what player 2 finds it by, and the tears are what it is.
  strokeGlow(ctx, body, haze(rim), STROKE.outline / scale, 0.7 + rage * 0.6);

  drawGhostEyes(ctx, haze(rim), haze(PALETTE.text), haze(PALETTE.background), rage, t);
  ctx.restore();

  // The camouflage's own light, outside the body — the "bigger glow" the owner
  // asked for, and the part that grows with the temper. Two passes rather than
  // one: the tight one is the body's colour and the wide one is the wash it
  // sits in, so the outline still reads against its own halo.
  halo(ctx, x, y, r * 1.5, haze(hex), 0.14 + rage * 0.1);
  halo(ctx, x, y, r * 2.6, haze(rim), 0.06 + rage * 0.08);
  drawShards(ctx, c.id, time, rage, x, y, halfW, r, haze(rim));
}

/**
 * The tears inside the body: each band of the contour lit and shifted against
 * its neighbours. Clipped to the outline, so what moves is the *inside* of the
 * silhouette and the silhouette itself stays a shape player 2 can name.
 */
function drawTears(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  id: number,
  time: number,
  rage: number,
  hex: string,
): void {
  ctx.save();
  ctx.clip(body);
  ctx.globalCompositeOperation = "lighter";
  for (const s of slabs(id, time, rage)) {
    ctx.globalAlpha = 0.1 + Math.abs(s.shift) * 0.5;
    ctx.fillStyle = hex;
    ctx.fillRect(
      -GHOST.rx + s.shift * GHOST.rx,
      s.top * GHOST.ry,
      GHOST.rx * 2,
      s.height * GHOST.ry * 0.6,
    );
  }
  ctx.restore();
}

/**
 * The bands thrown clear of the body altogether — the half of the camouflage
 * that reaches outside the contour, drawn after the transform is restored so
 * that a shard is a shard on the screen and not one scaled with a body.
 */
function drawShards(
  ctx: CanvasRenderingContext2D,
  id: number,
  time: number,
  rage: number,
  x: number,
  y: number,
  halfW: number,
  r: number,
  hex: string,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = hex;
  for (const s of slabs(id, time, rage)) {
    if (!s.loose) continue;
    const w = halfW * (0.5 + Math.abs(s.shift));
    ctx.globalAlpha = 0.18 + rage * 0.22;
    ctx.fillRect(
      x + Math.sign(s.shift) * halfW + s.shift * halfW * 1.6,
      y + s.top * r,
      w,
      Math.max(0.6, s.height * r * 0.35),
    );
  }
  ctx.restore();
}
