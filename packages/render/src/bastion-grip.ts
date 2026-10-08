import {
  type BastionState,
  bastionLitStep,
  bastionPlateOf,
  bastionPlateWay,
  type DragTarget,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import {
  BASTION_PLATE_IN,
  BASTION_SHELL_TILES,
  bastionCentre,
  bastionPlateAngle,
} from "./bastion-shape.js";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { PULL_GRAB } from "./pull-knob.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The thumbs on THE BASTION** (§11.62): a knob on each side's next slab,
 * pulled out along the slab's own way, while the armour is lit; and a knob on
 * the rim the pilot turns the moon by, while the gun ring is lit.
 *
 * **A press is a message.** A slab's knob says `on` at nothing pulled, and
 * every move after it how far the thumb has come, in thousandths of a tile
 * across and down (`touch-move.ts`) — the simulation keeps only the part
 * along the slab's way. The rim is a lever (`rimFrom`): how far round the
 * ring the thumb has come, which turns the moon as far.
 *
 * **The partner's knob is pressed through**, THE LATCH's rule: a thumb on
 * it sends the partner's target from this seat and the simulation refuses
 * it aloud (`bastionWrong`), so a press never does nothing.
 */

/** Which of the three marks: the pilot's slabs, the navigator's, the rim. */
export type BastionMark = 0 | 1 | 2;

/** A mark's target on the wire. */
export function bastionTarget(mark: BastionMark): DragTarget {
  return mark === 0 ? "bastionPlateLeft" : mark === 1 ? "bastionPlateRight" : "bastionSpin";
}

/** The player whose thumb a mark takes: the slabs by side, the rim the pilot's. */
export function bastionMarkPlayer(mark: BastionMark): 1 | 2 {
  return mark === 1 ? 2 : 1;
}

/** Whether a mark is there to take hold of: its shell lit and, for a slab, one left on its side. */
export function bastionMarkTakes(s: BastionState, mark: BastionMark): boolean {
  const layer = bastionLitStep(s)?.layer;
  if (mark === 2) return layer === "ring";
  return layer === "plates" && bastionPlateOf(s, mark) >= 0;
}

/** A slab knob's radius. */
function knobR(l: Layout, cfg: SimConfig): number {
  return handleRadius(l, cfg);
}

/** Where `side`'s knob rests: in the middle of its next slab. */
export function bastionKnobRest(l: Layout, cfg: SimConfig, s: BastionState, side: 0 | 1): Circle {
  const c = bastionCentre(l, cfg);
  const i = Math.max(0, bastionPlateOf(s, side));
  const angle = bastionPlateAngle(i);
  const mid = ((BASTION_SHELL_TILES.plates + BASTION_PLATE_IN) / 2) * l.tile;
  return {
    x: c.x + Math.sin(angle) * mid,
    y: c.y - Math.cos(angle) * mid,
    r: knobR(l, cfg),
  };
}

/** Where `side`'s knob stands now: out along its slab's way as far as the thumb has it. */
export function bastionKnobAt(l: Layout, cfg: SimConfig, s: BastionState, side: 0 | 1): Circle {
  const rest = bastionKnobRest(l, cfg, s, side);
  const [wx, wy] = bastionPlateWay(Math.max(0, bastionPlateOf(s, side)));
  const out = (s.pullMilli[side] / 1000) * l.tile;
  return { ...rest, x: rest.x + (wx / 1000) * out, y: rest.y + (wy / 1000) * out };
}

/** The rim the pilot turns the moon by: round the centre at the sim's own radius. */
export function bastionRim(l: Layout, cfg: SimConfig): Circle {
  const c = bastionCentre(l, cfg);
  return { x: c.x, y: c.y, r: (cfg.bastionRimMilli / 1000) * l.tile };
}

/**
 * The rim's knob: under the moon to begin with, and carried round the rim by
 * as far as the moon has turned — the same turn, so it stays under the thumb.
 */
export function bastionRimKnob(l: Layout, cfg: SimConfig, s: BastionState): Circle {
  const rim = bastionRim(l, cfg);
  const a = Math.PI / 2 - (s.yawMilli / 1000) * (Math.PI / 180);
  return { x: rim.x + Math.cos(a) * rim.r, y: rim.y + Math.sin(a) * rim.r, r: knobR(l, cfg) };
}

/** Where a mark is standing now, for the ghost thumb and the guide's hand. */
export function bastionMarkAt(
  l: Layout,
  cfg: SimConfig,
  s: BastionState,
  mark: BastionMark,
): Circle {
  return mark === 2 ? bastionRimKnob(l, cfg, s) : bastionKnobAt(l, cfg, s, mark);
}

/** The mark under a point, of the three that take a thumb now, or null. */
function markUnder(l: Layout, cfg: SimConfig, s: BastionState, x: number, y: number) {
  for (const mark of [0, 1, 2] as const) {
    if (!bastionMarkTakes(s, mark)) continue;
    const at = bastionMarkAt(l, cfg, s, mark);
    if (hitCircle({ ...at, r: at.r * PULL_GRAB }, x, y)) return mark;
  }
  return null;
}

/** The handle where it stands, for `handleCircle`: null while its shell is not lit. */
export function bastionHandleStanding(
  l: Layout,
  world: World,
  s: BastionState,
  target: DragTarget,
): Circle | null {
  const mark: BastionMark =
    target === "bastionPlateLeft" ? 0 : target === "bastionPlateRight" ? 1 : 2;
  return bastionMarkTakes(s, mark) ? bastionMarkAt(l, world.cfg, s, mark) : null;
}

/** A press on a slab's knob or the rim's: this seat's takes hold, the partner's is refused by the simulation. */
export function bastionGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "bastion");
  if (s === null) return null;
  const mark = markUnder(l, field.cfg, s, x, y);
  if (mark === null) return null;
  const target = bastionTarget(mark);
  const seat = field.seat;
  if (mark !== 2) {
    return {
      player: seat,
      command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
      hold: { kind: "drag", target, player: seat, originX: x, originY: y },
    };
  }
  const rim = bastionRim(l, field.cfg);
  const lever = { cx: rim.x, cy: rim.y, r: rim.r, angle: Math.atan2(y - rim.y, x - rim.x) };
  return {
    player: seat,
    command: { kind: "drag", target, on: true, fromMilli: 0 },
    hold: { kind: "drag", target, player: seat, originX: x, originY: y, rim: lever },
  };
}

/** Whose thumb the mark under this point takes, for the test screen's one mouse (`desk-grab.ts`). */
export function bastionGripSeatAt(
  l: Layout,
  x: number,
  y: number,
  field: Field,
): 1 | 2 | undefined {
  const s = bossOf(field, "bastion");
  if (s === null) return undefined;
  const mark = markUnder(l, field.cfg, s, x, y);
  return mark === null ? undefined : bastionMarkPlayer(mark);
}
