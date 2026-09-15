import { INTRO_BEATS } from "@neon-spore/content";
import { halo } from "./glow.js";
import { INTRO_ACCENT, surge, towards } from "./intro-flash.js";
import type { FigureBox } from "./intro-parts.js";
import { introPlayer } from "./intro-player.js";
import { drawShareBoard, type IntroPlay } from "./intro-share.js";
import { answered, crossed, drawShout, shoutNow } from "./intro-shout.js";
import { PALETTE } from "./palette.js";

/**
 * THE PICTURE THE WHOLE INTRO IS: two people, one ship's controls between
 * them, and a word crossing.
 *
 * Where everything in the scene *is* — and, more to the point, the one clock
 * they all read. The shout leaving one mouth and the control moving on the
 * other side of the seam are two drawings of a single sentence, and a moment
 * where one of them has happened and the other has not is the pair failing to
 * talk to each other. So the timing is computed once here and handed down
 * (`IntroPlay`), rather than each part deciding for itself.
 *
 * **The two phones are gone from it**, since 15 September 2026. They stood
 * under the two heads with the field drawn on one and a panel on the other,
 * and the owner took them out: *how the game looks or what is shown on the
 * mobile is not relevant*. What is under the heads now is one board with a
 * seam down it (`intro-share.ts`) — the same argument with the hardware left
 * out of it.
 *
 * Its own file beside the scene's layout, which carries the banner, the tag,
 * the sentences and the corner and would be over the 250-line limit with this
 * in it. The seam is the same one `intro-flash.ts` sits on: next door is what a
 * screen of advertising looks like, and this is what it is advertising.
 */

/** Where the two halves of the board are at this moment of the scene. */
export function introPlay(age: number): IntroPlay {
  const fire = INTRO_BEATS.find((beat) => beat.answer === "fire");
  const shield = INTRO_BEATS.find((beat) => beat.answer === "shield");
  return {
    shot: fire ? answered(age, fire) : 0,
    shielded: shield ? answered(age, shield) : 0,
  };
}

/**
 * The picture, coming at the reader and going back — the effect the owner
 * asked for by name.
 *
 * Clipped to its own window, and the window is the reason it reads as depth
 * rather than as a zoom: something that grows past a hard edge is behind that
 * edge. Without the clip the near end of the trip lands on the banner.
 */
export function drawIntroPair(ctx: CanvasRenderingContext2D, box: FigureBox, age: number): void {
  if (box.w <= 0 || box.h <= 0) return;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const depth = surge(age);
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x - 6, box.y - 6, box.w + 12, box.h + 12);
  ctx.clip();
  // The radius is fixed and only the alpha moves, because `haloSprite` bakes a
  // canvas per radius (`glow.ts`).
  halo(ctx, cx, cy, Math.min(box.w, box.h) * 0.5, INTRO_ACCENT.hex, 0.06 + 0.18 * depth);
  towards(ctx, cx, cy, 0.9 + 0.16 * depth, () => pair(ctx, box, age));
  ctx.restore();
}

/** The two of them, the board they share, and whatever is being said across it. */
function pair(ctx: CanvasRenderingContext2D, box: FigureBox, age: number): void {
  const play = introPlay(age);
  // The two of them stand in from the edges rather than over their own half of
  // the board: the word has to have somewhere to cross, and the corner has to
  // be free for the tag that is slapped on it (`intro-flash.ts`).
  const headR = Math.max(1, Math.min(box.w * 0.16, box.h * 0.14));
  // **The board is as wide as it is allowed and no taller than it is wide.**
  // A board given every pixel under the heads is mostly empty board: a hull
  // along the top, a seam, two controls at the bottom and a hand's breadth of
  // nothing between them. Held in from the edges for the same reason the heads
  // are — the whole picture is scaled about its own centre as it comes at the
  // reader (`intro-flash.ts`), and a board flush against the clip loses its rim
  // for half of every cycle.
  const boardW = box.w * 0.9;
  const boardH = Math.min(Math.max(0, box.h - headR * 3.2), boardW * 0.72);
  // **The two of them and the board are one group, centred in the window.**
  // Given the window each, on a tall phone, the heads float in the middle of a
  // field of nothing with the board pinned to the floor, and the picture reads
  // as two pictures. The word crosses between the heads and the controls hang
  // under them, so what holds them together is standing close.
  const gap = headR * 0.55;
  const tall = headR * 2 + gap + boardH;
  const top = box.y + Math.max(0, (box.h - tall) / 2);
  const board = { x: box.x + box.w * 0.05, y: top + headR * 2 + gap, w: boardW, h: boardH };
  const headY = top + headR;
  const left = { x: box.x + box.w * 0.24, y: headY };
  const right = { x: box.x + box.w * 0.74, y: headY };

  const shout = shoutNow(age);
  const speaker = shout?.beat.from ?? 0;
  const said = shout ? 1 - shout.pop : 0;
  const heard = shout ? crossed(age, shout.beat) : 0;
  // Whoever is speaking has their mouth open and the other one leans in. Which
  // of them it is turns over between the two beats, because each of them sees
  // something the other has to answer (`content/src/intro.ts`).
  introPlayer(ctx, left.x, left.y, headR, PALETTE.hull, age, {
    look: 1,
    talking: speaker === 1 ? said : 0,
    listening: speaker === 2 ? heard : 0,
  });
  introPlayer(ctx, right.x, right.y, headR, PALETTE.pod, age, {
    look: -1,
    talking: speaker === 2 ? said : 0,
    listening: speaker === 1 ? heard : 0,
  });

  drawShareBoard(ctx, board, age, play);

  if (shout) {
    const mouth = (at: { x: number; y: number }, towardsRight: boolean) => ({
      x: at.x + (towardsRight ? headR * 0.6 : -headR * 0.6),
      y: at.y + headR * 0.4,
    });
    const fromRight = shout.beat.from === 2;
    drawShout(
      ctx,
      mouth(fromRight ? right : left, !fromRight),
      mouth(fromRight ? left : right, fromRight),
      shout.beat.shout,
      shout.cross,
      shout.pop,
      age,
      Math.max(8, Math.min(box.w * 0.1, box.h * 0.1)),
    );
  }
}
