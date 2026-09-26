import { blobPoints, circleSubpath } from "@neon-spore/content";
import {
  type GorgeState,
  gorgeNearestFull,
  gorgePhase,
  gorgeSink,
  type SimConfig,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { lobeDepths } from "./gorge-depth.js";
import { paintSack, paintSackGone } from "./gorge-flesh.js";
import { drawLobe, lobeHex } from "./gorge-lobe.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { showsGorgeNearest, showsGorgeTally } from "./view-role-clocks.js";

/**
 * THE GORGE, drawn: a translucent sack across seven columns above the top of
 * the field, breathing on the beat, with a lobe over each column and the
 * beads it has swallowed hanging in them (`gorge-lobe.ts`).
 *
 * **The whole boss is above row 0**, THE VANE's arrangement and for the
 * same reason: there is no body of it among the creatures, and a shot answers
 * it by leaving the field up its own column and into the intake there
 * (`sim/gorge-step.ts`). What is under it is the ordinary field, which is
 * where the boss's whole argument is made — every reflex shot at a body on
 * that field is a bead in the wrong lobe.
 *
 * **It sinks.** A row for every four beads it holds, read off `gorgeSink` and
 * never stored: the sack that has been fed carelessly hangs lower over the
 * field and the pair can see that it does. It is a picture and not a rule —
 * the intakes are where they were, and a shot up a column finds the same one.
 *
 * **Two seats, two marks.** The pilot is shown a violet tally under every
 * lobe, the count he has to say; the navigator is shown which lobe is nearest
 * full, ringed in the colour it will need, and no number at all
 * (`showsGorgeTally`, `showsGorgeNearest`). Both screens see the same beads —
 * the split is in what is written *about* them.
 *
 * Nothing here outlives a frame. The beads leaving at the end are the one
 * thing that does, and they are `gorge-fx.ts`'s.
 */

/** How far above row 0 the intakes hang, in tiles, before the sack sinks. */
const HANG = 0.55;
/** How far past the outer lobes the skin reaches, in tiles. */
const SACK_PAD = 0.7;
/** How much lower the skin hangs, in tiles, for every lobe already pierced. */
const SAG_PER = 0.07;
/** How far under the intakes the pilot's counts are written, in tiles. */
const TALLY_DROP = 0.14;
/** How much the sack's height moves on the beat, in tiles: a third. */
const BREATH = 0.33;
/** Beats the sack takes to go out after the beam, over `gorgeOutBeats`. */
const OUT_FADE = 2;

/** Where the intakes hang this frame — a row lower for every `gorgeSinkPer`. */
export function gorgeIntakeY(l: Layout, g: GorgeState, cfg: SimConfig): number {
  return tileCY(l, 0) - l.tile * HANG + l.tile * gorgeSink(g, cfg);
}

/**
 * The skin itself, where it hangs this frame: centred over the lobes, as wide
 * as they are plus its own reach, and as deep as its sag and its breath make
 * it. `breath` is 0 at rest, which is how a caption asks for it — a ring that
 * pulsed with the sack would be a ring nobody could read
 * (`caption-anchor-boss-d.ts`).
 */
export function gorgeSackBox(
  l: Layout,
  cfg: SimConfig,
  g: GorgeState,
  breath = 0,
): { x: number; y: number; rx: number; ry: number } {
  const left = tileCX(l, g.col);
  const right = tileCX(l, g.col + g.intakes.length - 1);
  // The sack sags as it is pierced: with three lobes hanging open it cannot
  // hold its shape and drops toward the field, which is step 11's curtain.
  const ry = l.tile * (0.75 + g.ruptures * SAG_PER + BREATH * 0.5 * breath);
  return {
    x: (left + right) / 2,
    y: gorgeIntakeY(l, g, cfg) - ry * 0.55,
    rx: (right - left) / 2 + l.tile * SACK_PAD,
    ry,
  };
}

/** The row the pilot's counts are written on, under the lobes. */
export function gorgeTallyY(l: Layout, cfg: SimConfig, g: GorgeState): number {
  return gorgeIntakeY(l, g, cfg) + l.tile * TALLY_DROP;
}

/** The sack's breath, 0 at the beat and back to it, peaking halfway. */
function breathOf(beatPhase: number): number {
  return 0.5 - 0.5 * Math.cos(beatPhase * Math.PI * 2);
}

export function drawGorge(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  g: GorgeState,
  beat: number,
  beatPhase: number,
  time: number,
  /** The blow a landed rupture deals the skin, 0..1 (`boss-hurt.ts`). */
  hurt = 0,
): void {
  const y = gorgeIntakeY(l, g, cfg);
  const phase = gorgePhase(g, cfg);
  const breath = phase === "out" ? 0 : breathOf(beatPhase);
  const sack = gorgeSackBox(l, cfg, g, breath);
  const body = splinePath(
    blobPoints(sack.x, sack.y, sack.rx, sack.ry, g.intakes.length, 0.08, 0.03, time * 0.4, 31, 48),
    true,
  );

  if (phase === "out") {
    // Ruptured along its whole width: the skin alone, grey, going out over
    // the beats the fight is held for the beads to leave in.
    const since = beat - g.outBeat + beatPhase;
    const fade = Math.max(0, 1 - since / OUT_FADE);
    paintSackGone(ctx, body, { ...sack, tile: l.tile }, fade);
    return;
  }

  // Violet-grey and translucent: every red and cyan in the fight is a bead,
  // and the skin is the one thing on the screen in neither.
  const lobes = g.intakes.map((_, i) => tileCX(l, g.col + i));
  paintSack(ctx, body, { ...sack, tile: l.tile }, breath, lobes, y);
  drawHurt(ctx, body, hurt);

  // The far lobes first, so where two meet the nearer is over the further.
  const depths = lobeDepths(g.intakes.length, time);
  const order = depths.map((_, i) => i).sort((a, b) => (depths[a]?.s ?? 0) - (depths[b]?.s ?? 0));
  for (const i of order) {
    const k = g.intakes[i];
    const d = depths[i];
    if (k === undefined || d === undefined) continue;
    const x = tileCX(l, g.col + i);
    const since = k.fullBeat < 0 ? -1 : beat - k.fullBeat + beatPhase;
    drawLobe(ctx, l.tile, cfg, k, x, y, breath, since, i === g.mouth, time, i, d);
  }
  const nearest = showsGorgeNearest(l.role) ? gorgeNearestFull(g) : -1;
  const k = g.intakes[nearest];
  if (k !== undefined) drawNearest(ctx, l, k, tileCX(l, g.col + nearest), y, breath);
  if (showsGorgeTally(l.role)) drawTally(ctx, l, g, y);
}

/**
 * The navigator's mark: a ring around the lobe nearest full, in the colour
 * it fills with — or in no colour, when it is empty and either will do. It
 * is the one lobe she has to name and the one word she has to say with it,
 * and it says nothing about *how* near, which is the pilot's number.
 */
function drawNearest(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  k: GorgeState["intakes"][number],
  x: number,
  y: number,
  breath: number,
): void {
  const ring = new Path2D(circleSubpath(x, y - l.tile * 0.5, l.tile * (0.62 + 0.04 * breath)));
  strokeGlow(ctx, ring, lobeHex(k.color).rim, STROKE.inner, 0.45 + 0.35 * breath);
}

/**
 * The pilot's tally: the count in every lobe, under it, in the hull's violet
 * — the colour of a thing that is his and not the field's. A ruptured lobe
 * carries no number, because there is nothing left to count in it.
 */
function drawTally(ctx: CanvasRenderingContext2D, l: Layout, g: GorgeState, y: number): void {
  const size = Math.max(8, Math.min(13, l.tile * 0.36));
  ctx.save();
  ctx.font = `600 ${Math.round(size)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = PALETTE.hull;
  for (let i = 0; i < g.intakes.length; i++) {
    const k = g.intakes[i];
    if (k === undefined || k.ruptured) continue;
    ctx.fillText(String(k.beads), tileCX(l, g.col + i), y + l.tile * TALLY_DROP);
  }
  ctx.restore();
}
