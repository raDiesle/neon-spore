import type { SimConfig, SimEvent, World } from "@neon-spore/sim";
import { creatureCenter } from "./creature-place.js";
import { depthScale } from "./depth.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The jet THE RECOIL leaves behind: fire vented **downward** out of the tile a
 * shot met it in, and the body climbing away from it.
 *
 * `docs/tower-defence.md` asked for exactly this and said why — "the jet gives
 * the renderer something to draw that is not another particle burst". Every
 * other answer to a shot on this field throws material outward from a point,
 * which is the grammar of something breaking. Nothing breaks here: the cage
 * held, and what the pair has to be shown is a *direction*, because the whole
 * cost of the creature is that the body is now somewhere they were not
 * looking.
 *
 * So the picture has two halves and they say one thing between them. The
 * **plume** hangs at the struck tile and points down the field, which is the
 * thrust — a flame is the only shape on this screen that means "that way, and
 * the thing went the other way". The **wake** is a line of embers from that
 * tile to wherever the body is *this frame*, thinning as it goes, so the eye
 * is carried up and across to the lane it landed in rather than left to find
 * it. `recoilBounce` carries the id for the second half, for `rindShed`'s
 * reason: the body is still falling, and a picture frozen on the tile the shot
 * arrived in could not follow it.
 *
 * Pure render. Nothing here is read back into a world, and the count of
 * bounces the cage is drawn from is `recoilBouncesLeft` every frame
 * (`recoil.ts`), not anything this file remembers — which is the one thing
 * that cannot go stale across a restart.
 */

/** Long enough to carry the eye across a lane and up two rows, over well
 * inside the beat it happened on — a beat is 0.625 s at 96 bpm. */
const LIFE = 0.45;
/** Embers along the wake. Enough to read as a trail, few enough that each one
 * is a spark rather than a smear. */
const EMBERS = 7;
/** How long the plume is, as a multiple of the body's own radius. */
const PLUME_MUL = 2.6;
/** Tongues of flame in the plume. Three: a core and one either side of it. */
const TONGUES = 3;

interface Vent {
  /** The body it came off, still falling and now two rows higher. */
  id: number;
  /** The tile the shot arrived in — where the plume hangs. */
  x: number;
  y: number;
  age: number;
  /** How big a body standing in the struck tile draws — the plume's own unit,
   * so a bounce near the ship vents a bigger jet than one at the top of the
   * field, exactly as every other picture on this grid does. */
  r: number;
}

export class RecoilVentFx {
  private live: Vent[] = [];

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig): void {
    for (const e of events) {
      if (e.type !== "recoilBounce") continue;
      this.live.push({
        id: e.id,
        x: tileCX(l, e.col),
        y: tileCY(l, e.row),
        age: 0,
        // Sized off the **row it was struck in** rather than off the body,
        // which has already been moved two rows up by the time this runs — the
        // plume belongs to the tile it came out of, so it takes that tile's
        // perspective scale. A recoil is a full-size body (`livingBodyMul`
        // answers one for it), so the flat radius is the ordinary one and
        // `depthScale` is the whole of the rest.
        r: l.tile * 0.4 * depthScale(cfg, l, e.row),
      });
    }
  }

  update(dt: number): void {
    for (const fx of this.live) fx.age += dt;
    this.live = this.live.filter((fx) => fx.age < LIFE);
  }

  clear(): void {
    this.live = [];
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout, world: World, beatPhase: number): void {
    for (const fx of this.live) {
      const t = fx.age / LIFE;
      const body = world.creatures.find((c) => c.id === fx.id);
      // The wake first, so the plume burns over the top of the end of it.
      if (body) {
        const { x, y } = creatureCenter(l, body, beatPhase);
        drawWake(ctx, fx, x, y, t);
      }
      drawPlume(ctx, fx, t);
    }
  }
}

/**
 * The thrust: tongues of flame out of the underside of the tile, longest at
 * the instant of the hit and spent by the end.
 *
 * Out fast and then dying — `1 - (1 - t)²` reaching its length early and
 * `(1 - t)²` on the alpha — because a vent is a discharge rather than a burn:
 * everything it had went at once, which is what threw the body.
 */
function drawPlume(ctx: CanvasRenderingContext2D, fx: Vent, t: number): void {
  const reach = fx.r * PLUME_MUL * (1 - (1 - t) ** 2);
  const alpha = (1 - t) ** 2;
  // The bloom at the mouth of it. Quantised to a quarter of the body, because
  // `haloSprite` caches one canvas per (colour, radius) and a radius that grew
  // every frame would mint a fresh one every frame (`glow.ts`).
  const step = Math.max(2, fx.r * 0.25);
  halo(ctx, fx.x, fx.y + fx.r * 0.4, Math.round(fx.r / step) * step, PALETTE.ember, alpha * 0.55);

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  for (let i = 0; i < TONGUES; i++) {
    // The centre tongue is the longest and the two beside it flare outward,
    // which is what makes it a jet rather than three parallel lines.
    const lean = (i - (TONGUES - 1) / 2) * 0.42;
    const len = reach * (i === (TONGUES - 1) / 2 ? 1 : 0.72);
    ctx.strokeStyle = i === (TONGUES - 1) / 2 ? PALETTE.podRim : PALETTE.ember;
    ctx.globalAlpha = alpha * (0.55 + 0.45 * sinHash(fx.id * 3.1 + i));
    ctx.lineWidth = Math.max(0.8, fx.r * 0.3 * (1 - t));
    ctx.beginPath();
    ctx.moveTo(fx.x, fx.y);
    ctx.quadraticCurveTo(fx.x + lean * len * 0.5, fx.y + len * 0.6, fx.x + lean * len, fx.y + len);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The wake: embers strung from the struck tile to wherever the body is now,
 * smallest and faintest at the near end.
 *
 * A line of points rather than a stroked path, and that is the point of it: a
 * drawn line between two tiles is a *tether*, which this game already spends
 * on THE WARDEN's rope and THE LID's cord, and a pair who read one here would
 * be looking for something to pull. Embers are debris, and debris only says
 * which way something went.
 */
function drawWake(
  ctx: CanvasRenderingContext2D,
  fx: Vent,
  bx: number,
  by: number,
  t: number,
): void {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = PALETTE.ember;
  for (let i = 0; i < EMBERS; i++) {
    const k = (i + 1) / (EMBERS + 1);
    // Bowed off the straight line by its own amount, so the trail reads as
    // something thrown rather than as a ruler laid between two tiles.
    const bow = (sinHash(fx.id * 7.3 + i) - 0.5) * fx.r * 0.9 * Math.sin(k * Math.PI);
    const px = fx.x + (bx - fx.x) * k + bow;
    const py = fx.y + (by - fx.y) * k;
    ctx.globalAlpha = (1 - t) ** 1.5 * (0.3 + 0.7 * k);
    ctx.beginPath();
    ctx.arc(px, py, Math.max(0.7, fx.r * 0.16 * (1 - t) * k), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
