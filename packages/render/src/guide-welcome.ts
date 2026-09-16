import { halo } from "./glow.js";
import { GUIDE_LOOK } from "./guide-look.js";
import { LIFT } from "./guide-nav.js";
import { BANNER_H, BANNER_TOP } from "./guide-switch.js";
import { drawLabelGround, drawLabelLines, type LabelBox, labelSize } from "./label-box.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The page before a device's first tutorial: what the stepper is, drawn over
 * the first page of film while that page waits.
 *
 * **It is not a card, and it is drawn on the tutorial it explains.** The
 * first page of the first guide is up underneath — the plate, the picture,
 * the bar — and stands on its first frame until this is pressed away
 * (`apps/game/src/welcome.ts` holds the film's clock at zero). What is added
 * is a scrim over the picture, so the bar under it is the one bright thing on
 * the screen, and labels in the caption's own box (`label-box.ts`) beside the
 * three buttons the pair will be turning every guide with. The owner asked
 * for it on 14 September 2026 as the third half of *a tutorial says it is
 * one*: a stepper nobody has explained is a stepper somebody presses the
 * picture instead of, and the picture does nothing.
 *
 * Once per device, which is the host's business; here it is a function of
 * the stage and the seconds it has been up, like every page of a guide.
 */

/** Where the title's box sits under the plate, and the middle label under it. */
const TITLE_Y = BANNER_TOP + BANNER_H + 30;
/** How fast the one line that asks for a press breathes. */
const BREATH = 2.2;

const TITLE = ["WELCOME", "LET'S START WITH THE TUTORIAL"];
const WAITS = ["THE PICTURE WAITS FOR YOU", "THE BAR TURNS THE PAGES"];
const BEGIN = "PRESS ANYWHERE TO BEGIN";
const SIGNS: readonly [string, string, string] = ["BACK", "PLAY AGAIN", "NEXT"];

/** The welcome, over a page already drawn. `age` is seconds it has been up. */
export function drawGuideWelcome(ctx: CanvasRenderingContext2D, l: Layout, age: number): void {
  const b = GUIDE_LOOK.buttons(l);
  const picture = l.height - GUIDE_LOOK.navHeight;

  // The scrim: the picture goes back a step and the bar does not, which is
  // the whole sentence — *this half waits, that half is yours*.
  ctx.fillStyle = "rgba(9,7,20,.5)";
  ctx.fillRect(0, 0, l.width, picture);
  halo(ctx, l.width / 2, b.bar.y, l.width * 0.6, PALETTE.text, 0.18 + 0.06 * Math.sin(age * 1.6));

  // The title, under the plate and clear of it.
  const title = centred(ctx, l, TITLE, TITLE_Y);
  drawLabelGround(ctx, title);
  drawLabelLines(ctx, title, TITLE);

  // The three, one label each, on a row above the bar's shadow with a leader
  // down to the button it names. `GUIDE_LOOK.buttons` is where the bar draws them, so
  // a label cannot point at a place a button is not.
  const boxes = [b.back, b.replay, b.next] as const;
  const rowH = labelSize(ctx, [SIGNS[0]]).h;
  const rowY = b.bar.y - LIFT - rowH - 14;
  boxes.forEach((btn, i) => {
    const sign = SIGNS[i]!;
    const { w, h } = labelSize(ctx, [sign]);
    const x = Math.max(6, Math.min(l.width - w - 6, btn.x + btn.w / 2 - w / 2));
    const box = { x, y: rowY, w, h };
    drawLabelGround(ctx, box);
    ctx.beginPath();
    ctx.moveTo(btn.x + btn.w / 2, rowY + h);
    ctx.lineTo(btn.x + btn.w / 2, btn.y + 6);
    ctx.stroke();
    drawLabelLines(ctx, box, [sign]);
  });

  // The picture waits — said in the middle of the picture that is waiting,
  // and the one line asking for a press breathes under it.
  const waits = centred(ctx, l, WAITS, (TITLE_Y + title.h + rowY) / 2 - 30);
  drawLabelGround(ctx, waits);
  drawLabelLines(ctx, waits, WAITS);
  ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(age * BREATH));
  ctx.fillStyle = PALETTE.pod;
  ctx.textAlign = "center";
  ctx.fillText(BEGIN, l.width / 2, waits.y + waits.h + 30);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}

/** A box for these lines, centred across the stage, with its top at `y`. */
function centred(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  lines: readonly string[],
  y: number,
): LabelBox {
  const { w, h } = labelSize(ctx, lines);
  return { x: Math.round(l.width / 2 - w / 2), y, w, h };
}
