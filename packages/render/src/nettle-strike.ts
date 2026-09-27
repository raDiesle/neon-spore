import type { NettlePart } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import type { Point } from "./instar-place.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **What THE NETTLE does when the pair do not stop it**, one picture per
 * kind of part, each ending in the same ring of shock along the hull:
 *
 * - the **arm** stings: a red lash out of each arm the pair left drawn, down
 *   to the column it struck;
 * - the **eyespots** glare: a wedge of light off each lit spot, burning down
 *   on the hull;
 * - the **sac** and its **spores** brood: the spores come loose and settle
 *   on the plating, and cling there until the swarm is spent;
 * - the **iris** and the **globs** drop: a drop falls out of the mouth or off
 *   the curtain's rim, and splashes on the hull;
 * - the **frill** lets its curtain down over the ship, strand by strand;
 * - the **core** flares: its light floods the screen from inside the bell.
 *
 * The damage is the simulation's (`sim/instar-step.ts`, `strike`, named for
 * this body since 27 September 2026) and is one hull breach for every part;
 * this is only what it looks like. It outlives the frame the strike landed
 * on, so it lives in `NettleFx` and is cleared with it (`restart.test.ts`).
 */

type Look = "sting" | "glare" | "brood" | "drop" | "curtain" | "flare";

const LOOK: Record<NettlePart, Look> = {
  arm: "sting",
  spot: "glare",
  sac: "brood",
  spore: "brood",
  mouth: "drop",
  glob: "drop",
  frill: "curtain",
  core: "flare",
};

/** How long each picture runs, in seconds. */
const LIFE: Record<Look, number> = {
  sting: 0.8,
  glare: 0.9,
  brood: 1.8,
  drop: 1,
  curtain: 1.2,
  flare: 1.6,
};

/** The share of a picture its travel takes; the shock runs after it. */
const TRAVEL: Record<Look, number> = {
  sting: 0.3,
  glare: 0.3,
  brood: 0.45,
  drop: 0.4,
  curtain: 0.5,
  flare: 0.25,
};

/** How many spores come loose, and strands come down. */
const SPORES = 18;
const STRANDS = 8;

interface Strike {
  look: Look;
  /** Where it comes from: the part's own marks, or the bell. */
  from: readonly Point[];
  bell: Point;
  bellR: number;
  x: number;
  age: number;
}

export class NettleStrike {
  private now: Strike | null = null;

  /** The part that was not stopped, where it strikes from, and the column it hits. */
  hit(part: NettlePart, from: readonly Point[], bell: Point, bellR: number, x: number): void {
    this.now = { look: LOOK[part], from: from.length > 0 ? from : [bell], bell, bellR, x, age: 0 };
  }

  get active(): boolean {
    return this.now !== null;
  }

  update(dt: number): void {
    if (this.now === null) return;
    this.now.age += dt;
    if (this.now.age >= LIFE[this.now.look]) this.now = null;
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    const s = this.now;
    if (s === null) return;
    const t = s.age / LIFE[s.look];
    const go = TRAVEL[s.look];
    const reach = smoothstep(Math.min(1, t / go));
    const after = Math.max(0, (t - go) / (1 - go));
    ctx.save();
    if (s.look === "sting" || s.look === "glare") drawReach(ctx, l, s, reach, after);
    else if (s.look === "brood") drawBrood(ctx, l, s, t);
    else if (s.look === "drop") drawDrop(ctx, l, s, Math.min(1, t / go));
    else if (s.look === "curtain") drawCurtain(ctx, l, s, reach, after);
    else drawFlare(ctx, l, s.bell, t);
    if (after > 0) drawShock(ctx, l, s.x, after);
    ctx.restore();
  }

  clear(): void {
    this.now = null;
  }
}

/** The lash and the glare: out of each part to the column, and pulled back as it fades. */
function drawReach(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: Strike,
  reach: number,
  after: number,
): void {
  const a = 1 - after;
  for (const p of s.from) {
    const tip = { x: p.x + (s.x - p.x) * reach, y: p.y + (l.hullY - p.y) * reach };
    if (s.look === "glare") {
      const w = l.tile * (0.25 + 0.6 * reach);
      ctx.fillStyle = rgba(PALETTE.ember, 0.55 * a);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(tip.x - w, tip.y);
      ctx.lineTo(tip.x + w, tip.y);
      ctx.closePath();
      ctx.fill();
      continue;
    }
    const side = s.x >= p.x ? 1 : -1;
    ctx.strokeStyle = rgba(PALETTE.red, a);
    ctx.lineCap = "round";
    ctx.lineWidth = STROKE.outline * (1 + 2 * a);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.quadraticCurveTo((p.x + tip.x) / 2 + side * l.tile, (p.y + tip.y) / 2, tip.x, tip.y);
    ctx.stroke();
  }
}

