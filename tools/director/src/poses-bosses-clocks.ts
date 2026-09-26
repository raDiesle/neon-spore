import { lidHand } from "@neon-spore/hands";
import { vanePhase, wardenPhase } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The clock bosses' states** — a body or a fixture over the ordinary
 * field, with a beat count the pair has to say out loud (`docs/spec/
 * bosses.md` §11), posed at every phase its clock reaches on its own.
 *
 * What arrives unattended is what is here: THE STARE's whole cycle, THE
 * UNDERTOW's five of six, the first phase of each boss whose next phase is
 * something the pair has to *earn*, such as a plate off THE WARDEN. Those
 * are owed, named in each
 * group's note, and the pose that earns each sends the cannon's own commands
 * the way `poses-field-controls*.ts` already does for a handle.
 */

export const CLOCK_BOSS_POSES: Pose[] = [
  bossPose(
    "warden",
    "watch",
    "Every plate on and the eye drifts a column a beat. P1 hauls the rope; P2 fires through the hole.",
    {
      want: (w) => w.boss?.kind === "warden" && wardenPhase(w.boss.plates).name === "WATCH",
      hold: 6,
    },
  ),
  bossPose(
    "vane",
    "swing",
    "Every pin in and the vane sweeps two columns. P1 pins the arm; P2 fires up the split.",
    { want: (w) => w.boss?.kind === "vane" && vanePhase(w.boss.pins).name === "SWING", hold: 6 },
  ),
  bossPose(
    "stare",
    "away",
    "The eye is turned away and nothing costs. P1 aims; P2 fires — the wave plays as written.",
    { hold: 6 },
  ),
  bossPose(
    "stare",
    "turning",
    "The eye names who it will watch. Only the seat it is not watching is told, so P1 or P2 must say it.",
    { hold: 6 },
  ),
  bossPose(
    "stare",
    "looking",
    "The eye is on one seat. That seat keeps its thumbs off; the other plays on. P1 and P2 swap as it turns.",
    { hold: 6 },
  ),
  bossPose(
    "stare",
    "back",
    "The eye turns away again. The watched seat is free, and P1 and P2 both press once more.",
    { hold: 3 },
  ),
  bossPose(
    "stare",
    "shut",
    "P2 pulls the lid down over the eye and P1 is free — or the other way round. It strains under the thumb.",
    { hand: lidHand(false), hold: 2 },
  ),
  bossPose(
    "stare",
    "opening",
    "The thumb lifts and the lid rises. The eye watches whoever pulled it, so P1 or P2 gets off the glass.",
    { hand: lidHand(true), hold: 1 },
  ),
  bossPose(
    "baton",
    "unfolding",
    "The arm unfolds a socket a beat. P1 counts the sockets; P2 counts with him — nothing to press.",
    { hold: 6 },
  ),
  bossPose(
    "baton",
    "passing",
    "Beads pass down the arm. P1 triggers one sitting in a socket; P2 bolts one in the air.",
    { hold: 12 },
  ),
  bossPose(
    "throat",
    "still",
    "The mouth hangs over the middle, rings taut, the inhale slow. P1 holds the haul; P2 holds a gum.",
    { hold: 12 },
  ),
  bossPose(
    "undertow",
    "one",
    "One lobe at a time out of the floor. P1 opens the maw under it; P2 says which column bows.",
    { hold: 12 },
  ),
  bossPose(
    "undertow",
    "two",
    "Two lobes at once, four columns apart. P1 takes one with the maw; P2 stands the plate on the other.",
    { hold: 12, budgetBeats: 80 },
  ),
  bossPose(
    "undertow",
    "hard",
    "A lobe too tall for the maw. P1 aims under it; P2 primes — only the beam takes it.",
    { hold: 12, budgetBeats: 120 },
  ),
  bossPose(
    "undertow",
    "seat",
    "The floor bows under the cannon itself. P2 sees which column; P1 slides the cannon off it.",
    { hold: 12, budgetBeats: 160 },
  ),
  bossPose(
    "undertow",
    "last",
    "Every seam lit and one lobe in the middle that will not go. P1 holds the maw open; P2 waits.",
    { hold: 12, budgetBeats: 170 },
  ),
  bossPose(
    "instar",
    "morph",
    "The body morphs with its marks hidden. P1 reads his marks; P2 reads hers — the window is shut.",
    { hold: 6 },
  ),
  bossPose(
    "instar",
    "act",
    "The marks are up and the window closing. P1 pulls his side of the part; P2 pulls hers.",
    { hold: 6 },
  ),
  bossPose(
    "gimbal",
    "still",
    "The drum hangs between two dark rings. P1 and P2 both wait: no mark is up on either rim yet.",
    { hold: 6 },
  ),
  bossPose(
    "gimbal",
    "turn",
    "A mark on each rim. P1 turns the outer ring to his; P2 turns the inner one to hers.",
    { hold: 6 },
  ),
  bossPose(
    "hasp",
    "still",
    "The door of three clasps hangs shut over the field. P1 and P2 both wait: no latch is lit yet.",
    { hold: 6 },
  ),
  bossPose(
    "hasp",
    "work",
    "A clasp lit and its latch cool. P1 holds the latch down; P2 turns the wheel while he holds it.",
    { hold: 6 },
  ),
  bossPose(
    "filament",
    "arm",
    "One filament lit at its free end. P1 draws the lit end a tile a beat; P2 follows a tile behind.",
    { hold: 6 },
  ),
  bossPose(
    "spool",
    "taut",
    "The spool hangs still, its line already run to the hull. P1 waits with his thumb off the brake; P2 waits.",
    { hold: 6 },
  ),
  bossPose(
    "spool",
    "pay",
    "The line is running. P1 holds the brake at a depth; P2 reads the zone and says deeper or shallower.",
    { hold: 6 },
  ),
];
