import { controlSetForWave, setHas, WAVES } from "@neon-spore/content";
import { throatHand } from "@neon-spore/hands";
import { guardArmed, type SimEvent, type World } from "@neon-spore/sim";
import { fresh, guard, living, POSE_TPB, type Pose, run, runUntil, ward } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * The frames THE SHIELD's rows on CONTROLS › HELPERS are drawn in, where no
 * gallery pose and no pose in `helpers-poses.ts` ends on the moment
 * (`helpers-shield.ts`). Three of them are an event: the drawn phone is
 * handed `world.events` on its last frame only (`pose-frame.ts`), so each
 * of those runs until the tick that reports it and stops there.
 */

const COL = 5;

const reported = (type: SimEvent["type"]) => (w: World) => w.events.some((e) => e.type === type);

/** The guard pressed on every beat with the dome parked in `COL`. */
function guardedEveryBeat(beats: number) {
  const cmds = [ward(0, COL)];
  for (let b = 0; b < beats; b++) cmds.push(guard(b * POSE_TPB + 1));
  return cmds;
}

/**
 * The tick the shield throws a body back up: the rim red and the spray off
 * the dome (`shield-push-fx.ts`).
 */
export const PUSH_FLASH: Pose = {
  name: "HELPERS · THE SHIELD PUSHING A BODY",
  note: "The tick the shield throws a body back up.",
  crop: "ship",
  build: () => {
    const w = fresh([living("red", COL)]);
    runUntil(w, "a body pushed by the shield", guardedEveryBeat(40), reported("shieldPush"));
    return w;
  },
};

/**
 * The first wave whose panel has the SHIELD button on it. `fresh` stands
 * wave 0 by default, whose panel is the cannon and red alone, so a frame of
 * the band built there has no button to light.
 */
const GUARD_WAVE = WAVES.findIndex((_, i) => setHas(controlSetForWave(i), "guard"));

/** The shield in `COL` and pressed a beat in, on a panel with the button. */
function pressedOnce(): World {
  const w = fresh([], [], null, {}, GUARD_WAVE);
  run(w, POSE_TPB * 2, [ward(0, COL), guard(POSE_TPB)]);
  return w;
}

/** The SHIELD button lit, its window open. */
export const GUARD_LIT: Pose = {
  name: "HELPERS · THE SHIELD BUTTON LIT",
  note: "A press inside its window.",
  crop: "band",
  build: pressedOnce,
};

/** How many ticks after the guard shuts the frame is taken: the button still
 * well lit and already going out (`guard-lapse.ts`). */
const LAPSED_TICKS = 2;

/** The same press, its window just run out: the SHIELD button fading. */
export const GUARD_FADING: Pose = {
  name: "HELPERS · THE SHIELD GOING OUT",
  note: "A press whose window has just closed.",
  crop: "band",
  build: () => {
    const w = pressedOnce();
    runUntil(w, "the guard shut", [], (x) => !guardArmed(x));
    run(w, LAPSED_TICKS);
    return w;
  },
};

/**
 * A volley coming back off the shield: DEFLECTED over the hull. A rock's
 * word waits for the rock's last step down to the dome, which is render
 * time a posed frame does not have (`effects-ingest.ts`); a volley's comes
 * on the event itself, and it is the same word in the same place.
 */
export const VOLLEY_TURNED: Pose = {
  name: "HELPERS · A VOLLEY TURNED AWAY",
  note: "The tick the shield sends a volley back up.",
  crop: "ship",
  build: () => {
    const w = fresh([{ beat: 0, col: COL, kind: "volley", color: "red" }]);
    runUntil(w, "a volley warded", guardedEveryBeat(30), reported("volleyReturn"));
    return w;
  },
};

/** THE THROAT reaching `sucks` with the mouth set to the shield. */
const THROAT_SET = bossPose("throat", "sucks", "The mouth set to the shield for a meteor.", {
  hand: throatHand,
  want: (w) => w.boss?.kind === "throat" && w.boss.phase === "sucks" && w.boss.mode === "shield",
});

/** How long after the thumb lifts the frame is taken. */
const LIFTED_TICKS = 6;

/**
 * THE THROAT set to the shield for a meteor: the panel's SHIELD face inside
 * the mouth. The navigator's thumb is lifted off the mouth first, because her
 * handle and a thumb on it are drawn over the hole and hide the face.
 */
export const THROAT_SHIELD: Pose = {
  ...THROAT_SET,
  name: "HELPERS · THE THROAT SET TO SHIELD",
  // Cut round the mouth: at the size of the whole field the face is a dot.
  crop: "tile",
  span: 3,
  at: (w) =>
    w.boss?.kind === "throat"
      ? { col: w.boss.aimXMilli / 1000, row: w.boss.aimYMilli / 1000 }
      : { col: COL, row: 5 },
  build: () => {
    const w = THROAT_SET.build();
    const lift = { kind: "drag", target: "throatAim", on: false, fromMilli: 0 } as const;
    run(w, LIFTED_TICKS, [{ tick: w.tick, player: 2, command: lift }]);
    return w;
  },
};
