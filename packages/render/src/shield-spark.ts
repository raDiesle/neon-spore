import type { Point } from "@neon-spore/content";
import type { Layout } from "./layout.js";
import { tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The shield's ambient arcs: a few thin discharges thrown outward from the
 * rim, gone almost as soon as they appear.
 *
 * Its own file because `shield.ts` was already at the file-length limit —
 * the same reason `deflect-look.ts` sits beside `deflect.ts`, see that
 * commit's own message. These values are the shipped
 * ones — the shield throws a few arcs the whole time it is on the field. That
 * was an offer under `shield:charge` until the owner asked for it by name; the
 * record stays a record because the shape of the arc is still worth patching.
 *
 * Nothing here is stored between calls. An arc's whole life — when it is
 * born, how it bends, when it dies — is read off `time` alone, the same way
 * the rim's own shimmer is (`shield.ts`'s `WARD_LOOK`): `time` already goes
 * back to zero on a wave restart, so a formula of it needs no entry in
 * `Effects.reset()` to stay correct the way a stored list of live sparks
 * would have. That was the more obvious shape for this and it was not taken
 * — see the report on this lane for why.
 *
 * Deliberately not given `armed`: the guard's own window already got a
 * signal today (`guardLapse`, in `shield.ts`), and these arcs are asked to
 * say only that the shield exists and is charged, nothing about the instant
 * of a catch. `drawShieldSparks` takes no such parameter on purpose — its
 * caller has `armed` sitting right there in scope, which is the seam a later
 * change could reach for by accident.
 */
export interface ShieldSparkLook {
  /** Expected arcs per second, summed over every slot below. 0 draws none. */
  perSecond: number;
  /** How long one arc is visible, in seconds. */
  life: number;
  /** How far it reaches outward from the rim, in tiles. */
  reachMul: number;
  /** Segments in the main stem — more reads as more jagged. */
  segments: number;
  /** Sideways jitter per segment, as a share of a tile. */
  jitter: number;
  /** Share of arcs that grow one short side branch. */
  forkChance: number;
  /** Stroke width, in pixels. */
  width: number;
  /** Brightness of the soft pass drawn under the stroke. */
  intensity: number;
}

/**
 * The shipped shield: a few thin arcs, always.
 *
 * Adopted from the `shield:charge` / `arcs` candidate on the owner's word —
 * *"Where did the small default random lightlings from shield of ship went?
 * […] it should be there all the time."* The record shipped inert
 * (`perSecond: 0`) while the look was still an offer; these are that
 * candidate's own values, unchanged, and the candidate directory is gone.
 *
 * Two numbers were set by the owner looking at the candidate on OTHER
 * GRAPHICS and asking for less of it — *"1/3 high and 2 of them, which spawn
 * on random positions on the line of the shield"*. So `reachMul` is a third of
 * what the candidate offered, and `SLOTS` is 2 rather than 3. The spawn was
 * already what was asked for: `drawShieldSparks` picks each arc's origin
 * anywhere along the shield's own span.
 *
 * The rate is deliberately low on top of that: two independent timers each
 * firing every second or two, each arc alive for a sixth of one. A shield that
 * crackles continuously reads as a texture; one that spits now and then reads
 * as a thing under load. `frame.test.ts` pins that share of time rather than
 * leaving it to the next reader's eye.
 */
export const SHIELD_SPARK_LOOK: ShieldSparkLook = {
  perSecond: 1.4,
  life: 0.16,
  reachMul: 0.3,
  segments: 4,
  jitter: 0.18,
  forkChance: 0.45,
  width: 1.5,
  intensity: 1.1,
};

/**
 * The shield standing under a clasp, as a look rather than as a second effect.
 *
 * This is the tell the owner asked for: *"the lightning bolts of the shield
 * become much taller, indicating to user that shield reacts on their shield."*
 * The arcs already existed here, thrown at an ambient rate, and what a clasp
 * in the column changes is how far they reach. So the two states are the same
 * effect at two settings rather than a quiet rim and a separate event: the
 * player already knows what that light is by the time it grows.
 *
 * `reachMul` is the number that carries "much taller", and it is the largest
 * multiple here on purpose: the rest of the arc's character stays the same so
 * that what grew is legible as one property changing rather than as a
 * different effect arriving.
 *
 * A boolean would have done, and the parameter is a 0..1 number so the other
 * end of the connection can be lit by the same value — `claspResonance` in
 * `clasp.ts` feeds both, which is what makes this read as one link forming
 * rather than as two things separately noticing each other.
 */
