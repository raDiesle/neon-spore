import type { SpawnEntry, TimedCommand, World } from "@neon-spore/sim";
import {
  aim,
  EVENT_CADENCE_SECONDS,
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
const WAVE_WITH_BOTH_FACES = 13;

/** Where a `tile` crop is centred: the first body of the kind the pose is
 * named after, read off the posed world rather than guessed. */
const firstOfKind =
  (kind: string) =>
  (w: World): { col: number; row: number } => {
    const c = w.creatures.find((x) => x.kind === kind) ?? w.creatures[0];
    return c ? { col: c.col, row: c.row } : { col: COL, row: 7 };
  };

/**
 * A worm, long enough that its links are visibly out of step with each other.
 * The head is the entry and the rest are hung off the field behind it
 * (`crawler-round.ts`), so the world has to be *run* before there is a body
 * to look at rather than a single link stepping on.
 */
const CRAWLER_POSE: Pose = {
  name: "CRAWLER · WALKING",
  note: "Six links along the row above the hull, each squeezing a fraction of a beat behind the one in front. The pulse is what makes the chain read as one animal rather than six rocks in a line — it is the whole subject of the crawler:pulse slot, and it cannot be judged on a field with no crawler on it.",
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
  note: "The horseshoe with its armoured plate slung underneath, and a red bolt fired straight into it. The plate is the clause that says the way in is not from below, and the white it flashes when it refuses a shot is the only moment it says so out loud — held here, and replayed every two seconds.",
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
  note: "Five beads on one thread. The pilot sees the real bodies; the navigator sees a reel rolling between the two they could be, because the whole mechanic is that neither player alone knows what is on the string. The creature:strand slot is a second answer to that reel, so this is the only pose it can be judged on.",
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
 * it — the flag the shipped ring ignores and the `latch` candidate stops its
 * arcs on.
 *
 * `drag` has no helper in `pose-kit.ts` because this is the only pose that
 * needs one: the command carries cumulative thousandths of a tile from the
 * grab, and one column is earned per `gripPushMilli`.
 */
const GRIP_POSE: Pose = {
  name: "GRIP · THE PUSH PAUSE",
  note: "A hand held on a falling rock, and that hand shoving it one column sideways. A body that has just been pushed cannot be pushed again for a beat, and the ring around it is the only place that pause is ever shown — which is what the grip:ring-pause slot is a second answer to.",
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
 */
const BAND_POSE: Pose = {
  name: "BAND · THE ACTION FACES",
  note: "GUARD and INTAKE, the two buttons that are not a colour and not the cannon. The word on a face is the whole of what tells a pair which one they are pressing, and the panel:action-face slot is a second answer to how that word is drawn.",
  crop: "band",
  build: () => {
    const w = fresh([], [], null, {}, WAVE_WITH_BOTH_FACES);
    run(w, TPB * 2);
    return w;
  },
};

/**
 * A rock already argued with, and one more bolt still in the air when the
 * pair takes the world over — so the crater opens on screen rather than
 * inside `build`, which is where the old `METEOR · CRATERED` spent every one
 * of its four.
 */
const METEOR_HIT_POSE: Pose = {
  name: "METEOR · A SHOT ARRIVING",
  note: "A cratered rock with a fourth bolt two tiles under it. It keeps its size and its speed and it is no closer to breaking — the craters are the rule made visible, and how one opens is what the creature:meteor slot is a second answer to.",
  crop: "tile",
  at: firstOfKind("meteor"),
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = fresh([rock(COL)]);
    const cmds: TimedCommand[] = [aim(0, COL)];
    for (let i = 0; i < 3; i++) cmds.push(shoot(TPB + i * TPB, "red"));
    runUntil(w, "a cratered rock", cmds, (x) => (x.creatures[0]?.holes ?? 0) >= 3);
    runUntil(w, "a bolt two tiles under the rock", [shoot(w.tick + 2, "red")], (x) => {
      const b = x.bullets[0];
      const c = x.creatures[0];
      return b !== undefined && c !== undefined && b.row - c.row <= 2;
    });
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
];

export const VERSUS_GROUP: PoseGroup = {
  title: "COMPARED LOOKS",
  note: "the state each open VERSUS slot is judged on — versus.md",
  poses: VERSUS_POSES,
};
