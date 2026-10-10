import type { Point } from "@neon-spore/content";
import {
  drawPullKnob,
  drawPullTrack,
  PALETTE,
  PULL_KNOB,
  PULL_TRACK,
  type PullAfter,
  type PullWay,
  pullTrackPoint,
} from "@neon-spore/render";
import { VARIANTS } from "../../versus/candidates/index.js";
import { apply, restore, type Variant } from "../../versus/variant.js";
import {
  knobAt,
  type LabPull,
  progress,
  STRAY_TILES,
  type Stray,
  trackOf,
} from "./pull-lab-rule.js";
import { LAB_H, LAB_KNOB, LAB_TILE, LAB_W, type LabShape } from "./pull-lab-shapes.js";

/**
 * One frame of the PULL LAB (`pull-lab.ts`): the empty field, the pull drawn
 * by the game's own `drawPullTrack` and `drawPullKnob` — with a VERSUS
 * candidate held in their records for the length of the call, when one is
 * picked — then the lab's own word for the verdict and the finger over it.
 * The colours are the game's convention: the control's own, green counted,
 * red refused.
 */

/** Every candidate drawn here: one that patches the pull's own records —
 * found by what it patches, never by its slot's name, so taking or dropping
 * one needs nothing changed here. */
export function pullLooks(all: readonly Variant[] = VARIANTS): Variant[] {
  return all.filter((v) =>
    v.patches.some((p) => p.target === PULL_KNOB || p.target === PULL_TRACK),
  );
}

export const VERDICT_WORDS: Readonly<Record<string, string>> = {
  counted: "COUNTED",
  refused: "SHORT · REFUSED",
  ignored: "SHORT · IGNORED",
  strayed: "OFF THE PATH",
};

/** The bar's readout: the state, how far, and what the lifts have come to. */
export function readoutOf(shape: LabShape, pull: LabPull): string {
  const state = pull.verdict
    ? VERDICT_WORDS[pull.verdict]
    : pull.phase === "held"
      ? "HELD"
      : "WAITING";
  const far = Math.round(progress(shape, pull) * 100);
  return `${state} · ${far}% · COUNTED ${pull.counted} · REFUSED ${pull.refused} · OFF PATH ${pull.strayed}`;
}

export interface LabFrame {
  shape: LabShape;
  pull: LabPull;
  look: Variant | null;
  time: number;
  thumb: { at: Point; down: boolean } | null;
  /** The bar's OFF PATH rule; its band is drawn under the pull when it has one. */
  stray?: Stray;
}

export function paintLab(ctx: CanvasRenderingContext2D, f: LabFrame): void {
  paintField(ctx);
  paintBand(ctx, f);
  const applied = f.look ? apply(f.look) : null;
  try {
    paintPull(ctx, f);
  } finally {
    if (applied) restore(applied);
  }
  paintVerdict(ctx, f);
  if (f.thumb) paintThumb(ctx, f.thumb.at, f.thumb.down);
}

function toneOf(pull: LabPull): { hex: string; rim: string } {
  if (pull.verdict === "counted") return { hex: PALETTE.good, rim: PALETTE.goodRim };
  if (pull.verdict === "refused" || pull.verdict === "strayed")
    return { hex: PALETTE.red, rim: PALETTE.redRim };
  return { hex: PALETTE.cyan, rim: PALETTE.cyanRim };
}

function paintPull(ctx: CanvasRenderingContext2D, { shape, pull, time }: LabFrame): void {
  const held = pull.phase === "held" || pull.phase === "full";
  const tone = toneOf(pull);
  const after = afterOf(pull);
  drawPullTrack(ctx, trackOf(shape, pull), {
    ...tone,
    held,
    origin: shape.origin,
    at: pull.at,
    time,
    after,
  });
  drawPullKnob(ctx, knobAt(shape, pull), LAB_KNOB, {
    ...tone,
    held,
    time,
    way: wayNow(shape, pull),
    either: shape.origin > 0 && pull.sign === 0,
    after,
  });
}

/** What a look is told of the last lift: a stray is a refusal to the eye. */
function afterOf(pull: LabPull): PullAfter {
  const v = pull.verdict;
  const verdict = v === "counted" ? v : v === "refused" || v === "strayed" ? "refused" : null;
  return { verdict, since: pull.since, off: pull.off };
}

/** Along the track towards the end the pull is going to: the far end, or
 * for a two-way pull the way it has gone (both heads until it has). */
function wayNow(shape: LabShape, pull: LabPull): PullWay {
  const q = pullTrackPoint(trackOf(shape, pull), pull.at);
  const s = pull.sign === -1 ? -1 : 1;
  return { dx: q.dx * s, dy: q.dy * s };
}

function paintVerdict(ctx: CanvasRenderingContext2D, { shape, pull }: LabFrame): void {
  if (!pull.verdict) return;
  const k = knobAt(shape, pull);
  ctx.save();
  ctx.font = `600 ${LAB_TILE * 0.36}px ui-monospace, monospace`;
  // Leaning away from the nearer side wall, so a crop round the track keeps it whole.
  const left = k.x < LAB_W / 2;
  ctx.textAlign = left ? "left" : "right";
  ctx.fillStyle = toneOf(pull).hex === PALETTE.cyan ? PALETTE.dim : toneOf(pull).hex;
  ctx.globalAlpha = Math.max(0, 1 - pull.since / 1.2);
  const above = k.y < LAB_TILE * 2 ? LAB_KNOB * 2.6 : -LAB_KNOB * 2.2;
  ctx.fillText(VERDICT_WORDS[pull.verdict] ?? "", k.x + (left ? -LAB_KNOB : LAB_KNOB), k.y + above);
  ctx.restore();
}

/** The tolerance either side of the path: a faint band the thumb must stay
 * in, red while a pull that left it is shown. Not on the rope, which has none. */
function paintBand(ctx: CanvasRenderingContext2D, { shape, pull, stray }: LabFrame): void {
  const limit = STRAY_TILES[stray ?? "free"];
  if (limit === null || shape.direction === "free") return;
  const pts = shape.track.pts;
  ctx.save();
  ctx.strokeStyle = pull.verdict === "strayed" ? PALETTE.red : PALETTE.dim;
  ctx.globalAlpha = pull.verdict === "strayed" ? 0.22 : 0.14;
  ctx.lineWidth = limit * LAB_TILE * 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  for (const [i, q] of pts.entries()) {
    if (i === 0) ctx.moveTo(q.x, q.y);
    else ctx.lineTo(q.x, q.y);
  }
  ctx.stroke();
  ctx.restore();
}

/** The empty field: the game's own ground and grid, nothing on it. */
function paintField(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = PALETTE.background;
  ctx.fillRect(0, 0, LAB_W, LAB_H);
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 0.6;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  for (let x = LAB_TILE / 2; x < LAB_W; x += LAB_TILE) ctx.rect(x, 0, 0, LAB_H);
  for (let y = LAB_TILE / 2; y < LAB_H; y += LAB_TILE) ctx.rect(0, y, LAB_W, 0);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Where the finger is: a soft disc, solid while it presses. */
function paintThumb(ctx: CanvasRenderingContext2D, at: Point, down: boolean): void {
  ctx.save();
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = down ? 0.28 : 0.1;
  ctx.beginPath();
  ctx.arc(at.x, at.y, LAB_KNOB * 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
