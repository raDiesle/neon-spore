import type { Command } from "@neon-spore/sim";
import type { ControlId } from "./controls.js";

/**
 * What pressing a control *says*, for every control on every panel — one copy,
 * here, where the controls themselves are.
 *
 * **It was four copies.** `render/src/touch-lobe.ts` knew what a lobe sends, a
 * scene's `commandFor` knew what the seven standard ones send, and each round
 * with a panel of its own — THE GAUGE, SNAKE, PINBALL — built its slabs'
 * commands inline in its own listener under `apps/game`. Nothing tied them
 * together, and the failure that finally cost something was the quiet one: a
 * guide's rehearsal could not press a round's controls at all, so eight waves
 * with a boss in them were waves no tutorial could ever be written for.
 *
 * It belongs in `content` because a control is content — `controls.ts` is the
 * list, `control-sets.ts` is which panel carries which — and because both of
 * the other two packages already read this one. `Command` is a `sim` type, and
 * `content` already depends on `sim`; the direction stays what it always was.
 *
 * **A held control says two things.** `up` is what letting go sends, and it is
 * present on exactly the five that are held: the lance's thumb, the gauge's two
 * valve slabs and the bucket's two. Everything else is over the moment it
 * happens, and `up` is absent rather than a no-op, so a caller can tell a hold
 * from a press without a list of its own.
 */
export interface ControlPress {
  /** What a thumb going down on this control sends. */
  down: Command;
  /** And what lifting it sends, on a control that is held. */
  up?: Command;
}

/**
 * `col` is only read by the two strips, which name a place rather than a verb.
 * Every other control ignores it, which is why it is one argument rather than
 * an overload: a caller that has no column to give passes the one it is
 * standing on and gets the right answer anyway.
 */
export function controlPress(id: ControlId, col = 0): ControlPress {
  switch (id) {
    case "cannon":
      return { down: { kind: "cannonCol", col } };
    case "shield":
      return { down: { kind: "shieldCol", col } };
    case "fireRed":
      return { down: { kind: "fire", color: "red" } };
    case "fireCyan":
      return { down: { kind: "fire", color: "cyan" } };
    case "guard":
      return { down: { kind: "guard" } };
    case "intake":
      return { down: { kind: "intake" } };
    case "lance":
      return { down: { kind: "prime", on: true }, up: { kind: "prime", on: false } };
    // THE GAUGE. The two valve slabs are held — the needle travels for as long
    // as the thumb stays — and the call is one press by the other seat.
    case "gaugeLeft":
      return {
        down: { kind: "valve", on: true, dir: -1 },
        up: { kind: "valve", on: false, dir: -1 },
      };
    case "gaugeRight":
      return {
        down: { kind: "valve", on: true, dir: 1 },
        up: { kind: "valve", on: false, dir: 1 },
      };
    case "gaugeCall":
      return { down: { kind: "call" } };
    // THE FLEET. Every one of these is over the moment it happens: an arrow is
    // one square and the salvo is one shot, and a thumb resting on an arrow
    // that walked the sights would take the counting out of the fight.
    case "salvo":
      return { down: { kind: "salvo" } };
    case "aimLeft":
      return { down: { kind: "aim", dcol: -1, drow: 0 } };
    case "aimRight":
      return { down: { kind: "aim", dcol: 1, drow: 0 } };
    case "aimUp":
      return { down: { kind: "aim", dcol: 0, drow: -1 } };
    case "aimDown":
      return { down: { kind: "aim", dcol: 0, drow: 1 } };
    // SNAKE. A turn is a quarter turn from wherever the body is already
    // pointing, so it is a press and never a heading held down.
    case "snakeLeft":
      return { down: { kind: "snakeTurn", dir: "left" } };
    case "snakeRight":
      return { down: { kind: "snakeTurn", dir: "right" } };
    case "snakeFire":
      return { down: { kind: "snakeFire" } };
    case "snakeMaw":
      return { down: { kind: "snakeMaw" } };
    // PINBALL. The bucket's two are held for the same reason the valve is: the
    // thing moves for as long as the thumb is on it.
    case "pinLeft":
      return {
        down: { kind: "slide", on: true, dir: -1 },
        up: { kind: "slide", on: false, dir: -1 },
      };
    case "pinRight":
      return {
        down: { kind: "slide", on: true, dir: 1 },
        up: { kind: "slide", on: false, dir: 1 },
      };
    case "pinLatch":
      return { down: { kind: "latch" } };
    case "pinLaunch":
      return { down: { kind: "launch" } };
  }
}

/** Whether this control is one a thumb stays on. Derived from the table rather
 * than listed again: a control gains a hold by gaining an `up`. */
export function controlHeld(id: ControlId): boolean {
  return controlPress(id).up !== undefined;
}

/**
 * A held control's two commands, both of them present.
 *
 * It throws on one that is not held, and that is the right shape: a caller
 * asking a press for its release has made a mistake about what the control is,
 * not met a state the game can be in. The gauge's and the bucket's listeners
 * are the callers, and both of them already know they are holding something.
 */
export function controlHold(id: ControlId): { down: Command; up: Command } {
  const press = controlPress(id);
  if (!press.up) throw new Error(`${id} is not a control a thumb stays on`);
  return { down: press.down, up: press.up };
}
