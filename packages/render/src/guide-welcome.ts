import { halo } from "./glow.js";
import { GUIDE_LOOK } from "./guide-look.js";
import { LIFT } from "./guide-nav.js";
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

/**
 * How far under the band the title's box sits.
 *
 * Measured off `GUIDE_LOOK.bandFoot` rather than off a constant, because the
 * band is a look and its foot moved 27 px the day TIDE was taken
 * (`guide-tide.ts`). A page that explains the chrome cannot be laid out
 * against a chrome that is no longer there.
 */
const TITLE_GAP = 30;
/** How fast the one line that asks for a press breathes. */
const BREATH = 2.2;
/** The air a label keeps from the one beside it, and the step it takes back
 * when there is none to be had. */
const ROW_CLEAR = 8;

const TITLE = ["WELCOME", "LET'S START WITH THE TUTORIAL"];
const WAITS = ["THE PICTURE WAITS FOR YOU", "THE BAR TURNS THE PAGES"];
const BEGIN = "PRESS ANYWHERE TO BEGIN";
const SIGNS: readonly [string, string, string] = ["BACK", "PLAY AGAIN", "NEXT"];

/** The welcome, over a page already drawn. `age` is seconds it has been up. */
export function drawGuideWelcome(ctx: CanvasRenderingContext2D, l: Layout, age: number): void {
  const b = GUIDE_LOOK.buttons(l);
  const picture = l.height - GUIDE_LOOK.navHeight;
  const top = GUIDE_LOOK.bandFoot;

  // The scrim: the picture goes back a step and the chrome does not, which is
  // the whole sentence — *this half waits, that half is yours*. It starts at
  // the band's foot rather than at the top of the screen, because a chrome may
  // keep two of its three buttons up in the bezel (`guide-tide.ts`) and dimming
  // a button on the page that explains the buttons says the opposite.
  ctx.fillStyle = "rgba(9,7,20,.5)";
  ctx.fillRect(0, top, l.width, picture - top);
  halo(ctx, l.width / 2, b.bar.y, l.width * 0.6, PALETTE.text, 0.18 + 0.06 * Math.sin(age * 1.6));

  // The title, under the band and clear of it.
  const titleY = top + TITLE_GAP;
  const title = centred(ctx, l, TITLE, titleY);
  drawLabelGround(ctx, title);
  drawLabelLines(ctx, title, TITLE);

  // The three, one label each, beside the button it names with a leader to it.
  // `GUIDE_LOOK.buttons` is where the bar draws them, so a label cannot point
  // at a place a button is not — and since a chrome decides *where* its three
  // go, each label is placed off its own button rather than off a shared row:
  // one up in the bezel takes its label underneath, one down by the bar takes
  // its label above.
  //
  // **And stacked when they will not fit side by side.** A label is as wide as
  // its word and a button may be as narrow as a sign — BACK and REPLAY are
  // icon plates 54 across, and PLAY AGAIN is twice that
  // (`guide-tide-bar.ts`). Written on one line the three grounds lie over each
  // other, so a label that would touch the one before it steps a row further
  // from the bar and its leader simply grows. The leader is vertical and runs
  // from the button's own middle, which no stepped-back label is over: it is
  // the labels that are wide, not the gaps between the buttons.
  const boxes = [b.back, b.replay, b.next] as const;
  const rowH = labelSize(ctx, [SIGNS[0]]).h;
  let lowest = b.bar.y;
  /** What is already written on each row, per side, as spans across. */
  const taken = new Map<string, { x: number; w: number }[]>();
  boxes.forEach((btn, i) => {
    const sign = SIGNS[i]!;
    const { w, h } = labelSize(ctx, [sign]);
    const x = Math.max(6, Math.min(l.width - w - 6, btn.x + btn.w / 2 - w / 2));
    const under = btn.y + btn.h < picture / 2;
    let row = 0;
    while (
      (taken.get(`${under}:${row}`) ?? []).some(
        (was) => x < was.x + was.w + ROW_CLEAR && was.x < x + w + ROW_CLEAR,
      )
    ) {
      row += 1;
    }
    const key = `${under}:${row}`;
    taken.set(key, [...(taken.get(key) ?? []), { x, w }]);
    const step = row * (h + ROW_CLEAR);
    const y = under ? btn.y + btn.h + 14 + step : btn.y - LIFT - h - 14 - step;
    const box = { x, y, w, h };
    if (!under) lowest = Math.min(lowest, y);
    drawLabelGround(ctx, box);
    ctx.beginPath();
    ctx.moveTo(btn.x + btn.w / 2, under ? y : y + h);
    ctx.lineTo(btn.x + btn.w / 2, under ? btn.y + btn.h - 6 : btn.y + 6);
    ctx.stroke();
    drawLabelLines(ctx, box, [sign]);
  });

  // The picture waits — said in the middle of the picture that is waiting,
  // and the one line asking for a press breathes under it.
  const waits = centred(
    ctx,
    l,
    WAITS,
    (titleY + title.h + Math.max(lowest, titleY + rowH)) / 2 - 30,
  );
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
