import {
  chokeIsStuck,
  createWorld,
  DEFAULT_CONFIG,
  gumIsStuck,
  type SpawnEntry,
  startWave,
  type TimedCommand,
  wardenTether,
} from "@neon-spore/sim";
import {
  firstOfKind,
  fresh,
  type Pose,
  type PoseGroup,
  pullCord,
  run,
  POSE_TPB as TPB,
  until,
} from "./pose-kit.js";

/**
 * The states the ON THE FIELD tab needed a picture of and the gallery did not
 * have.
 *
 * On 12 September 2026 the owner asked for *images for every "On the Field"
 * control*. Most rows could point at a pose that already existed — the grip,
 * the cannon at rest, the shield armed, the lid's eye open — and five could
 * not: nothing in the gallery had a rope held taut, a balloon with both hands
 * on it, a gum or a choke actually stuck to the ship, or the ready circles of
 * a guide. These are those five. `field-controls-page.ts` names them by their
 * `name`, and `field-control-poses.test.ts` checks every name it uses is here
 * or in another group.
 *
 * Each is the state *the control is answered in* rather than the creature at
 * its most typical, because that is what a reader of that tab is asking: what
 * does the field look like at the moment my thumb is on this.
 */

const COL = 5;

/** A hand on the field, on one seat. `fromMilli` is sideways; a balloon's
 * handle is carried sideways and nothing else. */
const drag = (
  tick: number,
  player: 1 | 2,
  target: "balloonLeft" | "balloonRight",
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

const GUM_STUCK: Pose = {
  name: "GUM · STUCK ON THE SHIP",
  note: "A gum that fell straight down the cannon's own lane and stuck where it landed. The cannon is under it and fires nothing; this is the frame player 2 swipes it in. Player 2's screen.",
  lookAt: "the smear on the hull over the cannon — that is what the thumb lands on",
  crop: "ship",
  role: "p2",
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL, kind: "gum", color: null };
    const w = fresh([entry]);
    until(w, "a gum stuck to the ship", (x) => x.creatures.some(gumIsStuck));
    run(w, TPB);
    return w;
  },
};

const CHOKE_STUCK: Pose = {
  name: "CHOKE · ON THE CANNON",
  note: "A choke that fell two lanes over and, on landing, went along the hull to the cannon and took it. The strip answers nobody now; every fresh press on it loosens the grip by one. Player 1's screen.",
  lookAt: "the loops round the cannon, and the strip under them that the taps land on",
  crop: "ship",
  role: "p1",
  build: () => {
    const entry: SpawnEntry = { beat: 0, col: COL - 2, kind: "choke", color: null };
    const w = fresh([entry]);
    until(w, "a choke on the cannon", (x) => x.creatures.some(chokeIsStuck));
    run(w, TPB * 2);
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
  poses: [TETHER_TAUT, BALLOON_HELD, GUM_STUCK, CHOKE_STUCK, GUIDE_HOLD],
};
