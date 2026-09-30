import type { DragTarget, GrindstoneState, SimConfig } from "@neon-spore/sim";
import {
  grindstoneArrived,
  grindstoneDepth,
  grindstoneFree,
  grindstoneShut,
} from "./grindstone-pose.js";
import {
  grindstoneAxleAt,
  grindstoneAxleR,
  grindstoneBolt,
  grindstoneCut,
  grindstoneFlatHalf,
  grindstoneJawTurn,
  grindstonePadAt,
  grindstonePadR,
  turnedAbout,
} from "./grindstone-shape.js";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The flats and the jaws on THE GRINDSTONE** — the hands lane that makes the
 * wheel answer a thumb at all (§11.50, `bosses-choreographed.md` §33).
 *
 * Its own page for `trivet-grip.ts`' reason: the wheel a thumb is answered on
 * is the one `drawGrindstone` puts on the screen this frame — dropped in as it
 * arrives, the caliper swung as far as it is shut — and all this file adds is
 * *which* of a seat's two things a press is on.
 *
 * **Geometry says whose is whose, on both phones.** The left flat and the left
 * jaw are Player 1's, the right Player 2's (`sim/grindstone-hand.ts`); both
 * screens draw the whole wheel, and a thumb on the other seat's side falls
 * through to whatever is behind it, as the simulation would refuse it anyway.
 *
 * **A press is whichever of the two it is nearer**, out to `REACH`: the flat's
 * face as a segment, the jaw as its two pads. The pads sit a quarter of a tile
 * apart — a centimetre of glass would not hold two thumbs on them — so which
 * pad a finger is, is the order it landed in, THE TRIVET's chord
 * (`chord.ts`); and a thumb on the flat takes a rub, whose turns its host
 * counts (`rub.ts`).
 *
 * **The wheel takes a hand until it spins free**: the simulation keeps the
 * pads whenever the wheel is present, so a clamp already down when the step
 * lights is counted from its first beat.
 */

/** How far from a flat or a pad a thumb is still on it, in tiles. */
const REACH = 0.9;

type Seat = 1 | 2;

/** Whether the wheel is there to be touched: every phase but the fall. */
export function grindstoneTakesHand(s: GrindstoneState): boolean {
  return s.phase !== "free";
}

/** A seat's side of the wheel: 0 the pilot's, on the left. */
function sideOf(seat: Seat): 0 | 1 {
  return seat === 1 ? 0 : 1;
}

interface Standing {
  /** The middle of the flat's face and its half-height. */
  flat: { x: number; y: number; half: number };
  /** The jaw's pads, turned as far as the caliper is slack. */
  pads: { x: number; y: number }[];
}

/**
 * The axle as a circle where it stands this frame, dropped in and freed as it
 * is drawn — what a shot is fired at once the caliper is locked, and the
 * circle the cue's crosshair rides (`boss-cue-read-zj.ts`).
 */
export function grindstoneAxleStanding(
  l: Layout,
  cfg: SimConfig,
  s: GrindstoneState,
  beat: number,
  beatPhase: number,
): Circle {
  const arrived = grindstoneArrived(s, cfg, beat, beatPhase);
  const at = grindstoneAxleAt(l, cfg, arrived, grindstoneFree(s, cfg, beat, beatPhase));
  return { ...at, r: grindstoneAxleR(l) };
}

/** Where a seat's flat and pads stand this frame, in canvas pixels. */
function standing(
  l: Layout,
  field: Pick<Field, "cfg">,
  s: GrindstoneState,
  seat: Seat,
  beat: number,
  beatPhase: number,
): Standing {
  const side = sideOf(seat);
  const cfg = field.cfg;
  const at = grindstoneAxleAt(
    l,
    cfg,
    grindstoneArrived(s, cfg, beat, beatPhase),
    grindstoneFree(s, cfg, beat, beatPhase),
  );
  const cut = grindstoneCut(l, grindstoneDepth(s, side));
  const shut = grindstoneShut(field, s, beat, beatPhase);
  const bolt = grindstoneBolt(l, shut);
  const turn = grindstoneJawTurn(side, shut);
  const pads = [0, 1].map((k) => {
    const p = turnedAbout(grindstonePadAt(l, side, k, shut), bolt, turn);
    return { x: at.x + p.x, y: at.y + p.y };
  });
  const flat = { x: at.x + (side === 0 ? -cut : cut), y: at.y, half: grindstoneFlatHalf(l, cut) };
  return { flat, pads };
}

/**
 * A press on this seat's flat or jaw: a rubbing thumb, or one finger of the
 * jaw's chord, held and **saying nothing** — what it says is counted once it is
 * down. `bossOf(field, "grindstone")` is `null` on every wave without it.
 */
export function grindstoneGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "grindstone");
  if (s === null || !grindstoneTakesHand(s)) return null;
  const seat = field.seat;
  const { flat, pads } = standing(l, field, s, seat, field.beat, field.beatPhase);
  const along = Math.max(-flat.half, Math.min(flat.half, y - flat.y));
  const toFlat = Math.hypot(x - flat.x, y - flat.y - along);
  const toJaw = Math.min(...pads.map((p) => Math.hypot(x - p.x, y - p.y)));
  if (Math.min(toFlat, toJaw) > REACH * l.tile) return null;
  const jaw = toJaw < toFlat;
  const hold = {
    kind: "drag",
    target: grindTarget(seat, jaw),
    player: seat,
    originX: x,
    originY: y,
  };
  return {
    player: seat,
    command: null,
    hold: jaw ? { ...hold, kind: "drag", chord: true } : { ...hold, kind: "drag", rub: true },
  };
}

/** A seat's flat or jaw, by name. */
function grindTarget(seat: Seat, jaw: boolean): DragTarget {
  if (jaw) return seat === 1 ? "grindJawLeft" : "grindJawRight";
  return seat === 1 ? "grindFlatLeft" : "grindFlatRight";
}

/**
 * A seat's flat or jaw as a circle, where it stands this frame — which is where
 * the ghost thumb stands and what `handleCircle` answers. The press is taken
 * out to `REACH` (`grindstoneGripUnder`); this is the part it names.
 */
export function grindstoneStanding(
  l: Layout,
  cfg: SimConfig,
  s: GrindstoneState,
  target: "grindFlatLeft" | "grindFlatRight" | "grindJawLeft" | "grindJawRight",
  beat: number,
  beatPhase: number,
): Circle {
  const seat: Seat = target.endsWith("Left") ? 1 : 2;
  const { flat, pads } = standing(l, { cfg }, s, seat, beat, beatPhase);
  if (target.startsWith("grindFlat")) return { x: flat.x, y: flat.y, r: flat.half };
  const [a, b] = pads;
  const r = grindstonePadR(l) * 2;
  if (!a || !b) return { x: flat.x, y: flat.y, r };
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, r };
}
