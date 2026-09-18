import { midCol, type SimConfig, type StareState } from "@neon-spore/sim";
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
 * **The turn is a turn, not a growth.** An eye that is looking elsewhere is
 * seen edge-on — a sliver as wide as `FACE_AWAY` of its face — and the seven
 * beats of the tell are the face coming round to square, `face` running from
 * that sliver to one while the lids open from `OPEN_AWAY` to wide. The whole
 * picture under `stare-draw.ts` is scaled by that one number, so the lens,
 * the pupil and the lashes turn together as one thing rather than a lid
 * opening on a disc that was always facing the pair. That is what the owner
 * asked for by name — *indicated when he will look next with some nice
 * animation* — and it is read off the phase and the beat, never eased in
 * the renderer: both phones draw the same angle on the same beat, and the
 * seat that is not told who has the angle to count by (`sim/stare.ts`).
 */

/** Tiles from the top of row 0 up to the middle of the eye. */
const EYE_RISE = 0.95;
/** The socket's half-extents in tiles: an almond, half as tall as it is wide. */
const EYE_RX = 1.25;
const EYE_RY = 0.5;
/** How much of the eye's width shows while it looks elsewhere — the sliver. */
export const FACE_AWAY = 0.2;
/** How far the lids stand open while it looks elsewhere — a slit, not shut. */
export const OPEN_AWAY = 0.3;
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

/** How far the gaze reaches down the field from the eye, in tiles. */
export const GAZE_TILES = 3.2;

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
    cy: l.gridTop - l.tile * EYE_RISE,
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

/** How far the eye has come round, read off the phase and the beat. */
export function stareFace(
  s: StareState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): StareFace {
  const into = beat - s.phaseBeat + beatPhase;
  let p: number;
  if (s.phase === "away") p = 0;
  else if (s.phase === "turning") p = smoothstep(into / cfg.stareTellBeats);
  // Square under the lid and square as it rises: a shut eye is still facing
  // the pair, and the lid is the whole of what says it cannot see them.
  else if (s.phase === "looking" || s.phase === "shut" || s.phase === "opening") p = 1;
  else p = 1 - smoothstep(into / cfg.stareTurnBackBeats);
  return {
    face: FACE_AWAY + (1 - FACE_AWAY) * p,
    open: OPEN_AWAY + (1 - OPEN_AWAY) * p,
    lean: LEAN * (1 - p),
  };
}

/**
 * How far down the lid is, zero to one — what the lid's picture and its
 * handle are placed by (`stare-lid.ts`).
 *
 * While the eye is looking it is the thumb's depth, straight off `lidMilli`
 * over `stareLidPullMilli`; shut it is the bottom, whatever the thumb does;
 * opening it rises over `stareReopenBeats`, eased, because the eye forcing
 * a lid up is a strain and a strain is not linear. Any other phase and there
 * is no lid to see.
 */
export function stareLidDrop(
  s: StareState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase === "looking") return Math.min(1, s.lidMilli / Math.max(1, cfg.stareLidPullMilli));
  if (s.phase === "shut") return 1;
  if (s.phase !== "opening") return 0;
  const into = beat - s.phaseBeat + beatPhase;
  return 1 - smoothstep(into / cfg.stareReopenBeats);
}

/** How far the eye has come round, zero to one — what the ink warms on. */
export function stareHeat(f: StareFace): number {
  return (f.face - FACE_AWAY) / (1 - FACE_AWAY);
}

/** The mound the eye is set in: its rim stands this far outside the socket. */
const COWL_W = 1.55;
const COWL_H = 1.85;

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
