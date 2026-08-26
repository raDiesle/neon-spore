import { type CreatureKind, fallTilesPerBeat } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTorchRock, drawTorchTail, torchRadius, torchRotation } from "./torch.js";

/** How long it sits sunk into the hull before it starts to drift off. Torch only. */
const STICK_LIFE = 2;
/** How long the slow drift away takes to fully fade. Torch only. */
const FLOAT_LIFE = 1.8;
/**
 * How long the tail it dragged down lasts once the rock is in the hull. Long
 * enough not to blink out between two frames, short enough that the streak is
 * gone by the time anyone reads the crater: a rock lodged in the skin with a
 * trail still hanging off it reads as still falling, and there is no falling
 * left to do.
 */
const TAIL_LIFE = 0.15;
/**
 * How long the *start* of the drift takes to reach its cruising height and
 * speed — the thing that used to jump instantly to a new height and speed
 * the moment it stopped being stuck. Everything about letting go eases
 * against this, not against `FLOAT_LIFE`, so the liftoff is a beat, not the
 * whole drift. Torch only.
 */
const RISE_TIME = 0.5;
/**
 * Sideways acceleration once it lets go, in px/s². A constant acceleration
 * from a standing start is the simplest curve that starts slow and ends
 * faster with no separate easing code of its own — the drift itself *is*
 * the ease. Torch only.
 */
const DRIFT_ACCEL = 28;

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

interface Impact {
  kind: CreatureKind;
  /**
   * Screen x at the moment of impact — fixed. The drift is computed from it
   * fresh every frame (`currentX`), not accumulated onto it tick by tick, so
   * there is no running velocity state to jump when the acceleration curve
   * changes phase.
   */
  x0: number;
  /**
   * Screen y the replayed last step of the fall starts from — the sim's own
   * `fromRow` at the beat the miss happened, the exact row render/ last drew
   * this creature at. Computed backwards from the hull instead, this used to
   * land up to a tile off; carrying the real row removes the guess.
   */
  y0: number;
  /** px/s — the same speed every earlier beat of the fall had. */
  fallSpeed: number;
  r: number;
  dir: -1 | 1;
  rotation0: number;
  spin: number;
  /** Clock reading at impact — a stuck rock holds this still shape rather than visibly wobbling. */
  spawnTime: number;
  /**
   * How long the replay takes: `y0` down to the hull's real skin over
   * `fallSpeed`. 0 until the first `draw` frame, because the skin's height is
   * only known there — speed is fixed, duration is whatever it takes.
   */
  fallLife: number;
  t: number;
  /** Fires once, the frame the replay reaches the hull's skin. */
  onArrive: (x: number, y: number) => void;
  arrived: boolean;
}

/** When the stuck hold ends and the drift-off begins, in `im.t`. Torch only — every other kind fires `onArrive` and is gone the moment it lands. */
function stickStart(im: Impact): number {
  return im.fallLife + (im.kind === "torch" ? STICK_LIFE : 0);
}

/** Screen x right now — a pure function of elapsed time, not accumulated state. */
function currentX(im: Impact): number {
  const floatT = Math.max(0, im.t - stickStart(im));
  return im.x0 + im.dir * 0.5 * DRIFT_ACCEL * floatT * floatT;
}

/**
 * The last, biggest step of a rock's fall, replayed here at the speed every
 * earlier beat of the fall had: the sim removes a creature the same tick the
 * beat's motion is computed, so `creatures.ts` never gets a frame to glide it
 * through that final step (`fallTilesPerBeat`, sim/types.ts) — without this,
 * a fast rock vanishes mid-air and reappears at the hull, and the faster it
 * fell the further that gap is. `onArrive` (the spark burst, the deflect
 * bounce) fires only once this replay actually reaches the hull's skin,
 * instead of at the instant the sim resolved the impact.
 *
 * Only the torch — the one rock with a crater and a hole to sit in — sinks in
 * and drifts off afterwards; see `stickStart`. Every other rock kind fires
 * `onArrive` and is simply gone the moment it lands, exactly as it read
 * before this replay existed, just no longer early.
 *
 * While stuck it rides the hull's own breathing motion via `skinAt`
 * (`torch-crater.ts`'s dent uses the same query), not a fixed height above
 * `Layout.hullY`'s flat approximation — else it floats free of its own dent.
 */
export class RockImpactFx {
  private impacts: Impact[] = [];

  /** `beatSeconds` is how long one beat takes at the tempo the miss happened
   * at (`60 / cfg.bpm`) — the pace the replayed last step of the fall has to
   * match to read as a continuation of it, not a new, different fall.
   * `fromRow` is the sim's own row for this creature the beat it missed. */
  spawn(
    x: number,
    l: Layout,
    time: number,
    beatSeconds: number,
    kind: CreatureKind,
    fromRow: number,
    onArrive: (x: number, y: number) => void,
  ): void {
    const mid = l.gridLeft + l.gridWidth / 2;
    const fallTiles = fallTilesPerBeat(kind);
    const r = kind === "torch" ? torchRadius(l) : l.tile * 0.4;
    this.impacts.push({
      kind,
      x0: x,
      y0: tileCY(l, fromRow),
      fallSpeed: (fallTiles * l.tile) / beatSeconds,
      r,
      dir: x < mid ? -1 : 1,
      rotation0: torchRotation(x),
      spin: 0.4 + (x % 1) * 0.3,
      spawnTime: time,
      fallLife: 0,
      t: 0,
      onArrive,
      arrived: false,
    });
  }

