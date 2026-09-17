import { DEFAULT_CONFIG } from "../src/config.js";
import { BOSS_KINDS, type BossEntry } from "../src/entries.js";
import type { LanceBeam, Prime } from "../src/lance.js";
import { mazeWheel } from "../src/maze-solve.js";
import type { MazeWheel } from "../src/maze-wheel.js";
import type { ShotCharge } from "../src/shot-charge.js";
import type { Bullet, Creature, Pod, Scar } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * A world with **something in every field**, for `hash-coverage.test.ts` to
 * walk.
 *
 * The four fixtures below are typed `Required<...>`, which is the whole point
 * of the file: an optional field added to `Creature`, `Bullet`, `Pod` or
 * `Scar` and not set here is a type error, so the coverage walk can never
 * quietly stop covering it. That is a gate a runtime test cannot have — a
 * field nobody populates is a field a reflective walk cannot see.
 *
 * Values are deliberately odd rather than default: the walk mutates a leaf and
 * asks whether the fingerprint noticed, and a field that was already at the
 * value the mutation picks would answer no for the wrong reason.
 */

const creature = (): Required<Creature> => ({
  id: 7,
  kind: "lure",
  col: 2,
  row: 3,
  fromRow: 2,
  fromCol: 1,
  color: "red",
  span: 2,
  wears: "bulb",
  holes: 1,
  petals: 3,
  dragMilli: 250,
  dropped: true,
  shell: 3,
  dartDir: 1,
  dartFloat: true,
  dartNext: -1,
  wispNext: 17,
  veilStruckTick: 40,
  choirFuseTick: 41,
  colourStruckTick: 38,
  ghostDir: -1,
  ghostLaps: 2,
  echoSplits: 2,
  rindLayers: 1,
  echoBeat: 5,
  gyreTurnMilli: 3400,
  gyreStep: 9,
  gyreId: 5,
  gyreSlot: 3,
  lidPullMilli: -1800,
  lidPullYMilli: 900,
  pushBeat: 4,
  recoilBounces: 2,
  caromDir: -1,
  crystalDir: -1,
  crystalLeg: 5,
  clingStuck: true,
  clingLastCol: 4,
  // THE WEIGHT: ticks both hands have been on it. Non-zero, so a fixture that
  // stopped hashing it would differ from one that did.
  weightPressTicks: 37,
  countPhase: 2,
  mineFuse: 4,
  mineSees: 1,
  moultCargo: "purge",
  chuteOpen: true,
  veerDir: -1,
  veerDist: 3,
  volleyPlates: 2,
  volleyRise: 3,
  strandId: 4,
  strandOrder: 2,
  strandSpent: true,
  strandLit: true,
  crawlerId: 6,
  crawlerOrder: 3,
  crawlerDir: -1,
  fenceGaps: 0b101,
  fenceBurns: 0b010,
  fenceCracksRed: 0b1000,
  fenceCracksCyan: 0b10000,
  coilDir: 1,
  coilLit: 3,
  rockDir: -1,
  rockRow: 4,
  beatboxWant: 3,
  beatboxHits: 2,
  beatboxBeat: 9,
  beatboxTick: 561,
  beatboxWrong: 480,
  beatboxMiss: 522,
  beatboxRan: 2,
  balloonSplits: 1,
  balloonBeat: 6,
  balloonDir: -1,
  balloonSinks: true,
  balloonRise: 2,
  balloonPullP1: -900,
  balloonPullP2: 700,
  balloonTautTick: 731,
  unseen: true,
});

const bullet = (): Required<Bullet> => ({
  id: 11,
  col: 1,
  row: 4,
  subMilli: 500,
  color: "cyan",
  lance: true,
  // THE CODEX: what the bolt is drawn as, against what it kills.
  shown: "red",
  driftMilli: -180,
  aimMilli: 420,
});

const pod = (): Required<Pod> => ({
  id: 13,
  colMilli: 1500,
  rowMilli: 2500,
  driftMilli: -30,
  loose: true,
  kind: "ward",
  // The lie, since this fixture carries every field at its non-default value.
  husk: true,
  crossMilli: 300,
});

const scar = (): Required<Scar> => ({ col: 4, beat: 9, kind: "meteor", span: 2, color: "cyan" });

const charge = (): Required<ShotCharge> => ({ left: 5, color: "red" });

