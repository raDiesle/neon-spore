import type { SpawnEntry, TimedCommand } from "@neon-spore/sim";
import {
  aim,
  EVENT_CADENCE_SECONDS,
  firstOfKind,
  fresh,
  living,
  type Pose,
  rock,
  run,
  runUntil,
  shoot,
  POSE_TPB as TPB,
  until,
} from "./pose-kit.js";

/**
 * The three poses about **damage** — a rock being marked, a body being
 * destroyed, and the ship being holed.
 *
 * Split out of `poses-versus.ts` when the second of them took that file past
 * its line ceiling, and the seam is a real one rather than a convenient cut:
 * every other pose over there is a state a *look* is compared on, held still,
 * and every one of these is an **impact**. Each is handed to the pair a named
 * distance short of the thing it is about, because what it is about only exists
 * for the moments after that — and each carries `cadenceSeconds` so the whole
 * of it comes round again on its own clock.
 *
 * The first two are a shot landing and come round every two seconds. The third
 * is rocks landing on the ship, and it is longer than the other two put
 * together, because a hole in the hull is not finished when the rock arrives —
 * the rock lies in it, and the hole is only there to be looked at once the rock
 * has rolled off the field (`rock-drift.ts`).
 *
 * The column both of them use. Middle-ish, and the same one `poses-versus.ts`
 * spawns in, so a session flipping between the two sheets is looking at the
 * same part of the field.
 */
const COL = 5;

/**
 * How far under the rock the bolt is when the pair is handed the world.
 *
 * Eleven rows and not two, and the number is a *duration*: a bolt covers twelve
 * tiles a beat, so two rows is a sixth of a beat — about a tenth of a second,
 * which is not long enough for anybody to see what an unmarked rock looks
 * like, and it is why nobody ever had. Eleven is nearly a whole beat of clean
 * rock before the first crater opens.
 */
const UNHIT_ROWS = 11;

/**
 * An untouched rock with the first bolt still in the air when the pair takes
 * the world over, so every crater it ever has opens on screen.
 *
 * It handed over with three craters already cut until 8 September 2026, and
 * the owner asked what the rock looks like before anything has hit it — which
 * turned out to be a question the pose could not answer at all, because the
 * pair had never once seen this creature in the state it spends most of its
 * life in. The fourth crater opening was the whole picture. It is the first
 * one now, and the three that follow arrive on the replay clock, so the state
 * a rock arrives on the field in is the state the page opens on.
 */
export const METEOR_HIT_POSE: Pose = {
  name: "METEOR · A SHOT ARRIVING",
  note: "An unmarked rock with a shot still climbing towards it. Shooting a rock does not shrink it, slow it or break it — it only leaves craters. The craters are how the game says so, and here you watch the first one open.",
  lookAt: "the face of the rock before anything has hit it, and the crater the next shot opens",
  crop: "tile",
  at: firstOfKind("meteor"),
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = fresh([rock(COL)]);
    // The cannon is lined up and nothing has been fired: `holes` is still 0
    // when the pair is handed the world, which is the whole change.
    const cmds: TimedCommand[] = [aim(0, COL), shoot(TPB, "red")];
    runUntil(w, "a bolt eleven tiles under the rock", cmds, (x) => {
      const b = x.bullets[0];
      const c = x.creatures[0];
      return b !== undefined && c !== undefined && b.row - c.row <= UNHIT_ROWS;
    });
    return w;
  },
};

/**
 * How far under the body the bolt is when the pair is handed the world.
 *
 * `METEOR · A SHOT ARRIVING`'s number and its reasoning, arrived at for the
 * same reason: a bolt covers twelve tiles a beat, so a handover two rows short
 * puts the kill on screen before anybody has looked at the body it happened to.
 * Six is half a beat of a whole, living slick — long enough to have seen what
 * is about to come apart, which is the only way a break means anything.
 */
const UNBROKEN_ROWS = 6;

/**
 * How many rows short of the hull the body is when the shot is fired.
 *
 * Three, and the number is the whole of why this pose works. A slick shot where
 * it spawns dies at the top of the field, well outside the crop that contains
 * the ship — so the pair watched an empty lane and the debris fell out of the
 * picture. Killed three rows up, the break happens over the hull and the pieces
 * land on it, which is half of what the candidate is claiming.
 */
const ROWS_ABOVE_HULL = 3;

/**
 * A slick over the ship with a matching bolt still climbing at it: the kill
 * itself, replayed.
 *
 * The pose `creature:break` is judged on, and the only one on this page whose
 * whole subject happens *after* the body is gone. So it is handed over before
 * the shot lands rather than after — a pose held on the frame of the burst
 * would show the pair a picture of debris and never the body it used to be, and
 * half of what a break has to do is say **which creature that was**.
 *
 * Red, and therefore a slick (`living` asks `kindForColor`), because a slick is
 * the body the pair sees most and the one a break has to work on first.
 */
