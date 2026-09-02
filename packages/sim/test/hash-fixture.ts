import { DEFAULT_CONFIG } from "../src/config.js";
import { BOSS_KINDS, type BossEntry } from "../src/entries.js";
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
  throbOpen: true,
  shell: 3,
  dartDir: 1,
  dartFloat: true,
  dartNext: -1,
  veilStruckTick: 40,
  ghostDir: -1,
  ghostLaps: 2,
  echoSplits: 2,
});

const bullet = (): Required<Bullet> => ({
  id: 11,
  col: 1,
  row: 4,
  subMilli: 500,
  color: "cyan",
  lance: true,
  pierced: 2,
});

const pod = (): Required<Pod> => ({
  id: 13,
  colMilli: 1500,
  rowMilli: 2500,
  driftMilli: -30,
  loose: true,
  kind: "ward",
});

const scar = (): Required<Scar> => ({ col: 4, beat: 9, kind: "meteor", span: 2 });

const charge = (): Required<ShotCharge> => ({ left: 5, color: "red", lance: true });

/**
 * A wheel of the shape `installMaze` copies. Two ways in, one of them reaching
 * the middle — what `mazeFault` asks of an authored one, so the fixture is a
 * wheel the game would actually deal rather than a shape that happens to walk.
 */
const WHEEL: MazeWheel = {
  rings: 2,
  sectors: 4,
  startMilli: 0,
  entrances: [
    {
      sector: 0,
      route: [
        { ring: 1, sector: 0 },
        { ring: 0, sector: 0 },
      ],
    },
    { sector: 2, route: [{ ring: 1, sector: 2 }] },
  ],
};

/** What each boss is authored with, so `startWave` installs a real one. */
export const BOSS_ENTRIES: Record<BossEntry["kind"], BossEntry> = {
  queen: { kind: "queen", col: 3, petals: 6 },
  mirror: { kind: "mirror", rounds: [["fireRed", "guard"], ["cannonLeft"]] },
  warden: { kind: "warden", plates: 4 },
  vane: { kind: "vane", pins: 3 },
  maze: { kind: "maze", rounds: [WHEEL] },
  gauge: { kind: "gauge" },
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
  snake: { kind: "snake", rounds: [{ points: 3, beats: 30, stepTicks: 80 }] },
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
  world.primeTick = 19;
  world.charge = charge();
  // First, not last: a boss that stands on the field has already put its own
  // body in this list, and the walk only ever mutates element zero. Behind a
  // queen, the fixture's creature — the one carrying every optional field —
  // would never be the one looked at, and half the fields here would be
  // covered by a test that reported them covered.
  world.creatures.unshift(creature());
  world.bullets.push(bullet());
  world.pods.push(pod());
  world.scars.push(scar());
  world.hullMilli = 87_000;
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
  };
  world.brief = {
    phase: 1,
    guide: true,
    ack: 2,
    fillP1: 5,
    fillP2: 3,
    holdP1: true,
    holdP2: false,
  };
  world.waveBeat = 6;
  world.spawned = 1;
  world.podSpawned = 1;
  world.restBeat = 12;
  world.over = true;
  world.score = 450;
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
  if (boss.kind === "snake") {
    boss.phase = "play";
    boss.phaseBeat = 4;
    boss.openBeat = 3;
    boss.passed = true;
    boss.roundBeat = 5;
    boss.points = 2;
    boss.dirCol = 1;
    boss.dirRow = 0;
    boss.turnCol = 0;
    boss.turnRow = 1;
    boss.stepTick = 33;
    boss.grow = 1;
    boss.slowTicks = 12;
    boss.slowBeat = 5;
    boss.flipBeat = 6;
    boss.pelletCol = 7;
    boss.pelletRow = 2;
    boss.orbCol = 1;
    boss.orbRow = 9;
    boss.orbBeat = 4;
    boss.crashes = 1;
    boss.crashBeat = 5;
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
}
