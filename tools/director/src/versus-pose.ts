import type { Pose } from "./pose-kit.js";
import { POSE_GROUPS } from "./poses.js";

/**
 * Which pose puts a slot's own animation on screen, so a candidate that
 * patches a shot or a shield draws the thing it changed without anybody
 * reaching for a pose picker first.
 *
 * This is the confirmed half of the queue entry's third observation. Before
 * this file existed the whole sheet opened on one fixed pose — a slick
 * falling — regardless of which slot was showing, so `cannon:shot` and
 * `shield:ward` sat beside their shipped look with no bullet and no ward ever
 * on the frame: nobody had picked the pose that puts one there.
 * `test/versus-pose.test.ts` builds every pose named here and checks the
 * state it is named after actually arrives, the same guard `poses.test.ts`
 * holds on the whole gallery, so a pose renamed out from under this map fails
 * loudly instead of quietly falling back to the default.
 *
 * `ship:hull-skin` has no entry and takes `DEFAULT_POSE`: the hull is on
 * every frame of every pose, so no slot showing it needs a dedicated one.
 *
 * **Both cannon slots take `SHOT · BEING LAID` rather than `SHOT · IN
 * FLIGHT`, and the difference is the whole point of this map.** A pose is
 * built and then *stepped* by the pair with nobody pressing anything, so what
 * a slot gets to show is only what its world does on its own from the tick it
 * was handed over. `IN FLIGHT` is held thirty ticks after the press, so the
 * press, the opening working and the departure had all happened inside
 * `build` — the sheet showed a bolt already six tiles up a column and never
 * showed a shot *leaving*, which is the thing both cannon slots are about.
 * `BEING LAID` is held on the tick the charge lands in the muzzle instead,
 * with an empty queue and a one-beat rest, so the pair sees the mouth work,
 * the shot go and the bolt run the column, and then the wave clears and the
 * whole thing happens again roughly every 1.97 beats. Nobody triggers
 * anything, which was the complaint: two candidates that differ only while a
 * shot is being fired cannot be told apart on a page where no shot is ever
 * fired.
 *
 * **Event-shaped vs. continuous, for the slots this map actually reaches.**
 * `cannon:shot`, `cannon:mouth` and `shield:ward` are event-shaped — their
 * whole difference lives in one instant (a shot leaving, a ward deflecting),
 * so `SHOT · BEING LAID` and `WARD · DEFLECTED` (`poses-mechanics.ts`) both
 * carry `cadenceSeconds`, and `versus-pair.ts` replays them on that clock.
 * `ship:hull-skin` is continuous — it is on every frame regardless of what
 * else happens, so `DEFAULT_POSE` needs no rhythm and carries none. The next
 * event-shaped slot (a hull crack, a plate coming off, a guard lapsing)
 * inherits the cadence the same way: name its pose here, and give that pose
 * `cadenceSeconds` in `poses-mechanics.ts`.
 */
