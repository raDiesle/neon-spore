import type { SimConfig } from "@neon-spore/sim";

/**
 * Every `SimConfig` field, sorted into the card that explains it to a person
 * standing at the ship — or into `PLUMBING` for the handful that keep two
 * devices in step or keep a hit-test honest and say nothing else.
 *
 * `FIELD_GROUP` is a `Record<keyof SimConfig, GroupName>`, which is the point:
 * TypeScript requires every key of `SimConfig` to appear here, so a field
 * added to the interface and left out of this object is a compile error
 * rather than a mechanic that landed and stayed invisible. `ship.ts` reads
 * this to build the SHIP tab; `packages/sim/src/briefing.ts`'s closed list
 * over creature kinds is the same idea against a union instead of an object.
 */

// The cards themselves — their names, their order and the prose under each —
// are `ship-groups.ts` next door. Re-exported here so nothing that already
// reaches for one through this file has to move.
export {
  BOSS_GROUP,
  GROUP_NOTE,
  GROUP_ORDER,
  type GroupName,
  SHIP_GROUPS,
  WAVE_ONLY_GROUPS,
} from "./ship-groups.js";

import { BALLOON_FIELDS } from "./ship-fields-balloon.js";
import { ROUND_FIELD_GROUP } from "./ship-fields-round.js";
import type { GroupName } from "./ship-groups.js";

