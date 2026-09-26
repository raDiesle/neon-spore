import {
  createWorld,
  DEFAULT_CONFIG,
  gumIsFlung,
  type SpawnEntry,
  startWave,
  type TimedCommand,
  wardenTether,
} from "@neon-spore/sim";
import {
  firstOfKind,
  fresh,
  hold,
  type Pose,
  type PoseGroup,
  pullCord,
  run,
  runUntil,
  POSE_TPB as TPB,
  until,
} from "./pose-kit.js";
import { ANTIPHON_PULL, ANTIPHON_TURN } from "./poses-field-controls-antiphon.js";
import { DARK_LIGHT } from "./poses-field-controls-dark.js";
import { GIMBAL_GRIPS } from "./poses-field-controls-gimbal.js";
import { HASP_GRIPS } from "./poses-field-controls-hasp.js";
import { INSTAR_PULL } from "./poses-field-controls-instar.js";
import { KEEL_GRIPS } from "./poses-field-controls-keel.js";
import { MANTLE_GRIPS } from "./poses-field-controls-mantle.js";
import { RATCHET_GRIPS } from "./poses-field-controls-ratchet.js";
import { SINEW_PULL } from "./poses-field-controls-sinew.js";
import { SPOOL_BRAKE } from "./poses-field-controls-spool.js";
import { SURGE_HOLD } from "./poses-field-controls-surge.js";

/**
 * The states the ON THE FIELD tab needed a picture of and the gallery did not
 * have.
 *
 * On 12 September 2026 the owner asked for *images for every "On the Field"
 * control*. Most rows could point at a pose that already existed — the grip,
 * the cannon at rest, the shield armed, the lid's eye open — and four could
 * not: nothing in the gallery had a rope held taut, a balloon with both hands
 * on it, a gum in flight off a swipe, or the ready circles of a guide.
 * These are those four. `field-controls-page.ts` names them by their
 * `name`, and `field-control-poses.test.ts` checks every name it uses is here
 * or in another group.
 *
 * Each is the state *the control is answered in* rather than the creature at
 * its most typical, because that is what a reader of that tab is asking: what
 * does the field look like at the moment my thumb is on this.
 */

const COL = 5;

/** A hand on the field, on one seat. `fromMilli` is sideways; a balloon's
 * handle is carried sideways and nothing else, and so is a held gum. */
const drag = (
  tick: number,
  player: 1 | 2,
  target: "balloonLeft" | "balloonRight" | "gripBody",
  id: number,
  fromMilli: number,
): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target, on: true, fromMilli, id },
});

const TETHER_TAUT: Pose = {
  name: "TETHER · HELD TAUT",
  note: "THE WARDEN across the middle of the field with the pilot's thumb on its rope, pulled down until the line is taut and the hatch in the eye is open. Player 1's screen: this is the pilot's control and the rope is drawn for the pull.",
  lookAt:
    "the line from the eye down to the handle — it is taut, and the hatch above it is open; the four looks under THE WARDEN'S TETHER on the CONTROLS tab are this same frame",
  crop: "field",
  role: "p1",
  build: () => {
    const w = fresh([], [], { kind: "warden" });
    until(w, "a rope hanging from the warden", (x) => wardenTether(x) !== null);
    run(w, TPB * 2);
    const rope = wardenTether(w);
    if (rope === null) throw new Error("the rope went before it was pulled");
    // The grab, then the pull: the first message is where the hand took hold
    // (`warden-rope.ts`), and only the second carries any distance.
    const reach = Math.round(w.cfg.wardenTautMilli * 1.2);
    run(w, Math.round(TPB / 2), [
      pullCord(w.tick, rope.id, 0, "wardenTether"),
      pullCord(w.tick + 1, rope.id, reach, "wardenTether"),
    ]);
    return w;
  },
};

const BALLOON_HELD: Pose = {
  name: "BALLOON · BOTH HANDS TAUT",
  note: "One balloon with a hand on each handle, both carried outward past taut on the same beat. The skin is at full stretch and its glow is coming up; held like this for balloonHoldBeats it gives. Player 1's screen, though both draw both handles.",
  lookAt: "the two handles either side of the body, both drawn out, and the skin between them",
  crop: "tile",
  span: 4.5,
  role: "p1",
  at: firstOfKind("balloon"),
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "balloon", color: null };
    const w = fresh([entry]);
    run(w, TPB * 2);
    const b = w.creatures.find((c) => c.kind === "balloon");
    if (b === undefined) throw new Error("no balloon on the field");
    const reach = Math.round(w.cfg.balloonTautMilli * 1.2);
    // Half a beat with both taut: inside the hold, so the skin has not given.
    run(w, Math.round(TPB / 2), [
      drag(w.tick, 1, "balloonLeft", b.id, -reach),
      drag(w.tick, 2, "balloonRight", b.id, reach),
    ]);
    return w;
  },
};

