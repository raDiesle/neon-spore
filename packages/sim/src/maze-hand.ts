import { mazeBottomCol } from "./maze.js";
import { mazeRound } from "./maze-controls.js";
import type { MazeState } from "./maze-state.js";
import { mazeRight } from "./maze-verdict.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **A thumb on THE MAZE's heart**, off the wire, on the tick.
 *
 * The round's third state and its second gesture on the picture
 * (`.claude/skills/new-boss` §6.2). A shot of the right colour that reaches
 * the middle is *held* there (`grip`, `maze-round.ts`), and the wheel is
 * finished by tearing it out: the navigator's thumb on the heart, carried
 * down past `mazeHeartPullMilli`, **while the pilot's hand is on the string**
 * (`MazeState.dragging`, `maze-controls.ts`). Two seats, two gestures, the
 * same beat — which is the split this round had lost once the light and the
 * shot's walk went on both screens. Her pull without his brace stretches the
 * heart and tears nothing; his brace without her pull holds a wheel that is
 * going nowhere; and a heart held past `mazeGripBeats` lets go of the shot,
 * which comes back down the column as its own blood (`mazeWrong`, `slip`).
 *
 * **The seat check is a rule of the simulation.** The pilot has the string
 * and the navigator the heart, and a pilot who could tear would be playing
 * both halves of the one beat that needs two hands. `fromYMilli` is how far
 * *down* the thumb has come from where it grabbed, the way THE SINEW's and
 * THE STARE's are read; a pull upward is no pull.
 */
export function mazeHeartHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "mazeHeart") return;
  const m = mazeRound(world);
  if (m === null || player !== 2) return;
  if (!command.on) {
    lift(world, m);
    return;
  }
  if (m.phase !== "grip") return;
  const reach = world.cfg.mazeHeartPullMilli;
  const pull = Math.max(0, Math.min(reach, Math.round(command.fromYMilli ?? 0)));
  if (!m.gripThumb) {
    m.gripThumb = true;
    world.events.push({ type: "mazeGrip", col: mazeBottomCol(world.cfg), on: true });
  }
  m.gripPullMilli = pull;
  if (pull >= reach && m.dragging) mazeRight(world, m);
}

/**
 * The thumb leaving the heart, answered whatever phase the round is in — a
 * heart let go of springs back, and a thumb still counted as on it after the
 * verdict would be on the next wheel's heart before the wheel was up.
 */
function lift(world: World, m: MazeState): void {
  if (!m.gripThumb) return;
  m.gripThumb = false;
  m.gripPullMilli = 0;
  world.events.push({ type: "mazeGrip", col: mazeBottomCol(world.cfg), on: false });
}
