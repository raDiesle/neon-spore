import { stareBoss, stareLidFree, vanePhase, wardenPhase } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";
import { bossPose, type Hand } from "./poses-bosses-kit.js";

/**
 * The free seat's thumb on THE STARE's lid: pulled to the bottom the tick
 * the eye looks at the other seat, and lifted the tick after it is shut.
 * The hand is read every tick, so it grabs whichever seat is free that
 * look (`sim/stare-hand.ts`).
 */
const lidHand =
  (lift: boolean): Hand =>
  (w) => {
    const s = stareBoss(w);
    if (s === null) return [];
    if (s.phase === "shut")
      return lift
        ? [
            {
              player: s.lidSeat as 1 | 2,
              command: { kind: "drag", target: "stareLid", on: false, fromMilli: 0 },
            },
          ]
        : [];
    const player = stareLidFree(s, 1) ? 1 : stareLidFree(s, 2) ? 2 : null;
    if (player === null) return [];
    const fromYMilli = w.cfg.stareLidPullMilli;
    return [
      { player, command: { kind: "drag", target: "stareLid", on: true, fromMilli: 0, fromYMilli } },
    ];
  };

/**
 * **The clock bosses' states** — a body or a fixture over the ordinary
 * field, with a beat count the pair has to say out loud (`docs/spec/
 * bosses.md` §11), posed at every phase its clock reaches on its own.
 *
 * What arrives unattended is what is here: THE STARE's whole cycle, THE
 * UNDERTOW's five of six, the first phase of each boss whose next phase is
 * something the pair has to *earn* — a plate off THE WARDEN, a ring off THE
 * ORRERY, a chamber struck on THE DIASTOLE. Those are owed, named in each
 * group's note, and the pose that earns each sends the cannon's own commands
 * the way `poses-field-controls*.ts` already does for a handle.
 */

export const CLOCK_BOSS_POSES: Pose[] = [
  bossPose(
    "warden",
    "watch",
    "Every plate on: the eye drifts a column a beat inside the rim, and the cycle throws its tether onto one of the two sliding controls. The hole through it is the shot.",
    {
      want: (w) => w.boss?.kind === "warden" && wardenPhase(w.boss.plates).name === "WATCH",
      hold: 6,
    },
  ),
  bossPose(
    "vane",
    "swing",
    "Every pin in: the vane swings its two columns of reach and throws what the wave sends it, the pivot column the one thing that never moves.",
    { want: (w) => w.boss?.kind === "vane" && vanePhase(w.boss.pins).name === "SWING", hold: 6 },
  ),
  bossPose(
    "stare",
    "away",
    "The eye turned away. Nothing costs anything; the wave the author wrote plays as written, and the pair has the away window to spend.",
    { hold: 6 },
  ),
  bossPose(
    "stare",
    "turning",
    "The eye turning: the boss announcing which seat it will look at next, with the beats to read the announcement in. This is the state the owner asked for by name.",
    { hold: 6 },
  ),
  bossPose(
    "stare",
    "looking",
    "The eye on one seat. Every press that seat makes while it is looked at costs, and the other seat plays on as if nothing had happened.",
    { hold: 6 },
  ),
  bossPose(
    "stare",
    "back",
    "The eye turning back away, the beats in which the looked-at seat learns it can move again.",
    { hold: 3 },
  ),
  bossPose(
    "stare",
    "shut",
    "The lid pulled down over the eye by the seat it was not looking at. The watched seat is free; the eye strains under the thumb for stareLidHoldBeats, or until it lifts.",
    { hand: lidHand(false), hold: 2 },
  ),
  bossPose(
    "stare",
    "opening",
    "The thumb has lifted and the lid is rising. The eye will look at the seat that pulled it — no roll, no announcement — and that seat has stareReopenBeats to get off the glass.",
    { hand: lidHand(true), hold: 1 },
  ),
  bossPose(
    "diastole",
    "one",
    "The left chamber beats alone and ordinary shots land on it. The right hangs dark; the cadence to count is one.",
    { hold: 12 },
  ),
  bossPose(
    "baton",
    "unfolding",
    "The arm unfolding downward, one socket a beat. Nothing to press yet; the pair counts the sockets as they come.",
    { hold: 6 },
  ),
  bossPose(
    "baton",
    "passing",
    "Beads being passed down the arm: each sitting in a socket, where player 1 may launch it, or in the air between two, where player 2 may strike it.",
    { hold: 12 },
  ),
  bossPose(
    "throat",
    "still",
    "The mouth hanging over the middle column and not moving, its rings all taut. The inhale is on its slowest count.",
    { hold: 12 },
  ),
  bossPose(
    "undertow",
    "one",
    "One lobe at a time out of the floor; the maw alone answers it. The pair learns which column bows before it opens.",
    { hold: 12 },
  ),
  bossPose(
    "undertow",
    "two",
    "Two lobes at once, four columns apart: the maw reaches one, and the plate has to stand on the other or it widens.",
    { hold: 12 },
  ),
  bossPose(
    "undertow",
    "hard",
    "A lobe too tall for the maw. Only the beam takes it, which is the first time the fight asks for the lance.",
    { hold: 12, budgetBeats: 100 },
  ),
  bossPose(
    "undertow",
    "seat",
    "The floor bowing under the cannon itself. It has to be slid off the bowing column, and the seat that slides it is not the seat that sees it.",
    { hold: 12, budgetBeats: 120 },
  ),
  bossPose(
    "undertow",
    "last",
    "Every seam lit and one lobe in the middle that does not withdraw. The whole field is the tell now.",
    { hold: 12, budgetBeats: 130 },
  ),
  bossPose(
    "orrery",
    "rings",
    "Three orbits turning and nothing coming down. The pair is learning what each of them can see of the rings.",
    { hold: 12 },
  ),
  bossPose(
    "candle",
    "dark",
    "The light going out: the field black, the glow at the top full and not moving yet. Only what the pair's own shots throw lights a column.",
    { hold: 3 },
  ),
  bossPose(
    "candle",
    "full",
    "The glow drifts and the pair fires at it. Every shot, plate and beam lights the column it was made in for a beat; any colour dims the glow a step.",
    { hold: 12 },
  ),
  bossPose(
    "instar",
    "morph",
    "The body morphing into its next pose with its marks hidden: the gape coming, the window not open. The beats in which the pair reads what part will be asked for.",
    { hold: 6 },
  ),
  bossPose(
    "instar",
    "act",
    "The marks up and the window open: each ring on the part it moves, the pilot's bright on his screen and the navigator's on hers, the window ring closing in.",
    { hold: 6 },
  ),
  bossPose(
    "filament",
    "arm",
    "The bundle over the field, one filament lit at its free end and no further: the tile the pilot's thumb lands on, the tile the navigator's waits behind.",
    { hold: 6 },
  ),
];
