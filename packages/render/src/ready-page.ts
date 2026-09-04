import { seatReady, type World } from "@neon-spore/sim";
import { drawGuideNav, NAV_H } from "./guide-nav.js";
import type { Layout, ViewRole } from "./layout.js";
import { type OpeningFx, SETTLED_AGE } from "./opening-fx.js";
import { PALETTE } from "./palette.js";
import { drawCircle } from "./ready-circles.js";
import { hasSeatName, type SeatNames, seatName } from "./seat-name.js";
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
 * **The name is at the top and the gate is well below it.** He asked for the
 * column to sit at the top, and then for the gate to be moved further down away
 * from the name and the sentence under it — which is the right correction: a
 * circle a few points under a paragraph reads as part of the paragraph, and the
 * gap is the only thing saying *this is the part you do*.
 *
 * **There is no button, and the whole page is one.** There was a button that
 * filled as it was held, and it was one gauge too many: *the "hold to ready"
 * should not be a button, only text "READY?" which pulses — we don't need
 * button and circle to have progress, only stay with the circle.* So the
 * circles are the readout, big and lit, and the words above them ask the
 * question. What answers a thumb is the page itself: *I want on fullscreen that
 * press will make the circle ready.* Anywhere but the bar at the bottom, which
 * already means three other things. It is still a **hold** — a lift before the
 * ring closes empties it (`sim/ready-gate.ts`) — and the ring is what says so.
 *
 * **Waiting is the loud part**, and it is one line. Two people reading at their
 * own speeds means one is nearly always waiting, and a gate that said so in
 * nine-point grey was one people assumed had broken.
 */

/** How big a circle on this page is, and how far apart the two of them sit. */
const R = 44;
const GAP = 86;
/** Where the column starts, as a share of the play area. */
const TOP = 0.16;
/**
 * The column, as the gaps between its rows. `readyCircles` places the circles
 * from the layout alone — a circle whose place moved with the length of a
 * wave's sentence would sit differently in every wave — so the name block is
 * given the room three wrapped lines need and most waves leave some of it
 * empty, which is the cheap half of that bargain.
 */
const NAME_BLOCK = 94;
const ASK_GAP = 92;
const ASK_SUB = 18;
const LABEL_GAP = 20;
/** What has to fit under the circles: each one's name, then the line about who
 * is still reading. Both moved down when the names came out from over the
 * circles (`ready-circles.ts`). */
const FOOT = 88;

export interface ReadyCircle {
  x: number;
  y: number;
  r: number;
}

/** Where the two circles are. Drawn from this and measured against it. */
export function readyCircles(l: Layout): { p1: ReadyCircle; p2: ReadyCircle } {
  const cy = circlesY(l);
  const mid = l.width / 2;
  const r = circleR(l);
  const gap = Math.max(r + 12, Math.min(GAP, l.width / 2 - r - 10));
  return { p1: { x: mid - gap, y: cy, r }, p2: { x: mid + gap, y: cy, r } };
}

/**
 * The gap between the wave's sentence and the question under it.
 *
 * `ASK_GAP` is what the owner asked for — *move everything center top, and then
 * move the ready part more down from the wave name and description* — and on
 * every phone that is what it gets. A screen too short to hold the column at
 * that gap closes it rather than pushing the circles onto the bar, which is one
 * press meaning two things.
 */
function askGap(l: Layout): number {
  const floor = l.height - NAV_H - FOOT - circleR(l) * 2;
  const above = l.playHeight * TOP + NAME_BLOCK + ASK_SUB + LABEL_GAP;
  return Math.max(24, Math.min(ASK_GAP, floor - above));
}

function askY(l: Layout): number {
  return l.playHeight * TOP + NAME_BLOCK + askGap(l);
}

function circlesY(l: Layout): number {
  return askY(l) + ASK_SUB + LABEL_GAP + circleR(l);
}

function circleR(l: Layout): number {
  return Math.min(R, Math.max(20, (l.width - 40) / 4));
}

export interface ReadyView {
  role: ViewRole;
  /** How many pages this seat's guide has, for the bar under the page. */
  pages: number;
  /** The opening's own clock, and the blobs a READY throws. */
  fx?: OpeningFx;
  /** What the two are called, by seat, when the room has said. */
  names?: SeatNames;
  /** Where a mouse is resting, for the bar's own hover. */
  pointer?: { x: number; y: number };
}

