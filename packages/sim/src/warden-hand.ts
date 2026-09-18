import type { WardenState } from "./boss-state.js";
import type { Command } from "./types.js";
import { wardenPhase } from "./warden-cycle.js";
import { wardenEyeOpen, wardenThrown } from "./warden-open.js";
import { noteEyeOpened, wardenTetherHeard } from "./warden-rope.js";
import type { World } from "./world.js";

/**
 * **THE WARDEN's three hands, on the tick**: the rope (`warden-rope.ts`),
 * the thumb on the eye, and the swipe that throws the hatch — one per phase,
 * each added to the last (`docs/spec/bosses.md` §11.4, *Three phases, three
 * gestures*).
 *
 * **The thumb on the eye is player 2's**, and that is the split of NARROW.
 * Player 1 has the rope and cannot fire; player 2 fires and, from now on, has
 * to keep a thumb on the eye with the other hand to have anything to fire at
 * — the lids behind the hatch only part under it, and the pupil stops walking
 * while it stays. Two seats each holding half of an opening the other cannot
 * feel: the rope's coupling, doubled.
 *
 * **The swipe is player 1's**, and that is the split of GLARE. No line comes
 * down on the last plate; the eye glares wide and still from the middle of
 * the rim, and the hatch is thrown by a swipe across it — a lift whose
 * travel is at least `wardenThrowMilli` — for `wardenThrowBeats`, after
 * which it slams of its own weight. Player 2 fires inside the window. The
 * seat throwing cannot fire and the seat firing cannot throw, as with the
 * rope, but where the rope was *held* this is *timed*: the throw is said, and
 * the shot has three beats to answer.
 *
 * Nothing here charges the hull. A thumb lifted early, a swipe too short, a
 * shot after the slam — each is a window lost and nothing more, because a
 * fight that can hurt nobody is what THE WARDEN is (§11.4).
 */
export function wardenHeard(world: World, player: 1 | 2, command: Command): void {
  wardenTetherHeard(world, player, command);
  const b = world.boss;
  if (b === null || b.kind !== "warden" || command.kind !== "drag") return;
  if (command.target === "wardenEye") eyeHeard(world, b, player, command.on);
  if (command.target === "wardenHatch") hatchHeard(world, b, player, command);
}

function eyeHeard(world: World, b: WardenState, player: 1 | 2, on: boolean): void {
  if (player !== 2 || wardenPhase(b.plates).asks !== "hold") return;
  if (!on) {
    b.eyeHeld = false;
    return;
  }
  if (b.eyeHeld) return;
  const was = wardenEyeOpen(world, b);
  b.eyeHeld = true;
  world.events.push({ type: "wardenHold", col: b.pupilCol });
  noteEyeOpened(world, b, was);
}

function hatchHeard(
  world: World,
  b: WardenState,
  player: 1 | 2,
  command: Extract<Command, { kind: "drag" }>,
): void {
  if (player !== 1 || wardenPhase(b.plates).asks !== "throw") return;
  // The press says nothing; the throw is the lift, and only one that travelled.
  if (command.on || wardenThrown(world, b)) return;
  if (Math.abs(command.fromMilli) < world.cfg.wardenThrowMilli) return;
  const was = wardenEyeOpen(world, b);
  b.throwBeat = world.beat;
  // A thrown hatch is a fresh opening: the hit that took the last-but-one
  // plate spent the line's, and there is no line now to replace it.
  b.eyeSpent = false;
  world.events.push({ type: "wardenThrow", col: b.pupilCol });
  noteEyeOpened(world, b, was);
}

/**
 * The hatch's own clock, on the beat from `stepWarden`: a thrown hatch whose
 * window has run out slams shut. Nothing in any other phase, and nothing
 * while it is shut.
 */
export function stepWardenThrow(world: World, b: WardenState): void {
  if (b.throwBeat < 0 || wardenThrown(world, b)) return;
  b.throwBeat = -1;
  world.events.push({ type: "wardenSlam", col: b.pupilCol });
}
