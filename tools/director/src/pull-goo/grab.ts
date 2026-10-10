import type { Point } from "@neon-spore/content";
import { PALETTE, smoothstep } from "@neon-spore/render";
import { choice } from "../field-try-bar.js";
import { drop, type GooBody } from "./body.js";
import { clamp01, hash, mix, settle } from "./noise.js";
import { type Run, runPoint } from "./strand.js";
import type { GooStyle } from "./style.js";

/**
 * **How a GOO drop is taken, and how it goes while it is pulled** — the
 * owner, 10 October 2026: *we can also improve the visual when i start
 * pulling and while pulling (variants)*. Four, on the PULL LAB's bar for
 * every GOO look at once, as the drop is (`drop-look.ts`):
 *
 * - **LEAN**: as it was — taken, it leans into the pull;
 * - **SQUISH**: pressed flat under the thumb, it springs up wobbling and a
 *   few drops of goo splash off it; pulled, it stretches and quivers;
 * - **LIFT**: taken, it rises off the floor towards the eye, a shadow
 *   opening under it and under its tail, and is set down when let go;
 * - **CHARGE**: taken, it lights from inside; pulled, light runs up its
 *   tail into it and it glows brighter and greener the nearer the end.
 *
 * A director setting, not the game's: nothing here is stored.
 */
export type Grab = "lean" | "squish" | "lift" | "charge";

export const GOO_GRAB: { kind: Grab } = { kind: "squish" };

/** The drop under the hand: where, how big, the way it is pulled, how near the edge of
 * the path its rim is, and how long ago it was taken. */
export interface Hold {
  readonly at: Point;
  readonly r: number;
  readonly way: Point;
  readonly near: number;
  readonly grabbed: number;
  readonly time: number;
}

/** Seconds a LIFT takes to rise off the floor. */
const RISE = 0.18;
/** How far the drop rises, and the shadow falls away from it, in drop radii. */
const UP = 0.2;
const SHADOW = { x: 0.3, y: 0.5 };

const risen = (grabbed: number): number => smoothstep(clamp01(grabbed / RISE));

/** The held drop's body, as the bar's grab has it. */
export function heldBody(h: Hold): GooBody {
  const stretch = 0.22 + 0.15 * h.near;
  const base = { lean: h.way, stretch, shake: 0.12 * h.near };
  if (GOO_GRAB.kind === "squish") {
    const into = smoothstep(clamp01(h.grabbed / 0.3));
    return drop(h.at, h.r, {
      ...base,
      stretch: stretch * into + 0.07 * Math.sin(h.time * 9) * into,
      shake: base.shake + 0.05 * into,
      squash: 1 + 0.4 * settle(h.grabbed, 7, 19),
    });
  }
  if (GOO_GRAB.kind === "lift") {
    const up = risen(h.grabbed);
    return drop({ x: h.at.x, y: h.at.y - h.r * UP * up }, h.r * (1 + 0.16 * up), base);
  }
  return drop(h.at, h.r, base);
}

/** Under the held drop: LIFT's shadow on the floor. */
export function underHeld(ctx: CanvasRenderingContext2D, h: Hold, style: GooStyle): void {
  if (GOO_GRAB.kind !== "lift") return;
  const up = risen(h.grabbed);
  const at = { x: h.at.x + h.r * SHADOW.x * up, y: h.at.y + h.r * SHADOW.y * up };
  shadow(ctx, at, h.r, style.neon, up);
}

/** Over the held drop: SQUISH's splash and CHARGE's light from inside, both as it is taken. */
export function overHeld(ctx: CanvasRenderingContext2D, h: Hold, style: GooStyle): void {
  if (GOO_GRAB.kind === "squish") {
    splash(ctx, h, style);
    inner(ctx, h.at, h.r, style.neon, 0.35 * (1 - clamp01(h.grabbed / 0.25)));
  }
  if (GOO_GRAB.kind === "charge")
    inner(ctx, h.at, h.r, style.neon, 0.6 * (1 - clamp01(h.grabbed / 0.35)));
}