  update(dt: number, l: Layout): void {
    const margin = l.gridWidth * 0.3;
    const left = l.gridLeft - margin;
    const right = l.gridLeft + l.gridWidth + margin;
    for (let i = this.impacts.length - 1; i >= 0; i--) {
      const im = this.impacts[i]!;
      im.t += dt;
      const x = currentX(im);
      const offscreen = x < left || x > right;
      const done = im.kind !== "torch" ? im.arrived : im.t > stickStart(im) + FLOAT_LIFE;
      if (done || offscreen) this.impacts.splice(i, 1);
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    l: Layout,
    time: number,
    skinAt: (x: number) => number,
  ): void {
    for (const im of this.impacts) {
      const x = currentX(im);
      const surfaceY = skinAt(x);
      const stuckY = surfaceY - im.r * 0.5;
      // The duration of the replayed step, fixed on the first frame it is
      // drawn: whatever the fall's own speed needs to close the gap between
      // where the creature was last drawn and the hull's real skin. Speed is
      // the thing held constant, never the time.
      if (im.fallLife === 0) im.fallLife = Math.max(0.001, (stuckY - im.y0) / im.fallSpeed);
      const stuckAt = stickStart(im);

      // Still falling: the last step the sim itself never got to render,
      // replayed here at the same speed and with no easing — matching the
      // plain, even glide every earlier beat of the fall had — so it reads
      // as the same fall finishing, not a new one starting.
      const falling = im.t < im.fallLife;
      if (!falling && !im.arrived) {
        im.arrived = true;
        im.onArrive(x, surfaceY);
      }

      // The tail belongs to the fall and to nothing else: full strength on
      // the way down, then `TAIL_LIFE` to leave. It hangs from the rock, not
      // from the hull line — a streak drawn down to a crater the rock is
      // already sitting in is a mark on the ship, not a trail behind a rock.
      const floating = im.t > stuckAt;
      const floatT = Math.max(0, im.t - stuckAt);
      // 0 the instant it lets go, 1 once the liftoff has run its course —
      // everything about leaving the hull eases in against this, so there is
      // no frame where height or spin visibly jumps to a new value.
      const rise = smoothstep(floatT / RISE_TIME);
      // It came down without turning (`drawTorch`) and it lands the same way
      // up it fell — only once it lets go of the hull does it tumble.
      const rotation = im.rotation0 + (floating ? im.spin * 0.5 * floatT * floatT : 0);

      // Sunk a quarter of its own height (half its radius) into the hull —
      // exactly the crater's own depth, so it sits in the hole it made
      // rather than hovering over it — and riding the same surface point,
      // so the ship's own motion carries it while it is stuck. Letting go,
      // it eases up to clear of the line rather than jumping there, and only
      // bobs once it has actually risen.
      const bob = floating ? Math.sin(floatT * 2.4) * im.r * 0.12 * rise : 0;
      const y = falling
        ? im.y0 + im.fallSpeed * im.t
        : floating
          ? stuckY + (surfaceY - im.r * 1.1 - stuckY) * rise + bob
          : stuckY;

      if (im.kind !== "torch" && !falling) continue;

      const tailAlpha = falling ? 1 : Math.max(0, 1 - (im.t - im.fallLife) / TAIL_LIFE);
      if (tailAlpha > 0) drawTorchTail(ctx, l, x, y, im.r, tailAlpha);

      const alpha = floating ? Math.max(0, 1 - floatT / FLOAT_LIFE) : 1;
      if (alpha <= 0) continue;

      // While it is still stuck, a low ember glow sells the "melted into the
      // skin" contact rather than a rock merely floating in front of it.
      if (!falling && !floating) halo(ctx, x, surfaceY, im.r * 1.1, PALETTE.ember, 0.22);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rotation);
      drawTorchRock(ctx, im.r, falling || floating ? time : im.spawnTime);
      ctx.restore();
    }
  }

  /**
   * Whether a rock is still in the crater at this x — still falling into it
   * or still lodged in it. Only the torch has a crater; every other kind
   * fires `onArrive` and disappears the same frame, so it never has a hull
   * dent waiting on it. The hull only draws a torch's dent once this goes
   * false (`hull.ts`): the sim scars the columns at the instant of the beat,
   * a good half second before the rock is visibly there, and a hole that
   * opens ahead of the thing that punches it reads as the ship breaking by
   * itself.
   */
  coversCrater(x: number, tile: number): boolean {
    for (const im of this.impacts) {
      if (im.kind !== "torch" || im.t > stickStart(im)) continue;
      if (Math.abs(x - im.x0) < tile * 0.75) return true;
    }
    return false;
  }
}
