import {
  NO_BEARING,
  type SimConfig,
  VALVE_PINS,
  type ValveState,
  valveFrozen,
  valveTurning,
  valveWiping,
} from "@neon-spore/sim";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import { valvePinCentre } from "./valve-pins.js";
import { pulled, valveList, valvePinReach } from "./valve-pose.js";
import { onBearing, type Point, valveCentre, valveSocket, valveWheel } from "./valve-shape.js";

/**
 * **The two thumbs on THE VALVE** — the grip of its hands lane, and the part
 * that makes the drum answer a hand at all (§25, `sim/valve-hand.ts`).
 *
 * Its own page for `hasp-grip.ts`' reason: the wheel, the socket and the pins
 * a finger is answered at are the same `valveWheel`, `valveSocket` and
 * `valvePinCentre` the drawing paints, turned by the same list, and all this
 * file adds is *whether* the press counts.
 *
 * **The wheel is turned**, THE HASP's rim: the pilot's press anywhere on it
 * while it turns or holds, the hold carrying the hub with `turns` set, so a
 * move is a bearing about it and the press itself says `NO_BEARING` — a grab
 * claiming a bearing would wind the wheel by wherever the thumb landed. The
 * navigator's press there finds whatever is behind it, as a seat's thumb on
 * the other seat's half of THE HASP does; the simulation refuses it anyway.
 *
 * **The pin is tapped, drawn and rubbed**, one control for all three, and the
 * phase says which the press is. On the socket while the wheel holds, from
 * either seat — only the navigator's tap freezes, and the pilot's is taken
 * here rather than passed to the cannon behind, KEEL's rule. Frozen, on the
 * socket or the live pin, and every move after it a depth down the screen in
 * thousandths of a tile, which is what `valvePullMilli` is measured in. In
 * the story, on the socket: a tap for the jet, a thumb held for the brace and
 * the seal, and a rubbing thumb for the wipe, whose count its host keeps
 * (`rub.ts`).
 */

/** A thumb's worth past the wheel's rim: the whole wheel is the handle, THE HASP's reach. */
const RIM_REACH = 1.3;
/** The socket answered out to its window arc (`valve-marks.ts`), not only its dark hole. */
const SOCKET_REACH = 1.7;

/** The phases the pin takes a hand in: the freeze window, the pull, and the story's four. */
const PIN_PHASES: readonly ValveState["phase"][] = [
  "hold",
  "frozen",
  "jet",
  "brace",
  "wipe",
  "seal",
];

/** A point in the drum's own frame, where it stands on the canvas this frame: at home, turned by the list. */
function onDrum(l: Layout, cfg: SimConfig, s: ValveState, p: Point, beat: number, phase: number) {
  const c = valveCentre(l, cfg);
  const a = valveList(s, cfg, beat, phase);
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return { x: c.x + p.x * cos - p.y * sin, y: c.y + p.x * sin + p.y * cos };
}

/** The wheel as a circle where it stands, as far out as a thumb still has it. */
export function valveWheelCircle(
  l: Layout,
  cfg: SimConfig,
  s: ValveState,
  beat: number,
  beatPhase: number,
): Circle {
  const { at, r } = valveWheel(l);
  return { ...onDrum(l, cfg, s, at, beat, beatPhase), r: r * RIM_REACH };
}

/** The socket as a circle where it stands, out to its window's arc. */
export function valveSocketCircle(
  l: Layout,
  cfg: SimConfig,
  s: ValveState,
  beat: number,
  beatPhase: number,
): Circle {
  const { at, r } = valveSocket(l);
  return { ...onDrum(l, cfg, s, at, beat, beatPhase), r: r * SOCKET_REACH };
}

/** The live pin's plate, hanging long while the wheel is frozen, or `null` with none to pull. */
export function valveLivePinCircle(
  l: Layout,
  cfg: SimConfig,
  s: ValveState,
  beat: number,
  beatPhase: number,
): Circle | null {
  const i = pulled(s);
  if (!valveFrozen(s) || i >= VALVE_PINS) return null;
  const pin = valvePinCentre(l, i, VALVE_PINS, valvePinReach(s, i, beatPhase));
  return { ...onDrum(l, cfg, s, pin, beat, beatPhase), r: pin.r };
}

/**
 * The pin's one handle, for the ghost thumb and the cue: the live plate while
 * frozen, where the pull is drawn from, the socket in every other pin phase,
 * and `null` outside them — where `valvePinUnder` answers, one place a frame.
 */
export function valvePinHandle(
  l: Layout,
  cfg: SimConfig,
  s: ValveState,
  beat: number,
  beatPhase: number,
): Circle | null {
  if (!PIN_PHASES.includes(s.phase)) return null;
  return (
    valveLivePinCircle(l, cfg, s, beat, beatPhase) ?? valveSocketCircle(l, cfg, s, beat, beatPhase)
  );
}

/**
 * **Where the pilot's thumb is on the wheel's rim**, THE HASP's
 * `haspWheelHand`: at the bearing his hand last reported rather than the one
 * the wheel stands at, so a thumb working it back and forth is drawn going
 * round. Null with no hand on it, or while the wheel answers none.
 */
export function valveWheelHand(
  l: Layout,
  cfg: SimConfig,
  s: ValveState,
  beat: number,
  beatPhase: number,
): Circle | null {
  if (!valveTurning(s) || s.handMilli === NO_BEARING) return null;
  // The bearing is the screen's, taken about the hub where it stands
  // (`turnAbout`), so it is laid off the listed hub and not turned with it.
  const { at, r } = valveWheel(l);
  const hub = onDrum(l, cfg, s, at, beat, beatPhase);
  return { ...onBearing(hub, r, s.handMilli), r: r * 0.3 };
}

/**
 * The pilot's press on the wheel, while it turns or holds. `bossOf(field,
 * "valve")` is `null` on every wave without the drum.
 */
export function valveWheelUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "valve");
  if (s === null || field.seat !== 1 || !valveTurning(s)) return null;
  const wheel = valveWheelCircle(l, field.cfg, s, field.beat, field.beatPhase);
  if (!hitCircle(wheel, x, y)) return null;
  return {
    player: 1,
    command: { kind: "drag", target: "valveWheel", on: true, fromMilli: NO_BEARING },
    hold: {
      kind: "drag",
      target: "valveWheel",
      player: 1,
      originX: wheel.x,
      originY: wheel.y,
      turns: true,
    },
  };
}

/**
 * Either seat's press on the pin: the socket in every pin phase, the live
 * plate as well while frozen. The press is the tap — the edge the simulation
 * reads — and reports no depth, so a thumb that lands already claiming a draw
 * pulls nothing; a rub says nothing until its host has counted a turn.
 */
export function valvePinUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "valve");
  if (s === null || !PIN_PHASES.includes(s.phase)) return null;
  const { cfg, beat, beatPhase } = field;
  const pin = valveLivePinCircle(l, cfg, s, beat, beatPhase);
  const on =
    hitCircle(valveSocketCircle(l, cfg, s, beat, beatPhase), x, y) ||
    (pin !== null && hitCircle(pin, x, y));
  if (!on) return null;
  const seat = field.seat;
  const hold = { kind: "drag", target: "valvePin", player: seat, originX: x, originY: y } as const;
  if (valveWiping(s)) return { player: seat, command: null, hold: { ...hold, rub: true } };
  return {
    player: seat,
    command: { kind: "drag", target: "valvePin", on: true, fromMilli: 0, fromYMilli: 0 },
    hold,
  };
}