const SLOT_POSE: Record<string, string> = {
  // The ship is judged on itself with a body falling past it, which is the one
  // thing on the frame brighter than the membrane being looked at. `ship:light`
  // and `ship:hull-shape` are both decided and gone; the mapping stays because
  // the panel slots below ask about the same object.
  "cannon:shot": "SHOT · BEING LAID",
  "cannon:mouth": "SHOT · BEING LAID",
  "shield:ward": "WARD · DEFLECTED",
  // Four more, all of them added at once, because until they existed every one
  // of these slots fell through to the default and was compared against a red
  // slick that none of them touches. `poses-versus.ts` says what each shows.
  // `grip:ring-pause` and `panel:action-face` were a sixth and a seventh and
  // are gone with their candidates; both poses stay in the gallery, which is
  // where a picture of THE PUSH and of the panel's own faces belongs.
  "creature:meteor": "METEOR · A SHOT ARRIVING",
  "creature:magnet": "MAGNET · A SHOT TURNED AWAY",
  "creature:strand": "STRAND · THE NAVIGATOR'S BEAD",
  "crawler:pulse": "CRAWLER · WALKING",
  // The one slot here that is not about a single creature: a skin is the
  // material every blob in the game is made of, so its pose puts four kinds
  // on the field at once rather than asking the question a fifth of the way.
  "creature:skin": "BODIES · FOUR KINDS AT ONCE",
  // And the two silhouette slots, on the same pose for a different reason: a
  // contour is judged against the bodies it could be mistaken for, and this is
  // the only pose that puts four of them on one frame.
  "creature:slick": "BODIES · FOUR KINDS AT ONCE",
  "creature:bulb": "BODIES · FOUR KINDS AT ONCE",
  // The same pose again for the two interiors and the two outlines opened on 9
  // September 2026, and for the same reason both times. What is inside a body
  // and what shape it is are both judged against the bodies it could be
  // mistaken for, and this is the only pose that puts four of them on one
  // frame. The interiors are `creature:` slots because they are about what a
  // creature has; the outlines are `slick:` and `bulb:` because they are about
  // one named body and nothing else.
  "slick:shape": "BODIES · FOUR KINDS AT ONCE",
  "bulb:shape": "BODIES · FOUR KINDS AT ONCE",
  // And back to one creature doing one thing, because a dart's thrust is one:
  // it burns on the beat the body is thrown and on no other, so the slot needs
  // a pose held on that tick and replayed (`poses-bodies.ts`).
  "creature:dart": "DART · THE RUN",
  // Eight surface slots were mapped here on 9 September 2026 and all eight were
  // answered the same day. Their poses stay in the gallery — a worm walking, a
  // throb turning, a wisp standing, a warden armoured — because a pose is a
  // picture of the game and outlives the question it was drawn for.
  //
  // And one slot opened the same day, about the join between the ship and the
  // panel under it. It is the first here whose subject is *two* objects, so its
  // pose is the one cut that carries both and nothing else is moving on it
  // (`poses-versus.ts`).
  "panel:ship-join": "SHIP · MEETING THE PANEL",
  // Armour on a body rather than on a boss, and the pose is the *half-open*
  // state on purpose: an intact shell is two plates that tile exactly, so a
  // look about the material would be judged on a shape whose material is only
  // visible at its rim, and a bare body has no armour left to judge. One plate
  // on and one off is the state this creature spends its life in and the one
  // where both halves of the answer stand side by side (`shell-look.ts`).
  "shell:plate": "SHELL · ONE HALF OPEN",
  // The one slot here whose subject is on two bodies. Its pose is the small
  // one, where an eye is the whole picture and the difference is largest —
  // `WARDEN · ARMOURED` above shows the same record on the biggest fixture in
  // the game, and a pair voting on this should open both (`eye-look.ts`).
  "eye:iris": "LID · THE EYE OPEN",
  // A crossing ghost, part-way through its temper: a falling one sits at rage
  // nought and the camouflage barely moves, and after the last turn it comes
  // off altogether. Drawn on player two's screen alone, which is the creature
  // rather than an omission (`poses-bodies.ts`).
  "ghost:tears": "GHOST · TORN",
  // The veil over a burning stone's face, and the pose is the creature alone
  // rather than BULB QUEEN's six sockets: the question is what the rock's own
  // face looks like through the fire, so what is wanted is one torch as big as
  // the field ever draws one, falling at the speed it ships at
  // (`poses-casing.ts`, `torch-veil.ts`).
  "torch:veil": "TORCH · THE FALL",
  // The first slot here that is not the field at all. Every pose above puts a
  // body, a control or a boss on the playing field; an interlude is a whole
  // screen of its own, and until `poses-rounds.ts` there was no pose that
  // handed the pair one — which is why no round had ever been offered a look.
  "maze:walls": "MAZE · THE WHEEL TO READ",
  // Two about **damage**, on 9 September 2026, and the first slots on this page
  // whose subject is what happens *to* something rather than what it is made
  // of. A break is event-shaped in the sharpest way this map has met — the body
  // it is about stops existing halfway through — so its pose hands the world
  // over with the bolt still in the air and replays on the two-second clock. A
  // crater is the opposite and needs no clock at all: it is cut into the hull
  // once and is still there at the end of the run, which is the whole of what
  // the pair is being asked about.
  "creature:break": "BREAK · A BODY COMING APART",
  "ship:crater": "BREACH · A SCAR",
};

/** The pose a slot gets when nothing in `SLOT_POSE` names it. */
const DEFAULT_POSE_NAME = "SLICK · FALLING";

const ALL_POSES: Pose[] = POSE_GROUPS.flatMap((g) => g.poses);

function findPose(name: string): Pose {
  const pose = ALL_POSES.find((p) => p.name === name);
  if (!pose) throw new Error(`versus-pose.ts names a pose that does not exist: ${name}`);
  return pose;
}

/** The pose the pair opens on for this slot — never chosen by the operator. */
export function poseForSlot(slot: string): Pose {
  return findPose(SLOT_POSE[slot] ?? DEFAULT_POSE_NAME);
}
