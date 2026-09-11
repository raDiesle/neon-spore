import {
  computeLayout,
  drawLiving,
  drawVolleyShell,
  showsVolleyCore,
  VOLLEY_LOOK,
  type VolleyLook,
} from "@neon-spore/render";
import { type Creature, DEFAULT_CONFIG } from "@neon-spore/sim";
import { type AssetContext, type AssetFrame, BEAT_SECONDS } from "./types.js";

/**
 * The game's own volley, drawn on a card wearing a shell of the caller's
 * choosing.
 *
 * `drawVolleyShell` is what the field calls, and it reaches the stone and the
 * seams through `VOLLEY_LOOK` — the one record a VERSUS candidate patched for
 * the length of a frame (`volley-look.ts`). This does the same for the length
 * of one card, the way `wisp-stage.ts` and `warden-stage.ts` do: swap both
 * fields, draw, put them back in `finally`. The ball's contour, its roll, the
 * ward's clip and the body sealed inside are the game's, untouched.
 *
 * A shell is judged in three states — every plate on, one ward taken, two —
 * because that is what the owner asked the slot to show and what EMBER argues
 * about: the seams burn wider as the ball opens. So the card walks the count
 * down, holding each state a few beats, and starts over. The body inside is
 * drawn by the field's own `drawLiving` once a plate is off, as the field
 * does; a red slick, because red is the colour the seams are read in first.
 */

/** A tile that makes a ball most of a card wide. The grid's width is the
 * whole of what sets the tile; nothing else about the layout is looked at. */
const TILE = 110;
const LAYOUT = computeLayout(
  { width: TILE * DEFAULT_CONFIG.cols, height: TILE * DEFAULT_CONFIG.cols * 2, dpr: 1 },
  DEFAULT_CONFIG,
  "p2",
);

const VOLLEY: Creature = {
  id: 7,
  kind: "volley",
  col: 3,
  row: 4,
  fromRow: 4,
  color: "red",
  holes: 0,
  petals: 0,
  dragMilli: 0,
  shell: 0,
  volleyPlates: DEFAULT_CONFIG.volleyPlates,
};

/** Beats each plate count is held before the next ward is taken. */
const HOLD_BEATS = 6;

export function drawVolleyStage(c: AssetContext, f: AssetFrame, look: VolleyLook): void {
  const { ctx, w, h } = c;
  const total = DEFAULT_CONFIG.volleyPlates;
  // Whole, then one off, then two off, then whole again — never bare, because
  // a volley out of plates is not a volley (`volley.ts`).
  const wards = Math.floor(f.beat / HOLD_BEATS) % total;
  const body: Creature = { ...VOLLEY, volleyPlates: total - wards };
  const x = w / 2;
  const y = h / 2;
  const beats = f.t / BEAT_SECONDS;

  const was = { stone: VOLLEY_LOOK.stone, seams: VOLLEY_LOOK.seams };
  VOLLEY_LOOK.stone = look.stone;
  VOLLEY_LOOK.seams = look.seams;
  try {
    ctx.save();
    if (showsVolleyCore(DEFAULT_CONFIG, body)) {
      drawLiving(ctx, LAYOUT, body, x, y, beats, f.beatPhase, f.t, 0, DEFAULT_CONFIG, 1);
    }
    // `near` is one: the card is at arm's length, and the haze is distance.
    drawVolleyShell(ctx, LAYOUT, DEFAULT_CONFIG, body, x, y, f.t, f.beatPhase, 1);
    ctx.restore();
  } finally {
    VOLLEY_LOOK.stone = was.stone;
    VOLLEY_LOOK.seams = was.seams;
  }
}