const GUM_FLUNG: Pose = {
  name: "GUM · FLUNG OUT OF THE FIELD",
  note: "A gum halfway down its lane, taken by a thumb and swiped to the right: it has left the lane and is flying out level along its row, its drops trailing behind it. Either seat can do this; player 2's screen, the seat whose radar showed it coming down.",
  lookAt:
    "the drop to the right of the lane it was falling down, leaning the way it is going, with its trail behind it — that lean is the swipe",
  crop: "field",
  role: "p2",
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "gum", color: null };
    const w = fresh([entry]);
    run(w, TPB * 4);
    const gum = w.creatures.find((c) => c.kind === "gum");
    if (!gum) throw new Error("no gum on the field");
    // A swipe's worth is `gumSwipeMilli` of cumulative travel; walked there
    // over half a beat rather than in one jump, which is what a thumb does.
    const cmds: TimedCommand[] = [hold(w.tick, 2, gum.id)];
    const reach = w.cfg.gumSwipeMilli + 100;
    for (let i = 1; i <= 12; i++)
      cmds.push(drag(w.tick + i * 3, 2, "gripBody", gum.id, Math.round((i / 12) * reach)));
    runUntil(w, "a gum in flight", cmds, (x) => x.creatures.some(gumIsFlung));
    run(w, Math.round(TPB / 2));
    return w;
  },
};

/**
 * The ready gate is the one state here `fresh` cannot make: a pose's world has
 * briefings off, and the guide is told to `startWave` rather than read off a
 * scene. Built by hand, with the same held hull every other pose has.
 */
const GUIDE_HOLD: Pose = {
  name: "GUIDE · THE READY CIRCLES",
  note: "The gate a guide ends on. Player 1's thumb is down and their circle is half full; player 2's is empty. The wave behind it starts once both are full, and a thumb lifted early empties its circle again. Player 1's screen.",
  lookAt: "the two circles — the left one filling under a thumb, the right one waiting",
  crop: "full",
  role: "p1",
  build: () => {
    const w = createWorld({ ...DEFAULT_CONFIG, hullInvulnerable: true, briefings: true }, 11);
    startWave(w, 0, [], [], null, true, 0);
    // Half the hold: `readyHoldMs` of ticks fills a circle (`sim/ready-gate.ts`).
    const half = Math.max(1, Math.round((w.cfg.readyHoldMs * w.cfg.tickHz) / 2000));
    run(w, TPB);
    run(w, half, [{ tick: w.tick, player: 1, command: { kind: "brief", on: true } }]);
    return w;
  },
};

export const FIELD_CONTROL_GROUP: PoseGroup = {
  title: "ON THE FIELD",
  note: "the moment a control touched on the field itself is answered in — controls.md, and the CONTROLS tab's ON THE FIELD page",
  // Every boss's is next door, one file each, and this one keeps the four
  // that belong to no boss: THE SURGE's, THE ANTIPHON's, THE INSTAR's, THE
  // GIMBAL's and THE SINEW's went out one at a time, each as this file
  // reached its limit again (`poses-field-controls-surge.ts`, `-antiphon.ts`,
  // `-instar.ts`, `-gimbal.ts`, `-sinew.ts`, `-spool.ts`, `-hasp.ts`,
  // `-ratchet.ts`).
  poses: [
    TETHER_TAUT,
    BALLOON_HELD,
    GUM_FLUNG,
    SINEW_PULL,
    SURGE_HOLD,
    ANTIPHON_TURN,
    ANTIPHON_PULL,
    INSTAR_PULL,
    ...GIMBAL_GRIPS,
    SPOOL_BRAKE,
    ...HASP_GRIPS,
    ...RATCHET_GRIPS,
    ...MANTLE_GRIPS,
    ...KEEL_GRIPS,
    DARK_LIGHT,
    GUIDE_HOLD,
  ],
};
