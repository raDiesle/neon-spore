import type { SpawnEntry, TimedCommand } from "@neon-spore/sim";
import {
  aim,
  EVENT_CADENCE_SECONDS,
  firstOfKind,
  fresh,
  hold,
  type Pose,
  rock,
  run,
  runUntil,
  shoot,
  POSE_TPB as TPB,
} from "./pose-kit.js";
import { BODIES_POSE, DART_RUN_POSE, ECHO_POSE, GHOST_POSE } from "./poses-bodies.js";
import { RECOIL_POSE } from "./poses-cage.js";
import { CAIRN_PILE_POSE } from "./poses-cairn.js";
import { COUNT_POSE } from "./poses-count.js";
import { CAROM_POSE, CHUTE_POSE, VEER_POSE } from "./poses-crossing.js";
import { HUSK_POSE } from "./poses-husk.js";
import { COIL_POSE, TETHER_POSE } from "./poses-link.js";

/**
 * The half of `poses-versus.ts` that shows a body: a creature doing what it
 * does, on its own or under a hand. Split from it on 25 September 2026, when
 * the list sat thirteen lines under the ceiling and grew a row and an import
 * per slot; the other half is `poses-versus-states.ts`.
 */

const COL = 5;

/**
 * A worm, long enough that its links are visibly out of step with each other.
 * The head is the entry and the rest are hung off the field behind it
 * (`crawler-round.ts`), so the world has to be *run* before there is a body
 * to look at rather than a single link stepping on. `crawler:pulse` and
 * `creature:crawler` are both judged on the chain, not on one ring.
 */
const CRAWLER_POSE: Pose = {
  name: "CRAWLER · WALKING",
  note: "A worm of six links crossing the row above the ship. Each link squeezes a moment after the one in front of it, and that ripple is what makes six shapes read as one animal.",
  lookAt: "the chain of six round links crossing the field — how the squeeze travels down it",
  crop: "ship",
  build: () => {
    const entry: SpawnEntry = {
      beat: 0,
      col: 0,
      kind: "crawler",
      color: null,
      segments: 6,
      side: "left",
    };
    const w = fresh([entry]);
    // `crawlerStepBeats` is 2, so six links need a dozen beats behind the head
    // before the tail is on the field at all.
    run(w, TPB * 14);
    return w;
  },
};

/**
 * A bolt fired straight up the magnet's own column. An unsteered shot has
 * `aimMilli === 0` and `magnetLetsThrough` wants at least `magnetSlantMilli`,
 * so the plate turns this one away every time and the sim throws
 * `magnetPlate` on the tick it does. `creature:magnet` is judged on the turn.
 */
const MAGNET_POSE: Pose = {
  name: "MAGNET · A SHOT TURNED AWAY",
  note: 'A horseshoe with an armoured plate under it, and a red shot fired straight up into that plate. The plate turns the shot away and flashes white as it does. That flash is the only moment the creature says "not from below". It replays every two seconds.',
  lookAt: "the plate under the horseshoe, at the instant the shot hits it and it flashes",
  crop: "tile",
  span: 5,
  at: firstOfKind("magnet"),
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = fresh([{ beat: 0, col: COL, kind: "magnet", color: "red" }]);
    run(w, TPB * 3, [aim(0, COL)]);
    runUntil(w, "a bolt turned away by the plate", [shoot(w.tick, "red")], (x) =>
      x.events.some((e) => e.type === "magnetPlate"),
    );
    return w;
  },
};

/**
 * Five beads on a thread. `role` is `p2` because that is the only seat the
 * reel exists on — `showsBeadColor` is `l.role !== "p2"`, so player one and
 * the test view draw the real slick or bulb and player two draws the body
 * that will not say which it is. The pair overrides `role` per screen and
 * `versus-seat.ts` reports the seats as different for exactly this reason, so
 * both are drawn and the reel is the one on the right (`creature:strand`).
 */
const STRAND_POSE: Pose = {
  name: "STRAND · THE NAVIGATOR'S BEAD",
  note: "Five beads on one thread. Player 1 sees what the beads really are. Player 2 sees each one rolling between the two things it could be, because neither player alone is meant to know what is on the string.",
  lookAt: "the beads on the thread, and how the uncertain ones cycle between two shapes",
  crop: "field",
  role: "p2",
  at: firstOfKind("strand"),
  build: () => {
    const w = fresh([{ beat: 0, col: 1, kind: "strand", color: "red", beads: 5 }]);
    run(w, TPB * 4);
    return w;
  },
};

/**
 * A hand on a body, and that hand carrying it one column across. The push
 * sets `pushBeat`, and `carryIsReady` is false for `gripPushPauseBeats` after
 * it — which is why the two carry arrows are off the body here: they are drawn
 * only while it may be carried again (`render/grip-arrows.ts`).
 *
 * `drag` has no helper in `pose-kit.ts` because this is the only pose that
 * needs one: the command carries cumulative thousandths of a tile from the
 * grab, and one column is earned per `gripPushMilli`.
 */
const GRIP_POSE: Pose = {
  name: "GRIP · THE PUSH PAUSE",
  note: "A hand grabs a falling rock and shoves it one column across. A rock that has just been shoved cannot be shoved again for a beat, and the field says so by taking the two carry arrows away for as long as that wait lasts.",
  lookAt: "the two carry arrows beside the rock — gone for a beat after it is shoved, then back",
  crop: "tile",
  span: 5,
  at: firstOfKind("meteor"),
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = fresh([rock(COL)]);
    const drag = (tick: number, fromMilli: number): TimedCommand => ({
      tick,
      player: 2,
      command: { kind: "drag", target: "gripBody", on: true, fromMilli, id: 1 },
    });
    const cmds: TimedCommand[] = [hold(TPB, 2, 1)];
    // One column is `gripPushMilli` of cumulative travel; walked there over
    // half a beat rather than in one jump, which is what a thumb does.
    for (let i = 1; i <= 12; i++) cmds.push(drag(TPB + i * 3, Math.round((i / 12) * 1100)));
    runUntil(w, "a body just pushed", cmds, (x) => x.creatures[0]?.pushBeat !== undefined);
    return w;
  },
};

/** Every compared look whose state is a body, in the order the sheet shows them. */
export const VERSUS_BODY_POSES: Pose[] = [
  CRAWLER_POSE,
  MAGNET_POSE,
  STRAND_POSE,
  GRIP_POSE,
  BODIES_POSE,
  DART_RUN_POSE,
  GHOST_POSE,
  ECHO_POSE,
  RECOIL_POSE,
  CAROM_POSE,
  CHUTE_POSE,
  VEER_POSE,
  COIL_POSE,
  TETHER_POSE,
  COUNT_POSE,
  CAIRN_PILE_POSE,
  HUSK_POSE,
];
