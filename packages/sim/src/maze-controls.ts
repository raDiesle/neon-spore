import { mazeBottomCol, mazeDragTurn, mazeWrap } from "./maze.js";
import {
  mazeBreakDetent,
  mazeClickIntoColumn,
  mazeLetGo,
  mazeSettleNow,
  stepMazeCatch,
} from "./maze-catch.js";
import { enterMazePhase, type MazeState, mazeCurrent } from "./maze-state.js";
import type { Color, Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE MAZE's two verbs, and they are the whole of what the pair can do.
 *
 * One turns and cannot fire; the other fires and cannot turn. With the light
 * on both screens and the shot's journey on both screens there is no knowledge
 * split left in this round at all (`maze.ts`), so the verbs are what the pair
 * has to divide — which is why both of them live in one file rather than in
 * the round's clock next door. Neither seat can reach the other's.
 */

/** The round, if it is the one running. Narrowing in one place rather than six. */
export function mazeRound(world: World): MazeState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "maze" ? boss : null;
}

/**
 * The string, and the two gestures that pull it.
 *
 * **`valve` is the thumb**, THE GAUGE's own control and deliberately the same
 * one: the same held verb answered by the same seat, and a second command kind
 * for "turn something" would be a second vocabulary for a thing the pair
 * already understands. It is how Z and X drive the wheel at a desk.
 *
 * **`drag` is the hand on the handle**, and it is the gesture the round is
 * meant to be played with: grab the circle on the string and pull. The two are
 * not alternatives to be chosen between — a hand landing on the string takes
 * the wheel off whatever the thumb was holding, and that is all the
 * arbitration either of them needs.
 *
 * The seat check is a rule of the simulation rather than a coat of paint, for
 * the reason THE GAUGE's is: a player 2 who could turn would be playing both
 * halves of a round whose whole content is that they cannot.
 */
export function mazeStringHeard(world: World, player: 1 | 2, command: Command): void {
  const m = mazeRound(world);
  if (m === null) return;
  if (player !== 1) {
    // The navigator's hand on the string while the round asks the pilot's is
    // refused and said, once — the press, never its lift (`mazeRefuse`).
    const press = command.kind === "drag" && command.target === "mazeString" && command.on;
    if (press && mazeStringAsks(m)) mazeRefuse(world, player);
    return;
  }
  if (command.kind === "valve") valveHeard(m, command.on, command.dir);
  else if (command.kind === "drag" && command.target === "mazeString") {
    dragHeard(world, m, command.on, command.fromMilli);
  }
}

/**
 * Whether the round asks a hand of the string — the pilot's, and only his:
 * while the wheel can be turned. Under `grip` his hand is on the heart with
 * hers (`maze-hand.ts`). What THE MAZE's rings read rather than re-derive
 * (`render/maze-marks.ts`).
 */
export function mazeStringAsks(m: MazeState): boolean {
  return m.phase === "read";
}

/**
 * A press on the string the round asks of the other seat, said so the mark
 * can wash red and the wrong seat hear it — and nothing else: the wheel does
 * not turn. `player` is the seat that pressed. Only the string is ever
 * refused; the heart is both seats' (`maze-hand.ts`).
 */
export function mazeRefuse(world: World, player: 1 | 2): void {
  world.events.push({ type: "mazeRefuse", col: mazeBottomCol(world.cfg), player });
}

/** The thumb, unchanged. */
function valveHeard(m: MazeState, on: boolean, dir: -1 | 1): void {
  if (m.phase !== "read") return;
  if (!on) {
    if (m.turn === dir) m.turn = 0;
    return;
  }
  mazeBreakDetent(m);
  m.turn = dir;
}

/**
 * The hand, and the whole of the new gesture.
 *
 * `fromMilli` is how far the hand has come from where it grabbed, in
 * thousandths of a tile — a displacement and not a place, and `Command` in
 * `types.ts` has why. The wheel moves by the **change** in it since the last
 * message, which is the same total as measuring the whole way back to the grab
 * and is what makes a click cost nothing to bookkeep: the wheel stops on the
 * column, and the hand's position there is already the new zero. A message
 * coalesced away is made good by the next one, because what arrives is always
 * the distance from the grab rather than a step.
 *
 * The lift is answered whatever phase the round is in. A hand that let go
 * while the shot was travelling is a hand that let go, and one left standing
 * would measure the next round's first pull against a wheel two phases old.
 *
 * **Under `grip` the string is let alone**: the heart holds the shot until
 * both thumbs shake it loose (`maze-hand.ts`), and a wheel that turned under
 * a held shot would be a wheel the pair had not agreed on.
 */
