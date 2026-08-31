import type { BossEntry, SimConfig } from "@neon-spore/sim";

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
export type GroupName =
  | "AIM — colour and column"
  | "GUARD — the shared defence"
  | "MAW — taking a pod in"
  | "POD — shot loose, then caught"
  | "LANCE — a column marked, then spent"
  | "GRIP — a hand on the field"
  | "HULL — damage and repair"
  | "RADAR — what is coming"
  | "THE BEAT"
  | "OPENING — the introduction, the guide and the ready gate"
  | "THE GAUGE — a round with no field in it"
  | "THROB — open for one beat in every few"
  | "THE LURE — a body only one of you can see through"
  | "SCORE"
  | "WARDEN"
  | "VANE"
  | "MIRROR"
  | "MAZE"
  | "QUEEN"
  | "PLUMBING — not a dial a person turns";

/** Display order. Read top to bottom the way the old, shorter list did. */
export const GROUP_ORDER: GroupName[] = [
  "AIM — colour and column",
  "GUARD — the shared defence",
  "MAW — taking a pod in",
  "POD — shot loose, then caught",
  "LANCE — a column marked, then spent",
  "GRIP — a hand on the field",
  "HULL — damage and repair",
  "RADAR — what is coming",
  "THE BEAT",
  "OPENING — the introduction, the guide and the ready gate",
  "THE GAUGE — a round with no field in it",
  "THROB — open for one beat in every few",
  "THE LURE — a body only one of you can see through",
  "SCORE",
  "WARDEN",
  "VANE",
  "MIRROR",
  "MAZE",
  "QUEEN",
  "PLUMBING — not a dial a person turns",
];

export const GROUP_NOTE: Record<GroupName, string> = {
  MAZE:
    "A wheel of rings behind the ship, with ways in round its rim. Player 1 turns " +
    "it and clicks a way in onto a column; player 2 fires. Both screens see the " +
    "same light — the wheel is authored in packages/content/src/maze-rounds.ts.",
  "AIM — colour and column":
    "Player 2 fires the colour, player 1 holds the column. Both or nothing.",
  "GUARD — the shared defence":
    "Player 2 places the shield, player 1 triggers it. Position alone is not enough.",
  "MAW — taking a pod in": "Player 1 opens the cannon lobe inside out as the pod arrives.",
  "POD — shot loose, then caught":
    "Shot loose from a creature, it falls and drifts until the cannon catches it.",
  "LANCE — a column marked, then spent":
    "Player 1 holds the lance with the cannon still; player 2 has to not fire until it is full.",
  "GRIP — a hand on the field": "Either player holds anything falling and it falls slower.",
  "HULL — damage and repair":
    "What reaches the hull, what it costs, and what the hull earns back on its own.",
  "RADAR — what is coming":
    "The strip above the grid is how far ahead either player can talk about.",
  "THE BEAT": "The shared clock everything else in this list is measured against.",
  "OPENING — the introduction, the guide and the ready gate":
    "Off by default so a determinism run, a shape sheet and relay:check all get " +
    "the wave rather than the lesson — a headless caller has no thumbs. On, a " +
    "wave opens on its number, name and sentence, then on its guide if it " +
    "carries one, and that guide ends on two circles the pair hold until both " +
    "say READY. THE FORK used to be a second gate in the gap beside this one; " +
    "it retired into this one. See briefing.ts.",
  "THE GAUGE — a round with no field in it":
    "A boss wave with no field under it — off for the same reason as the one " +
    "above, since a headless caller has no second thumb to answer it with. On, " +
    "the gaps between acts may carry a round that is not the field: a needle " +
    "walked by drift and corrected by a valve. See gauge.ts, gauge-round.ts.",
  "THROB — open for one beat in every few": "A Throb can only be hit while it is open.",
  "THE LURE — a body only one of you can see through":
    "Player 1 sees a slick or a bulb; player 2 sees the same body inside a " +
    "white ring. A shot that lands costs the hull. Left alone it goes on its " +
    "own this many rows short of the ship, which is the only thing both " +
    "screens ever show identically.",
  SCORE: "What the run is worth, off the field's own events.",
  WARDEN: "The ring boss's own clocks, plates and worth.",
  VANE: "The arm boss's own pins and worth.",
  MIRROR: "The boss that throws a Simon sequence back, and its own worth.",
  QUEEN: "The petal boss's own row, regrowth and worth.",
  "PLUMBING — not a dial a person turns":
    "Real numbers — a lockstep buffer, a hit-test tolerance, a screen share — " +
    "but not something a person watching a wave decides by. Shown so nothing " +
    "in SimConfig is silently absent, not because it wants a slider.",
};

/**
 * The exhaustive map itself. A `Record<keyof SimConfig, GroupName>` rather
 * than a `switch` — `SimConfig` is an object shape, not a union, so there is
 * no discriminant to switch on, and this is the object-shaped equivalent of
 * the `assertNever` `effects-spark.ts` uses for `SimEvent`.
 */
