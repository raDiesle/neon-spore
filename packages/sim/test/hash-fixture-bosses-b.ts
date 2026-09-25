import type { BossEntry } from "../src/boss-entries.js";
import type { BossState } from "../src/boss-union.js";

/**
 * **THE CAIRN to THE SINEW's page of `hash-fixture.ts`** — the second page,
 * the bosses from where `BOSS_KINDS`' "appended, never inserted" comment
 * stands to the one before THE LEDGER. What each is authored with and how
 * each is moved off its installed state; the reasons are on `-a.ts` and in
 * `hash-fixture.ts`, which composes the three pages.
 */

/** What each is authored with; the keys are the page's share of `BOSS_KINDS`. */
export const BOSS_ENTRIES_B = {
  cairn: { kind: "cairn", units: 5 },
  // THE WELL authors nothing and keeps nothing: the tag is the only number it
  // contributes to the fingerprint (`well.ts`).
  well: { kind: "well" },
  reprise: { kind: "reprise", beat: 12 },
  // THE SPLICE authors a beat count a round and nothing else; the straws are
  // laid from the seeded rng at install, which is exactly what makes its four
  // column arrays worth fingerprinting (`splice-hash.ts`). Two rounds, so the
  // fixture's state has a next one to advance into.
  splice: { kind: "splice", rounds: [{ beats: 16 }, { beats: 24 }] },
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
  // THE STARE authors nothing at all: the eye's whole state is its own clock
  // and the seat it rolled, both of which the fixture's world will have moved
  // by the time it is fingerprinted (`stare-hash.ts`).
  stare: { kind: "stare" },
  // THE BATON authors nothing either: the arm's length and every beat it
  // keeps are tuning (`config-baton.ts`), and what it remembers — which socket
  // the bead is in, whose turn it is — is what the fixture's world has moved
  // by the time it is fingerprinted (`baton-hash.ts`).
  baton: { kind: "baton" },
  // THE THROAT authors nothing either, and here the absence is the mechanic:
  // what it eats is the wave's own arrivals, so its difficulty is the wave's
  // and its two clocks are tuning (`config-throat.ts`).
  throat: { kind: "throat" },
  // THE UNDERTOW authors nothing either: how many pushes and how long each
  // stands are tuning (`config-undertow.ts`), and what it remembers — which
  // columns are open and how wide — is what the fixture's world has moved by
  // the time it is fingerprinted (`undertow-hash.ts`).
  undertow: { kind: "undertow" },
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
} satisfies Partial<Record<BossEntry["kind"], BossEntry>>;

/** THE CAIRN to THE SINEW's share of `patchBoss`. */
export function patchBossB(boss: BossState): void {
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
    // A thumb on each: the pinch on the intake above and the pry on a mouth
    // the fixture also names, so neither is the -1 the walk cannot flip.
    boss.pinch = 0;
    boss.mouth = 3;
    boss.pry = 3;
    boss.pryBeat = 2;
  }
  if (boss.kind === "curtain") {
    // One lobe off, one hit in, and the state moved off the one it is hung
    // in with a beat and a lifted hem under it — the walk cannot flip a zero
    // it never sees change, and `hung` is index nought of `CURTAIN_PHASES`.
    boss.lobes[0] = false;
    boss.coreHits = 1;
    boss.phase = "pinned";
    boss.phaseBeat = 3;
    boss.liftMilli = 900;
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
    boss.catchBeat = 6;
    boss.fallBeat = 4;
    boss.outBeat = 5;
  }
}
