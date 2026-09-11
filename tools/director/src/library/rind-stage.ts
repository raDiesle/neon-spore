import { livingPath, livingSilhouette } from "@neon-spore/content";
import {
  computeLayout,
  contourClock,
  creatureRadius,
  drawLiving,
  livingBodyMul,
  PALETTE,
  RIND_LOOK,
  type RindShed,
  rindPrevBodyMul,
  rindWears,
} from "@neon-spore/render";
import { type Creature, DEFAULT_CONFIG, wornKind } from "@neon-spore/sim";
import { type AssetContext, type AssetFrame, BEAT_SECONDS } from "./types.js";

/**
 * The game's own rind, losing its layers on a card, each one drawn coming off
 * by a shed of the caller's choosing.
 *
 * A rind's look is an event — the half-second after a shot in which a layer
 * comes off (`rind-look.ts`) — so a card cannot hold one still: it replays
 * it. The body arrives with every layer on and is shot down one at a time,
 * each count held a couple of beats, and at the start of every step but the
 * first the shed plays for the field's own `LIFE` around the body, built the
 * way `rind-shed.ts` builds it: both radii off `creatureRadius`, the contour
 * it wore a layer ago from `rindWears`, its wobble frozen at the instant. Then
 * it starts over with every layer back on. The body under it is the field's
 * own burr, drawn by `drawLiving` with the same override `creature-body.ts`
 * gives it; nothing here is swapped, the shed is handed straight to the look.
 */

/** A tile that fits a two-layer rind and its thrown skin inside a card: the
 * body is three footprints across with both layers on (`livingBodyMul`), and
 * the skin flies a further half of that outward. */
const TILE = 70;
const LAYOUT = computeLayout(
  { width: TILE * DEFAULT_CONFIG.cols, height: TILE * DEFAULT_CONFIG.cols * 2, dpr: 1 },
  DEFAULT_CONFIG,
  "p2",
);

const RIND: Creature = {
  id: 17,
  kind: "rind",
  col: 3,
  row: 4,
  fromRow: 4,
  color: "red",
  holes: 0,
  petals: 0,
  dragMilli: 0,
  shell: 0,
  rindLayers: DEFAULT_CONFIG.rindLayers,
};

/** Beats each layer count is held before the next is shot off: one, so the
 * shed — under half a second — is on the card two thirds of the time. */
const HOLD_BEATS = 1;
/** How long a shed is on screen, in seconds — `rind-shed.ts`'s `LIFE`. */
const LIFE = 0.42;

export function drawRindStage(c: AssetContext, f: AssetFrame, shed: (s: RindShed) => void): void {
  const { ctx, w, h } = c;
  const layers = DEFAULT_CONFIG.rindLayers;
  const step = Math.floor(f.beat / HOLD_BEATS) % (layers + 1);
  const body: Creature = { ...RIND, rindLayers: layers - step };
  const x = w / 2;
  // A little above the middle: two of the sheds fall, and the card is where
  // they land.
  const y = h * 0.42;
  const beats = f.t / BEAT_SECONDS;
  const held = f.t - Math.floor(f.beat / HOLD_BEATS) * HOLD_BEATS * BEAT_SECONDS;

  ctx.save();
  drawLiving(
    ctx,
    LAYOUT,
    body,
    x,
    y,
    beats,
    f.beatPhase,
    f.t,
    0,
    DEFAULT_CONFIG,
    1,
    1,
    1,
    rindWears(body, DEFAULT_CONFIG),
  );
  if (step > 0 && held < LIFE) {
    const now = creatureRadius(LAYOUT, body, f.beatPhase, DEFAULT_CONFIG);
    const was = (now * rindPrevBodyMul(body)) / livingBodyMul(body);
    const shape = rindWears(body, DEFAULT_CONFIG, 1) ?? livingSilhouette(wornKind(body));
    const unit = Math.max(shape.rx, shape.ry) / (shape.sizeMul ?? 1);
    const wobble = contourClock(body.id, f.t - held);
    const path = new Path2D(livingPath(shape, wobble, 28));
    shed({
      ctx,
      x,
      y,
      id: body.id,
      path,
      unit,
      hex: PALETTE.red,
      rim: PALETTE.redRim,
      t: held / LIFE,
      was,
      now,
    });
  }
  ctx.restore();
}

/** The shed the game draws, reached through its record so the card shows what
 * the field would. */
export const shippedShed = (s: RindShed): void => RIND_LOOK.shed(s);