function dragHeard(world: World, m: MazeState, on: boolean, fromMilli: number): void {
  if (!on) {
    // The knob stays where it was let go, and coasts on a little unless it
    // is in a click (`maze-catch.ts`). Only a hand that was on it lets go.
    if (m.dragging && m.phase === "read") mazeLetGo(world, m);
    m.dragging = false;
    m.dragFromMilli = 0;
    return;
  }
  if (m.phase !== "read") return;
  const wheel = mazeCurrent(m);
  if (wheel === null) return;
  if (!m.dragging) {
    m.dragging = true;
    m.dragFromMilli = fromMilli;
    m.leverGrabMilli = m.leverMilli;
    m.leverVelMilli = 0;
    // A hand on the string takes it off the thumb and stops a coast. Two
    // pulls at once is not a thing either player can see, and the hand is
    // the one they can point at.
    m.turn = 0;
    m.glideMilli = 0;
    return;
  }
  const moved = fromMilli - m.dragFromMilli;
  // In a click, the hand has to carry on past it before anything moves — and
  // `dragFromMilli` is deliberately left where the click caught it, so the
  // measurement is from the detent and not from wherever the hand has crept
  // to since. Without this a resting hand's own jitter took a pair's column
  // back off them between agreeing on it and saying it.
  const locked = m.lockedWay >= 0;
  if (locked && Math.abs(moved) < world.cfg.mazeDragBreakMilli) return;
  m.dragFromMilli = fromMilli;
  m.leverMilli += moved;
  m.leverVelMilli = moved;
  const turned = mazeDragTurn(world.cfg, moved);
  if (turned === 0) return;
  mazeBreakDetent(m);
  // Out of a click the wheel eases after the hand rather than jumping the
  // whole break distance in a tick; anywhere else it is under the hand.
  if (locked) m.settleMilli = turned;
  else m.angleMilli = mazeWrap(m.angleMilli + turned);
  mazeClickIntoColumn(world, m, wheel);
}

/**
 * The wheel, one tick further round.
 *
 * On the tick and not on the beat, for the reason THE GAUGE's needle is: a
 * string that only answered on the beat would feel like a queue rather than a
 * hand on something. The click is checked after the step and never before it,
 * so a wheel that opens with a way in already on a column still has to be
 * pulled out of it before it can be pulled into another.
 */
export function stepMazeTurn(world: World): void {
  const m = mazeRound(world);
  if (m === null || m.phase !== "read") return;
  const wheel = mazeCurrent(m);
  if (wheel === null) return;
  stepMazeCatch(world, m, wheel);
  if (m.turn === 0) return;
  m.angleMilli = mazeWrap(m.angleMilli + m.turn * world.cfg.mazeTurnMilli);
  mazeClickIntoColumn(world, m, wheel);
}

/**
 * The pair fired. Called from `applyCommand` for every shot, whether or not
 * the ship let one out — a shot swallowed by the cooldown was still a shot
 * they meant to take, and judging the ship's reaction instead of the players'
 * intent would end an attempt for a reason nobody at either screen can see.
 *
 * It counts only when a way in is clicked onto a column **and the cannon is
 * standing in it**. Anywhere else there is nothing above the cannon to go into,
 * so the shot is an ordinary one up an empty field and the only pressure is the
 * clock — the same answer the old maze gave a column between its mouths.
 *
 * **When it does count, the drum swallows the shot**, and that is what the
 * `true` is for. An ordinary bullet went up the column as well, past the gap
 * and off the top of the field, while a second object of another colour walked
 * the corridors — two shots for one trigger, which is what the owner saw. The
 * caller drops the bullet this press produced; from the gap down to the hull
 * the shot is the maze's to draw, and it is drawn in the colour recorded here.
 */
export function mazeHeard(world: World, color: Color): boolean {
  const m = mazeRound(world);
  if (m === null || m.phase !== "read") return false;
  if (m.lockedWay < 0 || m.lockedCol !== world.cannonCol) return false;
  const wheel = mazeCurrent(m);
  const route = wheel?.entrances[m.lockedWay]?.route ?? [];
  if (route.length === 0) return false;
  // A wheel still easing onto the column is put on it: the shot goes in at
  // the angle the light is standing at, and nothing turns under it.
  mazeSettleNow(m);
  m.way = m.lockedWay;
  m.shotColor = color === "red" ? 0 : 1;
  m.step = 0;
  if (!m.tried.includes(m.way)) m.tried.push(m.way);
  enterMazePhase(m, "travel", world.beat);
  // Nothing is reported about where the shot stands yet: it is still climbing
  // the column. `stepMaze` says so on the beat it is actually through the gap.
  return true;
}
