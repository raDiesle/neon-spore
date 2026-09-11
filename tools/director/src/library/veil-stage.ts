import { computeLayout, drawVeilCloud, VEIL_LOOK, type VeilMassDraw } from "@neon-spore/render";
import { type Creature, DEFAULT_CONFIG } from "@neon-spore/sim";
import { type AssetContext, type AssetFrame, BEAT_SECONDS } from "./types.js";

/**
 * The game's own veil, drawn on a card with a cloud mass of the caller's
 * choosing.
 *
 * `drawVeilCloud` is what the field calls, and it reaches the mass through
 * `VEIL_LOOK` — the one record a VERSUS candidate patched for the length of a
 * frame (`veil-look.ts`). This does the same for the length of one card, the
 * way the other stages here do: swap, draw, put back in `finally`. The
 * contour, the rim, the fog, the sink and the lightning on the beat are the
 * game's, untouched.
 *
 * The card shows the cloud as player 2 sees it — whole, with nothing inside
 * drawn — because that is the screen the weather is judged on: player 1 sees
 * a thinned version of the same mass with the body through it (`veil-mass.ts`).
 */

/** A tile that makes a cloud most of a card wide (`VEIL_RADIUS_MUL`). */
const TILE = 115;
const LAYOUT = computeLayout(
  { width: TILE * DEFAULT_CONFIG.cols, height: TILE * DEFAULT_CONFIG.cols * 2, dpr: 1 },
  DEFAULT_CONFIG,
  "p2",
);

const VEIL: Creature = {
  id: 5,
  kind: "veil",
  col: 3,
  row: 4,
  fromRow: 4,
  color: null,
  holes: 0,
  petals: 0,
  dragMilli: 0,
  shell: 0,
};

export function drawVeilStage(
  c: AssetContext,
  f: AssetFrame,
  mass: (d: VeilMassDraw) => void,
): void {
  const { ctx, w, h } = c;
  const beats = f.t / BEAT_SECONDS;
  const was = VEIL_LOOK.mass;
  VEIL_LOOK.mass = mass;
  try {
    ctx.save();
    // Open (armour one), at arm's length (near one), and player 2's screen.
    drawVeilCloud(ctx, LAYOUT, DEFAULT_CONFIG, VEIL, w / 2, h / 2, f.t, beats, 1, 1, false);
    ctx.restore();
  } finally {
    VEIL_LOOK.mass = was;
  }
}
