import type { SpawnEntry, TimedCommand } from "@neon-spore/sim";
import {
  aim,
  EVENT_CADENCE_SECONDS,
  firstOfKind,
  fresh,
  hold,
  type Pose,
  type PoseGroup,
  rock,
  run,
  runUntil,
  shoot,
  POSE_TPB as TPB,
} from "./pose-kit.js";
import { BODIES_POSE, DART_RUN_POSE, GHOST_POSE } from "./poses-bodies.js";
import { BREACH_ROCKS_POSE, BREAK_POSE, METEOR_HIT_POSE } from "./poses-damage.js";

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
 */

const COL = 5;

/**
 * The first wave that names no control set of its own and so draws the
 * `default` one — both ACTION faces. Written as a number with its reason
 * beside it rather than derived: `poses.test.ts` builds every pose here, so a
 * wave list that reordered under this fails there rather than quietly drawing
 * a band with nothing on it.
 */
export const WAVE_WITH_BOTH_FACES = 13;

/**
 * A worm, long enough that its links are visibly out of step with each other.
 * The head is the entry and the rest are hung off the field behind it
 * (`crawler-round.ts`), so the world has to be *run* before there is a body
 * to look at rather than a single link stepping on.
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
 * `magnetPlate` on the tick it does.
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
 * both are drawn and the reel is the one on the right.
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

/**
 * The band with an ACTION face on it. Every other pose on the sheet starts
 * wave 0, whose control set is `standard1` — a cannon and a red button — so
 * neither GUARD nor INTAKE has ever been drawn in one, and the
 * `panel:action-face` slot had nothing on screen to argue about.
 *
 * That slot is decided and gone — the owner picked the emblems, and
 * `action-face.ts` draws them on every action button now. The pose stays, the
 * way `GRIP · THE PUSH PAUSE` did for the same reason: it is the only card in
 * the gallery that shows the panel's own two faces, and they are worth a
 * picture whether or not anybody is voting on them.
 */
const BAND_POSE: Pose = {
  name: "BAND · THE ACTION FACES",
  note: "Player 1's control panel. It has a slider for the cannon and two round buttons beside it: a lobe swelling upwards for the shield, and the same lobe pressed inwards with specks falling into it for the maw.",
  lookAt:
    "the two round buttons at the bottom of the panel — SHIELD on the left, SUCK on the right",
  crop: "band",
  build: () => {
    const w = fresh([], [], null, {}, WAVE_WITH_BOTH_FACES);
    run(w, TPB * 2);
    return w;
  },
};

export const VERSUS_POSES: Pose[] = [
  CRAWLER_POSE,
  MAGNET_POSE,
  STRAND_POSE,
  GRIP_POSE,
  BAND_POSE,
  METEOR_HIT_POSE,
  BREAK_POSE,
  BREACH_ROCKS_POSE,
  BODIES_POSE,
  DART_RUN_POSE,
  GHOST_POSE,
];

export const VERSUS_GROUP: PoseGroup = {
  title: "COMPARED LOOKS",
  note: "the state each open VERSUS slot is judged on — versus.md",
  poses: VERSUS_POSES,
};
