import { computeLayout, drawLid, LID_LOOK, type LidPlates } from "@neon-spore/render";
import { type Creature, DEFAULT_CONFIG } from "@neon-spore/sim";
import { type AssetContext, type AssetFrame, BEAT_SECONDS } from "./types.js";

/**
 * The game's own lid, drawn on a card wearing armour of the caller's choosing.
 *
 * `drawLid` is what the field calls, and it reaches the plates through
 * `LID_LOOK` — the one record a VERSUS candidate patched for the length of a
 * frame (`lid-look.ts`). This does the same for the length of one card, the
 * way the other stages here do: swap, draw, put back in `finally`. The socket,
 * the film, the lens, the lashes and the rim are the game's, untouched.
 *
 * Armour over an eye is judged shut as well as open, because shut is where a
 * lid spends its life and the gap is the readout the other seat reads. So the
 * card pulls the cord itself: shut for three beats, opened over three, held
 * open for three, let go over three, and again. The opening is written into
 * the body's own pull, so `lidOpenMilli` reads it exactly as the field would.
 */

/** A tile that makes the socket most of a card wide: the lid's half-width is
 * two fifths of a tile (`lid.ts`). The grid's width is the whole of what sets
 * the tile; nothing else about the layout is looked at. */
const TILE = 300;
const LAYOUT = computeLayout(
  { width: TILE * DEFAULT_CONFIG.cols, height: TILE * DEFAULT_CONFIG.cols * 2, dpr: 1 },
  DEFAULT_CONFIG,
  "p2",
);

const LID: Creature = {
  id: 9,
  kind: "lid",
  col: 3,
  row: 4,
  fromRow: 4,
  color: "cyan",
  holes: 0,
  petals: 0,
  dragMilli: 0,
  shell: 0,
  lidPullMilli: 0,
  lidPullYMilli: 0,
};

/** Beats in one shut–open–shut cycle, in four equal parts. */
const CYCLE_BEATS = 12;

/** How far open the card's hand has the cord, 0..1, on the shared clock. */
function pulled(beats: number): number {
  const q = ((beats % CYCLE_BEATS) / CYCLE_BEATS) * 4;
  if (q < 1) return 0;
  if (q < 2) return q - 1;
  if (q < 3) return 1;
  return 4 - q;
}

export function drawLidStage(c: AssetContext, f: AssetFrame, plates: (d: LidPlates) => void): void {
  const { ctx, w, h } = c;
  const beats = f.t / BEAT_SECONDS;
  const body: Creature = {
    ...LID,
    lidPullMilli: Math.round(pulled(beats) * DEFAULT_CONFIG.lidTautMilli),
  };
  const was = LID_LOOK.plates;
  LID_LOOK.plates = plates;
  try {
    ctx.save();
    // `near` is one: the card is at arm's length, and the haze is distance.
    drawLid(ctx, LAYOUT, DEFAULT_CONFIG, body, w / 2, h / 2, f.t, beats, 1);
    ctx.restore();
  } finally {
    LID_LOOK.plates = was;
  }
}
