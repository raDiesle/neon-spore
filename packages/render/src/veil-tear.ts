import { blobPath, livingSilhouette } from "@neon-spore/content";
import type { Color, CreatureKind, SimEvent } from "@neon-spore/sim";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * A cloud coming apart, and the body inside it visible for the first and last
 * time.
 *
 * This is the half-second the owner asked for: *the cloud disperses and, just
 * before the impact, you see the enemy behind it for a moment, until it is
 * destroyed.* The simulation cannot show anything "just before" a shot lands —
 * a bullet meets a body and that is one tick — so the reveal is what comes
 * **off the top** of the kill instead: the weather blows open, the silhouette
 * stands there bright and unhazed for a quarter of a second, and the ordinary
 * `destroy` burst is already throwing its particles through it. What a player
 * sees is a cloud tearing, a shape in the gap, and the shape going.
 *
 * It is drawn for **both** seats, and that is the payoff rather than a leak.
 * Player 2 has spent the whole descent looking at a question mark and firing on
 * a sentence; this is the receipt. Player 1 sees the body they named, one last
 * time, at full brightness — which is the same body they were looking at
 * through the cloud a frame earlier, so nothing about it is a surprise to
 * them and nothing about it is a repeat for player 2.
 *
 * Pure render. The simulation has finished with the creature before any of
 * this starts, so nothing here is ever read back — the property every
 * transient in `effects-body.ts` shares, and the reason it is one of them.
 */

/** Long enough to be seen as a moment rather than a flicker, short enough to
 * be over inside the beat it happened on — a beat is 0.625 s at 96 bpm. */
const LIFE = 0.34;
/** Shreds the cloud comes apart into. Enough to read as coming apart, few
 * enough that each one is still a piece rather than a particle. */
const SHREDS = 7;

interface Tear {
  x: number;
  y: number;
  r: number;
  hex: string;
  kind: CreatureKind;
  /** Seconds left. */
  left: number;
  /** Fixed at the moment it happened, so the shreds do not re-scatter. */
  seed: number;
}

export class VeilTearFx {
  private tears: Tear[] = [];

  /** Every `veilTorn` in this frame's events. Its own `ingest` rather than a
   * case in `effects.ts`, the way the two clasp transients have theirs. */
  ingest(events: readonly SimEvent[], l: Layout): void {
    for (const e of events) {
      if (e.type !== "veilTorn") continue;
      this.spawn(tileCX(l, e.col), tileCY(l, e.row), l.tile * 0.76, e.color, e.kind);
    }
  }

  spawn(x: number, y: number, r: number, color: Color, kind: CreatureKind): void {
    this.tears.push({
      x,
      y,
      r,
      hex: color === "red" ? PALETTE.red : PALETTE.cyan,
      kind,
      left: LIFE,
      seed: this.tears.length + Math.round(x + y),
    });
  }

  update(dt: number): void {
    for (const t of this.tears) t.left -= dt;
    this.tears = this.tears.filter((t) => t.left > 0);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const t of this.tears) {
      const k = 1 - t.left / LIFE;
      drawShreds(ctx, t, k);
      drawCore(ctx, t, k);
    }
  }

  clear(): void {
    this.tears = [];
  }
}

/**
 * The weather leaving. Arcs of the cloud's own dark thrown outward and turned,
 * fading as they go — the opposite gesture to `lure-vanish.ts`'s closing ring,
 * on purpose: a lure withdrew and this one was opened.
 */
function drawShreds(ctx: CanvasRenderingContext2D, t: Tear, k: number): void {
  ctx.save();
  ctx.strokeStyle = "#4A4185";
  ctx.lineWidth = Math.max(1, t.r * 0.12) * (1 - k * 0.6);
  ctx.lineCap = "round";
  for (let i = 0; i < SHREDS; i++) {
    const a = (i / SHREDS) * Math.PI * 2 + t.seed * 0.4;
    const d = t.r * (0.55 + k * 1.5);
    ctx.globalAlpha = (1 - k) * 0.7;
    ctx.beginPath();
    ctx.arc(
      t.x + Math.cos(a) * d,
      t.y + Math.sin(a) * d * 0.8,
      t.r * 0.3 * (1 - k * 0.5),
      a - 1.1,
      a + 1.1,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The body, at full strength and then gone.
 *
 * Drawn from `livingSilhouette` and `blobPath` like any other body, and
 * deliberately **not** hazed by distance the way `drawLiving` is: this is a
 * moment rather than a thing standing in the field, and it has a quarter of a
 * second to say which body it was. It is filled rather than outlined for the
 * same reason — an outline at this size and this duration is a suggestion.
 */
function drawCore(ctx: CanvasRenderingContext2D, t: Tear, k: number): void {
  const shape = livingSilhouette(t.kind);
  const r = t.r * 0.55;
  const scale = (r / Math.max(shape.rx, shape.ry)) * (shape.sizeMul ?? 1);
  // It brightens as the cloud opens and then goes with the burst: full for the
  // first third, falling away over the rest.
  const a = k < 0.33 ? k / 0.33 : Math.max(0, 1 - (k - 0.33) / 0.67);

  ctx.save();
  ctx.translate(t.x, t.y);
  ctx.scale(scale * (1 + k * 0.25), scale * (1 + k * 0.25));
  ctx.globalAlpha = a;
  ctx.fillStyle = t.hex;
  ctx.fill(
    new Path2D(
      blobPath(
        0,
        0,
        shape.rx,
        shape.ry,
        shape.lobes,
        shape.depth,
        shape.wobble,
        t.seed,
        shape.seed,
      ),
    ),
  );
  ctx.restore();
}