export const FIELD_GROUP: Record<keyof SimConfig, GroupName> = {
  cols: "THE BEAT",
  rows: "THE BEAT",
  bpm: "THE BEAT",
  tickHz: "PLUMBING — not a dial a person turns",
  inputDelayTicks: "PLUMBING — not a dial a person turns",
  guardWindowMs: "GUARD — the shared defence",
  readyHoldMs: "OPENING — the introduction, the guide and the ready gate",
  intakeWindowMs: "MAW — taking a pod in",
  podFallTilesPerBeat: "POD — shot loose, then caught",
  podDriftTilesPerBeat: "POD — shot loose, then caught",
  podHomeTiles: "POD — shot loose, then caught",
  podHomeTilesPerBeat: "POD — shot loose, then caught",
  podRepair: "POD — shot loose, then caught",
  wardBeats: "POD — shot loose, then caught",
  gripSlowPermille: "GRIP — a hand on the field",
  hullRegenPerSecond: "HULL — damage and repair",
  hullInvulnerable: "PLUMBING — not a dial a person turns",
  damageCreature: "HULL — damage and repair",
  damageMeteor: "HULL — damage and repair",
  maxHoles: "HULL — damage and repair",
  maxScars: "HULL — damage and repair",
  waveRestBeats: "THE BEAT",
  scoreDestroy: "SCORE",
  scoreDeflect: "SCORE",
  scoreWave: "SCORE",
  scorePod: "SCORE",
  damageLure: "HULL — damage and repair",
  lureVanishRows: "THE LURE — a body only one of you can see through",
  scoreThrobHit: "SCORE",
  scoreClaspBreak: "SCORE",
  // Beats, not milliseconds, and it changes nothing the simulation decides —
  // how long the broken shield goes on flying apart after the body under it
  // is already an ordinary slick or bulb (`clasp.ts`).
  claspBreakBeats: "GUARD — the shared defence",
  scoreShellPiece: "SCORE",
  throbPeriodBeats: "THROB — open for one beat in every few",
  throbOpenBeats: "THROB — open for one beat in every few",
  radarLead: "RADAR — what is coming",
  bulletGlideMs: "AIM — colour and column",
  bandPct: "PLUMBING — not a dial a person turns",
  bandSoloPct: "PLUMBING — not a dial a person turns",
  radarHeightPx: "PLUMBING — not a dial a person turns",
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
  damageEcho: "MIRROR",
  scoreMirrorRound: "MIRROR",
  scoreMirrorDown: "MIRROR",
  mazeRow: "MAZE",
  damageMaze: "MAZE",
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
  // GaugeConfig
  gaugeTurnMilli: "THE GAUGE — a round with no field in it",
  gaugeDriftMilli: "THE GAUGE — a round with no field in it",
  gaugeSpanMilli: "THE GAUGE — a round with no field in it",
  gaugeMarks: "THE GAUGE — a round with no field in it",
  gaugeRoundBeats: "THE GAUGE — a round with no field in it",
  gaugeCallRestBeats: "THE GAUGE — a round with no field in it",
  damageGauge: "THE GAUGE — a round with no field in it",
  // PairConfig
  briefings: "OPENING — the introduction, the guide and the ready gate",
  // ShotConfig
  bulletTilesPerBeat: "AIM — colour and column",
  lancePrimeBeats: "LANCE — a column marked, then spent",
  lancePierce: "LANCE — a column marked, then spent",
  lanceTilesPerBeat: "LANCE — a column marked, then spent",
  fireEveryBeats: "AIM — colour and column",
  shotChargeBeats: "AIM — colour and column",
  hitHeightMilli: "PLUMBING — not a dial a person turns",
};

/** Every field that belongs to `group`, in the order `SimConfig` declares them. */
export function fieldsIn(group: GroupName): (keyof SimConfig)[] {
  return (Object.keys(FIELD_GROUP) as (keyof SimConfig)[]).filter((k) => FIELD_GROUP[k] === group);
}

/**
 * The boss group each `BossEntry` kind shows — a wave that carries `warden`
 * shows WARDEN, and nothing else here changes because of it. `ship.ts` reads
 * this to decide what belongs beside the wave being edited rather than beside
 * the ship, which is the split `docs/queue.md`'s SHIP-column brief asks for.
 */
export const BOSS_GROUP: Record<BossEntry["kind"], GroupName> = {
  queen: "QUEEN",
  warden: "WARDEN",
  mirror: "MIRROR",
  vane: "VANE",
  maze: "MAZE",
  gauge: "THE GAUGE — a round with no field in it",
};

/**
 * Groups that describe the wave in front of you rather than the ship — the
 * four boss groups above, plus THE GAUGE, which only matters in a gap that
 * carries one. Every other group is the same ship on every wave; `SHIP_GROUPS`
 * below is the complement, so a group added to `GROUP_ORDER` and left off this
 * set defaults to the ship sheet rather than vanishing — the "show everything"
 * escape hatch the brief asks for is this default, not a separate view.
 */
export const WAVE_ONLY_GROUPS: ReadonlySet<GroupName> = new Set([
  "WARDEN",
  "VANE",
  "MIRROR",
  "MAZE",
  "QUEEN",
  "THE GAUGE — a round with no field in it",
]);

/** The ship's own dials — the same on every wave, and one click away on the topbar. */
export const SHIP_GROUPS: GroupName[] = GROUP_ORDER.filter((g) => !WAVE_ONLY_GROUPS.has(g));