/** The spores off the sac: each drifts down to its own place near the column and clings. */
function drawBrood(ctx: CanvasRenderingContext2D, l: Layout, s: Strike, t: number): void {
  const fading = Math.max(0, Math.min(1, (1 - t) / 0.25));
  const go = TRAVEL.brood;
  ctx.fillStyle = rgba(PALETTE.bile, 0.85 * fading);
  for (let i = 0; i < SPORES; i++) {
    const from = s.from[i % s.from.length] ?? s.bell;
    const born = sinHash(i) * 0.3;
    const u = Math.min(1, Math.max(0, (t - born * go) / go));
    if (t < born * go) continue;
    const to = { x: s.x + (sinHash(i + 40) - 0.5) * l.tile * 4, y: l.hullY - l.tile * 0.1 };
    const e = smoothstep(u);
    const x = from.x + (to.x - from.x) * e + Math.sin(u * 7 + i) * l.tile * 0.25 * (1 - u);
    const y = from.y + (to.y - from.y) * e;
    ctx.beginPath();
    ctx.arc(x, y, l.tile * (0.08 + 0.05 * sinHash(i + 9)), 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A drop out of the iris or off the curtain's rim, falling as a weight falls. */
function drawDrop(ctx: CanvasRenderingContext2D, l: Layout, s: Strike, u: number): void {
  if (u >= 1) return;
  const fall = u * u;
  ctx.fillStyle = rgba(PALETTE.ember, 0.9);
  for (const p of s.from) {
    const x = p.x + (s.x - p.x) * fall;
    const y = p.y + (l.hullY - p.y) * fall;
    const r = l.tile * 0.22;
    ctx.beginPath();
    ctx.ellipse(x, y, r * (1 - 0.3 * u), r * (1 + 0.6 * u), 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** The oral arms let down across the field, over the ship, and drawn off as they fade. */
function drawCurtain(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: Strike,
  reach: number,
  after: number,
): void {
  const top = s.bell.y + s.bellR * 0.5;
  ctx.strokeStyle = rgba(PALETTE.red, 0.8 * (1 - after));
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.outline * 1.2;
  for (let i = 0; i < STRANDS; i++) {
    const k = i / (STRANDS - 1) - 0.5;
    const x = s.bell.x + k * s.bellR * 1.6;
    const late = sinHash(i + 3) * 0.3;
    const down = Math.max(0, Math.min(1, (reach - late) / (1 - late)));
    const end = top + (l.hullY - top) * down;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.quadraticCurveTo(x + Math.sin(i * 2.1) * l.tile * 0.5, (top + end) / 2, x, end);
    ctx.stroke();
  }
}

/** The core's light out of the bell: a front to the corners, then burning off. */
function drawFlare(ctx: CanvasRenderingContext2D, l: Layout, core: Point, t: number): void {
  const far = Math.hypot(Math.max(core.x, l.width - core.x), Math.max(core.y, l.height - core.y));
  const go = TRAVEL.flare;
  const front = far * Math.min(1, t / go) + 1;
  const a = t < go ? 1 : Math.max(0, 1 - (t - go) / (1 - go));
  const g = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, front);
  g.addColorStop(0, rgba(PALETTE.emberRim, 0.9 * a));
  g.addColorStop(0.5, rgba(PALETTE.ember, 0.7 * a));
  g.addColorStop(1, rgba(PALETTE.red, 0.35 * a));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, l.width, l.height);
}

/** The shock out along the hull from where the part struck. */
function drawShock(ctx: CanvasRenderingContext2D, l: Layout, x: number, t: number): void {
  const a = 1 - t;
  const w = l.tile * (0.5 + 5 * t);
  ctx.strokeStyle = rgba(PALETTE.redRim, a);
  ctx.lineWidth = STROKE.outline * (1 + a);
  ctx.beginPath();
  ctx.ellipse(x, l.hullY, w, w * 0.25, 0, 0, Math.PI * 2);
  ctx.stroke();
}