export function drawReadyPage(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ReadyView,
): void {
  const { role, pages, fx, names } = view;
  // Dark enough to read against a field that is standing still behind it, light
  // enough that the field is plainly still there. It is the wave they are about
  // to play, not a card in front of it.
  ctx.fillStyle = "rgba(5,4,11,.72)";
  ctx.fillRect(0, 0, l.width, l.height);

  const age = fx?.age ?? SETTLED_AGE;
  // No fade: on this page the pair is what ends the reading, and words that had
  // started to fade would be words that looked like a mistake.
  drawIntroduction(ctx, l, world, age, false, l.playHeight * TOP);

  const mine: 1 | 2 | 0 = role === "p1" ? 1 : role === "p2" ? 2 : 0;
  const both = role === "test";
  const iAmReady = mine === 0 ? seatReady(world, 1) && seatReady(world, 2) : seatReady(world, mine);
  const other: 1 | 2 = mine === 2 ? 1 : 2;
  const beat = fx?.age ?? 0;

  const circles = readyCircles(l);
  ask(ctx, l, askY(l), iAmReady, beat);

  for (const seat of [1, 2] as const) {
    const own = seat === mine;
    const at = seat === 1 ? circles.p1 : circles.p2;
    drawCircle(ctx, at.x, at.y, world, seat, label(seat, own, both, names), own || both, at.r, {
      // The one that is waiting for a thumb breathes. Only this seat's own:
      // a partner's circle pulsing would be a screen asking for something the
      // person holding it cannot give.
      calling: (own || both) && !seatReady(world, seat),
      beat,
    });
    fx?.noteReady(seat, seatReady(world, seat), at.x, at.y, at.r);
  }

  waiting(ctx, l, circles.p1.y + circles.p1.r + 74, {
    mineReady: iAmReady,
    theirsReady: seatReady(world, other),
    both,
    other,
    beat,
    names,
  });

  // BACK only, and on the same bar the film's pages use so it does not move
  // under a thumb between the last page and this one. NEXT has nowhere to go,
  // and BACK has nowhere to go either once this seat has committed. REPLAY has
  // nothing to play: there is no film on this page.
  drawGuideNav(ctx, l, {
    page: pages - 1,
    pages,
    back: !iAmReady,
    age: beat,
    pointer: view.pointer,
  });
  fx?.draw(ctx);
}

/**
 * What to call a circle. A name if the room knows one — these are two people
 * and the gate should say so — and otherwise YOU and THEM on a phone, which
 * says more than a number does, or the two numbers at a desk holding both.
 */
function label(seat: 1 | 2, own: boolean, both: boolean, names?: SeatNames): string {
  if (hasSeatName(seat, names)) return seatName(seat, names);
  if (both) return seatName(seat);
  return own ? "YOU" : "THEM";
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
    ctx.fillText("HOLD ANYWHERE", l.width / 2, y + 18);
  }
  ctx.textAlign = "left";
}

interface WaitingState {
  mineReady: boolean;
  theirsReady: boolean;
  both: boolean;
  other: 1 | 2;
  beat: number;
  names?: SeatNames;
}

/**
 * Who is still reading, in the size that answer deserves — and in one line.
 *
 * It used to be a heading and a sentence under it in each case, and the owner
 * cut the page back: *shorten text to a minimum*. Nothing here was wrong and
 * all of it was a second way of saying the thing above it, on a screen whose
 * whole content is two circles and a question.
 */
function waiting(ctx: CanvasRenderingContext2D, l: Layout, y: number, s: WaitingState): void {
  const them = s.both ? "THE OTHER SEAT" : seatName(s.other, s.names);
  ctx.textAlign = "center";
  if (s.mineReady && !s.theirsReady) {
    ctx.globalAlpha = 0.62 + 0.38 * Math.abs(Math.sin(s.beat * 2.2));
    ctx.font = '700 17px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`WAITING FOR ${them}`, l.width / 2, y);
    ctx.globalAlpha = 1;
  } else if (s.theirsReady && !s.mineReady) {
    ctx.font = '700 17px "Courier New",monospace';
    ctx.fillStyle = PALETTE.good;
    ctx.fillText(`${them} IS READY`, l.width / 2, y);
  }
  ctx.textAlign = "left";
}
