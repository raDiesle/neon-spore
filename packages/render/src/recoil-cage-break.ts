import type { SimConfig, SimEvent } from "@neon-spore/sim";
import { depthScale } from "./depth.js";
import { sinHash } from "./hash.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { strutsFor } from "./recoil.js";

/**
 * THE RECOIL's cage coming apart: the shot that spends the last bounce, drawn
 * as the frame failing all at once.
 *
 * The creature's sentence is *four shots*, and until this existed the fourth
 * one was the only one the pair could not see coming. The cage drew a fourth
 * broken rib and went on standing, so a body with nothing left in it looked
 * exactly like a body with one more bounce in it — a readout that stops
 * counting at the moment it matters most. Now the third bounce takes the whole
 * frame off: the ribs are thrown, and what falls the rest of the way down the
 * field is an ordinary slick or an ordinary bulb, which is a picture the pair
 * already knows how to read without being told anything.
 *
 * **It is thrown off the tile, not carried with the body.** The body left on a
 * jet (`recoil-vent.ts`) and the cage is what it left *in*, so the wreckage
 * hangs where the shot landed and the wake climbs away from it. That is also
 * why this is a flat draw with no world in it: there is nothing here to redraw
 * around, and the ribs are debris the instant they are struck off.
 *
 * Pure render. Nothing is read back into a world, and the count the cage is
 * drawn from is `recoilBouncesLeft` every frame (`recoil.ts`) — this file only
 * says what the last one looked like leaving.
 */

/** A little longer than the jet's own life, so the frame is still visibly
 * failing as the body climbs out of it and is gone before the next beat. */
const LIFE = 0.55;
/** How far a shard travels, as a multiple of the body's radius. Outward and
 * clear of the tile: this is a frame letting go, not a rim chipping. */
const THROW_MUL = 1.9;
/** Folds in a thrown rib — the spring it was, straightened by nothing. Two
 * rather than the standing rib's three, because a shard is shorter. */
const FOLDS = 2;

interface Wreck {
  /** The body it came off, for the phase — two cages failing on one beat are
   * never one drawing done twice. */
  id: number;
  /** The tile the shot arrived in, where the frame was when it failed. */
  x: number;
  y: number;
  /** How big a body standing in that tile draws, the shard's own unit. */
  r: number;
  /** Ribs the frame had, which is the count of bounces the arrival carried. */
  struts: number;
  age: number;
}

export class RecoilCageBreakFx {
  private live: Wreck[] = [];

  ingest(events: readonly SimEvent[], l: Layout, cfg: SimConfig): void {
    for (const e of events) {
      // The bounce that spent the last one, and no other. `left` is the
      // simulation's own count rather than anything this file tracks, so the
      // frame fails on exactly the shot the next one kills through.
      if (e.type !== "recoilBounce" || e.left > 0) continue;
      this.live.push({
        id: e.id,
        x: tileCX(l, e.col),
        y: tileCY(l, e.row),
        // Sized off the row it was struck in, for the jet's reason: the
        // wreckage belongs to that tile and takes that tile's perspective.
        r: l.tile * 0.4 * depthScale(cfg, l, e.row),
        struts: strutsFor(cfg),
        age: 0,
      });
    }
  }

  update(dt: number): void {
    for (const w of this.live) w.age += dt;
    this.live = this.live.filter((w) => w.age < LIFE);
  }

  clear(): void {
    this.live = [];
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const w of this.live) drawWreck(ctx, w, w.age / LIFE);
  }
}

/**
 * One failed frame: every rib thrown outward and tumbling, scorched in
 * `PALETTE.ember` — the colour of the jet that blew them off — and the bolts
 * that held them flying with them.
 *
 * Out fast and then drifting (`1 - (1 - t)²` on the distance) because the
 * throw is a discharge and not a fall: everything the spring had went at once,
 * which is the same curve the plume beside it reaches its length on.
 */
function drawWreck(ctx: CanvasRenderingContext2D, w: Wreck, t: number): void {
  const flung = w.r * THROW_MUL * (1 - (1 - t) ** 2);
  const alpha = (1 - t) ** 1.5;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = alpha;
  for (let i = 0; i < w.struts; i++) {
    const a = (i / w.struts) * Math.PI * 2 - Math.PI / 2;
    // Each shard leaves along its own rib's angle, with a lean off it so the
    // frame scatters rather than opening like a flower.
    const lean = (sinHash(w.id * 5.7 + i) - 0.5) * 0.9;
    const cx = w.x + Math.cos(a + lean * t) * flung;
    const cy = w.y + Math.sin(a + lean * t) * flung;
    // And tumbling: a rib that kept pointing outward would read as a beam
    // sliding along a rail rather than as a piece coming off something.
    const spin = a + lean * 5.2 * t;
    drawShard(ctx, cx, cy, spin, w.r * (0.55 + 0.25 * sinHash(w.id * 2.3 + i)), w.r);
  }
  ctx.restore();
}

/** A thrown rib: the zigzag it was, straightened a little by the throw, with
 * the bolt still on its outer end. */
function drawShard(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spin: number,
  len: number,
  unit: number,
): void {
  ctx.strokeStyle = PALETTE.ember;
  ctx.lineWidth = Math.max(0.8, unit * 0.12);
  ctx.beginPath();
  for (let k = 0; k <= FOLDS * 2; k++) {
    const f = k / (FOLDS * 2);
    const d = (f - 0.5) * len;
    const off = (k % 2 === 0 ? -1 : 1) * len * 0.16 * Math.sin(f * Math.PI);
    const px = cx + Math.cos(spin) * d - Math.sin(spin) * off;
    const py = cy + Math.sin(spin) * d + Math.cos(spin) * off;
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.fillStyle = PALETTE.rockDark;
  ctx.beginPath();
  ctx.arc(
    cx + (Math.cos(spin) * len) / 2,
    cy + (Math.sin(spin) * len) / 2,
    Math.max(1, unit * 0.09),
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.stroke();
}
