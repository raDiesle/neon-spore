import type { MirrorStep } from "@neon-spore/sim";
import { drawActionButton, drawFireButton, drawStripMark } from "./controls.js";
import { PALETTE } from "./palette.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * One control, drawn small enough to sit in a row of six.
 *
 * Every glyph is the band's own button at a smaller radius — `controls.ts`,
 * the same code the band itself calls. Nothing here invents a picture for a
 * control: the pair has to see a step and press the thing it shows without
 * translating, and a sequence drawn in its own private vocabulary is a second
 * thing to learn on top of the sequence.
 *
 * **Which is why the seat comes down here too.** Every body a control is made
 * of is the seat's own flesh — violet on player one's screen, amber on player
 * two's (`seat-skin.ts`) — so a glyph drawn in player one's tissue on player
 * two's panel stops looking like the button it is about. The signal colours do
 * not move: red is red, the shield's is the shield's and the cannon's rail is
 * the cannon's, because those say *which control* on both screens.
 */

/** The colour a step reads in — the same one its control has in the band. */
export function stepHex(step: MirrorStep): string {
  if (step === "fireRed") return PALETTE.red;
  if (step === "fireCyan") return PALETTE.cyan;
  if (step === "guard") return PALETTE.shield;
  if (step === "intake") return PALETTE.pod;
  return PALETTE.hull;
}

/** The word a player would say for it, for the wave's own hint and the director. */
export function stepLabel(step: MirrorStep): string {
  switch (step) {
    case "fireRed":
      return "FIRE RED";
    case "fireCyan":
      return "FIRE CYAN";
    case "guard":
      return "SHIELD";
    case "intake":
      return "SUCK";
    case "cannonLeft":
      return "LEFT";
    case "cannonRight":
      return "RIGHT";
  }
}

/**
 * The same word, short enough to sit under a button in a row of six without
 * running into its neighbours. "FIRE RED" is what the director calls it and
 * what a player says in full; the button underneath already carries the
 * silhouette and the colour, so on the field the colour alone is the word.
 */
export function stepShort(step: MirrorStep): string {
  if (step === "fireRed") return "RED";
  if (step === "fireCyan") return "CYAN";
  return stepLabel(step);
}

/** The arrow beside a cannon step's strip, saying which way the block moved. */
function cannonArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  dir: -1 | 1,
): void {
  ctx.fillStyle = PALETTE.hullRim;
  ctx.beginPath();
  ctx.moveTo(x + dir * r * 0.95, y);
  ctx.lineTo(x + dir * r * 0.45, y - r * 0.4);
  ctx.lineTo(x + dir * r * 0.45, y + r * 0.4);
  ctx.closePath();
  ctx.fill();
}

/** One glyph, centred on `x, y`, drawn to fit a circle of radius `r`. */
export function drawStepGlyph(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  step: MirrorStep,
  alpha: number,
  skin: SeatSkin,
): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);

  switch (step) {
    case "fireRed":
      drawFireButton(ctx, x, y, r, "red", skin);
      break;
    case "fireCyan":
      drawFireButton(ctx, x, y, r, "cyan", skin);
      break;
    case "guard":
      // Lit, because a sequence shows the control being *used*, not resting.
      drawActionButton(ctx, x, y, r, true, PALETTE.shield, "#08131A", null, skin.dead[0]);
      break;
    case "intake":
      drawActionButton(ctx, x, y, r, true, PALETTE.pod, "#2C1C05", null, skin.dead[0]);
      break;
    default: {
      const dir = step === "cannonLeft" ? -1 : 1;
      // The cannon's own strip, with its block shifted the way it travelled.
      drawStripMark(ctx, x + dir * r * 0.2, y, r * 0.62, r * 0.7, PALETTE.hull, skin.dead[0]);
      cannonArrow(ctx, x, y, r, dir);
      break;
    }
  }
  ctx.restore();
}
