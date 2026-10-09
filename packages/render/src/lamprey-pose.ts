import {
  type LampreyState,
  lampreyAsks,
  lampreyCrawling,
  lampreyHeadPull,
  lampreyTailHeld,
  lampreyTailPull,
  lampreyTailPulls,
  lampreyTailWay,
  type SimConfig,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { fieldX } from "./field-flip.js";
import { wrap } from "./lamprey-settle.js";
import { type LampreyPose, MOUTH } from "./lamprey-shape.js";
import { lampreyTowPoint } from "./lamprey-tow-grip.js";
import { type Layout, tileCY } from "./layout.js";
import { phaseInto } from "./phase-into.js";

/**
 * **The clock THE LAMPREY is posed off** (§41, *Animation*), six poses:
 * crawling as a worm, its head a tile a beat along the simulation's own
 * path, the body trailing back the way it came; bitten into a tile, the mouth
 * flattened onto it and the tail laid away from where it leaps next; leaping
 * in an arc to the next tile, the tail trailing the way it came; reared on a
 * tile full-face, the gullet showing; jerked up by a hit; and limp, falling
 * away down the field.
 *
 * **Where the mouth is comes from the simulation and nothing else**: the
 * tile, the tile it leapt from, the way the tail lies (`lampreyTailWay`), the
 * phase and the beat it began — so both phones draw it in one place. The
 * body's wave is the beat's, never the wall clock's, so it stands still with
 * the game paused.
 */

/** How high a leap arcs over the straight line between two tiles, in tiles, at its longest. */
const ARC = 1.2;
/** The mouth's tilt bitten into a tile, in the air, and full-face. */
const TILT_BITE = 0.55;
const TILT_LEAP = 0.75;
/** How hard the body bends at rest. */
const CURVE = 0.35;
/** How much of a beat a landing takes, the mouth settling into the tile. */
const LAND = 0.4;
/** Beats the body takes to swing off a crawl's trail onto the way its tail lies, stopped on a tile. */
const SETTLE = 2;
/**
 * How far the tail sweeps either side of the way it lies while the head
 * stays on a tile, and the beats a sweep there and back takes: half a turn
 * in all (the owner, 6 October 2026: *the tail moves in a radius of about
 * 180 degrees, the head stays where it is*). A thumb on it stills it.
 */
const SWEEP = Math.PI / 2;
const SWEEP_BEATS = 4;

const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/** The middle of a tile on this screen. */
function at(l: Layout, col: number, row: number): { x: number; y: number } {
  return { x: fieldX(l, col), y: tileCY(l, row) };
}

/** Which way a body leaves the mouth to lie along `(x, y)`, radians from straight up the field. */
const leanTo = (x: number, y: number): number => Math.atan2(x, -y);

/** The lean of a tail laid along the simulation's way, mirrored with the field. */
function tailLean(l: Layout, s: LampreyState): number {
  const way = lampreyTailWay(s);
  return leanTo(l.flip ? -way.x : way.x, way.y);
}

/**
 * In a tow, the way the body leaves the head for the tail's knob, however far
 * along its curve the head has been pulled and the tail pulled out: the eel
 * stretched between the two thumbs.
 */
function towLean(
  l: Layout,
  cfg: SimConfig,
  s: LampreyState,
  head: { x: number; y: number },
): number {
  const way = lampreyTailWay(s);
  const reach = (cfg.lampreyTailTiles * 1000 + lampreyTailPull(s)) / 1000;
  const here = at(l, s.col, s.row);
  const x = here.x + ((l.flip ? -way.x : way.x) * l.tile * reach) / 1000;
  const y = here.y + (way.y * l.tile * reach) / 1000;
  return leanTo(x - head.x, y - head.y);
}

/** The tail's sweep about the way it lies this instant, radians: off the beat, never the wall clock. */
const sweep = (beat: number, beatPhase: number): number =>
  SWEEP * Math.sin(((beat + beatPhase) * Math.PI * 2) / SWEEP_BEATS);

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
  const here = at(l, s.col, s.row);
  if (lampreyCrawling(s)) return crawlPose(l, s, beat, beatPhase, base);
  if (s.phase === "leap") {
    const k = smoothstep(Math.min(1, into / Math.max(1, cfg.lampreyLeapBeats)));
    const from = at(l, s.fromCol, s.fromRow);
    const span = Math.hypot(here.x - from.x, here.y - from.y);
    const lift = Math.min(ARC * l.tile, span * 0.35) * Math.sin(k * Math.PI);
    // The tail trails the way it came, straight back along the leap.
    const back = span > 0 ? leanTo(from.x - here.x, from.y - here.y) : 0;
    const x = lerp(from.x, here.x, k);
    const y = lerp(from.y, here.y, k) - lift;
    return { ...base, x, y, tilt: TILT_LEAP, lean: back, curve: CURVE * 0.6 };
  }
  if (s.phase === "bite") {
    const land = smoothstep(Math.min(1, into / LAND));
    const tilt = lerp(TILT_LEAP, TILT_BITE, land);
    // A head being pulled comes up off its tile with the thumb on it — in a tow, along its curve.
    const lift = (lampreyHeadPull(s) * l.tile) / 1000;
    const head =
      lampreyAsks(s) === "tow"
        ? lampreyTowPoint(l, cfg, s, s.towMilli)
        : { x: here.x, y: here.y - lift };
    const free = !lampreyTailPulls(s) && !lampreyTailHeld(s);
    const rest = lampreyAsks(s) === "tow" ? towLean(l, cfg, s, head) : tailLean(l, s);
    const lean = rest + (free ? sweep(beat, beatPhase) * land : 0);
    return crawledTo(l, s, into, { ...base, ...head, tilt, lean });
  }
  if (s.phase === "rearing") {
    const sway = Math.sin(wave * 0.5) * 0.15 * l.tile;
    const lean = tailLean(l, s) + sweep(beat, beatPhase);
    return crawledTo(l, s, into, { ...base, x: here.x + sway, y: here.y, tilt: 1, lean });
  }
  if (s.phase === "recoil") {
    const k = Math.min(1, into / Math.max(1, cfg.lampreyRecoilBeats));
    const jerk = Math.sin(k * Math.PI) * 1.2 * l.tile;
    const tilt = lerp(TILT_LEAP, 1, k);
    const lean = tailLean(l, s) + sweep(beat, beatPhase);
    return { ...base, x: here.x, y: here.y - jerk, tilt, lean, curve: CURVE * 2 };
  }
  const k = Math.min(1, into / Math.max(1, cfg.lampreySpentBeats));
  const y = here.y + k * k * (l.hullY - here.y);
  return { ...base, x: here.x, y, tilt: 1, curve: CURVE * (1 - k), spent: k };
}

