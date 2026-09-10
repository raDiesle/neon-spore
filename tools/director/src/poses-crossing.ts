import { DEFAULT_CONFIG, type SpawnEntry, type TimedCommand } from "@neon-spore/sim";
import {
  aim,
  firstOfKind,
  fresh,
  type Pose,
  run,
  runUntil,
  shoot,
  POSE_TPB as TPB,
} from "./pose-kit.js";
import { fallSeconds } from "./poses-surface.js";

/**
 * The two states a candidate for a body that **goes somewhere** is judged on.
 *
 * Its own file rather than rows added to `poses-versus.ts` or `poses-surface.ts`,
 * both of which sit near the line ceiling — CLAUDE.md's *split rather than
 * grow* — and the seam is a real one. A surface pose holds a body still so its
 * far side has time to come round. An event pose hands the pair one instant and
 * replays it. Neither is what THE CAROM and THE CHUTE are about: these two are
 * the only bodies in the game whose whole subject is a **path**, one across the
 * field and one up it, and what both slots ask is whether the thing on that path
 * reads as a solid object travelling or as a sprite being moved. That question
 * needs the journey, so both poses here are held for as long as their body is on
 * the field and replayed when it leaves.
 *
 * They are two halves of one creature and are built the same way: a carom is
 * authored, and a chute is what is left when somebody shoots one
 * (`sim/chute.ts` — nothing authors a chute and nothing can).
 */

/** The column a carom is authored in. The middle, so its first crossing is the
 * long one either way and the pair sees it reach a wall (`caromOnSpawn` points
 * it away from the nearer one, and from the middle there is no nearer one). */
const COL = 5;

/**
 * The lane the cannon is parked in for the chute pose, and the beat the shot
 * goes on.
 *
 * Both are fixed rather than tracked, and the reason is `creatureLane`: a carom
 * slides between its columns across a beat, so a bolt fired at the column it
 * will *land* in passes under a body that is still on its way there. Parking the
 * cannon at the left wall and firing on the beat the carom reaches row ten is
 * the one arrangement that connects with a single shot — the crossing brings the
 * body onto the muzzle rather than the muzzle chasing the body, which is how a
 * pair plays this creature anyway.
 *
 * Row ten and not row two: the body inside climbs `chuteRiseRows` a beat, so a
 * crust cracked at the top of the field opens its canopy before the plume under
 * it has been on screen for a frame. Cracked at ten it climbs for the better
 * part of three beats, and the ejection — the one upward motion in this game — is
 * something the pair actually watches happen.
 */
const CRACK_COL = 0;
const CRACK_BEAT = 11;
const CRACK_ROW = 10;

/**
 * How long the whole of a chute is on the field, in seconds, plus the slack
 * that lands the replay on an empty lane.
 *
 * Derived rather than typed, and through `fallSeconds` rather than around it: a
 * chute comes down the same field every other body does, one row every
 * `chuteFallBeats` instead of one row a beat, so its descent is that many falls
 * long. The climb in front of it is `CRACK_ROW` at `chuteRiseRows` a beat. Every
 * number comes off the config the pose is built with and none of them can drift
 * when the balance moves.
 */
function chuteLifeSeconds(): number {
  const cfg = DEFAULT_CONFIG;
  const climbBeats = Math.ceil(CRACK_ROW / cfg.chuteRiseRows);
  return fallSeconds() * cfg.chuteFallBeats + (climbBeats * 60) / cfg.bpm;
}

/**
 * One carom crossing the field on its own, all the way to a wall and back.
 *
 * **The crop is the whole field and that is the pose.** Every other creature
 * slot on this page is cropped to a tile, because a surface at twenty-six pixels
 * is only readable magnified. A tile crop follows its body (`versus-crop.ts`
 * re-derives the window every frame), and a window that follows a carom is a
 * window in which the carom never moves — which is the one thing `creature:carom`
 * is about. On the whole field it crosses three lanes a beat, turns at the left
 * wall and comes back, and the streak behind it points where the simulation is
 * actually going to put it next.
 *
 * Handed over two beats in: the body is clear of the top of the field, its
 * heading is set and it has not yet reached the wall, so the first turn happens
 * where the pair can see it.
 */
export const CAROM_POSE: Pose = {
  name: "CAROM · CROSSING",
  note: "One carom alone on the field, falling a row a beat and crossing three lanes with it. It turns at each wall rather than leaving, so the column it is in is never the column it was in — the only body in the game that is somewhere else before either player has finished saying where it was.",
  lookAt:
    "the rock and the streak behind it — whether it reads as a solid thing being carried across the field or as a picture sliding over it",
  crop: "field",
  // A carom falls a row a beat like a slick, so it is on the field for exactly
  // one fall and the replay lands on an empty lane.
  cadenceSeconds: fallSeconds(),
  build: () => {
    // A colour is authored because a carom carries one: it is what burns
    // through the window and what the shot has to match (`creatures-worn.ts`).
    // The kind is spelled out beside it rather than asked of `kindForColor`,
    // which answers a different question and would hand back a slick.
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "carom", color: "red" };
    const w = fresh([entry]);
    run(w, TPB * 2);
    return w;
  },
};

/**
 * A carom cracked low in the field, and the body thrown out of it — climbing
 * under a plume, opening a canopy at the top and coming back down under it.
 *
 * The pair is handed the world on the tick the chute exists, so the ejection is
 * the first thing on screen rather than something that happened while nobody was
 * looking. Nothing is assigned: the crust is opened by a shot that was actually
 * fired, and every state after that is the simulation's own. `creature:chute`
 * is judged here: the half of one creature whose subject is a path.
 */
export const CHUTE_POSE: Pose = {
  name: "CHUTE · THROWN CLEAR",
  note: "The body sealed inside a carom, blown out of the hatch by a shot that cracked the crust low in the field. It is the only thing in this game that goes up: it climbs on a column of fire, opens a canopy at the top of the field and drifts back down at half the speed of a slick, still in the colour it always had — and it still has to be shot.",
  lookAt:
    "the thing attached to the body — the plume under it on the way up and the canopy over it on the way down, and whether either reads as a shell with an inside",
  crop: "tile",
  at: firstOfKind("chute"),
  // Wider than the default 3.4, because a canopy stands nearly two body radii
  // above the body and is three wide, and a window fitted to the body alone
  // cuts the hem off the thing being voted on. Not wider still: the crack
  // happens against the left wall, so every tile of span past this one is
  // black off the edge of the field rather than picture.
  span: 4.5,
  cadenceSeconds: chuteLifeSeconds(),
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "carom", color: "red" };
    const w = fresh([entry]);
    const cmds: TimedCommand[] = [aim(0, CRACK_COL), shoot(TPB * CRACK_BEAT, "red")];
    // It throws if the shot ever stops connecting, which is the point of
    // spelling the two numbers out: a pose that quietly missed would hand the
    // slot a carom crossing an empty field and no chute at all.
    runUntil(w, "a body thrown clear of a cracked carom", cmds, (x) =>
      x.creatures.some((c) => c.kind === "chute"),
    );
    return w;
  },
};
