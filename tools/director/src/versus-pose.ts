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
  // The ship's own light is judged on the ship with nothing in front of it.
  // `ship:hull-skin` took the default while it was open, and that was right
  // for a colour and wrong for this: a body falling past the hull is the one
  // thing brighter than the wash being voted on.
  "ship:light": "HULL · BOTH LOBES UP",
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
  // And back to one creature doing one thing, because a dart's thrust is one:
  // it burns on the beat the body is thrown and on no other, so the slot needs
  // a pose held on that tick and replayed (`poses-bodies.ts`).
  "creature:dart": "DART · THE RUN",
  // Three added on 9 September 2026, all of them slots about a **surface**
  // rather than about an event, and the last two needed poses of their own.
  // A worm was already walking on a page and a candidate for its skin wants
  // nothing else; but the two states below are held for as long as their body
  // is on the field rather than replayed every two seconds, because a surface
  // that turns needs longer than two seconds to finish turning
  // (`poses-surface.ts`).
  "crawler:skin": "CRAWLER · WALKING",
  // A throb alone in a lane rather than beside the other three bodies. The
  // contour slots take `BODIES` because a shape has to stay tellable from the
  // shapes it could be mistaken for; this slot is about what the body's *turn*
  // looks like, which is a thing to watch for five whole revolutions with
  // nothing else moving on the frame.
  "creature:throb": "THROB · TURNING",
  "creature:choir": "CHOIR · TWO VOICES",
  // Three more on 9 September, and the two creatures among them are the first
  // poses here that need **no replay at all**: a wisp does not fall and a
  // settled gyre does not leave, so both simply stay, which is the longest look
  // at a turning surface this page can offer.
  "creature:wisp": "WISP · STANDING",
  "creature:gyre": "GYRE · TURNING",
  // And the ship, on the pose `ship:light` already takes. Two slots on one
  // pose is right rather than a shortcut: they are the two halves of one
  // object — where the light falls on the hull, and what the hull is made of —
  // and the only honest frame for either is the ship with a body falling past
  // it, which is the one thing brighter than the membrane being judged.
  "ship:hull-shape": "HULL · BOTH LOBES UP",
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
