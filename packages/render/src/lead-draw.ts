import { type LeadState, leadStill, type SimConfig, type World } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { paintBead, paintMound, paintStem } from "./lead-flesh.js";
import type { LeadFx } from "./lead-fx.js";
import { faded, paintRidge } from "./lead-rock.js";
import {
  leadAlong,
  leadAskedAngle,
  leadFoot,
  leadRidgePath,
  leadRidgeY,
  leadStalkLength,
  type Point,
} from "./lead-shape.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";
import { showsLeadCol } from "./view-role-clocks.js";

/**
 * **THE LEAD**: a long grey ridge across the top of the field above row 0
 * that the body paces along, a violet stalk of beads standing out of it
 * with a pale organ at the tip, the shots hanging in the air above the ridge
 * until they are judged, and — on one screen — the instrument's lock on the
 * column the body stands in (§11.29).
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the ridge, the flights over it, the mound the stalk grows from, the stalk,
 * the lock last. Its health is its silhouette: a bead a segment, one gone a
 * hit, and the tip alone when only the beam can end it. Still, the stalk is
 * grey and dead upright; on the last pass it lies over the way it lunges;
 * down, it is gone and the mound fades over `leadOutBeats`. What outlives a
 * frame — the spring the lean rides, the whip, the tumbling bead — is
 * `effects.boss.lead` (`lead-fx.ts`).
 *
 * **The stalk stands at the body's column only on the screen that is shown
 * the column.** On the pilot's it stands in the middle of the field every
 * frame, with no mound under it and in a readout's tone, and tilts: the way
 * the body goes and nothing about where it is. On the navigator's it stands
 * at the column, on its mound, locked, and never tilts (`lead-shape.ts`,
 * `view-role-clocks.ts`).
 */
export function drawLead(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: LeadState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: LeadFx,
): void {
  const cfg = world.cfg;
  const outBeats = Math.max(1, cfg.leadOutBeats);
  const fade = s.downBeat >= 0 ? Math.max(0, 1 - (beat - s.downBeat + beatPhase) / outBeats) : 1;
  if (fade <= 0) return;
  const foot = leadFoot(l, cfg, s);
  const placed = showsLeadCol(l.role);
  const still = leadStill(s);
  fx.aim(leadAskedAngle(s, l.role));
  const angle = fx.angle;
  const length = leadStalkLength(l, s);
  const tip = leadAlong(foot, angle, length);
  fx.note(foot.x, foot.y, tip.x, tip.y);

  ctx.save();
  drawRidge(ctx, l, time, fade);
  drawFlights(ctx, l, cfg, s, beat, beatPhase, time, fade);
  if (placed) drawMound(ctx, l, foot, still, time, fade);
  else drawSill(ctx, l, foot, fade);
  drawStalk(ctx, l, s, foot, angle, placed, still, time);
  if (placed && s.segments > 0) {
    drawTargetLock(
      ctx,
      foot.x,
      foot.y - l.tile * 0.1,
      l.tile * 0.5,
      l.tile * 0.36,
      PALETTE.shieldRim,
      time,
      still ? 0.5 : 1,
      s.col + 5,
    );
  }
  ctx.restore();
}

/** The ridge: rock, dark, lit along its top (`lead-rock.ts`). */
function drawRidge(ctx: CanvasRenderingContext2D, l: Layout, time: number, fade: number): void {
  const { top, bottom } = leadRidgeY(l);
  const right = l.gridLeft + l.cols * l.tile;
  paintRidge(
    ctx,
    leadRidgePath(l, time),
    { left: l.gridLeft, right, top, bottom, tile: l.tile },
    fade,
  );
}

/** How far above the ridge a flight climbs before it is judged, in tiles, and a bolt's length. */
const FLIGHT_RISE = 0.9;
const BOLT = 0.3;

/**
 * The shots in the air: a white bolt over each flight's column, climbing
 * from the ridge's underside over the beats of the flight, on both screens —
 * the shot is the pilot's own and the column it went up is no secret from
 * anyone. It is judged on `dueBeat`, and on that beat it is at the top of its
 * climb; what happens to it there is the receipts' (`lead-fx.ts`).
 */
