import {
  type DragTarget,
  type HydraState,
  hydraEyeOpen,
  hydraHeadOf,
  hydraLitStep,
  hydraPerSide,
  hydraUnwindWay,
  hydraWayOf,
  rimLapMilli,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import {
  type At,
  EYE_HEAD_TILES,
  hydraBiteAt,
  hydraCoilAt,
  hydraCoilRing,
  hydraEyeAt,
  hydraEyeHeadAt,
  hydraSideSign,
} from "./hydra-shape.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PULL_GRAB } from "./pull-knob.js";
import { PULL_TRACK_W, type PullTrack } from "./pull-track.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The thumbs on THE HYDRA** (§11.64), a side each and a kind a level:
 *
 * - **A neck**, while the biting heads are lit: a knob on the side's next
 *   neck, just over its head, carried across it the way its arrow points —
 *   the one generic PULL, sideways (`sim/hydra-hand.ts`).
 * - **A coil**, while the coils are: THE MAZE's lever on the coil's ring,
 *   turned round the way it unwinds — the pilot's anticlockwise, the
 *   navigator's clockwise — its knob carried round as the coil comes off.
 * - **An eye**, while the eyes are: a tap anywhere on the side's head of
 *   eyes, an edge. It asks only while the eye is open, and a tap on a shut
 *   one is still sent, for the simulation to refuse aloud (`hydraMiss`).
 *
 * **The partner's mark is pressed through**, THE LATCH's rule: a thumb on
 * it sends the partner's target from this seat and the simulation refuses
 * it aloud (`hydraWrong`), so a press never does nothing.
 *
 * The maws take no thumb: they are answered with the cannon.
 *
 * **Its seam, when it needs room**: the places — the knobs, the rims and the
 * eye, everything above `hydraMarkAt` — go to a page of their own, and the
 * press stays here.
 */

/** Which of the six marks: the pilot's neck, the navigator's; the coils; the eyes. */
export type HydraMark = 0 | 1 | 2 | 3 | 4 | 5;

export const HYDRA_MARKS = [0, 1, 2, 3, 4, 5] as const;

/** The kinds of head a mark is on, by its pair. */
const KINDS = ["bite", "coil", "eye"] as const;

/** How far over its head a neck's knob rests, in tiles: on the neck, clear of the jaws. */
const NECK_KNOB_TILES = 0.6;

/** A mark's side: nought the pilot's, on the left. */
export function hydraMarkSide(mark: HydraMark): 0 | 1 {
  return (mark % 2) as 0 | 1;
}

/** The kind of head a mark is on. */
export function hydraMarkKind(mark: HydraMark): (typeof KINDS)[number] {
  return KINDS[mark >> 1] ?? "bite";
}

/** A mark's target on the wire. */
export function hydraMarkTarget(mark: HydraMark): DragTarget {
  const left = hydraMarkSide(mark) === 0;
  const kind = hydraMarkKind(mark);
  if (kind === "coil") return left ? "hydraCoilLeft" : "hydraCoilRight";
  if (kind === "eye") return left ? "hydraEyeLeft" : "hydraEyeRight";
  return left ? "hydraNeckLeft" : "hydraNeckRight";
}

/** The player whose thumb a mark takes: by its side. */
export function hydraMarkPlayer(mark: HydraMark): 1 | 2 {
  return hydraMarkSide(mark) === 0 ? 1 : 2;
}

/** Whether a mark takes a thumb: its kind of head lit, and a head of it left on its side. */
export function hydraMarkTakes(s: HydraState, mark: HydraMark): boolean {
  return hydraLitStep(s)?.head === hydraMarkKind(mark) && hydraHeadOf(s, hydraMarkSide(mark)) >= 0;
}

/** Whether a mark asks for its thumb now: it takes one, and an eye is open. */
export function hydraMarkAsks(s: HydraState, mark: HydraMark): boolean {
  if (!hydraMarkTakes(s, mark)) return false;
  return hydraMarkKind(mark) !== "eye" || hydraEyeOpen(s, hydraMarkSide(mark));
}

/**
 * Where `side`'s neck knob rests: just over where its next head hangs as the
 * window opens. It stays there while the head comes down past it, on the
 * neck run through it — a mark is held still while it asks (`boss-hush.test.ts`).
 */
export function hydraNeckRest(l: Layout, cfg: SimConfig, s: HydraState, side: 0 | 1): Circle {
  const step = s.steps[s.cursor];
  const i = Math.max(0, hydraHeadOf(s, side));
  const head = step === undefined ? hydraCoilAt(l, cfg, side) : hydraBiteAt(l, cfg, step, i, 0);
  return { x: head.x, y: head.y - NECK_KNOB_TILES * l.tile, r: handleRadius(l, cfg) };
}

/** Which way across `side`'s next neck is cut, on the screen: -1 left, 1 right. */
export function hydraNeckWay(s: HydraState, side: 0 | 1): -1 | 1 {
  const step = s.steps[s.cursor];
  return step === undefined ? -1 : hydraWayOf(step, Math.max(0, hydraHeadOf(s, side)));
}

/** Where `side`'s neck knob stands: as far across as the cut has gone. */
export function hydraNeckKnob(l: Layout, cfg: SimConfig, s: HydraState, side: 0 | 1): Circle {
  const rest = hydraNeckRest(l, cfg, s, side);
  const across = s.down[side] ? (s.cutMilli[side] / 1000) * l.tile : 0;
  return { ...rest, x: rest.x + hydraNeckWay(s, side) * across };
}

/** `side`'s neck's track: straight across, the cut's length, the way its arrow points. */
export function hydraNeckTrack(l: Layout, cfg: SimConfig, s: HydraState, side: 0 | 1): PullTrack {
  const rest = hydraNeckRest(l, cfg, s, side);
  const end = rest.x + hydraNeckWay(s, side) * (cfg.hydraCutMilli / 1000) * l.tile;
  return { pts: [rest, { x: end, y: rest.y }], w: rest.r * PULL_TRACK_W };
}

/** The ring `side`'s coil's lever turns round, at the simulation's own radius. */
export function hydraCoilRim(l: Layout, cfg: SimConfig, side: 0 | 1): Circle {
  const c = hydraCoilAt(l, cfg, side);
  return { x: c.x, y: c.y, r: hydraCoilRing(cfg) * l.tile };
}

/** The coil's knob: on top of its ring to begin with, carried round as far as the coil has come off. */
export function hydraCoilKnob(l: Layout, cfg: SimConfig, s: HydraState, side: 0 | 1): Circle {
  const rim = hydraCoilRim(l, cfg, side);
  const turned = s.unwoundMilli[side] / rimLapMilli(cfg.hydraCoilRimMilli);
  const a = -Math.PI / 2 + hydraUnwindWay(side) * turned * Math.PI * 2;
  return {
    x: rim.x + Math.cos(a) * rim.r,
    y: rim.y + Math.sin(a) * rim.r,
    r: handleRadius(l, cfg),
  };
}

/** `side`'s head of eyes, where a tap lands: the whole bulb. */
function eyeHead(l: Layout, cfg: SimConfig, side: 0 | 1): Circle {
  const at = hydraEyeHeadAt(l, cfg, side);
  return { ...at, r: EYE_HEAD_TILES * l.tile };
}

/** The eye awake on `side`'s head, where its mark stands. */
export function hydraEyeMark(l: Layout, cfg: SimConfig, s: HydraState, side: 0 | 1): Circle {
  const step = s.steps[s.cursor];
  const head = hydraEyeHeadAt(l, cfg, side);
  const n = step === undefined ? 1 : hydraPerSide(step);
  const k = Math.max(0, hydraHeadOf(s, side)) - side * n;
  const at: At = hydraEyeAt(l, head, hydraSideSign(l, cfg, side), k, n);
  return { ...at, r: handleRadius(l, cfg) };
}

/** Where `mark` stands now. */
export function hydraMarkAt(l: Layout, cfg: SimConfig, s: HydraState, mark: HydraMark): Circle {
  const side = hydraMarkSide(mark);
  const kind = hydraMarkKind(mark);
  if (kind === "coil") return hydraCoilKnob(l, cfg, s, side);
  if (kind === "eye") return hydraEyeMark(l, cfg, s, side);
  return hydraNeckKnob(l, cfg, s, side);
}

/** The mark under a point, of those that take a thumb now, or null. */
function markUnder(l: Layout, cfg: SimConfig, s: HydraState, x: number, y: number) {
  for (const mark of HYDRA_MARKS) {
    if (!hydraMarkTakes(s, mark)) continue;
    if (hydraMarkKind(mark) === "eye") {
      if (hitCircle(eyeHead(l, cfg, hydraMarkSide(mark)), x, y)) return mark;
      continue;
    }
    const at = hydraMarkAt(l, cfg, s, mark);
    if (hitCircle({ ...at, r: at.r * PULL_GRAB }, x, y)) return mark;
  }
  return null;
}

/** The handle where it stands, for `handleCircle`: null while its kind of head is not lit. */
export function hydraHandleStanding(
  l: Layout,
  world: World,
  s: HydraState,
  target: DragTarget,
): Circle | null {
  const mark = HYDRA_MARKS.find((m) => hydraMarkTarget(m) === target);
  if (mark === undefined || !hydraMarkTakes(s, mark)) return null;
  return hydraMarkAt(l, world.cfg, s, mark);
}

/** A press on a neck's knob, a coil's lever or a head of eyes: this seat's takes hold, the partner's is refused by the simulation. */
export function hydraGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "hydra");
  if (s === null) return null;
  const mark = markUnder(l, field.cfg, s, x, y);
  if (mark === null) return null;
  const target = hydraMarkTarget(mark);
  const player = field.seat;
  const hold = { kind: "drag", target, player, originX: x, originY: y } as const;
  if (hydraMarkKind(mark) !== "coil") {
    return {
      player,
      command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
      hold,
    };
  }
  // Read round the coil clockwise, the simulation's way (`rimFrom`'s `over`).
  const rim = hydraCoilRim(l, field.cfg, hydraMarkSide(mark));
  const angle = Math.atan2(y - rim.y, x - rim.x);
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0 },
    hold: { ...hold, rim: { cx: rim.x, cy: rim.y, r: rim.r, angle, over: true } },
  };
}

/** Whose thumb the mark under this point takes, for the test screen's one mouse (`desk-grab.ts`). */
export function hydraGripSeatAt(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const s = bossOf(field, "hydra");
  if (s === null) return undefined;
  const mark = markUnder(l, field.cfg, s, x, y);
  return mark === null ? undefined : hydraMarkPlayer(mark);
}
