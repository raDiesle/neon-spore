import { halo } from "./glow.js";
import { mixHex } from "./hex.js";
import { introEar } from "./intro-ear.js";
import { introMouth } from "./intro-mouth.js";
import { plate } from "./intro-parts.js";

/**
 * ONE OF THE TWO PEOPLE IN THE SCENE: a phone, an ear and a mouth.
 *
 * **It used to be a lobed blob with one eye**, and this file used to argue for
 * that — the game is made of blobs, and a face would be the one thing on the
 * first screen that came from somewhere else. The owner overruled it on 16
 * September 2026, having called the scene bad twice: *the human heads should be
 * recognizable as it. Maybe only show the mouth and ear, but they must look
 * like real identifiable as those.* So there is no head here at all. There is
 * the organ that speaks, the organ that hears, and the phone the two of them
 * are pointed at — and nothing that has to be read as a person first.
 *
 * **The phone is back, small.** It was taken out on 15 September — *how the
 * game looks or what is shown on the mobile is not relevant* — and he narrowed
 * that rather than reversing it: the phone returns as *the thing a mouth and an
 * ear are held against*, and what is on its screen is still beside the point.
 * It carries rows of light and no picture, and it is the brightest thing in the
 * figure only while its owner is reading it.
 *
 * The seat's colour still does the naming. Violet is player one and amber is
 * player two everywhere else in the game (`seat-skin.ts`), so the pair meet the
 * two colours they are about to be told apart by before they have chosen
 * anything.
 *
 * The shapes themselves are `intro-mouth.ts` and `intro-ear.ts`; this file is
 * where they stand, which way they face and which of the scene's four moments
 * each of them is in.
 */

/** Which of the scene's four moments this one is in, all of them 0..1. */
export interface IntroPerson {
  /** +1 faces right, -1 faces left. The other one is always the other way. */
  look: 1 | -1;
  /** Reading their own screen, before they have said anything. */
  reading: number;
  /** A word coming out, right now. */
  talking: number;
  /** Being told something by the other one. */
  listening: number;
}

/** Where a shout leaves this figure: its mouth. */
export function introMouthAt(
  cx: number,
  cy: number,
  r: number,
  look: 1 | -1,
): { x: number; y: number } {
  return { x: cx + look * r * 0.9, y: cy + r * 0.3 };
}

/** Where a shout lands on this figure: its ear, and not its mouth. A word
 * thrown from one mouth to another is two people talking over each other. */
export function introEarAt(
  cx: number,
  cy: number,
  r: number,
  look: 1 | -1,
): { x: number; y: number } {
  return { x: cx - look * r * 0.02, y: cy - r * 0.32 };
}

/** The phone, the ear and the mouth, in the seat's own colour. */
export function introPlayer(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  tint: string,
  age: number,
  p: IntroPerson,
): void {
  if (r <= 0) return;
  // Bent over the phone while reading it, turned toward the other one while
  // talking or listening. One number, because a figure that could do both at
  // once is one person facing two ways.
  const lean = r * 0.18 * (Math.max(p.talking, p.listening) - p.reading);
  const breath = Math.sin(age * 1.7 + cx * 0.03) * r * 0.02;
  const ox = cx + p.look * lean;

  // The phone low and outside, with the ear over it and the mouth in front:
  // the arrangement of somebody holding a screen up beside their own face,
  // which is what puts all three of them in one group rather than in a row of
  // three objects.
  phone(ctx, cx - p.look * r * 0.66, cy + r * 0.3 + breath, r, tint, age, p);
  introEar(ctx, ox - p.look * r * 0.02, cy - r * 0.32 + breath, r * 0.5, tint, p.look, p.listening);
  // Open only while a word is coming out, and moving fast while it is: a shout
  // is loud and short, and it is the one part of the figure that snaps.
  const open = p.talking * (0.55 + 0.45 * Math.abs(Math.sin(age * 9)));
  introMouth(
    ctx,
    ox + p.look * r * 0.46,
    cy + r * 0.4 + breath,
    r * 0.92,
    tint,
    p.talking > 0.02 ? open : 0,
  );
}

/** The screen in their hand: rows of light, no picture, and lit while read. */
function phone(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  tint: string,
  age: number,
  p: IntroPerson,
): void {
  const w = r * 0.56;
  const h = r * 1.05;
  const wake = Math.max(0, Math.min(1, p.reading));
  ctx.save();
  ctx.translate(cx, cy);
  // Tilted toward its owner, so the face of it is turned to the ear and the
  // mouth rather than out at whoever is holding the real phone.
  ctx.rotate(p.look * (0.26 - 0.12 * wake));
  halo(ctx, 0, 0, Math.max(w, h) * 0.9, tint, 0.14 + 0.36 * wake);
  plate(ctx, -w / 2, -h / 2, w, h, tint, mixHex(tint, "#0B0718", 0.9 - 0.25 * wake));

  // Three rows of a readout, arriving one after another while it is being
  // read. **What they say is deliberately nothing** — the owner's own note is
  // that what is on the screen does not matter; that one of them is reading it
  // does.
  for (let i = 0; i < 3; i++) {
    const on = Math.max(0, Math.min(1, wake * 3 - i));
    if (on <= 0.01) continue;
    const row = -h * 0.24 + i * h * 0.22;
    const wide = w * (0.62 - i * 0.12) * on;
    ctx.globalAlpha = 0.35 + 0.5 * on * (0.7 + 0.3 * Math.sin(age * 5 + i));
    ctx.fillStyle = tint;
    ctx.fillRect(-wide / 2, row, wide, Math.max(1, h * 0.05));
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
