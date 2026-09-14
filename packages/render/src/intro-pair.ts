import { INTRO_BEATS } from "@neon-spore/content";
import { halo } from "./glow.js";
import { INTRO_ACCENT, surge, towards } from "./intro-flash.js";
import type { FigureBox } from "./intro-parts.js";
import { introPlayer } from "./intro-player.js";
import { fieldPhone, type IntroPlay, panelPhone } from "./intro-screens.js";
import { answered, crossed, drawShout, shoutNow } from "./intro-shout.js";
import { PALETTE } from "./palette.js";

/**
 * THE PICTURE THE WHOLE INTRO IS: two people, two phones, and a word crossing
 * between them.
 *
 * Where everything in the scene *is* — and, more to the point, the one clock
 * they all read. The shout leaving one mouth, the finger landing on the other
 * phone and the body popping on the first are three drawings of a single
 * sentence, and a moment where one of them has happened and another has not is
 * the pair failing to talk to each other. So the timing is computed once here
 * and handed down (`IntroPlay`), rather than each part deciding for itself.
 *
 * Its own file beside the scene's layout, which carries the banner, the tag,
 * the caption and the corner and would be over the 250-line limit with this in
 * it. The seam is the same one `intro-flash.ts` sits on: next door is what a
 * screen of advertising looks like, and this is what it is advertising.
 */

/** Where the two phones are at this moment of the scene. */
export function introPlay(age: number): IntroPlay {
  const first = INTRO_BEATS[0];
  const second = INTRO_BEATS[1];
  return {
    // The body is at the hull's own height by the time the shout about it has
    // crossed: what the pair are watching is a clock running out, not a wait.
    fall: first ? clamp01((age - 0.4) / Math.max(0.1, first.at + 0.6)) : 0,
    shot: first ? answered(age, first) : 0,
    drop: second ? clamp01((age - second.at + 0.8) / Math.max(0.1, 1.6)) : 0,
    shielded: second ? answered(age, second) : 0,
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

/** The two of them, their phones, and whatever is being said between them. */
function pair(ctx: CanvasRenderingContext2D, box: FigureBox, age: number): void {
  const play = introPlay(age);
  // The two of them stand in from the edges rather than over their own phones:
  // the word has to have somewhere to cross, and the corner has to be free for
  // the tag that is slapped on it (`intro-flash.ts`).
  const headR = Math.max(1, Math.min(box.w * 0.11, box.h * 0.09));
  const headY = box.y + headR * 1.3;
  const left = { x: box.x + box.w * 0.28, y: headY };
  const right = { x: box.x + box.w * 0.7, y: headY };
  // The phones hang under them and take everything that is left: a gap between
  // a person and the phone they are holding is a person standing next to one.
  const phoneTop = headY + headR * 1.45;
  // Held in from the edges of the box: the whole picture is scaled about its
  // own centre as it comes at the reader (`intro-flash.ts`), and a phone flush
  // against the clip loses its rim for half of every cycle.
  const phone = { w: box.w * 0.41, h: Math.max(0, box.y + box.h - phoneTop) };

  const shout = shoutNow(age);
  const talking = shout ? 1 - shout.pop : 0;
  const listening = shout ? crossed(age, shout.beat) : 0;
  introPlayer(ctx, left.x, left.y, headR, PALETTE.hull, age, {
    look: 1,
    talking,
    listening: 0,
  });
  introPlayer(ctx, right.x, right.y, headR, PALETTE.pod, age, {
    look: -1,
    talking: 0,
    listening,
  });

  if (phone.w > 0 && phone.h > 0) {
    fieldPhone(ctx, { x: box.x + box.w * 0.04, y: phoneTop, ...phone }, age, play);
    panelPhone(ctx, { x: box.x + box.w * 0.55, y: phoneTop, ...phone }, age, play);
  }

  if (shout) {
    drawShout(
      ctx,
      { x: left.x + headR * 0.6, y: left.y + headR * 0.4 },
      { x: right.x - headR * 0.6, y: right.y + headR * 0.4 },
      shout.beat.shout,
      shout.cross,
      shout.pop,
      age,
      Math.max(8, Math.min(box.w * 0.1, box.h * 0.1)),
    );
  }
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
