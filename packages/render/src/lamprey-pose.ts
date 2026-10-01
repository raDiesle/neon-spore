import { type LampreyState, lampreyStep, midCol, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { fieldX } from "./field-flip.js";
import { type LampreyPose, MOUTH, type Point } from "./lamprey-shape.js";
import type { Layout } from "./layout.js";
import { phaseInto } from "./phase-into.js";

/**
 * **The clock THE LAMPREY is posed off** (§41, *Animation*), six poses: swum
 * in from the nearer side in an S, its body trailing out of the screen's edge
 * and only straightening up the field as it arrives — never down through the
 * top, where the switcher stands (`boss-top.test.ts`); the mouth flat on the hull, sliding a
 * column at each crawl; pulled loose in an arc to the next bite or up to
 * rear; reared over the middle column full-face, the gullet showing; jerked
 * up by a hit; and limp, falling away.
 *
 * **Where the mouth is comes from the simulation and nothing else**: the
 * bite's column, the crawl's direction and the beat it crawled on, the phase
 * and the beat it began — so both phones draw it in one place. The body's
 * wave is the beat's, never the wall clock's, so it stands still with the
 * game paused.
 */

/** How far above the hull the mouth hangs before it bites, and where it rears to, in tiles. */
const HOVER = 1.5;
const REAR = 5;
/** How far outside the field it swims in from, in columns, and how high over its hover, in tiles. */
const OUTSIDE = 4;
const ABOVE = 3;
/** A bite's landing and a crawl's slide, in beats. */
const LAND = 0.5;
const SLIDE = 0.5;
/** The mouth's tilt flat on the hull, between bites, and full-face. */
const TILT_BITE = 0.45;
const TILT_LOOSE = 0.7;
/** How hard the body bends at rest, and how far the crawl leans it. */
const CURVE = 0.35;
const LEAN = 0.25;

const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/** Where the mouth hangs before biting onto `col`, and where it rears. */
function hover(l: Layout, col: number): Point {
  return { x: fieldX(l, col), y: l.hullY - HOVER * l.tile };
}
function reared(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.hullY - REAR * l.tile };
}

/** Where the mouth goes after pulling loose: over the next bite, or up to rear. */
function after(l: Layout, cfg: SimConfig, s: LampreyState): Point {
  const step = lampreyStep(s);
  return step !== null && step.ask === "bite" ? hover(l, step.col) : reared(l, cfg);
}

/** The eel's pose this frame. */
export function lampreyPose(
  l: Layout,
  cfg: SimConfig,
  s: LampreyState,
  beat: number,
  beatPhase: number,
): LampreyPose {
  const into = phaseInto(s, beat, beatPhase);
  const wave = (beat + beatPhase) * Math.PI * 0.8;
  const base = { r: MOUTH * l.tile, wave, curve: CURVE, lean: 0, spent: 0 };
  if (s.phase === "entering") {
    const k = smoothstep(into / Math.max(1, cfg.lampreyEnterBeats));
    const to = hover(l, s.jawCol);
    const side = s.jawCol < midCol(cfg) ? -OUTSIDE : cfg.cols - 1 + OUTSIDE;
    const from = fieldX(l, side);
    // Which way the body trails while it swims: back out of the edge it came in at.
    const back = Math.sign(from - to.x) * (Math.PI / 2) * (1 - k);
    const sway = Math.sin(into * Math.PI) * 0.8 * l.tile * (1 - k);
    const x = lerp(from, to.x, k);
    const y = lerp(to.y - ABOVE * l.tile, to.y, k) + sway;
    return { ...base, x, y, tilt: TILT_LOOSE, lean: back, curve: CURVE * 2 - k * CURVE };
  }
  if (s.phase === "bite") {
    const from = s.rebiting ? reared(l, cfg) : hover(l, s.jawCol);
    const land = smoothstep(into / LAND);
    const x = crawlX(l, s, beat, beatPhase);
    const y = lerp(from.y, l.hullY, land);
    return { ...base, x: lerp(from.x, x, land), y, tilt: TILT_BITE, lean: -s.crawlDir * LEAN };
  }
  if (s.phase === "loose") {
    const k = smoothstep(into / Math.max(1, cfg.lampreyLooseBeats));
    const from = { x: fieldX(l, s.jawCol), y: l.hullY };
    const to = after(l, cfg, s);
    const lift = 1.5 * l.tile * Math.sin(k * Math.PI);
    const tilt = lerp(TILT_BITE, to.y < l.hullY - HOVER * l.tile ? 1 : TILT_LOOSE, k);
    return { ...base, x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k) - lift, tilt };
  }
  const top = reared(l, cfg);
  if (s.phase === "rearing") {
    const sway = Math.sin(wave * 0.5) * 0.15 * l.tile;
    return { ...base, x: top.x + sway, y: top.y, tilt: 1 };
  }
  if (s.phase === "recoil") {
    const k = Math.min(1, into / Math.max(1, cfg.lampreyRecoilBeats));
    const jerk = Math.sin(k * Math.PI) * 1.5 * l.tile;
    return { ...base, x: top.x, y: top.y - jerk, tilt: lerp(TILT_LOOSE, 1, k), curve: CURVE * 2 };
  }
  const k = Math.min(1, into / Math.max(1, cfg.lampreySpentBeats));
  const y = top.y + k * k * (l.hullY - top.y + 2 * l.tile);
  return { ...base, x: top.x, y, tilt: 1, curve: CURVE * (1 - k), spent: k };
}

/** The mouth's x along the hull: sliding a column over half a beat after each crawl. */
function crawlX(l: Layout, s: LampreyState, beat: number, beatPhase: number): number {
  const at = fieldX(l, s.jawCol);
  if (s.crawlBeat <= s.phaseBeat) return at;
  const k = smoothstep(Math.max(0, beat - s.crawlBeat + beatPhase) / SLIDE);
  return lerp(fieldX(l, s.jawCol - s.crawlDir), at, k);
}

/** How far into a full bite the jaw is, 0 to 1: the scar's depth. */
export function lampreyDepth(s: LampreyState, cfg: SimConfig): number {
  return Math.min(1, s.biteMilli / Math.max(1, cfg.lampreyBiteFullMilli));
}

/** How much of the lit tooth's window is left, 1 just lit and 0 run out. */
export function lampreyToothLeft(
  s: LampreyState,
  beat: number,
  beatPhase: number,
  toothBeats: number,
): number {
  const gone = (beat - s.toothBeat + beatPhase) / Math.max(1, toothBeats);
  return Math.max(0, Math.min(1, 1 - gone));
}
