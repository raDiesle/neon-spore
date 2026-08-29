import { forkHeld, forkOpen, hullPercent } from "@neon-spore/sim";
import { drawBalanceSheet } from "./balance.js";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";

/**
 * Readouts over the field: hull, score, the beat, and the guard balance.
 *
 * The balance is the point of the whole HUD. Spec 5.8 counts three numbers, not
 * one: attempts, deflections, and separately the tries that were in the right
 * column at the wrong moment. That third number is the interesting failure —
 * it says the pair agreed on *where* and missed on *when*, which is the thing
 * a voice delay actually breaks.
 */
export function drawHud(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const { world } = view;
  ctx.font = '10px "Courier New",monospace';
  ctx.textAlign = "left";

  // Hull bar, top right.
  const bw = l.width * 0.42;
  const bx = l.width - bw - 10;
  const by = 14;
  ctx.fillStyle = "#2A1F4E";
  ctx.fillRect(bx, by, bw, 6);
  const hp = hullPercent(world) / 100;
  ctx.fillStyle = hp > 0.5 ? PALETTE.cyan : hp > 0.25 ? PALETTE.hull : PALETTE.red;
  ctx.fillRect(bx, by, bw * hp, 6);
  drawHeart(ctx, bx - 9, by + 3, 6, PALETTE.pod);

  ctx.fillStyle = PALETTE.dim;
  ctx.fillText(`${world.score} P`, 10, 20);

  // Four dots, the active one lit. The pulse both players share.
  const active = world.beat % 4;
  for (let i = 0; i < 4; i++) {
    const on = i === active;
    ctx.fillStyle = on ? PALETTE.hull : "#3B3163";
    ctx.beginPath();
    ctx.arc(10 + i * 13, 34, on ? 4.5 : 3, 0, Math.PI * 2);
    ctx.fill();
  }

  if (world.guard.tries > 0) {
    ctx.font = '9px "Courier New",monospace';
    ctx.fillStyle = "#6F639F";
    const late = world.guard.mistimed > 0 ? `  (${world.guard.mistimed} late)` : "";
    ctx.fillText(`Guard ${world.guard.deflected}/${world.guard.tries}${late}`, 10, 48);
  }
}

/** The two end states the prototype has: hull through, and paused. */
export function drawOverlay(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const { world } = view;
  ctx.textAlign = "center";
  if (world.over) {
    // The end of a run is the balance sheet, not a headline. It was three
    // lines of "wave N · score" for as long as nobody had wired up the
    // numbers the world was already counting.
    drawBalanceSheet(ctx, l, view);
  } else if (forkOpen(world)) {
    // Before the pause: a pause is something one player did to the game, and
    // THE FORK is something the game is doing to both of them.
    drawFork(ctx, l, view);
  } else if (!view.running) {
    ctx.fillStyle = "rgba(7,4,15,.55)";
    ctx.fillRect(0, 0, l.width, l.height);
    ctx.fillStyle = PALETTE.text;
    ctx.font = '600 16px "Courier New",monospace';
    ctx.fillText("PAUSED", l.width / 2, l.height * 0.46);
    ctx.fillStyle = PALETTE.dim;
    ctx.font = '11px "Courier New",monospace';
    ctx.fillText("P or the button to continue", l.width / 2, l.height * 0.46 + 20);
  }
  ctx.textAlign = "left";
}

/**
 * THE FORK: the run has stopped between waves and is waiting for both thumbs.
 *
 * It dims the field and not the band, because the band is where the answer
 * has to come from. There is no bar filling and no number counting down —
 * there is nothing to count to (`sim/fork.ts`), and a shape that looked like a
 * timer would be read as one and would quietly turn the wait into a countdown.
 *
 * Both devices show whether player 1's thumb is down. That is the one row of
 * the information split that is deliberately not split (docs/spec/systems.md
 * 5.2), and it is what makes the fork answerable when the voice channel drops
 * rather than a place a pair can be stuck at.
 */
function drawFork(ctx: CanvasRenderingContext2D, l: Layout, view: ViewState): void {
  const held = forkHeld(view.world);
  ctx.fillStyle = "rgba(7,4,15,.5)";
  ctx.fillRect(0, 0, l.width, l.bandTop);

  const y = l.playHeight * 0.44;
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("THE FORK", l.width / 2, y);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText("the next wave waits for both of you", l.width / 2, y + 20);
  ctx.fillStyle = held ? PALETTE.pod : PALETTE.text;
  ctx.fillText(forkLine(l.role, held), l.width / 2, y + 40);
}

/** What this screen's own half of the commit is, in the second person. */
function forkLine(role: ViewRole, held: boolean): string {
  if (role === "p1") return held ? "HOLDING — SAY SO" : "HOLD THE LANCE";
  if (role === "p2") return held ? "THEY ARE HOLDING — FIRE" : "WAIT FOR THEIR HOLD";
  return held ? "HOLDING — FIRE" : "HOLD THE LANCE, THEN FIRE";
}

/** A small filled heart, for labelling the hull bar as what a `mend` pod feeds. */
function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  hex: string,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.15);
  ctx.quadraticCurveTo(-r * 0.3, -r * 0.5, -r * 0.55, -r * 0.1);
  ctx.quadraticCurveTo(-r * 0.55, r * 0.3, 0, r * 0.55);
  ctx.quadraticCurveTo(r * 0.55, r * 0.3, r * 0.55, -r * 0.1);
  ctx.quadraticCurveTo(r * 0.3, -r * 0.5, 0, -r * 0.15);
  ctx.fillStyle = hex;
  ctx.fill();
  ctx.restore();
}
