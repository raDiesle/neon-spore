import { type SimConfig, VALVE_PINS, type ValveState } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { into } from "./valve-pose.js";
import { valveFacePath, valveHoleCentre, valveReach, valveSocket } from "./valve-shape.js";

/**
 * **THE VALVE's story between the pins, drawn** (§25 rows 5–6, 12–13, 17–19;
 * the rules are `sim/valve-story.ts`). Four states, each laid over the drum
 * `valve-draw.ts` has already drawn, in its own frame:
 *
 * - **The jet**: pale steam blowing out of the first pin's empty slot, puff
 *   after puff, its lip glowing ember — the socket flashing for the tap.
 * - **The brace**: the whole drum shuddering, less as the chord counts
 *   (`valveShake`); a half-ring each side of the socket lit under each held
 *   thumb, and the count filling inside it.
 * - **The wipe**: a pale film over the face, dripping, cleared from the left
 *   as the rubs land — the face read through it as it goes.
 * - **The seal**: a white seam split down the face, straining wider as its
 *   window runs, with the brace's two half-rings back for the hold.
 *
 * All plain white and iron: either seat answers every one of them.
 */

/** How far the drum shudders at most, in tiles, and how fast, in cycles per beat. */
const SHUDDER = 0.07;
const SHUDDER_RATE = 5;
/** Puffs in the jet, how far they blow, in tiles. */
const PUFFS = 6;
const JET = 1.4;
/** Drips hanging off the film. */
const DRIPS = 5;

/** The drum's shake this frame, in pixels: the brace's shudder, fading as the chord counts, and the seal's lighter strain. */
export function valveShake(
  l: Layout,
  s: ValveState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): { x: number; y: number } {
  const t = (beat + beatPhase) * SHUDDER_RATE * Math.PI * 2;
  let amp = 0;
  if (s.phase === "brace") amp = SHUDDER * (1 - s.chordBeats / Math.max(1, cfg.valveBraceBeats));
  else if (s.phase === "seal") amp = SHUDDER * 0.35;
  return { x: amp * l.tile * Math.sin(t), y: amp * l.tile * 0.4 * Math.sin(t * 1.7) };
}

/** Whatever the state lays over the drum, in the drum's own frame. */
export function drawValveStory(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: ValveState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): void {
  if (s.phase === "jet") drawJet(ctx, l, beatPhase);
  else if (s.phase === "wipe") drawFilm(ctx, l, s, cfg, beatPhase);
  else if (s.phase === "seal") drawSeam(ctx, l, s, cfg, beat, beatPhase);
  if (s.phase === "brace" || s.phase === "seal") {
    const need = s.phase === "brace" ? cfg.valveBraceBeats : cfg.valveSealBeats;
    drawHolds(ctx, l, s, s.chordBeats / Math.max(1, need));
  }
}

/** The first slot blowing back: its lip hot, puffs leaving it down and out, swelling and thinning. */
function drawJet(ctx: CanvasRenderingContext2D, l: Layout, beatPhase: number): void {
  const at = valveHoleCentre(l, 0, VALVE_PINS);
  const lip = new Path2D();
  lip.ellipse(at.x, at.y, l.tile * 0.3, l.tile * 0.1, 0, 0, Math.PI * 2);
  strokeGlow(ctx, lip, PALETTE.emberRim, STROKE.inner, 1.2);
  for (let i = 0; i < PUFFS; i++) {
    const t = (beatPhase + i / PUFFS) % 1;
    const r = l.tile * (0.12 + 0.3 * t);
    const x = at.x - l.tile * 0.35 * t;
    const y = at.y + JET * l.tile * t;
    ctx.fillStyle = rgba(PALETTE.text, 0.55 * (1 - t));
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** The film over the face: pale, cleared from the left a share per rub, with drips hanging off its lower edge. */
function drawFilm(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: ValveState,
  cfg: SimConfig,
  beatPhase: number,
): void {
  const share = s.wiped / Math.max(1, cfg.valveWipeRubs);
  const { rx, ry } = valveReach(l);
  const from = -rx + 2 * rx * share;
  ctx.save();
  const left = new Path2D();
  left.rect(from, -ry * 2, rx * 2, ry * 4);
  ctx.clip(left);
  const face = valveFacePath(l);
  ctx.fillStyle = rgba(PALETTE.text, 0.32);
  ctx.fill(face);
  strokeGlow(ctx, face, PALETTE.text, STROKE.inner, 0.6);
  for (let i = 0; i < DRIPS; i++) {
    const x = -rx * 0.6 + (i / (DRIPS - 1)) * rx * 1.2;
    const fall = (beatPhase + i * 0.37) % 1;
    const y = ry * 0.62 + l.tile * 0.5 * fall;
    const drip = new Path2D();
    drip.ellipse(x, y, l.tile * 0.05, l.tile * 0.09, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.text, 0.6 * (1 - fall));
    ctx.fill(drip);
  }
  ctx.restore();
}

/** The bare seal: a white seam split down the face, wider the longer it strains, pulsing on the beat. */
function drawSeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: ValveState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): void {
  const { ry } = valveReach(l);
  const strain = Math.min(1, into(s, beat, beatPhase) / (cfg.valveStrainBeats + 1));
  const pulse = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  const w = l.tile * (0.04 + 0.12 * strain);
  const seam = new Path2D();
  seam.moveTo(0, -ry * 0.72);
  seam.lineTo(w, -ry * 0.2);
  seam.lineTo(-w, ry * 0.2);
  seam.lineTo(0, ry * 0.72);
  ctx.lineWidth = STROKE.outline + w;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.5 + 0.4 * pulse);
  ctx.stroke(seam);
  strokeGlow(ctx, seam, PALETTE.hullRim, STROKE.outline, 1 + strain);
}

/**
 * The hold: a half-ring either side of the socket, Player 1's on the left and
 * Player 2's on the right, each lit while its thumb is down — and inside the
 * socket the count of beats held together, filling as a disc.
 */
function drawHolds(ctx: CanvasRenderingContext2D, l: Layout, s: ValveState, chord: number): void {
  const { at, r } = valveSocket(l);
  for (const seat of [0, 1] as const) {
    const down = s.held[seat] === true;
    const from = seat === 0 ? Math.PI / 2 : -Math.PI / 2;
    const half = new Path2D();
    half.arc(at.x, at.y, r * 1.35, from + 0.25, from + Math.PI - 0.25);
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = rgba(PALETTE.hullRim, down ? 0.85 : 0.25);
    ctx.stroke(half);
    if (down) strokeGlow(ctx, half, PALETTE.hullRim, STROKE.outline, 1.2);
  }
  if (chord <= 0) return;
  const disc = new Path2D();
  disc.arc(at.x, at.y, r * 0.7 * Math.min(1, chord), 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.75);
  ctx.fill(disc);
}