const prime = (): Required<Prime> => ({ tick: 19, color: "cyan", spent: false });

const beam = (): Required<LanceBeam> => ({ col: 6, color: "red", left: 40, topMilli: 7200 });

/**
 * A wheel of the shape `installMaze` copies: two rings, two gaps in the rim,
 * a radial wall between them and one of them walled off from the middle —
 * what `mazeFault` asks of an authored one, so the fixture is a wheel the game
 * would actually deal rather than a shape that happens to walk. The routes are
 * solved from the walls, the same way content's are.
 */
const WHEEL: MazeWheel = mazeWheel(
  {
    rings: 2,
    coreMilli: 300,
    openMilli: 60,
    walls: [[], [0, 180_000], [0, 180_000]],
    openings: [[90_000], [45_000, 225_000], [45_000, 225_000]],
  },
  0,
);

/** What each boss is authored with, so `startWave` installs a real one. */
export const BOSS_ENTRIES: Record<BossEntry["kind"], BossEntry> = {
  queen: { kind: "queen", col: 3, petals: 6 },
  mirror: { kind: "mirror", rounds: [["fireRed", "guard"], ["cannonLeft"]] },
  warden: { kind: "warden", plates: 4 },
  cairn: { kind: "cairn", units: 5 },
  vane: { kind: "vane", pins: 3 },
  maze: { kind: "maze", rounds: [WHEEL] },
  gauge: { kind: "gauge" },
  // THE DIASTOLE authors nothing at all either, and for one reason more than
  // THE STARE's: its two cadences are the boss, so they are tuning rather than
  // authoring (`config-diastole.ts`). Everything it remembers is a clock the
  // fixture's world will have moved by the time it is fingerprinted.
  diastole: { kind: "diastole" },
  // THE BATON authors nothing either: the arm's length and every beat it
  // keeps are tuning (`config-baton.ts`), and what it remembers — which socket
  // the bead is in, whose turn it is — is what the fixture's world has moved
  // by the time it is fingerprinted (`baton-hash.ts`).
  baton: { kind: "baton" },
  // THE THROAT authors nothing either, and here the absence is the mechanic:
  // what it eats is the wave's own arrivals, so its difficulty is the wave's
  // and its two clocks are tuning (`config-throat.ts`).
  throat: { kind: "throat" },
  // THE ORRERY authors nothing either: three orbits and the beat they first
  // meet on are tuning, and the column is the middle of the field
  // (`config-orrery.ts`).
  orrery: { kind: "orrery" },
  // THE UNDERTOW authors nothing either: how many pushes and how long each
  // stands are tuning (`config-undertow.ts`), and what it remembers — which
  // columns are open and how wide — is what the fixture's world has moved by
  // the time it is fingerprinted (`undertow-hash.ts`).
  undertow: { kind: "undertow" },
  // THE CANDLE authors nothing: the glow's five steps are tuning
  // (`config-candle.ts`), and where it hangs and what it faces are what the
  // fixture's world has moved by the time it is fingerprinted (`candle-hash.ts`).
  candle: { kind: "candle" },
  // THE GORGE authors nothing either: the sack's width and fill are tuning
  // (`config-gorge.ts`), and what its intakes hold is what the fixture's world
  // has fired into them by the time it is fingerprinted (`gorge-hash.ts`).
  gorge: { kind: "gorge" },
  // THE CURTAIN authors nothing either: its width and its stride are tuning
  // (`config-curtain.ts`), and where its core hides, which lobes are soft and
  // how far it has been shoved are what the fixture's world has moved by the
  // time it is fingerprinted (`curtain-hash.ts`).
  curtain: { kind: "curtain" },
  // THE TASTER authors nothing either: the eleven blades are tuning
  // (`config-taster.ts`), and every edge is read off what the pair has spent
  // by the time the fixture's world is fingerprinted (`taster-hash.ts`).
  taster: { kind: "taster" },
  // THE SINEW authors nothing either: the fibres, the reach and the zone's
  // width are tuning (`config-sinew.ts`), and how deep each hand has pulled,
  // how slack it has gone and where the zone was rolled are what the
  // fixture's world has moved by the time it is fingerprinted (`sinew-hash.ts`).
  sinew: { kind: "sinew" },
  // THE STARE authors nothing at all: the eye's whole state is its own clock
  // and the seat it rolled, both of which the fixture's world will have moved
  // by the time it is fingerprinted (`stare-hash.ts`).
  stare: { kind: "stare" },
  // THE SCOUT authors the arena whole: where the little ship is put down, what
  // it has to collect and what is moving between. Two motes and one hazard is
  // the smallest arena that is still the round — something to collect twice,
  // and something that would end it — and one arena is enough, because what
  // the fingerprint has to notice is the flight rather than the list
  // (`scout-hash.ts`).
  scout: {
    kind: "scout",
    arenas: [
      {
        beats: 24,
        startColMilli: 3_500,
        startRowMilli: 7_500,
        startHeadingMilli: 0,
        motes: [
          { colMilli: 1_500, rowMilli: 2_500 },
          { colMilli: 5_500, rowMilli: 11_500 },
        ],
        hazards: [{ colMilli: 3_500, rowMilli: 2_000, vColMilli: 2_000, vRowMilli: 0 }],
      },
    ],
  },
  // THE WELL authors nothing and keeps nothing: the tag is the only number it
  // contributes to the fingerprint (`well.ts`).
  well: { kind: "well" },
  reprise: { kind: "reprise", beat: 12 },
  // THE SPLICE authors a beat count a round and nothing else; the straws are
  // laid from the seeded rng at install, which is exactly what makes its four
  // column arrays worth fingerprinting (`splice-hash.ts`). Two rounds, so the
  // fixture's state has a next one to advance into.
  splice: { kind: "splice", rounds: [{ beats: 16 }, { beats: 24 }] },
  // Two ships, one lying each way, neither touching the other and both well
  // inside a chart eleven columns by ten. `fleetFault` is what says that is a
  // fleet at all, and `fleet.test.ts` asks it of this one.
  fleet: {
    kind: "fleet",
    ships: [
      { col: 1, row: 2, len: 4, dir: "h" },
      { col: 7, row: 5, len: 3, dir: "v" },
    ],
  },
  // Two bars of a chart, one veiled each way, so both halves of the seat
  // split have something in them the fingerprint has to notice.
  pulse: {
    kind: "pulse",
    stages: [
      {
        name: "FIXTURE",
        steps: 24,
        notes: [
          { step: 0, lane: "slick" },
          { step: 3, lane: "bulb", veil: 1 },
          { step: 6, lane: "meteor", veil: 2 },
          { step: 9, lane: "pod" },
        ],
      },
    ],
  },
  pinball: {
    kind: "pinball",
    rounds: [
      {
        beats: 30,
        pieces: [
          { kind: "peg", xMilli: 3500, yMilli: 5500, wMilli: 200, hMilli: 200, target: true },
          { kind: "block", xMilli: 7500, yMilli: 8500, wMilli: 440, hMilli: 150, target: false },
        ],
      },
    ],
  },
  snake: {
    kind: "snake",
    rounds: [
      {
        beats: 30,
        stepTicks: 80,
        enemies: [{ col: 2, row: 2 }],
        points: [{ col: 6, row: 8 }],
        rocks: [{ col: 3, row: 5 }],
      },
    ],
  },
};

