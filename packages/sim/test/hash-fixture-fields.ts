import type { LanceBeam, Prime } from "../src/lance.js";
import type { ShotCharge } from "../src/shot-charge.js";
import type { Bullet, Creature, Pod, Scar } from "../src/types.js";

/**
 * **The world's own lists, one of each with something in every field**, for
 * `hash-fixture.ts` to put in the world `hash-coverage.test.ts` walks.
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

export const creature = (): Required<Creature> => ({
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
  pushRise: 2,
  pushed: true,
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

export const bullet = (): Required<Bullet> => ({
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

export const pod = (): Required<Pod> => ({
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

export const scar = (): Required<Scar> => ({
  col: 4,
  beat: 9,
  kind: "meteor",
  span: 2,
  color: "cyan",
  plate: true,
});

export const charge = (): Required<ShotCharge> => ({ left: 5, color: "red", swallowed: true });

export const prime = (): Required<Prime> => ({ tick: 19, color: "cyan", spent: false });

export const beam = (): Required<LanceBeam> => ({ col: 6, color: "red", left: 40, topMilli: 7200 });
