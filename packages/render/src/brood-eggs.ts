import { facet, pin } from "@neon-spore/content";
import { type BroodEgg, type BroodState, broodCentre, type SimConfig } from "@neon-spore/sim";
import { paintBroodBody } from "./brood-bud.js";
import { broodRimOver, type SacBox } from "./brood-place.js";
import { livingRadius } from "./creature-place.js";
import { colorTrio } from "./creature-tint.js";
import { smoothstep } from "./ease.js";
import { mixHex, rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE BROOD is growing inside**, seen through its skin — the owner,
 * 16 October 2026: *it should look like something what is producing
 * enemies*, and *they also spawn in the whole body … like pooping out*.
 *
 * - **A body to be laid** (`BroodEgg`) is the slick or the bulb it will be,
 *   drawn as the field draws it under a film of the sac's slime: it starts
 *   high in the sac, small and dim, and over `broodLayLeadBeats` it sinks to
 *   the belly over its column, swelling and brightening, and in its last
 *   third it presses the belly out (`broodEggBulges`) — the sac is seen to
 *   push it. The moment it is laid it is the field's own body.
 * - **The brood** is a clutch of small curled bodies in both colours drifting
 *   slowly round inside it, all the time — not anything the simulation keeps,
 *   only so the sac always reads as full of what it lays.
 */

/** How much of a body a laid one is as it begins inside, and as it leaves. */
const EGG_FROM = 0.65;
const EGG_TO = 1.05;
/** The small curled bodies always drifting inside, each pinned round a ball inside the sac. */
const CLUTCH = Array.from({ length: 9 }, (_, i) =>
  pin((i / 9) * Math.PI * 2, Math.sin(i * 2.7) * 0.55 - 0.1, 1),
);

/** How far through its time inside an egg is this frame, 0 as begun and 1 as laid. */
export function broodEggAge(
  cfg: SimConfig,
  egg: BroodEgg,
  beat: number,
  beatPhase: number,
): number {
  const lead = Math.max(1, cfg.broodLayLeadBeats);
  return Math.max(0, Math.min(1, 1 - (egg.layBeat - (beat + beatPhase)) / lead));
}

interface EggAt {
  x: number;
  y: number;
  r: number;
  /** 0 until it presses the belly, then up to 1 as it leaves. */
  push: number;
}

/** Where an egg is drawn this frame: sinking from high in the sac to the belly. */
export function broodEggAt(l: Layout, sac: SacBox, egg: BroodEgg, k: number): EggAt {
  const x = tileCX(l, egg.col);
  const r = livingRadius(l.tile, EGG_FROM + (EGG_TO - EGG_FROM) * k);
  const top = sac.y - sac.ry * 0.35;
  const belly = broodRimOver(sac, x) - r * 0.35;
  const y = top + (belly - top) * smoothstep(k);
  return { x, y, r, push: Math.max(0, (k - 0.66) / 0.34) };
}

/** The swellings on the belly where an egg is pushing out, for the outline (`brood-shape.ts`). */
export function broodEggBulges(
  l: Layout,
  cfg: SimConfig,
  sac: SacBox,
  s: BroodState,
  beat: number,
  beatPhase: number,
): { x: number; y: number; r: number }[] {
  const out: { x: number; y: number; r: number }[] = [];
  for (const egg of s.eggs) {
    const at = broodEggAt(l, sac, egg, broodEggAge(cfg, egg, beat, beatPhase));
    if (at.push <= 0) continue;
    const rim = broodRimOver(sac, at.x);
    out.push({
      x: at.x,
      y: rim - at.r * 0.4 + at.r * 0.75 * at.push,
      r: at.r * (0.75 + 0.2 * at.push),
    });
  }
  return out;
}

/** Everything inside the sac, clipped to it: the drifting brood, then the bodies to be laid. */
export function drawBroodInside(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  body: Path2D,
  sac: SacBox,
  s: BroodState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  ctx.save();
  ctx.clip(body);
  drawClutch(ctx, sac, l.tile, time);
  s.eggs.forEach((egg, i) => {
    const k = broodEggAge(cfg, egg, beat, beatPhase);
    const at = broodEggAt(l, sac, egg, k);
    const rot = Math.sin(time * 1.3 + i * 2.1) * 0.35 * (1 - k);
    ctx.globalAlpha = sac.alpha * (0.55 + 0.45 * k);
    paintBroodBody(ctx, egg.color, at.x, at.y, at.r, time + i * 3.1, rot);
    // The sac's own slime over it: it is inside, not in front.
    ctx.globalAlpha = sac.alpha * (0.35 * (1 - k) + 0.08);
    ctx.fillStyle = rgba(PALETTE.organ, 1);
    ctx.beginPath();
    ctx.arc(at.x, at.y, at.r * 1.15, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/**
 * A port in the belly over every column the sac covers — the whole body lays,
 * not one mouth — each a dark valve in a metal ring, opening in a body's
 * colour as a body pushes through it.
 */
export function drawBroodPorts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  sac: SacBox,
  s: BroodState,
  beat: number,
  beatPhase: number,
): void {
  const centre = broodCentre(cfg, s);
  ctx.save();
  ctx.globalAlpha = sac.alpha;
  for (let col = centre - cfg.broodSpan; col <= centre + cfg.broodSpan; col++) {
    const x = tileCX(l, col);
    const egg = s.eggs.find((e) => e.col === col);
    const at = egg && broodEggAt(l, sac, egg, broodEggAge(cfg, egg, beat, beatPhase));
    const push = at?.push ?? 0;
    const r = l.tile * (0.26 + 0.22 * push);
    const y = broodRimOver(sac, x) - l.tile * 0.12 + (at ? at.r * 0.75 * push : 0);
    ctx.fillStyle = rgba(push > 0 && egg ? colorTrio(egg.color).dark : PALETTE.background, 0.95);
    ctx.strokeStyle = rgba(PALETTE.rock, 0.75);
    ctx.lineWidth = Math.max(1.2, l.tile * 0.06);
    ctx.beginPath();
    ctx.ellipse(x, y, r, l.tile * (0.1 + 0.1 * push), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Small curled bodies of both colours, wheeling slowly round inside the sac:
 * placed round a ball inside it (`surface.ts`) and carried by the sac's own
 * turn, the far ones seen dimmer through it rather than not at all.
 */
function drawClutch(ctx: CanvasRenderingContext2D, sac: SacBox, tile: number, time: number): void {
  CLUTCH.forEach((p, i) => {
    const f = facet(p, time * 0.25 + sac.turn);
    const x = sac.x + f.x * sac.rx * 0.7;
    const y = sac.y + (f.y + Math.sin(time * 0.4 + i) * 0.12) * sac.ry * 0.6;
    const r = tile * (0.26 + 0.08 * ((i * 0.61) % 1)) * (0.75 + 0.25 * f.sx);
    const tint = colorTrio(i % 2 === 0 ? "red" : "cyan");
    ctx.globalAlpha = sac.alpha * (0.4 + 0.35 * Math.max(0, f.sx));
    ctx.fillStyle = rgba(mixHex(tint.dark, tint.hex, 0.35), 1);
    ctx.strokeStyle = rgba(tint.hex, 0.85);
    ctx.lineWidth = Math.max(1, tile * 0.05);
    ctx.beginPath();
    // Curled: a body with a bite of its own tail, a crescent rather than a dot.
    const a = 0.6 + time * 0.5 + i;
    ctx.arc(x, y, r, a, a + Math.PI * 1.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
}
