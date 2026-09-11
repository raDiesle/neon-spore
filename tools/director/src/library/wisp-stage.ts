import {
  computeLayout,
  drawWispBody,
  WISP_LOOK,
  type WispFringe,
  type WispJump,
  wispJump,
} from "@neon-spore/render";
import { type Creature, DEFAULT_CONFIG } from "@neon-spore/sim";
import { type AssetContext, type AssetFrame, BEAT_SECONDS } from "./types.js";

/**
 * The game's own wisp, drawn on a card wearing a fringe of the caller's
 * choosing.
 *
 * `drawWispBody` is what the field calls, and it reaches the fringe through
 * `WISP_LOOK` — the one record a VERSUS candidate patched for the length of a
 * frame (`wisp-look.ts`). This does the same for the length of one card: the
 * record's `fringe` is swapped for the asset's, the wisp is drawn, and the
 * record is put back before anything else can read it. The bell, the
 * interference bands, the shards, the squash of a landing and the lean of a
 * flight are all the game's, untouched, which is what makes a card here a
 * picture of the look rather than an impression of one. The one thing the
 * card decides for itself is how high a hop goes: on the field that is
 * `wispApexTiles`, two tiles and more, and a card is one body tall.
 *
 * The jump is read off the page's beat the way the field reads it off the
 * world's, through `wispJump`, so the card hops every `wispDwellBeats` and
 * gathers and lands the way a wisp on the field does. It hops left and right
 * in turn — `fromCol` is what `drawWispBody` reads the heading off — and
 * glides across the card while it flies, so the lean has something to lean
 * into.
 */

/** A layout whose tile makes a wisp large enough to read a frill on. The
 * grid's width is the whole of what sets the tile, so a wide viewport is a
 * big body; nothing else about the layout is looked at. */
const TILE = 150;
const LAYOUT = computeLayout(
  { width: TILE * DEFAULT_CONFIG.cols, height: TILE * DEFAULT_CONFIG.cols * 2, dpr: 1 },
  DEFAULT_CONFIG,
  "p2",
);

/** The one wisp every card draws. A creature is a record the simulation
 * fills; the fields a wisp's drawing reads are its id, its kind and where it
 * came from, and the rest are what a freshly spawned body carries. */
const WISP: Creature = {
  id: 1,
  kind: "wisp",
  col: 3,
  row: 4,
  fromRow: 4,
  color: null,
  holes: 0,
  petals: 0,
  dragMilli: 0,
  shell: 0,
};

/** How far across the card one hop carries the body, in tiles. Less than the
 * field's `JUMP_TILES`: the card is one body wide, not seven. */
const HOP_TILES = 0.5;
/** How high the apex is, as a share of the card. */
const LIFT = 0.3;

export function drawWispStage(
  c: AssetContext,
  f: AssetFrame,
  fringe: (w: WispFringe) => void,
): void {
  const { ctx, w, h } = c;
  const j: WispJump = wispJump(DEFAULT_CONFIG, f.beat, f.beatPhase);
  // Hops alternate direction: an even hop goes right, an odd one left, and
  // the body is drawn on the side it is leaving from until it lands.
  const hop = Math.floor(f.beat / DEFAULT_CONFIG.wispDwellBeats);
  const dir = hop % 2 === 0 ? 1 : -1;
  const body: Creature = { ...WISP, fromCol: j.flying ? WISP.col - dir : WISP.col };
  const glide = j.flying ? (j.flight - 0.5) * dir : -0.5 * dir;
  const x = w / 2 + glide * HOP_TILES * LAYOUT.tile;
  // The ground line sits low, so the arc has the card's height to rise into
  // and the fringe has room to hang below the bell.
  const y = h * 0.6;

  const was = WISP_LOOK.fringe;
  WISP_LOOK.fringe = fringe;
  try {
    ctx.save();
    // No haze: the card is at arm's length, and `drawWisp`'s haze is distance.
    const lift = j.arc * h * LIFT;
    drawWispBody(ctx, LAYOUT, body, x, y - lift, f.t, f.t / BEAT_SECONDS, j, (hex) => hex);
    ctx.restore();
  } finally {
    WISP_LOOK.fringe = was;
  }
}
