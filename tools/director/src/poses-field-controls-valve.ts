import type { TimedCommand, World } from "@neon-spore/sim";
import { fresh, type Pose, run, runUntil, POSE_TPB as TPB, until } from "./pose-kit.js";

/**
 * THE VALVE's two hands, **each photographed from the seat whose half it
 * is**: the pilot's wheel turned onto its mark, and the pin the navigator's
 * tap has frozen. A gallery pose is run to, never set (`.claude/skills/new-boss` §4).
 */

/** Act 11's drum, the first mark a quarter-turn round. */
const DRUM = { kind: "valve", marks: [250, 600, 850] } as const;

const wheel = (tick: number, fromMilli: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "drag", target: "valveWheel", on: true, fromMilli },
});

/** The first mark lit, and the pilot's hand turning the wheel onto it: the freeze window open. */
function held(): World {
  const w = fresh([], [], DRUM);
  until(w, "the first mark lit", (x) => x.boss?.kind === "valve" && x.boss.phase === "turn");
  const t = w.tick;
  runUntil(
    w,
    "the wheel on its mark",
    [wheel(t, 0), wheel(t, 125), wheel(t, 250)],
    (x) => x.boss?.kind === "valve" && x.boss.phase === "hold",
  );
  run(w, Math.round(TPB / 2));
  return w;
}

/** That, and the navigator's tap on the socket: the wheel frozen and the live pin hanging long. */
function frozen(): World {
  const w = held();
  runUntil(
    w,
    "the wheel frozen",
    [
      {
        tick: w.tick,
        player: 2,
        command: { kind: "drag", target: "valvePin", on: true, fromMilli: 0 },
      },
    ],
    (x) => x.boss?.kind === "valve" && x.boss.phase === "frozen",
  );
  run(w, Math.round(TPB / 2));
  return w;
}

const DRUM_NOTE =
  "THE VALVE hung over the middle column: a squat notched drum, a wheel in its face with a white pointer, a socket beside it and three pins under it.";

const VALVE_WHEEL: Pose = {
  name: "VALVE · THE WHEEL TURNED ONTO ITS MARK",
  note: `${DRUM_NOTE} Player 1 has turned the wheel a quarter round, onto the first mark; the socket flashes on the beat, the freeze window's arc closing round it. Player 1's screen, the turner's.`,
  lookAt:
    "whether the wheel reads as a thing a thumb turns round its hub, and the flashing socket as *now* for the other seat",
  crop: "field",
  role: "p1",
  build: held,
};

const VALVE_PIN: Pose = {
  name: "VALVE · THE LIVE PIN FROZEN",
  note: `${DRUM_NOTE} Player 2 has tapped the socket: the wheel stands still, the socket glows steady and the left pin hangs longer than the rest, lit white, the pull's arc closing. Player 2's screen, the tapper's.`,
  lookAt:
    "whether the long lit pin reads as *draw me down*, and the still wheel as frozen rather than stopped",
  crop: "field",
  role: "p2",
  build: frozen,
};

export const VALVE_GRIPS: readonly Pose[] = [VALVE_WHEEL, VALVE_PIN];
