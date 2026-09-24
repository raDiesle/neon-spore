import type { Command } from "@neon-spore/sim";
import {
  isBool,
  isColor,
  isDragTarget,
  isNonNegInt,
  isPull,
  isPulseLane,
  isSnakeTurn,
  isStep,
  optional,
} from "./command-fields.js";

/**
 * Every `Command` variant, checked field by field, before it ever reaches a
 * `Lockstep` or a simulation tick. `protocol.ts` used to hand `m.commands`
 * across with a bare cast — `{kind:"fire",color:"purple"}` or
 * `{kind:"cannonCol",col:NaN}` would ride a wire frame all the way into the
 * world. This is the one place that stops it, so a bad peer produces a
 * dropped packet here rather than a desync three layers down.
 *
 * The shape of each field — a colour, a column, a pull — is `command-fields.ts`;
 * this file is the switch that asks for them by name, and nothing else, so a
 * kind the simulation learns is one `case` here and no more.
 */

/**
 * One command, checked against its `kind`. An object carrying extra keys the
 * variant does not declare still passes — a newer peer may send more than
 * this build knows to read — but an unrecognised `kind` is rejected outright.
 */
export function decodeCommand(x: unknown): Command | null {
  if (!x || typeof x !== "object") return null;
  const c = x as Record<string, unknown>;
  switch (c.kind) {
    case "cannonCol":
      return isNonNegInt(c.col) ? { kind: "cannonCol", col: c.col } : null;
    case "shieldCol":
      return isNonNegInt(c.col) ? { kind: "shieldCol", col: c.col } : null;
    case "fire":
      return isColor(c.color) ? { kind: "fire", color: c.color } : null;
    case "guard":
      return { kind: "guard" };
    case "intake":
      return { kind: "intake" };
    case "grip":
      return isNonNegInt(c.id) ? { kind: "grip", id: c.id } : null;
    // THE BEATBOX's tap. `grip`'s shape word for word, because it names the
    // same thing — a body, by the id the simulation dealt out — and nothing
    // else: which beat a press was for is decided from the tick it arrives on,
    // on the side of the wire that owns the clock (`beatboxBeatFor`).
    case "tap":
      return isNonNegInt(c.id) ? { kind: "tap", id: c.id } : null;
    // THE MINE's blind tap, and the one press on this wire that names a
    // **place** on the field rather than a body: the seat sending it is
    // looking at an empty square and has no id to carry (`sim/mine.ts`).
    // Two whole tiles, checked the way `cannonCol` is — a peer that sent a
    // fraction or a negative would put a finger off the field, and the four
    // tiles round a mine are a hull hit, so a tile outside it is not a
    // harmless nonsense.
    case "tapTile":
      return isNonNegInt(c.col) && isNonNegInt(c.row)
        ? { kind: "tapTile", col: c.col, row: c.row }
        : null;
    case "prime":
      return isBool(c.on) && isColor(c.color) ? { kind: "prime", on: c.on, color: c.color } : null;
    case "brief":
      return optional(c.on, isBool) ? { kind: "brief", on: c.on as boolean | undefined } : null;
    case "guideStep":
      return optional(c.back, isBool)
        ? { kind: "guideStep", back: c.back as boolean | undefined }
        : null;
    case "valve":
      return isBool(c.on) && (c.dir === -1 || c.dir === 1)
        ? { kind: "valve", on: c.on, dir: c.dir }
        : null;
    case "call":
      return { kind: "call" };
    /**
     * **THE CLAW's arm and PINBALL's three, which this codec did not know
     * about at all** until an exhaustiveness guard was put on its own test
     * (`command-codec.test.ts`). Every one of them was rejected outright on
     * the wire, so on two devices the arm never left the hull and the bucket
     * never moved — while both phones type-checked, passed their own tests and
     * played perfectly well on their own. That is the whole failure mode the
     * `default` below has: a kind added to `sim` and not to this switch is
     * silence rather than an error.
     *
     * `slide` is `valve`'s shape word for word, because it is `valve`'s
     * gesture: a thing that moves for as long as a thumb is on it.
     */
    case "reach":
      return { kind: "reach" };
    case "slide":
      return isBool(c.on) && (c.dir === -1 || c.dir === 1)
        ? { kind: "slide", on: c.on, dir: c.dir }
        : null;
    case "latch":
      return { kind: "latch" };
    case "launch":
      return { kind: "launch" };
    // THE FLEET's two verbs. `aim` is a *step* and its two fields are each one
    // of three values, so a peer that sent a column would be rejected here
    // rather than teleporting the sights across the chart three layers down.
    case "aim":
      return isStep(c.dcol) && isStep(c.drow) ? { kind: "aim", dcol: c.dcol, drow: c.drow } : null;
    case "salvo":
      return { kind: "salvo" };
    case "snakeTurn":
      return isSnakeTurn(c.dir) ? { kind: "snakeTurn", dir: c.dir } : null;
    case "snakeFire":
      return { kind: "snakeFire" };
    case "snakeMaw":
      return { kind: "snakeMaw" };
    // THE PULSE's one verb. The lane is checked against the list rather than
    // taken as a number, for `snakeTurn`'s reason: a peer that sent an index
    // out of range would land a press in a lane that is not on the screen.
    case "pulseStep":
      return isPulseLane(c.lane) ? { kind: "pulseStep", lane: c.lane } : null;
    // THE SCOUT's two, and both are **held**: the peer is told when the finger
    // went on and when it came off, and the round runs on the state rather
    // than on the press (`scout-round.ts`). A dropped `on: false` would leave
    // the other device turning for ever, which is the same hazard `slide` and
    // `valve` have and the same answer — the bound is checked here, and the
    // sender repeats the state on the next frame it owns.
    case "scoutTurn":
      return isBool(c.on) && (c.dir === -1 || c.dir === 1)
        ? { kind: "scoutTurn", on: c.on, dir: c.dir }
        : null;
    case "scoutBurn":
      return isBool(c.on) ? { kind: "scoutBurn", on: c.on } : null;
    case "scoutMaw":
      return { kind: "scoutMaw" };
    // `fromMilli` is a **displacement**, so it is signed: a hand that carried
    // a handle to the left reports a negative number, and `isNonNegInt` here
    // dropped exactly those frames — a pull that worked on one device and
    // never crossed the wire. `isPull` is the bound instead, and it is a
    // magnitude bound rather than a floor.
    //
    // **`crank` is the one target whose `fromMilli` is not a displacement at
    // all**: it is a bearing round a circle, in thousandths of a turn, or
    // `NO_BEARING` for a hand going on or coming off (`sim/crank.ts`). Nothing
    // here has to know that — a signed whole number inside the magnitude bound
    // is exactly what both readings are, and the simulation is where a bearing
    // becomes rope. This wire carries what was said, not what it means.
    //
    // `id` is present only for a target that is a creature (THE LID's cord),
    // and optional for the two that are fixtures, so a peer on an older build
    // sending a drag without one is still understood. `fromYMilli` is optional
    // for the same reason turned the other way round: a hand may carry a
    // handle any way it likes now, and a peer from before that sends only the
    // x — which is what an absent y means.
    case "drag":
      return isDragTarget(c.target) &&
        isBool(c.on) &&
        isPull(c.fromMilli) &&
        optional(c.fromYMilli, isPull) &&
        optional(c.id, isNonNegInt)
        ? {
            kind: "drag",
            target: c.target,
            on: c.on,
            fromMilli: c.fromMilli,
            ...(c.fromYMilli === undefined ? {} : { fromYMilli: c.fromYMilli as number }),
            ...(c.id === undefined ? {} : { id: c.id as number }),
          }
        : null;
    // THE CHOIR's shake, and the only command on this wire that carries
    // nothing at all — not even a column. Whether a phone moved enough to
    // count is decided where the accelerometer is read, because that is the
    // only side with the numbers (`apps/game/src/shake.ts`), so what crosses
    // is the fact rather than the reading.
    case "shake":
      return { kind: "shake" };
    case "restart":
      return { kind: "restart" };
    // The lost screen's three answers, from either seat (`sim/wave-fail.ts`).
    // `retryGuide` is the same wave opened the way it opened the first time,
    // guide and gate before the field.
    case "retry":
      return { kind: "retry" };
    case "retryGuide":
      return { kind: "retryGuide" };
    case "quit":
      return { kind: "quit" };
    default:
      return null;
  }
}

/**
 * Commands one frame may carry. A tick is a sixtieth of a second and a hand has
 * two thumbs, so anything past a handful is not a player — it is a peer filling
 * the other device's memory, which Cloudflare will carry a mebibyte of per
 * message. Generous rather than tight, because the cost of being wrong here is
 * a dropped frame in a real game.
 */
export const MAX_COMMANDS_PER_FRAME = 32;

/**
 * A whole input frame. Returns `null` if any single command in it fails —
 * a half-applied frame (three good presses and a dropped fourth) is worse
 * than a dropped one: the two devices would agree the frame arrived and
 * silently disagree about what it said. An oversized frame goes the same way,
 * and for the same reason: whole, or not at all.
 */
export function decodeCommands(x: unknown): Command[] | null {
  if (!Array.isArray(x) || x.length > MAX_COMMANDS_PER_FRAME) return null;
  const out: Command[] = [];
  for (const item of x) {
    const c = decodeCommand(item);
    if (!c) return null;
    out.push(c);
  }
  return out;
}
