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
    "hunt",
    "Every ship whole. P1 sees the ships; P2 sees the squares and moves the sights.",
    {
      crop: F,
      want: (w) => w.boss?.kind === "fleet" && fleetAfloat(w.boss) === w.boss.ships.length,
    },
  ),
  bossPose(
    "cairn",
    "stacked",
    "Seven rocks piled five columns wide, and nothing fired reaches them. P1 carries a thumb across it; P2 waits.",
    { want: stood("cairn"), hold: TPB * 2 },
  ),
  bossPose(
    "well",
    "projected",
    "The field is drawn inside out round P1's ship, a clock of columns. P2 sees it as it is and says where.",
    { crop: F, role: "p1", want: stood("well"), hold: TPB * 2 },
  ),
  bossPose(
    "splice",
    "feeding",
    "A mouth over each column, a tangled straw out of each. P2 reads the numbers; P1 opens the maw under one.",
    { crop: F, want: stood("splice"), hold: TPB * 2 },
  ),
  bossPose(
    "reprise",
    "running",
    "The wave's first stretch falls in plain sight, before any of it comes down again. P1 aims; P2 fires.",
    { want: (w) => w.boss?.kind === "reprise" && !repriseEchoing(w) && w.beat >= 4 },
  ),
  bossPose(
    "gorge",
    "feeding",
    "Seven empty intakes across the top; what reaches them is swallowed. P1 pinches one full; P2 fires into it.",
    {
      want: (w) =>
        w.boss?.kind === "gorge" && gorgePhase(w.boss, w.cfg) === "feeding" && w.beat >= 2,
    },
  ),
  bossPose(
    "curtain",
    "covered",
    "The fabric hides the core in a column only P2 is told. P1 shoves the fabric off it; P2 fires when it is bare.",
    { want: (w) => w.boss?.kind === "curtain" && !curtainCoreBare(w, w.boss) && w.beat >= 2 },
  ),
  bossPose(
    "taster",
    "opening",
    "The crest grows its first blades. P1 aims at a standing blade; P2 fires the colour they have spent least.",
    {
      want: (w) =>
        w.boss?.kind === "taster" && tasterPhase(w.boss, w.cfg) === "opening" && w.beat >= 4,
    },
  ),
  bossPose(
    "sinew",
    "hanging",
    "The mass hangs on six fibres, a handle either side, neither held. P1 takes the left; P2 takes the right.",
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
    "The cord is just rooted in the pair's own hull, the seam whole. P1 aims at the seam; P2 wards the socket.",
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
    "The seam is shut and no thumb is on the bulb. P1 puts one on; P2 puts one on — both come off in the band.",
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
    "The body paces a column a beat along the top. P1 aims where it will be; P2 fires on that beat.",
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
    "Every part still in its socket, one thrown down a column every three beats. P1 aims at a part; P2 fires.",
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
    "The first organ grows, which only P1 sees, over a rail of three only P2 sees. P1 turns it; P2 names it.",
    { crop: F, want: (w) => w.boss?.kind === "antiphon" && !antiphonDown(w.boss) && w.beat >= 4 },
  ),
  bossPose(
    "hive",
    "sealed",
    "Nine sites sown and none open: four beats to look. P1 reads the underside; P2 reads it with him.",
    { want: (w) => w.boss?.kind === "hive" && hiveOpenCount(w.boss) === 0 && w.beat >= 2 },
  ),
  bossPose(
    "hive",
    "open",
    "The first breach spills a rock every three beats. P1 sees its colour and says it; P2 fires that colour up it.",
    { want: (w) => w.boss?.kind === "hive" && hiveOpenCount(w.boss) > 0, hold: TPB * 2 },
  ),
];