export const BREAK_POSE: Pose = {
  name: "BREAK · A BODY COMING APART",
  note: "A living slick three rows over the ship with a red bolt half a beat under it. The shot lands, the body is destroyed, and whatever the kill leaves behind happens where you are already looking.",
  lookAt: "the moment the body stops being a body — what is left of it, and where that goes",
  // The ship and the rows above it, not the tile. A tile crop is centred on the
  // body the pose is named after, and this is the one pose whose body **stops
  // existing** halfway through: the crop then falls back to the middle of the
  // field and photographs an empty lane.
  crop: "ship",
  cadenceSeconds: EVENT_CADENCE_SECONDS,
  build: () => {
    const w = fresh([living("red", COL)]);
    // Let it come down over the ship first. The cannon lines up while it falls,
    // so nothing is pressed after the handover — `pose-kit.ts`'s rule.
    runUntil(
      w,
      "a slick three rows over the hull",
      [aim(0, COL)],
      (x) => (x.creatures[0]?.row ?? 0) >= x.cfg.rows - 1 - ROWS_ABOVE_HULL,
    );
    const cmds: TimedCommand[] = [shoot(w.tick, "red")];
    runUntil(w, "a bolt six tiles under a slick", cmds, (x) => {
      const b = x.bullets[0];
      const c = x.creatures[0];
      return b !== undefined && c !== undefined && b.row - c.row <= UNBROKEN_ROWS;
    });
    return w;
  },
};

/**
 * The columns the four rocks come down in, in the order they are authored.
 *
 * Four different places across an eleven-column hull, and deliberately not a
 * sweep from one side to the other: the pair is being asked whether a hull
 * carrying several holes at once still reads as a ship, and a tidy left-to-
 * right march would read as a pattern somebody drew rather than as damage the
 * run happened to take. Column 5 is left alone in all four, because the cannon
 * and the shield both sit at the middle by default (`config-derived.ts`) and a
 * hole under either of them is a hole nobody can see.
 */
const HOLE_COLS = [3, 9, 6, 1];

/**
 * Which of the four is authored two tiles wide (`RockSize`).
 *
 * One of them, and it is the one this pose would be dishonest without: a wide
 * rock scars both its columns and gets a **single wide hole** between them
 * (`craters.ts`), which is the largest a crater ever gets and therefore the
 * hardest case for anything drawn around one. A sheet of four identical small
 * dents would let a candidate pass on the easy size alone.
 */
const WIDE = 2;

/** Beats between one rock being authored and the next. They fall at the same
 * speed, so this is also the gap between one hole opening and the next: at the
 * default tempo a little over a second, which is long enough for each arrival
 * to be its own event rather than part of a barrage. */
const HOLE_GAP_BEATS = 2;

/**
 * Seconds between replays of the whole arrival.
 *
 * Not `EVENT_CADENCE_SECONDS`, and the difference is the pose rather than a
 * preference. Two seconds is the owner's number for *one* impact repeating,
 * and this is a sequence: three more rocks land over the first three and a
 * half seconds, the last of them lies in its hole for another beat and then
 * takes a second and a half to roll off the field, and only then is the fourth
 * hole open to be looked at. Cutting the clock before that would replay the
 * arrival and never once show what the hull ends up wearing, which is the
 * whole question. What is left over is a couple of seconds with nothing moving
 * and five holes across the ship — the part a vote is actually cast on.
 */
const BREACH_CADENCE_SECONDS = 7.5;

/**
 * Four rocks coming down in four columns, going through the hull and rolling
 * off it — the state `ship:crater` is judged on.
 *
 * `BREACH · A SCAR` (`poses-mechanics.ts`) is the still beside this one and
 * stays what it is: one hole, held, as a reference card. This is the moving
 * answer to the same subject, and the owner asked for it by name on 9
 * September 2026 — *"i need to see full animated sequence. several meteors
 * from different horizontal places crashing into ship and then removing from
 * there"*. It is not an exception to `docs/versus.md`'s still-by-default rule
 * so much as the case that rule already allowed: a crater is *revealed* by the
 * rock leaving, so the look does not exist on a frame until something has
 * moved, and the risk this candidate carries — that a hull wearing several
 * holes stops reading as one surface — cannot be seen on a picture of one.
 *
 * **The first hole is already cut when the pair takes the world over**, and
 * that is the reason for the eight ticks after `until`. A world handed over on
 * the exact tick its scar was pushed still carries the `breach` event in
 * `world.events`, and `versus-pair.ts` seeds the renderer from it — so the
 * first rock would replay its own landing and lie in the hole for a beat, and
 * for the first second of every loop there would be no crater on screen at
 * all. Eight ticks is long enough for the event to have been stepped past and
 * short enough that the three rocks behind it have not moved a row.
 */
export const BREACH_ROCKS_POSE: Pose = {
  name: "BREACH · ROCKS COMING THROUGH",
  note: "Four rocks come down in four different columns and nobody arms the shield, so every one of them goes through. Each sinks into the skin, lies there a moment and then rolls off the field, and the hole it made is only there to look at once it has gone. The third rock is two tiles wide and leaves one wide hole rather than two small ones.",
  lookAt:
    "each hole as the rock rolls off it — the skin right around the hole, and the crack running out of its rim",
  crop: "ship",
  cadenceSeconds: BREACH_CADENCE_SECONDS,
  build: () => {
    const queue: SpawnEntry[] = HOLE_COLS.map((col, i) => ({
      beat: i * HOLE_GAP_BEATS,
      col,
      kind: "meteorMedium",
      color: null,
      ...(i === WIDE ? { span: 2 as const } : {}),
    }));
    const w = fresh(queue);
    // Nothing is pressed at all: the shield turns a rock only while it is
    // armed (`hull.ts`), and nobody has armed it, so all four go through
    // wherever they were authored.
    until(w, "the first hole cut in the hull", (x) => x.scars.length > 0);
    run(w, 8);
    return w;
  },
};
