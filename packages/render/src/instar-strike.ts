import type { InstarPart } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import type { Point } from "./instar-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **What THE INSTAR does when the pair do not stop it**, one picture per
 * part, each the owner's own words of 25 September 2026:
 *
 * - the **jaw** — *the full screen will be covered in fire*: the fire leaves
 *   the mouth and floods the whole screen, and burns off it;
 * - the **eggs** — *many many tiny dragons go out of an egg and eat our
 *   ship*: a swarm hatches off the nests, flies down to the hull and gnaws
 *   along it;
 * - the **tail** — *the tail will hit the players ship*: the blades come down
 *   on the hull, and a ring of shock runs out of where they struck.
 *
 * The damage is the simulation's (`sim/instar-step.ts`, `strike`) and is the
 * same for all three; this is only what it looks like. It outlives the frame
 * the strike landed on, so it lives in `InstarFx` and is cleared with it
 * (`restart.test.ts`).
 */

const FIRE_SECONDS = 1.6;
const SWARM_SECONDS = 2;
const SLAM_SECONDS = 0.8;
/** How many hatch off the nests. */
const SWARM = 26;
/** When each of the swarm reaches the hull, in seconds after it hatched. */
const FLY_SECONDS = 0.6;

interface Strike {
  part: InstarPart;
  /** Where it comes from: the mouth, the nests, the blades. */
  from: readonly Point[];
  x: number;
  age: number;
}

const LIFE: Record<InstarPart, number> = {
  jaw: FIRE_SECONDS,
  eggs: SWARM_SECONDS,
  tail: SLAM_SECONDS,
  hand: SLAM_SECONDS,
  tongue: SLAM_SECONDS,
  head: SLAM_SECONDS,
  eye: SLAM_SECONDS,
  fire: FIRE_SECONDS,
};

export class InstarStrike {
  private now: Strike | null = null;

  /** The part that was not stopped, where it strikes from, and the column it hits. */
  hit(part: InstarPart, from: readonly Point[], x: number): void {
    this.now = { part, from, x, age: 0 };
  }

  get active(): boolean {
    return this.now !== null;
  }

  update(dt: number): void {
    if (this.now === null) return;
    this.now.age += dt;
    if (this.now.age >= LIFE[this.now.part]) this.now = null;
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    const s = this.now;
    if (s === null) return;
    const t = s.age / LIFE[s.part];
    if (s.part === "jaw" || s.part === "fire")
      drawFlood(ctx, l, s.from[0] ?? { x: l.width / 2, y: l.gridTop }, t);
    else if (s.part === "eggs") drawSwarm(ctx, l, s.from, s.age);
    else drawSlam(ctx, l, s.from, s.x, t);
  }

  clear(): void {
    this.now = null;
  }
}

/** The fire out of the mouth: a front running to the corners, then the whole
 * screen alight, then burning off. */
function drawFlood(ctx: CanvasRenderingContext2D, l: Layout, mouth: Point, t: number): void {
  const far = Math.hypot(
    Math.max(mouth.x, l.width - mouth.x),
    Math.max(mouth.y, l.height - mouth.y),
  );
  const front = far * Math.min(1, t / 0.25) + 1;
  const a = t < 0.25 ? 1 : Math.max(0, 1 - (t - 0.25) / 0.75);
  ctx.save();
  const g = ctx.createRadialGradient(mouth.x, mouth.y, 0, mouth.x, mouth.y, front);
  g.addColorStop(0, rgba(PALETTE.podRim, 0.95 * a));
  g.addColorStop(0.35, rgba(PALETTE.pod, 0.85 * a));
  g.addColorStop(0.85, rgba(PALETTE.ember, 0.75 * a));
  g.addColorStop(1, rgba(PALETTE.emberRim, 0.4 * a));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, l.width, l.height);
  // Tongues of flame licking up off the hull while it burns.
  ctx.fillStyle = rgba(PALETTE.pod, 0.7 * a);
  const n = 9;
  for (let i = 0; i < n; i++) {
    const x = l.gridLeft + ((i + 0.5) / n) * l.gridWidth;
    const h = l.tile * (1.2 + 1.3 * sinHash(i)) * (0.7 + 0.3 * Math.sin(t * 30 + i));
    ctx.beginPath();
    ctx.moveTo(x - l.tile * 0.4, l.hullY);
    ctx.quadraticCurveTo(
      x,
      l.hullY - h * 0.4,
      x + Math.sin(t * 20 + i) * l.tile * 0.2,
      l.hullY - h,
    );
    ctx.quadraticCurveTo(x + l.tile * 0.1, l.hullY - h * 0.4, x + l.tile * 0.4, l.hullY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** The hatchlings: each off a nest, down to its own place on the hull, and
 * gnawing there until the swarm is spent. */
function drawSwarm(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  nests: readonly Point[],
  age: number,
): void {
  const fading = Math.max(0, Math.min(1, (SWARM_SECONDS - age) / 0.4));
  for (let i = 0; i < SWARM; i++) {
    const born = sinHash(i) * 0.5;
    const u = (age - born) / FLY_SECONDS;
    if (u < 0) continue;
    const nest = nests[i % Math.max(1, nests.length)] ?? { x: l.width / 2, y: l.gridTop };
    const to = { x: l.gridLeft + sinHash(i + 50) * l.gridWidth, y: l.hullY - l.tile * 0.15 };
    const k = Math.min(1, u);
    const e = smoothstep(k);
    const gnaw = u >= 1 ? Math.sin(age * 40 + i) * l.tile * 0.08 : 0;
    const x = nest.x + (to.x - nest.x) * e + Math.sin(u * 9 + i) * l.tile * 0.3 * (1 - k) + gnaw;
    const y = nest.y + (to.y - nest.y) * e - Math.sin(Math.PI * k) * l.tile * 0.8;
    drawHatchling(ctx, x, y, l.tile * 0.22, age * 24 + i, to.x < nest.x ? -1 : 1, fading);
  }
}

/** One tiny dragon: a body, a head, two flapping wings. */
function drawHatchling(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  flap: number,
  dir: number,
  alpha: number,
): void {
  const w = size * (0.6 + 0.6 * Math.abs(Math.sin(flap)));
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.bileRim, 0.85 * alpha);
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + s * size * 1.3, y - w);
    ctx.lineTo(x + s * size * 0.7, y + size * 0.1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = rgba(PALETTE.bile, alpha);
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.6, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + dir * size * 0.6, y - size * 0.15, size * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.red, alpha);
  ctx.beginPath();
  ctx.arc(x + dir * size * 0.7, y - size * 0.2, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The blades down on the hull: a red stroke from each, and the shock
 * running out along the hull from where the tail struck. */
function drawSlam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  blades: readonly Point[],
  x: number,
  t: number,
): void {
  const a = 1 - t;
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.red, a);
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.outline * (1 + 3 * a);
  for (const b of blades) {
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x + (x - b.x) * 0.3, l.hullY);
    ctx.stroke();
  }
  ctx.strokeStyle = rgba(PALETTE.redRim, a);
  ctx.lineWidth = STROKE.outline * (1 + a);
  const w = l.tile * (0.5 + 5 * t);
  ctx.beginPath();
  ctx.ellipse(x, l.hullY, w, w * 0.25, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
