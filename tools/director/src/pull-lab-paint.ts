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
import { splitOf } from "./pull-goo/arrow.js";
import { GOO_LOOKS } from "./pull-goo/index.js";
import { knobAt, type LabPull, progress } from "./pull-lab-rule.js";
import { LAB_H, LAB_KNOB, LAB_TILE, LAB_W, type LabShape } from "./pull-lab-shapes.js";
import { STRAY_TILES, type Stray } from "./pull-lab-stray.js";

/**
 * One frame of the PULL LAB (`pull-lab.ts`): the empty field, the pull drawn
 * by the game's own `drawPullTrack` and `drawPullKnob` — with a look held in
 * their records for the length of the call, when one is picked. No finger
 * over it: the owner, 10 October 2026, *remove the grey cursor* — the hand
 * on the glass is the game's, never drawn. No word on the field either, *not
 * required to show any text*; the bar's readout says the verdict. The colours
 * are the game's convention: the control's own, green counted, red refused.
 */

/** Every candidate drawn here: one that patches the pull's own records —
 * found by what it patches, never by its slot's name, so taking or dropping
 * one needs nothing changed here. */
export function pullLooks(all: readonly Variant[] = VARIANTS): Variant[] {
  return all.filter((v) =>
    v.patches.some((p) => p.target === PULL_KNOB || p.target === PULL_TRACK),
  );
}

/** The LOOK picker: the VERSUS candidates for the pull, then the lab's own GOO looks
 * (`pull-goo/`), which draw their own band. */
export function labLooks(): Variant[] {
  return [...pullLooks(), ...GOO_LOOKS];
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
  /** The bar's OFF PATH rule; its band is drawn under the pull when it has one. */
  stray?: Stray;
}

export function paintLab(ctx: CanvasRenderingContext2D, f: LabFrame): void {
  paintField(ctx);
  if (!f.look || !GOO_LOOKS.includes(f.look)) paintBand(ctx, f);
  const applied = f.look ? apply(f.look) : null;
  try {
    paintPull(ctx, f);
  } finally {
    if (applied) restore(applied);
  }
}

function toneOf(pull: LabPull): { hex: string; rim: string } {
  if (pull.verdict === "counted") return { hex: PALETTE.good, rim: PALETTE.goodRim };
  if (pull.verdict === "refused" || pull.verdict === "strayed")
    return { hex: PALETTE.red, rim: PALETTE.redRim };
  return { hex: PALETTE.cyan, rim: PALETTE.cyanRim };
}

function paintPull(ctx: CanvasRenderingContext2D, { shape, pull, time, stray }: LabFrame): void {
  const held = pull.phase === "held" || pull.phase === "full";
  const tone = toneOf(pull);
  const limit = STRAY_TILES[stray ?? "free"];
  const after = afterOf(pull, limit === null ? null : limit * LAB_TILE);
  drawPullTrack(ctx, shape.track, {
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
    after: {
      ...after,
      split: splitOf(shape.origin > 0, (pull.at - shape.origin) / (shape.origin || 1)),
    },
  });
}

/** What a look is told of the last lift: a stray is a refusal to the eye. */
function afterOf(pull: LabPull, reach: number | null): PullAfter {
  const v = pull.verdict;
  const verdict = v === "counted" ? v : v === "refused" || v === "strayed" ? "refused" : null;
  return {
    verdict,
    since: pull.since,
    off: pull.off,
    age: pull.age,
    rested: pull.rested,
    last: pull.last,
    from: pull.from,
    lifted: pull.lifted,
    grabbed: pull.grabbed,
    born: pull.born,
    ...(reach === null ? {} : { reach }),
  };
}

/** Along the track towards the end the pull is going to: the far end, or
 * for a two-way pull the way it has gone (both heads until it has). */
function wayNow(shape: LabShape, pull: LabPull): PullWay {
  const q = pullTrackPoint(shape.track, pull.at);
  // Not gone a way yet: the side the drop is on, so the arrow growing is that one.
  const s = pull.sign !== 0 ? pull.sign : pull.at < shape.origin ? -1 : 1;
  return { dx: q.dx * s, dy: q.dy * s };
}

/** The tolerance either side of the path: a faint band the thumb must stay
 * in, red while a pull that left it is shown. */
function paintBand(ctx: CanvasRenderingContext2D, { shape, pull, stray }: LabFrame): void {
  const limit = STRAY_TILES[stray ?? "free"];
  if (limit === null) return;
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
