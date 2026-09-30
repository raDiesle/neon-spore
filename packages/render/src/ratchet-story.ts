import { type RatchetState, ratchetHeld, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { phaseInto } from "./phase-into.js";
import { ratchetPawlY, ratchetStep, ratchetX } from "./ratchet-shape.js";

/**
 * **THE RATCHET's story between the teeth, drawn** (§22, *The story between
 * the teeth*; the rules are `sim/ratchet-story.ts`). Four poses, each a
 * number `ratchet-draw.ts` folds into the machine it already draws:
 *
 * - **The slip**: the rack sagging back down past the pawl, grinding a share
 *   of a tooth toward the catch, and hauled back up as her held beats count.
 * - **The kick**: the pawl's tip sprung up out of its seat and trembling,
 *   eased back onto the shoulder as his held beats count.
 * - **The bind**: the rack shaking on its strut and sparks off the seam where
 *   the pawl grinds on it, both dying down as the chord counts.
 * - **The wind**: the spring run down to a few slack coils, and a turn wound
 *   back into it with every set of her catch.
 *
 * **Only the rack, the spring and the pawl's tip move.** The pad and the
 * catch — the two marks a thumb is on — stay where they are, so nothing here
 * is hushed under THE SLOW (`tools/director/test/boss-hush.test.ts`).
 * Everything is read off the state and the beat; nothing is kept between
 * frames (`restart.test.ts`).
 */

/** How far the slip sags at most, in teeth. */
const SAG = 0.6;
/** How far the kick springs the pawl's tip, as extra lift past the click's. */
const KICK = 1.4;
/** How fast the kicked tip trembles, cycles a beat, and by how much of its lift. */
const TREMBLE_RATE = 3;
const TREMBLE = 0.15;
/** How far the bound rack shakes at most, in tiles, and how fast, cycles a beat. */
const SHAKE = 0.06;
const SHAKE_RATE = 5;
/** Sparks off the seam, and how far they fly, in tiles. */
const SPARKS = 7;
const SPARK_REACH = 0.7;
/** Beats a state takes to come on. */
const EASE_IN = 0.75;
/** The spring's coils while it is run down, and the turns each set winds back. */
const SLACK_COILS = 3;
const TURN_COILS = 2;

/** How far the state has come on, 0..1, over its first `EASE_IN` beats. */
function onset(s: RatchetState, beat: number, beatPhase: number): number {
  return smoothstep(Math.min(1, phaseInto(s, beat, beatPhase) / EASE_IN));
}

/**
 * The share of the held beats counted, 0..1, the beat in progress eased in
 * while the hand is still on — so the pose closes smoothly as the count
 * climbs, and falls back at once when the hand slips, which is the slip.
 */
function heldShare(held: boolean, beats: number, need: number, beatPhase: number): number {
  const counting = held ? smoothstep(beatPhase) : 0;
  return Math.min(1, (beats + counting) / Math.max(1, need));
}

/** How far the slip has sagged the rack, in teeth, downward; 0 outside the slip. */
export function ratchetSag(
  s: RatchetState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "slip") return 0;
  const bit = heldShare(ratchetHeld(s, cfg), s.holdBeats, cfg.ratchetSlipBeats, beatPhase);
  return SAG * onset(s, beat, beatPhase) * (1 - bit);
}

/** The pawl's extra lift, sprung out of its seat by the kick; 0 outside the kick. */
export function ratchetKickLift(
  s: RatchetState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "kick") return 0;
  const seated = heldShare(s.pawlDown, s.holdBeats, cfg.ratchetKickBeats, beatPhase);
  const tremble = 1 + TREMBLE * Math.sin((beat + beatPhase) * TREMBLE_RATE * Math.PI * 2);
  return KICK * onset(s, beat, beatPhase) * (1 - seated) * tremble;
}

/** How hard the bind grinds, 0..1; 0 outside it. */
export function ratchetGrind(
  s: RatchetState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "bind") return 0;
  const both = ratchetHeld(s, cfg) && s.pawlDown;
  const meshed = heldShare(both, s.holdBeats, cfg.ratchetBindBeats, beatPhase);
  return onset(s, beat, beatPhase) * (1 - meshed);
}

/** The bound rack's shake sideways on its strut this frame, in pixels. */
export function ratchetRackShake(
  l: Layout,
  grind: number,
  beat: number,
  beatPhase: number,
): number {
  if (grind <= 0) return 0;
  return SHAKE * grind * l.tile * Math.sin((beat + beatPhase) * SHAKE_RATE * Math.PI * 2);
}

/**
 * The spring's coils and how wide they swing: seven, as it hangs outside the
 * wind; run down to `SLACK_COILS` wide loose ones as the wind comes on, and
 * `TURN_COILS` wound back, tighter, for every set of her catch.
 */
export function ratchetCoils(
  s: RatchetState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): { coils: number; width: number } {
  if (s.phase !== "wind") return { coils: 7, width: 0.22 };
  const wound = Math.min(1, s.windSets / Math.max(1, cfg.ratchetWindSets));
  const slack = onset(s, beat, beatPhase) * (1 - wound);
  return { coils: SLACK_COILS + TURN_COILS * s.windSets, width: 0.22 + 0.16 * slack };
}

/**
 * The bind's sparks, thrown off the seam either side of the rack where the
 * teeth grind on the pawl: each flies out and fades on the beat's own
 * fraction, spaced so the next is always leaving — the same frame for the
 * same beat, so a test sees what a player sees.
 */
export function drawRatchetSparks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  grind: number,
  beatPhase: number,
): void {
  if (grind <= 0) return;
  const y = ratchetPawlY(l);
  const x = ratchetX(l, cfg);
  const half = ratchetStep(l) * 0.9;
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.inner;
  for (let i = 0; i < SPARKS; i++) {
    const t = (beatPhase * 2 + i / SPARKS) % 1;
    const side = i % 2 === 0 ? 1 : -1;
    const angle = -0.35 - (i * 0.9) / SPARKS;
    const r = SPARK_REACH * l.tile * t;
    const from = { x: x + side * half, y };
    const dx = side * Math.cos(angle);
    const dy = Math.sin(angle);
    ctx.strokeStyle = rgba(PALETTE.emberRim, grind * (1 - t));
    ctx.beginPath();
    ctx.moveTo(from.x + dx * r, from.y + dy * r);
    ctx.lineTo(from.x + dx * (r + l.tile * 0.16), from.y + dy * (r + l.tile * 0.16));
    ctx.stroke();
  }
  ctx.lineCap = "butt";
}
