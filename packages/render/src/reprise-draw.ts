import { midCol, type SimConfig } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawBeam, drawHalo, drawSac, type RepriseFrame } from "./reprise-body.js";
import { drawBrood } from "./reprise-brood.js";
import { drawTearLip } from "./reprise-flesh.js";
import type { RepriseFx, ReprisePhase } from "./reprise-fx.js";
import { drawLens } from "./reprise-lens.js";
import { FUSE_TOP_PX } from "./slow-fuse.js";
import { splinePath } from "./spline.js";

/**
 * THE REPRISE, drawn: a sac hung through a tear in the field's top edge, with
 * a camera's lens for an eye and a ring of eggs round it for a count.
 *
 * **It is the only thing either seat is shown while an echo runs.** The bodies
 * are drawn nowhere — not on the field, not on the radar, not as a siren
 * (`sim/reprise.ts`, `unseen.ts`, `radar-blip.ts`) — so everything the pair has
 * to play off is here: *recording or playing*, *how many are held or still
 * owed*, *how many unseen are still falling*, and *one has just gone*. Two
 * things are missing, on purpose:
 *
 * - **No body's colour.** It is the rock grey every mechanism in this game
 *   wears (`vane-draw.ts`). A red egg for a red body would hand the navigator
 *   half of what they were supposed to have remembered, and the half that is
 *   hardest to hold. The one red is the camera's dot, lit for every body alike.
 * - **No column.** It hangs dead centre and does not move sideways for
 *   anything, and the beam it plays back through is the whole field wide.
 *
 * The shape is THE WEIGHT (`tools/shape-sheet/src/drafts/bosses.ts`, *a sac
 * hung heavy*) pushed through THE BREACH's tear, which is what this boss was
 * until 25 September 2026: the tear stays, as an open stroke along the field's
 * own top edge, flared where it was torn, so the silhouette still says *the
 * wave went up there and comes back out of it*. The body, the lens and the
 * count are `reprise-body.ts`, `reprise-lens.ts` and `reprise-brood.ts`; this
 * file places them and says how big.
 *
 * Nothing here is held between frames but what `reprise-fx.ts` holds: the
 * swallow, and the moments the phase flipped and a body was recorded.
 */

/**
 * **Where the body hangs, and how big it is.** The unit is what fits between
 * the fuse along the top of the screen and the field's own top edge, held
 * between six tenths of a tile and a tile and a quarter, so a tall phone gets a bigger boss and
 * a short one still gets one that clears the fuse. The sac hangs a third of
 * its height into the field, through the tear.
 */
export function repriseFrame(l: Layout, cfg: SimConfig): RepriseFrame {
  const room = (l.gridTop - FUSE_TOP_PX - 6) / 1.65;
  const u = Math.min(l.tile * 1.25, Math.max(l.tile * 0.6, room));
  return {
    x: tileCX(l, midCol(cfg)),
    y0: l.gridTop,
    cy: l.gridTop - u * 0.35,
    u,
    rx: u * 1.75,
    ry: u * 1.0,
  };
}

/**
 * **The middle of the lens**, for the one word this boss says to the
 * navigator (`boss-cue-read-s.ts`).
 *
 * Exported rather than spelled a second time in the reading, which is
 * `vane-grip.ts`'s arrangement for `vaneBearingY` and for its reason: a mark
 * worked out twice is a mark standing where the picture is not. The place is
 * the *rest* pose deliberately and does not take the swallow, because a cue is
 * a reading of `World` and never of `Effects`. It does not move sideways for
 * anything, which is the whole reason a word may stand here at all. The name
 * is the tear's still, since the lens hangs in it.
 */
export function repriseTearCenter(l: Layout, cfg: SimConfig): { x: number; y: number } {
  const f = repriseFrame(l, cfg);
  return { x: f.x, y: f.cy };
}

/**
 * **The whole fixture** — the sac and the torn edge either side of it — for a
 * caption pointed at this boss (`caption-anchor-boss-f.ts`). The rest pose,
 * for `repriseTearCenter`'s reason.
 */
export function repriseTearBox(
  l: Layout,
  cfg: SimConfig,
): { x: number; y: number; rx: number; ry: number } {
  const f = repriseFrame(l, cfg);
  return { x: f.x, y: f.cy, rx: f.u * 2.1, ry: f.ry };
}

export interface RepriseDraw {
  phase: ReprisePhase;
  /** Bodies recorded so far, or still owed. */
  eggs: number;
  /** Unseen bodies still on the field. */
  standing: number;
  fx: RepriseFx;
  beatPhase: number;
  time: number;
}

export function drawReprise(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  d: RepriseDraw,
): void {
  const f = repriseFrame(l, cfg);
  const swallow = d.fx.swallow;
  const flip = d.fx.sinceFlip(d.time);
  const playing = d.phase === "play";
  drawHalo(ctx, f, playing, d.beatPhase);
  // The beam comes up over a quarter second as the echo opens, so the rewind
  // and the light arrive together.
  if (playing) drawBeam(ctx, l, f, Math.min(1, flip / 0.25));

  // The tear first, under the sac: its flared tips show either side of it.
  const open = playing || swallow > 0;
  const w = f.u * 2.1 * (1 - 0.06 * swallow);
  const lift = f.u * (open ? 0.42 : 0.24);
  const rim = [
    { x: f.x - w * 1.25, y: f.y0 - lift * 1.15 },
    { x: f.x - w, y: f.y0 - lift * 0.35 },
    { x: f.x - w * 0.8, y: f.y0 },
    { x: f.x, y: f.y0 + lift * 0.12 },
    { x: f.x + w * 0.8, y: f.y0 },
    { x: f.x + w, y: f.y0 - lift * 0.35 },
    { x: f.x + w * 1.25, y: f.y0 - lift * 1.15 },
  ];
  drawTearLip(ctx, rim, f.x, l.tile, open);
  strokeGlow(ctx, splinePath(rim, false), PALETTE.rock, STROKE.outline * 1.4, open ? 0.9 : 0.55);

  drawSac(ctx, f, playing, swallow, d.time);
  drawLens(ctx, f, { phase: d.phase, flip, beatPhase: d.beatPhase, time: d.time });
  drawBrood(ctx, f, {
    phase: d.phase,
    eggs: d.eggs,
    standing: d.standing,
    swallow,
    take: d.fx.sinceTake(d.time),
    beatPhase: d.beatPhase,
    time: d.time,
  });
  drawLabel(ctx, f, d.phase, d.beatPhase);
}

/** "● REC" or "▶ PLAY" on the sac's left lobe, a camera's own words. */
function drawLabel(
  ctx: CanvasRenderingContext2D,
  f: RepriseFrame,
  phase: ReprisePhase,
  beatPhase: number,
): void {
  if (phase === null) return;
  const size = Math.max(9, Math.round(f.u * 0.24));
  ctx.save();
  ctx.font = `600 ${size}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const x = f.x - f.rx * 1.02;
  const y = f.cy - f.ry * 0.95;
  if (phase === "rec") {
    ctx.fillStyle = rgba(PALETTE.red, beatPhase < 0.6 ? 1 : 0.45);
    ctx.fillText("● REC", x, y);
  } else {
    ctx.fillStyle = PALETTE.text;
    ctx.fillText("▶ PLAY", x, y);
  }
  ctx.restore();
}
