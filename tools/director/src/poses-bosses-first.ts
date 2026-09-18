import {
  antiphonDown,
  curtainCoreBare,
  fleetAfloat,
  gorgePhase,
  hiveOpenCount,
  leadRunning,
  leadShootable,
  ledgerPhase,
  repriseEchoing,
  scuttleAttached,
  sinewHeld,
  sinewSwinging,
  surgeInBand,
  surgeSealing,
  tasterPhase,
  type World,
} from "@neon-spore/sim";
import type { BossKind } from "./boss-states.js";
import { type Pose, POSE_TPB as TPB } from "./pose-kit.js";
import { bossPose } from "./poses-bosses-kit.js";

/**
 * **The state every field boss opens in**, and the one or two that come on
 * their own after it: what the pair sees before either has done anything.
 *
 * These bosses store no phase — their state is a predicate over their parts
 * (`boss-states.ts` `BY_HAND`) — so each pose says the predicate it waits
 * for. Nearly every one is the wave stood up and left a few beats: the
 * pile stacked, the chart afloat, the bulb shut. THE HIVE's first breach is
 * the exception worth having: it opens on the clock whatever the pair does,
 * so the sheet can show a breach without a hand in it. Every state a hand
 * brings on — a plate narrowed, a straw fed, a fibre held — is owed, and
 * `test/boss-states.test.ts` lists what.
 */

/** A world a few beats in, its boss the one asked for and nothing yet done to it. */
const stood = (kind: BossKind) => (w: World) => w.boss?.kind === kind && w.beat >= 2;

const F = "full" as const;

export const FIRST_BOSS_POSES: Pose[] = [
  bossPose(
    "fleet",
    "afloat",
    "The chart with every ship whole on it and the sights at rest. The pilot's screen shows where the ships lie; the navigator's shows only the squares and the sights she alone can move.",
    {
      crop: F,
      want: (w) => w.boss?.kind === "fleet" && fleetAfloat(w.boss) === w.boss.ships.length,
    },
  ),
  bossPose(
    "cairn",
    "stacked",
    "Seven of the field's own rocks piled five columns wide, standing still, with nothing fired able to reach them. A thumb on the pile carried sideways is the only thing that takes one off.",
    { want: stood("cairn"), hold: TPB * 2 },
  ),
  bossPose(
    "well",
    "projected",
    "The field drawn inside out on the pilot's screen: the ship at the centre, the far row a rim, the eleven columns spread round it as the hours of a clock. The navigator's screen is the field as it always is.",
    { crop: F, role: "p1", want: stood("well"), hold: TPB * 2 },
  ),
  bossPose(
    "splice",
    "feeding",
    "The row of mouths over the plating and a straw out of each, tangled through the others to a number at its far end. The first round is open and nothing has been fed yet.",
    { crop: F, want: stood("splice"), hold: TPB * 2 },
  ),
  bossPose(
    "reprise",
    "running",
    "The wave's first stretch falling in plain sight, before any of it is sent down again. Nothing about the field says it is being remembered.",
    { want: (w) => w.boss?.kind === "reprise" && !repriseEchoing(w) && w.beat >= 4 },
  ),
  bossPose(
    "gorge",
    "feeding",
    "The sack across the top of the field with an intake under each of its seven columns, every one of them empty. Whatever reaches the top of the field is swallowed and hangs inside as a bead.",
    {
      want: (w) =>
        w.boss?.kind === "gorge" && gorgePhase(w.boss, w.cfg) === "feeding" && w.beat >= 2,
    },
  ),
  bossPose(
    "curtain",
    "covered",
    "The membrane a row below the top of the field with every lobe on its hem, and the core hidden behind it in a column only the navigator is told. No shot reaches the core through the fabric.",
    { want: (w) => w.boss?.kind === "curtain" && !curtainCoreBare(w, w.boss) && w.beat >= 2 },
  ),
  bossPose(
    "taster",
    "opening",
    "The crest across the top of the field growing its first blades out of the middle. Each blade takes its edge from whichever colour the pair has fired more of, and nothing has been fired yet.",
    {
      want: (w) =>
        w.boss?.kind === "taster" && tasterPhase(w.boss, w.cfg) === "opening" && w.beat >= 4,
    },
  ),
  bossPose(
    "sinew",
    "hanging",
    "The mass over the middle column on its rope of six fibres, a handle either side, neither one held. The band is the pilot's to see and the sum the navigator's, and the sum is nothing.",
    {
      want: (w) =>
        w.boss?.kind === "sinew" &&
        !sinewHeld(w.boss, 1) &&
        !sinewHeld(w.boss, 2) &&
        !sinewSwinging(w.boss, w) &&
        w.beat >= 2,
    },
  ),
  bossPose(
    "ledger",
    "rooting",
    "The body three columns wide over the middle of the field on its violet cord, the cord just rooted in a socket in the pair's own hull, the seam down its middle whole.",
    {
      want: (w) =>
        w.boss?.kind === "ledger" &&
        ledgerPhase(w.boss, w.cfg, w.beat) === "rooting" &&
        w.beat >= 1,
    },
  ),
  bossPose(
    "surge",
    "shut",
    "The bulb over the middle column with its seam shut and no thumb on it. Five notches down the seam are its health, and the first opens only when both thumbs come off inside the band.",
    {
      want: (w) =>
        w.boss?.kind === "surge" &&
        !surgeInBand(w.boss, w.cfg) &&
        !surgeSealing(w.boss, w) &&
        w.beat >= 2,
    },
  ),
  bossPose(
    "lead",
    "pacing",
    "The body pacing along the top of the field on its stalk of five segments, a column a beat, turning at the walls. A bolt is judged a beat after it leaves, against the column the body is in then.",
    {
      want: (w) =>
        w.boss?.kind === "lead" &&
        leadShootable(w.boss) &&
        !leadRunning(w.boss, w.cfg) &&
        w.beat >= 3,
    },
  ),
  bossPose(
    "scuttle",
    "attached",
    "The frame of twenty-one parts over the middle of the field, every part still in its socket. Every three beats one comes loose and is thrown down its own column as what it is.",
    {
      want: (w) =>
        w.boss?.kind === "scuttle" &&
        scuttleAttached(w.boss).length === w.boss.parts.length &&
        w.beat >= 1,
    },
  ),
  bossPose(
    "antiphon",
    "cycling",
    "The smooth body over the top of the field growing its first organ, which only the pilot sees, and the rail of three candidates under it, which only the navigator sees.",
    { crop: F, want: (w) => w.boss?.kind === "antiphon" && !antiphonDown(w.boss) && w.beat >= 4 },
  ),
  bossPose(
    "hive",
    "sealed",
    "The mass over the field with nine sites sown across its underside and none of them open: the four beats the pair has to look before the first breach.",
    { want: (w) => w.boss?.kind === "hive" && hiveOpenCount(w.boss) === 0 && w.beat >= 2 },
  ),
  bossPose(
    "hive",
    "open",
    "The first breach open on the clock, spilling a rock down its own column every three beats. Only the pilot sees its colour, and only a bolt of that colour up that column seals it.",
    { want: (w) => w.boss?.kind === "hive" && hiveOpenCount(w.boss) > 0, hold: TPB * 2 },
  ),
];
