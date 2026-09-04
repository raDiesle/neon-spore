import { INTRO_PAGES } from "@neon-spore/content";
import { drawGuideNav, NAV_H, navHit } from "./guide-nav.js";
import { drawIntroFigure } from "./intro-figure.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drop } from "./text-drop.js";
import { wrapText } from "./wrap-text.js";

/**
 * WHAT THIS GAME IS, ON THE GAME'S OWN SCREEN.
 *
 * Six pages, read one at a time, with the same bar underneath them that a
 * wave's guide uses — the same NEXT, the same dots, the same place for a
 * thumb. That is the whole reason it is drawn here rather than built as a page
 * of markup over the canvas: the first screen a pair sees is the screen they
 * will be playing on, in the same type, the same violet, the same slab under
 * the same three buttons. A card in front of the game says *press me*; this
 * says *this is the game*.
 *
 * The words are `packages/content/src/intro.ts` and nothing about them is
 * decided here. The pictures are `intro-figure.ts`.
 *
 * It draws over whatever is behind it and reads nothing: no world, no seat, no
 * link. The host owns which page is up and when the whole thing goes away
 * (`apps/game/src/intro.ts`).
 */

/** What a press on the intro means. `page` is the page area — a tap forward. */
export type IntroHit = "back" | "next" | "skip" | "page" | null;

const TITLE_FONT = '700 19px "Courier New",monospace';
const BODY_FONT = '13px "Courier New",monospace';
const SKIP_FONT = '600 11px "Courier New",monospace';
/** The corner word that leaves: a hit box, so it is answered where it is drawn. */
export function skipBox(l: Layout): { x: number; y: number; w: number; h: number } {
  const w = 74;
  const h = 30;
  return { x: l.width - w - 10, y: 8, w, h };
}

/** Which of the intro's controls a point is on. */
export function introHit(l: Layout, x: number, y: number): IntroHit {
  const s = skipBox(l);
  if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return "skip";
  if (y >= l.height - NAV_H) {
    const nav = navHit(l, x, y);
    if (nav === "back") return "back";
    if (nav === "next") return "next";
    // The bar itself, between the buttons, is not a page tap: a thumb that
    // missed NEXT by four pixels should not turn the page it was aiming at.
    return null;
  }
  return "page";
}

/**
 * One page, drawn over everything.
 *
 * `age` is seconds this page has been up. The type lands on it, a line at a
 * time, the same drop a wave's introduction uses — so paging forward and back
 * replays the arrival rather than cutting between two settled screens.
 */
export function drawIntroPage(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  page: number,
  age: number,
  pointer?: { x: number; y: number },
): void {
  const entry = INTRO_PAGES[Math.max(0, Math.min(INTRO_PAGES.length - 1, page))];
  if (!entry) return;

  // Deep enough that the field's own words — a wave's name, the paused line —
  // do not compete with the page's, and not black: the field goes on moving
  // behind this, which is the point of drawing it here at all.
  ctx.fillStyle = "rgba(5,4,11,.988)";
  ctx.fillRect(0, 0, l.width, l.height);

  const mid = l.width / 2;
  const top = l.height * 0.08;
  ctx.textAlign = "center";

  let line = 0;
  drop(ctx, mid, top + 24, age, line++, 0, () => {
    ctx.font = SKIP_FONT;
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("NEON SPORE", 0, 0);
  });

  // The title is the advertisement and takes the room to be one. It wraps
  // rather than shrinking: a long one on a narrow phone is two lines of the
  // same size, not one line nobody can read.
  ctx.font = TITLE_FONT;
  let y = top + 58;
  for (const wrapped of wrapText(ctx, entry.title, l.width - 44)) {
    drop(ctx, mid, y, age, line, 0, () => {
      ctx.font = TITLE_FONT;
      ctx.fillStyle = PALETTE.hullRim;
      ctx.fillText(wrapped, 0, 0);
    });
    y += 27;
  }
  line++;

  // The picture takes the room the words gave back: it is doing most of the
  // work now that there is one line under it rather than two paragraphs.
  const figureTop = y + 6;
  // Neither side may go negative. Below about 230 device pixels of height the
  // title and the nav bar already fill the window and the subtraction went
  // past zero; a canvas that has not been laid out yet — a tab drawing while
  // hidden, which still runs its frames — is 0 wide and takes the width past
  // zero the same way. Either one reached `plate` as a negative corner radius,
  // which a real canvas throws `IndexSizeError` on, so the first screen of the
  // game died rather than drawing a squeezed one.
  const figureHeight = Math.max(0, (l.height - NAV_H - figureTop) * 0.66);
  drawIntroFigure(
    ctx,
    entry.figure,
    { x: 14, y: figureTop, w: Math.max(0, l.width - 28), h: figureHeight },
    age,
  );

  ctx.font = BODY_FONT;
  y = figureTop + figureHeight + 34;
  for (const wrapped of wrapText(ctx, entry.line, l.width - 52)) {
    drop(ctx, mid, y, age, line, 0, () => {
      ctx.font = BODY_FONT;
      ctx.fillStyle = PALETTE.text;
      ctx.fillText(wrapped, 0, 0);
    });
    y += 21;
  }

  skip(ctx, l, page, pointer);
  ctx.textAlign = "left";

  drawGuideNav(ctx, l, {
    page,
    pages: INTRO_PAGES.length,
    age,
    // Nothing to replay: this is not a rehearsal, and a lit REPLAY on a page
    // of type is a button that answers nothing (`guide-nav.ts`).
    replay: false,
    // NEXT is loud from the moment the page has landed: there is no film to
    // wait for here, and the owner asked for that glow by name on the guide.
    played: true,
    pointer,
  });
}

/** The way out, in the corner, on every page — including the last. */
function skip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  page: number,
  pointer?: { x: number; y: number },
): void {
  const b = skipBox(l);
  const over =
    pointer !== undefined &&
    pointer.x >= b.x &&
    pointer.x <= b.x + b.w &&
    pointer.y >= b.y &&
    pointer.y <= b.y + b.h;
  ctx.font = SKIP_FONT;
  ctx.textAlign = "right";
  // It says what it does rather than what it is: on the last page there is
  // nothing left to skip, and PLAY is the honest word for the same press.
  // On the last page there is nowhere forward — NEXT is spent, the way the
  // guide's is — so this corner is the action rather than the way out of one,
  // and it is lit like a button instead of sitting back like a label.
  const last = page >= INTRO_PAGES.length - 1;
  ctx.fillStyle = last ? PALETTE.pod : over ? PALETTE.hullRim : PALETTE.dim;
  ctx.fillText(last ? "PLAY ▸" : "SKIP ▸", b.x + b.w, b.y + 20);
  ctx.textAlign = "center";
}