/**
 * The head while it crawls: carried from the last place it was to where it is
 * over the beat it moved in, and still between; the body back toward where it
 * came from.
 */
function crawlPose(
  l: Layout,
  s: LampreyState,
  beat: number,
  beatPhase: number,
  base: Omit<LampreyPose, "x" | "y" | "tilt">,
): LampreyPose {
  const here = at(l, s.col, s.row);
  const prev = at(l, s.trailCol[0] ?? s.col, s.trailRow[0] ?? s.row);
  const k = beat === s.headBeat ? smoothstep(beatPhase) : 1;
  const x = lerp(prev.x, here.x, k);
  const y = lerp(prev.y, here.y, k);
  const back =
    here.x === prev.x && here.y === prev.y ? Math.PI : leanTo(prev.x - here.x, prev.y - here.y);
  const trail = s.trailCol.map((col, i) => at(l, col, s.trailRow[i] ?? s.row));
  return { ...base, x, y, tilt: TILT_LEAP, lean: back, curve: CURVE * 1.5, trail };
}

/**
 * A tile reached by crawling rather than leaping, for the first `SETTLE`
 * beats on it: the head carried over its last tile in the beat it arrives,
 * as the crawl was carrying it, and the body swung off the trail onto the
 * way the tail lies — so the worm stops where it was going instead of
 * jumping there (the owner, 9 October 2026). The simulation keeps the trail
 * until the eel sets off again.
 */
function crawledTo(l: Layout, s: LampreyState, into: number, pose: LampreyPose): LampreyPose {
  if (s.trailCol.length === 0 || into >= SETTLE) return pose;
  const trail = s.trailCol.map((col, i) => at(l, col, s.trailRow[i] ?? s.row));
  const prev = trail[0] ?? pose;
  const k = s.headBeat === s.phaseBeat && into < 1 ? smoothstep(into) : 1;
  const x = lerp(prev.x, pose.x, k);
  const y = lerp(prev.y, pose.y, k);
  // The turn, off the tile and the trail's far end and the way the tail is to
  // lie — none of which moves while it settles — the shorter way round.
  const here = at(l, s.col, s.row);
  const end = trail.at(-1) ?? prev;
  const from = Math.atan2(end.y - here.y, end.x - here.x);
  const to = tailLean(l, s) - Math.PI / 2;
  const settleTurn = wrap(to - from);
  return { ...pose, x, y, trail, settle: smoothstep(into / SETTLE), settleTurn };
}
