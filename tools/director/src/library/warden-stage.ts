import { computeLayout, drawWarden, WARDEN_LOOK, type WardenSurfaceDraw } from "@neon-spore/render";
import { type Creature, DEFAULT_CONFIG, WARDEN_COLS, type WardenState } from "@neon-spore/sim";
import type { AssetContext, AssetFrame } from "./types.js";

/**
 * The game's own warden, drawn on a card wearing a surface of the caller's
 * choosing.
 *
 * `drawWarden` is what the field calls, and it reaches the surface through
 * `WARDEN_LOOK` — the one record a VERSUS candidate patched for the length of
 * a frame (`warden-look.ts`). This does the same for the length of one card,
 * the way `wisp-stage.ts` does for the fringe: swap, draw, put back in
 * `finally`. The contour and the opening cut through it, the hatch and the
 * eye behind it are the game's, untouched.
 *
 * The body and its state are made here the way `wave-start.ts` makes them,
 * from the same numbers, so what a card shows is a warden as it stands at the
 * top of its wave — every plate on. Two things the field gets from the
 * players are given a rhythm instead: the hole drifts a column and back, so
 * the eyelets and the folds that follow it are seen to follow, and the hatch
 * opens and shuts as though a hand were pulling the rope and letting go,
 * because half of what a surface does happens round an opening door.
 */

/** A tile that puts a five-column body inside a card with its fringe and
 * lifted plates still on it. Only the tile is read off the layout; the body
 * is moved to the card's centre afterwards. */
const TILE = 34;
const LAYOUT = computeLayout(
  { width: TILE * DEFAULT_CONFIG.cols, height: TILE * DEFAULT_CONFIG.cols * 2, dpr: 1 },
  DEFAULT_CONFIG,
  "p2",
);

const COL = Math.floor((DEFAULT_CONFIG.cols - WARDEN_COLS) / 2);
const CENTRE = COL + Math.floor(WARDEN_COLS / 2);

const BODY: Creature = {
  id: 1,
  kind: "warden",
  col: COL,
  row: DEFAULT_CONFIG.wardenRow,
  fromRow: DEFAULT_CONFIG.wardenRow,
  color: null,
  holes: 0,
  petals: 0,
  dragMilli: 0,
  shell: 0,
};

const STATE: WardenState = {
  kind: "warden",
  creatureId: 1,
  tetherId: 0,
  pupilCol: CENTRE,
  pupilDir: 1,
  plates: DEFAULT_CONFIG.wardenPlates,
  eyeSpent: false,
  pulling: false,
  pullOriginMilli: 0,
  pullOriginYMilli: 0,
  pullMilli: 0,
  pullYMilli: 0,
  pullAnchorX: 0,
  pullAnchorY: 0,
};

/** Where the hole stands, beat by beat: centre, right, centre, left. */
const DRIFT = [0, 1, 0, -1] as const;
/** Beats the hole stands in one column before it drifts. */
const DWELL_BEATS = 4;
/** How fast the imagined hand pulls and lets go, in radians a second. */
const PULL_RATE = 0.45;

export function drawWardenStage(
  c: AssetContext,
  f: AssetFrame,
  surface: (d: WardenSurfaceDraw) => void,
): void {
  const { ctx, w, h } = c;
  const step = Math.floor(f.beat / DWELL_BEATS) % DRIFT.length;
  const state: WardenState = { ...STATE, pupilCol: CENTRE + (DRIFT[step] ?? 0) };
  // Shut half the time and eased open the rest, so the card shows the surface
  // both round a closed door and round an open one.
  const openness = Math.max(0, Math.sin(f.t * PULL_RATE)) ** 1.5;

  // `drawWarden` places the body from the layout; the card wants it centred.
  const cx = LAYOUT.gridLeft + (COL + (WARDEN_COLS - 1) / 2) * LAYOUT.tile + LAYOUT.tile / 2;
  const cy = LAYOUT.gridTop + BODY.row * LAYOUT.tile + LAYOUT.tile / 2;

  const was = WARDEN_LOOK.surface;
  WARDEN_LOOK.surface = surface;
  try {
    ctx.save();
    ctx.translate(w / 2 - cx, h / 2 - cy);
    drawWarden(
      ctx,
      LAYOUT,
      DEFAULT_CONFIG,
      BODY,
      state,
      f.beat,
      f.beat,
      f.beatPhase,
      f.t,
      openness,
    );
    ctx.restore();
  } finally {
    WARDEN_LOOK.surface = was;
  }
}
