import {
  coreRowMilli,
  midCol,
  type SimConfig,
  type StareState,
  stareChargeLength,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { type Layout, tileCX } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **Where THE STARE is, and how far it has turned** — the numbers the drawer,
 * the transient and the test all read off one place (`stare-draw.ts`,
 * `stare-fx.ts`).
 *
 * **The shape is the cowled eye**: THE LID's almond — the one eye the game
 * draws, and it is drawn here through the same three calls, never a second
 * spelling of it (`eye.ts`, `eye-lens.ts`) — set into a mound of rock over
 * the middle of the top edge, the way THE CAIRN's stones are heaped. Neither
 * half is new and the pair is: the LID is an eye *on the field*, a body at a
 * tile a bolt can answer; this is an eye *over* it, in a socket nothing
 * reaches, and the mound is the whole of what says so. There is no eye in
 * `tools/shape-sheet/src/drafts/`, and the rule for a shape the sheet has no
 * draft of is to combine two the game has and name it (`CLAUDE.md`).
 *
 * **The lids are the fight.** Until 29 September 2026 the eye turned from
 * edge-on to square over a tell; since then it faces the pair the whole
 * fight and opens on the beats of its pattern (`sim/stare.ts`). The picture
 * under `stare-draw.ts` is still scaled by one `face` number, and only the
 * calm eye turns away with it. Everything here is read off the phase and
 * the beat, never eased in the renderer: both phones draw the same eye on
 * the same beat.
 */

/**
 * Tiles from the top of row 0 **down** to the middle of the eye. The owner,
 * 29 September 2026: *any boss should not touch top of game screen* — so the
 * eye hangs inside the field, the cowl's crown under row 0's top edge, and
 * the phone's own bar and the switcher above it stand clear. Nothing falls in
 * this wave (`bossFillsWave`), so the rows it covers are the eye's. The
 * simulation's row, where a bolt up the middle is met (`sim/core-along.ts`).
 */
const EYE_DROP = coreRowMilli("stare") / 1000 + 0.5;
/** The socket's half-extents in tiles: an almond, a little under half as tall as it is wide — bigger since the same day, *make eye some bigger*. */
const EYE_RX = 1.75;
const EYE_RY = 0.72;
/** How much of the eye's width shows while it looks elsewhere — the sliver. */
export const FACE_AWAY = 0.2;
/**
 * How far the sliver leans, as a shear of its width, so an eye seen edge-on
 * reads as turned rather than squeezed. It comes off with the turn.
 */
const LEAN = 0.35;

/** The socket, in field pixels. */
export interface StareEye {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

/**
 * How far the gaze reaches down the field from the top of row 0, in tiles:
 * past the middle, so the red and the word at its foot stand well clear of
 * the eye — the owner, *the red visual … should have more distance*.
 */
export const GAZE_TILES = 8.5;

/**
 * Where the gaze runs out, in canvas pixels: the lowest row its red still
 * touches. The cue stands here, because it is the one place on the watched
 * seat's screen the eye has already marked as *yours* (`boss-cue-read-d.ts`).
 */
export function stareGazeFootY(l: Layout): number {
  return l.gridTop + l.tile * GAZE_TILES;
}

export function stareEye(l: Layout, cfg: SimConfig): StareEye {
  return {
    cx: tileCX(l, midCol(cfg)),
    cy: l.gridTop + l.tile * EYE_DROP,
    rx: l.tile * EYE_RX,
    ry: l.tile * EYE_RY,
  };
}

/** Where the turn is: how much of the face shows, how far the lids stand open, and the lean. */
export interface StareFace {
  face: number;
  open: number;
  lean: number;
}

/** How far the lids stand while the eye is shut: a seam, not nothing. */
export const OPEN_SHUT = 0.08;

/**
 * How the eye stands, read off the phase and the beat. Since 29 September
 * 2026 it faces the pair the whole fight and the lids are the picture: wide
 * on an open beat of the pattern, a seam on a shut one, a seam through the
 * charge. Only the calm after the last level turns it away, over
 * `stareCalmBeats`, and the rise to a new level shakes it. An open beat
 * snaps open and eases shut across the beat, so the opening is on the beat
 * and the closing is not a second beat of its own.
 */
export function stareFace(
  s: StareState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): StareFace {
  if (s.phase === "calm") {
    const p = 1 - smoothstep((beat - s.phaseBeat + beatPhase) / cfg.stareCalmBeats);
    return { face: FACE_AWAY + (1 - FACE_AWAY) * p, open: OPEN_SHUT, lean: LEAN * (1 - p) };
  }
  if (s.phase === "rise") {
    // Rising to a new level: the eye shakes with rage, a shudder that dies
    // out over the rise.
    const p = Math.min(1, (beat - s.phaseBeat + beatPhase) / cfg.stareRiseBeats);
    return { face: 1, open: OPEN_SHUT, lean: RISE_LEAN * Math.sin(p * Math.PI * 9) * (1 - p) };
  }
  const open = s.open ? 1 - (1 - OPEN_SHUT) * smoothstep(beatPhase) ** 2 : OPEN_SHUT;
  return { face: 1, open, lean: 0 };
}

/** How hard the rising eye shudders, as a shear of its width. */
const RISE_LEAN = 0.22;

/**
 * How far the charge has come, zero to one across `stareChargeLength`, and
 * zero outside it: what the eye swells by and the beam gathers on
 * (`stare-charge.ts`). Read off the beat, so both phones swell together.
 */
export function stareSwell(s: StareState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "charge") return 0;
  return Math.min(1, (beat - s.phaseBeat + beatPhase) / Math.max(1, stareChargeLength(s, cfg)));
}

/** How much bigger the eye stands at the top of its charge. */
const SWELL = 0.22;

/** The socket, swollen by the charge. */
export function swollenEye(e: StareEye, swell: number): StareEye {
  const k = 1 + SWELL * swell;
  return { cx: e.cx, cy: e.cy, rx: e.rx * k, ry: e.ry * k };
}

/** How far the eye has come round, zero to one — what the ink warms on. */
export function stareHeat(f: StareFace): number {
  return (f.face - FACE_AWAY) / (1 - FACE_AWAY);
}

/** The mound the eye is set in: its rim stands this far outside the socket. */
const COWL_W = 1.55;
const COWL_H = 1.85;

/**
 * How far the boss reaches from the eye's middle: the cowl's corners, its
 * widest. What THE SLOW's light stands clear of (`slow-boss-aim-b.ts`).
 */
export function stareReach(e: StareEye): number {
  return e.rx * COWL_W;
}

/**
 * The cowl, as one closed spline: a heap over the eye with a near-flat floor a
 * little under the eye's middle, so the eye stands proud of it. `t` is the wall
 * clock and only shifts the heap's knuckles, which nobody reads a number off.
 */
export function cowlPath(e: StareEye, t: number): Path2D {
  const { cx, cy, rx, ry } = e;
  const w = (k: number) => Math.sin(t * 0.7 + k * 1.9) * ry * 0.06;
  return splinePath(
    [
      { x: cx - rx * COWL_W, y: cy + ry * 0.35 },
      { x: cx - rx * 1.25, y: cy - ry * 0.9 + w(1) },
      { x: cx - rx * 0.75, y: cy - ry * 1.7 + w(2) },
      { x: cx - rx * 0.2, y: cy - ry * COWL_H + w(3) },
      { x: cx + rx * 0.35, y: cy - ry * 1.95 + w(4) },
      { x: cx + rx * 0.9, y: cy - ry * 1.5 + w(5) },
      { x: cx + rx * 1.3, y: cy - ry * 0.7 + w(6) },
      { x: cx + rx * COWL_W, y: cy + ry * 0.35 },
      { x: cx + rx * 0.7, y: cy + ry * 0.55 },
      { x: cx, y: cy + ry * 0.6 },
      { x: cx - rx * 0.7, y: cy + ry * 0.55 },
    ],
    true,
  );
}
