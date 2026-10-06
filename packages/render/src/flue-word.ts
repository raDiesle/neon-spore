import type { SimEvent } from "@neon-spore/sim";
import type { Point } from "./flue-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **MISS, in so many letters** (the owner, 6 October 2026: *when it's a
 * failure shot, also write some cool message hint "miss"*): a shot spent
 * stamps MISS under the sight, split in the two cannon colours as it lands
 * and shaking, and under it what to change — too early, too late, the wrong
 * colour or the wrong shot.
 *
 * On both screens: it is the pair's to talk over, and it says when the shot
 * met the spore, not where the spore is now. Too early and too late are read
 * off the spore's run as the shot met it (`flueMiss`'s `late`). Cleared in
 * `Effects.reset()` with the rest of `FlueFx`.
 */

/** How long the word stands, how long it takes to land, and how long to fade, in seconds. */
const STAND = 1.25;
const LAND = 0.14;
const FADE = 0.35;
/** The word's size and the hint's, in tiles, and how far under the sight it stands. */
const WORD = 0.95;
const HINT = 0.4;
const BELOW = 1.75;

/** What to change after a shot spent, in the fewest words that say it. */
export function flueMissHint(e: Extract<SimEvent, { type: "flueMiss" }>): string {
  if (e.why === "color") return "WRONG COLOUR";
  if (e.why === "weapon") return "WRONG SHOT";
  return e.late ? "TOO LATE" : "TOO EARLY";
}

export class FlueWord {
  private hint: string | null = null;
  private age = 0;

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      if (e.type === "flueMiss") {
        this.hint = flueMissHint(e);
        this.age = 0;
      } else if (e.type === "flueHit") this.hint = null;
    }
  }

  /** The hint standing under MISS, or null when no word is up. */
  get shown(): string | null {
    return this.hint;
  }

  /** Seconds the word has stood. */
  get since(): number {
    return this.age;
  }

  update(dt: number): void {
    if (this.hint === null) return;
    this.age += Math.min(dt, 1 / 30);
    if (this.age >= STAND) this.hint = null;
  }

  clear(): void {
    this.hint = null;
    this.age = 0;
  }
}

/** MISS and its hint under the sight at `sight`, landing, shaking and fading on the word's own clock. */
export function drawFlueWord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  sight: Point,
  word: FlueWord,
): void {
  const hint = word.shown;
  if (hint === null) return;
  const t = word.since;
  const land = Math.min(1, t / LAND);
  const alpha = Math.min(1, (STAND - t) / FADE);
  const size = l.tile * WORD * (1 + 0.6 * (1 - land));
  const shake = l.tile * 0.12 * Math.max(0, 1 - t / 0.4) * Math.sin(t * 70);
  const split = l.tile * (0.05 + 0.18 * Math.max(0, 1 - t / 0.3));
  const x = sight.x + shake;
  const y = sight.y + BELOW * l.tile;

  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(size)}px "Courier New",monospace`;
  const half = ctx.measureText("MISS").width / 2 + 0.3 * l.tile;
  const plate = new Path2D();
  plate.roundRect(x - half, y - 0.62 * l.tile, half * 2, 1.75 * l.tile, 0.18 * l.tile);
  ctx.fillStyle = "rgba(7,4,15,.8)";
  ctx.fill(plate);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = rgba(PALETTE.red, 0.7);
  ctx.stroke(plate);

  // The colour split: the two cannon colours either side, the word in the
  // red of a blow over them.
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = rgba(PALETTE.cyan, 0.75);
  ctx.fillText("MISS", x - split, y);
  ctx.fillStyle = rgba(PALETTE.red, 0.85);
  ctx.fillText("MISS", x + split, y);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = PALETTE.redRim;
  ctx.fillText("MISS", x, y);

  ctx.font = `700 ${Math.round(l.tile * HINT)}px "Courier New",monospace`;
  ctx.fillStyle = rgba(PALETTE.text, 0.95);
  ctx.fillText(hint, x, y + 0.75 * l.tile);
  ctx.restore();
}
