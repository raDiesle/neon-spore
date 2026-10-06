import { stareHand, undertowHand } from "@neon-spore/hands";
import { vanePhase, wardenPhase } from "@neon-spore/sim";
import type { Pose } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The clock bosses' states** — a body or a fixture over the ordinary
 * field, with a beat count the pair has to say out loud (`docs/spec/
 * bosses.md` §11), posed at every phase its clock reaches on its own.
 *
 * What arrives unattended is what is here: THE STARE's rest, blue pass,
 * live pass and charge (its climb and its end are earned, by `stareHand`), THE
 * UNDERTOW's levels and its tall lobe, the first phase of each boss whose next phase is
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
    "rest",
    "The eye is shut and nothing costs. P1 and P2 get ready: its rhythm is next.",
    { hold: 1 },
  ),
  bossPose(
    "stare",
    "teach",
    "The eye glows blue and plays its rhythm once. Nothing costs: P1 and P2 count the open beats.",
    { hold: 6, lookAt: "the blue eye opening on its beats, and the score under it" },
  ),
  bossPose(
    "stare",
    "live",
    "The rhythm for real. On an open beat P1 and P2 both touch nothing. Nothing hurts the eye.",
    { hold: 6, lookAt: "the red eye in the cowl, open or shut on this beat" },
  ),
  bossPose(
    "stare",
    "charge",
    "The eye charges a beam. P1 and P2 pull its lashes up, every one, before it fires.",
    { hold: 6 },
  ),
  bossPose(
    "stare",
    "rise",
    "Five turns survived: the eye rises to its next level, angrier. P1 and P2 get ready for its rhythm.",
    { hand: stareHand, hold: 1, budgetBeats: 150 },
  ),
  bossPose(
    "stare",
    "calm",
    "The last level survived: the eye closes. P1 and P2 have won the wave.",
    {
      hand: stareHand,
      hold: 1,
      budgetBeats: 600,
    },
  ),
  bossPose(
    "baton",
    "unfolding",
    "The arm unfolds, top socket to bottom. P1 and P2 watch it come — nothing to press yet.",
    { hold: 6 },
  ),
  bossPose(
    "baton",
    "passing",
    "Beads pass down the arm. P1 triggers one sitting in a socket; P2 bolts one in the air.",
    { hold: 12 },
  ),
  bossPose(
    "undertow",
    "one",
    "One lobe up, left standing until it grows tall. P1 or P2 taps it down; SUCK under yellow, SHIELD over cyan.",
    {
      want: (w) => w.boss?.kind === "undertow" && w.boss.lobes.some((b) => b.stage === "tall"),
      hold: 12,
      budgetBeats: 24,
    },
  ),
  bossPose(
    "undertow",
    "two",
    "Two lobes at once. P1 takes the yellow with the cannon; P2 moves the shield under the cyan.",
    { hand: undertowHand, hold: 12, budgetBeats: 80 },
  ),
  bossPose(
    "undertow",
    "three",
    "Three lobes and the clock nearly out. P1 sucks the yellow; P2 shields the cyan; whoever is free taps a tall one.",
    { hand: undertowHand, hold: 12, budgetBeats: 140 },
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