function drawFlights(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: LeadState,
  beat: number,
  beatPhase: number,
  time: number,
  fade: number,
): void {
  const ridge = leadRidgeY(l);
  const beats = Math.max(1, cfg.leadFlightBeats);
  for (const f of s.flights) {
    const spent = Math.min(1, Math.max(0, (beat - (f.dueBeat - beats) + beatPhase) / beats));
    const x = tileCX(l, f.col);
    const y = ridge.bottom - spent * (ridge.bottom - ridge.top + FLIGHT_RISE * l.tile);
    const p = new Path2D();
    p.moveTo(x, y + BOLT * l.tile * 0.5);
    p.lineTo(x, y - BOLT * l.tile * 0.5);
    strokeGlow(
      ctx,
      p,
      faded(PALETTE.text, fade),
      STROKE.outline,
      (0.9 + 0.3 * Math.sin(time * 14)) * fade,
    );
  }
}

/** The mound the stalk grows from: a low violet swell of flesh on the ridge, grey while it stands dead still (`lead-flesh.ts`). */
function drawMound(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  foot: Point,
  still: boolean,
  time: number,
  fade: number,
): void {
  const breath = still ? 0 : 0.04 * Math.sin(time * 3);
  const rx = l.tile * (0.5 + breath);
  const ry = l.tile * (0.28 + breath);
  const p = new Path2D();
  p.ellipse(foot.x, foot.y, rx, ry, 0, Math.PI, 0);
  const hex = still ? PALETTE.dim : PALETTE.hull;
  const rim = still ? PALETTE.rock : PALETTE.hullRim;
  paintMound(ctx, p, foot.x, foot.y, rx, ry, l.tile, hex, rim, fade);
}

/** The pilot's sill: a short grey bar the readout stands on, so a stalk in the middle of his screen reads as an instrument and not a body in the middle column. */
function drawSill(ctx: CanvasRenderingContext2D, l: Layout, foot: Point, fade: number): void {
  const p = new Path2D();
  p.moveTo(foot.x - l.tile * 0.45, foot.y);
  p.lineTo(foot.x + l.tile * 0.45, foot.y);
  strokeGlow(ctx, p, faded(PALETTE.dim, fade), STROKE.outline, 0.6 * fade);
}

/** A bead's radius and the tip's, as shares of a tile. */
const BEAD = 0.1;
const TIP = 0.15;

/**
 * The stalk: a cord strung with beads from the foot to the tip, one a
 * segment, and the organ at the tip (`lead-flesh.ts`) — the hull's violet where the body is drawn as a
 * body, a readout's tone where it is drawn as one, and grey while still.
 */
function drawStalk(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: LeadState,
  foot: Point,
  angle: number,
  placed: boolean,
  still: boolean,
  time: number,
): void {
  if (s.segments <= 0) return;
  const length = leadStalkLength(l, s);
  const body = placed ? PALETTE.hull : mixHex(PALETTE.hull, PALETTE.dim, 0.45);
  const hex = still ? PALETTE.dim : body;
  const rim = still ? PALETTE.rock : PALETTE.hullRim;
  const tip = leadAlong(foot, angle, length);
  const stem = new Path2D();
  stem.moveTo(foot.x, foot.y);
  stem.lineTo(tip.x, tip.y);
  paintStem(ctx, stem, hex, l.tile, still ? 0.5 : 0.85);
  for (let i = 1; i <= s.segments; i++) {
    const at = leadAlong(foot, angle, (length * (i - 0.5)) / s.segments);
    const last = i === s.segments;
    const r = l.tile * (last ? TIP : BEAD) * (1 + (last && !still ? 0.08 * Math.sin(time * 5) : 0));
    paintBead(ctx, at.x, at.y, r, last ? rim : hex, last ? 0.95 : 0.8, last);
  }
}