/** Every boss kind, so the walk covers each arm of `bossHashParts`. */
export const FIXTURE_BOSSES = BOSS_KINDS;

/**
 * A world carrying one of everything, with the named boss installed.
 *
 * The boss is patched after `startWave` rather than driven to a state by
 * playing: what is being tested is that a *field* reaches the fingerprint, and
 * a test that pressed buttons to get there would be testing the rules instead.
 */
export function populatedWorld(bossKind: BossEntry["kind"]): World {
  const world = createWorld(DEFAULT_CONFIG, 1);
  startWave(world, 2, [], [], BOSS_ENTRIES[bossKind], true);

  world.tick = 41;
  world.beat = 7;
  world.nextId = 23;
  world.cannonCol = 2;
  world.shieldCol = 5;
  world.guardTick = 30;
  world.intakeTick = 28;
  world.wardUntilTick = 33;
  world.lastFireTick = 26;
  world.gripP1 = 7;
  world.gripP2 = 3;
  world.pushP1 = { milli: 1400, cols: 1 };
  world.pushP2 = { milli: -2300, cols: -2 };
  world.prime = prime();
  world.charge = charge();
  world.beam = beam();
  // A cannon fault rather than a shield one, because it is the arm that
  // carries a second field: the walk can only mutate what is there, so the
  // union's larger member is the one that covers both. Placed on rows, and on
  // rows that are not zero, so a fixture that stopped hashing either of them
  // would be caught (`sim/fault-placed.ts`).
  world.faults = [{ kind: "cannon", color: "alternating", at: 2, beats: 6 }];
  // First, not last: a boss that stands on the field has already put its own
  // body in this list, and the walk only ever mutates element zero. Behind a
  // queen, the fixture's creature — the one carrying every optional field —
  // would never be the one looked at, and half the fields here would be
  // covered by a test that reported them covered.
  world.creatures.unshift(creature());
  world.bullets.push(bullet());
  world.pods.push(pod());
  world.scars.push(scar());
  world.guard = { tries: 4, deflected: 3, mistimed: 1 };
  world.balance = {
    podsFreed: 2,
    podsTaken: 1,
    podsLost: 1,
    colorHits: 9,
    colorMisses: 4,
    streak: 3,
    bestStreak: 5,
    wavesCleared: 2,
    husksRefused: 3,
    husksSwallowed: 1,
  };
  world.brief = {
    phase: 1,
    guide: true,
    ack: 2,
    steps: 5,
    stepP1: 2,
    stepP2: 4,
    fillP1: 5,
    fillP2: 3,
    holdP1: true,
    holdP2: false,
  };
  world.waveBeat = 6;
  world.spawned = 1;
  world.podSpawned = 1;
  world.restBeat = 12;
  world.failTick = 39;
  world.retries = 2;
  world.playTicks = 3_100;
  world.over = true;
  world.rng.state = 123_456;

  patchBoss(world);
  return world;
}