export const FIELD_GROUP: Record<keyof SimConfig, GroupName> = {
  cols: "THE BEAT",
  rows: "THE BEAT",
  bpm: "THE BEAT",
  tickHz: "PLUMBING — not a dial a person turns",
  inputDelayTicks: "PLUMBING — not a dial a person turns",
  guardWindowMs: "GUARD — the shared defence",
  malfunctionEveryBeats: "THE MALFUNCTION — a control that acts by itself",
  readyHoldMs: "OPENING — the introduction, the guide and the ready gate",
  intakeWindowMs: "MAW — taking a pod in",
  podFallTilesPerBeat: "POD — shot loose, then caught",
  podDriftTilesPerBeat: "POD — shot loose, then caught",
  podCrossTilesPerBeat: "POD — shot loose, then caught",
  podHomeTiles: "POD — shot loose, then caught",
  podHomeTilesPerBeat: "POD — shot loose, then caught",
  wardBeats: "POD — shot loose, then caught",
  gripSlowPermille: "GRIP — a hand on the field",
  gripPushMilli: "GRIP — a hand on the field",
  gripPushPauseBeats: "GRIP — a hand on the field",
  hullInvulnerable: "PLUMBING — not a dial a person turns",
  maxHoles: "HULL — damage and repair",
  maxScars: "HULL — damage and repair",
  waveRestBeats: "THE BEAT",
  waveFailBeats: "THE BEAT",
  scoreDestroy: "SCORE",
  scoreDeflect: "SCORE",
  scoreWave: "SCORE",
  scorePod: "SCORE",
  scoreCountdownKill: "SCORE",
  lureVanishRows: "THE LURE — a body only one of you can see through",
  lureBlastPlaces: "THE LURE — a body only one of you can see through",
  scoreThrobHit: "SCORE",
  scoreClaspBreak: "SCORE",
  // Beats, not milliseconds, and it changes nothing the simulation decides —
  // how long the broken shield goes on flying apart after the body under it
  // is already an ordinary slick or bulb (`clasp.ts`).
  claspBreakBeats: "GUARD — the shared defence",
  // THE COIL's three shapes sit with the control that answers all of it: each
  // is really beats the plate has to get somewhere (`config-coil.ts`).
  coilCols: "GUARD — the shared defence",
  coilDropRows: "GUARD — the shared defence",
  coilJumpBeats: "GUARD — the shared defence",
  scoreCoilBreak: "SCORE",
  scoreShellPiece: "SCORE",
  veilMorphBeats: "THE VEIL — a cloud only one of you can see into",
  veilArmourMs: "THE VEIL — a cloud only one of you can see into",
  scoreVeilKill: "SCORE",
  wispDwellBeats: "THE WISP — a body only one of you can see at all",
  scoreWispKill: "SCORE",
  scoreGhostKill: "SCORE",
  ghostCrossRow: "THE GHOST — a body with no column on one screen",
  ghostCrossCols: "THE GHOST — a body with no column on one screen",
  ghostChargeLaps: "THE GHOST — a body with no column on one screen",
  ghostDiveTiles: "THE GHOST — a body with no column on one screen",
  echoFallBeats: "THE ECHO — one body that becomes eight",
  echoSplits: "THE ECHO — one body that becomes eight",
  echoSplitBeats: "THE ECHO — one body that becomes eight",
  scoreEchoKill: "SCORE",
  lidTautMilli: "THE LID — an armoured eye held open by a hand",
  lidCordMilli: "THE LID — an armoured eye held open by a hand",
  scoreLidKill: "SCORE",
  scoreMagnetKill: "SCORE",
  rindLayers: "THE RIND — one body, three sizes",
  scoreRindShed: "SCORE",
  chuteRiseRows: "THE CAROM — a rock with something alive in it",
  chuteFallBeats: "THE CAROM — a rock with something alive in it",
  rockCrossCols: "A CROSSING ROCK — a route any rock can be put on",
  caromCols: "THE CAROM — a rock with something alive in it",
  caromRows: "THE CAROM — a rock with something alive in it",
  scoreCaromCrack: "SCORE",
  crystalCols: "THE CRYSTAL — two bodies in one shell, broken at the middle",
  crystalRows: "THE CRYSTAL — two bodies in one shell, broken at the middle",
  scoreCrystalSplit: "SCORE",
  crawlerSegments: "THE CRAWLER — a worm that walks the ship instead of falling",
  crawlerStepBeats: "THE CRAWLER — a worm that walks the ship instead of falling",
  scoreCrawlerBeam: "SCORE",
  strandBeads: "THE STRAND — beads on a thread, shot in order",
  strandFallBeats: "THE STRAND — beads on a thread, shot in order",
  scoreStrandBead: "SCORE",
  scoreStrandBreak: "SCORE",
  fenceGapCols: "THE FENCE — a live line with a way through it",
  veerRowsApart: "THE VEER — a rock that changes lane on the way down",
  veerMaxDist: "THE VEER — a rock that changes lane on the way down",
  volleyPlates: "THE VOLLEY — a rock you have to hit back three times",
  volleyRiseRows: "THE VOLLEY — a rock you have to hit back three times",
  volleyRiseBeats: "THE VOLLEY — a rock you have to hit back three times",
  scoreVolleyReturn: "SCORE",
  // THE CHOIR's four. How many bodies are in a membrane is deliberately not
  // among them and is not a `SimConfig` field at all: it is two, it is a fact
  // about the *picture* (`render/choir.ts`), and the simulation never asks —
  // what the pair does about this creature is the same whatever is inside it.
  choirPullMilli: "THE CHOIR — two bodies opened by shaking the phone",
  choirWindowBeats: "THE CHOIR — two bodies opened by shaking the phone",
  choirFuseBeats: "THE CHOIR — two bodies opened by shaking the phone",
  scoreChoirMerge: "SCORE",
  // THE BEATBOX's three dials and its score. The count a box gets when a wave
  // names none, how near the beat a tap has to land, and what a miscounted run
  // costs — a box's own count is authored per arrival (`WaveEntry.beats`).
  beatboxBeats: "THE BEATBOX — a soundbox counted out on the beat",
  beatboxWindowMs: "THE BEATBOX — a soundbox counted out on the beat",
  beatboxFallBeats: "THE BEATBOX — a soundbox counted out on the beat",
  scoreBeatboxSilence: "SCORE",
  // THE BALLOON's eight, next door in `ship-fields-balloon.ts` — the cut this
  // file took when that creature brought it over its 250-line limit. Spread
  // rather than named one by one: this object is a lookup and nothing reads
  // its key order, unlike `MECHANICS` next door in content.
  ...BALLOON_FIELDS,
  recoilBounces: "THE RECOIL — a shot that sends it the wrong way",
  recoilRows: "THE RECOIL — a shot that sends it the wrong way",
  scoreRecoilBounce: "SCORE",
  gyreSpinMilli: "THE GYRE — six bodies on a turning rim",
  gyreSpinGainMilli: "THE GYRE — six bodies on a turning rim",
  gyreSpinCapMilli: "THE GYRE — six bodies on a turning rim",
  gyreSuckSpinMilli: "THE GYRE — six bodies on a turning rim",
  gyreSuckMs: "THE GYRE — six bodies on a turning rim",
  gyreSinkLaps: "THE GYRE — six bodies on a turning rim",
  scoreGyreBreak: "SCORE",
  throbSpinBeats: "THROB — red one side, cyan the other, turning",
  throbFaceMilli: "THROB — red one side, cyan the other, turning",
  countdownBeats: "THE COUNT — open on zero, and only the pilot can count",
  countdownOpenBeats: "THE COUNT — open on zero, and only the pilot can count",
  radarLead: "RADAR — what is coming",
  bulletGlideMs: "AIM — colour and column",
  bandPct: "PLUMBING — not a dial a person turns",
  bandSoloPct: "PLUMBING — not a dial a person turns",
  radarHeightPx: "PLUMBING — not a dial a person turns",
  handleRadiusMilli: "GRIP — a hand on the field",
  depthNearScale: "PLUMBING — not a dial a person turns",
  depthHaze: "PLUMBING — not a dial a person turns",
  // BossConfig
  queenRow: "QUEEN",
  queenEggGrowShare: "QUEEN",
  wardenRow: "WARDEN",
  wardenCycleBeats: "WARDEN",
  wardenHangRows: "WARDEN",
  wardenTautMilli: "WARDEN",
  wardenPlates: "WARDEN",
  scoreWardenPlate: "WARDEN",
  scoreWardenDown: "WARDEN",
  mirrorRow: "MIRROR",
  scoreMirrorRound: "MIRROR",
  scoreMirrorDown: "MIRROR",
  mazeRow: "MAZE",
  mazeSpanMilli: "MAZE",
  mazeTurnMilli: "MAZE",
  mazeDragMilliPerTile: "MAZE",
  mazeDragBreakMilli: "MAZE",
  mazeSnapMilli: "MAZE",
  scoreMazeRound: "MAZE",
  scoreMazeDown: "MAZE",
  vanePins: "VANE",
  scoreVanePin: "VANE",
  scoreVaneDown: "VANE",
  scoreQueenPetal: "QUEEN",
  scoreQueenDown: "QUEEN",
  ...ROUND_FIELD_GROUP,
  // PairConfig
  briefings: "OPENING — the introduction, the guide and the ready gate",
  // ShotConfig
  bulletTilesPerBeat: "AIM — colour and column",
  lancePrimeBeats: "LANCE — a column marked, then spent",
  lanceBeamBeats: "LANCE — a column marked, then spent",
  fireEveryBeats: "AIM — colour and column",
  shotChargeBeats: "AIM — colour and column",
  colourArmourMs: "AIM — colour and column",
  hitHeightMilli: "PLUMBING — not a dial a person turns",
  // ClawConfig
  reachTilesPerBeat: "THE CLAW — the cannon replaced by an arm",
  windTilesPerTurn: "THE CLAW — the cannon replaced by an arm",
  scoreReachCatch: "SCORE",
  fleetRows: "THE FLEET — a chart only one of you can read",
  fleetRoundBeats: "THE FLEET — a chart only one of you can read",
  fleetSalvoRestBeats: "THE FLEET — a chart only one of you can read",
  scoreFleetHit: "SCORE",
  scoreFleetSunk: "SCORE",
  scoreFleetDown: "SCORE",
};

/** Every field that belongs to `group`, in the order `SimConfig` declares them. */
export function fieldsIn(group: GroupName): (keyof SimConfig)[] {
  return (Object.keys(FIELD_GROUP) as (keyof SimConfig)[]).filter((k) => FIELD_GROUP[k] === group);
}
