import { inside, type NavBox } from "./guide-nav.js";
import { CORNER, wordPlate } from "./guide-tide-plate.js";
import type { Layout } from "./layout.js";
import { lostButtons } from "./lost-boxes.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";

/**
 * What the pair does about a lost wave: RETRY WAVE, TUTORIAL AGAIN and GO TO
 * MENU.
 *
 * Split out of `lost-screen.ts` on 17 September 2026 when that file went past
 * 250 lines. The cut is where the seam already was: everything above it —
 * the veil, the wound, the words — is `LOST_LOOK`'s and a candidate may replace
 * all of it, and **these buttons are the one part of the screen a
 * candidate may not touch**, because `apps/game/src/lost.ts` and the
 * director's `stage-opening.ts` hit-test the boxes `lostButtons` hands out. A
 * look that moved them would move the picture and not the thumb
 * (`lost-look.ts`). Where they are is `lost-boxes.ts`; this file paints
 * them.
 */

export { type LostButtons, lostButtons, lostHit } from "./lost-boxes.js";

/** The faces. Why QUIT's is smaller and dimmer, and why TUTORIAL AGAIN's is
 * RETRY's sibling, is argued beside their boxes (`lost-boxes.ts`). */
const WORD = '700 18px "Courier New",monospace';
const QUIT_WORD = '700 13px "Courier New",monospace';
/** How much of RETRY's brightness QUIT is drawn at. */
const QUIT_DIM = 0.7;
/** The arrow beside a word, as a radius. The guide's big button uses eleven. */
const SIGN = 9;
const QUIT_SIGN = 7;

const GUIDE_WORD = '700 14px "Courier New",monospace';
const GUIDE_SIGN = 8;
const GUIDE_LABEL = "TUTORIAL AGAIN";

/**
 * **What stands behind every plate: the bulkhead's own colour, solid.** The
 * plate's body is a wash — a third of its colour at the top and less in the
 * middle (`guide-tide-plate.ts`) — which reads as glass over the tutorial's
 * dark band and as a window over this screen, where the thing behind it is a
 * lit ring and blood. And QUIT is drawn at `QUIT_DIM`, so the whole of it was
 * a see-through plate. The backing is at full strength whatever the plate on
 * it is drawn at, which is the other half of the owner's ask above: nothing
 * under a button shows through it.
 */
const BACKING = "#0C0A16";

function backing(ctx: CanvasRenderingContext2D, box: NavBox, alpha: number): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = BACKING;
  ctx.beginPath();
  ctx.roundRect(box.x, box.y, box.w, box.h, CORNER);
  ctx.fill();
}

/** The buttons: what the pair does about it. */
export function drawLostAnswer(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  v: { age: number; pointer?: { x: number; y: number }; guided?: boolean },
): void {
  // The buttons arrive after the words, and not by falling: a thing to be
  // pressed should be still by the time a thumb reaches it.
  //
  // Centred here rather than inherited: the words above are a candidate's to
  // draw and an answer that left the alignment anywhere would hang both button
  // faces off the side of their own bodies (`lost-look.ts`).
  ctx.textAlign = "center";
  const shown = Math.max(0, Math.min(1, (v.age - 0.55) / 0.3));
  if (shown > 0) {
    const b = lostButtons(l, v.guided ?? false);
    const skin = seatSkin(l.role);
    const over = (box: NavBox): boolean =>
      v.pointer !== undefined && inside(box, v.pointer.x, v.pointer.y);
    backing(ctx, b.retry, shown);
    if (b.guide !== null) backing(ctx, b.guide, shown);
    backing(ctx, b.quit, shown);
    ctx.globalAlpha = shown;
    // **The tutorial's own plates** (`guide-tide-plate.ts`), asked for by the
    // owner on 17 September 2026 — *make sure buttons of "wave end" looks like
    // the new buttons of tutorial guide*. They were the guide bar's grown
    // bodies, which is what that bar drew until TIDE replaced it, so these two
    // were the last pair in the game still wearing the shape it left behind.
    // RETRY takes NEXT's forward arrow and QUIT takes BACK's, which is the
    // same reading TIDE made of the two: one goes on, one leaves.
    wordPlate(
      ctx,
      {
        ...b.retry,
        hex: PALETTE.pod,
        glow: 0.45 + 0.35 * Math.abs(Math.sin(v.age * 2.2)),
        live: true,
        hover: over(b.retry),
        dpr: l.dpr,
        lip: skin.lip,
      },
      "RETRY WAVE",
      1,
      WORD,
      SIGN,
    );
    if (b.guide !== null) {
      // The guide's own colour, which is REPLAY's on the tutorial bar
      // (`guide-tide-bar.ts`): the one button in the game that already means
      // *watch that again*. It does not pulse — RETRY WAVE is the press this
      // screen is asking for, and two plates breathing at each other would
      // leave a thumb with nothing to aim at.
      wordPlate(
        ctx,
        {
          ...b.guide,
          hex: PALETTE.shieldRim,
          glow: 0,
          live: true,
          hover: over(b.guide),
          dpr: l.dpr,
          lip: skin.lip,
        },
        GUIDE_LABEL,
        1,
        GUIDE_WORD,
        GUIDE_SIGN,
      );
    }
    ctx.globalAlpha = shown * QUIT_DIM;
    wordPlate(
      ctx,
      {
        ...b.quit,
        hex: PALETTE.hull,
        glow: 0,
        live: true,
        hover: over(b.quit),
        dpr: l.dpr,
        lip: skin.lip,
      },
      "GO TO MENU",
      -1,
      QUIT_WORD,
      QUIT_SIGN,
    );
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = "left";
}