/** Under the tail: LIFT's shadow of it, `tail` the path it is drawn in. */
export function underTail(ctx: CanvasRenderingContext2D, tail: Path2D, h: Hold): void {
  if (GOO_GRAB.kind !== "lift") return;
  const up = risen(h.grabbed);
  ctx.save();
  ctx.translate(h.r * SHADOW.x * up * 0.6, h.r * SHADOW.y * up * 0.6);
  ctx.fillStyle = "#000000";
  ctx.globalAlpha = 0.35 * up;
  ctx.fill(tail);
  ctx.restore();
}

/** Over the tail: CHARGE's light running up it into the drop, and the drop's glow,
 * `p` 0..1 of the way to the end. */
export function overTail(
  ctx: CanvasRenderingContext2D,
  run: Run,
  h: Hold,
  style: GooStyle,
  p: number,
): void {
  if (GOO_GRAB.kind !== "charge") return;
  const color = mix(style.neon, PALETTE.good, p);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const tip = runPoint(run, 1);
  const pulse = 0.5 + 0.5 * Math.sin(h.time * (5 + 9 * p));
  const rr = h.r * (1.6 + 0.6 * p);
  const g = ctx.createRadialGradient(tip.x, tip.y, h.r * 0.5, tip.x, tip.y, rr);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.globalAlpha = (0.15 + 0.6 * p) * (0.7 + 0.3 * pulse);
  ctx.beginPath();
  ctx.arc(tip.x, tip.y, rr, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = mix(color, "#FFFFFF", 0.5);
  for (let j = 0; j < 4; j++) {
    const u = (h.time * 1.3 + j / 4) % 1;
    const q = runPoint(run, u);
    ctx.globalAlpha = Math.sin(Math.PI * u) * (0.35 + 0.5 * p);
    ctx.beginPath();
    ctx.arc(q.x, q.y, h.r * (0.06 + 0.1 * u * u), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Where a lifted drop's shadow falls, `k` 0..1 of the lift: on a field this dark a
 * shadow alone is not seen, so the drop's own neon is spilled on the floor round it. */
function shadow(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  neon: string,
  k: number,
): void {
  if (k <= 0.01) return;
  ctx.save();
  const g = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, r * 1.6);
  g.addColorStop(0, "rgba(0,0,0,0.9)");
  g.addColorStop(0.5, "rgba(0,0,0,0.7)");
  g.addColorStop(0.68, mix(neon, "#000000", 0.35));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.globalAlpha = 0.75 * k;
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, r * 1.6, r * 1.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Light inside the drop, `alpha` strong. */
function inner(ctx: CanvasRenderingContext2D, at: Point, r: number, color: string, alpha: number) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(at.x, at.y, 0, at.x, at.y, r * 1.2);
  g.addColorStop(0, mix(color, "#FFFFFF", 0.6));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Seconds SQUISH's drops take to fly off and land. */
const SPLASH = 0.4;

/** A few drops of goo thrown off the rim as the thumb presses, falling as they go. */
function splash(ctx: CanvasRenderingContext2D, h: Hold, style: GooStyle): void {
  const t = h.grabbed / SPLASH;
  if (t >= 1) return;
  ctx.save();
  ctx.fillStyle = style.neon;
  for (let i = 0; i < 7; i++) {
    const a = hash(i * 4.1 + 2) * Math.PI * 2;
    const out = 1 - (1 - t) ** 2;
    const d = h.r * (1 + (0.5 + 0.7 * hash(i * 2.9)) * out);
    const size = h.r * (0.06 + 0.07 * hash(i * 6.3)) * (1 - t);
    ctx.globalAlpha = 0.9 * (1 - t);
    ctx.beginPath();
    ctx.arc(
      h.at.x + Math.cos(a) * d,
      h.at.y + Math.sin(a) * d + h.r * 0.5 * t * t,
      size,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}

/** The bar's choice of grab. */
export function grabChoice(): HTMLElement {
  return choice(
    [
      ["GRAB · LEAN", "lean"],
      ["GRAB · SQUISH", "squish"],
      ["GRAB · LIFT", "lift"],
      ["GRAB · CHARGE", "charge"],
    ] as [string, Grab][],
    GOO_GRAB.kind,
    (kind) => {
      GOO_GRAB.kind = kind;
    },
  );
}
