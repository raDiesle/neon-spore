import type { FlueLevel } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE FLUE's card**: what the lit level asks, in two words, on both
 * screens — `SHOT` or `BEAM` in the colour it must be, and under it how hard
 * THE SLOW holds the level, `SLOW ½`, when it does. The owner, 5 October
 * 2026: which combination a level is must be plain without a tutorial. The
 * sight says the colour and the weapon as a picture, the scale says the
 * speed, the pips the shots and the studs the level; the card says the two
 * of them a picture cannot, by name, where both players read the same words.
 *
 * It stands over the flue's left end, clear of the studs over the middle and
 * of the `CALL` over the sight, and is faint between levels, naming the next.
 */

/** The card's corner from the field's left edge and over the flue, its size and its words', in tiles. */
const IN = 0.25;
const UP = 2.1;
const W = 2.1;
const H = 1.15;
const WORD = 0.42;
const SLOW_WORD = 0.3;

/** The weapon's name, the one the player reads: a bolt is a shot. */
export function flueCardWord(level: FlueLevel): string {
  return level.weapon === "beam" ? "BEAM" : "SHOT";
}

/** THE SLOW's strength as the card writes it, or null when the level is not slowed. */
export function flueCardSlow(level: FlueLevel): string | null {
  if (level.slowMilli >= 1000) return null;
  const known: Record<number, string> = { 250: "¼", 500: "½", 750: "¾" };
  return `SLOW ${known[level.slowMilli] ?? String(level.slowMilli / 1000)}`;
}

/** The card's plate over the flue at `flueY`, in field pixels. */
export function flueCardRect(
  l: Layout,
  flueY: number,
): { x: number; y: number; w: number; h: number } {
  return { x: l.gridLeft + IN * l.tile, y: flueY - UP * l.tile, w: W * l.tile, h: H * l.tile };
}

/** The card over the flue at `flueY`. */
export function drawFlueCard(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  flueY: number,
  level: FlueLevel,
  lit: boolean,
): void {
  const { x, y, w, h } = flueCardRect(l, flueY);
  const alpha = lit ? 1 : 0.45;
  ctx.save();
  const plate = new Path2D();
  plate.roundRect(x, y, w, h, 0.2 * l.tile);
  ctx.fillStyle = rgba(PALETTE.flueSlot, 0.85);
  ctx.fill(plate);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.35 * alpha);
  ctx.stroke(plate);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const cx = x + w / 2;
  const slow = flueCardSlow(level);
  const wordY = slow === null ? y + h / 2 : y + 0.38 * l.tile;
  ctx.font = `700 ${Math.round(l.tile * WORD)}px "Courier New",monospace`;
  ctx.fillStyle = rgba(stepColour(level.color).rim, alpha);
  ctx.fillText(flueCardWord(level), cx, wordY);
  if (slow !== null) {
    ctx.font = `700 ${Math.round(l.tile * SLOW_WORD)}px "Courier New",monospace`;
    ctx.fillStyle = rgba(PALETTE.text, alpha);
    ctx.fillText(slow, cx, y + 0.85 * l.tile);
  }
  ctx.restore();
}
