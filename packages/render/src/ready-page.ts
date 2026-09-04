import { readyFraction, seatReady, type World } from "@neon-spore/sim";
import { drawGuideNav, inside, type NavBox, navButtons } from "./guide-nav.js";
import type { Layout, ViewRole } from "./layout.js";
import type { OpeningFx } from "./opening-fx.js";
import { PALETTE } from "./palette.js";
import { drawCircle, RING_GAP } from "./ready-circles.js";
import { drawIntroduction } from "./wave-intro.js";

/**
 * The last page of a stepped guide: the wave's own name, and the button that
 * says this seat has finished reading.
 *
 * **It is the game's screen and nothing else.** The owner put the arrangement
 * this way — *we could show the wave text and description already together with
 * the ready button view, so when showing ready buttons only the game screen
 * with wave name and description is shown* — and it is why a stepped guide
 * passes straight to the field: the introduction that used to stand after it
 * has been read here, on this page. The field is drawn behind, by the ordinary
 * frame, under a scrim just dark enough that the words hold.
 *
 * **Waiting is the loud part.** Two people reading at their own speeds means
 * one of them is nearly always waiting, and a gate that said so in nine-point
 * grey was a gate people assumed had broken. So the line above the circles is
 * the biggest thing on the page after the wave's name, it names the seat that
 * has not answered, and it pulses.
 *
 * The button is a **hold**, like every other version of this gate — the circle
 * fills while the thumb is down and empties if it lifts early, and
 * `sim/ready-gate.ts` says why that is not a tap. What is new is that it is a
 * button at all: the whole screen cannot be the target on a page that also
 * carries BACK.
 */

/** How far above the bottom bar the button sits, and how big it is. */
const BTN_H = 62;
const BTN_MAX_W = 250;

/** Where the READY button is. Drawn from this and hit-tested against it. */
export function readyButtonBox(l: Layout): NavBox {
  const nav = navButtons(l);
  const w = Math.min(BTN_MAX_W, Math.max(96, l.width - 48));
  return { x: (l.width - w) / 2, y: nav.bar.y - 26 - BTN_H, w, h: BTN_H };
}

/** Whether a point is on the READY button. */
export function onReadyButton(l: Layout, x: number, y: number): boolean {
  return inside(readyButtonBox(l), x, y);
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

  const mine: 1 | 2 | 0 = role === "p1" ? 1 : role === "p2" ? 2 : 0;
  const both = role === "test";
  const box = readyButtonBox(l);
  const iAmReady = mine === 0 ? seatReady(world, 1) && seatReady(world, 2) : seatReady(world, mine);
  const other: 1 | 2 = mine === 2 ? 1 : 2;
  const theirs = seatReady(world, other);

  // One column, bottom-first: the button, the circles, the line saying who is
  // still reading, and the wave's name hung above all of it. The name used to
  // sit where a standing introduction sits — a third of the way down, with a
  // hand's width of nothing between it and the rest — and the owner's answer
  // was to bring the two together. The field is still behind it, which is the
  // point of the page; what is gone is the gap.
  const said = box.y - 100;
  // No fade: on this page the pair is what ends the reading, and words that
  // had started to fade would be words that looked like a mistake.
  drawIntroduction(ctx, l, world, fx?.age ?? Number.POSITIVE_INFINITY, false, said - 30);

  waitingLine(ctx, l, said, iAmReady, theirs, both, other, fx?.age ?? 0);

  const cy = box.y - 34;
  for (const seat of [1, 2] as const) {
    const own = seat === mine;
    const label = both ? (seat === 1 ? "PLAYER ONE" : "PLAYER TWO") : own ? "YOU" : "THEM";
    const cx = l.width / 2 + (seat === 1 ? -RING_GAP : RING_GAP);
    drawCircle(ctx, cx, cy, world, seat, label, own || both, 17);
    fx?.noteReady(seat, seatReady(world, seat), cx, cy, 17);
  }

  button(ctx, box, iAmReady, readyFraction(world, mine === 0 ? 1 : mine), fx?.age ?? 0);
  // BACK only, and on the same bar the film's pages use so it does not move
  // under a thumb between the last page and this one. NEXT has nowhere to go,
  // and BACK has nowhere to go either once this seat has committed.
  drawGuideNav(ctx, l, pages - 1, pages, !iAmReady);
  fx?.draw(ctx);
}

/**
 * Who is still reading, in the size that answer deserves. Nothing else on this
 * page changes while a pair waits, so this is what has to carry it.
 */
function waitingLine(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  mineReady: boolean,
  theirsReady: boolean,
  both: boolean,
  other: 1 | 2,
  age: number,
): void {
  const pulse = 0.62 + 0.38 * Math.abs(Math.sin(age * 2.2));
  ctx.textAlign = "center";
  if (mineReady && !theirsReady) {
    ctx.globalAlpha = pulse;
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
    ctx.font = '700 15px "Courier New",monospace';
    ctx.fillStyle = PALETTE.text;
    ctx.fillText("BOTH SEATS HAVE TO SAY READY", l.width / 2, y);
    ctx.font = '11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("go back if you want to read a page again", l.width / 2, y + 19);
  }
  ctx.textAlign = "left";
}

/**
 * The button, **held rather than tapped**, and filling as it is held.
 *
 * The hold stays, and the reason changed under it. It used to be the only thing
 * standing between a stray tap and a wave nobody had read for
 * (`sim/ready-gate.ts`); the pages do that now, because nobody reaches this
 * screen without pressing NEXT their way to it. What the hold is for here is
 * the thumb that misses: NEXT is in the corner directly under this button, and
 * a tap-to-ready would fire on every mis-aimed press of it. Four hundred and
 * twenty milliseconds is short enough not to feel like a toll and long enough
 * that nothing arrives here by accident.
 *
 * So the button says so, by filling. The two circles are the *pair's* gauge —
 * whose thumb is down, who is finished — and they are small and off to one
 * side; a thumb that is down on this button needs to see its own progress under
 * itself, or the four hundred milliseconds read as a button that did not work.
 */
function button(
  ctx: CanvasRenderingContext2D,
  box: NavBox,
  done: boolean,
  fill: number,
  age: number,
): void {
  const glow = done ? 1 : 0.7 + 0.3 * Math.abs(Math.sin(age * 2.2));
  ctx.fillStyle = done ? "rgba(12,44,30,.95)" : "rgba(38,22,72,.96)";
  ctx.fillRect(box.x, box.y, box.w, box.h);
  // The hold, across the button, under the word. It is left to right rather
  // than out from the middle: this is a thing being finished, and everything
  // else in the game that fills over time fills the way a bar fills.
  if (!done && fill > 0) {
    ctx.fillStyle = "rgba(192,92,255,.34)";
    ctx.fillRect(box.x, box.y, box.w * fill, box.h);
  }
  ctx.globalAlpha = glow;
  ctx.strokeStyle = done ? PALETTE.good : PALETTE.hull;
  ctx.lineWidth = 2.4;
  ctx.strokeRect(box.x + 1.2, box.y + 1.2, box.w - 2.4, box.h - 2.4);
  ctx.globalAlpha = 1;
  ctx.textAlign = "center";
  ctx.font = '700 22px "Courier New",monospace';
  ctx.fillStyle = done ? PALETTE.good : PALETTE.hullRim;
  ctx.fillText(done ? "READY" : "HOLD TO READY", box.x + box.w / 2, box.y + box.h / 2 + 8);
  ctx.textAlign = "left";
}
