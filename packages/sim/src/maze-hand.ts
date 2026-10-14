import { mazeBottomCol } from "./maze.js";
import { mazeRound } from "./maze-controls.js";
import { mazeRubbed, mazeRubSeatTurns } from "./maze-rub.js";
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
 * finished by rubbing it loose: **either seat's thumb** may take the heart,
 * and what it sends is how many times it has turned back since it went down
 * (`render/rub.ts`), so a message coalesced away is made good by the next.
 * Each seat's fresh turns go into its own half, up to half of
 * `mazeHeartTurns` (`maze-rub.ts`); a heart held past `mazeGripBeats` lets go
 * of the shot, which comes back down the column as its own blood
 * (`mazeWrong`, `slip`).
 *
 * It was the navigator's pull down against the pilot's hand braced on the
 * string, then both seats shaking it about its room by distance; the owner,
 * 14 October 2026, made it the game's one RUB *to have less variants and
 * consistency*.
 */
export function mazeHeartHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "mazeHeart") return;
  const m = mazeRound(world);
  if (m === null) return;
  const bit = player === 1 ? 1 : 2;
  const i = player - 1;
  if (!command.on) {
    lift(world, m, bit, i);
    return;
  }
  if (m.phase !== "grip") return;
  const count = Math.max(0, command.id ?? 0);
  if ((m.gripSeats & bit) === 0) {
    m.gripSeats |= bit;
    m.gripHeard[i] = count;
    world.events.push({ type: "mazeGrip", col: mazeBottomCol(world.cfg), on: true });
    return;
  }
  const heard = m.gripHeard[i] ?? 0;
  const fresh = count >= heard ? count - heard : count;
  m.gripHeard[i] = count;
  if (fresh === 0) return;
  const was = m.gripTurns[i] ?? 0;
  m.gripTurns[i] = Math.min(mazeRubSeatTurns(world.cfg), was + fresh);
  if (mazeRubbed(world.cfg, m)) mazeRight(world, m);
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
 * heart before the wheel was up. What it rubbed stays rubbed; the next thumb
 * down starts its count again from nought.
 */
function lift(world: World, m: MazeState, bit: number, i: number): void {
  if ((m.gripSeats & bit) === 0) return;
  m.gripSeats &= ~bit;
  m.gripHeard[i] = 0;
  world.events.push({ type: "mazeGrip", col: mazeBottomCol(world.cfg), on: false });
}
