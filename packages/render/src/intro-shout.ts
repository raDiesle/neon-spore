import {
  blobPoints,
  INTRO_ANSWER,
  INTRO_BEATS,
  INTRO_CROSS,
  type IntroBeat,
} from "@neon-spore/content";
import { smoothstep } from "./ease.js";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE WORD CROSSING THE ROOM, which is the one thing the intro is about.
 *
 * A shout leaves the player who can see something, travels the gap between the
 * two of them, and lands on the player holding the control. The arithmetic is
 * here rather than in the layout next door because it is the half that can be
 * wrong silently — an answer that starts before its word has arrived is a pair
 * who are not talking to each other, which is the opposite of the pitch.
 *
 * The bubble is the game's own idiom and not a cartoon's: a lobed contour out
 * of `blobPath` with a rim burning round it, the same way the headline's slab
 * and the tag's starburst are grown rather than drawn (`intro-flash.ts`). Its
 * tail is the trail of beads the six-page intro used to send across the gap —
 * kept, because it was the one part of that screen that said *this is being
 * said out loud* without a word of explanation.
 */

/** 0 before the shout leaves, 1 once it has arrived. */
export function crossed(age: number, beat: IntroBeat): number {
  return clamp01((age - beat.at) / INTRO_CROSS);
}

/**
 * 0 before the listener has heard it, 1 once they have moved the control.
 *
 * It starts at the moment the word lands and not a frame before: the whole
 * argument of the scene is that one of them acts *because* the other spoke.
 */
export function answered(age: number, beat: IntroBeat): number {
  return smoothstep(clamp01((age - beat.at - INTRO_CROSS) / INTRO_ANSWER));
}

/** How long a landed bubble stays before it pops, in seconds. */
const LINGER = 0.34;

/**
 * The shout in the air right now, if there is one: how far it has got, and how
 * far through bursting on the far side it is.
 *
 * One at a time, and the later beat wins where two would overlap — two bubbles
 * in the air at once is a room with four people in it.
 */
export function shoutNow(age: number): { beat: IntroBeat; cross: number; pop: number } | null {
  for (let i = INTRO_BEATS.length - 1; i >= 0; i--) {
    const beat = INTRO_BEATS[i];
    if (!beat) continue;
    if (age >= beat.at && age < beat.at + INTRO_CROSS + LINGER) {
      return {
        beat,
        cross: crossed(age, beat),
        pop: clamp01((age - beat.at - INTRO_CROSS) / LINGER),
      };
    }
  }
  return null;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * The bubble, somewhere between the two of them.
 *
 * `from` and `to` are the two mouths; `cross` is how far along it is. It rides
 * a shallow arc rather than a straight line, because a word travelling flat
 * between two heads reads as a label sliding and a word that rises and falls
 * reads as one that was thrown.
 */
export function drawShout(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  text: string,
  cross: number,
  pop: number,
  age: number,
  scale: number,
): void {
  const t = smoothstep(cross);
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t - Math.sin(t * Math.PI) * scale * 1.1;
  // It is thrown rather than handed over: it swells out of the speaker, holds
  // its size across the gap, and is punched flat on the far side.
  const grown = smoothstep(clamp01(cross / 0.18));
  const size = Math.max(6, scale * 0.42);
  ctx.font = `700 ${size.toFixed(1)}px "Courier New",monospace`;
  const w = ctx.measureText(text).width + size * 1.5;
  const h = size * 2.1;
  // It bursts on arrival rather than sliding off: swollen past its own size on
  // the way out, and gone by the time the listener's hand has finished moving.
  const swell = grown * (1 - pop) * (1 + 0.12 * Math.sin(age * 5.4) + 0.3 * pop);
  if (swell <= 0.02) return;

  // The beads behind it: the word is still coming out of the speaker while its
  // front is already most of the way across.
  for (let i = 1; i <= 3; i++) {
    const back = t - i * 0.09;
    if (back <= 0) continue;
    const bx = from.x + (to.x - from.x) * back;
    const by = from.y + (to.y - from.y) * back - Math.sin(back * Math.PI) * scale * 1.1;
    const r = scale * 0.07 * (1 - i * 0.22);
    halo(ctx, bx, by, r * 3, PALETTE.text, 0.3);
    ctx.beginPath();
    ctx.ellipse(bx, by, r, r * 0.86, 0, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.text;
    ctx.globalAlpha = 0.5 - i * 0.12;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(swell, swell);
  halo(ctx, 0, 0, Math.max(w, h) * 0.7, PALETTE.hullRim, 0.32);
  const path = splinePath(
    blobPoints(0, 0, Math.max(1, w / 2), Math.max(1, h / 2), 7, 0.05, 0.03, age, 5501, 54),
    true,
  );
  ctx.fillStyle = mixHex(PALETTE.hullRim, "#0B0718", 0.1);
  ctx.fill(path);
  strokeGlow(ctx, path, PALETTE.hullRim, Math.max(1.2, h * 0.06), 1);
  ctx.font = `700 ${size.toFixed(1)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#0B0718";
  ctx.fillText(text, 0, size * 0.36);
  ctx.restore();
  ctx.textAlign = "center";
}
