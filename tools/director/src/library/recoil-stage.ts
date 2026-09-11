import {
  type CageDraw,
  computeLayout,
  drawLiving,
  drawRecoilCage,
  RECOIL_LOOK,
} from "@neon-spore/render";
import { type Creature, DEFAULT_CONFIG } from "@neon-spore/sim";
import { type AssetContext, type AssetFrame, BEAT_SECONDS } from "./types.js";

/**
 * The game's own recoil, drawn on a card inside a cage of the caller's
 * choosing.
 *
 * `drawRecoilCage` is what the field calls, and it reaches the frame through
 * `RECOIL_LOOK` — the one record a VERSUS candidate patched for the length of
 * a frame (`recoil-look.ts`). This does the same for the length of one card,
 * the way the other stages here do: swap, draw, put back in `finally`. The
 * count, the colours, the breath and the burn are worked out by the field's
 * own code and handed to the look, so a card shows what the field would.
 *
 * A cage is judged as its ribs go — a spent rib is an ember and the frame
 * works harder with each one — so the card walks the bounces down, holding
 * each count a few beats, and never reaches none: a recoil out of bounces has
 * no cage at all (`recoil.ts`). The body inside is the field's own slick,
 * drawn first as the field draws it.
 */

/** A tile that makes the hoop most of a card wide: the hoop is one and a half
 * body radii, and a body's radius is two fifths of a tile. The grid's width
 * is the whole of what sets the tile. */
const TILE = 130;
const LAYOUT = computeLayout(
  { width: TILE * DEFAULT_CONFIG.cols, height: TILE * DEFAULT_CONFIG.cols * 2, dpr: 1 },
  DEFAULT_CONFIG,
  "p2",
);

const RECOIL: Creature = {
  id: 13,
  kind: "recoil",
  col: 3,
  row: 4,
  fromRow: 4,
  color: "cyan",
  holes: 0,
  petals: 0,
  dragMilli: 0,
  shell: 0,
  recoilBounces: DEFAULT_CONFIG.recoilBounces,
};

/** Beats each bounce count is held before the next rib is spent. */
const HOLD_BEATS = 6;

export function drawRecoilStage(c: AssetContext, f: AssetFrame, cage: (d: CageDraw) => void): void {
  const { ctx, w, h } = c;
  const total = DEFAULT_CONFIG.recoilBounces;
  const spent = Math.floor(f.beat / HOLD_BEATS) % total;
  const body: Creature = { ...RECOIL, recoilBounces: total - spent };
  const x = w / 2;
  const y = h / 2;
  const beats = f.t / BEAT_SECONDS;

  const was = RECOIL_LOOK.cage;
  RECOIL_LOOK.cage = cage;
  try {
    ctx.save();
    drawLiving(ctx, LAYOUT, body, x, y, beats, f.beatPhase, f.t, 0, DEFAULT_CONFIG, 1);
    // `near` is one: the card is at arm's length, and the haze is distance.
    drawRecoilCage(ctx, LAYOUT, DEFAULT_CONFIG, body, x, y, f.t, 1);
    ctx.restore();
  } finally {
    RECOIL_LOOK.cage = was;
  }
}
