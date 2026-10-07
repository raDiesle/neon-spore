import type { FlueLevel } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE FLUE's card**: what the lit level asks, said in a sentence under the
 * flue on both screens. The owner, 5 October 2026: which combination a level
 * is must be plain without a tutorial; and 7 October 2026: the text should
 * stand *below the boss in the center* and say *something like "shoot ball in
 * the center in the right colour"*. So it is written under the glass, in the
 * level's colour: the shot and its colour by name, `SHOOT RED` or `BEAM
 * CYAN`, and under it when, or how a beam is fired; and under that, on a
 * level that needs the spore met more than once, how many meetings are still
 * owed, and how hard THE SLOW holds the level, `SLOW ½`, when it does.
 *
 * It stood in a plate over the flue's left end until then. It gives way to
 * MISS, which stands in the same place (`flue-word.ts`), and is faint between
 * levels, naming the next.
 */

/** How far under the flue's middle each line stands, and its size, in tiles. */
const SAY_AT = 1.7;
const WHEN_AT = 2.22;
const MORE_AT = 2.62;
const SAY = 0.56;
const WHEN = 0.3;

/** The card's three lines: the ask, how to answer it, and what else holds the level. */
export interface FlueCardLines {
  say: string;
  when: string;
  more: string | null;
}

/** What `level` asks, with `left` meetings still owed. */
export function flueCardLines(level: FlueLevel, left = level.needs): FlueCardLines {
  const colour = level.color.toUpperCase();
  const beam = level.weapon === "beam";
  const more: string[] = [];
  if (left > 1) more.push(`${left} TIMES`);
  else if (level.needs > 1) more.push("ONCE MORE");
  const slow = flueCardSlow(level);
  if (slow !== null) more.push(slow);
  return {
    say: `${beam ? "BEAM" : "SHOOT"} ${colour}`,
    when: beam ? "HOLD IT. IT HITS THE MIDDLE WHEN FULL" : "WHEN THE SPORE IS IN THE MIDDLE",
    more: more.length > 0 ? more.join(" · ") : null,
  };
}

/** THE SLOW's strength as the card writes it, or null when the level is not slowed. */
export function flueCardSlow(level: FlueLevel): string | null {
  if (level.slowMilli >= 1000) return null;
  const known: Record<number, string> = { 250: "¼", 500: "½", 750: "¾" };
  return `SLOW ${known[level.slowMilli] ?? String(level.slowMilli / 1000)}`;
}

/** The band the card's lines take under the flue's middle at `flueY`, in field pixels. */
export function flueCardRect(
  l: Layout,
  flueY: number,
): { x: number; y: number; w: number; h: number } {
  const top = flueY + (SAY_AT - SAY / 2) * l.tile;
  const bottom = flueY + (MORE_AT + WHEN / 2) * l.tile;
  return { x: l.gridLeft, y: top, w: l.cols * l.tile, h: bottom - top };
}

/** The card under the flue's middle `at`, level however the flue hangs. */
export function drawFlueCard(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: { x: number; y: number },
  level: FlueLevel,
  lit: boolean,
  left = level.needs,
): void {
  const lines = flueCardLines(level, left);
  const alpha = lit ? 1 : 0.45;
  const shadow = rgba(PALETTE.flueSlot, 0.9 * alpha);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  const line = (text: string, y: number, size: number, fill: string): void => {
    ctx.font = `700 ${Math.round(l.tile * size)}px "Courier New",monospace`;
    ctx.lineWidth = l.tile * size * 0.28;
    ctx.strokeStyle = shadow;
    ctx.strokeText(text, at.x, at.y + y * l.tile);
    ctx.fillStyle = fill;
    ctx.fillText(text, at.x, at.y + y * l.tile);
  };
  line(lines.say, SAY_AT, SAY, rgba(stepColour(level.color).rim, alpha));
  line(lines.when, WHEN_AT, WHEN, rgba(PALETTE.text, 0.8 * alpha));
  if (lines.more !== null) line(lines.more, MORE_AT, WHEN, rgba(PALETTE.text, 0.8 * alpha));
  ctx.restore();
}