/**
 * Move every boss off the state `startWave` installs it in, so no field is
 * sitting at the value a mutation would pick. The lists a boss keeps are given
 * an entry apiece for the same reason: an empty array cannot prove its own
 * length is in the fingerprint.
 */
function patchBoss(world: World): void {
  const boss = world.boss;
  if (boss === null) return;
  if (boss.kind === "queen") {
    boss.phase = 2;
    boss.phaseBeat = 4;
    boss.tellCol = 3;
    boss.tellColor = "red";
    boss.weakSide = -1;
    boss.pickBeat = 3;
    boss.spentSide = 1;
    boss.openBeat = 8;
    boss.closeBeat = 12;
    boss.dropSide = -1;
    boss.releaseBeat = 5;
    boss.releaseSide = 1;
    boss.scratch = [1, 2];
  }
  if (boss.kind === "warden") {
    boss.tetherId = 17;
    boss.pupilCol = 4;
    boss.pupilDir = -1;
    boss.eyeSpent = true;
    boss.pulling = true;
    boss.pullOriginMilli = 400;
    boss.pullMilli = -250;
  }
  if (boss.kind === "vane") {
    boss.spentOpening = 2;
    boss.throwBeat = 5;
    boss.throwCol = 4;
  }
  if (boss.kind === "maze") {
    boss.phase = "read";
    boss.phaseBeat = 4;
    boss.angleMilli = 45_000;
    boss.turn = 1;
    boss.armed = false;
    boss.dragging = true;
    boss.dragFromMilli = 300;
    boss.lockedCol = 3;
    boss.lockedWay = 1;
    boss.way = 0;
    boss.step = 2;
    boss.tried = [1];
    boss.hullMilli = 62_000;
    boss.scars = [scar()];
    boss.verdict = -1;
    boss.verdictCol = 3;
    boss.lost = "mouth";
  }
  if (boss.kind === "gauge") {
    boss.phase = "play";
    boss.phaseBeat = 4;
    boss.openBeat = 3;
    boss.passed = true;
    boss.needleMilli = 3_400;
    boss.valve = 1;
    boss.markMilli = 5_000;
    boss.driftDir = -1;
    boss.marks = 2;
    boss.misses = 1;
    boss.calledBeat = 6;
    boss.calledMilli = 3_100;
    boss.calledGood = true;
  }
  if (boss.kind === "pinball") {
    boss.phase = "play";
    boss.phaseBeat = 4;
    boss.openBeat = 3;
    boss.passed = true;
    boss.roundBeat = 5;
    boss.shot = "flight";
    boss.angleMilli = 21_000;
    boss.angleDir = -1;
    boss.powerMilli = 640;
    boss.powerDir = -1;
    boss.ball = { xMilli: 5100, yMilli: 9200, vxMilli: -70, vyMilli: 130 };
    boss.flightBeat = 6;
    boss.drops = 1;
    boss.dropBeat = 5;
    boss.dropXMilli = 4300;
    boss.catchBeat = 4;
    boss.hitTick = 320;
    boss.hitXMilli = 5500;
    boss.hitYMilli = 3500;
    boss.hitRun = 2;
    boss.alive = boss.pieces.map((_, i) => i !== 0);
    boss.lit = [1];
  }
  if (boss.kind === "snake") {
    boss.phase = "play";
    boss.phaseBeat = 4;
    boss.openBeat = 3;
    boss.passed = true;
    boss.roundBeat = 5;
    boss.dirCol = 1;
    boss.dirRow = 0;
    boss.turn = -1;
    boss.stepTick = 33;
    boss.grow = 1;
    boss.mawTick = 29;
    boss.shotBeat = 6;
    boss.shotCol = 5;
    boss.shotRow = 2;
    boss.shotHit = true;
    boss.crashTick = 41;
    boss.bumpCol = 2;
    boss.bumpRow = 7;
    // One of each spent, so both lists can prove their own length is hashed.
    boss.struck = [0];
    boss.taken = [0];
  }
  if (boss.kind === "pulse") {
    boss.phase = "play";
    boss.phaseBeat = 4;
    boss.openBeat = 3;
    boss.passed = true;
    boss.startTick = 900;
    // Both seats, and deliberately not the same: a fingerprint that folded
    // them together would say nothing when the two devices disagreed about
    // which of the pair had just missed.
    boss.judged1 = boss.notes.map((_, i) => (i === 0 ? 1 : 0));
    boss.judged2 = boss.notes.map((_, i) => (i === 1 ? 3 : 0));
    boss.from1 = 1;
    boss.from2 = 2;
    boss.meter = 640;
    boss.combo1 = 3;
    boss.combo2 = 0;
    boss.last1 = 1;
    boss.last2 = 3;
    boss.lastTick1 = 910;
    boss.lastTick2 = 935;
    boss.lastLane1 = 0;
    boss.lastLane2 = 1;
  }
  if (boss.kind === "mirror") {
    boss.round = 1;
    boss.phase = "listen";
    boss.phaseBeat = 4;
    boss.matched = 1;
    boss.shown = 2;
    boss.cannonCol = 4;
    boss.hullMilli = 71_000;
    boss.scars = [scar()];
    boss.verdict = 1;
    boss.verdictCol = 2;
  }
  if (boss.kind === "gorge") {
    // One bead held, so the intake's colour is a value and not the null an
    // empty sack starts with — the walk cannot flip a null.
    const first = boss.intakes[0];
    if (first !== undefined) {
      first.beads = 1;
      first.color = "red";
      first.fullBeat = 2;
    }
    boss.swallowed = 1;
  }
  if (boss.kind === "curtain") {
    // One lobe off, one hit in, and both clocks that only a tear or an end
    // set given a beat — the walk cannot flip a zero it never sees change.
    boss.lobes[0] = false;
    boss.coreHits = 1;
    boss.tornBeat = 3;
    boss.outBeat = 4;
  }
  if (boss.kind === "taster") {
    // One blade out of the crest with its edge already set, so `edge` is a
    // value and not the null a growing blade carries — the walk cannot flip a
    // null — and one of every other field of the state moved off its start.
    const first = boss.blades[0];
    if (first !== undefined) {
      first.edge = "cyan";
      first.layers = 2;
      first.growBeat = 1;
      first.setBeat = 2;
      first.shorn = false;
    }
    boss.shorn = 1;
    boss.crest = 1;
    boss.liftBeat = 3;
    boss.edgeBeat = 2;
    boss.outBeat = 4;
  }
  if (boss.kind === "sinew") {
    // Both hands on and carried, some slack, and every clock that only a
    // hold, a snap, the last fibre or the landing sets given a beat — the
    // walk cannot flip a `-1` it never sees change.
    boss.pullP1Milli = 300;
    boss.pullP2Milli = 400;
    boss.swayP1Milli = -50;
    boss.swayP2Milli = 60;
    boss.slackMilli = 20;
    boss.holdBeat = 2;
    boss.snapBeat = 3;
    boss.fallBeat = 4;
    boss.outBeat = 5;
  }
}
