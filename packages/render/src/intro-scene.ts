import { INTRO_FLASH, INTRO_LINE, INTRO_SCENE_SECONDS, INTRO_TITLE } from "@neon-spore/content";
import { headline, INTRO_ACCENT, stickTag, surge } from "./intro-flash.js";
import { drawIntroPair } from "./intro-pair.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drop } from "./text-drop.js";
import { wrapText } from "./wrap-text.js";

/**
 * WHAT THIS GAME IS, ON THE GAME'S OWN SCREEN: one scene, and no stepper.
 *
 * It was six pages with a BACK, a NEXT and a page count under them, and the
 * owner had all of it taken out on 14 September 2026. A front door somebody
 * has to operate is a manual, and a manual is the one thing nobody reads for a
 * game they have not chosen yet. What is here instead plays through on its own
 * and ends on one press, wherever the press lands.
 *
 * It says one thing twice: two phones, one game, and the players talk. One of
 * them can see a body coming down and cannot touch it; the other is holding
 * the button and cannot see it. So one of them shouts, and the other one
 * moves — `SHOOT NOW`, and a finger on fire; `MOVE THE SHIELD`, and a shield
 * sliding. The words are `packages/content/src/intro.ts`, the two phones are
 * `intro-screens.ts`, the people are `intro-player.ts` and the word crossing
 * between them is `intro-shout.ts`; the loud half — the banner, the tag and
 * the one cycle that carries the picture at the reader and back — is
 * `intro-flash.ts`, which is the owner's own store-window comparison and
 * survives the rewrite because none of it was ever the stepper's.
 *
 * It draws over whatever is behind it and reads nothing: no world, no seat, no
 * link. The host owns when it opens and when it goes away
 * (`apps/game/src/intro.ts`).
 */

const TITLE_FONT = '700 22px "Courier New",monospace';
/** One line of headline to the next. */
const TITLE_STEP = 27;
const BODY_FONT = '14px "Courier New",monospace';
const SKIP_FONT = '600 11px "Courier New",monospace';

/** The one press target that is drawn as one: the corner that says PLAY. */
export function playBox(l: Layout): { x: number; y: number; w: number; h: number } {
  const w = 74;
  const h = 30;
  return { x: l.width - w - 10, y: 8, w, h };
}

/** Whether the scene has said everything it has to say. */
export function introOver(age: number): boolean {
  return age >= INTRO_SCENE_SECONDS;
}

/**
 * The whole scene, drawn over everything.
 *
 * `age` is seconds since it opened, and it is the only clock any of this has.
 */
export function drawIntroScene(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  age: number,
  pointer?: { x: number; y: number },
): void {
  // Opaque, and past the stage on every side: the stage is a phone-shaped
  // rectangle centred in the window (`computeStage`), and a veil drawn to
  // `l.width` left a strip of the stopped field down the edge of a screen that
  // is supposed to be the whole screen.
  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(-l.width, -l.height, l.width * 3, l.height * 3);

  const mid = l.width / 2;
  const top = l.height * 0.06;
  ctx.textAlign = "center";

  let line = 0;
  drop(ctx, mid, top + 20, age, line++, 0, () => {
    ctx.font = SKIP_FONT;
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("NEON SPORE", 0, 0);
  });

  ctx.font = TITLE_FONT;
  const titled = wrapText(ctx, INTRO_TITLE, l.width - 84);
  const widest = Math.max(...titled.map((w) => ctx.measureText(w).width));
  const slab = {
    w: Math.max(0, Math.min(l.width - 20, widest + 52)),
    h: titled.length * TITLE_STEP + 22,
    top: top + 32,
  };
  headline(ctx, mid, slab.top, slab.w, slab.h, INTRO_ACCENT, age, surge(age, 0.25));
  let y = slab.top + slab.h / 2 - ((titled.length - 1) * TITLE_STEP) / 2 + 8;
  for (const wrapped of titled) {
    drop(ctx, mid, y, age, line, 0, () => {
      ctx.font = TITLE_FONT;
      ctx.fillStyle = INTRO_ACCENT.rim;
      ctx.fillText(wrapped, 0, 0);
    });
    y += TITLE_STEP;
  }
  line++;

  // The sentence goes where a caption goes — hard against the bottom — and the
  // picture takes everything left between it and the banner. Neither side may
  // go negative: below about 230 device pixels of height the banner alone
  // fills the window, and a canvas that has not been laid out yet is 0 wide.
  // Either one reached `plate` as a negative corner radius, which a real
  // canvas throws `IndexSizeError` on, and the first screen of the game died
  // rather than drawing a squeezed one.
  ctx.font = BODY_FONT;
  const said = wrapText(ctx, INTRO_LINE, l.width - 52);
  const sayAt = l.height - 26 - (said.length - 1) * 21;
  const figureTop = slab.top + slab.h + 14;
  const box = {
    x: 14,
    y: figureTop,
    w: Math.max(0, l.width - 28),
    h: Math.max(0, sayAt - 30 - figureTop),
  };
  drawIntroPair(ctx, box, age);
  stickTag(ctx, box, INTRO_FLASH, INTRO_ACCENT, age);

  y = sayAt;
  for (const wrapped of said) {
    drop(ctx, mid, y, age, line, 0, () => {
      ctx.font = BODY_FONT;
      ctx.fillStyle = PALETTE.text;
      ctx.fillText(wrapped, 0, 0);
    });
    y += 21;
  }

  playCorner(ctx, l, age, pointer);
  ctx.textAlign = "left";
}

/**
 * The one press, said out loud in the corner.
 *
 * It is not a button in the sense that anything else on the screen is one: a
 * press anywhere closes the scene (`apps/game/src/intro.ts`), and this is
 * where somebody who is looking for the way out looks first.
 */
function playCorner(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  age: number,
  pointer?: { x: number; y: number },
): void {
  const b = playBox(l);
  const over =
    pointer !== undefined &&
    pointer.x >= b.x &&
    pointer.x <= b.x + b.w &&
    pointer.y >= b.y &&
    pointer.y <= b.y + b.h;
  ctx.font = SKIP_FONT;
  ctx.textAlign = "right";
  // It brightens as the scene runs out: early on it is the way past something
  // worth watching, and by the end it is the only thing left to do.
  const ripe = Math.min(1, age / INTRO_SCENE_SECONDS);
  ctx.fillStyle = over || ripe > 0.75 ? PALETTE.pod : PALETTE.dim;
  ctx.fillText("PLAY ▸", b.x + b.w, b.y + 20);
  ctx.textAlign = "center";
}
