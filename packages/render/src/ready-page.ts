import { seatReady, type World } from "@neon-spore/sim";
import { drawGuideNav } from "./guide-nav.js";
import type { Layout, ViewRole } from "./layout.js";
import type { OpeningFx } from "./opening-fx.js";
import { PALETTE } from "./palette.js";
import { drawCircle } from "./ready-circles.js";
import { drawIntroduction } from "./wave-intro.js";

/**
 * The last page of a guide: the wave's own name, and the two circles that say
 * this pair has finished reading.
 *
 * **It is the game's screen and nothing else.** The owner put the arrangement
 * this way — *we could show the wave text and description already together with
 * the ready button view, so when showing ready buttons only the game screen
 * with wave name and description is shown* — and it is why a guide passes
 * straight to the field: the introduction that used to stand after it has been
 * read here, on this page. The field is drawn behind, by the ordinary frame,
 * under a scrim just dark enough that the words hold.
 *
 * **Everything sits at the top.** He asked for that directly, and it is the
 * right half of the screen for it: what is underneath is the ship and the
 * panel, which is what the pair is about to use, and a column of type over the
 * hull would be a page hiding the thing it is introducing.
 *
 * **There is no button.** There was one, filling as it was held, and it was one
 * gauge too many: *the "hold to ready" should not be a button, only text
 * "READY?" which pulses — we don't need button and circle to have progress,
 * only stay with the circle.* So the circles are the control now, big and lit,
 * and the words above them ask the question rather than offering a thing to
 * press. It is still a **hold** — a lift before the ring closes empties it
 * (`sim/ready-gate.ts`) — and the ring is what says so.
 *
 * **Waiting is the loud part.** Two people reading at their own speeds means one
 * of them is nearly always waiting, and a gate that said so in nine-point grey
 * was a gate people assumed had broken.
 */

/** How big a circle on this page is, and how far apart the two of them sit. */
const R = 44;
const GAP = 62;
/** Where the column starts, as a share of the play area. */
const TOP = 0.06;
/**
 * The column, as the gaps between its rows.
 *
 * **Room is kept rather than measured.** `readyCircles` is the hit test as well
 * as the drawing (`guide-nav.ts` says why that has to be one answer), so it can
 * only depend on the layout — a circle whose place moved with the length of a
 * wave's sentence would be a circle a thumb found in one wave and missed in the
 * next. So the name block is given the room three wrapped lines need and most
 * waves leave a little of it empty, which is the cheap half of the bargain.
 */
const NAME_BLOCK = 94;
const ASK_GAP = 38;
const ASK_SUB = 18;
const LABEL_GAP = 38;

export interface ReadyCircle {
  x: number;
  y: number;
  r: number;
}

/** Where the two circles are. Drawn from this and hit-tested against it. */
export function readyCircles(l: Layout): { p1: ReadyCircle; p2: ReadyCircle } {
  const cy = circlesY(l);
  const mid = l.width / 2;
  const r = circleR(l);
  const gap = Math.max(r + 12, Math.min(GAP, l.width / 2 - r - 10));
  return { p1: { x: mid - gap, y: cy, r }, p2: { x: mid + gap, y: cy, r } };
}

/**
 * Whether a point is on the circle this seat may fill — its own, or either of
 * them in `test`, where one person holds both.
 *
 * Generous by a third of a radius, because a circle is the only target on this
 * page and a thumb that misses it does nothing at all. It used to be the whole
 * screen: the owner's *still any touch of screen will let the circle animate*
 * is what ended that, and this is what it is instead.
 */
export function onReadyCircle(l: Layout, x: number, y: number, role: ViewRole): boolean {
  const c = readyCircles(l);
  const near = (one: ReadyCircle): boolean => Math.hypot(x - one.x, y - one.y) <= one.r * 1.34;
  if (role === "p1") return near(c.p1);
  if (role === "p2") return near(c.p2);
  return near(c.p1) || near(c.p2);
}

function askY(l: Layout): number {
  return l.playHeight * TOP + NAME_BLOCK + ASK_GAP;
}

function circlesY(l: Layout): number {
  return askY(l) + ASK_SUB + LABEL_GAP + circleR(l);
}

function circleR(l: Layout): number {
  return Math.min(R, Math.max(20, (l.width - 40) / 4));
}

