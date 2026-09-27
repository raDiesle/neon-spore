import type { CystStep, TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB } from "./pose-kit.js";

/**
 * THE CYST's four hands: a flank tapped still by one seat and pinched shut by
 * the other, **one instant photographed twice** — from the seat that tapped
 * and the seat that pinches — once a flank, because both screens draw the
 * whole sac and the point of the fight is that the two handles on one flank
 * are on two phones. A gallery pose is run to, never set
 * (`.claude/skills/new-boss` §4).
 */

/** The flank asked first, so the one step lit is the one tapped and pinched. */
const flankFirst = (ask: "left" | "right"): CystStep[] => [
  { ask, color: "either", beats: 4 },
  { ask: "fire", color: "red", beats: 3 },
];

/** A pinch well under `cystShutMilli`. */
const SHUT_GAP = 400;

/** Flank `side` lit, its mark tapped by the partner, then pinched shut for a beat and a half. */
function stilled(side: 0 | 1): () => World {
  return () => {
    const w = fresh([], [], { kind: "cyst", steps: flankFirst(side === 0 ? "left" : "right") });
    runUntil(w, "the flank", [], (x) => x.boss?.kind === "cyst" && x.boss.phase === "lit");
    const t = w.tick;
    const pincher = side === 0 ? 1 : 2;
    const tapper = side === 0 ? 2 : 1;
    const target = side === 0 ? "cystFreezeLeft" : "cystFreezeRight";
    const mark = (tick: number, on: boolean): TimedCommand => ({
      tick,
      player: tapper,
      command: { kind: "drag", target, on, fromMilli: 0 },
    });
    const tap = mark(t, true);
    const lift = mark(t + Math.round(TPB / 4), false);
    const pinch: TimedCommand = {
      tick: t + 1,
      player: pincher,
      command: {
        kind: "drag",
        target: side === 0 ? "cystFlankLeft" : "cystFlankRight",
        on: true,
        fromMilli: SHUT_GAP,
      },
    };
    run(w, TPB + TPB / 2, [tap, lift, pinch]);
    return w;
  };
}

const SAC =
  "THE CYST over the middle column: a sac of two flanks, each with a freeze mark standing off its side.";

const note = (flank: "left" | "right", tapper: string, pincher: string) =>
  `${SAC} The ${flank} flank's step is lit; ${tapper} tapped its mark and it has stopped shuddering, and ${pincher} has held it pinched shut for a beat and a half.`;

const CYST_LEFT_STILLED: Pose = {
  name: "CYST · THE LEFT FLANK STILLED",
  note: `${note("left", "player 2", "player 1")} Player 2's screen, whose tap it was.`,
  lookAt:
    "whether the stilled flank reads as *my tap did that* on the seat that is not pinching it",
  crop: "field",
  role: "p2",
  build: stilled(0),
};

const CYST_LEFT_PINCHED: Pose = {
  name: "CYST · THE LEFT FLANK PINCHED",
  note: `${note("left", "player 2", "player 1")} Player 1's screen, the same instant.`,
  lookAt:
    "whether the pinched flank reads as held shut, and as his, while the mark beside it is hers",
  crop: "field",
  role: "p1",
  build: stilled(0),
};

const CYST_RIGHT_STILLED: Pose = {
  name: "CYST · THE RIGHT FLANK STILLED",
  note: `${note("right", "player 1", "player 2")} Player 1's screen, whose tap it was.`,
  lookAt: "whether the pilot's mark reads as on the far side from his own pinch, and as his",
  crop: "field",
  role: "p1",
  build: stilled(1),
};

const CYST_RIGHT_PINCHED: Pose = {
  name: "CYST · THE RIGHT FLANK PINCHED",
  note: `${note("right", "player 1", "player 2")} Player 2's screen, the same instant.`,
  lookAt: "whether the right flank shut under her fingers reads as the other half of his tap",
  crop: "field",
  role: "p2",
  build: stilled(1),
};

export const CYST_GRIPS: readonly Pose[] = [
  CYST_LEFT_STILLED,
  CYST_LEFT_PINCHED,
  CYST_RIGHT_STILLED,
  CYST_RIGHT_PINCHED,
];
