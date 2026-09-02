import type { Command } from "@neon-spore/sim";

/**
 * The keys that belong to a round rather than to the field.
 *
 * **A round that is not the field does not borrow the field's verbs**
 * (`docs/spec/interludes.md`), so THE GAUGE, THE FLEET and SNAKE each have
 * their own commands — and at a desk that means their own keys. Split out of `keys.ts`
 * when THE FLEET's five pushed that file past its 250-line limit, along the
 * seam that was already there: next door is the ship, which is the same on
 * every wave, and this is whichever boss has taken the panel away.
 *
 * There are eleven more rounds designed and each will want a handful of these,
 * so the growth belongs in a file of its own rather than in the middle of the
 * cannon's repeat timer.
 *
 * Every one of them means nothing while an ordinary wave is running — the
 * simulation drops a `valve` or an `aim` that no boss is listening for — so
 * they cost nothing to send unconditionally.
 */

interface Press {
  player: 1 | 2;
  command: Command;
}

/**
 * The press. `null` for a key this file has nothing to say about, which is how
 * the caller's `switch` knows to fall through to its own default.
 *
 * Z and X hold THE GAUGE's valve as the pilot and C is the navigator's call.
 * U H N K walk THE FLEET's sights a square at a time as the navigator — a
 * rough diamond around J, close enough together to press without looking — and
 * R fires the pilot's salvo into whichever square they are standing on. The
 * sideways arrows are SNAKE's two quarter turns — the navigator's, who does
 * all of its driving — with V for the pilot's shot and B for his mouth.
 *
 * `snakeUp` is the one piece of state any of this asks about, and it is asked
 * for two keys only: at a desk the sideways arrows step between waves, and
 * while the body is moving they are the body's. A hand reaching for LEFT with
 * a snake in front of it must not skip the wave.
 */
export function roundKeyDown(code: string, snakeUp = false): Press | null {
  switch (code) {
    case "KeyZ":
      return { player: 1, command: { kind: "valve", on: true, dir: -1 } };
    case "KeyX":
      return { player: 1, command: { kind: "valve", on: true, dir: 1 } };
    case "KeyC":
      return { player: 2, command: { kind: "call" } };
    case "KeyU":
      return { player: 2, command: { kind: "aim", dcol: 0, drow: -1 } };
    case "KeyN":
      return { player: 2, command: { kind: "aim", dcol: 0, drow: 1 } };
    case "KeyH":
      return { player: 2, command: { kind: "aim", dcol: -1, drow: 0 } };
    case "KeyK":
      return { player: 2, command: { kind: "aim", dcol: 1, drow: 0 } };
    case "KeyR":
      return { player: 1, command: { kind: "salvo" } };
    case "ArrowLeft":
      return snakeUp ? { player: 2, command: { kind: "snakeTurn", dir: "left" } } : null;
    case "ArrowRight":
      return snakeUp ? { player: 2, command: { kind: "snakeTurn", dir: "right" } } : null;
    case "KeyV":
      return { player: 1, command: { kind: "snakeFire" } };
    case "KeyB":
      return { player: 1, command: { kind: "snakeMaw" } };
    default:
      return null;
  }
}

/**
 * The release, for the two that are *held*. Nothing in the simulation lets go
 * of the valve on its own, so the keyup has to be sent — and nothing else here
 * is held: a square is one press and a salvo is over the moment it happens.
 */
export function roundKeyUp(code: string): Press | null {
  if (code === "KeyZ") return { player: 1, command: { kind: "valve", on: false, dir: -1 } };
  if (code === "KeyX") return { player: 1, command: { kind: "valve", on: false, dir: 1 } };
  return null;
}
