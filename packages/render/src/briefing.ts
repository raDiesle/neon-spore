import { BRIEFINGS } from "@neon-spore/content";
import { briefingAcked, currentBriefing, type World } from "@neon-spore/sim";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The card a wave opens on, over everything else.
 *
 * It is drawn split, because it *is* split: this screen gets its own half in
 * words and the other player's half as blocks — visibly there, plainly not
 * yours to read. That is the whole design. A card that simply omitted the
 * other half would read as a card with three lines; one that showed both would
 * teach a pair, in the first ten seconds, that they never have to say anything
 * to each other.
 *
 * Stateless, like every other draw here: everything it shows is on the world,
 * so nothing survives a frame and `Effects.reset` has nothing to clear.
 *
 * The hit area is the whole screen. There is exactly one thing to do with a
 * card up and nowhere else to press, and a target the size of the stage is one
 * nobody has to look for.
 */
export function drawBriefing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  role: ViewRole,
): void {
  const subject = currentBriefing(world);
  if (!subject) return;
  const card = BRIEFINGS[subject];
  const both = role === "test";

  const padX = 16;
  const panelW = Math.max(80, Math.min(l.width - 26, 380));
  const x = (l.width - panelW) / 2;
  const inner = panelW - padX * 2;

  ctx.font = BODY;
  const lead = wrap(ctx, card.both, inner);
  const mine = wrap(ctx, role === "p2" ? card.p2 : card.p1, inner);
  const other = wrap(ctx, role === "p2" ? card.p1 : card.p2, inner);

  const height =
    TITLE_H +
    lead.length * LINE +
    RULE_H +
    LABEL_H +
    mine.length * LINE +
    LABEL_H +
    other.length * LINE +
    FOOT_H;
  const y = Math.max(12, (l.playHeight - height) / 2);

  ctx.fillStyle = "rgba(5,4,11,.82)";
  ctx.fillRect(0, 0, l.width, l.height);
  ctx.fillStyle = "rgba(16,11,34,.96)";
  ctx.fillRect(x, y, panelW, height);
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 1.4;
  ctx.strokeRect(x + 0.5, y + 0.5, panelW - 1, height - 1);

  let cy = y + 24;
  ctx.textAlign = "left";
  ctx.font = '600 9px "Courier New",monospace';
  ctx.fillStyle = PALETTE.pod;
  ctx.fillText(counter(world), x + padX, cy);
  ctx.font = '600 15px "Courier New",monospace';
  ctx.fillStyle = PALETTE.hullRim;
  ctx.fillText(card.title, x + padX, cy + 18);
  cy = y + TITLE_H;

  ctx.font = BODY;
  ctx.fillStyle = PALETTE.text;
  for (const line of lead) {
    ctx.fillText(line, x + padX, cy);
    cy += LINE;
  }

  cy += RULE_H / 2;
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + padX, cy - 5);
  ctx.lineTo(x + panelW - padX, cy - 5);
  ctx.stroke();
  cy += RULE_H / 2;

  cy = section(ctx, x + padX, cy, both ? "PLAYER ONE" : "YOURS", PALETTE.shieldRim);
  for (const line of mine) {
    ctx.fillStyle = PALETTE.text;
    ctx.font = BODY;
    ctx.fillText(line, x + padX, cy);
    cy += LINE;
  }

  cy = section(ctx, x + padX, cy, both ? "PLAYER TWO" : "THE OTHER SCREEN", PALETTE.dim);
  for (const line of other) {
    if (both) {
      ctx.fillStyle = PALETTE.text;
      ctx.font = BODY;
      ctx.fillText(line, x + padX, cy);
    } else {
      redact(ctx, line, x + padX, cy);
    }
    cy += LINE;
  }

  drawFoot(ctx, l, world, role, x, y + height, panelW, padX);
}

const BODY = '11px "Courier New",monospace';
/** Header block: the counter, then the title. */
const TITLE_H = 52;
const LINE = 15;
const RULE_H = 16;
const LABEL_H = 18;
const FOOT_H = 34;

/** A section label, and the y the first line of its text sits on. */
function section(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  hex: string,
): number {
  ctx.font = '600 9px "Courier New",monospace';
  ctx.fillStyle = hex;
  ctx.fillText(label, x, y);
  return y + LABEL_H;
}

/** Which card of how many, so a pair reading three of them knows there are three. */
function counter(world: World): string {
  const left = world.brief.due.length;
  return left > 1 ? `NEW — ${left} TO READ` : "NEW";
}

/**
 * The other player's line, as blocks: one per word, the width of the word. It
 * has to *look* like a sentence — a single grey bar says "something is hidden",
 * a row of word-shaped bars says "they are holding a sentence you need", which
 * is the thing that makes somebody read theirs out loud.
 */
function redact(ctx: CanvasRenderingContext2D, line: string, x: number, y: number): void {
  ctx.font = BODY;
  ctx.fillStyle = "rgba(122,111,168,.34)";
  let cx = x;
  const space = ctx.measureText(" ").width;
  for (const word of line.split(" ")) {
    const w = ctx.measureText(word).width;
    if (w > 0) ctx.fillRect(cx, y - 8, w, 8);
    cx += w + space;
  }
}

/**
 * Two pips and a prompt. The pips are the only place the pair can see that the
 * other one is still reading — without them, a player who has tapped is
 * looking at a card that did nothing and has no way to tell whether it is
 * their screen that is stuck or their partner.
 */
function drawFoot(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  role: ViewRole,
  x: number,
  bottom: number,
  panelW: number,
  padX: number,
): void {
  const p1 = briefingAcked(world, 1);
  const p2 = briefingAcked(world, 2);
  const mineDone = role === "p2" ? p2 : role === "p1" ? p1 : p1 && p2;
  const y = bottom - FOOT_H / 2;

  for (const [i, done] of [p1, p2].entries()) {
    ctx.beginPath();
    ctx.arc(x + padX + 5 + i * 14, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = done ? PALETTE.good : "#3B3163";
    ctx.fill();
  }

  ctx.textAlign = "right";
  ctx.font = '600 10px "Courier New",monospace';
  ctx.fillStyle = mineDone ? PALETTE.dim : PALETTE.hullRim;
  ctx.fillText(mineDone ? "WAITING FOR THEM" : "TAP WHEN READ", x + panelW - padX, y + 4);
  ctx.textAlign = "left";
  // Nothing else on the stage means anything right now; say so under the card.
  ctx.font = '9px "Courier New",monospace';
  ctx.fillStyle = PALETTE.dim;
  ctx.textAlign = "center";
  ctx.fillText("read your half out loud", l.width / 2, bottom + 18);
  ctx.textAlign = "left";
}

/** Greedy wrap against the measured width. `ctx.font` must already be set. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      out.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out;
}
