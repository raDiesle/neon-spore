import { type HaspState, haspHandHasp, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { sinHash } from "./hash.js";
import { haspSpokeTurns } from "./hasp-pose.js";
import { haspCentre, haspHubRadius, haspSeam, haspShellPath } from "./hasp-shape.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { phaseInto } from "./phase-into.js";

/**
 * **THE HASP's story between the hasps, drawn** (`sim/hasp-story.ts`, §20
 * S1–S4): the four poses the design adds — a door shaking on its hinge, a
 * wheel spinning backward with its mark smeared, a hasp furred with rust and
 * flaking, three doors swaying half-shut. Read off the phase, its beat and the
 * story's own counts, so nothing is kept between frames (`restart.test.ts`).
 *
 * **The split holds through the story.** A count a hand moves is drawn only
 * on the screens shown that hand (`view-role-clocks-c.ts`): the rattle quiets
 * as *his* grip is kept, on the latch's screens; the rust thins as *her*
 * rocks count and the smear fades as her winding catches the spring, on the
 * wheel's. The sway's count is both hands at once and is drawn on neither —
 * the doors fall shut on the window's clock, which both seats share, and the
 * answer is the row swinging clear. Every cue stands where the plain pose put
 * it — the bar on its rail, the hub at its centre — because THE SLOW is on
 * through all four (`boss-hush.test.ts`).
 */

/** How far the rattling door chatters about its rest, in gape, and how fast (rad/s). */
const RATTLE = 0.16;
const RATTLE_RATE = 37;
/** Where the swaying doors fall to by the window's end, as a share of their rest. */
const HALF_SHUT = 0.5;
/** How far they sway on the way, in gape, and how fast (rad/s). */
const SWAY = 0.12;
const SWAY_RATE = 1.9;
/** Rust blotches down the seam, the bristles off them, and the flakes falling. */
const BLOTCHES = 14;
const FLAKES = 7;
/** How much of the fur her rocks wear off by the time the rust breaks. */
const WORN = 0.7;
/** The smear's ghost spokes, and how far behind the turn each trails (rad). */
const GHOSTS = 3;
const TRAIL = 0.17;
const SPOKES = 5;

/** How hard the rattling door is shaking right now, 0..1; nought outside the rattle. */
function rattleShake(s: HaspState, cfg: SimConfig, latch: boolean): number {
  if (s.phase !== "rattle") return 0;
  if (!latch) return 1;
  return Math.max(0, 1 - s.runBeats / Math.max(1, cfg.haspRattleBeats));
}

/**
 * What the story adds to clasp `i`'s gape (`hasp-pose.ts`, `haspGape`): the
 * rattling door's chatter, or the three doors' fall toward half-shut and
 * their sway on the way. Nought in any other state.
 */
export function haspStoryGape(
  s: HaspState,
  cfg: SimConfig,
  i: number,
  beat: number,
  beatPhase: number,
  time: number,
  latch: boolean,
  rest: number,
): number {
  if (s.phase === "rattle" && i === haspHandHasp(s)) {
    const chatter = Math.sin(time * RATTLE_RATE) + 0.5 * Math.sin(time * RATTLE_RATE * 1.63 + 1);
    return RATTLE * rattleShake(s, cfg, latch) * (chatter / 1.5);
  }
  if (s.phase !== "sway") return 0;
  const falling = smoothstep(
    Math.min(1, phaseInto(s, beat, beatPhase) / Math.max(1, cfg.haspStoryBeats)),
  );
  return -rest * HALF_SHUT * falling + SWAY * Math.sin(time * SWAY_RATE + i * 2.1);
}

/**
 * The story on clasp `i`'s shell, drawn over it: the hinge's chatter on the
 * rattling door, and the rust furring the sealed last one's seam.
 */
export function drawHaspStory(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HaspState,
  i: number,
  gape: number,
  beat: number,
  beatPhase: number,
  time: number,
  latch: boolean,
  wheel: boolean,
): void {
  if (i !== haspHandHasp(s)) return;
  if (s.phase === "rattle") drawChatter(ctx, l, cfg, i, rattleShake(s, cfg, latch), time);
  if (s.phase === "rust") {
    const worn = wheel ? WORN * Math.min(1, s.rocks / Math.max(1, cfg.haspRustRocks)) : 0;
    drawRust(ctx, l, cfg, i, gape, 1 - worn, phaseInto(s, beat, beatPhase));
  }
}

/** Short strokes flicking either side of the hinge — the knock of a loose pin. */
function drawChatter(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  i: number,
  shake: number,
  time: number,
): void {
  if (shake <= 0) return;
  const hinge = haspSeam(l, cfg, i);
  const marks = new Path2D();
  for (const side of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const reach = l.tile * (0.35 + 0.18 * k + 0.08 * Math.sin(time * 23 + k + side));
      const a = -Math.PI / 2 + side * (0.5 + 0.35 * k);
      const x = hinge.x + Math.cos(a) * reach;
      const y = hinge.top + Math.sin(a) * reach;
      marks.moveTo(x, y);
      marks.lineTo(x + Math.cos(a) * l.tile * 0.18, y + Math.sin(a) * l.tile * 0.18);
    }
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.85 * shake);
  ctx.stroke(marks);
}

