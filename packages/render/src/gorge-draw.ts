import { blobPoints } from "@neon-spore/content";
import {
  type GorgeState,
  gorgeDue,
  gorgeLevelOf,
  gorgeOwed,
  gorgePhase,
  gorgeSated,
  type SimConfig,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { type LobeDepth, lobeDepths } from "./gorge-depth.js";
import { gorgePose } from "./gorge-drift.js";
import { paintSack, paintSackGone } from "./gorge-flesh.js";
import { drawLobe, gorgeWant } from "./gorge-lobe.js";
import { gorgeBubbleAt, gorgeOrderAt, gorgeSackBox, gorgeTallyAt } from "./gorge-place.js";
import type { Layout } from "./layout.js";
import { withOutlinePose } from "./outline-drift.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";
import { showsGorgeNearest, showsGorgeTally } from "./view-role-clocks.js";

/**
 * THE GORGE, drawn: a translucent sack in the middle of the field, breathing
 * on the beat, with its bubbles hung in it — across a row, or round a ring
 * (`gorge-place.ts`) — and the shots each has swallowed hanging in them
 * (`gorge-lobe.ts`).
 *
 * **It is in the field, not above it** (the owner, 1 October 2026: *move
 * boss graphics more centered*): a shot meets a bubble mid-field, in its
 * column, as it would a body (`sim/gorge-step.ts`), so the bubble is drawn on
 * the tile it is met on.
 *
 * **Two seats, two halves.** The pilot is shown, under every bubble, the
 * count it still wants and, on an ordered level, its place in the order
 * (`showsGorgeTally`); the navigator is shown the colour it wants, in the
 * floor of the bubble, and no number at all (`showsGorgeNearest`). Both
 * screens see the same beads — the split is in what is written *about* them.
 *
 * Nothing here outlives a frame. The beads leaving at the end are the one
 * thing that does, and they are `gorge-fx.ts`'s.
 */

/** Beats the sack takes to go out after the last level, over `gorgeOutBeats`. */
const OUT_FADE = 2;
/** A ring's bubbles all stand at one depth: it faces the pair. */
const FLAT: LobeDepth = { s: 1, back: 0, turn: 0 };

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
  /** The blow a sated bubble deals the skin, 0..1 (`boss-hurt.ts`). */
  hurt = 0,
): void {
  const phase = gorgePhase(g);
  const breath = phase === "out" ? 0 : breathOf(beatPhase);
  const sack = gorgeSackBox(l, cfg, g, breath);
  const n = g.intakes.length;
  const body = splinePath(
    blobPoints(sack.x, sack.y, sack.rx, sack.ry, Math.max(3, n), 0.08, 0.03, time * 0.4, 31, 48),
    true,
  );

  if (phase === "out") {
    // Sated to the last bubble: the skin alone, grey, going out over the
    // beats the fight is held for the beads to leave in.
    const since = beat - g.outBeat + beatPhase;
    const fade = Math.max(0, 1 - since / OUT_FADE);
    paintSackGone(ctx, body, { ...sack, tile: l.tile }, fade);
    return;
  }

  // Violet-grey and translucent: every red and cyan in the fight is a bead,
  // and the skin is the one thing on the screen in neither. A row carries a
  // seam between each pair of bubbles; a ring has none to carry.
  const ring = gorgeLevelOf(g).ring;
  const beats = beat + beatPhase;
  const at = g.intakes.map((_, i) => gorgeBubbleAt(l, cfg, g, i, beats));
  const seams = ring ? [] : at.map((p) => p.x);
  paintSack(ctx, body, { ...sack, tile: l.tile }, breath, time, seams, at[0]?.y ?? sack.y);
  drawHurt(ctx, body, hurt);

  // On a row the far lobes first, so where two meet the nearer is over the further.
  const depths = ring ? at.map(() => FLAT) : lobeDepths(n, time);
  const order = depths.map((_, i) => i).sort((a, b) => (depths[a]?.s ?? 0) - (depths[b]?.s ?? 0));
  const colours = showsGorgeNearest(l.role);
  for (const i of order) {
    const k = g.intakes[i];
    const d = depths[i];
    const p = at[i];
    if (k === undefined || d === undefined || p === undefined) continue;
    // Each lobe leans on its own intake, which stays where a shot meets it (`gorge-drift.ts`).
    const pose = gorgePose(l, cfg, p, i, beat, beatPhase);
    const want = colours ? gorgeWant(k) : null;
    withOutlinePose(ctx, pose.pose, pose.root, () =>
      drawLobe(ctx, l.tile, k, p.x, p.y, breath, want, time, i, d),
    );
  }
  if (showsGorgeTally(l.role)) drawTally(ctx, l, cfg, g, beats);
}

/**
 * The pilot's tally: under every bubble still wanting shots, the count it
 * wants — and over it, on an ordered level, its place in the order, the due
 * one bright and the rest dimmed. Each is cut out of the sack by a dark edge:
 * in the hull's violet, on a violet skin, they could not be read at a
 * phone's size. A sated bubble carries no number.
 */
function drawTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  g: GorgeState,
  beats: number,
): void {
  const size = Math.max(11, Math.min(18, l.tile * 0.5));
  ctx.save();
  ctx.font = `700 ${Math.round(size)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  ctx.lineWidth = size * 0.3;
  ctx.strokeStyle = PALETTE.background;
  for (let i = 0; i < g.intakes.length; i++) {
    const k = g.intakes[i];
    if (k === undefined || gorgeSated(k)) continue;
    const t = gorgeTallyAt(l, cfg, g, i, beats);
    ctx.textBaseline = "top";
    numeral(ctx, String(gorgeOwed(k)), t.x, t.y, PALETTE.text, 1);
    if (k.order < 0) continue;
    ctx.textBaseline = "middle";
    const due = gorgeDue(g, i);
    const o = gorgeOrderAt(l, cfg, g, i, beats);
    numeral(ctx, String(k.order + 1), o.x, o.y, due ? PALETTE.text : PALETTE.hull, due ? 1 : 0.8);
  }
  ctx.restore();
}

function numeral(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  colour: string,
  alpha: number,
): void {
  ctx.globalAlpha = alpha;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = colour;
  ctx.fillText(text, x, y);
}