export function resonantLook(base: ShieldSparkLook, resonance: number): ShieldSparkLook {
  const t = Math.max(0, Math.min(1, resonance));
  return {
    ...base,
    // From nothing, since the shipped ambient rate is zero and this look must
    // work whether or not `shield:charge` is ever adopted.
    perSecond: base.perSecond + 9 * t,
    life: 0.2,
    reachMul: base.reachMul + 2.2 * t,
    segments: 5,
    jitter: 0.2,
    forkChance: 0.55,
    width: base.width + 0.4 * t,
    intensity: base.intensity,
  };
}

/** Two independent timers rather than one, so the arcs never fire on the same
 * clock — the owner's "2 of them", irregularly, rather than a strobe. */
const SLOTS = 2;

/** Deterministic, not `Math.random`: `time` is each device's own wall clock
 * (`apps/game/src/main.ts`), so this draws the same arc on the same device
 * from one frame to the next, not the same arc on both devices at once — the
 * way the rim's shimmer already works. */
function hash(n: number): number {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/** -1..1 from the same stream, for jitter that bends both ways. */
function signedHash(n: number): number {
  return hash(n) * 2 - 1;
}

/**
 * A few thin, branched arcs thrown outward from the shield's rim — sudden,
 * brief, then gone. `cols` is the shield's current segment columns, the same
 * ones `drawShieldRim` spans its own rim across; `surface` places a point on
 * the hull's real, breathing contour, the way it always does.
 */
export function drawShieldSparks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  cols: readonly number[],
  surface: (x: number) => Point,
  resonance = 0,
): void {
  const look = resonance > 0 ? resonantLook(SHIELD_SPARK_LOOK, resonance) : SHIELD_SPARK_LOOK;
  if (look.perSecond <= 0 || cols.length === 0) return;
  const colMin = Math.min(...cols);
  const colMax = Math.max(...cols);

  for (let k = 0; k < SLOTS; k++) {
    const period = (SLOTS / look.perSecond) * (0.7 + hash(k * 53.7) * 0.9);
    const activeFrac = Math.min(0.5, Math.max(0.02, look.life / period));
    const phase = time / period + k / SLOTS;
    const cycle = Math.floor(phase);
    const pos = phase - cycle;
    if (pos >= activeFrac) continue;
    drawOneArc(ctx, l, cycle, k, pos / activeFrac, colMin, colMax, surface, look);
  }
}

function drawOneArc(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cycle: number,
  slot: number,
  age: number,
  colMin: number,
  colMax: number,
  surface: (x: number) => Point,
  look: ShieldSparkLook,
): void {
  const attack = Math.min(1, age / 0.15);
  const decay = 1 - Math.max(0, (age - 0.15) / 0.85);
  const alpha = Math.max(0, Math.min(1, attack * decay));
  if (alpha <= 0) return;

  const seed = cycle * 97 + slot * 31;
  const colFrac = hash(seed + 1);
  const originX = tileCX(l, colMin + (colMax - colMin) * colFrac);
  const origin = surface(originX);

  const pts: Point[] = [origin];
  const step = (look.reachMul * l.tile) / look.segments;
  for (let i = 1; i <= look.segments; i++) {
    const prev = pts[i - 1]!;
    pts.push({
      x: prev.x + signedHash(seed + i * 5) * look.jitter * l.tile,
      y: prev.y - step,
    });
  }
  strokeArc(ctx, pts, look.width, look.intensity, alpha);

  if (look.segments >= 3 && hash(seed + 99) < look.forkChance) {
    const forkAt = 1 + Math.floor(hash(seed + 7) * (look.segments - 2));
    const base = pts[forkAt]!;
    const branch: Point[] = [base];
    const branchStep = step * 0.7;
    for (let i = 1; i <= 2; i++) {
      const prev = branch[i - 1]!;
      branch.push({
        x: prev.x + signedHash(seed + 200 + i * 5) * look.jitter * l.tile * 1.4,
        y: prev.y - branchStep,
      });
    }
    strokeArc(ctx, branch, look.width * 0.8, look.intensity, alpha);
  }
}

/**
 * A jagged polyline, lit rather than smoothed — `strokeGlow` (`glow.ts`)
 * softens a curve meant to look drawn; a discharge is meant to look struck.
 * Plain `ctx` calls rather than a `Path2D`: nothing here is an SVG-authored
 * curve (`openSmoothPath`), so there is no `d` string to build one from.
 */
function strokeArc(
  ctx: CanvasRenderingContext2D,
  pts: readonly Point[],
  width: number,
  intensity: number,
  alpha: number,
): void {
  const draw = (): void => {
    ctx.beginPath();
    ctx.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
    ctx.stroke();
  };

  const prevComposite = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = PALETTE.shieldRim;
  ctx.globalAlpha = Math.max(0, Math.min(1, 0.3 * intensity * alpha));
  ctx.lineWidth = width * 2.4;
  draw();
  ctx.globalCompositeOperation = prevComposite;

  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  draw();
  ctx.globalAlpha = 1;
}