/**
 * The rust: orange blotches crusted down the seam inside the shell, bristles
 * standing off them, and flakes dropping off it on the beat. `kept` is how
 * much of the fur is left, 1 whole.
 */
function drawRust(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  i: number,
  gape: number,
  kept: number,
  into: number,
): void {
  const seam = haspSeam(l, cfg, i);
  const span = seam.bottom - seam.top;
  const t = l.tile;
  const shown = Math.round(BLOTCHES * kept);
  const fur = new Path2D();
  const bristles = new Path2D();
  for (let k = 0; k < shown; k++) {
    const y = seam.top + span * (0.1 + (0.82 * k) / BLOTCHES);
    const x = seam.x + (sinHash(k, 1) - 0.5) * 0.7 * t;
    const r = t * (0.1 + 0.12 * sinHash(k, 2));
    fur.moveTo(x + r, y);
    fur.arc(x, y, r, 0, Math.PI * 2);
    const a = sinHash(k, 3) * Math.PI * 2;
    bristles.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    bristles.lineTo(x + Math.cos(a) * (r + 0.16 * t), y + Math.sin(a) * (r + 0.16 * t));
  }
  ctx.save();
  ctx.clip(haspShellPath(l, cfg, i, gape));
  ctx.fillStyle = rgba(PALETTE.ember, 0.6);
  ctx.fill(fur);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.emberRim, 0.8);
  ctx.stroke(bristles);
  ctx.restore();
  // The flakes fall past the shell, so they are not clipped to it.
  const flakes = new Path2D();
  for (let k = 0; k < FLAKES; k++) {
    const f = (into + k / FLAKES) % 1;
    const x = seam.x + (sinHash(k, 5) - 0.5) * 0.9 * t + 0.2 * t * Math.sin(f * 5 + k);
    const y = seam.top + span * sinHash(k, 6) + f * 1.3 * t;
    const size = t * 0.09 * (1 - 0.5 * f);
    flakes.rect(x - size / 2, y - size / 2, size, size);
  }
  ctx.fillStyle = rgba(PALETTE.ember, 0.75);
  ctx.fill(flakes);
}

/**
 * The backspun wheel's smear: ghost spokes trailing where the mark just was
 * as it runs back, fading as her winding catches the spring. Drawn over the
 * wheel (`hasp-parts.ts`), on the wheel's screens alone.
 */
export function drawHaspSmear(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HaspState,
  i: number,
  beat: number,
  beatPhase: number,
): void {
  if (s.phase !== "backspin" || i !== haspHandHasp(s)) return;
  const left = Math.max(0, 1 - s.travelMilli / Math.max(1, cfg.haspWindTravelMilli));
  if (left <= 0) return;
  const at = haspCentre(l, cfg, i);
  const r = haspHubRadius(l);
  const turn = haspSpokeTurns(s, cfg, i, beat, beatPhase) * Math.PI * 2;
  ctx.lineWidth = STROKE.outline;
  for (let g = 1; g <= GHOSTS; g++) {
    const ghost = new Path2D();
    for (let k = 0; k < SPOKES; k++) {
      const a = turn + g * TRAIL + (k * Math.PI * 2) / SPOKES;
      ghost.moveTo(at.x + Math.cos(a) * r * 0.3, at.y + Math.sin(a) * r * 0.3);
      ghost.lineTo(at.x + Math.cos(a) * r * 0.88, at.y + Math.sin(a) * r * 0.88);
    }
    ctx.strokeStyle = rgba(PALETTE.rock, 0.5 * left * (1 - g / (GHOSTS + 1)));
    ctx.stroke(ghost);
  }
}
