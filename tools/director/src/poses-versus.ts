import type { Pose, PoseGroup } from "./pose-kit.js";
import { VERSUS_BODY_POSES } from "./poses-versus-bodies.js";
import { VERSUS_STATE_POSES } from "./poses-versus-states.js";

/**
 * The states a candidate look is judged on — one per slot that had none.
 *
 * This file is the answer to a complaint with one sentence in it: *"is it
 * showing the right enemies? it always shows slick."* It was. `versus-pose.ts`
 * mapped four slots to a pose and everything else fell through to `SLICK ·
 * FALLING`, so a candidate for the crawler's pulse, the magnet's plate, the
 * strand's bead, the grip's ring or the band's ACTION face was drawn twice
 * beside a red slick that none of them touches — two identical pictures, and
 * a vote offered on a difference nobody could see. That is also the whole of
 * *"I can't see a difference on CRAWLER:PULSE"*: there was no crawler on the
 * field.
 *
 * Its own file rather than rows added to `poses-field.ts` and
 * `poses-mechanics.ts`, which are already near the line ceiling — CLAUDE.md's
 * *split rather than grow*. It is a group of its own on the STATES sheet too,
 * and that is honest rather than incidental: these are not the states the
 * design argues about, they are the states a *look* is argued about on, and
 * the two lists answer different questions.
 *
 * Two rules every pose here obeys, both of them `pose-kit.ts`'s. **Nothing is
 * assigned**: a magnet's plate flashes because a bolt was fired into it, a
 * grip's ring goes unready because a hand actually carried the body a column.
 * And **an event-shaped state carries `cadenceSeconds`** so the pair replays
 * it on its own two-second clock — a plate that flashes once and then holds a
 * dead rock for a minute is a still picture with a wait in front of it.
 *
 * **The rows are in two files by what they show**: a body in
 * `poses-versus-bodies.ts`, anything else in `poses-versus-states.ts`. A new
 * slot's pose is a row in one of them; this file only joins the two.
 */

export const VERSUS_POSES: Pose[] = [...VERSUS_BODY_POSES, ...VERSUS_STATE_POSES];

export const VERSUS_GROUP: PoseGroup = {
  title: "COMPARED LOOKS",
  note: "the state each open VERSUS slot is judged on — versus.md",
  poses: VERSUS_POSES,
};
