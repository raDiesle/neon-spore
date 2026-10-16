import {
  type BroodState,
  broodHangs,
  broodLitStep,
  broodLobes,
  broodLobesAll,
  type World,
} from "@neon-spore/sim";
import { bossAura } from "./body-aura.js";
import { drawHurt } from "./boss-hurt.js";
import { drawBroodBud } from "./brood-bud.js";
import type { BroodFx } from "./brood-fx.js";
import { broodBudX, broodRimOver, broodRipe, broodSacAt, type SacBox } from "./brood-place.js";
import { broodOutline } from "./brood-shape.js";
import { halo } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE BROOD, drawn: a sac of green slime hung over the middle of the field,
 * breathing on the beat, with its buds hanging off its belly on stalks
 * (`brood-bud.ts`) — and nothing else, because the panel is the split: both
 * screens see the same sac, and the pair splits the cannon and the colour.
 *
 * **The shape is BULB · PEBBLE** (`tools/shape-sheet/src/drafts/offered.ts`),
 * free since THE RIME went: a soft round body under a wobble larger than its
 * lobes. Taken wide, nine columns across and its belly flattened over them
 * (`brood-place.ts`), with **one lobe on its rim for every bud still to
 * pop** — so its health is its outline, and the rim goes smooth as the fight
 * is won. It shrinks with them, a little, the same way.
 *
 * **It turns.** Its skin carries two faces, round a sphere: the front pocked
 * with the pale rings of buds already grown, the back netted with dark veins.
 * Every rest turns it half round about its upright axis, so the face the
 * pair was reading goes and the other comes, and the next step's buds grow
 * on the face that came round.
 *
 * Comes down from above the frame; beaten, it sags, greys and goes.
 */

/** Spots round the sphere of its skin, half of each face. */
const SPOTS = 14;

/** The sac's breath, 0 at the beat and back to it, peaking halfway. */
function breathOf(beatPhase: number): number {
  return 0.5 - 0.5 * Math.cos(beatPhase * Math.PI * 2);
}

export function drawBrood(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: BroodState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: BroodFx,
): void {
  const cfg = world.cfg;
  const box = broodSacAt(l, cfg, s, beat, beatPhase);
  const breath = s.phase === "spent" ? 0 : breathOf(beatPhase);
  const sac = { ...box, rx: box.rx * (1 + 0.015 * breath), ry: box.ry * (1 + 0.04 * breath) };
  const spent = s.phase === "spent";
  const lobes = s.phase === "enter" ? broodLobesAll(s) : broodLobes(s);
  const body = splinePath(broodOutline(sac, lobes, l.tile, time), true);

  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  ctx.globalAlpha = sac.alpha;

  paintFlesh(ctx, body, sac, l.tile, spent);
  drawFaces(ctx, body, sac, l.tile, spent);
  drawHurt(ctx, body, fx.hurt.value);

  // The buds over the belly they grow out of.
  if (broodLitStep(s) !== null) {
    s.buds.forEach((b, i) => {
      if (b.popped) return;
      const x = broodBudX(l, b);
      const ripe = broodHangs(world, b) ? broodRipe(s, b, beat, beatPhase) : -1;
      const rimY = broodRimOver(sac, x);
      const bud = { rimX: x, rimY, x, color: b.color, ripe, tile: l.tile, time };
      drawBroodBud(ctx, { ...bud, seed: i * 1.7 + b.col });
    });
  }
  ctx.restore();
  fx.draw(ctx, l);
}

/** Translucent green slime, lit from above, darker and thicker toward the belly. */
function paintFlesh(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  sac: SacBox,
  tile: number,
  spent: boolean,
): void {
  const core = spent ? PALETTE.rockDark : mixHex(PALETTE.organ, PALETTE.background, 0.45);
  const edge = spent ? PALETTE.sparkDim : PALETTE.organ;
  const g = ctx.createRadialGradient(
    sac.x - sac.rx * 0.2,
    sac.y - sac.ry * 0.45,
    tile * 0.3,
    sac.x,
    sac.y,
    Math.max(sac.rx, sac.ry),
  );
  g.addColorStop(0, rgba(mixHex(edge, PALETTE.text, 0.25), 0.85));
  g.addColorStop(0.55, rgba(core, 0.82));
  g.addColorStop(1, rgba(mixHex(core, PALETTE.background, 0.5), 0.92));
  // Its light round the sac, under it; a spent sac is out (`body-aura.ts`).
  if (!spent) bossAura(ctx, body, PALETTE.organ, tile, 0);
  ctx.fillStyle = g;
  ctx.fill(body);
  ctx.save();
  ctx.lineJoin = "round";
  ctx.strokeStyle = rgba(spent ? PALETTE.dim : PALETTE.organRim, 0.8);
  ctx.lineWidth = Math.max(1.5, tile * 0.07);
  ctx.stroke(body);
  ctx.restore();
  if (!spent)
    halo(ctx, sac.x - sac.rx * 0.25, sac.y - sac.ry * 0.5, tile * 0.9, PALETTE.organRim, 0.25);
}

/**
 * Its two faces round a sphere: each spot stands at a longitude, seen while
 * that longitude faces the pair, squeezed toward the rim as it turns away.
 * The even spots are the front's pale rings, the odd the back's dark veins,
 * and the front's sit where the back's do not.
 */
function drawFaces(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  sac: SacBox,
  tile: number,
  spent: boolean,
): void {
  ctx.save();
  ctx.clip(body);
  for (let i = 0; i < SPOTS; i++) {
    const front = i % 2 === 0;
    // The front's spots on the near half at no turn, the back's on the far.
    const lon = (front ? 0 : Math.PI) + ((Math.floor(i / 2) / (SPOTS / 2)) * 2 - 1) * 1.25;
    const lat = ((i * 0.37) % 1) * 1.1 - 0.75;
    const a = lon + sac.turn;
    const facing = Math.cos(a);
    if (facing <= 0.05) continue;
    const x = sac.x + Math.sin(a) * Math.cos(lat) * sac.rx * 0.82;
    const y = sac.y + Math.sin(lat) * sac.ry * 0.8;
    const r = tile * (0.18 + 0.08 * ((i * 0.53) % 1));
    ctx.globalAlpha = facing * (spent ? 0.4 : 0.85);
    ctx.beginPath();
    ctx.ellipse(x, y, r * facing, r, 0, 0, Math.PI * 2);
    if (front) {
      ctx.strokeStyle = rgba(PALETTE.organRim, 0.7);
      ctx.lineWidth = Math.max(1, tile * 0.05);
      ctx.stroke();
    } else {
      ctx.fillStyle = rgba(PALETTE.vein, 0.75);
      ctx.fill();
      ctx.strokeStyle = rgba(PALETTE.vein, 0.6);
      ctx.lineWidth = Math.max(1, tile * 0.035);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.sin(a) * r * 2.4 * facing, y + r * 1.8);
      ctx.stroke();
    }
  }
  ctx.restore();
}
