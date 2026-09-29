import { mazeBottomCol } from "./maze.js";
import { mazeRound } from "./maze-controls.js";
import { mazeShakeBy, mazeShaken } from "./maze-shake.js";
import type { MazeState } from "./maze-state.js";
import { mazeRight } from "./maze-verdict.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **Thumbs on THE MAZE's heart**, off the wire, on the tick.
 *
 * The round's third state and its second gesture on the picture
 * (`.claude/skills/new-boss` §6.2). A shot of the right colour that reaches
 * the middle is *held* there (`grip`, `maze-round.ts`), and the wheel is
 * finished by shaking it loose — the owner, 29 September 2026: *both players
 * need to pull it in any direction more like shaking*. So **either seat's
 * thumb** may take the heart, and each carries it by the change in its own
 * displacement since its last message, both axes, the way the string turns
 * the wheel (`maze-controls.ts`): a message coalesced away is made good by the
 * next. Where the heart may go, and how much going tears it out, is
 * `maze-shake.ts`; a heart held past `mazeGripBeats` lets go of the shot,
 * which comes back down the column as its own blood (`mazeWrong`, `slip`).
 *
 * It used to be the navigator's pull down against the pilot's hand braced on
 * the string. The owner found it unclear *how it should pull and in which
 * direction*, and the answer now is: any, both of you.
 */
export function mazeHeartHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "mazeHeart") return;
  const m = mazeRound(world);
  if (m === null) return;
  const bit = player === 1 ? 1 : 2;
  const at = (player - 1) * 2;
  if (!command.on) {
    lift(world, m, bit);
    return;
  }
  if (m.phase !== "grip") return;
  const x = Math.round(command.fromMilli);
  const y = Math.round(command.fromYMilli ?? 0);
  if ((m.gripSeats & bit) === 0) {
    // The press is where this thumb grabbed: nothing moves until it does.
    m.gripSeats |= bit;
    m.gripFromMilli[at] = x;
    m.gripFromMilli[at + 1] = y;
    world.events.push({ type: "mazeGrip", col: mazeBottomCol(world.cfg), on: true });
    return;
  }
  const dx = x - (m.gripFromMilli[at] ?? x);
  const dy = y - (m.gripFromMilli[at + 1] ?? y);
  m.gripFromMilli[at] = x;
  m.gripFromMilli[at + 1] = y;
  const moved = mazeShakeBy(world.cfg, m, dx, dy);
  m.gripShookMilli[player - 1] = (m.gripShookMilli[player - 1] ?? 0) + moved;
  if (mazeShaken(world.cfg, m)) mazeRight(world, m);
}

/**
 * Whether the round asks a thumb of the heart — either seat's: while it holds
 * the shot. What THE MAZE's rings read rather than re-derive
 * (`render/maze-marks.ts`).
 */
export function mazeHeartAsks(m: MazeState): boolean {
  return m.phase === "grip";
}

/**
 * A thumb leaving the heart, answered whatever phase the round is in — a
 * thumb still counted as on it after the verdict would be on the next wheel's
 * heart before the wheel was up. What it shook stays shaken; a heart with no
 * thumb left on it springs back to the middle of its room.
 */
function lift(world: World, m: MazeState, bit: number): void {
  if ((m.gripSeats & bit) === 0) return;
  m.gripSeats &= ~bit;
  if (m.gripSeats === 0) {
    m.gripXMilli = 0;
    m.gripYMilli = 0;
  }
  world.events.push({ type: "mazeGrip", col: mazeBottomCol(world.cfg), on: false });
}