export function drawReadyPage(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  role: ViewRole,
  fx: OpeningFx | undefined,
  pages: number,
): void {
  // Dark enough to read against a field that is standing still behind it, light
  // enough that the field is plainly still there. It is the wave they are about
  // to play, not a card in front of it.
  ctx.fillStyle = "rgba(5,4,11,.72)";
  ctx.fillRect(0, 0, l.width, l.height);

  const age = fx?.age ?? Number.POSITIVE_INFINITY;
  // No fade: on this page the pair is what ends the reading, and words that had
  // started to fade would be words that looked like a mistake.
  drawIntroduction(ctx, l, world, age, false, l.playHeight * TOP);

  const mine: 1 | 2 | 0 = role === "p1" ? 1 : role === "p2" ? 2 : 0;
  const both = role === "test";
  const iAmReady = mine === 0 ? seatReady(world, 1) && seatReady(world, 2) : seatReady(world, mine);
  const other: 1 | 2 = mine === 2 ? 1 : 2;
  const theirs = seatReady(world, other);
  const beat = fx?.age ?? 0;

  const circles = readyCircles(l);
  ask(ctx, l, askY(l), iAmReady, beat);

  for (const seat of [1, 2] as const) {
    const own = seat === mine;
    const at = seat === 1 ? circles.p1 : circles.p2;
    const label = both ? (seat === 1 ? "PLAYER ONE" : "PLAYER TWO") : own ? "YOU" : "THEM";
    drawCircle(ctx, at.x, at.y, world, seat, label, own || both, at.r, {
      // The one that is waiting for a thumb breathes. Only this seat's own:
      // a partner's circle pulsing would be a screen asking for something the
      // person holding it cannot give.
      calling: (own || both) && !seatReady(world, seat),
      beat,
    });
    fx?.noteReady(seat, seatReady(world, seat), at.x, at.y, at.r);
  }

  waiting(ctx, l, circles.p1.y + circles.p1.r + 42, iAmReady, theirs, both, other, beat);

  // BACK only, and on the same bar the film's pages use so it does not move
  // under a thumb between the last page and this one. NEXT has nowhere to go,
  // and BACK has nowhere to go either once this seat has committed.
  drawGuideNav(ctx, l, { page: pages - 1, pages, back: !iAmReady, age: beat });
  fx?.draw(ctx);
}

/** The question, pulsing, where a button used to be a thing to press. */
function ask(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  done: boolean,
  beat: number,
): void {
  ctx.textAlign = "center";
  ctx.font = '700 30px "Courier New",monospace';
  if (done) {
    ctx.fillStyle = PALETTE.good;
    ctx.fillText("READY", l.width / 2, y);
  } else {
    ctx.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(beat * 2.2));
    ctx.fillStyle = PALETTE.hullRim;
    ctx.fillText("READY?", l.width / 2, y);
    ctx.globalAlpha = 1;
    ctx.font = '11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("hold your circle until it closes", l.width / 2, y + 18);
  }
  ctx.textAlign = "left";
}

/**
 * Who is still reading, in the size that answer deserves. Nothing else on this
 * page changes while a pair waits, so this is what has to carry it.
 */
function waiting(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  mineReady: boolean,
  theirsReady: boolean,
  both: boolean,
  other: 1 | 2,
  beat: number,
): void {
  ctx.textAlign = "center";
  if (mineReady && !theirsReady) {
    ctx.globalAlpha = 0.62 + 0.38 * Math.abs(Math.sin(beat * 2.2));
    ctx.font = '700 17px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(
      both ? "WAITING FOR THE OTHER SEAT" : `WAITING FOR PLAYER ${other}`,
      l.width / 2,
      y,
    );
    ctx.globalAlpha = 1;
    ctx.font = '11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("they are still reading their half", l.width / 2, y + 19);
  } else if (theirsReady && !mineReady) {
    ctx.font = '700 15px "Courier New",monospace';
    ctx.fillStyle = PALETTE.good;
    ctx.fillText(both ? "ONE SEAT IS READY" : `PLAYER ${other} IS READY`, l.width / 2, y);
    ctx.font = '11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("they are waiting on you", l.width / 2, y + 19);
  } else if (!mineReady) {
    ctx.font = '11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("both seats have to say ready", l.width / 2, y);
    ctx.fillText("go back if you want to read a page again", l.width / 2, y + 17);
  }
  ctx.textAlign = "left";
}
